import { NextResponse } from 'next/server';
import { getSyllabusHistory } from '@/lib/services/syllabusIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public Endpoint: GET /api/syllabus/history
 * Returns syllabus versions (Current, Archived) for a given university and semester.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = (searchParams.get('university') || searchParams.get('uni') || 'gu').toLowerCase();
    const semesterNumber = parseInt(searchParams.get('semester') || searchParams.get('sem') || '1', 10);

    const history = await getSyllabusHistory({
      universityId,
      semesterNumber
    });

    return NextResponse.json({
      success: true,
      universityId,
      semesterNumber,
      totalVersions: history.length,
      history
    });
  } catch (error) {
    console.error('Error in /api/syllabus/history:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabus history' },
      { status: 500 }
    );
  }
}
