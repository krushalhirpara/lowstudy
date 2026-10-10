import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { getExamPrepQuestions } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);
    const userId = sessionUser?.userId || null;

    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId') || searchParams.get('uni');
    const courseId = searchParams.get('courseId');
    const semesterId = searchParams.get('semesterId') || searchParams.get('sem');
    const subjectId = searchParams.get('subjectId');
    const marksCategory = searchParams.get('marksCategory');
    const marks = searchParams.get('marks');
    const questionType = searchParams.get('questionType');
    const search = searchParams.get('search') || searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const result = await getExamPrepQuestions({
      userId,
      universityId,
      courseId,
      semesterId,
      subjectId,
      marksCategory,
      marks,
      questionType,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (err) {
    console.error('[API /api/exam-prep/content] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve exam prep content.' },
      { status: 500 }
    );
  }
}
