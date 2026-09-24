import { NextResponse } from 'next/server';
import { getPracticeHierarchyMetadata } from '@/lib/services/mcqPracticeService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const meta = await getPracticeHierarchyMetadata();
    return NextResponse.json({ success: true, data: meta });
  } catch (error) {
    console.error('Error fetching practice meta:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch practice meta' },
      { status: 500 }
    );
  }
}
