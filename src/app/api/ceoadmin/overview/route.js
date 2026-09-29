import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      totalLogins,
      todayLogins,
      activeToday,
      active7Days,
      active30Days,
      googleUsers,
      emailUsers,
      totalPageViews,
      recentUsers,
      recentLogins,
    ] = await Promise.all([
      // User counts
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.user.count({ where: { role: { not: 'ADMIN' }, createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { role: { not: 'ADMIN' }, createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { role: { not: 'ADMIN' }, createdAt: { gte: thirtyDaysAgo } } }),

      // Login metrics
      prisma.loginEvent.count({ where: { success: true } }),
      prisma.loginEvent.count({ where: { success: true, createdAt: { gte: startOfToday } } }),

      // Active users
      prisma.user.count({ where: { lastActiveAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),

      // Auth providers
      prisma.user.count({ where: { provider: 'google' } }),
      prisma.user.count({ where: { provider: { not: 'google' } } }),

      // Total Page views
      prisma.pageView.count(),

      // Recent users list
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          city: true,
          universityId: true,
          provider: true,
          role: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          lastActiveAt: true,
          university: {
            select: {
              name: true,
              code: true,
              city: true,
            },
          },
        },
      }),

      // Recent login events list
      prisma.loginEvent.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          email: true,
          provider: true,
          success: true,
          createdAt: true,
          failureReason: true,
          user: {
            select: {
              fullName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cards: {
          totalUsers,
          newUsersToday,
          newUsersThisWeek,
          newUsersThisMonth,
          totalLogins,
          todayLogins,
          activeUsers: active7Days,
          activeToday,
          active30Days,
          googleUsers,
          emailUsers,
          totalPageViews,
        },
        recentUsers,
        recentLogins,
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/overview] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch overview analytics' }, { status: 500 });
  }
}
