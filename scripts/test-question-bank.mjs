import {
  getQuestionsList,
  getQuestionDetail,
  toggleQuestionPracticed,
  reportQuestionContent,
  getQuestionBankFilters
} from '../src/lib/services/questionBankService.js';
import prisma from '../src/lib/prisma.js';

async function testQuestionBank() {
  console.log("================================================================================");
  console.log("             COMPREHENSIVE LAW EXAM QUESTION BANK TEST SUITE                   ");
  console.log("================================================================================");

  // 1. Test Filter Options
  console.log("\n[TEST 1] Testing getQuestionBankFilters...");
  const filters = await getQuestionBankFilters();
  console.log(`✓ Total Questions in Bank: ${filters.totalQuestions}`);
  console.log(`✓ Previous Year Questions (PYQ): ${filters.pyqCount}`);
  console.log(`✓ Original Practice Questions: ${filters.originalPracticeCount}`);
  console.log(`✓ Available Marks: ${filters.marks.join(', ')}`);
  console.log(`✓ Subjects Available: ${filters.subjects.length}`);
  if (filters.totalQuestions === 0 || filters.pyqCount === 0) {
    throw new Error("Test 1 Failed: Question bank filters or PYQ count is 0");
  }

  // 2. Test 2 Marks Questions Filter
  console.log("\n[TEST 2] Testing 2 Marks Questions...");
  const res2M = await getQuestionsList({ marks: '2' });
  console.log(`✓ Retrieved ${res2M.questions.length} 2-Mark questions.`);
  const q2m = res2M.questions[0];
  console.log(`  Sample 2M Q: "${q2m.questionText}" (${q2m.marks} Marks, Type: ${q2m.formatStyle || q2m.questionType})`);
  if (!q2m || q2m.marks !== 2) throw new Error("Test 2 Failed: Expected 2 Marks question");

  // 3. Test 5 Marks Questions Filter (Short Note / Distinguish)
  console.log("\n[TEST 3] Testing 5 Marks Questions (Distinguish / Short Notes)...");
  const res5M = await getQuestionsList({ marks: '5' });
  console.log(`✓ Retrieved ${res5M.questions.length} 5-Mark questions.`);
  const q5m = res5M.questions[0];
  console.log(`  Sample 5M Q: "${q5m.questionText}" (${q5m.marks} Marks, Format: ${q5m.formatStyle})`);
  if (!q5m || q5m.marks !== 5) throw new Error("Test 3 Failed: Expected 5 Marks question");

  // 4. Test 10 Marks Questions Filter (Discuss / Problem-based)
  console.log("\n[TEST 4] Testing 10 Marks Questions (Discuss / Problem-based)...");
  const res10M = await getQuestionsList({ marks: '10' });
  console.log(`✓ Retrieved ${res10M.questions.length} 10-Mark questions.`);
  const q10m = res10M.questions[0];
  console.log(`  Sample 10M Q: "${q10m.questionText}" (${q10m.marks} Marks, Format: ${q10m.formatStyle})`);
  if (!q10m || q10m.marks !== 10) throw new Error("Test 4 Failed: Expected 10 Marks question");

  // 5. Test Clear Distinction: PYQ vs Original Practice
  console.log("\n[TEST 5] Testing Authentic PYQ vs Original Practice Distinction...");
  const pyqResults = await getQuestionsList({ source: 'PYQ' });
  console.log(`✓ Retrieved ${pyqResults.questions.length} genuine Previous Year Questions.`);
  for (const pyq of pyqResults.questions) {
    if (!pyq.isPYQ || !pyq.pyqInfo) throw new Error(`Fake PYQ detected without authentic paper: ${pyq.id}`);
    console.log(`  - 🏛️ [PYQ] ${pyq.pyqInfo.university} (${pyq.pyqInfo.examYear} ${pyq.pyqInfo.examSession}) Paper: ${pyq.pyqInfo.paperCode} -> ${pyq.questionText.substring(0, 50)}...`);
  }

  const origResults = await getQuestionsList({ source: 'ORIGINAL_PRACTICE' });
  console.log(`✓ Retrieved ${origResults.questions.length} Original Practice Questions.`);
  const origSample = origResults.questions[0];
  if (origSample.isPYQ) throw new Error("Original question falsely labeled as PYQ");
  console.log(`  - ✍️ [Original Practice] "${origSample.questionText.substring(0, 60)}..."`);

  // 6. Test Single Question Detail & Mandatory 9-Part Model Answer
  console.log("\n[TEST 6] Testing Complete 9-Part Model Answer on Question Detail...");
  const targetQ = pyqResults.questions[0];
  const detail = await getQuestionDetail(targetQ.id);

  console.log(`Question: "${detail.questionText}"`);
  console.log(`Marks: ${detail.marks} | Difficulty: ${detail.difficulty} | Priority: ${detail.priority}`);
  console.log(`Source Type: ${detail.sourceType}`);

  const ma = detail.modelAnswer;
  console.log("\nVerifying 9 Parts of Model Answer:");
  console.log(`  1. Introduction: ${ma.introduction ? '✓' : '✗'}`);
  console.log(`  2. Definition: ${ma.definition ? '✓' : '✗'}`);
  console.log(`  3. Relevant Law: ${ma.relevantLaw ? '✓' : '✗'}`);
  console.log(`  4. Legal Provision: ${ma.legalProvision ? '✓' : '✗'}`);
  console.log(`  5. Main Points: ${ma.mainPoints?.length || 0} items ✓`);
  console.log(`  6. Explanation: ${ma.explanation ? '✓' : '✗'}`);
  console.log(`  7. Case Law: ${ma.caseLaw ? '✓' : '✗'}`);
  console.log(`  8. Example: ${ma.example ? '✓' : '✗'}`);
  console.log(`  9. Conclusion: ${ma.conclusion ? '✓' : '✗'}`);

  if (!ma.introduction || !ma.definition || !ma.relevantLaw || !ma.legalProvision || !ma.mainPoints || !ma.explanation || !ma.caseLaw || !ma.example || !ma.conclusion) {
    throw new Error("Test 6 Failed: Incomplete 9-part model answer");
  }

  console.log(`\nAdditional metadata fields:`);
  console.log(`  - Relevant Sections: ${detail.relevantSections.join(', ') || 'N/A'}`);
  console.log(`  - Relevant Case Laws: ${detail.relevantCaseLaws.join('; ') || 'N/A'}`);
  console.log(`  - Quick Points count: ${detail.quickPoints.length}`);
  console.log(`  - Exam Answer Structure: "${detail.examAnswerStructure.substring(0, 50)}..."`);
  console.log(`  - Adjacent Navigation: Prev: ${detail.navigation.prevQuestion ? detail.navigation.prevQuestion.marks + 'M' : 'None'}, Next: ${detail.navigation.nextQuestion ? detail.navigation.nextQuestion.marks + 'M' : 'None'}`);

  // 7. Test Student Actions (Practiced & Report)
  console.log("\n[TEST 7] Testing Student Actions (Practiced & Report)...");
  const testUserId = 'usr-student-01';
  const practiceRes1 = await toggleQuestionPracticed(targetQ.id, testUserId);
  console.log(`✓ Toggle Practice (Action 1): isPracticed = ${practiceRes1.isPracticed}`);
  if (!practiceRes1.isPracticed) throw new Error("Expected isPracticed to be true");

  const practiceRes2 = await toggleQuestionPracticed(targetQ.id, testUserId);
  console.log(`✓ Toggle Practice (Action 2): isPracticed = ${practiceRes2.isPracticed}`);
  if (practiceRes2.isPracticed) throw new Error("Expected isPracticed to toggle to false");

  const reportRes = await reportQuestionContent({
    questionId: targetQ.id,
    issueType: 'INCORRECT_CITATION',
    notes: 'Testing report incorrect content functionality from test suite',
    userId: testUserId
  });
  console.log(`✓ Report Content submitted successfully: reviewId = ${reportRes.reviewId}`);

  console.log("\n================================================================================");
  console.log("             ALL QUESTION BANK TESTS PASSED SUCCESSFULLY!                       ");
  console.log("================================================================================");
}

testQuestionBank()
  .catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
