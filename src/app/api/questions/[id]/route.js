import { NextResponse } from 'next/server';
import { getQuestionDetail } from '@/lib/services/questionBankService';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const questionId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const question = await getQuestionDetail(questionId, userId);

    if (!question) {
      return NextResponse.json({ error: `Question not found: ${questionId}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error fetching question detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
