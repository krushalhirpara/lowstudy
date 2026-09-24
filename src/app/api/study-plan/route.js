import { NextResponse } from 'next/server';
import { getStudentStudyPlan, generateAdaptiveStudyPlan } from '@/lib/services/studyPlanService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';
    const horizon = searchParams.get('horizon') || 'SEVEN_DAY';

    const plan = await getStudentStudyPlan(userId, horizon);
    return NextResponse.json({ success: true, plan });
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
    const body = await request.json();
    const {
      userId = 'usr-student-01',
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
