import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimiter';
import { sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-feedback';
    const rateCheck = checkRateLimit(`feedback-${clientIp}`, 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Feedback submission rate limit exceeded.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { messageId, isHelpful, reportReason, query } = body;

    const feedbackItem = {
      id: `fb-${Date.now()}`,
      messageId: messageId ? sanitizeInput(String(messageId), { maxLength: 100 }) : null,
      isHelpful: !!isHelpful,
      reportReason: reportReason ? sanitizeInput(String(reportReason), { maxLength: 500 }) : null,
      query: query ? sanitizeInput(String(query), { maxLength: 500 }) : 'N/A',
      submittedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Feedback received and recorded for NyayaAI quality auditing.',
      feedback: feedbackItem,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
