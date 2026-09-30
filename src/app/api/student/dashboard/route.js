import { NextResponse } from 'next/server';
import { getStudentDashboardData, updateStudyPlanTarget } from '@/lib/services/studentDashboardService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    if (!sessionPayload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your dashboard.' },
        { status: 401 }
      );
    }

    const data = await getStudentDashboardData(sessionPayload.userId);

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
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
    if (!sessionPayload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { targetId, isCompleted } = body;

    const result = await updateStudyPlanTarget({ userId: sessionPayload.userId, targetId, isCompleted });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error updating study plan target:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update study plan target' },
      { status: 500 }
    );
  }
}
