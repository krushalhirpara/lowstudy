import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { getSessionFromRequest } from '@/lib/security.js';
import { getRazorpayCredentials, EXAM_PREP_CONFIG } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);
    if (!sessionUser?.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to check payment status.' },
        { status: 401 }
      );
    }

    const userId = sessionUser.userId;
    const body = await request.json().catch(() => ({}));
    const { orderId, razorpayOrderId } = body;

    // Find user's order
    const order = await prisma.examPrepOrder.findFirst({
      where: {
        userId,
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        entitlements: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'No order found matching the provided parameters.' },
        { status: 404 }
      );
    }

    // If order already captured, return active
    if (order.status === 'CAPTURED') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        status: 'CAPTURED',
        isEntitled: true,
        verifiedAt: order.verifiedAt,
        redirectUrl: '/exam-prep/library',
      });
    }

    // If pending, check with Razorpay API directly
    const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

    if (isConfigured && order.razorpayOrderId) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpRes = await fetch(`https://api.razorpay.com/v1/orders/${order.razorpayOrderId}/payments`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
          },
        });

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          const items = rzpData.items || [];
          const capturedPayment = items.find(
            p => p.status === 'captured' && p.amount === EXAM_PREP_CONFIG.PRICE_PAISE && p.currency === EXAM_PREP_CONFIG.CURRENCY
          );

          if (capturedPayment) {
            const verifiedAt = new Date();

            const [updatedOrder, entitlement] = await prisma.$transaction([
              prisma.examPrepOrder.update({
                where: { id: order.id },
                data: {
                  status: 'CAPTURED',
                  razorpayPaymentId: capturedPayment.id,
                  verifiedAt,
                },
              }),
              prisma.examPrepEntitlement.upsert({
                where: {
                  userId_productCode: {
                    userId,
                    productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
                  },
                },
                update: {
                  status: 'ACTIVE',
                  orderId: order.id,
                  grantedAt: verifiedAt,
                  revokedAt: null,
                  revocationReason: null,
                },
                create: {
                  userId,
                  productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
                  orderId: order.id,
                  status: 'ACTIVE',
                  grantedAt: verifiedAt,
                },
              }),
            ]);

            return NextResponse.json({
              success: true,
              orderId: updatedOrder.id,
              status: 'CAPTURED',
              isEntitled: true,
              verifiedAt,
              message: 'Payment verified and Exam Prep Pass activated.',
              redirectUrl: '/exam-prep/library',
            });
          }
        }
      } catch (apiErr) {
        console.warn('[API /api/exam-prep/payment/status] Razorpay query warning:', apiErr?.message || apiErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
      isEntitled: false,
      message: 'Payment is still pending confirmation.',
    });
  } catch (err) {
    console.error('[API /api/exam-prep/payment/status] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to check payment status.' },
      { status: 500 }
    );
  }
}
