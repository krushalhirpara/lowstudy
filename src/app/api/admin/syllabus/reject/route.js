import { NextResponse } from 'next/server';
import { rejectSyllabusVersion } from '@/lib/services/syllabusIntelligenceService';
import { verifyAuth } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`reject-syllabus-${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const auth = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { versionId, reason } = body;

    if (!versionId) {
      return NextResponse.json({ success: false, error: 'versionId is required' }, { status: 400 });
    }

    const result = await rejectSyllabusVersion(versionId, auth.user?.id, reason);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error rejecting syllabus version:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reject syllabus version' },
      { status: 500 }
    );
  }
}
