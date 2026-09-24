import { NextResponse } from 'next/server';
import {
  evaluateStudentAnswer,
  savePracticeAttempt,
  getQuestionPracticeHistory
} from '@/lib/services/answerPracticeService';

export async function POST(request, { params }) {
  try {
    const questionId = params.id;
    const body = await request.json();
    const {
      userId = 'usr-student-01',
      studentAnswer = '',
      timeSpentSecs = 0,
      saveAttempt = true
    } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }

    if (!studentAnswer.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please write an answer before submitting for evaluation' },
        { status: 400 }
      );
    }

    // 1. Evaluate answer against verified model content
    const evaluationData = await evaluateStudentAnswer({
      userId,
      questionId,
      studentAnswer,
      timeSpentSecs
    });

    let savedAttempt = null;
    if (saveAttempt) {
      savedAttempt = await savePracticeAttempt({
        userId,
        questionId,
        studentAnswer,
        evaluation: evaluationData.evaluation,
        wordCount: evaluationData.evaluation.metrics.wordCount,
        timeSpentSecs
      });
    }

    return NextResponse.json({
      success: true,
      message: 'AI Practice Feedback generated successfully',
      evaluation: evaluationData.evaluation,
      question: evaluationData.question,
      studentAnswer: evaluationData.studentAnswer,
      attemptId: savedAttempt?.id || null
    });
  } catch (error) {
    console.error('Error in answer practice evaluation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const questionId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const history = await getQuestionPracticeHistory({ userId, questionId });

    return NextResponse.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching question practice history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
