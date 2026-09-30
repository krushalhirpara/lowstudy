import { NextResponse } from 'next/server';
import { reportQuestionContent } from '@/lib/services/questionBankService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId || null;

    const body = await request.json();
    const { questionId, issueType, notes } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const result = await reportQuestionContent({ questionId, issueType, notes, userId });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error reporting incorrect question content:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
