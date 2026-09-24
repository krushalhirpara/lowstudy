import prisma from '../src/lib/prisma.js';
import {
  getExamModeDashboardData,
  generateExamRevisionSchedule,
  EXAM_MODE_COMPLIANCE,
  REVISION_HORIZONS
} from '../src/lib/services/examModeService.js';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 FOCUSED EXAM MODE TEST SUITE (AUTOMATED VERIFICATION)');
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
    // -------------------------------------------------------------
    // Test 1: Exam Mode Dashboard Data Aggregation
    // -------------------------------------------------------------
    console.log('--- Test 1: Exam Mode Dashboard Overview Metrics ---');
    const examData = await getExamModeDashboardData(userId);

    assert(typeof examData.overview.daysRemaining === 'number' && examData.overview.daysRemaining > 0, `Days Remaining calculated: ${examData.overview.daysRemaining} days`);
    assert(typeof examData.overview.syllabusCompletionPercentage === 'number', `Syllabus Completion calculated: ${examData.overview.syllabusCompletionPercentage}%`);
    assert(typeof examData.overview.revisionPendingCount === 'number', `Revision Pending counted: ${examData.overview.revisionPendingCount} items`);
    assert(typeof examData.overview.mockTestsPendingCount === 'number', `Mock Tests Pending counted: ${examData.overview.mockTestsPendingCount} tests`);
    assert(Array.isArray(examData.weakTopics), `Weak Topics list returned (${examData.weakTopics.length} topics)`);
    assert(examData.weakTopics.length > 0, 'Weak topics identified for priority remediation');

    // -------------------------------------------------------------
    // Test 2: 5 Semester 3 Subjects Progress Gauges
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Subject Progress Across 5 Semester 3 Subjects ---');
    assert(Array.isArray(examData.subjectProgress), 'Subject Progress array returned');
    assert(examData.subjectProgress.length === 5, 'Exactly 5 Semester 3 subjects tracked');
    
    const subjectCodes = examData.subjectProgress.map(s => s.code);
    console.log(`Tracked subjects: ${subjectCodes.join(', ')}`);
    assert(subjectCodes.includes('220301'), 'Labour Law - I (220301) tracked');
    assert(subjectCodes.includes('220302'), 'Labour Law - II (220302) tracked');
    assert(subjectCodes.includes('220303'), 'Taxation Laws (220303) tracked');
    assert(subjectCodes.includes('220304'), 'Banking Laws (220304) tracked');
    assert(subjectCodes.includes('220305'), 'IT & Cyber Laws (220305) tracked');

    // -------------------------------------------------------------
    // Test 3: Multi-Horizon Revision Plans (3-Day, 7-Day, 15-Day)
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Generating Revision Schedules Across 3 Horizons ---');
    const plan3 = await generateExamRevisionSchedule({ userId, horizon: 'THREE_DAY' });
    const plan7 = await generateExamRevisionSchedule({ userId, horizon: 'SEVEN_DAY' });
    const plan15 = await generateExamRevisionSchedule({ userId, horizon: 'FIFTEEN_DAY' });

    assert(plan3.days.length === 3, '3-Day Revision generated exactly 3 days');
    assert(plan7.days.length === 7, '7-Day Revision generated exactly 7 days');
    assert(plan15.days.length === 15, '15-Day Revision generated exactly 15 days');

    // -------------------------------------------------------------
    // Test 4: Strict 6-Level Priority Hierarchy Verification
    // 1. Weak Topics -> 2. Important Topics -> 3. PYQ Topics ->
    // 4. Uncompleted Topics -> 5. Revision -> 6. Mock Tests
    // -------------------------------------------------------------
    console.log('\n--- Test 4: 6-Level Priority Hierarchy Invariant ---');
    const day1Tasks = plan7.days[0].tasks;
    const taskPriorities = day1Tasks.map(t => t.priorityLevel);
    console.log(`Day 1 Task Priority Levels: ${taskPriorities.join(', ')}`);

    // Verify ordering is monotonically increasing
    let isMonotonic = true;
    for (let i = 1; i < taskPriorities.length; i++) {
      if (taskPriorities[i] < taskPriorities[i - 1]) {
        isMonotonic = false;
        break;
      }
    }
    assert(isMonotonic, 'Task execution sequence strictly obeys the 6-level priority hierarchy');

    // Check individual priority levels present
    assert(taskPriorities.includes(1) || day1Tasks.some(t => t.type === 'WEAK_TOPIC'), 'Level 1: Weak Topics scheduled first');
    assert(taskPriorities.includes(2) || day1Tasks.some(t => t.type === 'IMPORTANT_TOPIC'), 'Level 2: Important Syllabus Topics scheduled');
    assert(taskPriorities.includes(3) || day1Tasks.some(t => t.type === 'PYQ_PRACTICE'), 'Level 3: Previous-Paper Relevant Topics scheduled');
    assert(taskPriorities.includes(5) || day1Tasks.some(t => t.type === 'REVISION_DRILL'), 'Level 5: Spaced Revision scheduled');

    // -------------------------------------------------------------
    // Test 5: The 6 Core Exam Mode Modules Data Verification
    // -------------------------------------------------------------
    console.log('\n--- Test 5: The 6 Core Exam Mode Modules Verification ---');
    const m = examData.modules;
    
    // Module 1: Quick Revision
    assert(!!m.quickRevision && m.quickRevision.totalItems > 0, 'Module 1: Quick Revision assets populated');
    
    // Module 2: Important Questions
    assert(Array.isArray(m.importantQuestions) && m.importantQuestions.length > 0, `Module 2: Important Questions populated (${m.importantQuestions.length} questions)`);
    assert(!!m.importantQuestions[0].practiceUrl, 'Important Questions contain direct practice URL');

    // Module 3: Important Sections
    assert(Array.isArray(m.importantSections) && m.importantSections.length >= 5, `Module 3: Important Sections populated (${m.importantSections.length} sections)`);
    assert(m.importantSections.some(s => s.section.includes('2(j)')), 'Section 2(j) Industry present');

    // Module 4: Important Case Laws
    assert(Array.isArray(m.importantCaseLaws) && m.importantCaseLaws.length >= 4, `Module 4: Important Case Laws populated (${m.importantCaseLaws.length} precedents)`);
    assert(m.importantCaseLaws.some(c => c.caseName.includes('Bangalore Water Supply')), 'Bangalore Water Supply precedent present');

    // Module 5: Previous Papers
    assert(Array.isArray(m.previousPapers) && m.previousPapers.length > 0, `Module 5: Previous Papers populated (${m.previousPapers.length} papers)`);

    // Module 6: Mock Tests
    assert(Array.isArray(m.mockTests) && m.mockTests.length > 0, `Module 6: Mock Tests populated (${m.mockTests.length} tests)`);

    // -------------------------------------------------------------
    // Test 6: Anti-Prediction & No Guaranteed Marks Compliance
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Anti-Prediction & Statutory Disclaimers Invariant ---');
    assert(examData.compliance.DISCLAIMER.includes('no claim or guarantee of specific examination marks'), 'Disclaimer explicitly forbids claiming guaranteed marks');
    assert(examData.compliance.NO_PREDICTION_NOTICE.includes('does NOT predict or guarantee exact future university question papers'), 'Notice explicitly forbids claiming guaranteed exam questions');
    assert(examData.compliance.NO_PREDICTION_NOTICE.includes('reflect past curricular patterns'), 'Paper recurrence explicitly labeled as historical patterns');
    assert(!examData.compliance.TITLE.includes('Official University Marking'), 'Branding does not masquerade as official university examination');

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
