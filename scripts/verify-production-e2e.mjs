import prisma from '../src/lib/prisma.js';

async function testProductionE2E() {
  console.log('🧪 Starting Live Production Server E2E Verification on http://localhost:3000...\n');

  const timestamp = Date.now();
  const testStudentEmail = `live.student.${timestamp}@law.in`;
  const testPassword = 'Password123!';
  const testStudentBEmail = `live.student.b.${timestamp}@law.in`;

  // Step 1: Signup fresh Student A via production API
  console.log('1️⃣  Testing POST /api/student/session (Signup fresh user)...');
  const signupRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'signup',
      fullName: 'Live Test Student',
      email: testStudentEmail,
      password: testPassword,
      city: 'Rajkot',
      universityId: 'su'
    })
  });

  const signupData = await signupRes.json();
  if (!signupRes.ok || !signupData.success) {
    throw new Error(`Signup failed: ${signupData.error}`);
  }
  if (signupData.redirectUrl !== '/') {
    throw new Error(`Expected signup redirectUrl to be '/', got: '${signupData.redirectUrl}'`);
  }
  console.log(`   ✅ PASS: Signup successful, default redirectUrl = '${signupData.redirectUrl}'`);

  // Step 2: Direct Email Login (No redirect param)
  console.log('\n2️⃣  Testing POST /api/student/session (Direct Email Login without redirect)...');
  const loginRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testStudentEmail,
      password: testPassword
    })
  });

  const loginData = await loginRes.json();
  const rawCookies = loginRes.headers.get('set-cookie');
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Login failed: ${loginData.error}`);
  }
  if (loginData.redirectUrl !== '/') {
    throw new Error(`Expected direct login redirectUrl to be '/', got: '${loginData.redirectUrl}'`);
  }
  if (!rawCookies || !rawCookies.includes('lowstudy_session=')) {
    throw new Error('Expected lowstudy_session cookie to be set in response headers');
  }
  const sessionCookie = rawCookies.split(';')[0];
  console.log(`   ✅ PASS: Direct login returned redirectUrl = '${loginData.redirectUrl}' and HttpOnly cookie.`);

  // Step 3: Direct Google Login (No redirect param)
  console.log('\n3️⃣  Testing POST /api/student/session (Direct Google Login without redirect)...');
  const googleLoginRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'google',
      firebaseUid: `google-uid-${timestamp}`,
      email: `google.student.${timestamp}@law.in`,
      fullName: 'Google Student',
      city: 'Rajkot',
      universityId: 'su'
    })
  });
  const googleData = await googleLoginRes.json();
  if (!googleLoginRes.ok || !googleData.success) {
    throw new Error(`Google login failed: ${googleData.error}`);
  }
  if (googleData.redirectUrl !== '/') {
    throw new Error(`Expected Google login redirectUrl to be '/', got: '${googleData.redirectUrl}'`);
  }
  console.log(`   ✅ PASS: Google login returned redirectUrl = '${googleData.redirectUrl}'`);

  // Step 4: Login with safe redirect parameter (/subjects)
  console.log('\n4️⃣  Testing POST /api/student/session (Login with redirect=/subjects)...');
  const safeRedirectRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testStudentEmail,
      password: testPassword,
      redirectUrl: '/subjects'
    })
  });
  const safeRedirectData = await safeRedirectRes.json();
  if (safeRedirectData.redirectUrl !== '/subjects') {
    throw new Error(`Expected redirectUrl = '/subjects', got: '${safeRedirectData.redirectUrl}'`);
  }
  console.log(`   ✅ PASS: Safe redirect preserved: '${safeRedirectData.redirectUrl}'`);

  // Step 5: Login with curriculum redirect parameter (/saurashtra-university/llb/semester-3)
  console.log('\n5️⃣  Testing POST /api/student/session (Login with curriculum redirect)...');
  const curriculumRedirectRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testStudentEmail,
      password: testPassword,
      redirectUrl: '/saurashtra-university/llb/semester-3'
    })
  });
  const curriculumRedirectData = await curriculumRedirectRes.json();
  if (curriculumRedirectData.redirectUrl !== '/saurashtra-university/llb/semester-3') {
    throw new Error(`Expected redirectUrl = '/saurashtra-university/llb/semester-3', got: '${curriculumRedirectData.redirectUrl}'`);
  }
  console.log(`   ✅ PASS: Protected curriculum redirect preserved: '${curriculumRedirectData.redirectUrl}'`);

  // Step 6: Open redirect attack protection
  console.log('\n6️⃣  Testing POST /api/student/session (Malicious open redirect attack)...');
  const maliciousRes = await fetch('http://localhost:3000/api/student/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: testStudentEmail,
      password: testPassword,
      redirectUrl: 'https://malicious-phishing-site.com/steal'
    })
  });
  const maliciousData = await maliciousRes.json();
  if (maliciousData.redirectUrl !== '/') {
    throw new Error(`Expected malicious redirect to be blocked to '/', got: '${maliciousData.redirectUrl}'`);
  }
  console.log(`   ✅ PASS: Open redirect sanitized to: '${maliciousData.redirectUrl}'`);

  // Step 7: Unauthenticated Dashboard API Access -> Status 401
  console.log('\n7️⃣  Testing GET /api/student/dashboard (Unauthenticated)...');
  const unauthDashRes = await fetch('http://localhost:3000/api/student/dashboard');
  if (unauthDashRes.status !== 401) {
    throw new Error(`Expected status 401 for unauthenticated request, got: ${unauthDashRes.status}`);
  }
  console.log(`   ✅ PASS: Unauthenticated API access correctly returned HTTP 401.`);

  // Step 8: Authenticated Fresh Student Dashboard API Access -> All pure 0 metrics
  console.log('\n8️⃣  Testing GET /api/student/dashboard (Authenticated Fresh Student)...');
  const authDashRes = await fetch('http://localhost:3000/api/student/dashboard', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  if (!authDashRes.ok) {
    throw new Error(`Authenticated dashboard request failed with status: ${authDashRes.status}`);
  }
  const dashPayload = await authDashRes.json();
  const metrics = dashPayload.data.coreMetrics;

  if (metrics.questionsSolved !== 0) {
    throw new Error(`Expected questionsSolved to be 0, got ${metrics.questionsSolved}`);
  }
  if (metrics.mcqsSolved !== 0) {
    throw new Error(`Expected mcqsSolved to be 0, got ${metrics.mcqsSolved}`);
  }
  if (metrics.mockTestsCompleted !== 0) {
    throw new Error(`Expected mockTestsCompleted to be 0, got ${metrics.mockTestsCompleted}`);
  }
  if (metrics.studyStreak !== 0) {
    throw new Error(`Expected studyStreak to be 0, got ${metrics.studyStreak}`);
  }
  if (dashPayload.data.overallPreparationPercentage !== 0) {
    throw new Error(`Expected overallPreparationPercentage to be 0, got ${dashPayload.data.overallPreparationPercentage}`);
  }
  if (dashPayload.data.sections.todaysStudyPlan.length !== 0) {
    throw new Error(`Expected todaysStudyPlan to be empty, got ${dashPayload.data.sections.todaysStudyPlan.length}`);
  }
  if (dashPayload.data.sections.weakTopics.length !== 0) {
    throw new Error(`Expected weakTopics to be empty, got ${dashPayload.data.sections.weakTopics.length}`);
  }
  if (dashPayload.data.sections.wrongAnswers.totalMistakes !== 0) {
    throw new Error(`Expected totalMistakes to be 0, got ${dashPayload.data.sections.wrongAnswers.totalMistakes}`);
  }
  if (dashPayload.data.sections.recentTests.length !== 0) {
    throw new Error(`Expected recentTests to be empty, got ${dashPayload.data.sections.recentTests.length}`);
  }
  if (dashPayload.data.sections.bookmarks.length !== 0) {
    throw new Error(`Expected bookmarks to be empty, got ${dashPayload.data.sections.bookmarks.length}`);
  }
  if (dashPayload.data.sections.quickRevision.totalDue !== 0) {
    throw new Error(`Expected quickRevision to be 0, got ${dashPayload.data.sections.quickRevision.totalDue}`);
  }
  if (dashPayload.data.sections.continuePreparation !== null) {
    throw new Error(`Expected continuePreparation to be null, got ${JSON.stringify(dashPayload.data.sections.continuePreparation)}`);
  }
  console.log('   ✅ PASS: Fresh student dashboard has 0 fake stats across all metrics:');
  console.log(`      - Questions Solved: ${metrics.questionsSolved}`);
  console.log(`      - MCQs Solved: ${metrics.mcqsSolved}`);
  console.log(`      - Mock Tests: ${metrics.mockTestsCompleted}`);
  console.log(`      - Study Streak: ${metrics.studyStreak} Days`);
  console.log(`      - Overall Preparation: ${dashPayload.data.overallPreparationPercentage}%`);
  console.log(`      - Weak Topics: ${dashPayload.data.sections.weakTopics.length}`);
  console.log(`      - Mistakes: ${dashPayload.data.sections.wrongAnswers.totalMistakes}`);
  console.log(`      - Recent Tests: ${dashPayload.data.sections.recentTests.length}`);
  console.log(`      - Bookmarks: ${dashPayload.data.sections.bookmarks.length}`);

  // Step 9: Perform real activity and verify dynamic dashboard update
  console.log('\n9️⃣  Testing Real Activity Reflection on Dashboard...');
  const userRecord = await prisma.user.findUnique({ where: { email: testStudentEmail } });
  const sampleQ = await prisma.question.findFirst();
  const sampleMcq = await prisma.mcq.findFirst();

  // Complete 1 question
  await prisma.answerPracticeAttempt.create({
    data: {
      userId: userRecord.id,
      questionId: sampleQ.id,
      studentAnswer: 'Legal analysis of statutory provisions...',
      evaluationJson: '{}',
      wordCount: 100,
      timeSpentSecs: 200,
      status: 'SAVED'
    }
  });

  // Complete 3 MCQs
  const attempt = await prisma.testAttempt.create({
    data: {
      userId: userRecord.id,
      practiceMode: 'TIMED_QUIZ',
      score: 3,
      totalQuestions: 3,
      correctCount: 3,
      incorrectCount: 0,
      timeTakenSeconds: 60
    }
  });
  for (let i = 0; i < 3; i++) {
    await prisma.testAnswer.create({
      data: {
        attemptId: attempt.id,
        mcqId: sampleMcq.id,
        selectedOptionKey: 'A',
        isCorrect: true,
        timeSpentSeconds: 20
      }
    });
  }

  // Fetch dashboard again
  const updatedDashRes = await fetch('http://localhost:3000/api/student/dashboard', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  const updatedDashPayload = await updatedDashRes.json();
  const updatedMetrics = updatedDashPayload.data.coreMetrics;

  if (updatedMetrics.questionsSolved !== 1) {
    throw new Error(`Expected questionsSolved = 1, got: ${updatedMetrics.questionsSolved}`);
  }
  if (updatedMetrics.mcqsSolved !== 3) {
    throw new Error(`Expected mcqsSolved = 3, got: ${updatedMetrics.mcqsSolved}`);
  }
  if (updatedMetrics.studyStreak !== 1) {
    throw new Error(`Expected studyStreak = 1, got: ${updatedMetrics.studyStreak}`);
  }
  console.log('   ✅ PASS: Real student activity dynamically reflected:');
  console.log(`      - Questions Solved: ${updatedMetrics.questionsSolved}`);
  console.log(`      - MCQs Solved: ${updatedMetrics.mcqsSolved}`);
  console.log(`      - Study Streak: ${updatedMetrics.studyStreak} Day`);

  // Step 10: Verify Middleware protection on /dashboard for unauthenticated requests
  console.log('\n🔟 Testing Middleware Protection on /dashboard (Unauthenticated)...');
  const unauthPageRes = await fetch('http://localhost:3000/dashboard', {
    redirect: 'manual'
  });
  const redirectLocation = unauthPageRes.headers.get('location');
  if (unauthPageRes.status !== 307 && unauthPageRes.status !== 302 && unauthPageRes.status !== 308) {
    throw new Error(`Expected redirect status (307/302) for unauthenticated /dashboard, got: ${unauthPageRes.status}`);
  }
  if (!redirectLocation || !redirectLocation.includes('/signup?redirect=%2Fdashboard') && !redirectLocation.includes('/signup?redirect=/dashboard')) {
    throw new Error(`Expected redirect to signup with redirect parameter, got: ${redirectLocation}`);
  }
  console.log(`   ✅ PASS: Unauthenticated access to /dashboard redirected to: '${redirectLocation}'`);

  console.log('\n🎉 ALL LIVE PRODUCTION SERVER E2E VERIFICATIONS PASSED!\n');
}

testProductionE2E()
  .catch(err => {
    console.error('❌ E2E verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
