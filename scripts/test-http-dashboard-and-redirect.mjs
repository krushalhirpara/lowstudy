import prisma from '../src/lib/prisma.js';
import { hashPassword, createSessionToken } from '../src/lib/security.js';

async function runHttpDashboardTests() {
  console.log('🌐 Starting HTTP API Route & Cookie Verification Tests...\n');

  const timestamp = Date.now();
  const testEmail = `http.student.${timestamp}@law.in`;
  const testPassword = 'Password123!';
  const { hash, salt } = hashPassword(testPassword);

  const studentA = await prisma.user.create({
    data: {
      id: `usr-http-a-${timestamp}`,
      email: testEmail,
      passwordHash: `${salt}:${hash}`,
      fullName: 'HTTP Test Student',
      universityId: 'su',
      courseId: 'su-llb-3yr',
      semesterId: 'su-llb-3yr-sem3',
      city: 'Rajkot',
      role: 'STUDENT',
      streakDays: 0,
      xp: 0,
      coins: 0,
      isActive: true
    }
  });

  try {
    // 1. Test Session Route POST: Login without redirect -> redirectUrl must be '/'
    console.log('1️⃣  Testing POST /api/student/session (Direct login without redirect)...');
    const { POST: sessionPost } = await import('../src/app/api/student/session/route.js');
    
    const req1 = new Request('http://localhost:3000/api/student/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: testEmail,
        password: testPassword
      })
    });

    const res1 = await sessionPost(req1);
    const data1 = await res1.json();

    if (!data1.success || data1.redirectUrl !== '/') {
      throw new Error(`Expected login redirectUrl to be '/', got: '${data1.redirectUrl}'`);
    }
    console.log(`   ✅ PASS: Direct login returns redirectUrl: '${data1.redirectUrl}'`);

    // 2. Test Session Route POST: Login with redirect=/subjects
    console.log('\n2️⃣  Testing POST /api/student/session (With redirect=/subjects)...');
    const req2 = new Request('http://localhost:3000/api/student/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: testEmail,
        password: testPassword,
        redirectUrl: '/subjects'
      })
    });

    const res2 = await sessionPost(req2);
    const data2 = await res2.json();

    if (!data2.success || data2.redirectUrl !== '/subjects') {
      throw new Error(`Expected login redirectUrl to be '/subjects', got: '${data2.redirectUrl}'`);
    }
    console.log(`   ✅ PASS: Safe redirect preserved: '${data2.redirectUrl}'`);

    // 3. Test Session Route POST: Login with open redirect attack -> fallback to '/'
    console.log('\n3️⃣  Testing POST /api/student/session (Open redirect attack prevention)...');
    const req3 = new Request('http://localhost:3000/api/student/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: testEmail,
        password: testPassword,
        redirectUrl: 'https://attacker.com'
      })
    });

    const res3 = await sessionPost(req3);
    const data3 = await res3.json();

    if (!data3.success || data3.redirectUrl !== '/') {
      throw new Error(`Expected malicious redirect to be blocked to '/', got: '${data3.redirectUrl}'`);
    }
    console.log(`   ✅ PASS: Malicious redirect sanitized to: '${data3.redirectUrl}'`);

    // 4. Test GET /api/student/dashboard without auth -> Status 401 Unauthorized
    console.log('\n4️⃣  Testing GET /api/student/dashboard (Unauthenticated)...');
    const { GET: dashboardGet } = await import('../src/app/api/student/dashboard/route.js');

    const unauthReq = new Request('http://localhost:3000/api/student/dashboard', {
      method: 'GET'
    });

    const unauthRes = await dashboardGet(unauthReq);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected status 401 for unauthenticated dashboard request, got: ${unauthRes.status}`);
    }
    console.log(`   ✅ PASS: Unauthenticated dashboard access correctly rejected with HTTP ${unauthRes.status}`);

    // 5. Test GET /api/student/dashboard with valid student session cookie
    console.log('\n5️⃣  Testing GET /api/student/dashboard (Authenticated fresh student)...');
    const tokenA = createSessionToken({
      userId: studentA.id,
      email: studentA.email,
      role: studentA.role,
      universityId: studentA.universityId
    });

    const authReq = new Request('http://localhost:3000/api/student/dashboard', {
      method: 'GET',
      headers: {
        'Cookie': `lowstudy_session=${tokenA}`
      }
    });

    const authRes = await dashboardGet(authReq);
    if (authRes.status !== 200) {
      throw new Error(`Expected status 200 for authenticated dashboard request, got: ${authRes.status}`);
    }
    const dashData = await authRes.json();
    if (!dashData.success || dashData.data.coreMetrics.questionsSolved !== 0) {
      throw new Error(`Expected fresh student metrics to be 0, got questionsSolved: ${dashData.data.coreMetrics.questionsSolved}`);
    }
    console.log(`   ✅ PASS: Authenticated fresh student dashboard returned HTTP 200 with pure 0 metrics:`);
    console.log(`      - Questions Solved: ${dashData.data.coreMetrics.questionsSolved}`);
    console.log(`      - MCQs Solved: ${dashData.data.coreMetrics.mcqsSolved}`);
    console.log(`      - Mock Tests: ${dashData.data.coreMetrics.mockTestsCompleted}`);
    console.log(`      - Study Streak: ${dashData.data.coreMetrics.studyStreak} Days`);
    console.log(`      - Overall Preparation: ${dashData.data.overallPreparationPercentage}%`);

    console.log('\n🎉 ALL HTTP API ROUTE TESTS PASSED WITH 100% SUCCESS!\n');
  } finally {
    await prisma.user.delete({ where: { id: studentA.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

runHttpDashboardTests().catch(err => {
  console.error('❌ HTTP test suite failed:', err);
  process.exit(1);
});
