import { NextResponse } from 'next/server';
import { getMyMistakes, resolveMistake } from '@/lib/services/mcqPracticeService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const mistakesData = await getMyMistakes({ userId });
    return NextResponse.json({ success: true, data: mistakesData });
  } catch (error) {
    console.error('Error fetching mistakes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mistakes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { mcqId, userId = 'usr-student-01', action = 'resolve' } = body;

    if (!mcqId) {
      return NextResponse.json(
        { success: false, error: 'mcqId is required' },
        { status: 400 }
      );
    }

    if (action === 'resolve') {
      const result = await resolveMistake({ userId, mcqId });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing mistake:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage mistake' },
      { status: 500 }
    );
  }
}
