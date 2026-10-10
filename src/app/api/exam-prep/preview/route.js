import { NextResponse } from 'next/server';
import { getPublicSamplePreviews } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const subjectId = searchParams.get('subjectId');

    const samples = await getPublicSamplePreviews({
      universityId,
      subjectId,
    });

    return NextResponse.json({
      success: true,
      samples,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/preview] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve preview samples.' },
      { status: 500 }
    );
  }
}
