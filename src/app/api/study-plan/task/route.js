import { NextResponse } from 'next/server';
import { updatePlanTaskAction } from '@/lib/services/studyPlanService';

export async function PATCH(request) {
  try {
    const body = await request.json();
    const {
      userId = 'usr-student-01',
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
