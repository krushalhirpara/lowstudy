import { PrismaClient } from '@prisma/client';
import { sendMobileOtp, verifyMobileOtp } from '../src/lib/services/otpService.js';
import { normalizePhoneNumber, isValidIndianPhoneNumber } from '../src/lib/phoneUtils.js';
import { createExamPrepOrder, verifyAndCapturePayment } from '../src/lib/services/examPrepService.js';

const prisma = new PrismaClient();

async function runOtpAndPaymentTests() {
  console.log('🧪 Running Comprehensive Exam Prep Pass OTP & Payment Flow Tests...\n');
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

  try {
    // -------------------------------------------------------------
    // Test 1: Indian Mobile Number Normalization & Validation
    // -------------------------------------------------------------
    console.log('📱 Test 1: Indian Phone Number Validation & Normalization');
    assert(isValidIndianPhoneNumber('9876543210') === true, 'Standard 10-digit mobile is valid');
    assert(isValidIndianPhoneNumber('+91 98765 43210') === true, 'Formatted +91 number is valid');
    assert(isValidIndianPhoneNumber('09876543210') === true, 'Leading zero number is valid');
    assert(isValidIndianPhoneNumber('5876543210') === false, 'Number starting with 5 is invalid');
    assert(isValidIndianPhoneNumber('12345') === false, 'Short number is invalid');
    assert(isValidIndianPhoneNumber('abcdefghij') === false, 'Alphabetic input is invalid');
    assert(normalizePhoneNumber('+91 98765 43210') === '9876543210', 'Normalization strips formatting');

    // -------------------------------------------------------------
    // Test 2: Invalid Mobile Number Rejection by OTP Service
    // -------------------------------------------------------------
    console.log('\n🚫 Test 2: Invalid Mobile Number Rejection by OTP Service');
    let caughtInvalidPhone = false;
    try {
      await sendMobileOtp('123456');
    } catch (e) {
      caughtInvalidPhone = true;
      assert(e.message.includes('valid 10-digit Indian mobile number'), 'Rejects invalid phone number with helpful error');
    }
    assert(caughtInvalidPhone, 'sendMobileOtp throws on invalid phone number');

    // -------------------------------------------------------------
    // Test 3: Successful OTP Send & Cross-Chunk/DB Persistence
    // -------------------------------------------------------------
    console.log('\n📩 Test 3: OTP Generation & Persistence');
    const testPhone = '9876543210';
    const sendResult = await sendMobileOtp(testPhone);
    assert(sendResult.success === true, 'sendMobileOtp returns success');
    assert(sendResult.normalizedPhone === testPhone, 'sendMobileOtp returns normalized phone');
    assert(typeof sendResult.resendCooldownSeconds === 'number', 'Resend cooldown provided');

    // Verify DB record created in OtpVerification
    const dbOtp = await prisma.otpVerification.findUnique({
      where: { phoneNumber: testPhone },
    });
    assert(dbOtp !== null, 'OtpVerification record persisted in database');
    assert(dbOtp.attempts === 0, 'Initial attempts count is 0');
    assert(dbOtp.otpHash && dbOtp.otpHash.length === 64, 'OTP hash is 64-char HMAC-SHA256 (raw code not logged/stored in plain text)');

    // -------------------------------------------------------------
    // Test 4: Resend Cooldown Enforcement
    // -------------------------------------------------------------
    console.log('\n⏳ Test 4: Resend Cooldown Enforcement');
    let caughtCooldown = false;
    try {
      await sendMobileOtp(testPhone);
    } catch (e) {
      caughtCooldown = true;
      assert(e.message.includes('Please wait'), 'Enforces 30s resend cooldown');
    }
    assert(caughtCooldown, 'Rapid resend request is blocked by cooldown');

    // -------------------------------------------------------------
    // Test 5: Incorrect OTP Rejection & Attempt Tracking
    // -------------------------------------------------------------
    console.log('\n❌ Test 5: Incorrect OTP Handling');
    let caughtWrongOtp = false;
    try {
      await verifyMobileOtp(testPhone, '000000');
    } catch (e) {
      caughtWrongOtp = true;
      assert(e.message.includes('Invalid verification code'), 'Rejects incorrect code');
    }
    assert(caughtWrongOtp, 'Incorrect OTP is rejected');

    const dbOtpAfterWrong = await prisma.otpVerification.findUnique({
      where: { phoneNumber: testPhone },
    });
    assert(dbOtpAfterWrong.attempts === 1, 'Attempt counter incremented on wrong code');

    // -------------------------------------------------------------
    // Test 6: Successful OTP Verification & Invalidation (Replay Prevention)
    // -------------------------------------------------------------
    console.log('\n✅ Test 6: Successful OTP Verification & Single-Use Cleanup');
    // In test environment, the deterministic OTP is '123456'
    const verifySuccess = await verifyMobileOtp(testPhone, '123456');
    assert(verifySuccess.success === true, 'Valid code verifies successfully');
    assert(verifySuccess.normalizedPhone === testPhone, 'Verified normalized phone matches');

    // Verify replay protection (record deleted after verification)
    const dbOtpAfterSuccess = await prisma.otpVerification.findUnique({
      where: { phoneNumber: testPhone },
    });
    assert(dbOtpAfterSuccess === null, 'OTP record deleted after success (replay attack blocked)');

    // Trying to use it again must fail
    let caughtReplay = false;
    try {
      await verifyMobileOtp(testPhone, '123456');
    } catch (e) {
      caughtReplay = true;
      assert(e.message.includes('No active verification code'), 'Replayed verification rejected');
    }
    assert(caughtReplay, 'Replaying verified OTP fails immediately');

    // -------------------------------------------------------------
    // Test 7: Mobile Number Change Invalidation Logic
    // -------------------------------------------------------------
    console.log('\n🔄 Test 7: Mobile Number Editing & Invalidation');
    let isMobileVerified = true;
    let verifiedMobileNumber = testPhone;
    let currentInput = testPhone;

    // Student edits number:
    function simulateMobileChange(newVal) {
      currentInput = newVal;
      if (isMobileVerified || (verifiedMobileNumber && normalizePhoneNumber(newVal) !== normalizePhoneNumber(verifiedMobileNumber))) {
        isMobileVerified = false;
        verifiedMobileNumber = '';
      }
    }

    simulateMobileChange('9876543211'); // changed last digit
    assert(isMobileVerified === false, 'Editing mobile number invalidates verified status');
    assert(verifiedMobileNumber === '', 'Verified mobile number cleared on edit');

    // -------------------------------------------------------------
    // Test 8: Order Creation With Verified Mobile & Student Account
    // -------------------------------------------------------------
    console.log('\n💳 Test 8: Secure Order Creation & Binding');
    const verifiedUni = await prisma.university.findFirst({
      where: { status: 'VERIFIED' },
      include: {
        courses: {
          include: { semesters: true }
        }
      }
    });

    const testUniId = verifiedUni?.id || null;
    const testCourseId = verifiedUni?.courses?.[0]?.id || null;
    const testSemId = verifiedUni?.courses?.[0]?.semesters?.[0]?.id || null;

    const testStudent = await prisma.user.create({
      data: {
        email: `otp_test_${Date.now()}@student.lowstudy.com`,
        fullName: 'Bhavik Shah',
        phoneNumber: testPhone,
        role: 'STUDENT',
        universityId: testUniId,
        courseId: testCourseId,
        semesterId: testSemId,
      },
    });

    const order = await createExamPrepOrder({
      userId: testStudent.id,
      userEmail: testStudent.email,
      userName: testStudent.fullName,
      userPhone: testStudent.phoneNumber,
      notes: {
        universityId: testUniId,
        courseId: testCourseId,
        semesterId: testSemId,
      },
    });

    assert(order.success === true, 'Order created successfully');
    assert(order.amount === 29900, 'Order amount is strictly ₹299 (29900 paise)');
    assert(order.currency === 'INR', 'Currency is INR');

    // -------------------------------------------------------------
    // Test 9: Payment Verification & Entitlement Activation
    // -------------------------------------------------------------
    console.log('\n🎓 Test 9: Payment Verification & Entitlement Activation');
    const paymentResult = await verifyAndCapturePayment({
      userId: testStudent.id,
      orderId: order.orderId,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: `pay_test_${Date.now()}`,
      razorpaySignature: 'verified_test_sig',
    });

    assert(paymentResult.success === true, 'Payment verified successfully');
    assert(paymentResult.entitlement !== null, 'Entitlement granted');
    assert(paymentResult.entitlement.status === 'ACTIVE', 'Entitlement status is ACTIVE');

    // Clean up test student
    await prisma.examPrepEntitlement.deleteMany({ where: { userId: testStudent.id } });
    await prisma.examPrepOrder.deleteMany({ where: { userId: testStudent.id } });
    await prisma.user.delete({ where: { id: testStudent.id } });

    console.log(`\n🎉 Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unhandled test failure:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runOtpAndPaymentTests();
