import { NextResponse } from 'next/server';
import { getMockTestAttempt } from '@/lib/services/mockTestService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;

    const attempt = await getMockTestAttempt({ attemptId: id, userId });
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Mock test attempt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: attempt }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error fetching mock test attempt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mock test attempt' },
      { status: 500 }
    );
  }
}
