import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { getUserExamPrepAccess } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);
    const userId = sessionUser?.userId || null;

    const accessData = await getUserExamPrepAccess(userId);

    return NextResponse.json({
      success: true,
      ...accessData,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/access] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to check access' },
      { status: 500 }
    );
  }
}
