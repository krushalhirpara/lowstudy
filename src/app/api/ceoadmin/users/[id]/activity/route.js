import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  const { id: userId } = params;
  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        provider: true,
        role: true,
        isActive: true,
        city: true,
        universityId: true,
        createdAt: true,
        lastLoginAt: true,
        lastActiveAt: true,
        avatar: true,
        streakDays: true,
        xp: true,
        coins: true,
        university: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const [pageViews, loginEvents, testAttempts] = await Promise.all([
      prisma.pageView.findMany({
        where: { userId },
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          path: true,
          pageTitle: true,
          deviceType: true,
          referrer: true,
          createdAt: true,
        },
      }),
      prisma.loginEvent.findMany({
        where: { userId },
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          provider: true,
          success: true,
          failureReason: true,
          createdAt: true,
          ipAddress: true,
        },
      }),
      prisma.testAttempt.findMany({
        where: { userId },
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          score: true,
          passed: true,
          duration: true,
          createdAt: true,
          mockTest: {
            select: {
              title: true,
            },
          },
        },
      }),
    ]);

    // Build unified chronological timeline
    const timeline = [];

    // 1. Account creation event
    timeline.push({
      id: `signup-${user.id}`,
      type: 'SIGNUP',
      title: 'Account Created',
      description: `Registered account via ${user.provider === 'google' ? 'Google Authentication' : 'Email & Password'}`,
      timestamp: user.createdAt,
      badge: 'Account',
    });

    // 2. Login events
    loginEvents.forEach(l => {
      timeline.push({
        id: `login-${l.id}`,
        type: 'LOGIN',
        title: l.success ? `Logged in via ${l.provider}` : `Failed login attempt (${l.provider})`,
        description: l.success ? `Session established (IP: ${l.ipAddress || 'Internal'})` : `Reason: ${l.failureReason || 'Invalid credentials'}`,
        timestamp: l.createdAt,
        success: l.success,
        badge: 'Auth',
      });
    });

    // 3. Page views
    pageViews.forEach(pv => {
      timeline.push({
        id: `pv-${pv.id}`,
        type: 'PAGE_VIEW',
        title: pv.pageTitle || `Visited ${pv.path}`,
        path: pv.path,
        description: `${pv.deviceType || 'desktop'} • ${pv.referrer ? `From: ${pv.referrer}` : 'Direct navigation'}`,
        timestamp: pv.createdAt,
        badge: 'Navigation',
      });
    });

    // 4. Test attempts
    testAttempts.forEach(ta => {
      timeline.push({
        id: `test-${ta.id}`,
        type: 'TEST_ATTEMPT',
        title: `Attempted Mock Test: ${ta.mockTest?.title || 'Practice Test'}`,
        description: `Score: ${ta.score || 0} • Status: ${ta.passed ? 'PASSED' : 'INCOMPLETE'} • Duration: ${ta.duration || 0}s`,
        timestamp: ta.createdAt,
        badge: 'Assessment',
      });
    });

    // Sort newest to oldest
    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      user,
      timeline,
      stats: {
        totalPageViews: pageViews.length,
        totalLogins: loginEvents.filter(e => e.success).length,
        totalTests: testAttempts.length,
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/users/[id]/activity] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch user activity' }, { status: 500 });
  }
}
