import prisma from '../src/lib/prisma.js';
import {
  getPracticeQuestions,
  submitPracticeSession,
  addMcqToRevision,
  getMyMistakes,
  resolveMistake,
  getPracticeHierarchyMetadata,
  PRACTICE_MODES
} from '../src/lib/services/mcqPracticeService.js';

async function runTests() {
  console.log('🧪 Starting MCQ Practice System Test Suite...\n');

  // 1. Test Metadata
  console.log('1️⃣ Testing Practice Hierarchy Metadata...');
  const meta = await getPracticeHierarchyMetadata();
  console.log(`   Found ${meta.subjects.length} subjects, ${meta.totalMcqs} total MCQs, ${meta.totalMistakes} unresolved mistakes.`);
  if (meta.totalMcqs === 0) throw new Error('No MCQs found in database!');

  const testSubject = meta.subjects[0];
  const testUnit = testSubject?.units[0];
  const testTopic = testUnit?.topics[0];

  console.log(`   Target: Subject="${testSubject?.title}", Unit="${testUnit?.title}", Topic="${testTopic?.title}"`);

  // 2. Test 6 Practice Modes
  const modes = ['TOPIC', 'UNIT', 'SUBJECT', 'MIXED', 'RANDOM', 'TIMED_QUIZ'];
  for (const mode of modes) {
    console.log(`2️⃣ Testing Mode: ${mode} (${PRACTICE_MODES[mode] || mode})...`);
    const session = await getPracticeQuestions({
      mode,
      subjectId: testSubject?.id,
      unitId: testUnit?.id,
      topicId: testTopic?.id,
      count: 5,
      isExamMode: mode === 'TIMED_QUIZ'
    });

    console.log(`   Fetched ${session.questions.length} questions. Time limit: ${session.sessionMeta.timeLimitMinutes} mins.`);
    if (session.questions.length === 0) {
      console.warn(`   ⚠️ Warning: No questions returned for mode ${mode}`);
    } else {
      const q1 = session.questions[0];
      if (mode === 'TIMED_QUIZ') {
        // Assert exam mode hides correct answer and explanation!
        const hasExposedAnswers = q1.options.some(o => o.isCorrect !== undefined);
        const hasExposedExplanation = !!q1.explanation;
        if (hasExposedAnswers || hasExposedExplanation) {
          throw new Error('❌ FAILURE: Timed Quiz / Exam Mode exposed correct answers or explanations before submission!');
        }
        console.log('   ✅ Exam mode privacy verified: answers and explanations hidden.');
      }
    }
  }

  // 3. Test Session Submission & Evaluation
  console.log('\n3️⃣ Testing Session Submission & Evaluation...');
  // Fetch 4 questions in RANDOM mode
  const practiceBatch = await getPracticeQuestions({
    mode: 'RANDOM',
    count: 4,
    isExamMode: false
  });

  const testQuestions = practiceBatch.questions.slice(0, 4);
  if (testQuestions.length < 2) throw new Error('Need at least 2 questions to test submission.');

  const sampleAnswers = {};
  // Answer question 0 correctly, question 1 intentionally wrong
  const q0 = testQuestions[0];
  const q0CorrectOpt = q0.options.find(o => o.isCorrect);
  sampleAnswers[q0.id] = q0CorrectOpt ? q0CorrectOpt.key : 'A';

  const q1 = testQuestions[1];
  const q1WrongOpt = q1.options.find(o => !o.isCorrect) || q1.options[0];
  sampleAnswers[q1.id] = q1WrongOpt.key;

  const testAttemptId = `test-attempt-${Date.now()}`;

  const submissionResult = await submitPracticeSession({
    attemptId: testAttemptId,
    mode: 'RANDOM',
    answers: sampleAnswers,
    timeSpentSeconds: 95,
    useNegativeMarking: true,
    userId: 'usr-student-01'
  });

  console.log('   Submission Result:', {
    attemptId: submissionResult.attemptId,
    score: submissionResult.summary.score,
    correct: submissionResult.summary.correctCount,
    incorrect: submissionResult.summary.incorrectCount,
    skipped: submissionResult.summary.skippedCount,
    timeUsed: submissionResult.summary.timeUsedFormatted
  });

  if (submissionResult.summary.correctCount < 1 || submissionResult.summary.incorrectCount < 1) {
    throw new Error('Evaluation mismatch: Expected at least 1 correct and 1 incorrect.');
  }

  // Verify Topic Performance Breakdown
  console.log(`   Topic Performance Entries: ${submissionResult.topicPerformance.length}`);
  submissionResult.topicPerformance.forEach(tp => {
    console.log(`   - [${tp.subjectCode}] ${tp.topicTitle}: ${tp.correct}/${tp.total} (${tp.accuracy}%) needsRevision: ${tp.needsRevision}`);
  });

  // 4. Test Duplicate Submission Prevention
  console.log('\n4️⃣ Testing Duplicate Submission Prevention...');
  try {
    await submitPracticeSession({
      attemptId: testAttemptId,
      mode: 'RANDOM',
      answers: sampleAnswers,
      timeSpentSeconds: 95,
      userId: 'usr-student-01'
    });
    throw new Error('❌ Duplicate submission was NOT prevented!');
  } catch (err) {
    if (err.message.includes('already been submitted')) {
      console.log('   ✅ Duplicate submission successfully prevented with error message:', err.message);
    } else {
      throw err;
    }
  }

  // 5. Test My Mistakes Logging
  console.log('\n5️⃣ Testing My Mistakes (WrongAnswer Table)...');
  const mistakes = await getMyMistakes({ userId: 'usr-student-01' });
  const recordedMistake = mistakes.mistakes.find(m => m.mcqId === q1.id);
  if (!recordedMistake) {
    throw new Error(`❌ Wrong answer for MCQ ${q1.id} was not recorded into My Mistakes!`);
  }
  console.log(`   ✅ Wrong answer recorded into My Mistakes. Total active mistakes: ${mistakes.totalMistakes}`);

  // Test Resolving Mistake
  await resolveMistake({ userId: 'usr-student-01', mcqId: q1.id });
  const refreshedMistakes = await getMyMistakes({ userId: 'usr-student-01' });
  const isResolvedNow = !refreshedMistakes.mistakes.some(m => m.mcqId === q1.id);
  if (!isResolvedNow) {
    throw new Error('❌ Mistake resolution failed');
  }
  console.log('   ✅ Mistake resolution verified.');

  // 6. Test Add to Revision
  console.log('\n6️⃣ Testing Spaced Revision Add...');
  const revResult = await addMcqToRevision({ userId: 'usr-student-01', mcqId: q0.id });
  console.log(`   ✅ Spaced revision result: ${revResult.message}`);

  // Clean up test attempt
  await prisma.testAnswer.deleteMany({ where: { attemptId: testAttemptId } });
  await prisma.testAttempt.delete({ where: { id: testAttemptId } });
  console.log('\n🧹 Test artifacts cleaned up.');

  console.log('\n🎉 ALL MCQ PRACTICE TESTS PASSED SUCCESSFULLY!');
}

runTests()
  .catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
