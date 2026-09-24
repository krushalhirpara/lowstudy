import { NextResponse } from 'next/server';
import { checkAllSources, checkSingleSource } from '@/lib/services/syllabusIntelligenceService';
import { verifyAuth } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`sync-syllabus-${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }

    const auth = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { sourceId } = body;

    let result;
    if (sourceId) {
      result = await checkSingleSource(sourceId);
    } else {
      result = await checkAllSources();
    }

    return NextResponse.json({
      success: true,
      message: 'Syllabus source synchronization completed.',
      ...result
    });
  } catch (error) {
    console.error('Error executing manual syllabus sync:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync syllabus sources' },
      { status: 500 }
    );
  }
}
