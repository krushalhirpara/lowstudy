import { PrismaClient } from '@prisma/client';
import {
  calculateQuestionPriorityScore,
  PRIORITY_LABELS,
  PRIORITY_DISCLAIMER,
  adminOverrideQuestionPriority,
  recalculateQuestionPriority
} from '../src/lib/services/questionPriorityService.js';
import { getQuestionsList, getQuestionDetail } from '../src/lib/services/questionBankService.js';

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runPriorityTests() {
  console.log('==================================================');
  console.log('  EVIDENCE-BASED QUESTION PRIORITY TEST SUITE');
  console.log('==================================================\n');

  // TEST 1: Calculation Engine - Sample Scenarios
  console.log('[TEST 1] Testing Priority Calculation Engine with Sample Data...');
  
  // Scenario A: Peripheral practice question (0 past papers, standard weight)
  const scorePractice = calculateQuestionPriorityScore({
    previousYearCount: 0,
    yearsAsked: [],
    syllabusWeight: 0.8,
    legalImportance: 0.8,
    hasStatutorySections: false,
    relatedTopicQuestionCount: 1
  });
  assert(scorePractice.priority_label === PRIORITY_LABELS.PRACTICE, `Scenario A maps to Practice (Score: ${scorePractice.priority_score})`);
  assert(scorePractice.priority_score < 35, 'Scenario A score is below 35');
  assert(!scorePractice.why_important.includes('definitely come'), 'Scenario A has no predictive guarantee language');

  // Scenario B: Core statutory doctrine without past papers
  const scoreImportant = calculateQuestionPriorityScore({
    previousYearCount: 0,
    yearsAsked: [],
    syllabusWeight: 1.4,
    legalImportance: 2.2,
    hasStatutorySections: true,
    relatedTopicQuestionCount: 3
  });
  assert(scoreImportant.priority_label === PRIORITY_LABELS.IMPORTANT, `Scenario B maps to Important (Score: ${scoreImportant.priority_score})`);
  assert(scoreImportant.priority_score >= 35 && scoreImportant.priority_score < 55, 'Scenario B score is between 35 and 54');

  // Scenario C: Single recent past paper (2024)
  const scoreHigh = calculateQuestionPriorityScore({
    previousYearCount: 1,
    yearsAsked: [2024],
    syllabusWeight: 1.2,
    legalImportance: 1.5,
    hasStatutorySections: true,
    relatedTopicQuestionCount: 3
  });
  assert(scoreHigh.priority_label === PRIORITY_LABELS.HIGH, `Scenario C maps to High Priority (Score: ${scoreHigh.priority_score})`);
  assert(scoreHigh.priority_score >= 55, 'Scenario C score is >= 55');
  assert(scoreHigh.why_important.includes('2024'), 'Scenario C rationale cites 2024 paper');

  // Scenario D: Recurring past paper across multiple years (2023, 2024) with foundational doctrine
  const scoreVeryHigh = calculateQuestionPriorityScore({
    previousYearCount: 2,
    yearsAsked: [2024, 2023],
    syllabusWeight: 1.5,
    legalImportance: 2.2,
    hasStatutorySections: true,
    relatedTopicQuestionCount: 4
  });
  assert(scoreVeryHigh.priority_label === PRIORITY_LABELS.VERY_HIGH, `Scenario D maps to Very High Priority (Score: ${scoreVeryHigh.priority_score})`);
  assert(scoreVeryHigh.priority_score >= 70, 'Scenario D score is >= 70');
  assert(scoreVeryHigh.why_important.includes('multiple available previous papers'), 'Scenario D cites multiple past papers');

  // TEST 2: Strict No-Prediction & Disclaimer Verification
  console.log('\n[TEST 2] Verifying No-Prediction Policy and Disclaimers...');
  assert(PRIORITY_DISCLAIMER.includes('does not predict or guarantee'), 'Disclaimer contains explicit no-prediction declaration');
  const allLabels = [scorePractice, scoreImportant, scoreHigh, scoreVeryHigh].map(s => s.priority_label);
  allLabels.forEach(lbl => {
    assert(
      [PRIORITY_LABELS.VERY_HIGH, PRIORITY_LABELS.HIGH, PRIORITY_LABELS.IMPORTANT, PRIORITY_LABELS.PRACTICE].includes(lbl),
      `Label "${lbl}" is one of the 4 approved priority designations`
    );
  });

  // TEST 3: Stored Fields in Database
  console.log('\n[TEST 3] Verifying Database Stored Fields on Question Records...');
  const sampleQ = await prisma.question.findFirst({
    where: { status: 'PUBLISHED' }
  });
  assert(sampleQ !== null, 'Found published question in database');
  assert(typeof sampleQ.previous_year_count === 'number', 'previous_year_count is stored as integer');
  assert(sampleQ.years_asked !== undefined, 'years_asked is defined');
  assert(typeof sampleQ.syllabus_weight === 'number', 'syllabus_weight is stored as number');
  assert(typeof sampleQ.legal_importance === 'number', 'legal_importance is stored as number');
  assert(typeof sampleQ.priority_score === 'number', 'priority_score is stored as number');
  assert(typeof sampleQ.priority_label === 'string', `priority_label is stored as string (${sampleQ.priority_label})`);
  assert(typeof sampleQ.why_important === 'string', `why_important is stored (${sampleQ.why_important?.slice(0, 50)}...)`);

  // TEST 4: Question Bank Service Priority Filters & Retrieval
  console.log('\n[TEST 4] Testing Question Bank Service Priority Queries...');
  const vhList = await getQuestionsList({ priority: PRIORITY_LABELS.VERY_HIGH });
  console.log(`  Found ${vhList.questions.length} questions in "${PRIORITY_LABELS.VERY_HIGH}"`);
  vhList.questions.forEach(q => {
    assert(q.priority_label === PRIORITY_LABELS.VERY_HIGH, `Question ${q.id} matches Very High Priority`);
    assert(q.priority_score >= 70, `Question has score >= 70 (${q.priority_score})`);
    assert(q.why_important, 'Question has why_important rationale');
  });

  const hList = await getQuestionsList({ priority: PRIORITY_LABELS.HIGH });
  console.log(`  Found ${hList.questions.length} questions in "${PRIORITY_LABELS.HIGH}"`);
  hList.questions.forEach(q => {
    assert(q.priority_label === PRIORITY_LABELS.HIGH, `Question ${q.id} matches High Priority`);
  });

  // Question detail check
  const firstQ = vhList.questions[0] || hList.questions[0] || sampleQ;
  const detail = await getQuestionDetail(firstQ.id);
  assert(detail.priority_label, `Question detail returns priority_label: ${detail.priority_label}`);
  assert(detail.priority_score !== undefined, `Question detail returns priority_score: ${detail.priority_score}`);
  assert(detail.why_important, `Question detail returns why_important: ${detail.why_important}`);

  // TEST 5: Admin Manual Override and Reset
  console.log('\n[TEST 5] Testing Admin Manual Priority Override...');
  const testQ = await prisma.question.findFirst({
    where: { questionText: { contains: 'Triple' } }
  });
  if (testQ) {
    const originalLabel = testQ.priority_label;
    // Override to Very High Priority
    const manualReason = 'Admin curated priority: Fundamental judicial benchmark for industrial adjudication.';
    const overridden = await adminOverrideQuestionPriority(testQ.id, {
      priorityLabel: PRIORITY_LABELS.VERY_HIGH,
      customWhyImportant: manualReason
    });
    assert(overridden.priority_label === PRIORITY_LABELS.VERY_HIGH, 'Manual override set label to Very High Priority');
    assert(overridden.isManualPriority === true, 'isManualPriority flag set to true');
    assert(overridden.why_important === manualReason, 'Custom why_important stored');

    // Reset back to evidence-based auto calculation
    const restored = await adminOverrideQuestionPriority(testQ.id, {
      resetToAuto: true
    });
    assert(restored.isManualPriority === false, 'isManualPriority reset to false');
    console.log(`  ✓ Successfully restored priority to: ${restored.priority_label}`);
  }

  console.log('\n==================================================');
  console.log('  ALL QUESTION PRIORITY TESTS PASSED! 100% SUCCESS');
  console.log('==================================================\n');
}

runPriorityTests()
  .catch(err => {
    console.error('Test runner failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
