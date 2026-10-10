import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyAuth } from '@/lib/security.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const orders = await prisma.examPrepOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            city: true,
            universityId: true,
          }
        },
        entitlements: {
          select: { status: true, grantedAt: true, revokedAt: true }
        }
      }
    });

    const csvRows = [
      [
        'Order ID',
        'Date',
        'User Name',
        'User Email',
        'User Phone',
        'City',
        'Product',
        'Amount (INR)',
        'Currency',
        'Status',
        'Razorpay Order ID',
        'Razorpay Payment ID',
        'Receipt',
        'Entitlement Status',
        'Verified Date',
        'Refunded Date'
      ].join(',')
    ];

    for (const o of orders) {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      csvRows.push([
        escape(o.id),
        escape(o.createdAt ? new Date(o.createdAt).toISOString() : ''),
        escape(o.user?.fullName || 'N/A'),
        escape(o.user?.email || 'N/A'),
        escape(o.user?.phoneNumber || 'N/A'),
        escape(o.user?.city || 'N/A'),
        escape(o.productCode),
        escape(Math.round(o.amount / 100)),
        escape(o.currency),
        escape(o.status),
        escape(o.razorpayOrderId || ''),
        escape(o.razorpayPaymentId || ''),
        escape(o.receipt || ''),
        escape(o.entitlements[0]?.status || (o.status === 'CAPTURED' ? 'ACTIVE' : 'NONE')),
        escape(o.verifiedAt ? new Date(o.verifiedAt).toISOString() : ''),
        escape(o.refundedAt ? new Date(o.refundedAt).toISOString() : '')
      ].join(','));
    }

    const csvData = csvRows.join('\r\n');

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lowstudy_exam_prep_orders_${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      }
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/payments/export] Error:', err);
    return NextResponse.json({ error: 'Failed to export payments CSV' }, { status: 500 });
  }
}
