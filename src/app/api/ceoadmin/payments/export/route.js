import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyAuth, sanitizeInput } from '@/lib/security.js';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '@/data/gujaratData.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const search = sanitizeInput(searchParams.get('search') || '').trim();
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const universityId = searchParams.get('universityId') || 'ALL';
    const semesterId = searchParams.get('semesterId') || 'ALL';

    let normalizedStatus = status;
    if (status === 'SUCCESS') normalizedStatus = 'CAPTURED';

    const where = {
      ...(normalizedStatus && normalizedStatus !== 'ALL' ? { status: normalizedStatus } : {}),
      ...(search ? {
        OR: [
          { id: { contains: search } },
          { razorpayOrderId: { contains: search } },
          { razorpayPaymentId: { contains: search } },
          { user: { email: { contains: search } } },
          { user: { fullName: { contains: search } } },
          { user: { phoneNumber: { contains: search } } },
          { notesJson: { contains: search } },
        ]
      } : {}),
      ...(universityId && universityId !== 'ALL' ? {
        OR: [
          { user: { universityId } },
          { notesJson: { contains: universityId } },
        ]
      } : {}),
      ...(semesterId && semesterId !== 'ALL' ? {
        OR: [
          { user: { semesterId } },
          { notesJson: { contains: semesterId } },
        ]
      } : {}),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`) } : {}),
        }
      } : {}),
    };

    const orders = await prisma.examPrepOrder.findMany({
      where,
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
            collegeId: true,
            courseId: true,
            semesterId: true,
            university: { select: { id: true, name: true, code: true } },
            college: { select: { id: true, name: true } },
            course: { select: { id: true, name: true, code: true } },
            semester: { select: { id: true, semesterNumber: true, title: true } },
          }
        },
        entitlements: {
          select: { status: true, grantedAt: true, revokedAt: true }
        }
      }
    });

    const csvRows = [
      [
        'Student Name',
        'Contact Number',
        'Email Address',
        'University / College',
        'Course',
        'Semester',
        'Payment Amount (INR)',
        'Payment Status',
        'Razorpay Payment ID',
        'Order ID',
        'Payment Date & Time',
        'Exam Prep Pass Access Status',
        'Local Order ID',
        'Refund Amount (INR)',
        'Refund Date'
      ].join(',')
    ];

    for (const o of orders) {
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      let orderNotes = {};
      try {
        if (o.notesJson) orderNotes = JSON.parse(o.notesJson);
      } catch {}

      const studentName = o.user?.fullName || orderNotes.fullName || orderNotes.name || 'Law Student';
      const contactNumber = o.user?.phoneNumber || orderNotes.phoneNumber || orderNotes.phone || 'N/A';
      const email = o.user?.email || orderNotes.email || 'N/A';
      
      const uniName = o.user?.university?.name 
        || (orderNotes.universityId ? (GUJARAT_UNIVERSITIES.find(u => u.id === orderNotes.universityId)?.name || orderNotes.universityId) : 'Gujarat University');
      
      const colName = o.user?.college?.name 
        || (orderNotes.collegeId ? (GUJARAT_COLLEGES.find(c => c.id === orderNotes.collegeId)?.name || orderNotes.collegeId) : '');
      
      const universityAndCollege = colName ? `${uniName} / ${colName}` : uniName;

      const courseName = o.user?.course?.name 
        || (orderNotes.courseId === 'llb-3yr' ? '3-Year LL.B.' : orderNotes.courseId ? String(orderNotes.courseId).toUpperCase() : '3-Year LL.B.');

      const semesterName = o.user?.semester?.title 
        || (orderNotes.semesterId ? `Semester ${String(orderNotes.semesterId).replace(/\D/g, '') || orderNotes.semesterId}` : 'Semester 1');

      let displayStatus = 'Pending';
      if (o.status === 'CAPTURED') displayStatus = 'Success';
      else if (o.status === 'REFUNDED') displayStatus = 'Refunded';
      else if (o.status === 'FAILED') displayStatus = 'Failed';
      else if (o.status === 'PENDING') displayStatus = 'Pending';
      else displayStatus = o.status;

      const primaryEntitlement = o.entitlements?.[0];
      let accessStatus = 'Revoked';
      if (primaryEntitlement?.status === 'ACTIVE' || (!primaryEntitlement && o.status === 'CAPTURED')) {
        accessStatus = 'Active';
      } else if (primaryEntitlement?.status === 'REFUNDED' || primaryEntitlement?.status === 'REVOKED') {
        accessStatus = 'Revoked';
      } else {
        accessStatus = o.status === 'CAPTURED' ? 'Active' : 'Revoked';
      }

      const paymentDateTime = (o.verifiedAt || o.createdAt)
        ? new Date(o.verifiedAt || o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        : 'N/A';

      csvRows.push([
        escape(studentName),
        escape(contactNumber),
        escape(email),
        escape(universityAndCollege),
        escape(courseName),
        escape(semesterName),
        escape(Math.round(o.amount / 100)),
        escape(displayStatus),
        escape(o.razorpayPaymentId || 'N/A'),
        escape(o.razorpayOrderId || o.id),
        escape(paymentDateTime),
        escape(accessStatus),
        escape(o.id),
        escape(o.refundAmount ? Math.round(o.refundAmount / 100) : ''),
        escape(o.refundedAt ? new Date(o.refundedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '')
      ].join(','));
    }

    const csvData = csvRows.join('\r\n');

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lowstudy_exam_prep_payments_${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      }
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/payments/export] Error:', err);
    return NextResponse.json({ error: 'Failed to export payments CSV' }, { status: 500 });
  }
}
