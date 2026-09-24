import { NextResponse } from 'next/server';
import { getVerifiedCurrentSyllabus } from '@/lib/services/syllabusIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public Endpoint: GET /api/syllabus/current
 * Returns STRICTLY VERIFIED_CURRENT syllabus records.
 * Parameters:
 *  - university / uni: University ID or code (e.g. 'gu', 'su', 'vnsgu')
 *  - college: College ID (optional)
 *  - course: Course code or ID (e.g. 'llb-3yr')
 *  - semester / sem: Semester number (e.g. 1, 2, 3)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = (searchParams.get('university') || searchParams.get('uni') || 'gu').toLowerCase();
    const collegeId = searchParams.get('college') || searchParams.get('collegeId') || undefined;
    const courseId = searchParams.get('course') || 'llb-3yr';
    const semesterNumber = parseInt(searchParams.get('semester') || searchParams.get('sem') || '1', 10);

    const result = await getVerifiedCurrentSyllabus({
      universityId,
      collegeId,
      courseId,
      semesterNumber
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in /api/syllabus/current:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch verified current syllabus' },
      { status: 500 }
    );
  }
}
