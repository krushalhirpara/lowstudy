import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { messageId, isHelpful, reportReason, userDetails, query } = body;

    const feedbackItem = {
      id: `fb-${Date.now()}`,
      messageId,
      isHelpful: !!isHelpful,
      reportReason: reportReason || null,
      query: query || 'N/A',
      submittedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Feedback received and recorded for NyayaAI quality auditing.',
      feedback: feedbackItem
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
