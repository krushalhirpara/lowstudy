import { NextResponse } from 'next/server';
import { getTopicLearningData } from '@/lib/services/topicLearningService';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const topicId = params.id;
    const { user: sessionPayload } = getSessionFromRequest(request);
    const userId = sessionPayload?.userId || null;

    const topicData = await getTopicLearningData(topicId, userId);

    if (!topicData) {
      return NextResponse.json({ error: `Topic not found: ${topicId}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      topic: topicData
    }, {
      headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    });
  } catch (error) {
    console.error('Error fetching topic learning system detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
