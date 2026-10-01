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
    const [pageViews, loginEvents, activityEvents] = await Promise.all([
      prisma.pageView.findMany({
        take: 60,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          path: true,
          pageTitle: true,
          deviceType: true,
          referrer: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      }),
      prisma.loginEvent.findMany({
        take: 30,
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
              avatar: true,
            },
          },
        },
      }),
      prisma.activityEvent.findMany({
        take: 40,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          publicDisplayName: true,
          subjectTitle: true,
          userId: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const activity = [];

    activityEvents.forEach(act => {
      activity.push({
        id: `act-${act.id}`,
        type: act.type,
        title: act.subjectTitle ? `${act.type}: ${act.subjectTitle}` : `Student Action: ${act.type}`,
        user: act.user?.fullName || act.publicDisplayName || 'A student',
        email: act.user?.email || null,
        success: true,
        path: '/learning',
        timestamp: act.createdAt,
      });
    });

    loginEvents.forEach(l => {
      activity.push({
        id: `log-${l.id}`,
        type: 'LOGIN',
        title: l.success ? `User logged in (${l.provider})` : `Failed login attempt (${l.provider})`,
        user: l.user?.fullName || l.email,
        email: l.email,
        success: l.success,
        path: '/login',
        timestamp: l.createdAt,
      });
    });

    pageViews.forEach(pv => {
      activity.push({
        id: `pv-${pv.id}`,
        type: 'PAGE_VIEW',
        title: pv.pageTitle || `Navigated to ${pv.path}`,
        user: pv.user?.fullName || 'Anonymous / Guest',
        email: pv.user?.email || null,
        path: pv.path,
        deviceType: pv.deviceType,
        timestamp: pv.createdAt,
      });
    });

    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


    return NextResponse.json({
      success: true,
      activity: activity.slice(0, 80),
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/activity] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch live activity' }, { status: 500 });
  }
}
