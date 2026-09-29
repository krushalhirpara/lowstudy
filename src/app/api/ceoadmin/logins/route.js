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
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const now = new Date();
    let startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '30d') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const where = {
      createdAt: { gte: startDate },
    };

    const [
      totalAttempts,
      successfulLogins,
      failedLogins,
      googleLogins,
      emailLogins,
      adminLogins,
      recentEvents,
    ] = await Promise.all([
      prisma.loginEvent.count({ where }),
      prisma.loginEvent.count({ where: { ...where, success: true } }),
      prisma.loginEvent.count({ where: { ...where, success: false } }),
      prisma.loginEvent.count({ where: { ...where, success: true, provider: 'google' } }),
      prisma.loginEvent.count({ where: { ...where, success: true, provider: 'credentials' } }),
      prisma.loginEvent.count({ where: { ...where, success: true, provider: 'admin' } }),
      prisma.loginEvent.findMany({
        where,
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          email: true,
          provider: true,
          success: true,
          failureReason: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              role: true,
            },
          },
        },
      }),
    ]);

    const successRate = totalAttempts > 0 ? Math.round((successfulLogins / totalAttempts) * 100) : 100;

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalAttempts,
          successfulLogins,
          failedLogins,
          googleLogins,
          emailLogins,
          adminLogins,
          successRate,
        },
        recentEvents,
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/logins] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch login analytics' }, { status: 500 });
  }
}
