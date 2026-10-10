import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import {
  EXAM_PREP_CONFIG,
  hasActiveExamPrepEntitlement,
  getUserExamPrepAccess,
  createExamPrepOrder,
  verifyAndCapturePayment,
  handleRazorpayWebhook,
  getExamPrepQuestions,
  getPublicSamplePreviews,
  getAdminPaymentsData,
  getExamPrepContentCoverageReport,
  getRazorpayCredentials
} from '../src/lib/services/examPrepService.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting LowStudy Exam Prep Pass Master Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test Suite 1: Product Configuration & Pricing
    // -------------------------------------------------------------
    console.log('📦 Test Suite 1: Product Definition & Pricing');
    assert(EXAM_PREP_CONFIG.PRICE_PAISE === 29900, 'Product price is exactly 29900 paise');
    assert(EXAM_PREP_CONFIG.PRICE_INR === 299, 'Product display price is ₹299 INR');
    assert(EXAM_PREP_CONFIG.CURRENCY === 'INR', 'Currency is INR');
    assert(EXAM_PREP_CONFIG.PRODUCT_CODE === 'LOWSTUDY_EXAM_PREP_PASS', 'Product code is LOWSTUDY_EXAM_PREP_PASS');
    assert(EXAM_PREP_CONFIG.BILLING_TYPE === 'one_time', 'Billing type is one-time (no recurring auto-renewals)');

    // -------------------------------------------------------------
    // Test Suite 2: Test User Provisioning
    // -------------------------------------------------------------
    console.log('\n👤 Test Suite 2: User Setup & Entitlement Verification');
    const testEmail = `test_student_${Date.now()}@lowstudy.com`;
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Aarav Patel',
        role: 'STUDENT',
        city: 'Ahmedabad',
        universityId: 'gu',
        phoneNumber: '9876543210',
      }
    });
    assert(testUser.id !== undefined, `Created test user ${testUser.id}`);

    const initialEntitled = await hasActiveExamPrepEntitlement(testUser.id);
    assert(initialEntitled === false, 'New user does not have active entitlement initially');

    // -------------------------------------------------------------
    // Test Suite 3: Order Creation
    // -------------------------------------------------------------
    console.log('\n💳 Test Suite 3: Order Creation API');
    const orderResult = await createExamPrepOrder({
      userId: testUser.id,
      userEmail: testUser.email,
      userName: testUser.fullName,
      userPhone: testUser.phoneNumber,
      notes: { testRun: true }
    });

    assert(orderResult.success === true, 'Order created successfully');
    assert(orderResult.amount === 29900, 'Server-enforced amount is 29900 paise (₹299)');
    assert(orderResult.currency === 'INR', 'Order currency is INR');
    assert(orderResult.orderId !== undefined, 'Local order ID generated');
    assert(orderResult.razorpayOrderId !== undefined, 'Razorpay order ID mapped');

    const dbOrder = await prisma.examPrepOrder.findUnique({
      where: { id: orderResult.orderId }
    });
    assert(dbOrder !== null, 'Order persisted in database');
    assert(dbOrder.status === 'PENDING', 'Initial order status is PENDING');

    // -------------------------------------------------------------
    // Test Suite 4: Signature Verification & Entitlement Activation
    // -------------------------------------------------------------
    console.log('\n🔐 Test Suite 4: Payment Verification & Entitlement Activation');
    const mockPaymentId = `pay_mock_${Date.now()}`;
    const mockSig = 'verified_test_sig';

    const verifyResult = await verifyAndCapturePayment({
      userId: testUser.id,
      orderId: dbOrder.id,
      razorpayOrderId: dbOrder.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSig,
    });

    assert(verifyResult.success === true, 'Payment verification succeeded');
    assert(verifyResult.order.status === 'CAPTURED', 'Order transitioned to CAPTURED');

    const activeEntitlement = await hasActiveExamPrepEntitlement(testUser.id);
    assert(activeEntitlement === true, 'Active entitlement granted to test user');

    const accessDetails = await getUserExamPrepAccess(testUser.id);
    assert(accessDetails.hasAccess === true, 'getUserExamPrepAccess reports hasAccess = true');
    assert(accessDetails.entitlement.status === 'ACTIVE', 'Entitlement status is ACTIVE');

    // Idempotency: Repeating verification on already-captured order
    const duplicateVerify = await verifyAndCapturePayment({
      userId: testUser.id,
      orderId: dbOrder.id,
      razorpayOrderId: dbOrder.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSig,
    });
    assert(duplicateVerify.success === true, 'Duplicate verification handled gracefully');
    assert(duplicateVerify.alreadyVerified === true, 'Duplicate marked as alreadyVerified');

    // -------------------------------------------------------------
    // Test Suite 5: Access Control on Content API
    // -------------------------------------------------------------
    console.log('\n🛡️ Test Suite 5: Server-Side Access Guard on Questions & Answers');
    // Unpaid user query
    const unpaidEmail = `unpaid_student_${Date.now()}@lowstudy.com`;
    const unpaidUser = await prisma.user.create({
      data: {
        email: unpaidEmail,
        fullName: 'Unpaid Visitor',
        role: 'STUDENT',
      }
    });

    const unpaidQuestions = await getExamPrepQuestions({
      userId: unpaidUser.id,
      limit: 5,
    });
    assert(unpaidQuestions.isEntitled === false, 'Unpaid user identified as isEntitled = false');
    assert(unpaidQuestions.questions.length > 0, 'Questions returned for teaser view');
    const firstUnpaid = unpaidQuestions.questions[0];
    assert(firstUnpaid.isLocked === true, 'Question marked isLocked = true for unpaid user');
    assert(firstUnpaid.modelAnswer.includes('[Unlock full structured model answer'), 'Model answer masked for unpaid user');
    assert(firstUnpaid.keyRevisionPoints === null, 'Revision points hidden for unpaid user');

    // Paid user query
    const paidQuestions = await getExamPrepQuestions({
      userId: testUser.id,
      limit: 5,
    });
    assert(paidQuestions.isEntitled === true, 'Paid user identified as isEntitled = true');
    const firstPaid = paidQuestions.questions[0];
    assert(firstPaid.isLocked === false, 'Question marked isLocked = false for paid user');
    assert(!firstPaid.modelAnswer.includes('[Unlock'), 'Full model answer unlocked for paid user');

    // -------------------------------------------------------------
    // Test Suite 6: Public Previews
    // -------------------------------------------------------------
    console.log('\n🌟 Test Suite 6: Public Sample Previews');
    const publicSamples = await getPublicSamplePreviews();
    assert(publicSamples.length > 0, `Returned ${publicSamples.length} genuine public sample previews`);
    assert(publicSamples[0].isPreview === true, 'Sample flagged as isPreview = true');

    // -------------------------------------------------------------
    // Test Suite 7: Webhook Idempotency
    // -------------------------------------------------------------
    console.log('\n⚡ Test Suite 7: Razorpay Webhook Processing');
    const mockWebhookEventId = `evt_test_${Date.now()}`;
    const webhookPayload = {
      id: mockWebhookEventId,
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_webhook_${Date.now()}`,
            order_id: dbOrder.razorpayOrderId,
            amount: 29900,
            currency: 'INR',
            status: 'captured',
          }
        }
      }
    };

    const webhookResult1 = await handleRazorpayWebhook({
      rawBody: JSON.stringify(webhookPayload),
      signature: '',
      eventData: webhookPayload,
    });
    assert(webhookResult1.success === true, 'Webhook event processed successfully');

    // Duplicate webhook delivery
    const webhookResult2 = await handleRazorpayWebhook({
      rawBody: JSON.stringify(webhookPayload),
      signature: '',
      eventData: webhookPayload,
    });
    assert(webhookResult2.duplicate === true, 'Duplicate webhook event rejected idempotently');

    // -------------------------------------------------------------
    // Test Suite 8: CEO Admin Payments & Financial Console
    // -------------------------------------------------------------
    console.log('\n👑 Test Suite 8: CEO Admin Payments & Governance');
    const adminData = await getAdminPaymentsData({ page: 1, limit: 10 });
    assert(adminData.kpis !== undefined, 'Admin KPIs calculated');
    assert(adminData.kpis.capturedOrders >= 1, 'Captured orders count >= 1');
    assert(adminData.kpis.netRevenueInr >= 299, 'Net revenue calculated accurately');
    assert(adminData.orders.length > 0, 'Orders list populated for admin');

    // -------------------------------------------------------------
    // Test Suite 9: Content Coverage Report
    // -------------------------------------------------------------
    console.log('\n📊 Test Suite 9: Content Coverage Matrix Report');
    const coverageReport = await getExamPrepContentCoverageReport();
    assert(coverageReport.summary.totalUniversities > 0, `Total universities in report: ${coverageReport.summary.totalUniversities}`);
    assert(coverageReport.summary.totalPublishedQuestions > 0, `Total published questions: ${coverageReport.summary.totalPublishedQuestions}`);
    assert(coverageReport.coverageMatrix.length > 0, `Coverage matrix rows: ${coverageReport.coverageMatrix.length}`);

    // Cleanup test users
    await prisma.user.deleteMany({
      where: { id: { in: [testUser.id, unpaidUser.id] } }
    });

    console.log(`\n==============================================`);
    console.log(`🎉 Master Test Suite Finished: ${passed} PASSED, ${failed} FAILED`);
    console.log(`==============================================\n`);

  } catch (err) {
    console.error('Test Suite Error:', err);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
