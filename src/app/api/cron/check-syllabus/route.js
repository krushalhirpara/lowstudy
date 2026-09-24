import { NextResponse } from 'next/server';
import { checkAllSources, checkSingleSource } from '@/lib/services/syllabusIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Scheduled Cron Endpoint: /api/cron/check-syllabus
 * Protected by CRON_SECRET authorization header.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'lowstudy-cron-secret-2026';

    // Verify cron authorization header
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized cron request: Invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');

    let result;
    if (sourceId) {
      result = await checkSingleSource(sourceId);
    } else {
      result = await checkAllSources();
    }

    return NextResponse.json({
      success: true,
      message: 'Gujarat University syllabus automated monitoring job executed successfully.',
      ...result
    });
  } catch (error) {
    console.error('Error executing syllabus cron job:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error in syllabus check cron' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return GET(request);
}
