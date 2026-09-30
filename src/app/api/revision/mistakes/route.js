import { NextResponse } from 'next/server';
import { getMyMistakesData, reAttemptMistake } from '@/lib/services/revisionService';
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const subjectId = searchParams.get('subjectId') || null;

    const data = await getMyMistakesData({ userId, category, search, subjectId });
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error in GET /api/revision/mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mistake notebook' },
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
    const { wrongAnswerId, selectedKey } = body;

    if (!wrongAnswerId || !selectedKey) {
      return NextResponse.json(
        { success: false, error: 'wrongAnswerId and selectedKey are required.' },
        { status: 400 }
      );
    }

    const result = await reAttemptMistake({ userId, wrongAnswerId, selectedKey });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in POST /api/revision/mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate mistake re-attempt' },
      { status: 500 }
    );
  }
}
