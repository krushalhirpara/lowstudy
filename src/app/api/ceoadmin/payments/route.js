import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyAuth, sanitizeInput } from '@/lib/security.js';
import { getAdminPaymentsData, getRazorpayCredentials, EXAM_PREP_CONFIG } from '@/lib/services/examPrepService.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '25';
    const status = searchParams.get('status') || 'ALL';
    const search = sanitizeInput(searchParams.get('search') || '').trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const universityId = searchParams.get('universityId') || 'ALL';
    const semesterId = searchParams.get('semesterId') || 'ALL';

    const data = await getAdminPaymentsData({
      page,
      limit,
      status,
      search,
      startDate,
      endDate,
      universityId,
      semesterId,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/payments] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve payment records.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json();
    const { action, orderId, userId, entitlementId, reason, refundAmount } = body;
    const adminUserId = auth.user?.id || 'usr-admin-system';

    if (action === 'grant_entitlement') {
      if (!userId) {
        return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
      }

      const entitlement = await prisma.examPrepEntitlement.upsert({
        where: {
          userId_productCode: {
            userId,
            productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
          }
        },
        update: {
          status: 'ACTIVE',
          grantedAt: new Date(),
          revokedAt: null,
          revocationReason: null,
        },
        create: {
          userId,
          productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
          status: 'ACTIVE',
          grantedAt: new Date(),
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'ENTITLEMENT_GRANTED',
          entityType: 'EXAM_PREP_ENTITLEMENT',
          entityId: entitlement.id,
          details: `Manual grant: ${reason || 'Admin override'}`,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Entitlement granted successfully.',
        entitlement,
      });
    }

    if (action === 'revoke_entitlement') {
      const targetUserId = userId;
      if (!targetUserId && !entitlementId) {
        return NextResponse.json({ success: false, error: 'User ID or Entitlement ID required' }, { status: 400 });
      }

      const revokeReason = reason || 'Admin revocation';
      const entitlement = await prisma.examPrepEntitlement.updateMany({
        where: targetUserId
          ? { userId: targetUserId, productCode: EXAM_PREP_CONFIG.PRODUCT_CODE }
          : { id: entitlementId },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revocationReason: revokeReason,
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'ENTITLEMENT_REVOKED',
          entityType: 'EXAM_PREP_ENTITLEMENT',
          entityId: targetUserId || entitlementId,
          details: `Revocation: ${revokeReason}`,
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Entitlement revoked successfully.',
      });
    }

    if (action === 'refund') {
      if (!orderId) {
        return NextResponse.json({ success: false, error: 'Order ID is required for refund' }, { status: 400 });
      }

      const order = await prisma.examPrepOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      if (order.status !== 'CAPTURED') {
        return NextResponse.json({ success: false, error: 'Only captured orders can be refunded' }, { status: 400 });
      }

      const { keyId, keySecret, isConfigured } = getRazorpayCredentials();
      let razorpayRefundId = `rfnd_${Date.now().toString(36)}`;

      if (isConfigured && order.razorpayPaymentId) {
        try {
          const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
          const res = await fetch(`https://api.razorpay.com/v1/payments/${order.razorpayPaymentId}/refund`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
              notes: {
                reason: reason || 'Customer requested refund via CEO Admin',
                admin_user_id: adminUserId,
              }
            })
          });

          if (res.ok) {
            const data = await res.json();
            razorpayRefundId = data.id || razorpayRefundId;
          } else {
            const errText = await res.text();
            console.warn('[Admin Refund API] Razorpay refund warning:', errText);
          }
        } catch (apiErr) {
          console.warn('[Admin Refund API] Network warning:', apiErr?.message);
        }
      }

      const refundedAmountPaise = refundAmount ? parseInt(refundAmount, 10) : order.amount;

      await prisma.$transaction([
        prisma.examPrepOrder.update({
          where: { id: order.id },
          data: {
            status: 'REFUNDED',
            refundedAt: new Date(),
            refundAmount: refundedAmountPaise,
            razorpayRefundId,
            failureReason: reason ? `Refunded: ${reason}` : 'Refunded by administrator',
          }
        }),
        prisma.examPrepEntitlement.updateMany({
          where: { userId: order.userId, productCode: EXAM_PREP_CONFIG.PRODUCT_CODE },
          data: {
            status: 'REFUNDED',
            revokedAt: new Date(),
            revocationReason: reason ? `Refunded: ${reason}` : 'Order refunded',
          }
        }),
        prisma.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'ORDER_REFUNDED',
            entityType: 'EXAM_PREP_ORDER',
            entityId: order.id,
            details: `Refunded ₹${Math.round(refundedAmountPaise / 100)}. Reason: ${reason || 'Admin refund'}. Razorpay Refund ID: ${razorpayRefundId}`,
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        message: 'Order refunded and entitlement updated.',
        razorpayRefundId,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid admin action' }, { status: 400 });
  } catch (err) {
    console.error('[POST /api/ceoadmin/payments] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process admin action' },
      { status: 500 }
    );
  }
}
