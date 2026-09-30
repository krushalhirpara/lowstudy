import { NextResponse } from 'next/server';
import { generateRevisionSession, submitRevisionReview } from '@/lib/services/revisionService';
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
    const category = searchParams.get('category') || 'NEED_REVISION';
    const typesParam = searchParams.get('types');
    const count = parseInt(searchParams.get('count') || '10', 10);

    const types = typesParam ? typesParam.split(',').map(t => t.trim()).filter(Boolean) : [];

    const data = await generateRevisionSession({ userId, category, types, count });
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error in GET /api/revision/session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate revision session' },
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
    const { revisionItemId, isCorrect } = body;

    if (!revisionItemId || typeof isCorrect !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'revisionItemId and isCorrect boolean are required.' },
        { status: 400 }
      );
    }

    const result = await submitRevisionReview({ userId, revisionItemId, isCorrect });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in POST /api/revision/session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit revision review' },
      { status: 500 }
    );
  }
}
