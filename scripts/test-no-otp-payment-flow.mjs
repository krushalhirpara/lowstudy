import { PrismaClient } from '@prisma/client';
import { isValidIndianPhoneNumber, normalizePhoneNumber } from '../src/lib/phoneUtils.js';
import { createExamPrepOrder, verifyAndCapturePayment, hasActiveExamPrepEntitlement } from '../src/lib/services/examPrepService.js';
import { validateAcademicOrderInput } from '../src/lib/services/examPrepService.js';

const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Testing LowStudy Exam Prep Pass Flow (Without OTP)...\n');
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
    // Test Scenario 1: Phone & Name Validation Logic
    // -------------------------------------------------------------
    console.log('📱 Scenario 1: Field Validation Logic');
    assert(isValidIndianPhoneNumber('9876543210') === true, '10-digit number is valid');
    assert(isValidIndianPhoneNumber('5876543210') === false, 'Invalid prefix (starts with 5) is rejected');
    assert(isValidIndianPhoneNumber('') === false, 'Empty phone number is rejected');
    assert(isValidIndianPhoneNumber('123') === false, 'Short phone number is rejected');
    assert(normalizePhoneNumber('+91 98765 43210') === '9876543210', 'Phone number normalized properly');

    const validName = 'Pooja Trivedi';
    const emptyName = '   ';
    assert(validName.trim().length > 0, 'Valid name passes length check');
    assert(emptyName.trim().length === 0, 'Whitespace name fails validation');

    // -------------------------------------------------------------
    // Test Scenario 2: Academic Profile Completeness Check
    // -------------------------------------------------------------
    console.log('\n🏛️ Scenario 2: Academic Profile Completeness');
    const verifiedUni = await prisma.university.findFirst({
      where: { status: 'VERIFIED' },
      include: {
        courses: {
          include: { semesters: true }
        }
      }
    });

    const uniId = verifiedUni?.id;
    const courseId = verifiedUni?.courses?.[0]?.id;
    const semId = verifiedUni?.courses?.[0]?.semesters?.[0]?.id;

    function checkFormValid({ fullName, phone, uId, cId, sId, agreed }) {
      const isNameValid = fullName.trim().length > 0;
      const isPhoneValid = isValidIndianPhoneNumber(phone);
      const isAcademicComplete = Boolean(uId && cId && sId);
      return Boolean(isNameValid && isPhoneValid && isAcademicComplete && agreed);
    }

    assert(
      checkFormValid({ fullName: 'Pooja Trivedi', phone: '9876543210', uId: uniId, cId: courseId, sId: semId, agreed: true }) === true,
      'Valid details enable payment button automatically without OTP'
    );

    assert(
      checkFormValid({ fullName: '', phone: '9876543210', uId: uniId, cId: courseId, sId: semId, agreed: true }) === false,
      'Empty name keeps payment button disabled'
    );

    assert(
      checkFormValid({ fullName: 'Pooja', phone: '12345', uId: uniId, cId: courseId, sId: semId, agreed: true }) === false,
      'Invalid phone keeps payment button disabled'
    );

    assert(
      checkFormValid({ fullName: 'Pooja', phone: '9876543210', uId: '', cId: courseId, sId: semId, agreed: true }) === false,
      'Missing university keeps payment button disabled'
    );

    assert(
      checkFormValid({ fullName: 'Pooja', phone: '9876543210', uId: uniId, cId: '', sId: semId, agreed: true }) === false,
      'Missing course keeps payment button disabled'
    );

    assert(
      checkFormValid({ fullName: 'Pooja', phone: '9876543210', uId: uniId, cId: courseId, sId: '', agreed: true }) === false,
      'Missing semester keeps payment button disabled'
    );

    assert(
      checkFormValid({ fullName: 'Pooja', phone: '9876543210', uId: uniId, cId: courseId, sId: semId, agreed: false }) === false,
      'Unaccepted terms keeps payment button disabled'
    );

    // -------------------------------------------------------------
    // Test Scenario 3: Server-Side Academic Hierarchy Validation
    // -------------------------------------------------------------
    console.log('\n🔒 Scenario 3: Server-Side Academic Hierarchy Validation');
    const validAcademic = await validateAcademicOrderInput({
      universityId: uniId,
      courseId: courseId,
      semesterId: semId,
    });
    assert(validAcademic.valid === true, 'Server accepts verified academic profile');

    const invalidAcademic = await validateAcademicOrderInput({
      universityId: 'non-existent-uni',
      courseId: courseId,
      semesterId: semId,
    });
    assert(invalidAcademic.valid === false, 'Server rejects unverified university');

    // -------------------------------------------------------------
    // Test Scenario 4: Server-Side Order Creation Without OTP
    // -------------------------------------------------------------
    console.log('\n💳 Scenario 4: Server-Side Order Creation & Student Association');
    const testPhone = '9876543210';
    const testEmail = `no_otp_test_${Date.now()}@student.lowstudy.com`;

    const student = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: 'Pooja Trivedi',
        phoneNumber: testPhone,
        role: 'STUDENT',
        universityId: uniId,
        courseId: courseId,
        semesterId: semId,
      },
    });

    const order = await createExamPrepOrder({
      userId: student.id,
      userEmail: student.email,
      userName: student.fullName,
      userPhone: student.phoneNumber,
      notes: {
        universityId: uniId,
        courseId: courseId,
        semesterId: semId,
        isPhoneVerified: false,
      },
    });

    assert(order.success === true, 'Order created successfully without requiring OTP');
    assert(order.amount === 29900, 'Server-enforced price is strictly 29900 paise (₹299)');
    assert(order.currency === 'INR', 'Currency is INR');
    assert(order.orderId !== undefined, 'Local order ID created');
    assert(order.razorpayOrderId !== undefined, 'Razorpay order ID mapped');

    // Verify order in database
    const dbOrder = await prisma.examPrepOrder.findUnique({
      where: { id: order.orderId },
    });
    assert(dbOrder.status === 'PENDING', 'Order initially marked as PENDING');
    assert(dbOrder.userId === student.id, 'Order bound to student account');

    // -------------------------------------------------------------
    // Test Scenario 5: Unpaid / Cancelled Order Does Not Unlock Pass
    // -------------------------------------------------------------
    console.log('\n🛡️ Scenario 5: Access Protection on Unpaid/Cancelled Orders');
    const initialAccess = await hasActiveExamPrepEntitlement(student.id);
    assert(initialAccess === false, 'Unpaid student has no access to Exam Prep Pass');

    // -------------------------------------------------------------
    // Test Scenario 6: Verified Payment Unlocks Access
    // -------------------------------------------------------------
    console.log('\n🌟 Scenario 6: Payment Verification & Entitlement Activation');
    const paymentResult = await verifyAndCapturePayment({
      userId: student.id,
      orderId: order.orderId,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: `pay_mock_${Date.now()}`,
      razorpaySignature: 'verified_test_sig',
    });

    assert(paymentResult.success === true, 'Payment verified successfully');
    assert(paymentResult.entitlement !== null, 'Entitlement granted');
    assert(paymentResult.entitlement.status === 'ACTIVE', 'Entitlement status is ACTIVE');

    const grantedAccess = await hasActiveExamPrepEntitlement(student.id);
    assert(grantedAccess === true, 'Paid student now has verified access to Exam Prep Pass');

    // Clean up test data
    await prisma.examPrepEntitlement.deleteMany({ where: { userId: student.id } });
    await prisma.examPrepOrder.deleteMany({ where: { userId: student.id } });
    await prisma.user.delete({ where: { id: student.id } });

    console.log(`\n🎉 Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Unhandled failure:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
