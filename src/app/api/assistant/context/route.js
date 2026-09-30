import { NextResponse } from 'next/server';
import { getStudentContext } from '@/lib/services/aiAssistantService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId || null;

    const context = await getStudentContext(userId);
    return NextResponse.json({ success: true, data: context }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error in GET /api/assistant/context:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch student context' },
      { status: 500 }
    );
  }
}
