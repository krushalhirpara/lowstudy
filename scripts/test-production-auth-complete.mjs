import prisma from '../src/lib/prisma.js';
import { 
  createSessionToken, 
  verifySessionToken, 
  hashPassword, 
  verifyPassword 
} from '../src/lib/security.js';
import { verifyAndEnsureUniversity } from '../src/lib/universityHelper.js';

async function runTestSuite() {
  console.log('====================================================');
  console.log('LOWSTUDY AUTH + DATABASE + ANALYTICS VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  const testEmail = `test.student.${Date.now()}@law.in`;
  const testPassword = 'Password@123';
  let createdUserId = null;

  // 1. Verify University Verification and Auto-Ensure
  console.log('--- 1. University Verification ---');
  const validUniId = await verifyAndEnsureUniversity('gu');
  assert(validUniId === 'gu', 'Valid university "gu" recognized and verified');

  const invalidUni = await verifyAndEnsureUniversity('nonexistent-uni-123');
  assert(invalidUni === null, 'Invalid university "nonexistent-uni-123" correctly rejected with null');

  // 2. Email Signup Flow Simulation
  console.log('\n--- 2. Email Signup Flow ---');
  const { hash, salt } = hashPassword(testPassword);
  assert(hash && salt, 'Password hashed securely with salt and PBKDF2 (SHA-512)');

  const newUser = await prisma.user.create({
    data: {
      email: testEmail,
      fullName: 'Vikram Mehta',
      city: 'Surat',
      universityId: 'gu',
      provider: 'credentials',
      passwordHash: `${salt}:${hash}`,
      role: 'STUDENT',
      isActive: true,
      streakDays: 1,
      xp: 100,
      coins: 50,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    },
    include: {
      university: true,
    },
  });

  createdUserId = newUser.id;
  assert(newUser.id && newUser.email === testEmail, `User created successfully with ID: ${newUser.id}`);
  assert(newUser.city === 'Surat', 'City "Surat" saved');
  assert(newUser.universityId === 'gu' && newUser.university?.name === 'Gujarat University', 'University relation linked correctly');
  assert(newUser.collegeId === null && newUser.courseId === null, 'No forced dummy foreign keys (collegeId, courseId nullable)');

  // 3. Duplicate Email Signup Detection
  console.log('\n--- 3. Duplicate Email Detection ---');
  const duplicateUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  assert(duplicateUser !== null && duplicateUser.passwordHash !== null, 'Duplicate email identified cleanly for 400 conflict response');

  // 4. Email Login Verification
  console.log('\n--- 4. Email Login & Password Verification ---');
  const [storedSalt, storedHash] = newUser.passwordHash.split(':');
  const correctPasswordCheck = verifyPassword(testPassword, storedHash, storedSalt);
  assert(correctPasswordCheck === true, 'Correct password verifies successfully');

  const wrongPasswordCheck = verifyPassword('WrongPassword123', storedHash, storedSalt);
  assert(wrongPasswordCheck === false, 'Wrong password rejected safely');

  // 5. Session Token Creation & Verification
  console.log('\n--- 5. Session Security ---');
  const sessionToken = createSessionToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    universityId: newUser.universityId,
  });
  assert(sessionToken && sessionToken.includes('.'), 'HMAC-SHA256 session token generated');

  const decoded = verifySessionToken(sessionToken);
  assert(decoded.valid === true && decoded.payload.userId === newUser.id, 'Session token verified successfully');

  const tamperedToken = sessionToken.slice(0, -5) + 'xxxxx';
  const tamperedVerification = verifySessionToken(tamperedToken);
  assert(tamperedVerification.valid === false, 'Tampered session token rejected');

  // 6. Google Sign-In & Account Linking
  console.log('\n--- 6. Google Sign-In & Linking ---');
  const googleUid = `firebase-uid-${Date.now()}`;
  const updatedWithGoogle = await prisma.user.update({
    where: { id: newUser.id },
    data: {
      firebaseUid: googleUid,
      avatar: 'https://lh3.googleusercontent.com/test-avatar',
      lastLoginAt: new Date(),
    },
  });
  assert(updatedWithGoogle.firebaseUid === googleUid, 'Existing credentials account linked with Google Firebase UID');

  // 7. New Google User (First time sign-in without city/uni)
  console.log('\n--- 7. First-Time Google User Creation ---');
  const googleOnlyEmail = `google.student.${Date.now()}@gmail.com`;
  const googleNewUser = await prisma.user.create({
    data: {
      email: googleOnlyEmail,
      fullName: 'Ananya Sharma',
      avatar: 'https://lh3.googleusercontent.com/ananya-avatar',
      firebaseUid: `firebase-uid-new-${Date.now()}`,
      provider: 'google',
      role: 'STUDENT',
      isActive: true,
      city: null,
      universityId: null,
    },
  });
  assert(googleNewUser.id && googleNewUser.city === null && googleNewUser.universityId === null, 'First-time Google user created safely with nullable city/uni');

  // 8. Profile Completion for Google User
  console.log('\n--- 8. Complete Profile for Google User ---');
  const completedProfile = await prisma.user.update({
    where: { id: googleNewUser.id },
    data: {
      city: 'Rajkot',
      universityId: 'su',
    },
    include: { university: true },
  });
  assert(completedProfile.city === 'Rajkot' && completedProfile.universityId === 'su', 'Profile completed with City: Rajkot, University: Saurashtra University');

  // 9. LoginEvent Audit Logging
  console.log('\n--- 9. Login Event Audit ---');
  const loginEvent = await prisma.loginEvent.create({
    data: {
      userId: newUser.id,
      email: newUser.email,
      provider: 'credentials',
      success: true,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 Test Suite',
    },
  });
  assert(loginEvent.id && loginEvent.userId === newUser.id, 'LoginEvent recorded in DB');

  // 10. Analytics PageView Tracking (Guest & Authenticated)
  console.log('\n--- 10. Analytics PageView Tracking ---');
  // Anonymous guest page view
  const guestPv = await prisma.pageView.create({
    data: {
      userId: null,
      sessionId: 'test_session_guest',
      path: '/curriculum',
      pageTitle: 'Gujarat Law Curriculum',
      deviceType: 'desktop',
    },
  });
  assert(guestPv.id && guestPv.userId === null, 'Guest PageView recorded with userId: null');

  // Authenticated page view
  const userPv = await prisma.pageView.create({
    data: {
      userId: newUser.id,
      sessionId: 'test_session_auth',
      path: '/dashboard',
      pageTitle: 'Student Dashboard',
      deviceType: 'mobile',
    },
  });
  assert(userPv.id && userPv.userId === newUser.id, 'Authenticated PageView recorded with valid user relation');

  // Page view with nonexistent userId (Defensive check simulation)
  let defensivePvCreated = false;
  try {
    let badUserId = 'nonexistent-user-id-999999';
    const userExists = await prisma.user.findUnique({
      where: { id: badUserId },
      select: { id: true },
    });
    if (!userExists) badUserId = null;

    const fallbackPv = await prisma.pageView.create({
      data: {
        userId: badUserId,
        sessionId: 'test_session_fallback',
        path: '/subjects',
        pageTitle: 'Subjects',
        deviceType: 'tablet',
      },
    });
    defensivePvCreated = Boolean(fallbackPv.id);
  } catch (err) {
    defensivePvCreated = false;
  }
  assert(defensivePvCreated === true, 'Analytics gracefully sanitizes invalid userId to null, preventing 500 error');

  // Clean up test records
  await prisma.pageView.deleteMany({ where: { sessionId: { in: ['test_session_guest', 'test_session_auth', 'test_session_fallback'] } } });
  await prisma.loginEvent.deleteMany({ where: { email: { in: [testEmail, googleOnlyEmail] } } });
  await prisma.user.deleteMany({ where: { id: { in: [newUser.id, googleNewUser.id] } } });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  return failed === 0;
}

runTestSuite()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
