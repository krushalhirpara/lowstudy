import { NextResponse } from 'next/server';
import { getPracticeQuestions, submitPracticeSession } from '@/lib/services/mcqPracticeService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'RANDOM';
    const subjectId = searchParams.get('subjectId') || null;
    const unitId = searchParams.get('unitId') || null;
    const topicId = searchParams.get('topicId') || null;
    const count = parseInt(searchParams.get('count') || '10', 10);
    const difficulty = searchParams.get('difficulty') || null;
    const userId = searchParams.get('userId') || 'usr-student-01';
    const isExamMode = searchParams.get('isExamMode') === 'true' || mode === 'TIMED_QUIZ';

    const sessionData = await getPracticeQuestions({
      mode,
      subjectId,
      unitId,
      topicId,
      count,
      difficulty,
      userId,
      isExamMode
    });

    return NextResponse.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Error fetching practice questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch practice questions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      attemptId,
      mode = 'RANDOM',
      subjectId = null,
      unitId = null,
      topicId = null,
      answers = {},
      timeSpentSeconds = 0,
      useNegativeMarking = true,
      userId = 'usr-student-01'
    } = body;

    const result = await submitPracticeSession({
      attemptId,
      mode,
      subjectId,
      unitId,
      topicId,
      answers,
      timeSpentSeconds,
      useNegativeMarking,
      userId
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error submitting practice session:', error);
    const isDuplicate = error.message && error.message.includes('already been submitted');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit practice session',
        isDuplicate: !!isDuplicate
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
