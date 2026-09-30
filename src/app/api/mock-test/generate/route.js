import { NextResponse } from 'next/server';
import { generateMockTestSession } from '@/lib/services/mockTestService';
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
    const {
      testType = 'SUBJECT_TEST',
      subjectId = null,
      unitId = null,
      semesterId = null,
      paperId = null,
      mockTestId = null,
      customConfig = {}
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
