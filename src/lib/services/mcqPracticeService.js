import prisma from '../prisma.js';

export const PRACTICE_MODES = {
  TOPIC: 'Topic Practice',
  UNIT: 'Unit Practice',
  SUBJECT: 'Subject Practice',
  MIXED: 'Mixed Practice',
  RANDOM: 'Random Practice',
  TIMED_QUIZ: 'Timed Quiz',
  MY_MISTAKES: 'My Mistakes'
};

/**
 * Fetches practice MCQs based on mode and criteria.
 * In exam/timed mode, correct answers and explanations are hidden from the payload before submission.
 */
export async function getPracticeQuestions({
  mode = 'RANDOM',
  subjectId = null,
  unitId = null,
  topicId = null,
  count = 10,
  difficulty = null,
  userId = 'usr-student-01',
  isExamMode = false
}) {
  const takeCount = Math.min(50, Math.max(5, parseInt(count, 10) || 10));

  let questionsRaw = [];

  if (mode === 'MY_MISTAKES') {
    // Fetch from WrongAnswer notebook
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: {
        userId,
        isResolved: false
      },
      orderBy: { lastWrongAt: 'desc' },
      take: takeCount,
      include: {
        mcq: {
          include: {
            options: {
              orderBy: { optionKey: 'asc' }
            },
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
        }
      }
    });
    questionsRaw = wrongAnswers.map(wa => wa.mcq).filter(Boolean);
  } else {
    // Standard and dynamic modes
    const where = {
      status: 'PUBLISHED'
    };

    if (difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty.toUpperCase())) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (mode === 'TOPIC' && topicId) {
      where.topicId = topicId;
    } else if (mode === 'UNIT' && unitId) {
      where.topic = { unitId };
    } else if (mode === 'SUBJECT' && subjectId) {
      where.OR = [
        { subjectId },
        { topic: { unit: { subjectId } } }
      ];
    } else if (mode === 'MIXED') {
      // Pick across subjects or given semester
      if (subjectId) {
        where.OR = [
          { subjectId },
          { topic: { unit: { subjectId } } }
        ];
      }
    }

    questionsRaw = await prisma.mcq.findMany({
      where,
      take: takeCount * 2, // fetch buffer to shuffle
      include: {
        options: {
          orderBy: { optionKey: 'asc' }
        },
        topic: {
          include: {
            unit: {
              include: {
                subject: {
                  select: { id: true, shortCode: true, title: true }
                }
              }
            }
          }
        },
        subject: {
          select: { id: true, shortCode: true, title: true }
        }
      }
    });

    // Shuffle questions
    questionsRaw = questionsRaw.sort(() => 0.5 - Math.random()).slice(0, takeCount);
  }

  // Determine time limit for Timed Quiz (e.g. 1.5 mins per question or standard 15-30 mins)
  const isTimedQuiz = mode === 'TIMED_QUIZ' || isExamMode;
  const timeLimitMinutes = isTimedQuiz ? Math.max(5, Math.ceil(questionsRaw.length * 1.5)) : 0;

  // Format questions payload
  // If isExamMode is true, DO NOT show correct answers or explanations before submission!
  const questions = questionsRaw.map((q, idx) => {
    const subj = q.subject || q.topic?.unit?.subject;
    const unit = q.topic?.unit;
    const topic = q.topic;

    return {
      id: q.id,
      questionNumber: idx + 1,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      difficulty: q.difficulty,
      preparationPriority: q.preparationPriority,
      subject: subj ? { id: subj.id, code: subj.shortCode, title: subj.title } : null,
      unit: unit ? { id: unit.id, unitNumber: unit.unitNumber, title: unit.title } : null,
      topic: topic ? { id: topic.id, topicNumber: topic.topicNumber, title: topic.title } : null,
      options: q.options.map(o => ({
        id: o.id,
        key: o.optionKey,
        text: o.optionText,
        textGu: o.optionTextGu,
        // Hide correct answer in exam mode before submission
        isCorrect: isExamMode ? undefined : o.isCorrect
      })),
      // Hide explanation in exam mode before submission
      explanation: isExamMode ? null : q.explanation,
      explanationGu: isExamMode ? null : q.explanationGu
    };
  });

  return {
    questions,
    sessionMeta: {
      mode,
      modeTitle: PRACTICE_MODES[mode] || mode,
      totalQuestions: questions.length,
      isExamMode: isTimedQuiz,
      timeLimitMinutes,
      timeLimitSeconds: timeLimitMinutes * 60,
      subjectId,
      unitId,
      topicId
    }
  };
}

/**
 * Submits practice session answers, computes score, topic performance,
 * saves TestAttempt and TestAnswer, and automatically records all wrong answers into My Mistakes.
 */
export async function submitPracticeSession({
  attemptId = null,
  mode = 'RANDOM',
  subjectId = null,
  unitId = null,
  topicId = null,
  answers = {}, // { [mcqId]: 'A' | 'B' | 'C' | 'D' }
  timeSpentSeconds = 0,
  useNegativeMarking = true,
  userId = 'usr-student-01'
}) {
  // Prevent duplicate submissions: check if attemptId already exists
  if (attemptId) {
    const existingAttempt = await prisma.testAttempt.findUnique({
      where: { id: attemptId }
    });
    if (existingAttempt) {
      throw new Error('This practice session has already been submitted. Duplicate submissions are prevented.');
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
      options: true,
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

  const timeTakenSeconds = parseInt(timeSpentSeconds, 10) || 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let rawMarks = 0;
  const totalQuestions = mcqIds.length;

  const topicPerformanceMap = {};
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
      rawMarks += 1.0;
    } else if (isIncorrect) {
      incorrectCount++;
      if (useNegativeMarking) {
        rawMarks -= 0.25;
      }
      // Mandatory requirement: Every wrong answer must be saved into My Mistakes
      wrongAnswersToUpsert.push({ mcqId: q.id, studentAnswer: selectedKey });
    } else {
      skippedCount++;
    }

    // Track Topic Performance
    const tId = q.topic?.id || 'general-topic';
    const tTitle = q.topic?.title || 'General Legal Knowledge';
    const sCode = q.subject?.shortCode || q.topic?.unit?.subject?.shortCode || 'LAW';
    const uNum = q.topic?.unit?.unitNumber || 1;

    if (!topicPerformanceMap[tId]) {
      topicPerformanceMap[tId] = {
        topicId: tId,
        topicTitle: tTitle,
        unitNumber: uNum,
        subjectCode: sCode,
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0
      };
    }
    topicPerformanceMap[tId].total++;
    if (isCorrect) topicPerformanceMap[tId].correct++;
    else if (isIncorrect) topicPerformanceMap[tId].wrong++;
    else topicPerformanceMap[tId].skipped++;

    testAnswersData.push({
      mcqId: q.id,
      selectedOptionKey: selectedKey,
      isCorrect,
      timeSpentSeconds: Math.round(timeSpentSeconds / totalQuestions)
    });

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

  // Calculate percentage and score (clamped to 0 minimum)
  const finalScore = Math.max(0, Math.round(rawMarks * 100) / 100);
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Compute final Topic Performance list
  const topicPerformanceList = Object.values(topicPerformanceMap).map(tp => ({
    ...tp,
    accuracy: tp.total > 0 ? Math.round((tp.correct / tp.total) * 100) : 0,
    needsRevision: tp.total > 0 && (tp.correct / tp.total) < 0.6
  }));

  // Save TestAttempt in Database
  const createdAttempt = await prisma.testAttempt.create({
    data: {
      ...(attemptId ? { id: attemptId } : {}),
      userId,
      practiceMode: mode,
      subjectId,
      unitId,
      topicId,
      score: finalScore,
      totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      timeTakenSeconds,
      topicPerformance: JSON.stringify(topicPerformanceList),
      answers: {
        create: testAnswersData
      }
    }
  });

  // Save all wrong answers into My Mistakes (WrongAnswer table)
  for (const item of wrongAnswersToUpsert) {
    const qId = typeof item === 'object' ? item.mcqId : item;
    const ansKey = typeof item === 'object' ? item.studentAnswer : null;
    try {
      await prisma.wrongAnswer.upsert({
        where: {
          userId_mcqId: {
            userId,
            mcqId: qId
          }
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
      console.error(`Error saving mistake for MCQ ${qId}:`, err);
    }
  }

  return {
    success: true,
    attemptId: createdAttempt.id,
    summary: {
      score: finalScore,
      maxScore: totalQuestions,
      percentage,
      correctCount,
      incorrectCount,
      skippedCount,
      timeTakenSeconds,
      timeUsedFormatted: `${Math.floor(timeTakenSeconds / 60)}m ${timeSpentSeconds % 60}s`,
      isPassed: percentage >= 50,
      masteryLevel: percentage >= 80 ? 'Mastered' : (percentage >= 50 ? 'Competent' : 'Needs Revision')
    },
    topicPerformance: topicPerformanceList,
    questionsReview
  };
}

/**
 * Adds an MCQ to student's spaced repetition schedule.
 */
export async function addMcqToRevision({ userId = 'usr-student-01', mcqId }) {
  if (!mcqId) throw new Error('mcqId is required');

  const existing = await prisma.revisionItem.findFirst({
    where: {
      userId,
      entityType: 'MCQ',
      entityId: mcqId
    }
  });

  if (existing) {
    const updated = await prisma.revisionItem.update({
      where: { id: existing.id },
      data: {
        repetitionNumber: { increment: 1 },
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });
    return { success: true, message: 'Updated spaced revision item', item: updated };
  }

  const created = await prisma.revisionItem.create({
    data: {
      userId,
      entityType: 'MCQ',
      entityId: mcqId,
      intervalDays: 1,
      repetitionNumber: 1,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });

  return { success: true, message: 'Added MCQ to spaced revision schedule', item: created };
}

/**
 * Retrieves all mistakes for the student from the WrongAnswer table.
 */
export async function getMyMistakes({ userId = 'usr-student-01' }) {
  const mistakes = await prisma.wrongAnswer.findMany({
    where: {
      userId,
      isResolved: false
    },
    orderBy: { lastWrongAt: 'desc' },
    include: {
      mcq: {
        include: {
          options: {
            orderBy: { optionKey: 'asc' }
          },
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
      }
    }
  });

  return {
    totalMistakes: mistakes.length,
    mistakes: mistakes.map(m => ({
      id: m.id,
      mcqId: m.mcqId,
      mistakeCount: m.mistakeCount,
      lastWrongAt: m.lastWrongAt,
      isResolved: m.isResolved,
      mcq: {
        id: m.mcq.id,
        questionText: m.mcq.questionText,
        questionTextGu: m.mcq.questionTextGu,
        difficulty: m.mcq.difficulty,
        explanation: m.mcq.explanation,
        explanationGu: m.mcq.explanationGu,
        subject: m.mcq.subject || m.mcq.topic?.unit?.subject,
        unit: m.mcq.topic?.unit,
        topic: m.mcq.topic,
        options: m.mcq.options
      }
    }))
  };
}

/**
 * Marks a mistake as resolved.
 */
export async function resolveMistake({ userId = 'usr-student-01', mcqId }) {
  const updated = await prisma.wrongAnswer.updateMany({
    where: {
      userId,
      mcqId
    },
    data: {
      isResolved: true
    }
  });

  return { success: true, updatedCount: updated.count };
}

/**
 * Fetches academic hierarchy with counts for practice mode selector.
 */
export async function getPracticeHierarchyMetadata() {
  const [subjects, totalMcqs, totalMistakes] = await Promise.all([
    prisma.subject.findMany({
      where: { isActive: true },
      select: {
        id: true,
        shortCode: true,
        title: true,
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
    prisma.mcq.count({ where: { status: 'PUBLISHED' } }),
    prisma.wrongAnswer.count({ where: { userId: 'usr-student-01', isResolved: false } })
  ]);

  return {
    subjects,
    totalMcqs,
    totalMistakes
  };
}
