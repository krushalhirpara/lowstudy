import { NextResponse } from 'next/server';
import { addMcqToRevision } from '@/lib/services/mcqPracticeService';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mcqId, userId = 'usr-student-01' } = body;

    if (!mcqId) {
      return NextResponse.json(
        { success: false, error: 'mcqId is required' },
        { status: 400 }
      );
    }

    const result = await addMcqToRevision({ userId, mcqId });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error adding MCQ to revision:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add to revision' },
      { status: 500 }
    );
  }
}
