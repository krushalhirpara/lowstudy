import { NextResponse } from 'next/server';
import {
  getExamModeDashboardData,
  generateExamRevisionSchedule
} from '@/lib/services/examModeService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const data = await getExamModeDashboardData(userId);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching Exam Mode data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Exam Mode data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 'usr-student-01',
      horizon = 'SEVEN_DAY'
    } = body;

    const schedule = await generateExamRevisionSchedule({
      userId,
      horizon
    });

    return NextResponse.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error generating revision schedule in Exam Mode:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate revision schedule' },
      { status: 500 }
    );
  }
}
