import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * Escapes a cell value for safe RFC 4180 CSV generation and CSV injection prevention.
 */
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  // Prevent formula injection in spreadsheet software
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = `'${str}`;
  }
  // Replace internal double quotes with double double-quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * GET /api/ceoadmin/users/export
 * Admin-only CSV export endpoint for user management.
 */
export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeInput(searchParams.get('search') || '').trim();
    const provider = searchParams.get('provider') || 'all';
    const status = searchParams.get('status') || 'all';
    const cityFilter = searchParams.get('city') || 'all';
    const universityFilter = searchParams.get('university') || searchParams.get('universityId') || 'all';
    const profileStatus = searchParams.get('profileStatus') || 'all';

    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search.toLowerCase() } },
        { id: { contains: search } },
        { city: { contains: search } },
      ];
    }

    if (provider !== 'all') {
      if (provider === 'google') {
        where.provider = 'google';
      } else if (provider === 'credentials' || provider === 'email') {
        where.provider = { not: 'google' };
      }
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (cityFilter && cityFilter !== 'all') {
      where.city = { equals: cityFilter };
    }

    if (universityFilter && universityFilter !== 'all') {
      where.universityId = { equals: universityFilter };
    }

    if (profileStatus === 'complete') {
      where.AND = [
        { city: { not: null } },
        { universityId: { not: null } },
      ];
    } else if (profileStatus === 'incomplete') {
      where.OR = [
        { city: null },
        { universityId: null },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        city: true,
        provider: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        university: {
          select: {
            name: true,
            code: true,
            city: true,
          },
        },
      },
    });

    // CSV Headers
    const headers = [
      'Name',
      'Email',
      'City',
      'College / University',
      'Signup Date',
      'Last Login',
      'Authentication Provider',
      'Status',
      'Role',
      'User ID',
    ];

    const rows = users.map((u) => {
      const universityDisplay = u.university
        ? `${u.university.name} (${u.university.code})`
        : u.universityId || 'Profile Incomplete';
      const cityDisplay = u.city || 'Profile Incomplete';
      const signupDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—';
      const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN') : 'Never';
      const providerDisplay = u.provider === 'google' ? 'Google' : 'Email / Password';
      const statusDisplay = u.isActive ? 'Active' : 'Inactive';

      return [
        escapeCsvCell(u.fullName || 'Student'),
        escapeCsvCell(u.email),
        escapeCsvCell(cityDisplay),
        escapeCsvCell(universityDisplay),
        escapeCsvCell(signupDate),
        escapeCsvCell(lastLogin),
        escapeCsvCell(providerDisplay),
        escapeCsvCell(statusDisplay),
        escapeCsvCell(u.role || 'STUDENT'),
        escapeCsvCell(u.id),
      ].join(',');
    });

    const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const todayStr = new Date().toISOString().split('T')[0];

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lowstudy-students-${todayStr}.csv"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/users/export] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to export users' }, { status: 500 });
  }
}
