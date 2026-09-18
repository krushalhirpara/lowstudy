import { NextResponse } from 'next/server';
import { recordContentReview } from '@/lib/services/moderationService';

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
    const { reviewerId, reviewStatus, remarks } = body;

    if (!reviewerId || !reviewStatus) {
      return NextResponse.json(
        { success: false, error: 'reviewerId and reviewStatus are required.' },
        { status: 400 }
      );
    }

    const review = await recordContentReview(id.trim(), {
      reviewerId: String(reviewerId).trim(),
      reviewStatus: String(reviewStatus).trim().toUpperCase(),
      remarks: remarks ? String(remarks).trim() : '',
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Error recording content review:', error?.message || error);

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
      { success: false, error: error.message || 'Failed to record review' },
      { status }
    );
  }
}