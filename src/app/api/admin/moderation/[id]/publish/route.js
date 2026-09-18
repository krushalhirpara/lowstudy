import { NextResponse } from 'next/server';
import { promoteToOfficialCatalog } from '@/lib/services/moderationService';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Validates admin / moderator authorization before performing publish action.
 */
async function verifyAdminAuthorization(request, body) {
  const adminSecret = process.env.ADMIN_SECRET || process.env.ADMIN_API_KEY;
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-admin-key');
  const roleHeader = request.headers.get('x-actor-role');

  // 1. Direct API Key / Bearer Secret check
  if (adminSecret) {
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (bearerToken === adminSecret || apiKeyHeader === adminSecret) {
      return { authorized: true };
    }
  }

  // 2. Explicit actor role verification
  const actorRole = roleHeader || body?.actorRole;
  if (actorRole) {
    const normalizedRole = actorRole.toUpperCase();
    if (!['ADMIN', 'FACULTY', 'REVIEWER', 'MODERATOR'].includes(normalizedRole)) {
      return {
        authorized: false,
        status: 403,
        error: 'Forbidden: Insufficient privileges to publish content',
      };
    }
  }

  // 3. Database user role verification when actorId is provided
  const actorId = body?.actorId || request.headers.get('x-actor-id');
  if (actorId && typeof actorId === 'string' && actorId.trim() !== '') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: actorId.trim() },
        select: { id: true, role: true, isActive: true },
      });

      if (user) {
        if (!user.isActive) {
          return {
            authorized: false,
            status: 403,
            error: 'Forbidden: Account is deactivated',
          };
        }
        if (user.role === 'STUDENT') {
          return {
            authorized: false,
            status: 403,
            error: 'Forbidden: Student accounts cannot publish moderated catalog content',
          };
        }
      }
    } catch (dbErr) {
      // Re-throw database connection failures to be handled safely by outer catch block
      if (
        dbErr?.code === 'DATABASE_UNAVAILABLE' ||
        dbErr?.message?.includes('DATABASE_URL') ||
        dbErr?.name === 'PrismaClientInitializationError'
      ) {
        throw dbErr;
      }
    }
  }

  // 4. Production requirement: require admin secret if configured
  if (process.env.NODE_ENV === 'production' && adminSecret && !authHeader && !apiKeyHeader && !body?.actorRole) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Admin authentication credentials required',
    };
  }

  return { authorized: true };
}

export async function POST(request, { params }) {
  try {
    // 1. ID Validation
    const id = params?.id;
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing content ID' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();

    // 2. Parse request payload
    const body = await request.json().catch(() => ({}));
    const { actorId, targetTopicId, targetSubjectId } = body;

    // 3. Verify Admin Authorization
    const authResult = await verifyAdminAuthorization(request, body);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: authResult.status || 403 }
      );
    }

    // 4. Execute Promotion Logic at Runtime
    const result = await promoteToOfficialCatalog(trimmedId, {
      actorId: typeof actorId === 'string' ? actorId.trim() : undefined,
      targetTopicId: typeof targetTopicId === 'string' ? targetTopicId.trim() : undefined,
      targetSubjectId: typeof targetSubjectId === 'string' ? targetSubjectId.trim() : undefined,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error('Error promoting content to official catalog:', error?.message || error);

    // Database unavailable / connection failure
    if (
      error?.code === 'DATABASE_UNAVAILABLE' ||
      error?.message?.includes('DATABASE_URL') ||
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientRustPanicError' ||
      error?.message?.includes('Can\'t reach database server')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database service is currently unavailable. Please verify database connection settings.',
        },
        { status: 500 }
      );
    }

    // Record not found
    if (error?.message?.includes('not found')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    // Authorization failure
    if (error?.message?.includes('Forbidden') || error?.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    // Validation / Workflow business logic errors
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to publish content' },
      { status: 400 }
    );
  }
}