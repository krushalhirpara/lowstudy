import { NextResponse } from 'next/server';
import { getPreviousPapers, createPreviousPaper } from '@/lib/services/previousPaperService';
import { verifyAuth, sanitizeObject } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId') || '';
    const courseId = searchParams.get('courseId') || '';
    const semesterId = searchParams.get('semesterId') || '';
    const subjectId = searchParams.get('subjectId') || '';
    const examYear = searchParams.get('examYear') || '';
    const examSession = searchParams.get('examSession') || '';
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getPreviousPapers({
      universityId,
      courseId,
      semesterId,
      subjectId,
      examYear,
      examSession,
      status,
      search,
      page,
      limit
    });

    return NextResponse.json(
      { success: true, data: result },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/previous-papers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch previous papers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. Rate Limiting Protection (30 requests / minute)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-paper-upload';
    const rateCheck = checkRateLimit(`paper-post-${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Upload rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // 2. Admin Authorization Guard
    const auth = verifyAuth(request, ['ADMIN', 'FACULTY']);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized: Admin privileges required to upload examination papers.' },
        { status: auth.status || 401 }
      );
    }

    // 3. Parse & Sanitize Request Body
    const rawBody = await request.json();
    const body = sanitizeObject(rawBody);

    const paper = await createPreviousPaper(body);
    return NextResponse.json({ success: true, data: paper }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/previous-papers:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create previous paper' },
      { status: 400 }
    );
  }
}
