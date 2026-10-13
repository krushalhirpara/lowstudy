import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { verifyAndCapturePayment } from '@/lib/services/examPrepService.js';
import prisma from '@/lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let userId = null;
    const { user: sessionUser } = getSessionFromRequest(request);
    if (sessionUser?.userId) {
      userId = sessionUser.userId;
    }

    const body = await request.json().catch(() => ({}));
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

    if (!userId) {
      const dbOrder = await prisma.examPrepOrder.findUnique({
        where: { id: orderId },
        select: { userId: true },
      });
      if (dbOrder?.userId) {
        userId = dbOrder.userId;
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in to verify payment.',
        },
        { status: 401 }
      );
    }

    const result = await verifyAndCapturePayment({
      userId,
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
