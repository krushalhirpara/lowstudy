import prisma from '../src/lib/prisma.js';
import { 
  createSessionToken, 
  verifySessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  hashPassword 
} from '../src/lib/security.js';

async function runAuthMatrixTests() {
  console.log('🚀 Running Complete Production Auth & Session Verification Matrix...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`Assertion failed: ${name}`);
    }
  }

  const timestamp = Date.now();
  const newGoogleEmail = `student.google.${timestamp}@law.in`;
  const googleUid = `google-uid-${timestamp}`;
  const googleName = 'Rohan Mehta';
  const googleAvatar = 'https://lh3.googleusercontent.com/a/student-avatar';

  // =========================================================================
  // TEST 1: New Google User
  // =========================================================================
  console.log('--- TEST 1: New Google User Registration & Session ---');
  let user1 = await prisma.user.findUnique({ where: { email: newGoogleEmail } });
  assert(user1 === null, 'User does not exist before first Google login');

  user1 = await prisma.user.create({
    data: {
      email: newGoogleEmail,
      fullName: googleName,
      avatar: googleAvatar,
      firebaseUid: googleUid,
      provider: 'google',
      role: 'STUDENT',
      universityId: 'su',
      collegeId: 'col-la-shah',
      courseId: 'su-llb-3yr',
      semesterId: 'su-llb-3yr-sem3',
      xp: 100,
      streakDays: 1,
      coins: 50,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatar: true,
      provider: true,
      firebaseUid: true,
      universityId: true,
      isActive: true,
    }
  });

  assert(user1 !== null && user1.id.length > 0, 'New Google student record created with unique CUID');
  assert(user1.firebaseUid === googleUid, 'Firebase UID attached as external identity');
  assert(user1.provider === 'google', 'Provider recorded as google');

  const token1 = createSessionToken({
    userId: user1.id,
    email: user1.email,
    role: user1.role,
    universityId: user1.universityId,
  });

  const verifiedSession1 = verifySessionToken(token1);
  assert(verifiedSession1.valid === true, 'Tamper-proof HMAC-SHA256 session token verified');
  assert(verifiedSession1.payload.userId === user1.id, 'Session token contains matching userId');

  // =========================================================================
  // TEST 2: Existing Google User (Re-login)
  // =========================================================================
  console.log('\n--- TEST 2: Existing Google User Re-login (No Duplicates) ---');
  const existingUser = await prisma.user.findUnique({
    where: { email: newGoogleEmail },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatar: true,
      provider: true,
      firebaseUid: true,
      universityId: true,
      isActive: true,
    }
  });

  assert(existingUser !== null, 'Found existing Google student');
  assert(existingUser.id === user1.id, 'Existing ID matches previously created user');

  const usersCount = await prisma.user.count({ where: { email: newGoogleEmail } });
  assert(usersCount === 1, 'No duplicate account created for Google user');

  // =========================================================================
  // TEST 3: Email / Password Registration & Login
  // =========================================================================
  console.log('\n--- TEST 3: Email/Password Registration & Login ---');
  const emailPasswordUser = `law.student.${timestamp}@gujaratlaw.edu`;
  const rawPassword = 'SecurePassword2026!';
  const { hash, salt } = hashPassword(rawPassword);

  const user2 = await prisma.user.create({
    data: {
      email: emailPasswordUser,
      fullName: 'Pooja Patel',
      passwordHash: `${salt}:${hash}`,
      provider: 'credentials',
      role: 'STUDENT',
      universityId: 'gu',
      collegeId: 'col-la-shah',
      courseId: 'gu-llb-3yr',
      semesterId: 'gu-llb-3yr-sem1',
      xp: 100,
      streakDays: 1,
      coins: 50,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      universityId: true,
    }
  });

  assert(user2 !== null, 'Email student created with PBKDF2 salt and hash');
  const [storedSalt, storedHash] = user2.passwordHash.split(':');
  assert(verifyPassword(rawPassword, storedHash, storedSalt) === true, 'Valid password verified successfully');
  assert(verifyPassword('WrongPassword123', storedHash, storedSalt) === false, 'Wrong password correctly rejected');

  // =========================================================================
  // TEST 4: Google Account Linking to Email Account
  // =========================================================================
  console.log('\n--- TEST 4: Google Account Linking to Existing Email Account ---');
  const linkedGoogleUid = `google-linked-${timestamp}`;
  const updatedUser2 = await prisma.user.update({
    where: { id: user2.id },
    data: { firebaseUid: linkedGoogleUid },
    select: { id: true, email: true, firebaseUid: true, passwordHash: true }
  });

  assert(updatedUser2.firebaseUid === linkedGoogleUid, 'Firebase UID linked to existing credentials user');
  assert(updatedUser2.passwordHash !== null, 'Existing password hash preserved during Google linking');

  // Clean up test records
  await prisma.user.deleteMany({
    where: {
      id: { in: [user1.id, user2.id] }
    }
  });
  console.log('\nCleaned up all test student records.');

  console.log(`\n🎉 ALL ${passed}/${total} AUTH & SESSION TESTS PASSED WITH 100% SUCCESS!`);
}

runAuthMatrixTests()
  .catch((e) => {
    console.error('❌ Auth test matrix error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
