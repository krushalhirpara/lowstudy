import { NextResponse } from 'next/server';
import { adminOverrideQuestionPriority, recalculateQuestionPriority } from '@/lib/services/questionPriorityService';

export async function PATCH(request, { params }) {
  try {
    const questionId = params?.id;
    if (!questionId) {
      return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { priorityLabel, customWhyImportant, resetToAuto } = body;

    const updated = await adminOverrideQuestionPriority(questionId, {
      priorityLabel,
      customWhyImportant,
      resetToAuto: Boolean(resetToAuto)
    });

    return NextResponse.json({
      success: true,
      message: resetToAuto ? 'Priority reset to evidence-calculated score' : 'Priority manually updated by admin',
      question: {
        id: updated.id,
        priority_label: updated.priority_label,
        priority_score: updated.priority_score,
        why_important: updated.why_important,
        isManualPriority: updated.isManualPriority
      }
    });
  } catch (error) {
    console.error('Error updating question priority:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update question priority' },
      { status: 500 }
    );
  }
}
