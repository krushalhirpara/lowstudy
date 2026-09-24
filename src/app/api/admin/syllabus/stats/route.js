import { NextResponse } from 'next/server';
import { getSyllabusIntelligenceStats } from '@/lib/services/syllabusIntelligenceService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const stats = await getSyllabusIntelligenceStats();
    return NextResponse.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching admin syllabus stats:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabus intelligence stats' },
      { status: 500 }
    );
  }
}
