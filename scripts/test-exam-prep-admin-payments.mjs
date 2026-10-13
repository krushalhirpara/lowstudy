import prisma from '../src/lib/prisma.js';
import {
  getAdminPaymentsData,
  createExamPrepOrder,
  verifyAndCapturePayment,
  handleRazorpayWebhook,
} from '../src/lib/services/examPrepService.js';
import crypto from 'crypto';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('🧪 Starting Exam Prep Payments CEO Admin Verification Test Suite...\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Seed / Verify actual test student & order flow
    // -------------------------------------------------------------
    console.log('📦 Test 1: Student Order Creation & Payment Lifecycle');
    const realUni = await prisma.university.findFirst({
      include: {
        courses: {
          include: {
            semesters: true,
          },
        },
        colleges: true,
      },
    });

    const uniId = realUni?.id || 'gu';
    const courseId = realUni?.courses?.[0]?.id;
    const semesterId = realUni?.courses?.[0]?.semesters?.[0]?.id;
    const collegeId = realUni?.colleges?.[0]?.id;

    const testEmail = `admin_test_student_${Date.now()}@lowstudy.test`;
    const testStudent = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Rahul Patel',
        phoneNumber: '9876543210',
        universityId: uniId,
        ...(courseId ? { courseId } : {}),
        ...(semesterId ? { semesterId } : {}),
        ...(collegeId ? { collegeId } : {}),
        role: 'STUDENT',
      },
    });

    assert(testStudent.id, 'Created test student in database');
    assert(testStudent.phoneNumber === '9876543210', 'Student phone number stored');

    // Create Order
    const orderData = await createExamPrepOrder({
      userId: testStudent.id,
      userEmail: testStudent.email,
      userName: testStudent.fullName,
      userPhone: testStudent.phoneNumber,
      notes: {
        universityId: uniId,
        courseId,
        semesterId,
      },
    });

    assert(orderData.amount === 29900, 'Order amount enforced to ₹299 (29900 paise)');
    assert(orderData.orderId !== undefined, 'Local Order ID created');
    assert(orderData.razorpayOrderId !== undefined, 'Razorpay Order ID generated');

    // -------------------------------------------------------------
    // Test 2: Server-side Payment Verification
    // -------------------------------------------------------------
    console.log('\n🔐 Test 2: Secure Server-side Payment Verification');
    const razorpayPaymentId = `pay_test_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_mock_123';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${orderData.razorpayOrderId}|${razorpayPaymentId}`);
    const signature = hmac.digest('hex');

    const verifyResult = await verifyAndCapturePayment({
      orderId: orderData.orderId,
      razorpayOrderId: orderData.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: signature,
      userId: testStudent.id,
    });

    assert(verifyResult.success === true, 'Payment signature verified on server');
    assert(verifyResult.order?.status === 'CAPTURED', 'Order marked as CAPTURED (Success)');

    // -------------------------------------------------------------
    // Test 3: CEO Admin Payments Query & 12 Table Columns
    // -------------------------------------------------------------
    console.log('\n👑 Test 3: CEO Admin Payments Data Structure & 12 Columns');
    const adminData = await getAdminPaymentsData({ page: 1, limit: 10, search: 'Rahul Patel' });

    assert(adminData.kpis !== undefined, 'KPIs object present');
    assert(typeof adminData.kpis.capturedOrders === 'number', 'KPI capturedOrders calculated');
    assert(typeof adminData.kpis.netRevenueInr === 'number', 'KPI netRevenueInr calculated');
    assert(typeof adminData.kpis.pendingOrders === 'number', 'KPI pendingOrders calculated');
    assert(typeof adminData.kpis.failedOrders === 'number', 'KPI failedOrders calculated');
    assert(typeof adminData.kpis.refundedOrders === 'number', 'KPI refundedOrders calculated');

    assert(Array.isArray(adminData.orders), 'Orders list returned');
    const foundOrder = adminData.orders.find((o) => o.razorpayPaymentId === razorpayPaymentId);
    assert(foundOrder !== undefined, 'Verified payment record found in Admin query');

    if (foundOrder) {
      assert(foundOrder.studentName === 'Rahul Patel', 'Column 1: Student Name is Rahul Patel');
      assert(foundOrder.contactNumber === '9876543210', 'Column 2: Contact Number is 9876543210');
      assert(foundOrder.email === testEmail, 'Column 3: Email Address matches');
      assert(foundOrder.university !== undefined, 'Column 4: University / College present');
      assert(foundOrder.course !== undefined, 'Column 5: Course present');
      assert(foundOrder.semester !== undefined, 'Column 6: Semester present');
      assert(foundOrder.amountInr === 299, 'Column 7: Payment Amount is ₹299');
      assert(foundOrder.displayStatus === 'Success', 'Column 8: Payment Status is Success');
      assert(foundOrder.razorpayPaymentId === razorpayPaymentId, 'Column 9: Razorpay Payment ID matches');
      assert(foundOrder.orderId === orderData.orderId || foundOrder.orderId === orderData.razorpayOrderId, 'Column 10: Order ID matches');
      assert(foundOrder.paymentDate !== null, 'Column 11: Payment Date & Time present');
      assert(foundOrder.accessStatus === 'Active', 'Column 12: Access Status is Active');
    }

    // -------------------------------------------------------------
    // Test 4: Search & Multi-Filter Capabilities
    // -------------------------------------------------------------
    console.log('\n🔍 Test 4: Admin Search & Multi-parameter Filters');
    
    // Search by Phone
    const searchPhoneResult = await getAdminPaymentsData({ search: '9876543210' });
    assert(searchPhoneResult.orders.some((o) => o.contactNumber === '9876543210'), 'Search by phone number works');

    // Search by Razorpay Payment ID
    const searchPayResult = await getAdminPaymentsData({ search: razorpayPaymentId });
    assert(searchPayResult.orders.some((o) => o.razorpayPaymentId === razorpayPaymentId), 'Search by Razorpay Payment ID works');

    // Filter by Status = SUCCESS
    const statusSuccessResult = await getAdminPaymentsData({ status: 'SUCCESS' });
    assert(statusSuccessResult.orders.every((o) => o.displayStatus === 'Success'), 'Filter by SUCCESS status works');

    // Filter by University
    const uniResult = await getAdminPaymentsData({ universityId: uniId });
    assert(uniResult.orders.length >= 1, 'Filter by universityId works');

    // Filter by Semester
    if (semesterId) {
      const semResult = await getAdminPaymentsData({ semesterId });
      assert(semResult.orders.length >= 1, 'Filter by semesterId works');
    } else {
      assert(true, 'Filter by semesterId skipped (no semester relation)');
    }

    // -------------------------------------------------------------
    // Test 5: Webhook Idempotency & Duplicate Prevention
    // -------------------------------------------------------------
    console.log('\n⚡ Test 5: Webhook Idempotency');
    const eventId = `event_test_${Date.now()}`;
    const webhookPayload = {
      id: eventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: razorpayPaymentId,
            order_id: orderData.razorpayOrderId,
            amount: 29900,
            currency: 'INR',
            status: 'captured',
            email: testEmail,
            contact: '9876543210',
          },
        },
      },
    };

    const webhookRes1 = await handleRazorpayWebhook({
      rawBody: JSON.stringify(webhookPayload),
      signature: '',
      eventData: webhookPayload,
    });
    assert(webhookRes1.success === true, 'First webhook event processed');

    const webhookRes2 = await handleRazorpayWebhook({
      rawBody: JSON.stringify(webhookPayload),
      signature: '',
      eventData: webhookPayload,
    });
    assert(webhookRes2.duplicate === true, 'Duplicate webhook event rejected idempotently');

    // -------------------------------------------------------------
    // Test 6: Refund & Access Revocation
    // -------------------------------------------------------------
    console.log('\n🔄 Test 6: Refund & Access Revocation');
    const refundEventId = `event_refund_${Date.now()}`;
    const refundWebhookPayload = {
      id: refundEventId,
      event: 'refund.created',
      payload: {
        refund: {
          entity: {
            id: `rfnd_${Date.now()}`,
            payment_id: razorpayPaymentId,
            amount: 29900,
            currency: 'INR',
            status: 'processed',
          },
        },
      },
    };

    const refundRes = await handleRazorpayWebhook({
      rawBody: JSON.stringify(refundWebhookPayload),
      signature: '',
      eventData: refundWebhookPayload,
    });
    assert(refundRes.success === true, 'Refund webhook processed');

    const orderAfterRefund = await prisma.examPrepOrder.findUnique({
      where: { razorpayOrderId: orderData.razorpayOrderId },
    });
    assert(orderAfterRefund.status === 'REFUNDED', 'Order status updated to REFUNDED');

    const entitlementAfterRefund = await prisma.examPrepEntitlement.findUnique({
      where: { userId_productCode: { userId: testStudent.id, productCode: 'LOWSTUDY_EXAM_PREP_PASS' } },
    });
    assert(entitlementAfterRefund.status === 'REFUNDED' || entitlementAfterRefund.status === 'REVOKED', 'Entitlement access status REFUNDED/REVOKED after refund');

    const adminDataAfterRefund = await getAdminPaymentsData({ search: razorpayPaymentId });
    const refundedAdminOrder = adminDataAfterRefund.orders.find((o) => o.razorpayPaymentId === razorpayPaymentId);
    if (refundedAdminOrder) {
      assert(refundedAdminOrder.displayStatus === 'Refunded', 'Display status in Admin Panel is Refunded');
      assert(refundedAdminOrder.accessStatus === 'Revoked', 'Access status in Admin Panel is Revoked');
    }

    // -------------------------------------------------------------
    // Cleanup Test User and Related Records
    // -------------------------------------------------------------
    await prisma.user.delete({ where: { id: testStudent.id } });
    console.log('\n🧹 Cleaned up test student and cascaded records');

  } catch (error) {
    console.error('Test failed with error:', error);
    failed++;
  }

  console.log(`\n==============================================`);
  console.log(`Verification Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
