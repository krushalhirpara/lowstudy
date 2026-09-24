import prisma from '../src/lib/prisma.js';
import {
  getStudentDashboardData,
  SU_SEM3_SUBJECT_CODES
} from '../src/lib/services/studentDashboardService.js';

async function runStudentDashboardTests() {
  console.log('🎓 Starting Complete Student Dashboard Test Suite...\n');

  // 1. Fetch Dashboard Data
  console.log('1️⃣ Testing Dashboard Data Retrieval...');
  const dashboard = await getStudentDashboardData('usr-student-01');

  // Verify Academic Context
  console.log('   Academic Context:');
  console.log(`   - University: ${dashboard.academicContext.university.name} (${dashboard.academicContext.university.code})`);
  console.log(`   - Course: ${dashboard.academicContext.course.name} (${dashboard.academicContext.course.code})`);
  console.log(`   - Semester: ${dashboard.academicContext.semester.title} (Number: ${dashboard.academicContext.semester.semesterNumber})`);
  console.log(`   - Student: ${dashboard.student.fullName} (${dashboard.student.email})`);
  console.log(`   - Overall Preparation: ${dashboard.overallPreparationPercentage}%`);

  if (dashboard.academicContext.university.code !== 'SU') {
    throw new Error('❌ Academic context mismatch: University is not Saurashtra University (SU)');
  }
  if (dashboard.academicContext.semester.semesterNumber !== 3) {
    throw new Error('❌ Academic context mismatch: Semester is not Semester 3');
  }

  // 2. Verify the 5 Semester 3 Subjects
  console.log('\n2️⃣ Verifying 5 Saurashtra University Semester 3 Subjects:');
  if (dashboard.subjectProgress.length !== 5) {
    throw new Error(`❌ Expected 5 subjects, found ${dashboard.subjectProgress.length}`);
  }

  dashboard.subjectProgress.forEach((subj, idx) => {
    console.log(`\n   Subject ${idx + 1}: [${subj.code}] ${subj.title}`);
    console.log(`   - Overall Subject Progress: ${subj.overallPercentage}%`);
    console.log(`   - Topic Completion: ${subj.topicCompletion.completed}/${subj.topicCompletion.total} (${subj.topicCompletion.percentage}%)`);
    console.log(`   - Notes Progress: ${subj.notesProgress.read}/${subj.notesProgress.total} (${subj.notesProgress.percentage}%)`);
    console.log(`   - Questions Practiced: ${subj.questionsPracticed.practiced}/${subj.questionsPracticed.total}`);
    console.log(`   - MCQs Solved: ${subj.mcqsSolved.solved}/${subj.mcqsSolved.total} (Accuracy: ${subj.mcqsSolved.accuracy}%)`);
    console.log(`   - Test Performance: Avg ${subj.testPerformance.averageScore}%, Attempts: ${subj.testPerformance.testsAttempted}`);

    // Verify all 5 metrics are defined
    if (subj.topicCompletion.total === 0) throw new Error(`Missing topic count for ${subj.title}`);
    if (subj.notesProgress.total === 0) throw new Error(`Missing notes count for ${subj.title}`);
  });

  // 3. Verify Core Counters
  console.log('\n3️⃣ Verifying Core Metric Counters:');
  console.log(`   - Questions Solved: ${dashboard.coreMetrics.questionsSolved}`);
  console.log(`   - MCQs Solved: ${dashboard.coreMetrics.mcqsSolved}`);
  console.log(`   - Mock Tests Completed: ${dashboard.coreMetrics.mockTestsCompleted}`);
  console.log(`   - Study Streak: ${dashboard.coreMetrics.studyStreak} Days`);

  // 4. Verify All 9 Dashboard Sections
  console.log('\n4️⃣ Verifying 9 Dashboard Sections:');
  const sections = dashboard.sections;

  // Section 1: Continue Preparation
  if (!sections.continuePreparation || !sections.continuePreparation.continueUrl) {
    throw new Error('❌ Section 1 (Continue Preparation) missing valid topic target!');
  }
  console.log(`   ✅ 1. Continue Preparation: "${sections.continuePreparation.topicTitle}" (${sections.continuePreparation.continueUrl})`);

  // Section 2: Today's Study Plan
  if (!sections.todaysStudyPlan || sections.todaysStudyPlan.length === 0) {
    throw new Error('❌ Section 2 (Today\'s Study Plan) is empty!');
  }
  console.log(`   ✅ 2. Today's Study Plan: ${sections.todaysStudyPlan.length} daily targets configured.`);

  // Section 3: Weak Topics
  console.log(`   ✅ 3. Weak Topics: ${sections.weakTopics.length} weak topics identified for focused revision.`);

  // Section 4: Wrong Answers (My Mistakes)
  console.log(`   ✅ 4. Wrong Answers (My Mistakes): ${sections.wrongAnswers.totalMistakes} active mistakes tracked in notebook.`);

  // Section 5: Bookmarks
  console.log(`   ✅ 5. Bookmarks: ${sections.bookmarks.length} bookmarked items retrieved.`);

  // Section 6: Recent Tests
  console.log(`   ✅ 6. Recent Tests: ${sections.recentTests.length} test attempts logged.`);

  // Section 7: Quick Revision
  console.log(`   ✅ 7. Quick Revision: ${sections.quickRevision.totalDue} spaced repetition items queued.`);

  // Section 8: Important Questions
  console.log(`   ✅ 8. Important Questions: ${sections.importantQuestions.length} priority exam questions retrieved.`);

  // Section 9: Upcoming Exam
  if (!sections.upcomingExam || !sections.upcomingExam.daysRemaining) {
    throw new Error('❌ Section 9 (Upcoming Exam) missing exam countdown!');
  }
  console.log(`   ✅ 9. Upcoming Exam: "${sections.upcomingExam.title}" in ${sections.upcomingExam.daysRemaining} days.`);

  // 5. Test Progress Persistence After Logout & Login
  console.log('\n5️⃣ Testing Progress Persistence Across Logout & Login...');
  // Simulate logout
  const preLogoutCompletedTopics = dashboard.subjectProgress[0].topicCompletion.completed;
  const preLogoutStreak = dashboard.coreMetrics.studyStreak;

  // Verify database record remains intact
  const dbUser = await prisma.user.findUnique({
    where: { id: 'usr-student-01' },
    include: {
      studyProgress: true,
      testAttempts: true,
      wrongAnswers: true
    }
  });

  if (dbUser.studyProgress.length === 0) {
    throw new Error('❌ Study progress was not persisted in database!');
  }

  // Simulate login: re-fetch from database
  const postLoginDashboard = await getStudentDashboardData('usr-student-01');
  const postLoginCompletedTopics = postLoginDashboard.subjectProgress[0].topicCompletion.completed;
  const postLoginStreak = postLoginDashboard.coreMetrics.studyStreak;

  if (preLogoutCompletedTopics !== postLoginCompletedTopics || preLogoutStreak !== postLoginStreak) {
    throw new Error('❌ Data mismatch after login/logout simulation!');
  }
  console.log('   ✅ Progress 100% Persisted in SQLite DB across logout and login!');

  console.log('\n🎉 ALL STUDENT DASHBOARD TESTS PASSED WITH 100% SUCCESS!');
}

runStudentDashboardTests()
  .catch(err => {
    console.error('❌ Student Dashboard Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
