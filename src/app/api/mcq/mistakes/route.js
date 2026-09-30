import { NextResponse } from 'next/server';
import { getMyMistakes, resolveMistake } from '@/lib/services/mcqPracticeService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const mistakesData = await getMyMistakes({ userId });
    return NextResponse.json({ success: true, data: mistakesData }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error fetching mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mistakes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mcqId, action = 'resolve' } = body;

    if (!mcqId) {
      return NextResponse.json(
        { success: false, error: 'mcqId is required' },
        { status: 400 }
      );
    }

    if (action === 'resolve') {
      const result = await resolveMistake({ userId, mcqId });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing mistake:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage mistake' },
      { status: 500 }
    );
  }
}
