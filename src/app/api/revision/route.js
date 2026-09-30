import { NextResponse } from 'next/server';
import { getRevisionHubData } from '@/lib/services/revisionService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';
    const entityType = searchParams.get('entityType') || 'ALL';
    const search = searchParams.get('search') || '';

    const data = await getRevisionHubData({ userId, category, entityType, search });
    return NextResponse.json({ success: true, data }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error in /api/revision:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch revision hub data' },
      { status: 500 }
    );
  }
}
