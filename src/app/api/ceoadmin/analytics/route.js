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
    const sortBy = searchParams.get('sortBy') || 'views'; // 'views' | 'uniqueUsers'
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    let startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let endDate = now;

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'custom' && fromParam) {
      startDate = new Date(fromParam);
      if (toParam) endDate = new Date(toParam);
    }

    const where = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Query page views in date range
    const [pageViews, recentActivity, deviceCounts] = await Promise.all([
      prisma.pageView.findMany({
        where,
        select: {
          id: true,
          path: true,
          pageTitle: true,
          userId: true,
          sessionId: true,
          deviceType: true,
          createdAt: true,
        },
      }),
      prisma.pageView.findMany({
        where,
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          path: true,
          pageTitle: true,
          deviceType: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.pageView.groupBy({
        by: ['deviceType'],
        where,
        _count: { id: true },
      }),
    ]);

    const totalViews = pageViews.length;
    const uniqueUserIds = new Set();
    const uniqueSessions = new Set();
    const pageMap = new Map();

    pageViews.forEach(pv => {
      if (pv.userId) uniqueUserIds.add(pv.userId);
      if (pv.sessionId) uniqueSessions.add(pv.sessionId);

      const pathKey = pv.path || '/';
      if (!pageMap.has(pathKey)) {
        pageMap.set(pathKey, {
          path: pathKey,
          pageTitle: pv.pageTitle || pathKey,
          views: 0,
          uniqueUserSet: new Set(),
          lastVisited: pv.createdAt,
        });
      }

      const pageStats = pageMap.get(pathKey);
      pageStats.views += 1;
      if (pv.userId) pageStats.uniqueUserSet.add(pv.userId);
      else if (pv.sessionId) pageStats.uniqueUserSet.add(pv.sessionId);

      if (new Date(pv.createdAt) > new Date(pageStats.lastVisited)) {
        pageStats.lastVisited = pv.createdAt;
        if (pv.pageTitle) pageStats.pageTitle = pv.pageTitle;
      }
    });

    const topPages = Array.from(pageMap.values()).map(p => ({
      path: p.path,
      pageTitle: p.pageTitle,
      views: p.views,
      uniqueUsers: Math.max(1, p.uniqueUserSet.size),
      lastVisited: p.lastVisited,
    }));

    // Sort top pages
    if (sortBy === 'uniqueUsers') {
      topPages.sort((a, b) => b.uniqueUsers - a.uniqueUsers || b.views - a.views);
    } else {
      topPages.sort((a, b) => b.views - a.views || b.uniqueUsers - a.uniqueUsers);
    }

    // Add rank
    const rankedTopPages = topPages.map((page, index) => ({
      rank: index + 1,
      ...page,
    }));

    // Device breakdown
    const devices = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
    };
    deviceCounts.forEach(d => {
      const type = (d.deviceType || 'desktop').toLowerCase();
      if (devices[type] !== undefined) {
        devices[type] = d._count.id;
      } else {
        devices.desktop += d._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalViews,
          uniqueUsers: uniqueUserIds.size || uniqueSessions.size,
          totalSessions: uniqueSessions.size,
          dateRange: { start: startDate, end: endDate },
        },
        topPages: rankedTopPages,
        recentActivity,
        devices,
      },
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/analytics] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
