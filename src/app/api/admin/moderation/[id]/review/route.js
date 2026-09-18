import { NextResponse } from 'next/server';
import { recordContentReview } from '@/lib/services/moderationService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { reviewerId, reviewStatus, remarks } = body;

    if (!reviewerId || !reviewStatus) {
      return NextResponse.json(
        { success: false, error: 'reviewerId and reviewStatus are required.' },
        { status: 400 }
      );
    }

    const review = await recordContentReview(id, { reviewerId, reviewStatus, remarks });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Error recording content review:', error);
    const status = error.message.includes('not found') ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record review' },
      { status }
    );
  }
}