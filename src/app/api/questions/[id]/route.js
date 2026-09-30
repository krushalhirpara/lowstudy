import { NextResponse } from 'next/server';
import { getQuestionDetail } from '@/lib/services/questionBankService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const questionId = params.id;
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId || null;

    const question = await getQuestionDetail(questionId, userId);

    if (!question) {
      return NextResponse.json({ error: `Question not found: ${questionId}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error fetching question detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
