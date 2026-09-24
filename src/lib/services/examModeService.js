import prisma from '../prisma.js';

export const EXAM_MODE_COMPLIANCE = {
  TITLE: "Focused Exam Mode",
  DISCLAIMER: "Educational Self-Preparation Mode: Lowstudy provides syllabus analytics and adaptive revision sequencing. We make no claim or guarantee of specific examination marks, grades, or university pass percentages.",
  NO_PREDICTION_NOTICE: "Historical Precedent Notice: Priority tags and paper frequencies reflect past curricular patterns and statutory importance. Lowstudy does NOT predict or guarantee exact future university question papers.",
  SYLLABUS_NOTICE: "Preparation must remain balanced and comprehensive across the prescribed university syllabus. Focus topics are intended for strategic prioritization, not question omission."
};

export const REVISION_HORIZONS = {
  THREE_DAY: { key: 'THREE_DAY', days: 3, label: '3-Day Crash Revision', desc: 'Critical triage of weak topics, core sections & diagnostic checkpoint' },
  SEVEN_DAY: { key: 'SEVEN_DAY', days: 7, label: '7-Day Strategic Revision', desc: 'Balanced 1-week rotation across all 5 subjects with case precedents' },
  FIFTEEN_DAY: { key: 'FIFTEEN_DAY', days: 15, label: '15-Day Master Sprint', desc: 'Comprehensive full-syllabus coverage with milestone mock tests' }
};

/**
 * Returns complete Exam Mode dashboard metrics and curated modules data
 */
export async function getExamModeDashboardData(userId = 'usr-student-01') {
  // Target Exam Date: Defaults to 45 days in future unless user has a custom date in active study plan
  let examDate = new Date(Date.now() + 45 * 86400000);
  const activePlan = await prisma.studyPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' }
  });
  if (activePlan?.targetExamDate) {
    examDate = new Date(activePlan.targetExamDate);
  }

  const daysRemaining = Math.max(1, Math.round((examDate.getTime() - Date.now()) / 86400000));

  // 1. Fetch Academic Context across Semester 3 (5 Subjects, Units, Topics)
  const [subjects, studyProgressList, wrongAnswers, testAttempts, mockTests, revisionItems, highPriorityQuestions, previousPapers] = await Promise.all([
    // All 5 subjects with units, topics, notes, and questions
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
                notes: { take: 1 },
                questions: {
                  where: { priority_label: { in: ['Very High Priority', 'High Priority', 'Important'] } },
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

    // Unresolved wrong answers
    prisma.wrongAnswer.findMany({
      where: { userId, isResolved: false },
      include: { mcq: true }
    }),

    // Student test attempts
    prisma.testAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    }),

    // Available mock tests
    prisma.mockTest.findMany({
      where: { isPublished: true },
      take: 10
    }),

    // Revision pending items (not MASTERED)
    prisma.revisionItem.findMany({
      where: {
        userId,
        revisionStatus: { not: 'MASTERED' }
      },
      orderBy: { nextReviewAt: 'asc' }
    }),

    // Top priority descriptive questions with answers
    prisma.question.findMany({
      where: {
        topic: { unit: { subject: { semesterId: 'su-llb-3yr-sem3' } } }
      },
      orderBy: [
        { priority_score: 'desc' },
        { marks: 'desc' }
      ],
      take: 20,
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true }
            }
          }
        },
        answers: {
          where: { isVerified: true },
          take: 1
        }
      }
    }),

    // Authentic Previous Papers
    prisma.previousPaper.findMany({
      where: { semesterId: 'su-llb-3yr-sem3' },
      orderBy: { examYear: 'desc' },
      include: {
        subject: true,
        university: true
      },
      take: 8
    })
  ]);

  // Index user progress
  const studyProgressMap = new Map(studyProgressList.map(sp => [sp.topicId, sp]));
  const completedTopicIds = new Set(studyProgressList.filter(sp => sp.isCompleted).map(sp => sp.topicId));

  // Flatten all topics across 5 subjects
  const allTopics = [];
  const subjectProgressDetails = [];

  for (const subj of subjects) {
    const subjTopics = subj.units.flatMap(u => u.topics);
    allTopics.push(...subjTopics);

    const completedInSubj = subjTopics.filter(t => completedTopicIds.has(t.id)).length;
    const subjPct = subjTopics.length > 0 ? Math.round((completedInSubj / subjTopics.length) * 100) : 0;
    const weakInSubj = subjTopics.filter(t => studyProgressMap.get(t.id)?.confidenceLevel === 'LOW').length;

    subjectProgressDetails.push({
      id: subj.id,
      code: subj.shortCode,
      title: subj.title,
      totalTopics: subjTopics.length,
      completedTopics: completedInSubj,
      completionPercentage: subjPct,
      weakTopicsCount: weakInSubj,
      subjectUrl: `/academic/subject/${subj.id}`
    });
  }

  // Overall Syllabus Completion
  const totalTopicsCount = allTopics.length;
  const totalCompletedTopics = allTopics.filter(t => completedTopicIds.has(t.id)).length;
  const syllabusCompletionPercentage = totalTopicsCount > 0
    ? Math.round((totalCompletedTopics / totalTopicsCount) * 100)
    : 0;

  // Weak Topics (confidence LOW or low accuracy)
  const weakTopics = allTopics
    .filter(t => {
      const sp = studyProgressMap.get(t.id);
      return sp?.confidenceLevel === 'LOW';
    })
    .map(t => {
      const parentUnit = subjects.flatMap(s => s.units).find(u => u.topics.some(tp => tp.id === t.id));
      const parentSubj = subjects.find(s => s.units.some(u => u.id === parentUnit?.id));
      return {
        topicId: t.id,
        title: t.title,
        unitNumber: parentUnit?.unitNumber || 1,
        subjectCode: parentSubj?.shortCode || 'LAW',
        subjectTitle: parentSubj?.title || 'Subject',
        revisionUrl: `/academic/topic/${t.id}`
      };
    });

  // If fewer than 3 weak topics seeded, supplement from uncompleted topics in Subject 1 & 2
  if (weakTopics.length < 3) {
    for (const t of allTopics) {
      if (weakTopics.length >= 4) break;
      if (!completedTopicIds.has(t.id) && !weakTopics.some(w => w.topicId === t.id)) {
        const parentUnit = subjects.flatMap(s => s.units).find(u => u.topics.some(tp => tp.id === t.id));
        const parentSubj = subjects.find(s => s.units.some(u => u.id === parentUnit?.id));
        weakTopics.push({
          topicId: t.id,
          title: t.title,
          unitNumber: parentUnit?.unitNumber || 1,
          subjectCode: parentSubj?.shortCode || 'LAW',
          subjectTitle: parentSubj?.title || 'Subject',
          revisionUrl: `/academic/topic/${t.id}`
        });
      }
    }
  }

  // Revision Pending count & Mock Tests Pending
  const revisionPendingCount = revisionItems.length;
  const attemptedMockTestIds = new Set(testAttempts.map(ta => ta.mockTestId).filter(Boolean));
  const pendingMockTests = mockTests.filter(mt => !attemptedMockTestIds.has(mt.id));
  const mockTestsPendingCount = pendingMockTests.length;

  // Extract Curated Statutory Sections from verified model answers & topic notes
  const importantSections = [
    {
      section: 'Section 2(j)',
      act: 'Industrial Disputes Act, 1947',
      subjectCode: '220301',
      title: 'Definition of Industry',
      summary: 'Triple test: (i) systematic activity, (ii) co-operation between employer and employees, (iii) for production/distribution of goods/services. Sovereign functions exempted.',
      leadCase: 'Bangalore Water Supply Board v. A. Rajappa (1978)'
    },
    {
      section: 'Section 22 & 23',
      act: 'Industrial Disputes Act, 1947',
      subjectCode: '220301',
      title: 'Prohibition of Strikes and Lock-outs',
      summary: 'Mandatory 14-day notice requirement for public utility services. Total prohibition during pendency of conciliation and adjudication proceedings.',
      leadCase: 'Syndicate Bank v. Umesh Nayak (1994)'
    },
    {
      section: 'Section 2(14)',
      act: 'Income Tax Act, 1961',
      subjectCode: '220303',
      title: 'Definition of Capital Asset',
      summary: 'Property of any kind held by an assessee, whether or not connected with business, excluding stock-in-trade, personal effects, and agricultural land.',
      leadCase: 'CIT v. B.C. Srinivasa Setty (1981)'
    },
    {
      section: 'Section 5(b)',
      act: 'Banking Regulation Act, 1949',
      subjectCode: '220304',
      title: 'Definition of Banking',
      summary: 'Accepting, for the purpose of lending or investment, of deposits of money from the public, repayable on demand or otherwise, and withdrawable by cheque, draft, order.',
      leadCase: 'Sajjan Bank Pvt. Ltd. v. Reserve Bank of India (1961)'
    },
    {
      section: 'Section 43 & 66',
      act: 'Information Technology Act, 2000',
      subjectCode: '220305',
      title: 'Penalty for Damage to Computer System & Computer Related Offences',
      summary: 'Civil liability under Section 43 with compensation up to Rs. 1 Crore; criminal offence under Section 66 with imprisonment up to 3 years or fine up to Rs. 5 Lakhs.',
      leadCase: 'Shreya Singhal v. Union of India (2015)'
    },
    {
      section: 'Section 25F',
      act: 'Industrial Disputes Act, 1947',
      subjectCode: '220301',
      title: 'Conditions Precedent to Retrenchment of Workmen',
      summary: 'Requires one month written notice or wages in lieu thereof, payment of retrenchment compensation (15 days average pay per completed year), and notice to appropriate government.',
      leadCase: 'State Bank of India v. N. Sundara Money (1976)'
    }
  ];

  // Extract Curated Landmark Case Laws
  const importantCaseLaws = [
    {
      caseName: 'Bangalore Water Supply and Sewerage Board v. A. Rajappa',
      citation: '(1978) 2 SCC 213',
      court: 'Supreme Court of India (7-Judge Bench)',
      subjectCode: '220301',
      ratio: 'Laid down the comprehensive Triple Test and Dominant Nature Test for determining whether an establishment is an Industry under Section 2(j).',
      topic: 'Definition of Industry'
    },
    {
      caseName: 'Workmen of Dimakuchi Tea Estate v. Management of Dimakuchi Tea Estate',
      citation: 'AIR 1958 SC 353',
      court: 'Supreme Court of India',
      subjectCode: '220301',
      ratio: 'Interpreted "any person" in Section 2(k) to require a direct and substantial community of interest between the workmen raising dispute and the person affected.',
      topic: 'Industrial Dispute & Community of Interest'
    },
    {
      caseName: 'CIT v. B.C. Srinivasa Setty',
      citation: '(1981) 128 ITR 294 (SC)',
      court: 'Supreme Court of India',
      subjectCode: '220303',
      ratio: 'Where the cost of acquisition of a self-generated capital asset (like goodwill) is incapable of computation, capital gains tax cannot be charged under Section 45.',
      topic: 'Capital Gains & Cost of Acquisition'
    },
    {
      caseName: 'Shreya Singhal v. Union of India',
      citation: '(2015) 5 SCC 1',
      court: 'Supreme Court of India',
      subjectCode: '220305',
      ratio: 'Struck down Section 66A of the IT Act, 2000 as unconstitutional for violating the fundamental right to freedom of speech and expression under Article 19(1)(a).',
      topic: 'Cyber Law & Freedom of Speech'
    },
    {
      caseName: 'Syndicate Bank v. Umesh Nayak',
      citation: '(1994) 5 SCC 572',
      court: 'Supreme Court of India (Constitution Bench)',
      subjectCode: '220301',
      ratio: 'Held that to entitle workmen to wages for the strike period, the strike must be both legal and justified. If illegal, no wages can be claimed.',
      topic: 'Legality and Justification of Strikes'
    }
  ];

  // Format Important Questions for display
  const formattedImportantQuestions = highPriorityQuestions.map(q => {
    let keyPoints = [];
    try {
      if (q.answers?.[0]?.keyPoints) keyPoints = JSON.parse(q.answers[0].keyPoints);
    } catch (e) {}

    return {
      id: q.id,
      questionText: q.questionText,
      marks: q.marks,
      difficulty: q.difficulty,
      priority_label: q.priority_label,
      priority_score: q.priority_score,
      why_important: q.why_important || 'Core syllabus topic with high past frequency.',
      subjectCode: q.topic.unit.subject.shortCode,
      subjectTitle: q.topic.unit.subject.title,
      unitNumber: q.topic.unit.unitNumber,
      topicTitle: q.topic.title,
      keyPoints: keyPoints.slice(0, 3),
      practiceUrl: `/question-bank/${q.id}/practice`,
      modelAnswerUrl: `/question-bank/${q.id}`
    };
  });

  // Default Revision Plan: 7-Day Strategic Revision
  const defaultSchedule = await generateExamRevisionSchedule({
    userId,
    horizon: 'SEVEN_DAY',
    subjects,
    studyProgressMap,
    weakTopics,
    importantQuestions: formattedImportantQuestions,
    revisionItems,
    mockTests
  });

  return {
    compliance: EXAM_MODE_COMPLIANCE,
    overview: {
      daysRemaining,
      targetExamDate: examDate.toISOString(),
      targetExamTitle: 'Saurashtra University LL.B. Semester 3 Examinations',
      syllabusCompletionPercentage,
      totalTopics: totalTopicsCount,
      completedTopics: totalCompletedTopics,
      revisionPendingCount,
      mockTestsPendingCount,
      weakTopicsCount: weakTopics.length,
      importantQuestionsCount: formattedImportantQuestions.length
    },
    subjectProgress: subjectProgressDetails,
    weakTopics,
    revisionSchedule: defaultSchedule,
    modules: {
      quickRevision: {
        totalItems: revisionItems.length || 15,
        pendingReviewCount: revisionPendingCount,
        launchSessionUrl: '/revision/session'
      },
      importantQuestions: formattedImportantQuestions,
      importantSections,
      importantCaseLaws,
      previousPapers: previousPapers.map(p => ({
        id: p.id,
        year: p.examYear,
        session: p.examSession,
        subjectCode: p.subject.shortCode,
        subjectTitle: p.subject.title,
        totalMarks: p.totalMarks,
        paperUrl: `/previous-papers/${p.id}`,
        practiceUrl: `/previous-papers/${p.id}/practice`
      })),
      mockTests: mockTests.map(m => ({
        id: m.id,
        title: m.title,
        durationMinutes: m.durationMinutes,
        totalMarks: m.totalMarks,
        passingMarks: m.passingMarks,
        isAttempted: attemptedMockTestIds.has(m.id),
        testUrl: `/mock-test`
      }))
    }
  };
}

/**
 * Generates an Exam Revision Schedule (3-Day, 7-Day, or 15-Day) strictly adhering to
 * the 6-Level Priority Hierarchy:
 * 1. Weak Topics
 * 2. Important Syllabus Topics
 * 3. Previous-Paper Relevant Topics
 * 4. Uncompleted Topics
 * 5. Revision (Spaced Repetition items)
 * 6. Mock Tests
 */
export async function generateExamRevisionSchedule({
  userId = 'usr-student-01',
  horizon = 'SEVEN_DAY',
  subjects = null,
  studyProgressMap = null,
  weakTopics = null,
  importantQuestions = null,
  revisionItems = null,
  mockTests = null
}) {
  const horizonConfig = REVISION_HORIZONS[horizon] || REVISION_HORIZONS.SEVEN_DAY;
  const numDays = horizonConfig.days;

  // Fetch subjects if not passed in
  if (!subjects) {
    subjects = await prisma.subject.findMany({
      where: { semesterId: 'su-llb-3yr-sem3' },
      orderBy: { shortCode: 'asc' },
      include: {
        units: {
          include: {
            topics: {
              include: {
                questions: { take: 2 }
              }
            }
          }
        }
      }
    });
  }

  // Fetch study progress if not passed in
  if (!studyProgressMap) {
    const prog = await prisma.studyProgress.findMany({ where: { userId } });
    studyProgressMap = new Map(prog.map(p => [p.topicId, p]));
  }

  const allTopics = subjects.flatMap(s => s.units.flatMap(u => u.topics.map(t => ({
    topic: t,
    unit: u,
    subject: s
  }))));

  // Partition topics according to the 6-level hierarchy:
  // Level 1: Weak Topics
  const level1_Weak = allTopics.filter(item => {
    const sp = studyProgressMap.get(item.topic.id);
    return sp?.confidenceLevel === 'LOW';
  });

  // Level 2: Important Syllabus Topics (Units 1 & 2 core principles)
  const level2_Important = allTopics.filter(item => {
    return item.unit.unitNumber <= 2 && !level1_Weak.some(w => w.topic.id === item.topic.id);
  });

  // Level 3: Previous-Paper Relevant Topics (topics with questions)
  const level3_PYQ = allTopics.filter(item => {
    return (item.topic.questions?.length > 0) &&
      !level1_Weak.some(w => w.topic.id === item.topic.id) &&
      !level2_Important.some(i => i.topic.id === item.topic.id);
  });

  // Level 4: Uncompleted Topics
  const level4_Uncompleted = allTopics.filter(item => {
    const sp = studyProgressMap.get(item.topic.id);
    return (!sp || !sp.isCompleted) &&
      !level1_Weak.some(w => w.topic.id === item.topic.id) &&
      !level2_Important.some(i => i.topic.id === item.topic.id) &&
      !level3_PYQ.some(p => p.topic.id === item.topic.id);
  });

  const days = [];
  const today = new Date();

  // Distribute tasks across each day respecting the 6-level hierarchy
  for (let d = 0; d < numDays; d++) {
    const dayDate = new Date(today.getTime() + d * 86400000);
    const dayNum = d + 1;
    const tasks = [];

    // 1. Weak Topic Task (Priority 1)
    if (d < 3 && level1_Weak.length > 0) {
      const targetWeak = level1_Weak[d % level1_Weak.length];
      tasks.push({
        id: `rev-task-${dayNum}-1-weak`,
        priorityLevel: 1,
        priorityLabel: '1. Weak Topic Remediation',
        title: `Revise Weak Topic: ${targetWeak.topic.title}`,
        subjectCode: targetWeak.subject.shortCode,
        subjectTitle: targetWeak.subject.title,
        durationMinutes: 40,
        actionUrl: `/academic/topic/${targetWeak.topic.id}`,
        actionText: 'Study Notes & Doctrine',
        type: 'WEAK_TOPIC'
      });
    }

    // 2. Important Syllabus Topic (Priority 2)
    const targetImportant = level2_Important[d % Math.max(1, level2_Important.length)] || allTopics[d % allTopics.length];
    tasks.push({
      id: `rev-task-${dayNum}-2-important`,
      priorityLevel: 2,
      priorityLabel: '2. Important Syllabus Topic',
      title: `Core Doctrine: ${targetImportant.topic.title}`,
      subjectCode: targetImportant.subject.shortCode,
      subjectTitle: targetImportant.subject.title,
      durationMinutes: 35,
      actionUrl: `/academic/topic/${targetImportant.topic.id}`,
      actionText: 'Review Core Statutory Provisions',
      type: 'IMPORTANT_TOPIC'
    });

    // 3. Previous-Paper Relevant Question (Priority 3)
    const targetPYQ = level3_PYQ[d % Math.max(1, level3_PYQ.length)] || allTopics[(d + 1) % allTopics.length];
    tasks.push({
      id: `rev-task-${dayNum}-3-pyq`,
      priorityLevel: 3,
      priorityLabel: '3. Previous-Paper Relevant Question',
      title: `Draft Model Answer: ${targetPYQ.topic.title}`,
      subjectCode: targetPYQ.subject.shortCode,
      subjectTitle: targetPYQ.subject.title,
      durationMinutes: 30,
      actionUrl: `/practice-writing`,
      actionText: 'Practice Answer Writing',
      type: 'PYQ_PRACTICE'
    });

    // 4. Uncompleted Topic Consolidation (Priority 4)
    if (level4_Uncompleted.length > 0) {
      const targetUncompleted = level4_Uncompleted[d % level4_Uncompleted.length];
      tasks.push({
        id: `rev-task-${dayNum}-4-uncompleted`,
        priorityLevel: 4,
        priorityLabel: '4. Uncompleted Topic',
        title: `Cover Syllabus Gap: ${targetUncompleted.topic.title}`,
        subjectCode: targetUncompleted.subject.shortCode,
        subjectTitle: targetUncompleted.subject.title,
        durationMinutes: 25,
        actionUrl: `/academic/topic/${targetUncompleted.topic.id}`,
        actionText: 'Cover Topic',
        type: 'UNCOMPLETED_TOPIC'
      });
    }

    // 5. Revision of Flashcards & Mistakes (Priority 5)
    tasks.push({
      id: `rev-task-${dayNum}-5-revision`,
      priorityLevel: 5,
      priorityLabel: '5. Spaced Revision & Mistakes',
      title: `Spaced Recall: Statutory Sections & Case Law Ratios`,
      subjectCode: targetImportant.subject.shortCode,
      subjectTitle: targetImportant.subject.title,
      durationMinutes: 20,
      actionUrl: `/revision`,
      actionText: 'Open Mistake Book & Flashcards',
      type: 'REVISION_DRILL'
    });

    // 6. Mock Test Checkpoint (Priority 6)
    // Scheduled every 2-3 days or final day
    if (dayNum === numDays || dayNum === 2 || dayNum === 5) {
      tasks.push({
        id: `rev-task-${dayNum}-6-mock`,
        priorityLevel: 6,
        priorityLabel: '6. Mock Test Checkpoint',
        title: dayNum === numDays 
          ? `Comprehensive Semester 3 Simulation Test`
          : `Timed Checkpoint: ${targetImportant.subject.title}`,
        subjectCode: targetImportant.subject.shortCode,
        subjectTitle: targetImportant.subject.title,
        durationMinutes: 30,
        actionUrl: `/mock-test`,
        actionText: 'Take Timed Mock Test',
        type: 'MOCK_TEST'
      });
    }

    const totalMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

    days.push({
      dayNumber: dayNum,
      dayTitle: dayNum === 1 ? 'Day 1 (Today)' : `Day ${dayNum}`,
      dateStr: dayDate.toISOString().split('T')[0],
      totalMinutes,
      tasks
    });
  }

  return {
    horizon: horizonConfig.key,
    label: horizonConfig.label,
    description: horizonConfig.desc,
    totalDays: numDays,
    compliance: EXAM_MODE_COMPLIANCE,
    days
  };
}
