import { NextResponse } from 'next/server';
import { 
  getModerationQueue, 
  createAiContentRecord 
} from '@/lib/services/moderationService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowStage = searchParams.get('stage') || undefined;
    const verificationStatus = searchParams.get('status') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const language = searchParams.get('language') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await getModerationQueue({
      workflowStage,
      verificationStatus,
      entityType,
      language,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching moderation queue:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch moderation queue' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { entityType, prompt, generatedContent, language, modelName } = body;

    if (!entityType || !prompt || !generatedContent) {
      return NextResponse.json(
        { success: false, error: 'entityType, prompt, and generatedContent are required fields.' },
        { status: 400 }
      );
    }

    const created = await createAiContentRecord({
      entityType,
      prompt,
      generatedContent,
      language,
      modelName,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI content for moderation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create AI content' },
      { status: 400 }
    );
  }
}