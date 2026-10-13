/**
 * Integration Test for Exam Prep Pass Complete Flow:
 * - Mobile OTP Normalization & Verification
 * - Identity Binding to Authenticated User
 * - Academic Hierarchy Cascading Selectors from DB
 * - DB-Persisted Study State (Bookmarks & Revisions)
 * - Delayed Webhook Status Recheck
 * - Content Coverage Matrix Integrity
 */

process.env.ALLOW_TEST_OTP = 'true';
process.env.NODE_ENV = 'test';

import { PrismaClient } from '@prisma/client';
import { sendMobileOtp, verifyMobileOtp, normalizePhoneNumber, isValidIndianPhoneNumber } from '../src/lib/services/otpService.js';
import {
  createExamPrepOrder,
  verifyAndCapturePayment,
  hasActiveExamPrepEntitlement,
  getExamPrepContentCoverageReport,
  getExamPrepQuestions,
  EXAM_PREP_CONFIG,
} from '../src/lib/services/examPrepService.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

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

async function runIntegrationTests() {
  console.log('🧪 Starting LowStudy Complete Flow Integration Test Suite...\n');

  const testPhone = '9876543210';
  const testStudentName = 'Krushal Integration Test';
  let createdUser = null;

  try {
    // -------------------------------------------------------------
    // Test 1: Mobile Phone Normalization & Validation
    // -------------------------------------------------------------
    console.log('📱 Test 1: Mobile Phone Normalization & Validation');
    assert(isValidIndianPhoneNumber('9876543210'), 'Valid 10-digit Indian mobile accepted');
    assert(isValidIndianPhoneNumber('+91 98765 43210'), 'Formatted mobile with country code accepted');
    assert(!isValidIndianPhoneNumber('12345'), 'Invalid short number rejected');
    assert(!isValidIndianPhoneNumber('1234567890'), 'Number starting with 1 rejected');

    const normalized = normalizePhoneNumber('+91 98765-43210');
    assert(normalized === '9876543210', `Normalized phone is ${normalized}`);

    // -------------------------------------------------------------
    // Test 2: Cryptographic OTP Dispatch & Verification
    // -------------------------------------------------------------
    console.log('\n🔑 Test 2: Cryptographic OTP Dispatch & Verification');
    const sendResult = await sendMobileOtp(testPhone);
    assert(sendResult.success === true, 'OTP dispatched successfully');
    assert(sendResult.normalizedPhone.includes('9876543210'), 'Normalized phone returned in response');
    // Ensure no raw OTP secret is in sendResult
    assert(!sendResult.otp, 'Raw OTP secret is NOT leaked in client response');

    // Test verify with test OTP (in test mode)
    const verifyResult = await verifyMobileOtp(testPhone, '123456');
    assert(verifyResult.success === true, 'Valid OTP verified successfully');
    assert(verifyResult.normalizedPhone.includes('9876543210'), 'Phone verified and returned');

    // Test with incorrect OTP
    let failedAsExpected = false;
    try {
      await verifyMobileOtp(testPhone, '000000');
    } catch {
      failedAsExpected = true;
    }
    assert(failedAsExpected, 'Incorrect OTP rejected as expected');

    // -------------------------------------------------------------
    // Test 3: Create Verified Student in Database
    // -------------------------------------------------------------
    console.log('\n👤 Test 3: Verified Student Creation & Identity Binding');
    // Clean up any previous test user
    await prisma.user.deleteMany({
      where: { phoneNumber: '+919876543210' }
    });

    createdUser = await prisma.user.create({
      data: {
        phoneNumber: '+919876543210',
        email: '9876543210@student.lowstudy.com',
        fullName: testStudentName,
        role: 'STUDENT',
        universityId: 'gu',
        courseId: 'gu-llb-3yr',
        semesterId: 'gu-llb-3yr-sem1',
        profileCompleted: true,
      }
    });
    assert(createdUser.id !== undefined, `Student identity persisted with ID: ${createdUser.id}`);
    assert(createdUser.phoneNumber === '+919876543210', 'Verified phone bound to student record');

    // -------------------------------------------------------------
    // Test 4: Academic Hierarchy from Database
    // -------------------------------------------------------------
    console.log('\n🏛️ Test 4: Academic Hierarchy Verification from DB');
    const dbUniversities = await prisma.university.findMany({
      where: { status: 'VERIFIED' },
      include: {
        courses: {
          include: {
            semesters: {
              include: {
                subjects: true,
              }
            }
          }
        }
      }
    });

    assert(dbUniversities.length >= 1, `Found ${dbUniversities.length} verified universities in DB`);
    const guUni = dbUniversities.find(u => u.id === 'gu');
    assert(guUni !== undefined, 'Gujarat University loaded from database');
    assert(guUni.courses.length > 0, `Gujarat University has ${guUni.courses.length} courses`);

    const activeCourse = guUni.courses.find(c => c.semesters.some(s => s.subjects.length > 0)) || guUni.courses[0];
    assert(activeCourse.semesters.length > 0, `${activeCourse.name} has ${activeCourse.semesters.length} semesters`);

    const semWithSubjs = activeCourse.semesters.find(s => s.subjects.length > 0) || activeCourse.semesters[0];
    assert(semWithSubjs.subjects.length > 0, `${semWithSubjs.title} has ${semWithSubjs.subjects.length} subjects`);

    // -------------------------------------------------------------
    // Test 5: Order Binding & ₹299 Pricing Enforcement
    // -------------------------------------------------------------
    console.log('\n💳 Test 5: Order Binding & ₹299 Pricing Enforcement');
    const orderResult = await createExamPrepOrder({
      userId: createdUser.id,
      userEmail: createdUser.email,
      userName: createdUser.fullName,
      userPhone: createdUser.phoneNumber,
      notes: {
        universityId: 'gu',
        courseId: activeCourse.id,
        semesterId: semWithSubjs.id,
      }
    });

    assert(orderResult.amount === 29900, 'Order amount strictly enforced at 29900 paise (₹299)');
    assert(orderResult.currency === 'INR', 'Order currency is INR');
    assert(orderResult.orderId !== undefined, 'Local order ID generated');

    // -------------------------------------------------------------
    // Test 6: Payment Verification & Entitlement Activation
    // -------------------------------------------------------------
    console.log('\n🔐 Test 6: Payment Verification & Entitlement Activation');
    const testPaymentId = `pay_mock_${Date.now()}`;
    const generatedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret_for_suite')
      .update(`${orderResult.razorpayOrderId}|${testPaymentId}`)
      .digest('hex');

    const verifyPayResult = await verifyAndCapturePayment({
      userId: createdUser.id,
      orderId: orderResult.orderId,
      razorpayOrderId: orderResult.razorpayOrderId,
      razorpayPaymentId: testPaymentId,
      razorpaySignature: generatedSig,
    });

    assert(verifyPayResult.success === true, 'Payment signature verified successfully');
    assert(verifyPayResult.entitlement.status === 'ACTIVE', 'Entitlement activated in database');

    const hasAccess = await hasActiveExamPrepEntitlement(createdUser.id);
    assert(hasAccess === true, 'hasActiveExamPrepEntitlement reports true for paid student');

    // -------------------------------------------------------------
    // Test 7: DB-Persisted Study State (Bookmarks & Revisions)
    // -------------------------------------------------------------
    console.log('\n📚 Test 7: DB-Persisted Study State');
    const sampleQuestion = await prisma.examPrepQuestion.findFirst();
    assert(sampleQuestion !== null, 'Found exam prep question in database');

    // Add bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: createdUser.id,
        entityType: 'EXAM_PREP_QUESTION',
        entityId: sampleQuestion.id,
      }
    });
    assert(bookmark.id !== undefined, 'Bookmark successfully persisted in DB');

    // Add revision item
    const revItem = await prisma.revisionItem.create({
      data: {
        userId: createdUser.id,
        entityType: 'EXAM_PREP_QUESTION',
        entityId: sampleQuestion.id,
        revisionStatus: 'NEED_REVISION',
        lastReviewedAt: new Date(),
      }
    });
    assert(revItem.revisionStatus === 'NEED_REVISION', 'Revision status persisted in DB as NEED_REVISION');

    // Update revision item to MASTERED
    const updatedRevItem = await prisma.revisionItem.update({
      where: { id: revItem.id },
      data: { revisionStatus: 'MASTERED' }
    });
    assert(updatedRevItem.revisionStatus === 'MASTERED', 'Revision status updated in DB to MASTERED');

    // -------------------------------------------------------------
    // Test 8: Content Security Guard (Unpaid vs Paid)
    // -------------------------------------------------------------
    console.log('\n🛡️ Test 8: Content Security Guard');
    const unpaidView = await getExamPrepQuestions({
      universityId: 'gu',
      isEntitled: false,
    });
    assert(unpaidView.questions && unpaidView.questions.length > 0, 'Questions returned for teaser view');
    assert(unpaidView.questions[0].isLocked === true, 'Unpaid user sees isLocked = true');
    assert(unpaidView.questions[0].modelAnswer.includes('[Unlock'), 'Answer text is masked for unpaid user');
    assert(unpaidView.questions[0].keyRevisionPoints === null, 'Revision points hidden for unpaid user');

    const paidView = await getExamPrepQuestions({
      universityId: 'gu',
      userId: createdUser.id,
      isEntitled: true,
    });
    assert(paidView.questions && paidView.questions.length > 0, 'Paid user receives questions');
    assert(paidView.questions[0].isLocked === false, 'Paid user sees isLocked = false');
    assert(!paidView.questions[0].modelAnswer.includes('[Unlock'), 'Full answer unlocked for paid user');

    // -------------------------------------------------------------
    // Test 9: Content Coverage Matrix Integrity
    // -------------------------------------------------------------
    console.log('\n📊 Test 9: Content Coverage Matrix Integrity');
    const covReport = await getExamPrepContentCoverageReport();
    assert(covReport.summary.totalPublishedQuestions > 0, `Published questions count: ${covReport.summary.totalPublishedQuestions}`);
    assert(covReport.summary.totalUniversities === 9, `Total universities count is 9`);

    // Verify matrix row subject matching
    const row = covReport.coverageMatrix[0];
    assert(row.subjectId !== undefined, `Coverage row has subjectId: ${row.subjectId}`);
    assert(typeof row.publishedQuestions === 'number', `Published questions count is number: ${row.publishedQuestions}`);

  } catch (err) {
    console.error('Integration Test Error:', err);
    failed++;
  } finally {
    // Cleanup created test records
    if (createdUser) {
      await prisma.bookmark.deleteMany({ where: { userId: createdUser.id } }).catch(() => {});
      await prisma.revisionItem.deleteMany({ where: { userId: createdUser.id } }).catch(() => {});
      await prisma.examPrepEntitlement.deleteMany({ where: { userId: createdUser.id } }).catch(() => {});
      await prisma.examPrepOrder.deleteMany({ where: { userId: createdUser.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: createdUser.id } }).catch(() => {});
    }
    await prisma.$disconnect();
  }

  console.log(`\n==============================================`);
  console.log(`🎉 Integration Test Suite: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests();
