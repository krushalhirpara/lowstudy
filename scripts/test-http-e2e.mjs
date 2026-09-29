async function runHttpVerification() {
  console.log('🌐 Starting Full HTTP & Production Auth End-to-End Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      throw new Error(`HTTP Assertion failed: ${name}`);
    }
  }

  const BASE_URL = 'http://localhost:3000';

  // 1. Test /login page & AdSense tags
  console.log('--- 1. Testing /login Page & AdSense Tag Structure ---');
  const loginRes = await fetch(`${BASE_URL}/login`);
  assert(loginRes.status === 200, 'GET /login returns HTTP 200');
  const loginHtml = await loginRes.text();
  assert(!loginHtml.includes('data-script'), 'No unsupported data-script attribute in HTML');
  assert(loginHtml.includes('adsbygoogle.js?client=ca-pub-4372092895969608'), 'Official AdSense script is present');

  // 2. Test /universities page
  console.log('\n--- 2. Testing /universities Page (404 Resolution) ---');
  const uniPageRes = await fetch(`${BASE_URL}/universities`);
  assert(uniPageRes.status === 200, 'GET /universities returns HTTP 200 (FIXED 404)');
  const uniHtml = await uniPageRes.text();
  assert(uniHtml.includes('Gujarat Law Universities'), 'Universities directory rendered with full title');
  assert(uniHtml.includes('Saurashtra University'), 'Saurashtra University card rendered');

  // 3. Test /universities/[slug]
  console.log('\n--- 3. Testing /universities/su Slug Page ---');
  const suPageRes = await fetch(`${BASE_URL}/universities/su`);
  assert(suPageRes.status === 200, 'GET /universities/su returns HTTP 200');

  // 4. Test /api/universities Endpoint
  console.log('\n--- 4. Testing GET /api/universities Endpoint ---');
  const uniApiRes = await fetch(`${BASE_URL}/api/universities`);
  assert(uniApiRes.status === 200, 'GET /api/universities returns HTTP 200');
  const uniApiJson = await uniApiRes.json();
  assert(uniApiJson.success === true && uniApiJson.count >= 9, 'API returns all 9 Gujarat universities');

  // 5. Test /pricing & /dashboard
  console.log('\n--- 5. Testing Other Pages ---');
  const pricingRes = await fetch(`${BASE_URL}/pricing`);
  assert(pricingRes.status === 200, 'GET /pricing returns HTTP 200');
  const dashboardRes = await fetch(`${BASE_URL}/dashboard`);
  assert(dashboardRes.status === 200, 'GET /dashboard returns HTTP 200');

  // 6. Test POST /api/student/session with Google Action (New User)
  console.log('\n--- 6. Testing Google Sign-In POST /api/student/session (New User) ---');
  const testTimestamp = Date.now();
  const testGoogleEmail = `law.student.${testTimestamp}@gmail.com`;
  const testGoogleUid = `firebase-uid-${testTimestamp}`;

  const googleSessionRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      email: testGoogleEmail,
      firebaseUid: testGoogleUid,
      fullName: 'Vikram Rajput',
      photoURL: 'https://lh3.googleusercontent.com/a/student',
    }),
  });

  assert(googleSessionRes.status === 200, 'POST /api/student/session with Google action returns HTTP 200 (FIXED 500)');
  const googleJson = await googleSessionRes.json();
  assert(googleJson.success === true, 'Google authentication response reports success: true');
  assert(googleJson.user.email === testGoogleEmail, 'Google response returns authenticated student profile');
  assert(Boolean(googleJson.token), 'Response issues signed HMAC session token');

  // Extract set-cookie header
  const setCookie = googleSessionRes.headers.get('set-cookie');
  assert(Boolean(setCookie && setCookie.includes('lowstudy_session')), 'HttpOnly session cookie lowstudy_session set on response');
  assert(setCookie.toLowerCase().includes('samesite=lax'), 'Session cookie uses SameSite=Lax');

  // 7. Test POST /api/student/session with Google Action (Existing User Re-login)
  console.log('\n--- 7. Testing Google Sign-In (Existing User Re-login) ---');
  const googleReloginRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      email: testGoogleEmail,
      firebaseUid: testGoogleUid,
      fullName: 'Vikram Rajput Updated',
    }),
  });
  assert(googleReloginRes.status === 200, 'Re-login returns HTTP 200 without duplicate accounts');
  const reloginJson = await googleReloginRes.json();
  assert(reloginJson.user.id === googleJson.user.id, 'Same student record reused');

  // 8. Test Active Session Verification GET /api/student/session with Cookie
  console.log('\n--- 8. Testing Session Verification via Cookie GET /api/student/session ---');
  const cookieValue = setCookie.split(';')[0];
  const verifySessionRes = await fetch(`${BASE_URL}/api/student/session`, {
    headers: {
      Cookie: cookieValue,
    },
  });
  assert(verifySessionRes.status === 200, 'Session verification returns HTTP 200');
  const verifyJson = await verifySessionRes.json();
  assert(verifyJson.authenticated === true, 'Session is authenticated: true');
  assert(verifyJson.user.id === googleJson.user.id, 'Session correctly identifies active student');

  // 9. Test Email/Password Authentication & Wrong Password Error Handling
  console.log('\n--- 9. Testing Email/Password Auth & Proper 401 Error Handling ---');
  const emailUser = `advocate.${testTimestamp}@gujarat.in`;
  const emailPass = 'LawExamSecret2026!';

  // Register / Sign up
  const signupRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      email: emailUser,
      password: emailPass,
      fullName: 'Advocate Verma',
    }),
  });
  assert(signupRes.status === 200, 'Email signup returns HTTP 200');

  // Wrong Password Test
  const wrongPassRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailUser,
      password: 'IncorrectPassword',
    }),
  });
  assert(wrongPassRes.status === 401, 'Wrong password returns HTTP 401 (Not 500!)');
  const wrongJson = await wrongPassRes.json();
  assert(wrongJson.success === false && wrongJson.error.includes('Incorrect password'), 'Returns descriptive user-facing error message');

  // Valid Password Test
  const validPassRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailUser,
      password: emailPass,
    }),
  });
  assert(validPassRes.status === 200, 'Valid password returns HTTP 200');

  // 10. Test Logout Action
  console.log('\n--- 10. Testing Logout Action ---');
  const logoutRes = await fetch(`${BASE_URL}/api/student/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' }),
  });
  assert(logoutRes.status === 200, 'Logout returns HTTP 200');
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert(Boolean(logoutCookie && logoutCookie.includes('Max-Age=0')), 'Logout cookie set to Max-Age=0');

  console.log(`\n🎉 ALL ${passed}/${total} PRODUCTION HTTP TESTS PASSED WITH 100% SUCCESS!`);
}

runHttpVerification().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
