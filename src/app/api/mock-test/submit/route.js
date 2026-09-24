import { NextResponse } from 'next/server';
import { submitMockTestAttempt } from '@/lib/services/mockTestService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      attemptId = null,
      mockTestId = null,
      testType = 'SUBJECT_TEST',
      subjectId = null,
      unitId = null,
      answers = {},
      timeSpentSeconds = 0,
      testConfig = {},
      userId = 'usr-student-01'
    } = body;

    const result = await submitMockTestAttempt({
      attemptId,
      mockTestId,
      testType,
      subjectId,
      unitId,
      answers,
      timeSpentSeconds,
      testConfig,
      userId
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error submitting mock test attempt:', error);
    const isDuplicate = error.message && error.message.includes('already been submitted');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit mock test attempt',
        isDuplicate: Boolean(isDuplicate)
      },
      { status: isDuplicate ? 409 : 500 }
    );
  }
}
