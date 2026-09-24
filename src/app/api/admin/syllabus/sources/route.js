import { NextResponse } from 'next/server';
import { getSyllabusSources, createOrUpdateSyllabusSource } from '@/lib/services/syllabusIntelligenceService';
import { verifyAuth, sanitizeObject } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const active = searchParams.get('active');

    const sources = await getSyllabusSources({ universityId, active });
    return NextResponse.json({
      success: true,
      totalSources: sources.length,
      sources
    });
  } catch (error) {
    console.error('Error in GET /api/admin/syllabus/sources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabus sources' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // 1. Rate Limit Check
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`syllabus-src-${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded.' }, { status: 429 });
    }

    // 2. Auth Guard
    const auth = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    const source = await createOrUpdateSyllabusSource(body);
    return NextResponse.json({
      success: true,
      message: 'Official source registry record updated successfully.',
      source
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/syllabus/sources:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update syllabus source' },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  try {
    const auth = verifyAuth(request, ['ADMIN']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: 'Admin role required to delete source.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required.' }, { status: 400 });
    }

    await prisma.syllabusSource.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Source deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
