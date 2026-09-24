import { NextResponse } from 'next/server';
import { getStudentContext } from '@/lib/services/aiAssistantService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const context = await getStudentContext(userId);
    return NextResponse.json({ success: true, data: context });
  } catch (error) {
    console.error('Error in GET /api/assistant/context:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch student context' },
      { status: 500 }
    );
  }
}
