import { NextResponse } from 'next/server';
import { promoteToOfficialCatalog } from '@/lib/services/moderationService';
import prisma from '@/lib/prisma';
import { verifyAuth, sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // 3. Rate Limit & Verify Admin Authorization
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`publish-${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Publish rate limit exceeded. Please wait.' },
        { status: 429 }
      );
    }

    const authResult = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER', 'MODERATOR']);
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