import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeInput(searchParams.get('search') || '');
    const provider = searchParams.get('provider') || 'all';
    const status = searchParams.get('status') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where = {};

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search.toLowerCase() } },
        { id: { contains: search } },
      ];
    }

    // Provider filter
    if (provider !== 'all') {
      if (provider === 'google') {
        where.provider = 'google';
      } else if (provider === 'credentials' || provider === 'email') {
        where.provider = { not: 'google' };
      }
    }

    // Status filter
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where.createdAt = { gte: startOfToday };
    } else if (dateRange === '7d') {
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (dateRange === '30d') {
      where.createdAt = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          provider: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          lastActiveAt: true,
          streakDays: true,
          xp: true,
          coins: true,
          avatar: true,
          _count: {
            select: {
              pageViews: true,
              loginEvents: true,
              testAttempts: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/users] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

/**
 * PATCH /api/ceoadmin/users - Update user active status or role (Admin action)
 */
export async function PATCH(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { userId, isActive, role } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const dataToUpdate = {};
    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive;
    }
    if (role && ['STUDENT', 'ADMIN'].includes(role.toUpperCase())) {
      dataToUpdate.role = role.toUpperCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
