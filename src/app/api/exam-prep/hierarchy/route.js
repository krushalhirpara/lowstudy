import { NextResponse } from 'next/server';
import { getAcademicHierarchyData } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const collegeId = searchParams.get('collegeId');
    const courseId = searchParams.get('courseId');
    const semesterId = searchParams.get('semesterId');

    const result = await getAcademicHierarchyData({
      universityId,
      collegeId,
      courseId,
      semesterId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API /api/exam-prep/hierarchy] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load academic hierarchy.' },
      { status: 500 }
    );
  }
}

