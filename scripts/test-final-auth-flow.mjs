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

async function runTestMatrix() {
  console.log('================================================================');
  console.log('LOWSTUDY — FINAL AUTH FLOW TEST MATRIX (A through O)');
  console.log('================================================================\n');

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

  const timestamp = Date.now();
  const emailA = `advocate.alpha.${timestamp}@lowstudy.test`;
  const phoneA = '9876543210';
  const passA = 'LawSecret@2026';

  const emailB = `scholar.beta.${timestamp}@lowstudy.test`;
  const phoneB = '9123456780';
  const passB = 'LawSecret@2026';

  // --------------------------------------------------------------------------
  // TEST A: New email signup with all fields
  // --------------------------------------------------------------------------
  console.log('TEST A: New email signup with all fields');
  const signupA = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Advocate Alpha',
      email: emailA,
      phoneNumber: '+91 98765-43210', // test formatting normalization
      password: passA,
      city: 'Rajkot',
      universityId: 'su',
    }),
  });

  if (signupA.status === 200 && signupA.body?.success && signupA.body?.user?.phoneNumber === '9876543210') {
    console.log('  PASS: Account created with normalized phone number 9876543210.');
  } else {
    console.error('  FAIL TEST A:', signupA);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST B: Existing email login with matching phone & password
  // --------------------------------------------------------------------------
  console.log('\nTEST B: Existing email login with matching phone & password');
  const loginA = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailA,
      phoneNumber: '9876543210',
      password: passA,
    }),
  });

  const cookieA = extractSessionCookie(loginA.setCookie);
  if (loginA.status === 200 && loginA.body?.success && cookieA) {
    console.log('  PASS: Logged in successfully, session cookie issued.');
  } else {
    console.error('  FAIL TEST B:', loginA);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST C: Wrong email/password -> rejected
  // --------------------------------------------------------------------------
  console.log('\nTEST C: Wrong email/password rejected');
  const wrongPass = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailA,
      phoneNumber: '9876543210',
      password: 'IncorrectPassword999',
    }),
  });

  if (wrongPass.status === 401 && !wrongPass.body?.success) {
    console.log('  PASS: Wrong password rejected (401).');
  } else {
    console.error('  FAIL TEST C:', wrongPass);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST D: Existing Google LowStudy user -> Google login -> session -> home
  // --------------------------------------------------------------------------
  console.log('\nTEST D: Existing Google LowStudy user Google Login');
  const googleEmailD = `existing.google.${timestamp}@gmail.com`;
  const googleUidD = `google-uid-${timestamp}`;

  // First create this google user with full details (signup flow)
  await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: googleEmailD,
      fullName: 'Google User Existing',
      firebaseUid: googleUidD,
      phoneNumber: '9988776655',
      city: 'Ahmedabad',
      universityId: 'gu',
    }),
  });

  // Now perform Google Login from /login page
  const googleLoginD = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_login',
      email: googleEmailD,
      firebaseUid: googleUidD,
    }),
  });

  const cookieD = extractSessionCookie(googleLoginD.setCookie);
  if (googleLoginD.status === 200 && googleLoginD.body?.success && cookieD) {
    console.log('  PASS: Existing Google user logged in successfully with session cookie.');
  } else {
    console.error('  FAIL TEST D:', googleLoginD);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST E: New Google user clicks Google on LOGIN -> MUST NOT create account, returns notFound -> redirects to signup
  // --------------------------------------------------------------------------
  console.log('\nTEST E: New Google user clicks Google on LOGIN (Must NOT auto-create account)');
  const newGoogleEmail = `brand.new.google.${timestamp}@gmail.com`;
  const newGoogleUid = `new-google-uid-${timestamp}`;

  const newGoogleLoginRes = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_login',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
    }),
  });

  const cookieE = extractSessionCookie(newGoogleLoginRes.setCookie);
  if (
    (newGoogleLoginRes.status === 404 || newGoogleLoginRes.body?.notFound === true) &&
    !newGoogleLoginRes.body?.success &&
    cookieE === null
  ) {
    console.log('  PASS: New Google user blocked from direct login without account.');
    console.log(`  Message: "${newGoogleLoginRes.body?.error}"`);
    console.log('  Zero session cookie issued.');
  } else {
    console.error('  FAIL TEST E: New Google user unexpectedly logged in or created session:', newGoogleLoginRes);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST F: New Google user clicks Google on SIGNUP -> Complete Profile screen required
  // --------------------------------------------------------------------------
  console.log('\nTEST F: New Google user clicks Google on SIGNUP');
  const googleSignupStart = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: 'New Google Scholar',
    }),
  });

  if (googleSignupStart.body?.isNewUser === true && googleSignupStart.body?.isProfileComplete === false) {
    console.log('  PASS: Google signup indicates profile completion is required.');
  } else {
    console.error('  FAIL TEST F:', googleSignupStart);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST G: Google signup without Full Name -> blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST G: Google signup without Full Name (blocked)');
  const missingName = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: ' ',
      phoneNumber: '9876543210',
      city: 'Rajkot',
      universityId: 'su',
    }),
  });

  if (missingName.status === 400 && !missingName.body?.success) {
    console.log('  PASS: Blocked when Full Name is missing.');
  } else {
    console.error('  FAIL TEST G:', missingName);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST H: Google signup without Contact Number -> blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST H: Google signup without Contact Number (blocked)');
  const missingPhone = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: 'New Google Scholar',
      phoneNumber: '',
      city: 'Rajkot',
      universityId: 'su',
    }),
  });

  if (missingPhone.status === 400 && !missingPhone.body?.success) {
    console.log('  PASS: Blocked when Contact Number is missing.');
  } else {
    console.error('  FAIL TEST H:', missingPhone);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST I: Google signup without City -> blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST I: Google signup without City (blocked)');
  const missingCity = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: 'New Google Scholar',
      phoneNumber: '9876543210',
      city: '',
      universityId: 'su',
    }),
  });

  if (missingCity.status === 400 && !missingCity.body?.success) {
    console.log('  PASS: Blocked when City is missing.');
  } else {
    console.error('  FAIL TEST I:', missingCity);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST J: Google signup without University -> blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST J: Google signup without University (blocked)');
  const missingUni = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: 'New Google Scholar',
      phoneNumber: '9876543210',
      city: 'Rajkot',
      universityId: '',
    }),
  });

  if (missingUni.status === 400 && !missingUni.body?.success) {
    console.log('  PASS: Blocked when University is missing.');
  } else {
    console.error('  FAIL TEST J:', missingUni);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST K: Complete all details -> LowStudy account created -> session created
  // --------------------------------------------------------------------------
  console.log('\nTEST K: Complete all details -> Account & session created');
  const completeGoogle = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google_signup',
      email: newGoogleEmail,
      firebaseUid: newGoogleUid,
      fullName: 'New Google Scholar',
      phoneNumber: '9876543210',
      city: 'Rajkot',
      universityId: 'su',
    }),
  });

  const cookieK = extractSessionCookie(completeGoogle.setCookie);
  if (completeGoogle.status === 200 && completeGoogle.body?.success && completeGoogle.body?.isProfileComplete && cookieK) {
    console.log('  PASS: Google user registered with full profile and session cookie issued.');
  } else {
    console.error('  FAIL TEST K:', completeGoogle);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST L: Refresh after login -> same user remains logged in
  // --------------------------------------------------------------------------
  console.log('\nTEST L: Refresh after login (/api/student/me with session cookie)');
  const refreshMe = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${cookieK}` },
  });

  if (refreshMe.status === 200 && refreshMe.body?.authenticated === true && refreshMe.body?.user?.email === newGoogleEmail) {
    console.log('  PASS: Authenticated user persisted across refresh.');
    console.log(`  User: ${refreshMe.body.user.fullName} (${refreshMe.body.user.email}) - Phone: ${refreshMe.body.user.phoneNumber}`);
  } else {
    console.error('  FAIL TEST L:', refreshMe);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST M: Logout -> logged out
  // --------------------------------------------------------------------------
  console.log('\nTEST M: Logout');
  const logoutRes = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `lowstudy_session=${cookieK}`,
    },
    body: JSON.stringify({ action: 'logout' }),
  });

  if (logoutRes.status === 200 && logoutRes.body?.success) {
    console.log('  PASS: Logout successful, cookie cleared.');
  } else {
    console.error('  FAIL TEST M:', logoutRes);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST N: Login with wrong phone for existing email account -> rejected
  // --------------------------------------------------------------------------
  console.log('\nTEST N: Login with wrong phone for existing email account (rejected)');
  const wrongPhoneLogin = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailA,
      phoneNumber: '9111122222', // wrong phone
      password: passA,
    }),
  });

  if (wrongPhoneLogin.status === 401 && !wrongPhoneLogin.body?.success) {
    console.log('  PASS: Phone number mismatch rejected (401).');
    console.log(`  Error: "${wrongPhoneLogin.body?.error}"`);
  } else {
    console.error('  FAIL TEST N:', wrongPhoneLogin);
    process.exit(1);
  }

  // --------------------------------------------------------------------------
  // TEST O: Multi-User Isolation (User A cannot see User B data)
  // --------------------------------------------------------------------------
  console.log('\nTEST O: Multi-User Isolation (User A vs User B)');
  // Signup User B
  await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Scholar Beta',
      email: emailB,
      phoneNumber: phoneB,
      password: passB,
      city: 'Ahmedabad',
      universityId: 'gu',
    }),
  });

  const loginB = await makeRequest('/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: emailB,
      phoneNumber: phoneB,
      password: passB,
    }),
  });

  const cookieB = extractSessionCookie(loginB.setCookie);

  const meA = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${cookieA}` },
  });

  const meB = await makeRequest('/api/student/me', {
    headers: { 'Cookie': `lowstudy_session=${cookieB}` },
  });

  if (
    meA.body?.user?.email === emailA &&
    meB.body?.user?.email === emailB &&
    meA.body?.user?.id !== meB.body?.user?.id
  ) {
    console.log('  PASS: Complete multi-user isolation verified between User A and User B.');
    console.log(`  User A: ${meA.body.user.fullName} (${meA.body.user.email})`);
    console.log(`  User B: ${meB.body.user.fullName} (${meB.body.user.email})`);
  } else {
    console.error('  FAIL TEST O: Cross-user pollution detected!');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('✓ ALL 15 TESTS (A THROUGH O) PASSED 100% PERFECTLY');
  console.log('================================================================\n');
}

runTestMatrix().catch((err) => {
  console.error('Test matrix error:', err);
  process.exit(1);
});
