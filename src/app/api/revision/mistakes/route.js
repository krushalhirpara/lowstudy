import { NextResponse } from 'next/server';
import { getMyMistakesData, reAttemptMistake } from '@/lib/services/revisionService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';
    const subjectId = searchParams.get('subjectId') || null;

    const data = await getMyMistakesData({ userId, category, search, subjectId });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/revision/mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mistake notebook' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'usr-student-01', wrongAnswerId, selectedKey } = body;

    if (!wrongAnswerId || !selectedKey) {
      return NextResponse.json(
        { success: false, error: 'wrongAnswerId and selectedKey are required.' },
        { status: 400 }
      );
    }

    const result = await reAttemptMistake({ userId, wrongAnswerId, selectedKey });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in POST /api/revision/mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to evaluate mistake re-attempt' },
      { status: 500 }
    );
  }
}
