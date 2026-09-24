import prisma from '../src/lib/prisma.js';
import {
  getMockTestMetadata,
  generateMockTestSession,
  submitMockTestAttempt,
  getMockTestAttempt,
  TEST_TYPES
} from '../src/lib/services/mockTestService.js';

async function runMockTestEngineTests() {
  console.log('🏛️ Starting Production Mock Test Engine Test Suite...\n');

  // 1. Metadata & Presets
  console.log('1️⃣ Testing Mock Test Metadata & Academic Hierarchy...');
  const meta = await getMockTestMetadata();
  console.log(`   Found ${meta.subjects.length} subjects, ${meta.previousPapers.length} previous papers, ${meta.existingMockTests.length} pre-configured mock tests, and ${meta.totalMcqs} total MCQs.`);
  if (meta.totalMcqs === 0) throw new Error('No MCQs found in DB!');

  const testSubject = meta.subjects[0];
  const testUnit = testSubject?.units[0];
  console.log(`   Target Subject: "${testSubject?.title}" (${testSubject?.shortCode}), Unit ${testUnit?.unitNumber}: "${testUnit?.title}"`);

  // 2. Test All 5 Test Types
  const testTypes = ['UNIT_TEST', 'SUBJECT_TEST', 'FULL_SEMESTER_TEST', 'PREVIOUS_PAPER_PRACTICE', 'CUSTOM_TEST'];

  for (const type of testTypes) {
    console.log(`\n2️⃣ Testing Generation: ${type} (${TEST_TYPES[type].title})...`);
    const session = await generateMockTestSession({
      testType: type,
      subjectId: testSubject?.id,
      unitId: testUnit?.id,
      customConfig: {
        questionCount: 6,
        timeLimitMinutes: 15,
        marksPerQuestion: 1.0,
        hasNegativeMarking: true,
        negativeMarkValue: 0.25,
        randomize: true
      }
    });

    console.log(`   Generated "${session.testMeta.title}"`);
    console.log(`   Total Questions: ${session.testMeta.totalQuestions}, Total Marks: ${session.testMeta.totalMarks}, Time Limit: ${session.testMeta.timeLimitMinutes}m`);
    
    if (session.questions.length === 0) {
      throw new Error(`❌ No questions generated for ${type}`);
    }

    // Assert Exam Privacy Security: correct answer & explanations MUST BE NULL
    const q1 = session.questions[0];
    const revealsCorrect = q1.options.some(o => o.isCorrect !== undefined);
    const revealsExplanation = !!q1.explanation || !!q1.explanationGu;

    if (revealsCorrect || revealsExplanation) {
      throw new Error(`❌ PRIVACY VIOLATION: ${type} leaked correct answer or explanation before submission!`);
    }
    console.log('   ✅ Exam Security Verified: Answers and explanations are completely concealed.');
  }

  // 3. Test Submission & Multi-Dimensional Evaluation (Subject, Unit, Topic)
  console.log('\n3️⃣ Testing Test Submission & Multi-Tier Analytics...');
  const sampleTest = await generateMockTestSession({
    testType: 'SUBJECT_TEST',
    subjectId: testSubject?.id,
    customConfig: {
      questionCount: 4,
      marksPerQuestion: 2.0,
      hasNegativeMarking: true,
      negativeMarkValue: 0.5
    }
  });

  const testQuestions = sampleTest.questions.slice(0, 4);
  const sampleAnswers = {};

  // Fetch db correct answer for Q0 to ensure correct, and pick wrong for Q1
  const dbQ0 = await prisma.mcq.findUnique({
    where: { id: testQuestions[0].id },
    include: { options: true }
  });
  const dbQ0CorrectOpt = dbQ0.options.find(o => o.isCorrect);
  sampleAnswers[testQuestions[0].id] = dbQ0CorrectOpt ? dbQ0CorrectOpt.optionKey : 'A';

  // Intentionally wrong answer for Q1
  const dbQ1 = await prisma.mcq.findUnique({
    where: { id: testQuestions[1].id },
    include: { options: true }
  });
  const dbQ1WrongOpt = dbQ1.options.find(o => !o.isCorrect) || dbQ1.options[0];
  sampleAnswers[testQuestions[1].id] = dbQ1WrongOpt.optionKey;

  // Q2 and Q3 left unanswered (skipped)

  const testAttemptId = `test-mock-attempt-${Date.now()}`;

  const submissionResult = await submitMockTestAttempt({
    attemptId: testAttemptId,
    testType: 'SUBJECT_TEST',
    subjectId: testSubject?.id,
    answers: sampleAnswers,
    timeSpentSeconds: 140,
    testConfig: {
      marksPerQuestion: 2.0,
      hasNegativeMarking: true,
      negativeMarkValue: 0.5,
      passingMarks: 4.0
    },
    userId: 'usr-student-01'
  });

  console.log('   Submission Results Summary:');
  console.log(`   - Score: ${submissionResult.summary.score} / ${submissionResult.summary.totalMarks}`);
  console.log(`   - Percentage: ${submissionResult.summary.percentage}% (${submissionResult.summary.masteryStatus})`);
  console.log(`   - Correct: ${submissionResult.summary.correctCount}, Wrong: ${submissionResult.summary.incorrectCount}, Skipped: ${submissionResult.summary.skippedCount}`);
  console.log(`   - Negative Penalty: -${submissionResult.summary.penaltyDeduction}`);
  console.log(`   - Time Used: ${submissionResult.summary.timeUsedFormatted}`);

  // Assert Performance Breakdowns
  console.log(`\n4️⃣ Verifying Multi-Dimensional Performance:`);
  console.log(`   - Subject-wise Entries: ${submissionResult.performance.subjects.length}`);
  submissionResult.performance.subjects.forEach(s => {
    console.log(`     ⚖️ [${s.subjectCode}] ${s.title}: ${s.correct}/${s.total} (${s.accuracy}%) - Marks: ${s.marksScored}/${s.maxMarks}`);
  });

  console.log(`   - Unit-wise Entries: ${submissionResult.performance.units.length}`);
  submissionResult.performance.units.forEach(u => {
    console.log(`     📑 Unit ${u.unitNumber} (${u.subjectCode}): ${u.correct}/${u.total} (${u.accuracy}%)`);
  });

  console.log(`   - Topic-wise Entries: ${submissionResult.performance.topics.length}`);
  submissionResult.performance.topics.forEach(t => {
    console.log(`     📚 ${t.title}: ${t.correct}/${t.total} (${t.accuracy}%) isWeak: ${t.isWeakTopic}`);
  });

  console.log(`   - Weak Topics Identified: ${submissionResult.performance.weakTopics.length}`);
  submissionResult.performance.weakTopics.forEach(wt => {
    console.log(`     ⚠️ WEAK TOPIC: "${wt.title}" (Accuracy: ${wt.accuracy}%) -> Revision URL: ${wt.revisionUrl}`);
  });

  if (submissionResult.performance.subjects.length === 0 || submissionResult.performance.units.length === 0) {
    throw new Error('❌ Performance breakdown failed: Missing subject or unit breakdown!');
  }

  // 5. Verify Database Persistence
  console.log('\n5️⃣ Verifying DB Persistence & Relations...');
  const persistedAttempt = await prisma.testAttempt.findUnique({
    where: { id: testAttemptId },
    include: { answers: true }
  });

  if (!persistedAttempt) throw new Error('❌ TestAttempt was not saved to database!');
  if (persistedAttempt.answers.length !== 2) {
    throw new Error(`❌ Expected 2 TestAnswer records, found ${persistedAttempt.answers.length}`);
  }
  console.log(`   ✅ TestAttempt saved successfully with ${persistedAttempt.answers.length} answer records.`);

  // 6. Verify Wrong Answers in My Mistakes
  console.log('\n6️⃣ Verifying My Mistakes (WrongAnswer table)...');
  const loggedMistake = await prisma.wrongAnswer.findUnique({
    where: {
      userId_mcqId: {
        userId: 'usr-student-01',
        mcqId: testQuestions[1].id
      }
    }
  });

  if (!loggedMistake) {
    throw new Error('❌ Wrong answer was NOT entered into My Mistakes!');
  }
  console.log(`   ✅ Wrong answer successfully verified in My Mistakes (Mistake count: ${loggedMistake.mistakeCount}).`);

  // 7. Test Duplicate Submission Prevention
  console.log('\n7️⃣ Testing Duplicate Submission Prevention...');
  try {
    await submitMockTestAttempt({
      attemptId: testAttemptId,
      testType: 'SUBJECT_TEST',
      subjectId: testSubject?.id,
      answers: sampleAnswers,
      userId: 'usr-student-01'
    });
    throw new Error('❌ Duplicate submission was NOT prevented!');
  } catch (err) {
    if (err.message.includes('already been submitted')) {
      console.log('   ✅ Duplicate submission successfully prevented.');
    } else {
      throw err;
    }
  }

  // 8. Test Past Attempt Retrieval
  console.log('\n8️⃣ Testing Past Attempt Retrieval API...');
  const retrieved = await getMockTestAttempt({ attemptId: testAttemptId, userId: 'usr-student-01' });
  if (!retrieved || retrieved.summary.score !== submissionResult.summary.score) {
    throw new Error('❌ Attempt retrieval mismatch!');
  }
  console.log(`   ✅ Successfully retrieved attempt with ${retrieved.questionsReview.length} questions and performance analytics.`);

  // Cleanup test artifacts
  await prisma.testAnswer.deleteMany({ where: { attemptId: testAttemptId } });
  await prisma.testAttempt.delete({ where: { id: testAttemptId } });
  console.log('\n🧹 Test artifacts cleaned up.');

  console.log('\n🎉 ALL MOCK TEST ENGINE TESTS PASSED WITH 100% SUCCESS!');
}

runMockTestEngineTests()
  .catch(err => {
    console.error('❌ Mock Test Engine Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
