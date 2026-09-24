import { NextResponse } from 'next/server';
import { reportQuestionContent } from '@/lib/services/questionBankService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { questionId, issueType, notes, userId = 'usr-student-01' } = body;

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
