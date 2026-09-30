import { NextResponse } from 'next/server';
import { addMcqToRevision } from '@/lib/services/mcqPracticeService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

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
    const { mcqId } = body;

    if (!mcqId) {
      return NextResponse.json(
        { success: false, error: 'mcqId is required' },
        { status: 400 }
      );
    }

    const result = await addMcqToRevision({ userId, mcqId });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error adding MCQ to revision:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to revision' },
      { status: 500 }
    );
  }
}
