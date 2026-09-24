import { NextResponse } from 'next/server';
import { getRevisionHubData } from '@/lib/services/revisionService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';
    const category = searchParams.get('category') || 'ALL';
    const entityType = searchParams.get('entityType') || 'ALL';
    const search = searchParams.get('search') || '';

    const data = await getRevisionHubData({ userId, category, entityType, search });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in /api/revision:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch revision hub data' },
      { status: 500 }
    );
  }
}
