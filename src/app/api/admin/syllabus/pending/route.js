import { NextResponse } from 'next/server';
import { getPendingSyllabusReviews } from '@/lib/services/syllabusIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const pending = await getPendingSyllabusReviews();
    return NextResponse.json({
      success: true,
      totalPending: pending.length,
      pending
    });
  } catch (error) {
    console.error('Error in GET /api/admin/syllabus/pending:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}
