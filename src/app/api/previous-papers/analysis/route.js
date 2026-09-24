import { NextResponse } from 'next/server';
import { getPaperAnalysis } from '@/lib/services/previousPaperService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const universityId = searchParams.get('universityId') || 'su';
    const semesterId = searchParams.get('semesterId') || 'su-llb-3yr-sem3';

    if (!subjectId) {
      return NextResponse.json(
        { success: false, error: 'subjectId is required.' },
        { status: 400 }
      );
    }

    const analysis = await getPaperAnalysis({ subjectId, universityId, semesterId });
    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error in GET /api/previous-papers/analysis:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate paper analysis' },
      { status: 500 }
    );
  }
}
