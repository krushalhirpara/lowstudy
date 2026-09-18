import { NextResponse } from 'next/server';
import { transitionWorkflowStage } from '@/lib/services/moderationService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const id = params?.id;
    if (!id || typeof id !== 'string' || id.trim() === '' || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing content ID' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { targetStage, actorId, notes } = body;

    if (!targetStage) {
      return NextResponse.json(
        { success: false, error: 'targetStage is required.' },
        { status: 400 }
      );
    }

    const updated = await transitionWorkflowStage(id.trim(), {
      targetStage: String(targetStage).trim().toUpperCase(),
      actorId: actorId ? String(actorId).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error('Error transitioning workflow stage:', error?.message || error);

    if (
      error?.code === 'DATABASE_UNAVAILABLE' ||
      error?.message?.includes('DATABASE_URL') ||
      error?.name === 'PrismaClientInitializationError' ||
      error?.name === 'PrismaClientRustPanicError' ||
      error?.message?.includes('Can\'t reach database server')
    ) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 500 }
      );
    }

    const status = error.message?.includes('not found') ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Transition failed' },
      { status }
    );
  }
}