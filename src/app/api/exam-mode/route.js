import { NextResponse } from 'next/server';
import {
  getExamModeDashboardData,
  generateExamRevisionSchedule
} from '@/lib/services/examModeService';
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

    const data = await getExamModeDashboardData(userId);

    return NextResponse.json({
      success: true,
      data
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
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
