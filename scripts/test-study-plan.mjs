import {
  generateAdaptiveStudyPlan,
  getStudentStudyPlan,
  updatePlanTaskAction,
  PEDAGOGICAL_SEQUENCE,
  COMPLIANCE_DISCLAIMERS
} from '../src/lib/services/studyPlanService.js';
import prisma from '../src/lib/prisma.js';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 ADAPTIVE AI STUDY PLAN TEST SUITE (AUTOMATED VERIFICATION)');
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
    // Test 1: Generate All 4 Plan Horizons
    // -------------------------------------------------------------
    console.log('--- Test 1: Generating Plans for All 4 Horizons ---');
    const horizons = ['TODAY', 'THREE_DAY', 'SEVEN_DAY', 'FIFTEEN_DAY'];
    const generatedPlans = {};

    for (const h of horizons) {
      const plan = await generateAdaptiveStudyPlan({
        userId,
        targetExamDate: '2026-11-20',
        dailyHours: 3.0,
        horizon: h
      });
      generatedPlans[h] = plan;
      console.log(`Generated ${h} plan with ID: ${plan.id}, Total Days: ${plan.totalDays}`);
    }

    assert(generatedPlans.TODAY.days.length === 1, "TODAY plan has exactly 1 day");
    assert(generatedPlans.THREE_DAY.days.length === 3, "THREE_DAY plan has exactly 3 days");
    assert(generatedPlans.SEVEN_DAY.days.length === 7, "SEVEN_DAY plan has exactly 7 days");
    assert(generatedPlans.FIFTEEN_DAY.days.length === 15, "FIFTEEN_DAY plan has exactly 15 days");

    // -------------------------------------------------------------
    // Test 2: Strict Pedagogical Sequence Invariant
    // Sequence: LEARN -> PRACTICE -> MCQ -> REVISION -> TEST
    // -------------------------------------------------------------
    console.log('\n--- Test 2: Pedagogical Sequence Invariant Verification ---');
    console.log(`Required sequence: ${PEDAGOGICAL_SEQUENCE.join(' -> ')}`);

    let sequenceValid = true;
    for (const [horizonKey, plan] of Object.entries(generatedPlans)) {
      for (const day of plan.days) {
        const stages = day.tasks.map(t => t.sequenceStage);
        const matchesSequence = JSON.stringify(stages) === JSON.stringify(PEDAGOGICAL_SEQUENCE);
        if (!matchesSequence) {
          sequenceValid = false;
          console.error(`Sequence mismatch in ${horizonKey} Day ${day.dayIndex}: ${stages.join(' -> ')}`);
        }
      }
    }
    assert(sequenceValid, 'Every day across all 4 horizons strictly executes Learn -> Practice -> MCQ -> Revision -> Test');

    // -------------------------------------------------------------
    // Test 3: Realistic Workload Calculation & Invariants
    // -------------------------------------------------------------
    console.log('\n--- Test 3: Realistic Workload Verification ---');
    const plan7 = generatedPlans.SEVEN_DAY;
    assert(plan7.dailyHours === 3.0, 'Daily hours preserved at 3.0 hours');
    assert(plan7.totalDailyMinutes === 180, 'Total daily minutes equals 180 minutes');

    let sumAccurate = true;
    for (const day of plan7.days) {
      const taskMinsSum = day.tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
      if (taskMinsSum !== 180) {
        sumAccurate = false;
        console.error(`Day ${day.dayIndex} task sum is ${taskMinsSum} mins (expected 180)`);
      }
    }
    assert(sumAccurate, 'Sum of task stage durations exactly matches configured daily study minutes (180 mins)');

    // Test boundary bounds enforcement
    const clampedPlan = await generateAdaptiveStudyPlan({
      userId,
      dailyHours: 12.0, // Unrealistic request
      horizon: 'TODAY'
    });
    assert(clampedPlan.dailyHours === 5.0, 'Excessive study hours safely capped at 5.0 hours maximum');

    // -------------------------------------------------------------
    // Test 4: Weak Topic Prioritization & Subject Coverage
    // -------------------------------------------------------------
    console.log('\n--- Test 4: Weak Topic Prioritization & Syllabus Coverage ---');
    const plan15 = generatedPlans.FIFTEEN_DAY;
    const coveredSubjects = new Set(plan15.days.map(d => d.subjectFocus?.code));
    console.log(`Subjects covered in 15-day sprint: ${Array.from(coveredSubjects).join(', ')}`);
    assert(coveredSubjects.size >= 4, '15-Day plan maintains broad syllabus coverage across Semester 3 subjects');

    const day1WeakFocus = plan15.days[0].isWeakTopicFocus;
    assert(day1WeakFocus === true, 'Day 1 prioritizes weak topics / high urgency topics');

    // -------------------------------------------------------------
    // Test 5: Compliance Disclaimers Invariant
    // -------------------------------------------------------------
    console.log('\n--- Test 5: Legal & Educational Compliance Disclaimers ---');
    assert(!!plan7.disclaimers.NO_GUARANTEED_MARKS, 'Plan payload contains explicit disclaimer: No Guaranteed Marks');
    assert(!!plan7.disclaimers.NO_GUARANTEED_QUESTIONS, 'Plan payload contains explicit disclaimer: No Guaranteed Exam Questions');
    assert(plan7.disclaimers.NO_GUARANTEED_MARKS.includes('Lowstudy makes no claim or guarantee of specific marks'), 'Disclaimer text verified');

    // -------------------------------------------------------------
    // Test 6: Student Action Mutations (Accept, Complete, Skip, Reschedule)
    // -------------------------------------------------------------
    console.log('\n--- Test 6: Student Actions on Plan Tasks ---');
    const testPlan = clampedPlan;
    const task1 = testPlan.days[0].tasks[0];
    const task2 = testPlan.days[0].tasks[1];
    const task3 = testPlan.days[0].tasks[2];

    // Action A: ACCEPT
    console.log(`Testing ACCEPT on task: ${task1.id}`);
    const acceptedResult = await updatePlanTaskAction({
      userId,
      planId: testPlan.id,
      taskId: task1.id,
      action: 'ACCEPT'
    });
    const updatedTask1 = acceptedResult.days[0].tasks.find(t => t.id === task1.id);
    assert(updatedTask1.status === 'ACCEPTED', 'Task status successfully updated to ACCEPTED');
    assert(acceptedResult.metrics.acceptedTasks >= 1, 'Accepted tasks metric incremented');

    // Action B: COMPLETE
    console.log(`Testing COMPLETE on task: ${task1.id}`);
    const completedResult = await updatePlanTaskAction({
      userId,
      planId: testPlan.id,
      taskId: task1.id,
      action: 'COMPLETE'
    });
    const completedTask1 = completedResult.days[0].tasks.find(t => t.id === task1.id);
    assert(completedTask1.status === 'COMPLETED', 'Task status successfully updated to COMPLETED');
    assert(completedResult.completionPercentage > 0, `Plan completion percentage calculated (${completedResult.completionPercentage}%)`);

    // Verify StudyProgress sync
    if (completedTask1.topicId) {
      const topicProgress = await prisma.studyProgress.findUnique({
        where: { userId_topicId: { userId, topicId: completedTask1.topicId } }
      });
      assert(topicProgress?.isCompleted === true, 'Topic study progress automatically marked completed in database');
    }

    // Action C: SKIP
    console.log(`Testing SKIP on task: ${task2.id}`);
    const skippedResult = await updatePlanTaskAction({
      userId,
      planId: testPlan.id,
      taskId: task2.id,
      action: 'SKIP'
    });
    const skippedTask2 = skippedResult.days[0].tasks.find(t => t.id === task2.id);
    assert(skippedTask2.status === 'SKIPPED', 'Task status successfully updated to SKIPPED');
    assert(skippedResult.metrics.skippedTasks >= 1, 'Skipped tasks metric tracked');

    // Action D: RESCHEDULE
    console.log(`Testing RESCHEDULE on task: ${task3.id}`);
    const reschedDate = '2026-11-25';
    const rescheduledResult = await updatePlanTaskAction({
      userId,
      planId: testPlan.id,
      taskId: task3.id,
      action: 'RESCHEDULE',
      newDate: reschedDate
    });
    const rescheduledTask3 = rescheduledResult.days[0].tasks.find(t => t.id === task3.id);
    assert(rescheduledTask3.status === 'RESCHEDULED', 'Task status successfully updated to RESCHEDULED');
    assert(rescheduledTask3.scheduledDate === reschedDate, 'Scheduled date updated to new date');

    // -------------------------------------------------------------
    // Test 7: Get Student Active Plan Retrieval
    // -------------------------------------------------------------
    console.log('\n--- Test 7: Active Plan Retrieval ---');
    const retrievedPlan = await getStudentStudyPlan(userId, 'TODAY');
    assert(retrievedPlan.id === testPlan.id, 'Active study plan correctly retrieved from database');
    assert(retrievedPlan.metrics.completedTasks >= 1, 'Persisted completion counts verified');

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
