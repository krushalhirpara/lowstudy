import prisma from '../src/lib/prisma.js';
import {
  getStudentDashboardData,
  calculateStudyStreak
} from '../src/lib/services/studentDashboardService.js';
import { getSafeRedirectUrl, createSessionToken } from '../src/lib/security.js';

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive LowStudy Real Data & Post-Login Redirect Test Suite...\n');

  const timestamp = Date.now();
  const studentAId = `test-student-a-${timestamp}`;
  const studentBId = `test-student-b-${timestamp}`;
  const studentAEmail = `student.a.${timestamp}@law.in`;
  const studentBEmail = `student.b.${timestamp}@law.in`;

  try {
    // 0. Ensure Universities and Semester 3 Subjects exist
    const testUni = await prisma.university.upsert({
      where: { id: 'su' },
      update: {},
      create: {
        id: 'su',
        name: 'Saurashtra University',
        code: 'SU',
        city: 'Rajkot',
        state: 'Gujarat'
      }
    });

    const testCourse = await prisma.course.upsert({
      where: { id: 'su-llb-3yr' },
      update: {},
      create: {
        id: 'su-llb-3yr',
        universityId: 'su',
        name: '3-Year LL.B.',
        code: 'LLB-3YR',
        totalSemesters: 6
      }
    });

    const testSemester = await prisma.semester.upsert({
      where: { id: 'su-llb-3yr-sem3' },
      update: {},
      create: {
        id: 'su-llb-3yr-sem3',
        courseId: 'su-llb-3yr',
        semesterNumber: 3,
        title: 'Semester 3'
      }
    });

    // Create fresh Student A (New User with 0 activity)
    const userA = await prisma.user.create({
      data: {
        id: studentAId,
        email: studentAEmail,
        fullName: 'Test Student Alpha',
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

    // Create fresh Student B (Isolated User)
    const userB = await prisma.user.create({
      data: {
        id: studentBId,
        email: studentBEmail,
        fullName: 'Test Student Beta',
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

    // =========================================================================
    // TEST 1: Fresh New User Dashboard -> All Activity Metrics Zero / Empty
    // =========================================================================
    console.log('1️⃣  TEST 1: New User Dashboard -> Zero / Empty Metrics...');
    const freshDashA = await getStudentDashboardData(studentAId);

    if (freshDashA.coreMetrics.questionsSolved !== 0) {
      throw new Error(`Expected questionsSolved to be 0, got ${freshDashA.coreMetrics.questionsSolved}`);
    }
    if (freshDashA.coreMetrics.mcqsSolved !== 0) {
      throw new Error(`Expected mcqsSolved to be 0, got ${freshDashA.coreMetrics.mcqsSolved}`);
    }
    if (freshDashA.coreMetrics.mockTestsCompleted !== 0) {
      throw new Error(`Expected mockTestsCompleted to be 0, got ${freshDashA.coreMetrics.mockTestsCompleted}`);
    }
    if (freshDashA.coreMetrics.studyStreak !== 0) {
      throw new Error(`Expected studyStreak to be 0, got ${freshDashA.coreMetrics.studyStreak}`);
    }
    if (freshDashA.overallPreparationPercentage !== 0) {
      throw new Error(`Expected overallPreparationPercentage to be 0, got ${freshDashA.overallPreparationPercentage}`);
    }
    if (freshDashA.sections.todaysStudyPlan.length !== 0) {
      throw new Error(`Expected todaysStudyPlan to be empty, got ${freshDashA.sections.todaysStudyPlan.length}`);
    }
    if (freshDashA.sections.weakTopics.length !== 0) {
      throw new Error(`Expected weakTopics to be empty, got ${freshDashA.sections.weakTopics.length}`);
    }
    if (freshDashA.sections.recentTests.length !== 0) {
      throw new Error(`Expected recentTests to be empty, got ${freshDashA.sections.recentTests.length}`);
    }
    if (freshDashA.sections.bookmarks.length !== 0) {
      throw new Error(`Expected bookmarks to be empty, got ${freshDashA.sections.bookmarks.length}`);
    }
    if (freshDashA.sections.wrongAnswers.totalMistakes !== 0) {
      throw new Error(`Expected wrongAnswers to be 0, got ${freshDashA.sections.wrongAnswers.totalMistakes}`);
    }
    if (freshDashA.sections.quickRevision.totalDue !== 0) {
      throw new Error(`Expected quickRevision to be 0, got ${freshDashA.sections.quickRevision.totalDue}`);
    }
    if (freshDashA.sections.continuePreparation !== null) {
      throw new Error(`Expected continuePreparation to be null, got ${JSON.stringify(freshDashA.sections.continuePreparation)}`);
    }
    console.log('   ✅ PASS: Fresh new user sees all metrics at exactly 0 / empty.');

    // Find or create sample question and MCQ for real tests
    let sampleQuestion = await prisma.question.findFirst({
      include: { topic: { include: { unit: { include: { subject: true } } } } }
    });
    if (!sampleQuestion) {
      // Ensure a subject and topic exist
      let sampleSubject = await prisma.subject.findFirst({ where: { semesterId: 'su-llb-3yr-sem3' } });
      if (!sampleSubject) {
        sampleSubject = await prisma.subject.create({
          data: {
            id: `subj-test-${timestamp}`,
            universityId: 'su',
            courseId: 'su-llb-3yr',
            semesterId: 'su-llb-3yr-sem3',
            title: 'Labour & Industrial Law - I',
            shortCode: '220301'
          }
        });
      }
      let sampleUnit = await prisma.unit.findFirst({ where: { subjectId: sampleSubject.id } });
      if (!sampleUnit) {
        sampleUnit = await prisma.unit.create({
          data: {
            id: `unit-test-${timestamp}`,
            subjectId: sampleSubject.id,
            unitNumber: 1,
            title: 'Industrial Disputes Act'
          }
        });
      }
      let sampleTopic = await prisma.topic.findFirst({ where: { unitId: sampleUnit.id } });
      if (!sampleTopic) {
        sampleTopic = await prisma.topic.create({
          data: {
            id: `topic-test-${timestamp}`,
            unitId: sampleUnit.id,
            topicNumber: 1,
            title: 'Scope of Industry'
          }
        });
      }
      sampleQuestion = await prisma.question.create({
        data: {
          id: `q-test-${timestamp}`,
          topicId: sampleTopic.id,
          questionText: 'Analyze Section 2(j) Industry definition.'
        },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
    }

    let sampleMcq = await prisma.mcq.findFirst();
    if (!sampleMcq) {
      sampleMcq = await prisma.mcq.create({
        data: {
          id: `mcq-test-${timestamp}`,
          topicId: sampleQuestion.topicId,
          subjectId: sampleQuestion.topic?.unit?.subjectId,
          questionText: 'Which case is landmark for industry?',
          explanation: 'Bangalore water supply'
        }
      });
    }

    // =========================================================================
    // TEST 2: Complete 1 Question -> Questions Solved = 1
    // =========================================================================
    console.log('\n2️⃣  TEST 2: Complete 1 Question Attempt...');
    await prisma.answerPracticeAttempt.create({
      data: {
        userId: studentAId,
        questionId: sampleQuestion.id,
        studentAnswer: 'The definition of industry under Section 2(j) was interpreted in Bangalore Water Supply case...',
        evaluationJson: JSON.stringify({ score: 85, feedback: 'Well structured' }),
        wordCount: 150,
        timeSpentSecs: 300,
        status: 'SAVED'
      }
    });

    const dashAfter1Question = await getStudentDashboardData(studentAId);
    if (dashAfter1Question.coreMetrics.questionsSolved !== 1) {
      throw new Error(`Expected questionsSolved to be 1, got ${dashAfter1Question.coreMetrics.questionsSolved}`);
    }
    console.log(`   ✅ PASS: Questions Solved = ${dashAfter1Question.coreMetrics.questionsSolved}`);

    // =========================================================================
    // TEST 3: Complete 5 MCQs -> MCQs Solved = 5
    // =========================================================================
    console.log('\n3️⃣  TEST 3: Complete 5 MCQs...');
    const testAttempt1 = await prisma.testAttempt.create({
      data: {
        userId: studentAId,
        practiceMode: 'TIMED_QUIZ',
        score: 4,
        totalQuestions: 5,
        correctCount: 4,
        incorrectCount: 1,
        timeTakenSeconds: 120
      }
    });

    for (let i = 0; i < 5; i++) {
      await prisma.testAnswer.create({
        data: {
          attemptId: testAttempt1.id,
          mcqId: sampleMcq.id,
          selectedOptionKey: i === 4 ? 'B' : 'A',
          isCorrect: i !== 4,
          timeSpentSeconds: 20
        }
      });
    }

    const dashAfter5Mcqs = await getStudentDashboardData(studentAId);
    if (dashAfter5Mcqs.coreMetrics.mcqsSolved !== 5) {
      throw new Error(`Expected mcqsSolved to be 5, got ${dashAfter5Mcqs.coreMetrics.mcqsSolved}`);
    }
    console.log(`   ✅ PASS: MCQs Solved = ${dashAfter5Mcqs.coreMetrics.mcqsSolved}`);

    // =========================================================================
    // TEST 4: Complete 1 Mock Test -> Mock Tests = 1
    // =========================================================================
    console.log('\n4️⃣  TEST 4: Complete 1 Mock Test...');
    let sampleMock = await prisma.mockTest.findFirst();
    if (!sampleMock) {
      sampleMock = await prisma.mockTest.create({
        data: {
          id: `mock-test-${timestamp}`,
          title: 'Semester 3 Practice Mock Test',
          durationMinutes: 30,
          totalMarks: 30
        }
      });
    }

    await prisma.testAttempt.create({
      data: {
        userId: studentAId,
        mockTestId: sampleMock.id,
        practiceMode: 'FULL_MOCK_TEST',
        score: 24,
        totalQuestions: 30,
        correctCount: 24,
        incorrectCount: 6,
        timeTakenSeconds: 1800
      }
    });

    const dashAfterMock = await getStudentDashboardData(studentAId);
    if (dashAfterMock.coreMetrics.mockTestsCompleted !== 1) {
      throw new Error(`Expected mockTestsCompleted to be 1, got ${dashAfterMock.coreMetrics.mockTestsCompleted}`);
    }
    console.log(`   ✅ PASS: Mock Tests Completed = ${dashAfterMock.coreMetrics.mockTestsCompleted}`);

    // =========================================================================
    // TEST 5 & 6: Study Streak Calculation (1 Day & Consecutive Days)
    // =========================================================================
    console.log('\n5️⃣  TEST 5 & 6: Study Streak Calculation...');
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);

    // Activity only today -> Streak = 1
    const streakTodayOnly = calculateStudyStreak([today]);
    if (streakTodayOnly !== 1) {
      throw new Error(`Expected streak to be 1 for today-only activity, got ${streakTodayOnly}`);
    }

    // Activity on today, yesterday, 2 days ago -> Streak = 3
    const streak3Days = calculateStudyStreak([threeDaysAgo, twoDaysAgo, yesterday, today]);
    if (streak3Days !== 4) {
      throw new Error(`Expected streak to be 4 for 4 consecutive days, got ${streak3Days}`);
    }

    // Activity missed yesterday & today (last active 3 days ago) -> Streak = 0
    const streakBroken = calculateStudyStreak([threeDaysAgo]);
    if (streakBroken !== 0) {
      throw new Error(`Expected streak to reset to 0 when inactive, got ${streakBroken}`);
    }
    console.log('   ✅ PASS: Study Streak accurately calculates consecutive active days and resets on inactivity.');

    // =========================================================================
    // TEST 7: Weak Topics from Real Mistakes / Low Confidence
    // =========================================================================
    console.log('\n7️⃣  TEST 7: Weak Topics from Real Low Confidence / Mistakes...');
    await prisma.studyProgress.create({
      data: {
        userId: studentAId,
        topicId: sampleQuestion.topicId,
        confidenceLevel: 'LOW',
        isCompleted: false,
        timeSpentSeconds: 400
      }
    });

    const dashWithWeak = await getStudentDashboardData(studentAId);
    if (dashWithWeak.sections.weakTopics.length === 0) {
      throw new Error('Expected weakTopics to contain the low-confidence topic');
    }
    console.log(`   ✅ PASS: Weak Topics identified from real student low confidence: "${dashWithWeak.sections.weakTopics[0].title}"`);

    // =========================================================================
    // TEST 8: Data Ownership / User Isolation: Student A vs Student B
    // =========================================================================
    console.log('\n8️⃣  TEST 8: Strict User Data Isolation...');
    const dashB = await getStudentDashboardData(studentBId);

    if (dashB.coreMetrics.questionsSolved !== 0) {
      throw new Error(`Student B should have 0 questions solved, but saw ${dashB.coreMetrics.questionsSolved}`);
    }
    if (dashB.coreMetrics.mcqsSolved !== 0) {
      throw new Error(`Student B should have 0 MCQs solved, but saw ${dashB.coreMetrics.mcqsSolved}`);
    }
    if (dashB.coreMetrics.mockTestsCompleted !== 0) {
      throw new Error(`Student B should have 0 mock tests, but saw ${dashB.coreMetrics.mockTestsCompleted}`);
    }
    if (dashB.sections.weakTopics.length !== 0) {
      throw new Error(`Student B should have 0 weak topics, but saw ${dashB.sections.weakTopics.length}`);
    }
    console.log('   ✅ PASS: Student B cannot see any of Student A\'s data. Complete user isolation verified.');

    // =========================================================================
    // TEST 9: Post-Login Redirect Logic (Direct, Safe Redirect, Google, Open Redirect Protection)
    // =========================================================================
    console.log('\n9️⃣  TEST 9: Post-Login Redirect Security & Defaults...');

    // A. Direct Email Login (No redirect param) -> '/'
    const redirectDirect = getSafeRedirectUrl(null, '/');
    if (redirectDirect !== '/') {
      throw new Error(`Expected direct login redirect to be '/', got '${redirectDirect}'`);
    }

    // B. Direct Google Login (Empty redirect) -> '/'
    const redirectGoogleDirect = getSafeRedirectUrl('', '/');
    if (redirectGoogleDirect !== '/') {
      throw new Error(`Expected direct Google redirect to be '/', got '${redirectGoogleDirect}'`);
    }

    // C. Protected Page Flow -> Original Destination
    const redirectProtectedSubjects = getSafeRedirectUrl('/subjects', '/');
    if (redirectProtectedSubjects !== '/subjects') {
      throw new Error(`Expected safe redirect to '/subjects', got '${redirectProtectedSubjects}'`);
    }

    // D. Protected Curriculum Flow -> /saurashtra-university/llb/semester-3
    const redirectCurriculum = getSafeRedirectUrl('/saurashtra-university/llb/semester-3', '/');
    if (redirectCurriculum !== '/saurashtra-university/llb/semester-3') {
      throw new Error(`Expected safe redirect to '/saurashtra-university/llb/semester-3', got '${redirectCurriculum}'`);
    }

    // E. Open Redirect Attack Block -> Falls back to '/'
    const maliciousUrl1 = 'https://evil-site.com';
    const blocked1 = getSafeRedirectUrl(maliciousUrl1, '/');
    if (blocked1 !== '/') {
      throw new Error(`Expected open redirect '${maliciousUrl1}' to be blocked to '/', got '${blocked1}'`);
    }

    const maliciousUrl2 = '//evil-site.com/steal';
    const blocked2 = getSafeRedirectUrl(maliciousUrl2, '/');
    if (blocked2 !== '/') {
      throw new Error(`Expected protocol-relative redirect '${maliciousUrl2}' to be blocked to '/', got '${blocked2}'`);
    }

    const maliciousUrl3 = 'javascript:alert(1)';
    const blocked3 = getSafeRedirectUrl(maliciousUrl3, '/');
    if (blocked3 !== '/') {
      throw new Error(`Expected javascript: scheme '${maliciousUrl3}' to be blocked to '/', got '${blocked3}'`);
    }

    // F. Loop prevention: /login and /signup redirect back to '/'
    const redirectLoop1 = getSafeRedirectUrl('/login', '/');
    if (redirectLoop1 !== '/') {
      throw new Error(`Expected loop redirect to '/login' to fallback to '/', got '${redirectLoop1}'`);
    }
    const redirectLoop2 = getSafeRedirectUrl('/signup', '/');
    if (redirectLoop2 !== '/') {
      throw new Error(`Expected loop redirect to '/signup' to fallback to '/', got '${redirectLoop2}'`);
    }
    console.log('   ✅ PASS: Default post-login destination is strictly `/` and open redirects are blocked.');

    console.log('\n🎉 ALL REAL DASHBOARD & AUTH REDIRECT TESTS PASSED PERFECTLY!\n');
  } finally {
    // Clean up test users
    await prisma.testAnswer.deleteMany({ where: { attempt: { userId: studentAId } } }).catch(() => {});
    await prisma.testAttempt.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.answerPracticeAttempt.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.studyProgress.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.wrongAnswer.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.bookmark.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.revisionItem.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.studyPlan.deleteMany({ where: { userId: studentAId } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [studentAId, studentBId] } } }).catch(() => {});
    await prisma.$disconnect();
  }
}

runComprehensiveTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
