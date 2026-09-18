import { NextResponse } from 'next/server';
import { promoteToOfficialCatalog } from '@/lib/services/moderationService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { actorId, targetTopicId, targetSubjectId } = body;

    const result = await promoteToOfficialCatalog(id, {
      actorId,
      targetTopicId,
      targetSubjectId,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error promoting content to official catalog:', error);
    const status = error.message.includes('not found') ? 404 : 400;
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish content' },
      { status }
    );
  }
}