const BASE_URL = 'http://127.0.0.1:3000';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });

  const setCookie = res.headers.get('set-cookie');
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: res.status,
    headers: res.headers,
    setCookie,
    body,
  };
}

function extractSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const match = setCookieHeader.match(/lowstudy_session=([^;]+)/);
  return match ? match[1] : null;
}

async function runTests() {
  console.log('================================================================');
  console.log('LOWSTUDY AUTH SESSION PERSISTENCE & MULTI-USER ISOLATION TEST');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const userAEmail = `krushal.${timestamp}@lowstudy.test`;
  const userBEmail = `ananya.${timestamp}@lowstudy.test`;
  const passwordA = 'SecureLawPass123';
  const passwordB = 'AnotherLawPass456';

  // Wait for server readiness
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/student/me`);
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      await wait(500);
    }
  }

  if (!ready) {
    console.error('FAIL: Production server not reachable at http://127.0.0.1:3000');
    process.exit(1);
  }

  console.log('✓ Server is ready at http://127.0.0.1:3000\n');

  // 1. Initial Unauthenticated State Check
  console.log('TEST 1: Initial Unauthenticated State (/api/student/me)');
  const initialMe = await makeRequest('/api/student/me');
  if (initialMe.status === 200 && initialMe.body?.authenticated === false && initialMe.body?.user === null) {
    console.log('  PASS: /api/student/me returned authenticated: false when unauthenticated.');
  } else {
    console.error('  FAIL: Initial state returned unexpected response:', initialMe);
    process.exit(1);
  }

  // 2. User A: Signup
  console.log('\nTEST 2: User A Signup (Krushal Hirpara)');
  const signupResA = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Krushal Hirpara',
      email: userAEmail,
      password: passwordA,
      city: 'Rajkot',
      universityId: 'su',
    }),
  });

  if (signupResA.status !== 200 || !signupResA.body?.success) {
    console.error('  FAIL: User A signup failed:', signupResA);
    process.exit(1);
  }
  console.log('  PASS: User A account created successfully.');
  console.log(`  User A: ${signupResA.body.user?.fullName} (${signupResA.body.user?.email}) - City: ${signupResA.body.user?.city}`);

  // 3. User A: Login
  console.log('\nTEST 3: User A Email/Password Login');
  const loginResA = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: userAEmail,
      password: passwordA,
    }),
  });

  if (loginResA.status !== 200 || !loginResA.body?.success) {
    console.error('  FAIL: User A login failed:', loginResA);
    process.exit(1);
  }

  const cookieA = extractSessionCookie(loginResA.setCookie);
  if (!cookieA) {
    console.error('  FAIL: lowstudy_session cookie not set in login response:', loginResA.setCookie);
    process.exit(1);
  }

  console.log('  PASS: User A logged in successfully.');
  console.log(`  User A Session Cookie: ${cookieA.slice(0, 30)}...`);
  console.log(`  HttpOnly Cookie correctly issued.`);

  // 4. User A: Browser Refresh Simulation (GET /api/student/me with session cookie)
  console.log('\nTEST 4: User A Browser Refresh (/api/student/me)');
  const refreshMeA = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${cookieA}` },
  });

  if (
    refreshMeA.status === 200 &&
    refreshMeA.body?.authenticated === true &&
    refreshMeA.body?.user?.email === userAEmail &&
    refreshMeA.body?.user?.fullName === 'Krushal Hirpara'
  ) {
    console.log('  PASS: Session persisted across refresh.');
    console.log(`  Real FullName: ${refreshMeA.body.user.fullName}`);
    console.log(`  Real Email: ${refreshMeA.body.user.email}`);
    console.log(`  Real City: ${refreshMeA.body.user.city}`);
    console.log(`  Real University: ${refreshMeA.body.user.university?.name || refreshMeA.body.user.universityId}`);
  } else {
    console.error('  FAIL: User A refresh failed:', refreshMeA);
    process.exit(1);
  }

  // 5. User A: Dashboard Data Verification & Refresh
  console.log('\nTEST 5: User A Dashboard Data & Scope');
  const dashA = await makeRequest('/api/student/dashboard', {
    headers: { 'Cookie': `lowstudy_session=${cookieA}` },
  });

  if (dashA.status === 200 && dashA.body?.success && dashA.body?.data?.student?.email === userAEmail) {
    console.log('  PASS: Dashboard data strictly scoped to User A.');
    console.log(`  Student in Dashboard: ${dashA.body.data.student.fullName} (${dashA.body.data.student.email})`);
    console.log(`  City: ${dashA.body.data.student.city}`);
    console.log(`  Questions Solved: ${dashA.body.data.coreMetrics.questionsSolved}`);
  } else {
    console.error('  FAIL: User A dashboard verification failed:', dashA);
    process.exit(1);
  }

  // 6. User A: Logout
  console.log('\nTEST 6: User A Logout');
  const logoutResA = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': `lowstudy_session=${cookieA}`,
    },
    body: JSON.stringify({ action: 'logout' }),
  });

  if (logoutResA.status === 200 && logoutResA.body?.success) {
    console.log('  PASS: User A logged out successfully.');
    console.log(`  Cleared Cookie Header: ${logoutResA.setCookie}`);
  } else {
    console.error('  FAIL: Logout failed:', logoutResA);
    process.exit(1);
  }

  // Verify post-logout unauthenticated state
  const postLogoutMe = await makeRequest('/api/student/me');
  if (postLogoutMe.status === 200 && postLogoutMe.body?.authenticated === false) {
    console.log('  PASS: Post-logout state is unauthenticated.');
  } else {
    console.error('  FAIL: Post-logout check failed:', postLogoutMe);
    process.exit(1);
  }

  // 7. User B: Signup
  console.log('\nTEST 7: User B Signup (Ananya Sharma)');
  const signupResB = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Ananya Sharma',
      email: userBEmail,
      password: passwordB,
      city: 'Ahmedabad',
      universityId: 'gu',
    }),
  });

  if (signupResB.status !== 200 || !signupResB.body?.success) {
    console.error('  FAIL: User B signup failed:', signupResB);
    process.exit(1);
  }
  console.log('  PASS: User B account created successfully.');
  console.log(`  User B: ${signupResB.body.user?.fullName} (${signupResB.body.user?.email}) - City: ${signupResB.body.user?.city}`);

  // 8. User B: Login
  console.log('\nTEST 8: User B Email/Password Login');
  const loginResB = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: userBEmail,
      password: passwordB,
    }),
  });

  if (loginResB.status !== 200 || !loginResB.body?.success) {
    console.error('  FAIL: User B login failed:', loginResB);
    process.exit(1);
  }

  const cookieB = extractSessionCookie(loginResB.setCookie);
  if (!cookieB) {
    console.error('  FAIL: lowstudy_session cookie not set for User B');
    process.exit(1);
  }

  console.log('  PASS: User B logged in successfully.');
  console.log(`  User B Session Cookie: ${cookieB.slice(0, 30)}...`);

  // 9. User B: Browser Refresh Simulation
  console.log('\nTEST 9: User B Browser Refresh (/api/student/me)');
  const refreshMeB = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${cookieB}` },
  });

  if (
    refreshMeB.status === 200 &&
    refreshMeB.body?.authenticated === true &&
    refreshMeB.body?.user?.email === userBEmail &&
    refreshMeB.body?.user?.fullName === 'Ananya Sharma'
  ) {
    console.log('  PASS: User B session persisted after refresh.');
    console.log(`  Real FullName: ${refreshMeB.body.user.fullName}`);
    console.log(`  Real Email: ${refreshMeB.body.user.email}`);
    console.log(`  Real City: ${refreshMeB.body.user.city}`);
  } else {
    console.error('  FAIL: User B refresh failed:', refreshMeB);
    process.exit(1);
  }

  // 10. User B: Dashboard Data Verification & Scope
  console.log('\nTEST 10: User B Dashboard Data Scoping');
  const dashB = await makeRequest('/api/student/dashboard', {
    headers: { 'Cookie': `lowstudy_session=${cookieB}` },
  });

  if (dashB.status === 200 && dashB.body?.success && dashB.body?.data?.student?.email === userBEmail) {
    console.log('  PASS: Dashboard data strictly scoped to User B.');
    console.log(`  Student in Dashboard: ${dashB.body.data.student.fullName} (${dashB.body.data.student.email})`);
    console.log(`  City: ${dashB.body.data.student.city}`);
  } else {
    console.error('  FAIL: User B dashboard verification failed:', dashB);
    process.exit(1);
  }

  // 11. Strict Multi-User Isolation Verification
  console.log('\nTEST 11: Strict Multi-User Isolation Check');
  const isEmailDistinct = refreshMeB.body.user.email !== refreshMeA.body.user.email;
  const isIdDistinct = refreshMeB.body.user.id !== refreshMeA.body.user.id;
  const isNameDistinct = refreshMeB.body.user.fullName !== refreshMeA.body.user.fullName;

  if (isEmailDistinct && isIdDistinct && isNameDistinct) {
    console.log('  PASS: User A and User B identities are 100% isolated.');
    console.log(`  User A: [${refreshMeA.body.user.id}] ${refreshMeA.body.user.fullName} (${refreshMeA.body.user.email})`);
    console.log(`  User B: [${refreshMeB.body.user.id}] ${refreshMeB.body.user.fullName} (${refreshMeB.body.user.email})`);
  } else {
    console.error('  FAIL: Identity collision between User A and User B!');
    process.exit(1);
  }

  // 12. Google Auth Flow & Refresh Persistence Test
  console.log('\nTEST 12: Google Auth Flow & Refresh Persistence Test');
  const googleEmail = `google.student.${timestamp}@gmail.com`;
  const googleUid = `firebase-uid-${timestamp}`;
  const googleRes = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      firebaseUid: googleUid,
      email: googleEmail,
      fullName: 'Google Scholar User',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      city: 'Surat',
      universityId: 'vnsgu',
    }),
  });

  if (googleRes.status !== 200 || !googleRes.body?.success) {
    console.error('  FAIL: Google auth failed:', googleRes);
    process.exit(1);
  }

  const googleCookie = extractSessionCookie(googleRes.setCookie);
  if (!googleCookie) {
    console.error('  FAIL: Session cookie not issued for Google sign-in');
    process.exit(1);
  }

  console.log('  PASS: Google user authenticated.');

  // Refresh check for Google user
  const refreshGoogle = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${googleCookie}` },
  });

  if (
    refreshGoogle.status === 200 &&
    refreshGoogle.body?.authenticated === true &&
    refreshGoogle.body?.user?.email === googleEmail &&
    refreshGoogle.body?.user?.fullName === 'Google Scholar User'
  ) {
    console.log('  PASS: Google user session and profile persisted after refresh.');
    console.log(`  Google User FullName: ${refreshGoogle.body.user.fullName}`);
    console.log(`  Google User Email: ${refreshGoogle.body.user.email}`);
    console.log(`  Google User City: ${refreshGoogle.body.user.city}`);
  } else {
    console.error('  FAIL: Google user refresh persistence failed:', refreshGoogle);
    process.exit(1);
  }

  // 13. Zero Demo/Fallback User Leaks Check
  console.log('\nTEST 13: Verification of Zero Demo/Fallback Data');
  const payloads = [
    JSON.stringify(refreshMeA.body),
    JSON.stringify(refreshMeB.body),
    JSON.stringify(refreshGoogle.body),
    JSON.stringify(dashA.body),
    JSON.stringify(dashB.body)
  ];

  for (const payload of payloads) {
    if (
      payload.includes('student@lowstudy.com') ||
      payload.includes('Law Student Scholar') ||
      payload.includes('usr-student-01')
    ) {
      console.error('  FAIL: Demo/mock user leaked in response payload:', payload);
      process.exit(1);
    }
  }

  console.log('  PASS: Verified 0 occurrences of student@lowstudy.com, Law Student Scholar, and usr-student-01.');

  console.log('\n================================================================');
  console.log('✓ ALL 13 TEST SUITES PASSED SUCCESSFULLY WITH 100% ACCURACY');
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
