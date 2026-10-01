import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatActivityPayload, hashUserIdForClient } from '@/lib/activityLogger';

export const dynamic = 'force-dynamic';

function getRelativeTime(date) {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

/**
 * GET /api/activity/public
 * Returns sanitized, privacy-safe recent live social-proof activity events.
 * Strict zero-PII guarantee (no email, no phone, no UID, no full names unless opted in).
 */
export async function GET(request) {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const rawEvents = await prisma.activityEvent.findMany({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        type: true,
        publicDisplayName: true,
        subjectTitle: true,
        userId: true,
        createdAt: true,
      },
    });

    const sanitizedEvents = rawEvents.map(event => {
      const payload = formatActivityPayload(event);
      return {
        id: event.id,
        type: event.type,
        title: payload.title,
        subtitle: payload.subtitle,
        icon: payload.icon,
        userHash: event.userId ? hashUserIdForClient(event.userId) : null,
        timeAgo: getRelativeTime(event.createdAt),
        createdAt: event.createdAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: sanitizedEvents.length,
        events: sanitizedEvents,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err) {
    console.error('[GET /api/activity/public] Error:', err?.message || err);
    return NextResponse.json(
      { success: true, count: 0, events: [] },
      { status: 200 }
    );
  }
}
