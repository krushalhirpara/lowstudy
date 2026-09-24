import { NextResponse } from 'next/server';
import { getPreviousPaperById, updatePreviousPaper, deletePreviousPaper } from '@/lib/services/previousPaperService';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const paper = await getPreviousPaperById(id);

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Previous paper not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: paper });
  } catch (error) {
    console.error('Error in GET /api/previous-papers/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch paper details' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await updatePreviousPaper(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PUT /api/previous-papers/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update paper' },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await deletePreviousPaper(id);
    return NextResponse.json({ success: true, message: 'Paper deleted successfully.' });
  } catch (error) {
    console.error('Error in DELETE /api/previous-papers/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete paper' },
      { status: 400 }
    );
  }
}
