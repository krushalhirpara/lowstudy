import { NextResponse } from 'next/server';
import { toggleQuestionPracticed } from '@/lib/services/questionBankService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { questionId, userId = 'usr-student-01' } = body;

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    const result = await toggleQuestionPracticed(questionId, userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error toggling question practiced status:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
