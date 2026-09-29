import fs from 'fs';
import path from 'path';
import prisma from '../src/lib/prisma.js';
import { 
  hashPassword, 
  verifyPassword, 
  createSessionToken, 
  verifySessionToken, 
  getSafeRedirectUrl, 
  verifyAuth 
} from '../src/lib/security.js';
import { verifyAdminCredentials, ensureAdminUser } from '../src/lib/adminAuth.js';
import robots from '../src/app/robots.js';

async function runTests() {
  console.log('====================================================');
  console.log('LOWSTUDY MASTER AUTH + CEO ADMIN TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Safe Redirect Validation (Open Redirect Protection)
    const safeRed1 = getSafeRedirectUrl('/subjects', '/dashboard');
    assert(safeRed1 === '/subjects', 'Test 1: Safe relative redirect preserved (/subjects)');

    const unsafeRed = getSafeRedirectUrl('https://evil.com/hacked', '/dashboard');
    assert(unsafeRed === '/dashboard', 'Test 2: Open redirect blocked (defaults to /dashboard)');

    const unsafeProtocol = getSafeRedirectUrl('javascript:alert(1)', '/dashboard');
    assert(unsafeProtocol === '/dashboard', 'Test 3: Javascript scheme redirect blocked');

    // 2. PBKDF2 Password Hashing & Constant-Time Verification
    const rawPass = 'Student@Secure2026';
    const { hash, salt } = hashPassword(rawPass);
    assert(hash && salt, 'Test 4: PBKDF2 password hashed with cryptographic salt');
    assert(verifyPassword(rawPass, hash, salt), 'Test 5: Valid password verified with constant-time equality');
    assert(!verifyPassword('WrongPass', hash, salt), 'Test 6: Invalid password correctly rejected');

    // 3. HMAC-SHA256 Signed Session Tokens
    const studentPayload = {
      userId: 'usr-test-student-1',
      email: 'student@lowstudy.com',
      role: 'STUDENT',
      universityId: 'su',
    };
    const token = createSessionToken(studentPayload);
    assert(token && token.includes('.'), 'Test 7: HMAC-SHA256 session token created');

    const verified = verifySessionToken(token);
    assert(verified.valid && verified.payload.userId === 'usr-test-student-1', 'Test 8: Session token verified and decoded');

    // Tampered token test
    const tampered = token.slice(0, -5) + 'abcde';
    const tamperedCheck = verifySessionToken(tampered);
    assert(!tamperedCheck.valid, 'Test 9: Tampered session token rejected');

    // 4. Role Authorization Guard (verifyAuth)
    const mockStudentReq = {
      headers: new Headers({
        cookie: `lowstudy_session=${token}`,
      }),
    };
    const adminCheckForStudent = verifyAuth(mockStudentReq, ['ADMIN']);
    assert(!adminCheckForStudent.authorized && adminCheckForStudent.status === 403, 'Test 10: verifyAuth rejects STUDENT role for ADMIN routes');

    // 5. CEO Admin Provisioning & Verification
    await ensureAdminUser();
    const adminAuthResult = await verifyAdminCredentials('ceoadmin', 'LowStudy@CEO2026!');
    assert(adminAuthResult.valid && adminAuthResult.adminUser?.role === 'ADMIN', 'Test 11: CEO Admin credentials verified');

    const adminToken = createSessionToken({
      userId: adminAuthResult.adminUser.id,
      email: adminAuthResult.adminUser.email,
      role: 'ADMIN',
    });
    const mockAdminReq = {
      headers: new Headers({
        cookie: `lowstudy_session=${adminToken}`,
      }),
    };
    const adminCheckForAdmin = verifyAuth(mockAdminReq, ['ADMIN']);
    assert(adminCheckForAdmin.authorized && adminCheckForAdmin.user.role === 'ADMIN', 'Test 12: verifyAuth authorizes ADMIN session');

    // 6. Database Operations: User Creation & Account Linking
    const testStudentEmail = `test_student_${Date.now()}@lowstudy.com`;
    const createdStudent = await prisma.user.create({
      data: {
        email: testStudentEmail,
        fullName: 'Test Law Student',
        role: 'STUDENT',
        provider: 'credentials',
        passwordHash: `${salt}:${hash}`,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });
    assert(createdStudent && createdStudent.id, 'Test 13: Student account provisioned in User table');

    // 7. PageView Telemetry Tracking
    const pageView = await prisma.pageView.create({
      data: {
        userId: createdStudent.id,
        sessionId: 'sid_test_123',
        path: '/subjects/su-llb-sem3-bns',
        pageTitle: 'Bharatiya Nyaya Sanhita Sem 3',
        deviceType: 'desktop',
      },
    });
    assert(pageView && pageView.id, 'Test 14: First-party PageView recorded');

    // 8. LoginEvent Audit Logging
    const loginEvent = await prisma.loginEvent.create({
      data: {
        userId: createdStudent.id,
        email: testStudentEmail,
        provider: 'credentials',
        success: true,
        ipAddress: '127.0.0.1',
      },
    });
    assert(loginEvent && loginEvent.id, 'Test 15: LoginEvent audit trail recorded');

    // 9. SEO & Robots Privacy Checks
    const robotsRules = robots();
    const disallowList = robotsRules.rules[0].disallow;
    assert(disallowList.includes('/ceoadmin') && disallowList.includes('/ceoadmin/*'), 'Test 16: /ceoadmin explicitly disallowed in robots.txt');

    const sitemapContent = fs.readFileSync(path.join(process.cwd(), 'src/app/sitemap.js'), 'utf8');
    assert(!sitemapContent.includes('/ceoadmin'), 'Test 17: /ceoadmin completely excluded from sitemap.js');

    const ceoLayoutContent = fs.readFileSync(path.join(process.cwd(), 'src/app/ceoadmin/layout.jsx'), 'utf8');
    assert(
      ceoLayoutContent.includes('index: false') && ceoLayoutContent.includes('follow: false'),
      'Test 18: CEO Admin layout explicitly configured with noindex, nofollow metadata'
    );

    // 10. Clean up test student
    await prisma.pageView.deleteMany({ where: { userId: createdStudent.id } });
    await prisma.loginEvent.deleteMany({ where: { userId: createdStudent.id } });
    await prisma.user.delete({ where: { id: createdStudent.id } });
    assert(true, 'Test 19: Test data cleaned up safely');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
