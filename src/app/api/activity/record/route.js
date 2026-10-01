import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security';
import { recordActivityEvent, VALID_ACTIVITY_TYPES } from '@/lib/activityLogger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/activity/record
 * Record a client-triggered genuine learning activity event with server-side validation & rate-limiting.
 */
export async function POST(request) {
  try {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'anonymous';

    const { user: sessionPayload } = getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { type, subjectTitle } = body;

    if (!type || !VALID_ACTIVITY_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    const event = await recordActivityEvent({
      type,
      userId: sessionPayload?.userId || null,
      subjectTitle: subjectTitle ? String(subjectTitle).slice(0, 60) : null,
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      recorded: !!event,
    });
  } catch (err) {
    console.error('[POST /api/activity/record] Error:', err?.message || err);
    return NextResponse.json(
      { success: false, error: 'Failed to record activity' },
      { status: 500 }
    );
  }
}
