import { NextResponse } from 'next/server';
import { generateMockTestSession } from '@/lib/services/mockTestService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      testType = 'SUBJECT_TEST',
      subjectId = null,
      unitId = null,
      semesterId = null,
      paperId = null,
      mockTestId = null,
      customConfig = {},
      userId = 'usr-student-01'
    } = body;

    const session = await generateMockTestSession({
      testType,
      subjectId,
      unitId,
      semesterId,
      paperId,
      mockTestId,
      customConfig,
      userId
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error('Error generating mock test session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate mock test session' },
      { status: 500 }
    );
  }
}
