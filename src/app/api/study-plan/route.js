import { NextResponse } from 'next/server';
import { getStudentStudyPlan, generateAdaptiveStudyPlan } from '@/lib/services/studyPlanService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const horizon = searchParams.get('horizon') || 'SEVEN_DAY';

    const plan = await getStudentStudyPlan(userId, horizon);
    return NextResponse.json({ success: true, plan }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error fetching study plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch study plan' },
      { status: 500 }
    );
  }
}

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
      targetExamDate,
      dailyHours = 2.5,
      horizon = 'SEVEN_DAY'
    } = body;

    const plan = await generateAdaptiveStudyPlan({
      userId,
      targetExamDate,
      dailyHours,
      horizon
    });

    return NextResponse.json({
      success: true,
      message: 'Adaptive AI Study Plan generated successfully',
      plan
    });
  } catch (error) {
    console.error('Error generating study plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate study plan' },
      { status: 500 }
    );
  }
}
