import prisma from '../src/lib/prisma.js';

async function runHttpTests() {
  console.log('==========================================================');
  console.log('STARTING LIVE HTTP PRODUCTION ENDPOINT VERIFICATION');
  console.log('==========================================================\n');

  const BASE_URL = 'http://localhost:3000';
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

  const timestamp = Date.now();
  const testEmail = `student.http.${timestamp}@law.in`;
  const testPassword = 'Password@123';
  let sessionCookie = '';

  // ----------------------------------------------------
  // TEST 1: New Email Signup
  // ----------------------------------------------------
  console.log('--- 1. Email Signup Endpoint ---');
  const signupRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Meera Trivedi',
      email: testEmail,
      password: testPassword,
      city: 'Ahmedabad',
      universityId: 'gu',
    }),
  });

  const signupData = await signupRes.json();
  assert(signupRes.status === 200 && signupData.success === true, 'POST /api/student/session (signup) returned HTTP 200');
  assert(signupData.user?.city === 'Ahmedabad' && signupData.user?.universityId === 'gu', 'User city and universityId returned correctly');

  // ----------------------------------------------------
  // TEST 2: Duplicate Email Signup (Must return 400, NOT 500)
  // ----------------------------------------------------
  console.log('\n--- 2. Duplicate Email Signup ---');
  const dupRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Meera Duplicate',
      email: testEmail,
      password: testPassword,
      city: 'Ahmedabad',
      universityId: 'gu',
    }),
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 400 && dupData.success === false, 'POST /api/student/session (duplicate) returned HTTP 400 (NOT 500)');
  assert(dupData.error.includes('already exists'), 'Duplicate email error message is friendly');

  // ----------------------------------------------------
  // TEST 3: Invalid University on Signup (Must return 400, NOT 500)
  // ----------------------------------------------------
  console.log('\n--- 3. Invalid University Validation ---');
  const invalidUniRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Test User',
      email: `invalid.uni.${timestamp}@law.in`,
      password: testPassword,
      city: 'Surat',
      universityId: 'fake-unknown-uni-999',
    }),
  });
  const invalidUniData = await invalidUniRes.json();
  assert(invalidUniRes.status === 400 && invalidUniData.success === false, 'Invalid university returned HTTP 400 (NOT 500)');
  assert(invalidUniData.error.includes('valid university'), 'Proper university validation error returned');

  // ----------------------------------------------------
  // TEST 4: Email Login (Success)
  // ----------------------------------------------------
  console.log('\n--- 4. Email Login Endpoint ---');
  const loginRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginData = await loginRes.json();
  const setCookieHeader = loginRes.headers.get('set-cookie') || '';
  sessionCookie = setCookieHeader.split(';')[0]; // Extract lowstudy_session=...

  assert(loginRes.status === 200 && loginData.success === true, 'POST /api/student/session (login) returned HTTP 200');
  assert(sessionCookie.startsWith('lowstudy_session='), 'HttpOnly lowstudy_session cookie issued in response header');
  assert(loginData.user?.email === testEmail, 'User profile returned cleanly without password hash');

  // ----------------------------------------------------
  // TEST 5: Wrong Password on Login (Must return 401, NOT 500)
  // ----------------------------------------------------
  console.log('\n--- 5. Wrong Password Login ---');
  const wrongPassRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testEmail,
      password: 'IncorrectPassword',
    }),
  });
  const wrongPassData = await wrongPassRes.json();
  assert(wrongPassRes.status === 401 && wrongPassData.success === false, 'Wrong password returned HTTP 401 (NOT 500)');

  // ----------------------------------------------------
  // TEST 6: Google Sign-In (New User)
  // ----------------------------------------------------
  console.log('\n--- 6. Google Sign-In (New User) ---');
  const googleEmail = `google.user.${timestamp}@gmail.com`;
  const googleRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      email: googleEmail,
      firebaseUid: `uid-${timestamp}`,
      fullName: 'Google Student',
      photoURL: 'https://lh3.googleusercontent.com/test',
    }),
  });
  const googleData = await googleRes.json();
  const googleCookie = (googleRes.headers.get('set-cookie') || '').split(';')[0];
  assert(googleRes.status === 200 && googleData.success === true, 'POST /api/student/session (google new) returned HTTP 200');
  assert(googleCookie.startsWith('lowstudy_session='), 'Session cookie issued for Google user');
  assert(googleData.isProfileComplete === false, 'Google new user marked isProfileComplete: false when city/uni missing');

  // ----------------------------------------------------
  // TEST 7: Complete Profile for Google User
  // ----------------------------------------------------
  console.log('\n--- 7. Complete Profile Endpoint ---');
  const completeProfileRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': googleCookie,
    },
    body: JSON.stringify({
      action: 'complete_profile',
      city: 'Rajkot',
      universityId: 'su',
    }),
  });
  const completeProfileData = await completeProfileRes.json();
  assert(completeProfileRes.status === 200 && completeProfileData.success === true, 'POST /api/student/session (complete_profile) returned HTTP 200');
  assert(completeProfileData.isProfileComplete === true, 'Profile completion verified');
  assert(completeProfileData.user?.university?.name === 'Saurashtra University', 'University relation correctly populated');

  // ----------------------------------------------------
  // TEST 8: GET /api/student/session (Session Persistence)
  // ----------------------------------------------------
  console.log('\n--- 8. Session Verification (GET) ---');
  const sessionCheckRes = await fetch(`${BASE_URL}/api/student/session`, {
    headers: { 'Cookie': sessionCookie },
  });
  const sessionCheckData = await sessionCheckRes.json();
  assert(sessionCheckRes.status === 200 && sessionCheckData.authenticated === true, 'GET /api/student/session with cookie returned authenticated: true');
  assert(sessionCheckData.user?.email === testEmail, 'Authenticated user data returned correctly');

  // ----------------------------------------------------
  // TEST 9: Analytics Tracking (Guest & Logged In)
  // ----------------------------------------------------
  console.log('\n--- 9. Analytics Tracking Endpoint ---');
  // Anonymous guest tracking
  const guestTrackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: '/curriculum',
      pageTitle: 'Gujarat Law Curriculum',
      deviceType: 'desktop',
    }),
  });
  const guestTrackData = await guestTrackRes.json();
  assert(guestTrackRes.status === 200 && guestTrackData.success === true, 'POST /api/analytics/track (guest) returned HTTP 200');

  // Authenticated user tracking
  const authTrackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie,
    },
    body: JSON.stringify({
      path: '/dashboard',
      pageTitle: 'Student Dashboard',
      deviceType: 'mobile',
    }),
  });
  const authTrackData = await authTrackRes.json();
  assert(authTrackRes.status === 200 && authTrackData.success === true, 'POST /api/analytics/track (authenticated) returned HTTP 200');

  // Track with invalid / non-existent cookie (Must NEVER return 500)
  const badCookieTrackRes = await fetch(`${BASE_URL}/api/analytics/track`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': 'lowstudy_session=invalid.token.structure',
    },
    body: JSON.stringify({
      path: '/subjects',
      pageTitle: 'Subjects',
      deviceType: 'desktop',
    }),
  });
  const badCookieTrackData = await badCookieTrackRes.json();
  assert(badCookieTrackRes.status === 200 && badCookieTrackData.success === true, 'POST /api/analytics/track with corrupted cookie returned HTTP 200 (NOT 500)');

  // ----------------------------------------------------
  // TEST 10: Logout
  // ----------------------------------------------------
  console.log('\n--- 10. Logout Endpoint ---');
  const logoutRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' }),
  });
  const logoutData = await logoutRes.json();
  const logoutSetCookie = logoutRes.headers.get('set-cookie') || '';
  assert(logoutRes.status === 200 && logoutData.success === true, 'POST /api/student/session (logout) returned HTTP 200');
  assert(logoutSetCookie.includes('Max-Age=0') || logoutSetCookie.includes('max-age=0') || logoutSetCookie.includes('lowstudy_session=;'), 'Session cookie cleared on logout');

  // Cleanup created test records
  console.log('\n--- Cleaning up test records ---');
  await prisma.pageView.deleteMany({ where: { path: { in: ['/curriculum', '/dashboard', '/subjects'] }, deviceType: { in: ['desktop', 'mobile'] } } });
  await prisma.loginEvent.deleteMany({ where: { email: { in: [testEmail, googleEmail] } } });
  await prisma.user.deleteMany({ where: { email: { in: [testEmail, googleEmail] } } });
  console.log('Cleanup complete.');

  console.log('\n==========================================================');
  console.log(`LIVE HTTP TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==========================================================\n');

  return failed === 0;
}

runHttpTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('Fatal HTTP Test Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
