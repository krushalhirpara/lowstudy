import { NextResponse } from 'next/server';
import { recalculateAllQuestionsPriorities } from '@/lib/services/questionPriorityService';

export async function POST() {
  try {
    const result = await recalculateAllQuestionsPriorities();
    return NextResponse.json({
      success: true,
      message: `Successfully recalculated priorities for ${result.updated} questions`,
      data: result
    });
  } catch (error) {
    console.error('Error recalculating priorities:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to recalculate priorities' },
      { status: 500 }
    );
  }
}
