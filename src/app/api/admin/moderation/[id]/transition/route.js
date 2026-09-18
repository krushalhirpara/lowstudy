import { NextResponse } from 'next/server';
import { transitionWorkflowStage } from '@/lib/services/moderationService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { targetStage, actorId, notes } = body;

    if (!targetStage) {
      return NextResponse.json(
        { success: false, error: 'targetStage is required.' },
        { status: 400 }
      );
    }

    const updated = await transitionWorkflowStage(id, { targetStage, actorId, notes });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error transitioning workflow stage:', error);
    const status = error.message.includes('not found') ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Transition failed' },
      { status }
    );
  }
}