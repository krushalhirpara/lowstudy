import { NextResponse } from 'next/server';
import { mapQuestionsToPaper, updateQuestionMapping } from '@/lib/services/previousPaperService';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: 'questions array is required.' },
        { status: 400 }
      );
    }

    const mappings = await mapQuestionsToPaper(id, questions);
    return NextResponse.json({ success: true, data: mappings }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/previous-papers/[id]/questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to map questions' },
      { status: 400 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { mappingId, ...updateData } = body;

    if (!mappingId) {
      return NextResponse.json(
        { success: false, error: 'mappingId is required.' },
        { status: 400 }
      );
    }

    const updated = await updateQuestionMapping(mappingId, updateData);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PUT /api/previous-papers/[id]/questions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update question mapping' },
      { status: 400 }
    );
  }
}
