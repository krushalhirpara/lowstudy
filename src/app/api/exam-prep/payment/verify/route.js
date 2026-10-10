import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { verifyAndCapturePayment } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in to verify payment.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification parameters.',
        },
        { status: 400 }
      );
    }

    const result = await verifyAndCapturePayment({
      userId: sessionUser.userId,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/payment/verify] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Payment verification failed.',
      },
      { status: 400 }
    );
  }
}
