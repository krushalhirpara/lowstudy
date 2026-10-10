import { NextResponse } from 'next/server';
import { handleRazorpayWebhook } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';

    let eventData = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const result = await handleRazorpayWebhook({
      rawBody,
      signature,
      eventData,
    });

    return NextResponse.json({
      status: 'ok',
      ...result,
    });
  } catch (err) {
    console.error('[API /api/webhooks/razorpay] Webhook processing error:', err);
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
