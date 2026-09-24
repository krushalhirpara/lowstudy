import prisma from '../src/lib/prisma.js';
import {
  evaluateStudentAnswer,
  savePracticeAttempt,
  getQuestionPracticeHistory,
  PRACTICE_COMPLIANCE_DISCLAIMER
} from '../src/lib/services/answerPracticeService.js';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 EXAM ANSWER WRITING PRACTICE TEST SUITE (AUTOMATED VERIFICATION)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const userId = 'usr-student-01';

  try {
    // 1. Fetch a real question from the database
    const targetQuestion = await prisma.question.findFirst({
      where: {
        topic: { unit: { subject: { semesterId: 'su-llb-3yr-sem3' } } },
        answers: { some: {} }
      },
      include: {
        answers: true,
        topic: { include: { unit: { include: { subject: true } } } }
      }
    });

    if (!targetQuestion) {
      throw new Error('No question with model answers found in database for testing.');
    }

    console.log(`Testing with Question ID: ${targetQuestion.id}`);
    console.log(`Question: "${targetQuestion.questionText}" (${targetQuestion.marks} Marks)\n`);

    // -------------------------------------------------------------
    // Test 1: Full-Length Answer Evaluation & 10 Diagnostic Checks
    // -------------------------------------------------------------
    console.log('--- Test 1: Evaluating Student Answer Across 10 Legal Checks ---');
    
    // Sample student answer covering definition, provisions, elements, case law, example, conclusion
    const sampleStudentAnswer = `
1. Introduction:
The concept of Industry and Industrial Dispute under the Industrial Disputes Act, 1947 forms the cornerstone of Indian labour jurisprudence.

2. Definition:
Under Section 2(j) of the Industrial Disputes Act, 1947, Industry is defined as any systematic activity carried on by co-operation between an employer and his workmen for the production, supply or distribution of goods or services.

3. Legal Provision:
The governing statute is the Industrial Disputes Act, 1947, particularly Section 2(j) and Section 2(k).

4. Essential Elements:
The essential ingredients established by the Supreme Court include:
(a) Systematic activity
(b) Organized co-operation between employer and employees
(c) Production or distribution of goods and services to satisfy human wants.

5. Explanation & Legal Analysis:
Profit motive is not necessary. Even clubs, municipal corporations, universities, and hospitals can qualify if the triple test is satisfied, excluding sovereign state functions.

6. Landmark Case Law:
In Bangalore Water Supply and Sewerage Board v. A. Rajappa (1978), the Supreme Court laid down the famous Triple Test and the Dominant Nature Test.

7. Practical Example:
For example, a hospital or research institute run by a charitable trust without commercial profit motive still falls under the definition of industry because it provides healthcare services systematically through employees.

8. Conclusion:
Therefore, in conclusion, the modern judicial approach interprets Section 2(j) broadly to safeguard employee welfare while strictly exempting inalienable sovereign governmental functions.
    `.trim();

    const evaluationResult = await evaluateStudentAnswer({
      userId,
      questionId: targetQuestion.id,
      studentAnswer: sampleStudentAnswer,
      timeSpentSecs: 420
    });

    const ev = evaluationResult.evaluation;

    // Check 1: 10 Diagnostic Checks Exist
    assert(Array.isArray(ev.diagnosticChecks), 'Diagnostic checks array exists');
    assert(ev.diagnosticChecks.length === 10, 'All 10 diagnostic checks evaluated (length = 10)');

    const expectedDimensions = [
      'Definition',
      'Legal Provision',
      'Relevant Sections',
      'Essential Elements',
      'Explanation',
      'Case Laws',
      'Examples',
      'Conclusion',
      'Structure',
      'Relevance'
    ];

    const returnedDimensions = ev.diagnosticChecks.map(c => c.dimension);
    const hasAll10 = expectedDimensions.every(dim => returnedDimensions.includes(dim));
    assert(hasAll10, `All 10 required dimensions verified: ${expectedDimensions.join(', ')}`);

    // -------------------------------------------------------------
    // Test 2: Categorized Feedback (Done Well, Missing, Improve)
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Feedback Categorization Verification ---');
    assert(!!ev.feedback, 'Feedback object exists');
    assert(Array.isArray(ev.feedback.whatWasDoneWell), 'whatWasDoneWell is an array');
    assert(Array.isArray(ev.feedback.whatIsMissing), 'whatIsMissing is an array');
    assert(Array.isArray(ev.feedback.whatShouldBeImproved), 'whatShouldBeImproved is an array');
    assert(ev.feedback.whatWasDoneWell.length > 0, 'whatWasDoneWell contains positive feedback items');

    // -------------------------------------------------------------
    // Test 3: Compliance Title & Disclaimers Invariant
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Branding & Statutory Compliance Disclaimers ---');
    assert(ev.feedbackTitle === 'AI Practice Feedback', 'Feedback title strictly branded as "AI Practice Feedback"');
    assert(!ev.feedbackTitle.includes('Official'), 'Does not claim to be official marking');
    assert(ev.disclaimer.includes('NOT official university examination marking'), 'Explicitly disclaims official university examination marking');
    assert(ev.disclaimer.includes('does NOT guarantee examination marks'), 'Explicitly disclaims guaranteeing examination marks');

    // -------------------------------------------------------------
    // Test 4: Unverified Legal Information Flagging
    // (If student cites an unverified section/case, flag it instead of inventing a correction)
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Unverified Legal Information Flagging ---');
    
    // Answer with a fake section and made-up case law
    const unverifiedAnswer = `
Under the Industrial Disputes Act, according to Section 9999(Z), an employer is prohibited from working.
In the landmark precedent Imaginary Corporation v. Fake Union Ltd (2099), the court ruled that all companies are immune.
    `.trim();

    const unverifiedEval = await evaluateStudentAnswer({
      userId,
      questionId: targetQuestion.id,
      studentAnswer: unverifiedAnswer,
      timeSpentSecs: 120
    });

    const flags = unverifiedEval.evaluation.flaggedUnverifiedLegalInfo;
    console.log(`Flagged unverified items count: ${flags.length}`);
    assert(Array.isArray(flags), 'flaggedUnverifiedLegalInfo array returned');
    assert(flags.length > 0, 'Unverified citation flagged successfully');
    
    const hasSectionFlag = flags.some(f => f.type === 'UNVERIFIED_SECTION');
    assert(hasSectionFlag, 'Fake Section 9999(Z) flagged with unverified notice');
    assert(unverifiedEval.evaluation.unverifiedFlagNote.includes('never invent or fabricate legal corrections'), 'Zero-hallucination compliance note verified');

    // -------------------------------------------------------------
    // Test 5: Save Practice Attempt & Study Progress Sync
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Saving Practice Attempt & Revision Tracking ---');
    const savedAttempt = await savePracticeAttempt({
      userId,
      questionId: targetQuestion.id,
      studentAnswer: sampleStudentAnswer,
      evaluation: ev,
      wordCount: ev.metrics.wordCount,
      timeSpentSecs: 420
    });

    assert(!!savedAttempt.id, `Practice attempt saved successfully with ID: ${savedAttempt.id}`);
    assert(savedAttempt.status === 'SAVED', 'Attempt status marked SAVED');

    // Check history retrieval
    const history = await getQuestionPracticeHistory({
      userId,
      questionId: targetQuestion.id
    });
    assert(history.length >= 1, `Practice history retrieved ${history.length} attempt(s)`);
    assert(history[0].id === savedAttempt.id, 'Most recent attempt matches saved attempt ID');

    // Check revision progress item updated
    const revItem = await prisma.revisionItem.findFirst({
      where: { userId, entityType: 'QUESTION', entityId: targetQuestion.id }
    });
    assert(!!revItem, 'Question registered in RevisionItem table for spaced recall');

    // -------------------------------------------------------------
    // Test 6: Model Answer Comparison Payload
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Model Answer Ground Truth Payload ---');
    assert(!!ev.modelAnswerComparison, 'modelAnswerComparison payload exists');
    assert(Array.isArray(ev.modelAnswerComparison.verifiedSections), 'verifiedSections array exists');
    assert(!!ev.modelAnswerComparison.modelStructure, 'modelStructure exists for student comparison');

    console.log('\n================================================================');
    console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled error during test run:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
