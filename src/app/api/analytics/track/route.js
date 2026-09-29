import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { path, pageTitle, referrer, deviceType, sessionId } = body;

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ success: false, error: 'Path is required' }, { status: 400 });
    }

    // Do not track admin internal API calls or ceoadmin internal views in student analytics if path starts with /api
    const cleanPath = sanitizeInput(path.slice(0, 300));
    if (cleanPath.startsWith('/api/')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Get current authenticated user session if present
    const { user } = getSessionFromRequest(request);
    const userId = user?.userId || null;

    const cleanTitle = pageTitle ? sanitizeInput(String(pageTitle).slice(0, 200)) : null;
    const cleanReferrer = referrer ? sanitizeInput(String(referrer).slice(0, 300)) : null;
    const cleanDevice = deviceType && ['desktop', 'mobile', 'tablet'].includes(deviceType) ? deviceType : 'desktop';
    const cleanSessionId = sessionId ? sanitizeInput(String(sessionId).slice(0, 100)) : null;

    // Record page view in background / safely
    const pageView = await prisma.pageView.create({
      data: {
        userId,
        sessionId: cleanSessionId,
        path: cleanPath,
        pageTitle: cleanTitle,
        referrer: cleanReferrer,
        deviceType: cleanDevice,
      },
    });

    // Touch user lastActiveAt if logged in
    if (userId) {
      prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, id: pageView.id });
  } catch (err) {
    console.warn('[Analytics Track] Non-fatal tracking error:', err?.message);
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}
