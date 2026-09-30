import { NextResponse } from 'next/server';
import { updatePlanTaskAction } from '@/lib/services/studyPlanService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function PATCH(request) {
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
      planId,
      taskId,
      action, // 'ACCEPT' | 'COMPLETE' | 'SKIP' | 'RESCHEDULE'
      newDate = null,
      targetDayIndex = null
    } = body;

    if (!planId || !taskId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: planId, taskId, action' },
        { status: 400 }
      );
    }

    const updatedPlan = await updatePlanTaskAction({
      userId,
      planId,
      taskId,
      action,
      newDate,
      targetDayIndex
    });

    return NextResponse.json({
      success: true,
      message: `Task ${action} action applied successfully`,
      plan: updatedPlan
    });
  } catch (error) {
    console.error('Error updating study plan task:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}
