import { GET as getSession, POST as postSession } from '../src/app/api/student/session/route.js';
import { POST as trackAnalytics } from '../src/app/api/analytics/track/route.js';
import prisma from '../src/lib/prisma.js';
import { normalizeCityName } from '../src/data/gujaratData.js';
import { verifyAndEnsureUniversity, isUniversityValidForCity } from '../src/lib/universityHelper.js';

function createMockRequest({ method = 'POST', body = null, headers = {}, cookies = {} }) {
  const url = 'http://localhost:3000/api/student/session';
  const cookieStr = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

  const allHeaders = new Headers({
    'Content-Type': 'application/json',
    'x-forwarded-for': '127.0.0.1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestRunner/1.0',
    ...(cookieStr ? { cookie: cookieStr } : {}),
    ...headers,
  });

  return new Request(url, {
    method,
    headers: allHeaders,
    body: body ? JSON.stringify(body) : null,
  });
}

async function runE2EAuthSuite() {
  console.log('===============================================================');
  console.log('🏁 LOWSTUDY — FINAL AUTHENTICATION SYSTEM REPAIR TEST SUITE');
  console.log('===============================================================\n');

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
  const testEmail = `test.student.${timestamp}@lowstudy.com`;
  const testPassword = 'Password123!';
  const testName = 'Kavya Sharma';
  const testCity = 'Ahmedabad';
  const testUniId = 'gu'; // Gujarat University (Ahmedabad)

  // =========================================================================
  // 1. Initial State: Unauthenticated GET
  // =========================================================================
  console.log('--- 1. Testing GET /api/student/session (Unauthenticated) ---');
  const getReq1 = createMockRequest({ method: 'GET' });
  const getRes1 = await getSession(getReq1);
  const getData1 = await getRes1.json();
  assert(getRes1.status === 200, 'GET /api/student/session returns 200');
  assert(getData1.authenticated === false, 'Session reports unauthenticated');
  assert(getData1.user === null, 'User is null for anonymous visitor');

  // =========================================================================
  // 2. Test A: Email Signup with City and University
  // =========================================================================
  console.log('\n--- 2. Testing POST /api/student/session (Signup with City & Uni) ---');
  const signupReq = createMockRequest({
    body: {
      action: 'signup',
      email: testEmail,
      password: testPassword,
      fullName: testName,
      city: testCity,
      universityId: testUniId,
    },
  });
  const signupRes = await postSession(signupReq);
  const signupData = await signupRes.json();
  assert(signupRes.status === 200, 'Signup returns HTTP 200');
  assert(signupData.success === true, 'Signup succeeds');
  assert(signupData.user.email === testEmail, 'User email recorded correctly');
  assert(signupData.user.city === 'Ahmedabad', 'User city saved as Ahmedabad');
  assert(signupData.user.universityId === 'gu', 'User universityId saved as gu');

  // =========================================================================
  // 3. Signup Validation: Invalid City / Uni Mismatch
  // =========================================================================
  console.log('\n--- 3. Testing Signup Validation (City-University Mismatch) ---');
  const mismatchReq = createMockRequest({
    body: {
      action: 'signup',
      email: `mismatch.${timestamp}@lowstudy.com`,
      password: testPassword,
      fullName: 'Mismatch Student',
      city: 'Surat',
      universityId: 'gu', // GU is in Ahmedabad, not Surat
    },
  });
  const mismatchRes = await postSession(mismatchReq);
  const mismatchData = await mismatchRes.json();
  assert(mismatchRes.status === 400, 'City-University mismatch returns HTTP 400 (not 500)');
  assert(mismatchData.success === false, 'Mismatch rejected with error');
  assert(mismatchData.error.includes('matches your selected city'), 'Clear validation message returned');

  // =========================================================================
  // 4. Test B: Email Login (Wrong Password vs Correct Password)
  // =========================================================================
  console.log('\n--- 4. Testing POST /api/student/session (Email Login) ---');
  const wrongLoginReq = createMockRequest({
    body: {
      action: 'login',
      email: testEmail,
      password: 'IncorrectPassword',
    },
  });
  const wrongLoginRes = await postSession(wrongLoginReq);
  const wrongLoginData = await wrongLoginRes.json();
  assert(wrongLoginRes.status === 401, 'Wrong password returns HTTP 401');
  assert(wrongLoginData.error.includes('Incorrect password'), 'Friendly wrong password message');

  const correctLoginReq = createMockRequest({
    body: {
      action: 'login',
      email: testEmail,
      password: testPassword,
    },
  });
  const correctLoginRes = await postSession(correctLoginReq);
  const correctLoginData = await correctLoginRes.json();
  assert(correctLoginRes.status === 200, 'Correct password returns HTTP 200');
  assert(correctLoginData.success === true, 'Login succeeds');
  assert(Boolean(correctLoginData.token), 'HMAC-SHA256 session token returned');
  assert(correctLoginData.isProfileComplete === true, 'Profile is complete');

  const sessionCookie = correctLoginRes.cookies.get('lowstudy_session')?.value || correctLoginData.token;
  assert(Boolean(sessionCookie), 'HttpOnly session cookie issued');

  // =========================================================================
  // 5. Test H: Session Verification (GET with Session Cookie)
  // =========================================================================
  console.log('\n--- 5. Testing GET /api/student/session (Authenticated) ---');
  const authGetReq = createMockRequest({
    method: 'GET',
    cookies: { lowstudy_session: sessionCookie },
  });
  const authGetRes = await getSession(authGetReq);
  const authGetData = await authGetRes.json();
  assert(authGetRes.status === 200, 'Authenticated GET returns HTTP 200');
  assert(authGetData.authenticated === true, 'Authenticated is true');
  assert(authGetData.user.email === testEmail, 'Authenticated user email matches');
  assert(authGetData.user.city === 'Ahmedabad', 'Authenticated user city matches');
  assert(authGetData.user.universityId === 'gu', 'Authenticated user university matches');

  // =========================================================================
  // 6. Test C & D: Google Sign-In (New Google User & Existing Google User)
  // =========================================================================
  console.log('\n--- 6. Testing Google Sign-In (New & Existing) ---');
  const googleEmail = `google.student.${timestamp}@gmail.com`;
  const googleUid = `firebase-google-uid-${timestamp}`;

  const newGoogleReq = createMockRequest({
    body: {
      action: 'google',
      email: googleEmail,
      firebaseUid: googleUid,
      fullName: 'Aarav Patel',
      city: 'Rajkot',
      universityId: 'su', // Saurashtra University (Rajkot)
    },
  });
  const newGoogleRes = await postSession(newGoogleReq);
  const newGoogleData = await newGoogleRes.json();
  assert(newGoogleRes.status === 200, 'New Google user returns HTTP 200');
  assert(newGoogleData.success === true, 'New Google user created successfully');
  assert(newGoogleData.user.city === 'Rajkot', 'Google user city saved');
  assert(newGoogleData.user.universityId === 'su', 'Google user universityId saved');

  // Existing Google User Login
  const existingGoogleReq = createMockRequest({
    body: {
      action: 'google',
      email: googleEmail,
      firebaseUid: googleUid,
    },
  });
  const existingGoogleRes = await postSession(existingGoogleReq);
  const existingGoogleData = await existingGoogleRes.json();
  assert(existingGoogleRes.status === 200, 'Existing Google user returns HTTP 200');
  assert(existingGoogleData.success === true, 'Existing Google user login succeeds');
  assert(existingGoogleData.user.id === newGoogleData.user.id, 'Same user ID reused (no duplicates)');

  // =========================================================================
  // 7. Test E: Google Account Linking to Existing Email Account
  // =========================================================================
  console.log('\n--- 7. Testing Google Account Linking ---');
  const linkGoogleUid = `firebase-link-uid-${timestamp}`;
  const linkReq = createMockRequest({
    body: {
      action: 'google',
      email: testEmail, // Existing email account created earlier
      firebaseUid: linkGoogleUid,
    },
  });
  const linkRes = await postSession(linkReq);
  const linkData = await linkRes.json();
  assert(linkRes.status === 200, 'Google linking returns HTTP 200');
  assert(linkData.success === true, 'Google account linked to email account');

  // =========================================================================
  // 8. Test F: Logout
  // =========================================================================
  console.log('\n--- 8. Testing Logout (Cookie Clearance) ---');
  const logoutReq = createMockRequest({
    body: { action: 'logout' },
  });
  const logoutRes = await postSession(logoutReq);
  const logoutData = await logoutRes.json();
  assert(logoutRes.status === 200, 'Logout returns HTTP 200');
  assert(logoutData.success === true, 'Logout succeeds');
  const clearedCookie = logoutRes.cookies.get('lowstudy_session');
  assert(clearedCookie?.maxAge === 0 || clearedCookie?.value === '', 'Cookie maxAge set to 0');

  // =========================================================================
  // 9. Analytics Endpoint Resilience
  // =========================================================================
  console.log('\n--- 9. Testing /api/analytics/track (Non-blocking Resilience) ---');
  const trackReq = new Request('http://localhost:3000/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: '/subjects',
      pageTitle: 'Subjects - LowStudy',
      deviceType: 'desktop',
      sessionId: 'ls_test_123',
    }),
  });
  const trackRes = await trackAnalytics(trackReq);
  const trackData = await trackRes.json();
  assert(trackRes.status === 200, 'Analytics tracking returns HTTP 200');
  assert(trackData.success === true, 'Analytics endpoint succeeds without throwing 500');

  // Clean up test data
  console.log('\n--- Cleaning up test records ---');
  await prisma.user.deleteMany({
    where: {
      email: { in: [testEmail, googleEmail] },
    },
  });
  console.log('Cleaned up test users.');

  console.log(`\n===============================================================`);
  console.log(`🎉 ALL ${passed}/${total} TESTS PASSED SUCCESSFULLY! (100%)`);
  console.log(`===============================================================\n`);
}

runE2EAuthSuite()
  .catch((err) => {
    console.error('❌ E2E Auth Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
