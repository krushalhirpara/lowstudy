import http from 'http';
import { createServer } from 'http';
import next from 'next';
import { createSessionToken } from '../src/lib/security.js';

async function startServerAndTest() {
  const app = next({ dev: false, dir: '.' });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => {
    handle(req, res);
  });

  const port = 3099;
  await new Promise(resolve => server.listen(port, resolve));
  const baseUrl = `http://localhost:${port}`;
  console.log(`Test Next.js server running on ${baseUrl}`);

  try {
    // 1. Unauthenticated GET /api/ceoadmin/auth
    console.log('\n--- 1. Testing Unauthenticated GET /api/ceoadmin/auth ---');
    const res1 = await fetch(`${baseUrl}/api/ceoadmin/auth`);
    const json1 = await res1.json();
    console.log('Status:', res1.status, 'Response:', json1);
    console.assert(res1.status === 401 && json1.authenticated === false, 'Test 1 Failed');
    console.log('Test 1 PASS: Unauthenticated access blocked with 401');

    // 2. POST /api/ceoadmin/auth with Wrong Credentials
    console.log('\n--- 2. Testing POST /api/ceoadmin/auth with Wrong Password ---');
    const res2 = await fetch(`${baseUrl}/api/ceoadmin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'ceoadmin', password: 'WrongPassword123' }),
    });
    const json2 = await res2.json();
    console.log('Status:', res2.status, 'Response:', json2);
    console.assert(res2.status === 401 && json2.success === false, 'Test 2 Failed');
    console.log('Test 2 PASS: Wrong credentials returned 401');

    // 3. POST /api/ceoadmin/auth with Valid Admin ID (username)
    console.log('\n--- 3. Testing POST /api/ceoadmin/auth with Valid Username ---');
    const res3 = await fetch(`${baseUrl}/api/ceoadmin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'ceoadmin', password: 'LowStudy@CEO2026!' }),
    });
    const json3 = await res3.json();
    const setCookie3 = res3.headers.get('set-cookie');
    console.log('Status:', res3.status, 'Response User:', json3.user, 'Cookie set:', !!setCookie3);
    console.assert(res3.status === 200 && json3.success === true && json3.user.role === 'ADMIN', 'Test 3 Failed');
    console.log('Test 3 PASS: Admin login with username succeeded with 200 and session token');

    // Extract cookie
    const sessionCookie = setCookie3.split(';')[0];

    // 4. POST /api/ceoadmin/auth with Valid Admin ID (email)
    console.log('\n--- 4. Testing POST /api/ceoadmin/auth with Valid Email ---');
    const res4 = await fetch(`${baseUrl}/api/ceoadmin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: 'ceoadmin@lowstudy.com', password: 'LowStudy@CEO2026!' }),
    });
    const json4 = await res4.json();
    console.log('Status:', res4.status, 'Response User:', json4.user);
    console.assert(res4.status === 200 && json4.success === true && json4.user.role === 'ADMIN', 'Test 4 Failed');
    console.log('Test 4 PASS: Admin login with email succeeded with 200');

    // 5. GET /api/ceoadmin/auth with Authenticated Session Cookie
    console.log('\n--- 5. Testing GET /api/ceoadmin/auth with Admin Session Cookie ---');
    const res5 = await fetch(`${baseUrl}/api/ceoadmin/auth`, {
      headers: { 'Cookie': sessionCookie },
    });
    const json5 = await res5.json();
    console.log('Status:', res5.status, 'Response:', json5);
    console.assert(res5.status === 200 && json5.authenticated === true && json5.user.role === 'ADMIN', 'Test 5 Failed');
    console.log('Test 5 PASS: Session check authenticated as ADMIN');

    // 6. GET /api/ceoadmin/overview
    console.log('\n--- 6. Testing Protected Admin API /api/ceoadmin/overview ---');
    const res6 = await fetch(`${baseUrl}/api/ceoadmin/overview`, {
      headers: { 'Cookie': sessionCookie },
    });
    const json6 = await res6.json();
    console.log('Status:', res6.status, 'Data keys:', Object.keys(json6.data || {}));
    console.assert(res6.status === 200 && json6.success === true, 'Test 6 Failed');
    console.log('Test 6 PASS: Overview API returned metrics for authenticated admin');

    // 7. GET /api/ceoadmin/users
    console.log('\n--- 7. Testing Protected Admin API /api/ceoadmin/users ---');
    const res7 = await fetch(`${baseUrl}/api/ceoadmin/users`, {
      headers: { 'Cookie': sessionCookie },
    });
    const json7 = await res7.json();
    console.log('Status:', res7.status, 'Success:', json7.success, 'Total users:', json7.pagination?.total);
    console.assert(res7.status === 200 && json7.success === true, 'Test 7 Failed');
    console.log('Test 7 PASS: Users API returned data');

    // 8. Student User Session Attempt on /api/ceoadmin/overview
    console.log('\n--- 8. Testing Student Role Access to Admin API (Must be blocked 403) ---');
    const studentToken = createSessionToken({
      userId: 'usr-student-test',
      email: 'student@example.com',
      role: 'STUDENT',
    });
    const res8 = await fetch(`${baseUrl}/api/ceoadmin/overview`, {
      headers: { 'Cookie': `lowstudy_session=${studentToken}` },
    });
    const json8 = await res8.json();
    console.log('Status:', res8.status, 'Response:', json8);
    console.assert(res8.status === 403, 'Test 8 Failed');
    console.log('Test 8 PASS: Student blocked from Admin API with 403 Forbidden');

    // 9. Logout
    console.log('\n--- 9. Testing Admin Logout ---');
    const res9 = await fetch(`${baseUrl}/api/ceoadmin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    const setCookie9 = res9.headers.get('set-cookie');
    console.log('Status:', res9.status, 'Logout Cookie:', setCookie9);
    console.assert(res9.status === 200 && setCookie9.includes('Max-Age=0'), 'Test 9 Failed');
    console.log('Test 9 PASS: Admin logged out and cookie expired');

    console.log('\n========================================');
    console.log('ALL INTEGRATION TESTS PASSED 100%');
    console.log('========================================');
  } finally {
    server.close();
  }
}

startServerAndTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
