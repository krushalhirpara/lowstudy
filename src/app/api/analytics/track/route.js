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
    let userId = user?.userId || null;

    // Verify userId actually exists in User table to avoid FK constraint violation
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!userExists) {
          userId = null;
        }
      } catch {
        userId = null;
      }
    }

    const cleanTitle = pageTitle ? sanitizeInput(String(pageTitle).slice(0, 200)) : null;
    const cleanReferrer = referrer ? sanitizeInput(String(referrer).slice(0, 300)) : null;
    const cleanDevice = deviceType && ['desktop', 'mobile', 'tablet'].includes(deviceType) ? deviceType : 'desktop';
    const cleanSessionId = sessionId ? sanitizeInput(String(sessionId).slice(0, 100)) : null;

    let pageViewId = null;

    try {
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
      pageViewId = pageView.id;
    } catch (pvErr) {
      // If failed (e.g. FK constraint or DB lock), retry inserting without userId (anonymous)
      if (userId) {
        try {
          const fallbackPv = await prisma.pageView.create({
            data: {
              userId: null,
              sessionId: cleanSessionId,
              path: cleanPath,
              pageTitle: cleanTitle,
              referrer: cleanReferrer,
              deviceType: cleanDevice,
            },
          });
          pageViewId = fallbackPv.id;
        } catch (anonErr) {
          console.warn('[Analytics Track] Fallback write error:', anonErr?.message);
        }
      } else {
        console.warn('[Analytics Track] Non-fatal DB write error:', pvErr?.message);
      }
    }

    // Touch user lastActiveAt if logged in
    if (userId) {
      prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      }).catch(() => {});
    }

    // Analytics always succeeds gracefully
    return NextResponse.json({ success: true, recorded: Boolean(pageViewId), id: pageViewId }, { status: 200 });
  } catch (err) {
    console.warn('[Analytics Track] Non-fatal tracking error:', err?.message);
    // CRITICAL: Analytics should NEVER return 500 or break client rendering / auth
    return NextResponse.json({ success: true, recorded: false, error: 'Non-fatal tracking error' }, { status: 200 });
  }
}

