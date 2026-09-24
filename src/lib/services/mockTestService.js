import prisma from '../prisma.js';

export const TEST_TYPES = {
  UNIT_TEST: {
    id: 'UNIT_TEST',
    title: 'Unit Test',
    badge: 'Unit Level',
    description: 'Targeted evaluation testing all legal concepts and provisions within a specific syllabus unit.',
    defaultQuestions: 15,
    defaultMarksPerQuestion: 1.0,
    defaultDurationMinutes: 20,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    passingPercentage: 50
  },
  SUBJECT_TEST: {
    id: 'SUBJECT_TEST',
    title: 'Subject Test',
    badge: 'Subject Mock',
    description: 'Comprehensive subject-level exam balancing questions across all statutory units and topics.',
    defaultQuestions: 30,
    defaultMarksPerQuestion: 1.0,
    defaultDurationMinutes: 40,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    passingPercentage: 50
  },
  FULL_SEMESTER_TEST: {
    id: 'FULL_SEMESTER_TEST',
    title: 'Full Semester Grand Mock Test',
    badge: 'Grand Exam',
    description: 'Official multi-subject semester simulator spanning all core LL.B. subjects with proportional weight.',
    defaultQuestions: 60,
    defaultMarksPerQuestion: 1.0,
    defaultDurationMinutes: 90,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    passingPercentage: 50
  },
  PREVIOUS_PAPER_PRACTICE: {
    id: 'PREVIOUS_PAPER_PRACTICE',
    title: 'Previous Paper Practice',
    badge: 'Past Papers',
    description: 'Practice questions structured around official university examination sessions and high-frequency PYQs.',
    defaultQuestions: 25,
    defaultMarksPerQuestion: 1.0,
    defaultDurationMinutes: 35,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    passingPercentage: 50
  },
  CUSTOM_TEST: {
    id: 'CUSTOM_TEST',
    title: 'Custom Practice Test',
    badge: 'Configurable',
    description: 'Design your own exam: choose subjects, units, question count, time limit, and marking scheme.',
    defaultQuestions: 20,
    defaultMarksPerQuestion: 1.0,
    defaultDurationMinutes: 30,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    passingPercentage: 50
  }
};

/**
 * Retrieves mock test metadata, available academic subjects, units,
 * previous papers, and test presets.
 */
export async function getMockTestMetadata() {
  const [subjects, previousPapers, existingMockTests, totalMcqs, totalMistakes] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      select: {
        id: true,
        shortCode: true,
        title: true,
        credits: true,
        _count: { select: { mcqs: true } },
        units: {
          orderBy: { unitNumber: 'asc' },
          select: {
            id: true,
            unitNumber: true,
            title: true,
            topics: {
              orderBy: { topicNumber: 'asc' },
              select: {
                id: true,
                topicNumber: true,
                title: true,
                _count: { select: { mcqs: true } }
              }
            }
          }
        }
      }
    }),
    prisma.previousPaper.findMany({
      select: {
        id: true,
        examYear: true,
        examSession: true,
        paperCode: true,
        totalMarks: true,
        durationMinutes: true,
        subject: {
          select: { id: true, shortCode: true, title: true }
        }
      }
    }),
    prisma.mockTest.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        durationMinutes: true,
        totalMarks: true,
        passingMarks: true,
        hasNegativeMarking: true,
        negativeMarkValue: true,
        subject: {
          select: { id: true, shortCode: true, title: true }
        },
        _count: { select: { questions: true } }
      }
    }),
    prisma.mcq.count({ where: { status: 'PUBLISHED' } }),
    prisma.wrongAnswer.count({ where: { userId: 'usr-student-01', isResolved: false } })
  ]);

  return {
    testTypes: Object.values(TEST_TYPES),
    subjects,
    previousPapers,
    existingMockTests,
    totalMcqs,
    totalMistakes
  };
}

/**
 * Generates a mock test session for a specified test type and configuration.
 * Adheres strictly to exam security: answers and explanations are completely
 * omitted before submission.
 */
export async function generateMockTestSession({
  testType = 'SUBJECT_TEST',
  subjectId = null,
  unitId = null,
  semesterId = null,
  paperId = null,
  mockTestId = null,
  customConfig = {},
  userId = 'usr-student-01'
}) {
  const typeConfig = TEST_TYPES[testType] || TEST_TYPES.CUSTOM_TEST;

  // Determine configuration parameters (No invented rules: use configured or admin rules)
  const questionCount = Math.max(5, Math.min(100, parseInt(customConfig.questionCount || typeConfig.defaultQuestions, 10)));
  const marksPerQuestion = parseFloat(customConfig.marksPerQuestion ?? typeConfig.defaultMarksPerQuestion) || 1.0;
  const timeLimitMinutes = Math.max(5, Math.min(180, parseInt(customConfig.timeLimitMinutes || typeConfig.defaultDurationMinutes, 10)));
  const hasNegativeMarking = customConfig.hasNegativeMarking !== undefined 
    ? Boolean(customConfig.hasNegativeMarking) 
    : typeConfig.hasNegativeMarking;
  const negativeMarkValue = hasNegativeMarking 
    ? (parseFloat(customConfig.negativeMarkValue ?? typeConfig.negativeMarkValue) || 0.25)
    : 0;
  const randomize = customConfig.randomize !== undefined ? Boolean(customConfig.randomize) : true;

  let questionsRaw = [];
  let testTitle = '';
  let testSubtitle = '';

  // 1. If explicit static MockTest ID is provided
  if (mockTestId) {
    const mt = await prisma.mockTest.findUnique({
      where: { id: mockTestId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            mcq: {
              include: {
                options: { orderBy: { optionKey: 'asc' } },
                topic: {
                  include: { unit: { include: { subject: true } } }
                },
                subject: true
              }
            }
          }
        }
      }
    });

    if (mt && mt.questions.length > 0) {
      questionsRaw = mt.questions.map(q => q.mcq).filter(Boolean);
      testTitle = mt.title;
      testSubtitle = mt.description || 'Curriculum verified mock examination.';
    }
  }

  // 2. Dynamic generation based on Test Type
  if (questionsRaw.length === 0) {
    if (testType === 'UNIT_TEST') {
      if (!unitId) throw new Error('Unit ID is required for Unit Test.');
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { subject: true }
      });
      testTitle = `${unit?.subject?.shortCode || 'Law'} Unit ${unit?.unitNumber}: ${unit?.title} Test`;
      testSubtitle = `Official Unit Test focusing on Unit ${unit?.unitNumber} syllabus provisions.`;

      questionsRaw = await prisma.mcq.findMany({
        where: {
          status: 'PUBLISHED',
          syllabusStatus: { not: 'OUTDATED' },
          topic: { unitId }
        },
        take: questionCount * 2,
        include: {
          options: { orderBy: { optionKey: 'asc' } },
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true
        }
      });
    } else if (testType === 'SUBJECT_TEST') {
      if (!subjectId) throw new Error('Subject ID is required for Subject Test.');
      const subj = await prisma.subject.findUnique({
        where: { id: subjectId }
      });
      testTitle = `${subj?.title || 'Subject'} Comprehensive Mock Test`;
      testSubtitle = `Full-course subject test balancing all statutory units and legal sections.`;

      questionsRaw = await prisma.mcq.findMany({
        where: {
          status: 'PUBLISHED',
          syllabusStatus: { not: 'OUTDATED' },
          OR: [
            { subjectId },
            { topic: { unit: { subjectId } } }
          ]
        },
        take: questionCount * 2,
        include: {
          options: { orderBy: { optionKey: 'asc' } },
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true
        }
      });
    } else if (testType === 'FULL_SEMESTER_TEST') {
      testTitle = 'Gujarat Law Universities LL.B. Semester 1 Grand Mock Exam';
      testSubtitle = 'Comprehensive semester simulation across Constitutional Law, BNS Criminal Law, Torts, and Contract Law.';

      questionsRaw = await prisma.mcq.findMany({
        where: {
          status: 'PUBLISHED',
          syllabusStatus: { not: 'OUTDATED' }
        },
        take: questionCount * 2,
        include: {
          options: { orderBy: { optionKey: 'asc' } },
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true
        }
      });
    } else if (testType === 'PREVIOUS_PAPER_PRACTICE') {
      testTitle = 'University Previous Paper Practice Examination';
      testSubtitle = 'High-frequency exam questions based on Gujarat Universities past examination papers.';

      const whereClause = {
        status: 'PUBLISHED',
        syllabusStatus: { not: 'OUTDATED' }
      };

      if (subjectId) {
        whereClause.OR = [
          { subjectId },
          { topic: { unit: { subjectId } } }
        ];
      }

      questionsRaw = await prisma.mcq.findMany({
        where: whereClause,
        orderBy: [
          { preparationPriority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: questionCount * 2,
        include: {
          options: { orderBy: { optionKey: 'asc' } },
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true
        }
      });
    } else {
      // CUSTOM_TEST
      testTitle = customConfig.title || 'Custom Practice Test';
      testSubtitle = 'Custom-configured law examination test.';

      const whereClause = {
        status: 'PUBLISHED',
        syllabusStatus: { not: 'OUTDATED' }
      };
      if (customConfig.subjectId) {
        whereClause.OR = [
          { subjectId: customConfig.subjectId },
          { topic: { unit: { subjectId: customConfig.subjectId } } }
        ];
      }
      if (customConfig.unitId) {
        whereClause.topic = { unitId: customConfig.unitId };
      }
      if (customConfig.difficulty) {
        whereClause.difficulty = customConfig.difficulty.toUpperCase();
      }

      questionsRaw = await prisma.mcq.findMany({
        where: whereClause,
        take: questionCount * 2,
        include: {
          options: { orderBy: { optionKey: 'asc' } },
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true
        }
      });
    }
  }

  if (questionsRaw.length === 0) {
    throw new Error('No published MCQs matched the selected test criteria.');
  }

  // Shuffle questions if requested
  if (randomize) {
    questionsRaw = questionsRaw.sort(() => 0.5 - Math.random());
  }
  const selectedQuestions = questionsRaw.slice(0, questionCount);

  const totalMarks = Math.round(selectedQuestions.length * marksPerQuestion);
  const passingMarks = Math.round(totalMarks * (typeConfig.passingPercentage / 100));

  // Sanitize questions for active examination session (CRITICAL: HIDE CORRECT ANSWERS & EXPLANATIONS)
  const questions = selectedQuestions.map((q, idx) => {
    const subj = q.subject || q.topic?.unit?.subject;
    const unit = q.topic?.unit;
    const topic = q.topic;

    let options = q.options.map(o => ({
      id: o.id,
      key: o.optionKey,
      text: o.optionText,
      textGu: o.optionTextGu
      // isCorrect is intentionally STRIPPED
    }));

    if (randomize) {
      options = options.sort(() => 0.5 - Math.random()).map((opt, oIdx) => ({
        ...opt,
        key: String.fromCharCode(65 + oIdx)
      }));
    }

    return {
      id: q.id,
      questionNumber: idx + 1,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      difficulty: q.difficulty,
      marks: marksPerQuestion,
      subject: subj ? { id: subj.id, code: subj.shortCode, title: subj.title } : null,
      unit: unit ? { id: unit.id, unitNumber: unit.unitNumber, title: unit.title } : null,
      topic: topic ? { id: topic.id, topicNumber: topic.topicNumber, title: topic.title } : null,
      options,
      explanation: null, // Strictly hidden
      explanationGu: null // Strictly hidden
    };
  });

  return {
    testMeta: {
      testType,
      typeTitle: typeConfig.title,
      badge: typeConfig.badge,
      title: testTitle,
      subtitle: testSubtitle,
      totalQuestions: questions.length,
      marksPerQuestion,
      totalMarks,
      passingMarks,
      timeLimitMinutes,
      timeLimitSeconds: timeLimitMinutes * 60,
      hasNegativeMarking,
      negativeMarkValue,
      subjectId,
      unitId,
      mockTestId
    },
    questions
  };
}

/**
 * Evaluates submitted mock test responses, computes:
 * 1. Final score and marks (adhering strictly to configured negative marking rules)
 * 2. Multi-dimensional performance: Subject-wise, Unit-wise, and Topic-wise
 * 3. Weak topics identification (accuracy < 60%)
 * 4. Saves attempt and answers into SQLite database
 * 5. Automatically logs all wrong answers into My Mistakes (WrongAnswer table)
 */
export async function submitMockTestAttempt({
  attemptId = null,
  mockTestId = null,
  testType = 'SUBJECT_TEST',
  subjectId = null,
  unitId = null,
  answers = {}, // { [mcqId]: 'A' | 'B' | 'C' | 'D' }
  timeSpentSeconds = 0,
  testConfig = {},
  userId = 'usr-student-01'
}) {
  // Prevent duplicate submissions
  if (attemptId) {
    const existing = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
    });
    if (existing) {
      throw new Error('This test session has already been submitted. Duplicate submissions are prevented.');
    }
  }

  const mcqIds = Object.keys(answers);
  if (mcqIds.length === 0) {
    throw new Error('No question responses provided for submission.');
  }

  // Fetch full verified MCQs from database
  const dbMcqs = await prisma.mcq.findMany({
    where: { id: { in: mcqIds } },
    include: {
      options: { orderBy: { optionKey: 'asc' } },
      topic: {
        include: {
          unit: {
            include: {
              subject: true
            }
          }
        }
      },
      subject: true
    }
  });

  const mcqMap = new Map(dbMcqs.map(q => [q.id, q]));

  const marksPerQuestion = parseFloat(testConfig.marksPerQuestion) || 1.0;
  const hasNegativeMarking = Boolean(testConfig.hasNegativeMarking);
  const negativeMarkValue = hasNegativeMarking ? (parseFloat(testConfig.negativeMarkValue) || 0.25) : 0;
  const totalQuestions = mcqIds.length;
  const totalMarks = Math.round(totalQuestions * marksPerQuestion);
  const passingMarks = testConfig.passingMarks || Math.round(totalMarks * 0.5);

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let rawMarks = 0;
  let totalPenalty = 0;

  // Track 3-tier performance
  const subjectMap = {};
  const unitMap = {};
  const topicMap = {};

  const testAnswersData = [];
  const wrongAnswersToUpsert = [];
  const questionsReview = [];

  for (let i = 0; i < mcqIds.length; i++) {
    const qId = mcqIds[i];
    const q = mcqMap.get(qId);
    if (!q) continue;

    const selectedKey = answers[qId] || null;
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctKey = correctOpt ? correctOpt.optionKey : 'A';

    const isSkipped = !selectedKey;
    const isCorrect = !isSkipped && selectedKey === correctKey;
    const isIncorrect = !isSkipped && selectedKey !== correctKey;

    if (isCorrect) {
      correctCount++;
      rawMarks += marksPerQuestion;
    } else if (isIncorrect) {
      incorrectCount++;
      if (hasNegativeMarking) {
        rawMarks -= negativeMarkValue;
        totalPenalty += negativeMarkValue;
      }
      // Mandatory requirement: All wrong answers must enter My Mistakes
      wrongAnswersToUpsert.push({ mcqId: q.id, studentAnswer: selectedKey });
    } else {
      skippedCount++;
    }

    // Academic Metadata
    const sId = q.subject?.id || q.topic?.unit?.subject?.id || 'gen-sub';
    const sCode = q.subject?.shortCode || q.topic?.unit?.subject?.shortCode || 'LAW';
    const sTitle = q.subject?.title || q.topic?.unit?.subject?.title || 'General Legal Curriculum';

    const uId = q.topic?.unit?.id || 'gen-unit';
    const uNum = q.topic?.unit?.unitNumber || 1;
    const uTitle = q.topic?.unit?.title || 'General Unit';

    const tId = q.topic?.id || 'gen-topic';
    const tNum = q.topic?.topicNumber || 1;
    const tTitle = q.topic?.title || 'General Legal Concept';

    // 1. Subject-wise Tracking
    if (!subjectMap[sId]) {
      subjectMap[sId] = {
        subjectId: sId,
        subjectCode: sCode,
        title: sTitle,
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        marksScored: 0
      };
    }
    subjectMap[sId].total++;
    if (isCorrect) {
      subjectMap[sId].correct++;
      subjectMap[sId].marksScored += marksPerQuestion;
    } else if (isIncorrect) {
      subjectMap[sId].wrong++;
      if (hasNegativeMarking) subjectMap[sId].marksScored -= negativeMarkValue;
    } else {
      subjectMap[sId].skipped++;
    }

    // 2. Unit-wise Tracking
    if (!unitMap[uId]) {
      unitMap[uId] = {
        unitId: uId,
        unitNumber: uNum,
        title: uTitle,
        subjectCode: sCode,
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0
      };
    }
    unitMap[uId].total++;
    if (isCorrect) unitMap[uId].correct++;
    else if (isIncorrect) unitMap[uId].wrong++;
    else unitMap[uId].skipped++;

    // 3. Topic-wise Tracking
    if (!topicMap[tId]) {
      topicMap[tId] = {
        topicId: tId,
        topicNumber: tNum,
        title: tTitle,
        unitNumber: uNum,
        subjectCode: sCode,
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0
      };
    }
    topicMap[tId].total++;
    if (isCorrect) topicMap[tId].correct++;
    else if (isIncorrect) topicMap[tId].wrong++;
    else topicMap[tId].skipped++;

    // Record TestAnswer for DB
    testAnswersData.push({
      mcqId: q.id,
      selectedOptionKey: selectedKey,
      isCorrect,
      timeSpentSeconds: Math.round(timeSpentSeconds / totalQuestions)
    });

    // Review item with full verified statutory explanation
    questionsReview.push({
      id: q.id,
      questionNumber: i + 1,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      difficulty: q.difficulty,
      subject: q.subject || q.topic?.unit?.subject,
      unit: q.topic?.unit,
      topic: q.topic,
      selectedOptionKey: selectedKey,
      correctOptionKey: correctKey,
      isCorrect,
      isSkipped,
      savedToMyMistakes: isIncorrect,
      explanation: q.explanation,
      explanationGu: q.explanationGu,
      options: q.options.map(o => ({
        key: o.optionKey,
        text: o.optionText,
        textGu: o.optionTextGu,
        isCorrect: o.isCorrect
      }))
    });
  }

  // Final Calculations
  const finalScore = Math.max(0, Math.round(rawMarks * 100) / 100);
  const percentage = Math.round((finalScore / totalMarks) * 100);
  const isPassed = finalScore >= passingMarks;

  // Format Performance Lists
  const subjectPerformance = Object.values(subjectMap).map(sp => ({
    ...sp,
    marksScored: Math.max(0, Math.round(sp.marksScored * 100) / 100),
    maxMarks: sp.total * marksPerQuestion,
    accuracy: sp.total > 0 ? Math.round((sp.correct / sp.total) * 100) : 0,
    masteryLevel: (sp.correct / sp.total) >= 0.75 ? 'Mastered' : ((sp.correct / sp.total) >= 0.5 ? 'Competent' : 'Needs Revision')
  }));

  const unitPerformance = Object.values(unitMap).map(up => ({
    ...up,
    accuracy: up.total > 0 ? Math.round((up.correct / up.total) * 100) : 0
  }));

  const topicPerformance = Object.values(topicMap).map(tp => {
    const accuracy = tp.total > 0 ? Math.round((tp.correct / tp.total) * 100) : 0;
    const isWeak = accuracy < 60;
    return {
      ...tp,
      accuracy,
      isWeakTopic: isWeak
    };
  });

  // Identify Weak Topics (< 60% accuracy)
  const weakTopics = topicPerformance
    .filter(tp => tp.isWeakTopic && tp.topicId !== 'gen-topic')
    .map(wt => ({
      topicId: wt.topicId,
      title: wt.title,
      unitNumber: wt.unitNumber,
      subjectCode: wt.subjectCode,
      totalQuestions: wt.total,
      correct: wt.correct,
      wrong: wt.wrong,
      accuracy: wt.accuracy,
      revisionUrl: `/academic/topic/${wt.topicId}`
    }));

  const consolidatedPerformance = {
    subjects: subjectPerformance,
    units: unitPerformance,
    topics: topicPerformance,
    weakTopics
  };

  const timeTakenSeconds = parseInt(timeSpentSeconds, 10) || 0;

  // Save TestAttempt in Database
  const createdAttempt = await prisma.testAttempt.create({
    data: {
      ...(attemptId ? { id: attemptId } : {}),
      userId,
      mockTestId,
      practiceMode: testType,
      subjectId,
      unitId,
      score: finalScore,
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      timeTakenSeconds,
      topicPerformance: JSON.stringify(consolidatedPerformance),
      answers: {
        create: testAnswersData
      }
    }
  });

  // Automatically save all wrong answers into My Mistakes
  for (const item of wrongAnswersToUpsert) {
    const qId = typeof item === 'object' ? item.mcqId : item;
    const ansKey = typeof item === 'object' ? item.studentAnswer : null;
    try {
      await prisma.wrongAnswer.upsert({
        where: {
          userId_mcqId: { userId, mcqId: qId }
        },
        update: {
          mistakeCount: { increment: 1 },
          lastWrongAt: new Date(),
          isResolved: false,
          studentAnswer: ansKey,
          status: 'NEED_REVISION',
          correctReviewCount: 0
        },
        create: {
          userId,
          mcqId: qId,
          studentAnswer: ansKey,
          mistakeCount: 1,
          isResolved: false,
          status: 'NEED_REVISION',
          correctReviewCount: 0
        }
      });

      // Also register into RevisionItem as an MCQ requiring revision
      await prisma.revisionItem.upsert({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType: 'MCQ',
            entityId: qId
          }
        },
        update: {
          revisionStatus: 'NEED_REVISION',
          correctReviewCount: 0,
          intervalDays: 1,
          nextReviewAt: new Date()
        },
        create: {
          userId,
          entityType: 'MCQ',
          entityId: qId,
          revisionStatus: 'NEED_REVISION',
          correctReviewCount: 0,
          intervalDays: 1,
          nextReviewAt: new Date()
        }
      });
    } catch (err) {
      console.error(`Error recording mistake for MCQ ${qId}:`, err);
    }
  }

  return {
    success: true,
    attemptId: createdAttempt.id,
    summary: {
      score: finalScore,
      totalMarks,
      passingMarks,
      percentage,
      isPassed,
      correctCount,
      incorrectCount,
      skippedCount,
      penaltyDeduction: Math.round(totalPenalty * 100) / 100,
      timeTakenSeconds,
      timeUsedFormatted: `${Math.floor(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s`,
      masteryStatus: percentage >= 75 ? 'Distinction' : (percentage >= 50 ? 'Passed' : 'Needs Remediation')
    },
    performance: {
      subjects: subjectPerformance,
      units: unitPerformance,
      topics: topicPerformance,
      weakTopics
    },
    questionsReview
  };
}

/**
 * Retrieves a past mock test attempt with its multi-dimensional performance
 * analytics and full review answers.
 */
export async function getMockTestAttempt({ attemptId, userId = 'usr-student-01' }) {
  const attempt = await prisma.testAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      mockTest: true,
      answers: {
        include: {
          mcq: {
            include: {
              options: { orderBy: { optionKey: 'asc' } },
              topic: { include: { unit: { include: { subject: true } } } },
              subject: true
            }
          }
        }
      }
    }
  });

  if (!attempt) return null;

  let parsedPerformance = { subjects: [], units: [], topics: [], weakTopics: [] };
  if (attempt.topicPerformance) {
    try {
      parsedPerformance = JSON.parse(attempt.topicPerformance);
    } catch (e) {
      console.error('Error parsing topicPerformance:', e);
    }
  }

  const questionsReview = attempt.answers.map((ans, idx) => {
    const q = ans.mcq;
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctKey = correctOpt ? correctOpt.optionKey : 'A';
    const isSkipped = !ans.selectedOptionKey;

    return {
      id: q.id,
      questionNumber: idx + 1,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      difficulty: q.difficulty,
      subject: q.subject || q.topic?.unit?.subject,
      unit: q.topic?.unit,
      topic: q.topic,
      selectedOptionKey: ans.selectedOptionKey,
      correctOptionKey: correctKey,
      isCorrect: ans.isCorrect,
      isSkipped,
      explanation: q.explanation,
      explanationGu: q.explanationGu,
      options: q.options.map(o => ({
        key: o.optionKey,
        text: o.optionText,
        textGu: o.optionTextGu,
        isCorrect: o.isCorrect
      }))
    };
  });

  return {
    attemptId: attempt.id,
    practiceMode: attempt.practiceMode,
    completedAt: attempt.completedAt,
    summary: {
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      skippedCount: attempt.skippedCount,
      timeTakenSeconds: attempt.timeTakenSeconds,
      timeUsedFormatted: `${Math.floor(attempt.timeTakenSeconds / 60)}m ${attempt.timeTakenSeconds % 60}s`
    },
    performance: parsedPerformance,
    questionsReview
  };
}
