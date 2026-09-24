import prisma from '../prisma.js';

// Pedagogical Sequence Invariant
export const PEDAGOGICAL_SEQUENCE = ['LEARN', 'PRACTICE', 'MCQ', 'REVISION', 'TEST'];

// Standard stage duration weightings (must sum to 1.0)
export const STAGE_WEIGHTS = {
  LEARN: 0.35,     // 35% time on core concepts & statutory readings
  PRACTICE: 0.20,  // 20% time drafting descriptive model exam answers
  MCQ: 0.15,       // 15% time on active recall MCQ drills
  REVISION: 0.15,   // 15% time reviewing mistake notebook & weak points
  TEST: 0.15       // 15% time taking timed checkpoint test
};

export const HORIZONS = {
  TODAY: { key: 'TODAY', days: 1, label: "Today's Plan" },
  THREE_DAY: { key: 'THREE_DAY', days: 3, label: "3-Day Plan" },
  SEVEN_DAY: { key: 'SEVEN_DAY', days: 7, label: "7-Day Plan" },
  FIFTEEN_DAY: { key: 'FIFTEEN_DAY', days: 15, label: "15-Day Plan" }
};

export const COMPLIANCE_DISCLAIMERS = {
  NO_GUARANTEED_MARKS: "This study plan is an adaptive pedagogical aid designed according to syllabus structure and student progress. Lowstudy makes no claim or guarantee of specific marks, grades, or university pass percentages.",
  NO_GUARANTEED_QUESTIONS: "Previous paper analytics and priority indicators reflect historical university exam patterns and statutory significance. Lowstudy does not predict or guarantee exact future university examination questions.",
  REALISTIC_WORKLOAD: "Workloads are strictly time-boxed between 1.0 and 5.0 hours daily with distributed cognitive intervals to prevent academic fatigue."
};

/**
 * Calculates a priority/urgency score for each topic based on:
 * 1. Weakness / Low Confidence (Weight: 35%)
 * 2. Mistake Book frequency (Weight: 20%)
 * 3. Previous Paper recurrence (Weight: 25%)
 * 4. Syllabus Incompletion (Weight: 20%)
 */
function calculateTopicUrgency(topic, studyProgressMap, wrongAnswerCounts, pyqCounts) {
  const progress = studyProgressMap.get(topic.id);
  const isCompleted = progress?.isCompleted || false;
  const confidence = progress?.confidenceLevel || 'MEDIUM';

  // Weakness score (0 to 100)
  let weaknessScore = 40;
  if (confidence === 'LOW') weaknessScore = 95;
  else if (confidence === 'MEDIUM') weaknessScore = 50;
  else if (confidence === 'HIGH') weaknessScore = 15;

  // Mistakes score (0 to 100)
  const mistakes = wrongAnswerCounts.get(topic.id) || 0;
  const mistakeScore = Math.min(100, mistakes * 35);

  // Previous paper frequency score (0 to 100)
  const pyqCount = pyqCounts.get(topic.id) || 0;
  const pyqScore = Math.min(100, pyqCount * 25 + 20);

  // Incompletion score (0 or 100)
  const incompletionScore = isCompleted ? 10 : 85;

  // Composite Urgency (higher = needs more immediate attention)
  const urgency = Math.round(
    weaknessScore * 0.35 +
    mistakeScore * 0.20 +
    pyqScore * 0.25 +
    incompletionScore * 0.20
  );

  return {
    urgency,
    weaknessScore,
    mistakeScore,
    pyqScore,
    isCompleted,
    confidence
  };
}

/**
 * Generates an adaptive study plan for a student based on live database metrics
 */
export async function generateAdaptiveStudyPlan({
  userId = 'usr-student-01',
  targetExamDate = null,
  dailyHours = 2.5,
  horizon = 'SEVEN_DAY'
}) {
  // 1. Enforce realistic workload bounds
  const validatedHours = Math.min(Math.max(Number(dailyHours) || 2.5, 1.0), 5.0);
  const totalDailyMinutes = Math.round(validatedHours * 60);

  const horizonConfig = HORIZONS[horizon] || HORIZONS.SEVEN_DAY;
  const numberOfDays = horizonConfig.days;

  // Default exam date if not provided (45 days in future)
  const examDate = targetExamDate ? new Date(targetExamDate) : new Date(Date.now() + 45 * 86400000);

  // 2. Fetch all academic context across Semester 3
  const [subjects, studyProgressList, wrongAnswers, testAttempts, highPriorityQuestions] = await Promise.all([
    // All 5 subjects with units and topics
    prisma.subject.findMany({
      where: { semesterId: 'su-llb-3yr-sem3' },
      orderBy: { shortCode: 'asc' },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' },
          include: {
            topics: {
              orderBy: { topicNumber: 'asc' },
              include: {
                questions: {
                  take: 3
                },
                mcqs: { take: 5 }
              }
            }
          }
        }
      }
    }),

    // Student topic completion & confidence
    prisma.studyProgress.findMany({
      where: { userId }
    }),

    // Student wrong answers
    prisma.wrongAnswer.findMany({
      where: { userId, isResolved: false },
      include: { mcq: true }
    }),

    // Student mock test performance
    prisma.testAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 10
    }),

    // Top priority descriptive questions
    prisma.question.findMany({
      where: {
        topic: { unit: { subject: { semesterId: 'su-llb-3yr-sem3' } } }
      },
      orderBy: { priority_score: 'desc' },
      take: 25,
      include: {
        topic: {
          include: { unit: { include: { subject: true } } }
        }
      }
    })
  ]);

  // Index user data for quick calculations
  const studyProgressMap = new Map(studyProgressList.map(sp => [sp.topicId, sp]));
  
  // Count wrong answers per topic
  const wrongAnswerCounts = new Map();
  for (const wa of wrongAnswers) {
    if (wa.mcq?.topicId) {
      wrongAnswerCounts.set(wa.mcq.topicId, (wrongAnswerCounts.get(wa.mcq.topicId) || 0) + 1);
    }
  }

  // Count question/paper frequency per topic
  const pyqCounts = new Map();
  for (const q of highPriorityQuestions) {
    if (q.topicId) {
      pyqCounts.set(q.topicId, (pyqCounts.get(q.topicId) || 0) + (q.previous_year_count || q.pyqFrequency || 1));
    }
  }

  // Flatten and score all topics across all 5 subjects
  const scoredTopics = [];
  for (const subj of subjects) {
    for (const unit of subj.units) {
      for (const topic of unit.topics) {
        const scoreData = calculateTopicUrgency(topic, studyProgressMap, wrongAnswerCounts, pyqCounts);
        scoredTopics.push({
          topic,
          unit,
          subject: subj,
          ...scoreData
        });
      }
    }
  }

  // Sort topics by urgency descending (weakest and highest priority first)
  scoredTopics.sort((a, b) => b.urgency - a.urgency);

  // Separate weak topics and general topics to guarantee balanced subject coverage
  const weakTopics = scoredTopics.filter(t => t.confidence === 'LOW' || t.mistakeScore > 30);
  const otherTopics = scoredTopics.filter(t => t.confidence !== 'LOW' && t.mistakeScore <= 30);

  // Multi-day allocation: Guarantee coverage of all subjects while prioritizing weak topics
  const selectedTopicsForDays = [];
  const usedTopicIds = new Set();
  const subjectUsageCount = new Map(subjects.map(s => [s.id, 0]));

  for (let d = 0; d < numberOfDays; d++) {
    let chosen = null;
    
    // In early days (days 0, 1), check for weak topics
    if (d < 2 && weakTopics.length > 0) {
      const candidate = weakTopics.find(t => !usedTopicIds.has(t.topic.id));
      if (candidate) {
        chosen = candidate;
      }
    }

    // Otherwise, select from the subject with lowest representation so far
    if (!chosen) {
      // Sort subjects by usage count ascending
      const sortedSubjs = [...subjects].sort((a, b) => {
        return (subjectUsageCount.get(a.id) || 0) - (subjectUsageCount.get(b.id) || 0);
      });

      // Find an unused topic in the least-used subject
      for (const leastUsedSubj of sortedSubjs) {
        const candidate = scoredTopics.find(t => t.subject.id === leastUsedSubj.id && !usedTopicIds.has(t.topic.id));
        if (candidate) {
          chosen = candidate;
          break;
        }
      }

      // Fallback: any unused topic
      if (!chosen) {
        chosen = scoredTopics.find(t => !usedTopicIds.has(t.topic.id)) || scoredTopics[d % scoredTopics.length];
      }
    }

    usedTopicIds.add(chosen.topic.id);
    subjectUsageCount.set(chosen.subject.id, (subjectUsageCount.get(chosen.subject.id) || 0) + 1);
    selectedTopicsForDays.push(chosen);
  }

  // 3. Construct Day-by-Day Plan with the strict sequence:
  // Learn -> Practice -> MCQ -> Revision -> Test
  const days = [];
  const startDate = new Date();

  // Calculate durations for each stage based on daily hours
  const learnMins = Math.round(totalDailyMinutes * STAGE_WEIGHTS.LEARN);
  const practiceMins = Math.round(totalDailyMinutes * STAGE_WEIGHTS.PRACTICE);
  const mcqMins = Math.round(totalDailyMinutes * STAGE_WEIGHTS.MCQ);
  const revisionMins = Math.round(totalDailyMinutes * STAGE_WEIGHTS.REVISION);
  const testMins = totalDailyMinutes - (learnMins + practiceMins + mcqMins + revisionMins); // Exact sum to totalDailyMinutes

  for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
    const scheduledDate = new Date(startDate.getTime() + dayIndex * 86400000);
    const dayContext = selectedTopicsForDays[dayIndex];
    const { topic, unit, subject, confidence, urgency } = dayContext;

    // Representative descriptive question for practice
    const descriptiveQuestion = topic.questions?.[0] || highPriorityQuestions.find(q => q.topicId === topic.id) || null;

    // 1. LEARN Task
    const learnTask = {
      id: `task-${dayIndex + 1}-1-learn`,
      dayIndex: dayIndex + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      sequenceStage: 'LEARN',
      sequenceOrder: 1,
      title: `Study Concept & Statutes: ${topic.title}`,
      description: `Review fundamental legal doctrines, statutory definitions, and model lecture notes for ${subject.title}.`,
      durationMinutes: learnMins,
      subjectCode: subject.shortCode,
      subjectTitle: subject.title,
      unitNumber: unit.unitNumber,
      topicId: topic.id,
      topicTitle: topic.title,
      status: 'PENDING', // PENDING, ACCEPTED, COMPLETED, SKIPPED, RESCHEDULED
      actionUrl: `/academic/topic/${topic.id}`,
      actionText: 'Open Topic Study Notes',
      priorityReason: urgency > 70 ? 'High urgency: Prioritized due to weak comprehension metrics' : 'Curricular syllabus milestone'
    };

    // 2. PRACTICE Task
    const practiceTask = {
      id: `task-${dayIndex + 1}-2-practice`,
      dayIndex: dayIndex + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      sequenceStage: 'PRACTICE',
      sequenceOrder: 2,
      title: descriptiveQuestion
        ? `Draft Answer (${descriptiveQuestion.marks || 10} Marks): ${descriptiveQuestion.questionText.slice(0, 75)}...`
        : `Draft Model Exam Answer: Key Principles of ${topic.title}`,
      description: 'Practice legal structure: Introduction -> Definition -> Statutory Provision -> Landmark Case Law -> Conclusion.',
      durationMinutes: practiceMins,
      subjectCode: subject.shortCode,
      subjectTitle: subject.title,
      unitNumber: unit.unitNumber,
      topicId: topic.id,
      topicTitle: topic.title,
      questionId: descriptiveQuestion?.id || null,
      status: 'PENDING',
      actionUrl: descriptiveQuestion ? `/question-bank` : `/question-bank?subject=${subject.id}`,
      actionText: 'Draft Answer in Question Bank',
      priorityReason: 'Practicing descriptive exam writing reinforces substantive memory'
    };

    // 3. MCQ Task
    const mcqTask = {
      id: `task-${dayIndex + 1}-3-mcq`,
      dayIndex: dayIndex + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      sequenceStage: 'MCQ',
      sequenceOrder: 3,
      title: `MCQ Active Recall Drill: ${topic.title}`,
      description: `Solve 5 to 10 diagnostic multiple-choice questions with instant answer rationales.`,
      durationMinutes: mcqMins,
      subjectCode: subject.shortCode,
      subjectTitle: subject.title,
      unitNumber: unit.unitNumber,
      topicId: topic.id,
      topicTitle: topic.title,
      status: 'PENDING',
      actionUrl: `/quiz?mode=TOPIC&topicId=${topic.id}`,
      actionText: 'Launch MCQ Drill',
      priorityReason: 'Validates statutory section numbers and core definitions'
    };

    // 4. REVISION Task
    const revisionTask = {
      id: `task-${dayIndex + 1}-4-revision`,
      dayIndex: dayIndex + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      sequenceStage: 'REVISION',
      sequenceOrder: 4,
      title: confidence === 'LOW'
        ? `Mistake Review: Revisit incorrect answers on ${topic.title}`
        : `Spaced Revision: Flashcards & Case Laws (${subject.shortCode})`,
      description: 'Revisit past mistakes, mnemonic summaries, and leading High Court / Supreme Court ratios.',
      durationMinutes: revisionMins,
      subjectCode: subject.shortCode,
      subjectTitle: subject.title,
      unitNumber: unit.unitNumber,
      topicId: topic.id,
      topicTitle: topic.title,
      status: 'PENDING',
      actionUrl: `/revision`,
      actionText: 'Open Revision & Mistake Book',
      priorityReason: 'Spaced repetition prevents rapid cognitive decay'
    };

    // 5. TEST Task
    const testTask = {
      id: `task-${dayIndex + 1}-5-test`,
      dayIndex: dayIndex + 1,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      sequenceStage: 'TEST',
      sequenceOrder: 5,
      title: dayIndex === numberOfDays - 1
        ? `Comprehensive Horizon Test: ${subject.shortCode} Checkpoint`
        : `Timed Daily Checkpoint: ${subject.title} (Unit ${unit.unitNumber})`,
      description: 'Simulate university exam conditions with negative marking and timed navigation.',
      durationMinutes: testMins,
      subjectCode: subject.shortCode,
      subjectTitle: subject.title,
      unitNumber: unit.unitNumber,
      topicId: topic.id,
      topicTitle: topic.title,
      status: 'PENDING',
      actionUrl: `/mock-test`,
      actionText: 'Begin Timed Test',
      priorityReason: 'Builds exam stamina and time-management confidence'
    };

    // Strict Sequence verification: Learn -> Practice -> MCQ -> Revision -> Test
    const tasks = [learnTask, practiceTask, mcqTask, revisionTask, testTask];

    days.push({
      dayIndex: dayIndex + 1,
      dayTitle: dayIndex === 0 ? 'Today (Day 1)' : `Day ${dayIndex + 1}`,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      subjectFocus: {
        code: subject.shortCode,
        title: subject.title,
        unitNumber: unit.unitNumber,
        topicTitle: topic.title
      },
      dailyHours: validatedHours,
      totalMinutes: totalDailyMinutes,
      isWeakTopicFocus: confidence === 'LOW' || urgency > 70,
      tasks
    });
  }

  // Assemble full plan payload
  const planPayload = {
    horizon: horizonConfig.key,
    horizonLabel: horizonConfig.label,
    totalDays: numberOfDays,
    dailyHours: validatedHours,
    totalDailyMinutes,
    targetExam: 'Saurashtra University LL.B. Semester 3 Examinations',
    targetExamDate: examDate.toISOString(),
    daysRemainingToExam: Math.max(1, Math.round((examDate.getTime() - Date.now()) / 86400000)),
    pedagogicalSequence: PEDAGOGICAL_SEQUENCE,
    disclaimers: COMPLIANCE_DISCLAIMERS,
    createdAt: new Date().toISOString(),
    days
  };

  // Archive any older active study plan for this horizon
  await prisma.studyPlan.updateMany({
    where: { userId, isActive: true, title: { contains: `[${horizonConfig.key}]` } },
    data: { isActive: false }
  });

  // Persist the new active study plan
  const savedPlan = await prisma.studyPlan.create({
    data: {
      userId,
      title: `Adaptive Study Plan [${horizonConfig.key}] (${horizonConfig.label})`,
      targetExam: 'Saurashtra University LL.B. Semester 3',
      targetExamDate: examDate,
      dailyHours: validatedHours,
      planDataJson: JSON.stringify(planPayload),
      isActive: true
    }
  });

  return formatStudyPlanResponse(savedPlan);
}

/**
 * Formats a Prisma StudyPlan record into an enriched, computed response
 */
function formatStudyPlanResponse(planRecord) {
  const planData = typeof planRecord.planDataJson === 'string'
    ? JSON.parse(planRecord.planDataJson)
    : planRecord.planDataJson;

  // Compute live task metrics
  let totalTasks = 0;
  let completedTasks = 0;
  let acceptedTasks = 0;
  let skippedTasks = 0;
  let rescheduledTasks = 0;
  let completedMinutes = 0;

  for (const day of planData.days) {
    for (const task of day.tasks) {
      totalTasks++;
      if (task.status === 'COMPLETED') {
        completedTasks++;
        completedMinutes += task.durationMinutes || 0;
      } else if (task.status === 'ACCEPTED') {
        acceptedTasks++;
      } else if (task.status === 'SKIPPED') {
        skippedTasks++;
      } else if (task.status === 'RESCHEDULED') {
        rescheduledTasks++;
      }
    }
  }

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const adherencePercentage = totalTasks > 0 ? Math.round(((completedTasks + acceptedTasks) / totalTasks) * 100) : 0;

  return {
    id: planRecord.id,
    title: planRecord.title,
    targetExam: planRecord.targetExam,
    targetExamDate: planRecord.targetExamDate,
    dailyHours: planRecord.dailyHours,
    isActive: planRecord.isActive,
    updatedAt: planRecord.updatedAt,
    completionPercentage,
    adherencePercentage,
    completedMinutes,
    metrics: {
      totalTasks,
      completedTasks,
      acceptedTasks,
      skippedTasks,
      rescheduledTasks
    },
    ...planData
  };
}

/**
 * Retrieves the student's active plan, auto-generating one if none exists
 */
export async function getStudentStudyPlan(userId = 'usr-student-01', horizon = 'SEVEN_DAY') {
  const horizonConfig = HORIZONS[horizon] || HORIZONS.SEVEN_DAY;

  const existingPlan = await prisma.studyPlan.findFirst({
    where: {
      userId,
      isActive: true,
      title: { contains: `[${horizonConfig.key}]` }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (existingPlan) {
    return formatStudyPlanResponse(existingPlan);
  }

  // Auto-generate if not yet created
  return await generateAdaptiveStudyPlan({ userId, horizon: horizonConfig.key });
}

/**
 * Handles individual task actions:
 * - ACCEPT: Student commits to this task
 * - COMPLETE: Student completes the task (syncs topic study progress)
 * - SKIP: Student skips the task
 * - RESCHEDULE: Student shifts the task to a different day/date
 */
export async function updatePlanTaskAction({
  userId = 'usr-student-01',
  planId,
  taskId,
  action, // 'ACCEPT' | 'COMPLETE' | 'SKIP' | 'RESCHEDULE'
  newDate = null,
  targetDayIndex = null
}) {
  const planRecord = await prisma.studyPlan.findUnique({
    where: { id: planId }
  });

  if (!planRecord) {
    throw new Error('Study plan not found');
  }

  if (planRecord.userId !== userId) {
    throw new Error('Unauthorized plan access');
  }

  const planData = JSON.parse(planRecord.planDataJson);
  let foundTask = null;
  let targetDay = null;

  // Locate task
  for (const day of planData.days) {
    const t = day.tasks.find(tk => tk.id === taskId);
    if (t) {
      foundTask = t;
      targetDay = day;
      break;
    }
  }

  if (!foundTask) {
    throw new Error(`Task ${taskId} not found in plan`);
  }

  // Execute Action
  switch (action.toUpperCase()) {
    case 'ACCEPT':
      foundTask.status = 'ACCEPTED';
      foundTask.acceptedAt = new Date().toISOString();
      break;

    case 'COMPLETE':
      foundTask.status = 'COMPLETED';
      foundTask.completedAt = new Date().toISOString();

      // Automatically update StudyProgress for the topic
      if (foundTask.topicId) {
        await prisma.studyProgress.upsert({
          where: {
            userId_topicId: { userId, topicId: foundTask.topicId }
          },
          update: {
            isCompleted: true,
            timeSpentSeconds: { increment: (foundTask.durationMinutes || 30) * 60 },
            confidenceLevel: 'HIGH',
            lastStudiedAt: new Date()
          },
          create: {
            userId,
            topicId: foundTask.topicId,
            isCompleted: true,
            timeSpentSeconds: (foundTask.durationMinutes || 30) * 60,
            confidenceLevel: 'HIGH',
            lastStudiedAt: new Date()
          }
        });
      }
      break;

    case 'SKIP':
      foundTask.status = 'SKIPPED';
      foundTask.skippedAt = new Date().toISOString();
      break;

    case 'RESCHEDULE':
      foundTask.status = 'RESCHEDULED';
      foundTask.rescheduledAt = new Date().toISOString();
      if (newDate) {
        foundTask.scheduledDate = newDate;
      }
      if (targetDayIndex !== null && targetDayIndex !== undefined) {
        foundTask.dayIndex = targetDayIndex;
      }
      break;

    default:
      throw new Error(`Unsupported action: ${action}`);
  }

  // Save updated plan data back to database
  const updatedRecord = await prisma.studyPlan.update({
    where: { id: planId },
    data: {
      planDataJson: JSON.stringify(planData),
      updatedAt: new Date()
    }
  });

  return formatStudyPlanResponse(updatedRecord);
}
