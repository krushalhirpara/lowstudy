import prisma from '../prisma.js';

export const SU_SEM3_SUBJECT_CODES = ['220301', '220302', '220303', '220304', '220305'];

/**
 * Calculates consecutive active study days based on real user activity timestamps.
 * A study day is earned through meaningful activity (quizzes, mock tests, question practice, topic progress, revision).
 */
export function calculateStudyStreak(activityDates) {
  if (!activityDates || activityDates.length === 0) return 0;

  // Format date in Asia/Kolkata (IST) to normalize daily boundaries
  const toDateString = (d) => {
    if (!d) return null;
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(date);
    } catch {
      return null;
    }
  };

  const uniqueDateSet = new Set(
    activityDates.map(toDateString).filter(Boolean)
  );

  if (uniqueDateSet.size === 0) return 0;

  const now = new Date();
  const todayStr = toDateString(now);
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = toDateString(yesterdayDate);

  let currentDate;
  if (uniqueDateSet.has(todayStr)) {
    currentDate = new Date(now);
  } else if (uniqueDateSet.has(yesterdayStr)) {
    currentDate = yesterdayDate;
  } else {
    // Streak broken / no recent activity today or yesterday
    return 0;
  }

  let streak = 0;
  while (true) {
    const checkStr = toDateString(currentDate);
    if (uniqueDateSet.has(checkStr)) {
      streak++;
      // Move 1 day back
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Retrieves the complete student dashboard dataset derived EXCLUSIVELY from
 * the authenticated student's real database records.
 * NEVER returns seeded demo/fallback numbers for user activity metrics.
 */
export async function getStudentDashboardData(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Valid authenticated student userId is required');
  }

  // 1. Fetch User and Academic Profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      city: true,
      phoneNumber: true,
      profileCompleted: true,
      universityId: true,
      courseId: true,
      semesterId: true,
      streakDays: true,
      createdAt: true,
      university: {
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          logo: true,
        },
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          totalSemesters: true,
        }
      },
      semester: {
        select: {
          id: true,
          title: true,
          semesterNumber: true,
        }
      }
    },
  });

  if (!user) {
    throw new Error('Student account not found');
  }

  // Determine target academic context
  const targetUniId = user.universityId || 'su';
  const targetSemesterId = user.semesterId || 'su-llb-3yr-sem3';

  // 2. Fetch University, Course, Semester context & Academic Subjects
  const [university, course, semester, subjects] = await Promise.all([
    user.university
      ? Promise.resolve(user.university)
      : prisma.university.findUnique({
          where: { id: targetUniId },
          select: { id: true, name: true, code: true, city: true, logo: true },
        }),
    user.course
      ? Promise.resolve(user.course)
      : prisma.course.findFirst({
          where: {
            OR: [
              { id: user.courseId || 'su-llb-3yr' },
              { universityId: targetUniId }
            ]
          },
          select: { id: true, name: true, code: true, totalSemesters: true },
        }),
    user.semester
      ? Promise.resolve(user.semester)
      : prisma.semester.findFirst({
          where: {
            OR: [
              { id: targetSemesterId },
              { course: { universityId: targetUniId } }
            ]
          },
          select: { id: true, title: true, semesterNumber: true },
        }),
    prisma.subject.findMany({
      where: {
        semesterId: targetSemesterId,
      },
      orderBy: { shortCode: 'asc' },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' },
          include: {
            topics: {
              orderBy: { topicNumber: 'asc' },
              include: {
                notes: true,
                questions: true,
                mcqs: true
              }
            }
          }
        },
        _count: {
          select: {
            mcqs: true,
            previousPapers: true,
            mockTests: true
          }
        }
      }
    })
  ]);

  // 3. Fetch Student's REAL Activity Records (STRICTLY scoped to authenticated userId)
  const [
    studyProgressList,
    testAttempts,
    testAnswers,
    answerPracticeAttempts,
    wrongAnswers,
    bookmarks,
    revisionItems,
    userStudyPlans,
    importantQuestionsRaw
  ] = await Promise.all([
    // StudyProgress (Topic completions & confidence)
    prisma.studyProgress.findMany({
      where: { userId },
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true }
            }
          }
        }
      },
      orderBy: { lastStudiedAt: 'desc' }
    }),

    // TestAttempts (Student quiz & mock test attempts)
    prisma.testAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    }),

    // TestAnswers (MCQ questions answered by user)
    prisma.testAnswer.findMany({
      where: {
        attempt: { userId }
      },
      include: {
        mcq: {
          include: {
            topic: {
              include: {
                unit: {
                  include: { subject: true }
                }
              }
            },
            subject: true
          }
        }
      }
    }),

    // AnswerPracticeAttempts (Descriptive/subjective questions solved by student)
    prisma.answerPracticeAttempt.findMany({
      where: { userId },
      include: {
        question: {
          include: {
            topic: {
              include: {
                unit: {
                  include: { subject: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    // WrongAnswers (Mistake Notebook records)
    prisma.wrongAnswer.findMany({
      where: { userId, isResolved: false },
      orderBy: { lastWrongAt: 'desc' },
      include: {
        mcq: {
          include: {
            topic: {
              include: {
                unit: {
                  include: { subject: true }
                }
              }
            },
            subject: true
          }
        }
      }
    }),

    // Bookmarks (Saved notes, case laws, sections)
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),

    // RevisionItems (Spaced repetition queue)
    prisma.revisionItem.findMany({
      where: { userId },
      orderBy: { nextReviewAt: 'asc' },
      take: 15
    }),

    // StudyPlans (Personalized study plans created by student)
    prisma.studyPlan.findMany({
      where: { userId, isActive: true },
      orderBy: { updatedAt: 'desc' },
      take: 1
    }),

    // High-yield questions from syllabus repository
    prisma.question.findMany({
      where: {
        topic: {
          unit: {
            subject: {
              semesterId: targetSemesterId
            }
          }
        },
        priority_label: {
          in: ['Very High Priority', 'High Priority']
        }
      },
      take: 4,
      include: {
        topic: {
          include: {
            unit: {
              include: { subject: true }
            }
          }
        }
      }
    })
  ]);

  // 4. Calculate REAL Study Streak
  const activityTimestamps = [
    ...testAttempts.map(a => a.completedAt || a.createdAt),
    ...answerPracticeAttempts.map(a => a.createdAt),
    ...studyProgressList.map(sp => sp.lastStudiedAt || sp.updatedAt || sp.createdAt),
    ...wrongAnswers.map(wa => wa.lastWrongAt || wa.updatedAt || wa.createdAt),
    ...revisionItems.map(r => r.lastReviewedAt || r.updatedAt)
  ].filter(Boolean);

  const realStudyStreakDays = calculateStudyStreak(activityTimestamps);

  // Update user streak in DB asynchronously if changed
  if (user.streakDays !== realStudyStreakDays) {
    prisma.user.update({
      where: { id: userId },
      data: { streakDays: realStudyStreakDays }
    }).catch(() => {});
  }

  // 5. Calculate Questions Solved, MCQs Solved, Mock Tests
  // Questions Solved: Completed descriptive practice attempts + completed question revisions
  const practicedQuestionIdSet = new Set(answerPracticeAttempts.map(a => a.questionId));
  revisionItems.filter(r => r.entityType === 'QUESTION' && r.reviewCount > 0).forEach(r => {
    practicedQuestionIdSet.add(r.entityId);
  });
  const totalQuestionsSolvedCount = practicedQuestionIdSet.size;

  // MCQs Solved: Actual completed MCQs submitted in test/quiz attempts
  const totalMcqsSolvedCount = testAnswers.length;

  // Mock Tests Completed: Actual mock tests submitted
  const mockTestAttempts = testAttempts.filter(ta =>
    ta.mockTestId != null ||
    (ta.practiceMode && ta.practiceMode.toUpperCase().includes('MOCK'))
  );
  const totalMockTestsCompleted = mockTestAttempts.length;

  // 6. Calculate Per-Subject Real Progress
  const completedTopicIdSet = new Set(
    studyProgressList.filter(sp => sp.isCompleted).map(sp => sp.topicId)
  );
  const topicStudyMap = new Map(studyProgressList.map(sp => [sp.topicId, sp]));

  const subjectProgressDetails = (subjects || []).map(subj => {
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    let totalNotesCount = 0;
    let notesReadCount = 0;
    let totalQuestionsCount = 0;
    let practicedQuestionsCount = 0;
    const totalMcqsCount = subj._count?.mcqs || 0;

    (subj.units || []).forEach(unit => {
      (unit.topics || []).forEach(topic => {
        totalTopicsCount++;
        if (completedTopicIdSet.has(topic.id)) {
          completedTopicsCount++;
        }

        if (topic.notes && topic.notes.length > 0) {
          totalNotesCount += topic.notes.length;
          if (completedTopicIdSet.has(topic.id) || topicStudyMap.has(topic.id)) {
            notesReadCount += topic.notes.length;
          }
        } else {
          totalNotesCount += 1;
          if (completedTopicIdSet.has(topic.id) || topicStudyMap.has(topic.id)) {
            notesReadCount += 1;
          }
        }

        if (topic.questions && topic.questions.length > 0) {
          totalQuestionsCount += topic.questions.length;
          topic.questions.forEach(q => {
            if (practicedQuestionIdSet.has(q.id)) {
              practicedQuestionsCount++;
            }
          });
        }
      });
    });

    const subjectTestAnswers = testAnswers.filter(ans => {
      const sId = ans.mcq?.subjectId || ans.mcq?.topic?.unit?.subjectId;
      return sId === subj.id;
    });

    const mcqsSolved = subjectTestAnswers.length;
    const mcqsCorrect = subjectTestAnswers.filter(ans => ans.isCorrect).length;
    const mcqAccuracy = mcqsSolved > 0 ? Math.round((mcqsCorrect / mcqsSolved) * 100) : 0;

    const subjectAttempts = testAttempts.filter(ta => {
      if (ta.subjectId === subj.id) return true;
      if (ta.topicPerformance && ta.topicPerformance.includes(subj.shortCode)) return true;
      return false;
    });

    const testsAttempted = subjectAttempts.length;
    const avgScore = testsAttempted > 0
      ? Math.round(
          subjectAttempts.reduce(
            (acc, a) => acc + (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0),
            0
          ) / testsAttempted
        )
      : 0;

    const lastScore = subjectAttempts[0] && subjectAttempts[0].totalQuestions > 0
      ? Math.round((subjectAttempts[0].score / subjectAttempts[0].totalQuestions) * 100)
      : 0;

    const topicCompletionPct = totalTopicsCount > 0
      ? Math.round((completedTopicsCount / totalTopicsCount) * 100)
      : 0;
    const notesProgressPct = totalNotesCount > 0
      ? Math.min(100, Math.round((notesReadCount / totalNotesCount) * 100))
      : 0;
    const questionsPracticedPct = totalQuestionsCount > 0
      ? Math.min(100, Math.round((practicedQuestionsCount / totalQuestionsCount) * 100))
      : 0;

    const hasSubjectActivity =
      completedTopicsCount > 0 ||
      notesReadCount > 0 ||
      practicedQuestionsCount > 0 ||
      mcqsSolved > 0 ||
      testsAttempted > 0;

    const overallSubjectPercentage = hasSubjectActivity
      ? Math.min(
          100,
          Math.round(
            topicCompletionPct * 0.35 +
            notesProgressPct * 0.20 +
            questionsPracticedPct * 0.20 +
            (totalMcqsCount > 0 ? Math.min(100, (mcqsSolved / totalMcqsCount) * 100) : 0) * 0.15 +
            avgScore * 0.10
          )
        )
      : 0;

    return {
      id: subj.id,
      code: subj.shortCode,
      title: subj.title,
      category: subj.category || 'Core Law',
      credits: subj.credits || 4,
      color: subj.color || 'from-blue-600 to-indigo-900',
      overallPercentage: overallSubjectPercentage,
      topicCompletion: {
        completed: completedTopicsCount,
        total: totalTopicsCount,
        percentage: topicCompletionPct
      },
      notesProgress: {
        read: notesReadCount,
        total: totalNotesCount,
        percentage: notesProgressPct
      },
      questionsPracticed: {
        practiced: practicedQuestionsCount,
        total: totalQuestionsCount,
        percentage: questionsPracticedPct
      },
      mcqsSolved: {
        solved: mcqsSolved,
        correct: mcqsCorrect,
        total: totalMcqsCount,
        accuracy: mcqAccuracy
      },
      testPerformance: {
        averageScore: avgScore,
        testsAttempted: testsAttempted,
        lastScore: lastScore
      },
      subjectUrl: `/academic/subject/${subj.id}`
    };
  });

  // Overall Preparation Percentage (0% for a student with no activity)
  const overallPreparationPercentage = subjectProgressDetails.length > 0
    ? Math.round(
        subjectProgressDetails.reduce((sum, s) => sum + (s.overallPercentage || 0), 0) /
        subjectProgressDetails.length
      )
    : 0;

  // 7. Assemble Dashboard Sections (STRICTLY REAL DATA)

  // Section 1: Continue Preparation
  let continueTopic = null;
  const recentStudy = studyProgressList.find(sp => sp.topic);
  if (recentStudy && recentStudy.topic) {
    const t = recentStudy.topic;
    continueTopic = {
      topicId: t.id,
      topicTitle: t.title,
      topicNumber: t.topicNumber || 1,
      unitNumber: t.unit?.unitNumber || 1,
      unitTitle: t.unit?.title || 'General Legal Unit',
      subjectCode: t.unit?.subject?.shortCode || 'LAW',
      subjectTitle: t.unit?.subject?.title || 'Law Subject',
      lastStudiedAt: recentStudy.lastStudiedAt,
      continueUrl: `/academic/topic/${t.id}`
    };
  }

  // Section 2: Today's Study Plan
  let todaysStudyPlan = [];
  if (userStudyPlans.length > 0 && userStudyPlans[0].planDataJson) {
    try {
      const parsed = JSON.parse(userStudyPlans[0].planDataJson);
      if (Array.isArray(parsed?.days) && parsed.days.length > 0) {
        const todayDay = parsed.days[0];
        todaysStudyPlan = (todayDay.tasks || []).map((task, idx) => ({
          id: task.id || `task-${idx}`,
          title: task.title || 'Study Task',
          subjectCode: task.subjectCode || 'LAW',
          subjectTitle: task.subjectTitle || 'Law Subject',
          type: task.type || 'TOPIC_READ',
          estimatedMins: task.durationMinutes || task.estimatedMins || 20,
          isCompleted: Boolean(task.isCompleted),
          actionUrl: task.actionUrl || '/curriculum'
        }));
      }
    } catch {
      todaysStudyPlan = [];
    }
  }

  // Section 3: Weak Topics (Derived from real student performance)
  const weakTopicMap = new Map();

  // A. Study progress low confidence
  studyProgressList
    .filter(sp => sp.confidenceLevel === 'LOW' && sp.topic)
    .forEach(sp => {
      weakTopicMap.set(sp.topic.id, {
        topicId: sp.topic.id,
        title: sp.topic.title,
        unitNumber: sp.topic.unit?.unitNumber || 1,
        subjectCode: sp.topic.unit?.subject?.shortCode || 'LAW',
        subjectTitle: sp.topic.unit?.subject?.title || 'Subject',
        confidenceLevel: sp.confidenceLevel,
        revisionUrl: `/academic/topic/${sp.topic.id}`
      });
    });

  // B. Topics with repeated wrong answers
  wrongAnswers.forEach(wa => {
    const t = wa.mcq?.topic;
    if (t && !weakTopicMap.has(t.id)) {
      weakTopicMap.set(t.id, {
        topicId: t.id,
        title: t.title,
        unitNumber: t.unit?.unitNumber || 1,
        subjectCode: t.unit?.subject?.shortCode || 'LAW',
        subjectTitle: t.unit?.subject?.title || 'Subject',
        confidenceLevel: 'LOW',
        revisionUrl: `/academic/topic/${t.id}`
      });
    }
  });

  const weakTopicsList = Array.from(weakTopicMap.values()).slice(0, 5);

  // Section 4: Wrong Answers (My Mistakes)
  const wrongAnswersData = {
    totalMistakes: wrongAnswers.length,
    recentMistakes: wrongAnswers.slice(0, 4).map(wa => ({
      id: wa.id,
      mcqId: wa.mcqId,
      questionText: wa.mcq?.questionText || 'Practice Question',
      subjectCode: wa.mcq?.subject?.shortCode || wa.mcq?.topic?.unit?.subject?.shortCode || 'LAW',
      topicTitle: wa.mcq?.topic?.title || 'Legal Principles'
    })),
    practiceUrl: '/revision/mistakes'
  };

  // Section 5: Bookmarks
  const bookmarksData = bookmarks.map(b => ({
    id: b.id,
    entityType: b.entityType,
    entityId: b.entityId,
    url: b.entityType === 'NOTE'
      ? '/notes'
      : b.entityType === 'CASE_LAW'
      ? '/case-laws'
      : b.entityType === 'LEGAL_SECTION'
      ? '/bare-acts'
      : b.entityType === 'QUESTION'
      ? '/question-bank'
      : '/curriculum'
  }));

  // Section 6: Recent Tests
  const recentTestsData = testAttempts.slice(0, 5).map(ta => ({
    id: ta.id,
    practiceMode: ta.practiceMode || 'Timed Quiz',
    score: Math.round(ta.score || 0),
    totalQuestions: ta.totalQuestions || 0,
    percentage: ta.totalQuestions > 0 ? Math.round((ta.score / ta.totalQuestions) * 100) : 0,
    completedAt: ta.completedAt
  }));

  // Section 7: Quick Revision Deck
  const quickRevisionData = {
    totalDue: revisionItems.length,
    items: revisionItems.slice(0, 5).map(r => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      intervalDays: r.intervalDays,
      repetitionNumber: r.repetitionNumber
    })),
    practiceUrl: '/quiz'
  };

  // Section 8: Important Questions (Real syllabus questions)
  const importantQuestionsData = importantQuestionsRaw.map(q => ({
    id: q.id,
    questionText: q.questionText,
    marks: q.marks || 14,
    priorityLabel: q.priority_label || 'High Priority',
    whyImportant: q.why_important || 'Featured in university examinations and addresses core statutory provisions.',
    subjectCode: q.topic?.unit?.subject?.shortCode || 'LAW',
    topicTitle: q.topic?.title || 'Legal Concept',
    practiceUrl: '/question-bank'
  }));

  // Section 9: Upcoming Examination
  // Verified syllabus examination schedule (isAvailable: false when no official circular is published)
  const upcomingExamData = {
    isAvailable: false,
    title: null,
    session: null,
    examStartDate: null,
    daysRemaining: null
  };

  return {
    student: {
      id: user.id,
      fullName: user.fullName || user.email.split('@')[0],
      email: user.email,
      city: user.city || null,
      universityId: user.universityId || null,
      isProfileComplete: Boolean(user.city && (user.universityId || user.university)),
      streakDays: realStudyStreakDays,
    },
    academicContext: {
      university: {
        id: university?.id || 'su',
        name: university?.name || 'Gujarat Public Law University',
        code: university?.code || 'GU',
        city: university?.city || 'Gujarat'
      },
      course: {
        id: course?.id || 'su-llb-3yr',
        name: course?.name || '3-Year LL.B.',
        code: course?.code || 'LLB-3YR',
        totalSemesters: course?.totalSemesters || 6
      },
      semester: {
        id: semester?.id || targetSemesterId,
        title: semester?.title || 'Semester 3',
        semesterNumber: semester?.semesterNumber || 3
      }
    },
    overallPreparationPercentage,
    coreMetrics: {
      questionsSolved: totalQuestionsSolvedCount,
      mcqsSolved: totalMcqsSolvedCount,
      mockTestsCompleted: totalMockTestsCompleted,
      studyStreak: realStudyStreakDays
    },
    subjectProgress: subjectProgressDetails,
    sections: {
      continuePreparation: continueTopic,
      todaysStudyPlan,
      weakTopics: weakTopicsList,
      wrongAnswers: wrongAnswersData,
      bookmarks: bookmarksData,
      recentTests: recentTestsData,
      quickRevision: quickRevisionData,
      importantQuestions: importantQuestionsData,
      upcomingExam: upcomingExamData
    }
  };
}

/**
 * Updates a study plan target status in the database for the authenticated user.
 */
export async function updateStudyPlanTarget({ userId, targetId, isCompleted }) {
  if (!userId || !targetId) {
    throw new Error('User ID and target ID are required');
  }

  const activePlan = await prisma.studyPlan.findFirst({
    where: { userId, isActive: true },
    orderBy: { updatedAt: 'desc' }
  });

  if (activePlan && activePlan.planDataJson) {
    try {
      const planData = JSON.parse(activePlan.planDataJson);
      let updated = false;
      if (Array.isArray(planData.days)) {
        for (const day of planData.days) {
          if (Array.isArray(day.tasks)) {
            for (const task of day.tasks) {
              if (task.id === targetId) {
                task.isCompleted = Boolean(isCompleted);
                updated = true;
              }
            }
          }
        }
      }
      if (updated) {
        await prisma.studyPlan.update({
          where: { id: activePlan.id },
          data: {
            planDataJson: JSON.stringify(planData),
            updatedAt: new Date()
          }
        });
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  return { success: true, targetId, isCompleted };
}
