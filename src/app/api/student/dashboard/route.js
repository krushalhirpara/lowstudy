import { NextResponse } from 'next/server';
import { getStudentDashboardData, updateStudyPlanTarget } from '@/lib/services/studentDashboardService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || sessionPayload?.userId || 'usr-student-01';

    const data = await getStudentDashboardData(userId);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load student dashboard' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));
    const { userId = sessionPayload?.userId || 'usr-student-01', targetId, isCompleted } = body;

    const result = await updateStudyPlanTarget({ userId, targetId, isCompleted });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error updating study plan target:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update study plan target' },
      { status: 500 }
    );
  }
}
