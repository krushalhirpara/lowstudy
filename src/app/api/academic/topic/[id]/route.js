import { NextResponse } from 'next/server';
import { getTopicLearningData } from '@/lib/services/topicLearningService';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const topicId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const topicData = await getTopicLearningData(topicId, userId);

    if (!topicData) {
      return NextResponse.json({ error: `Topic not found: ${topicId}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      topic: topicData
    });
  } catch (error) {
    console.error('Error fetching topic learning system detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
