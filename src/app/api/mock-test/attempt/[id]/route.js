import { NextResponse } from 'next/server';
import { getMockTestAttempt } from '@/lib/services/mockTestService';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const attempt = await getMockTestAttempt({ attemptId: id, userId });
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Mock test attempt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Error fetching mock test attempt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mock test attempt' },
      { status: 500 }
    );
  }
}
