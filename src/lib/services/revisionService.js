/**
 * Revision & Mistake Book Service (LowStudy)
 * 
 * Manages:
 * 1. Auto-collection of wrong answers, weak topics, bookmarks, important sections & case laws.
 * 2. Revision status progression: NEED_REVISION -> REVIEW_AGAIN -> MASTERED (Leitner / SM-2 spaced repetition).
 * 3. Mistake Notebook with Try Again, Explain, and Revise Topic links.
 * 4. Multi-asset Revision Sessions (Quick Notes, Questions, MCQs, Sections, Case Laws).
 */

import prisma from '../prisma.js';

// Progression Thresholds
const PROGRESSION_RULES = {
  MASTERED_THRESHOLD: 3, // Requires 3 consecutive correct reviews
  INTERVAL_NEED_REVISION_DAYS: 1,
  INTERVAL_REVIEW_AGAIN_DAYS: 3,
  INTERVAL_MASTERED_DAYS: 14
};

/**
 * Calculates sensible progression based on consecutive correct reviews.
 */
export function calculateProgression({ currentReviewCount = 0, currentCorrectCount = 0, isCorrect = false }) {
  const newReviewCount = currentReviewCount + 1;
  
  if (!isCorrect) {
    // Demote immediately on failure
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + PROGRESSION_RULES.INTERVAL_NEED_REVISION_DAYS);
    return {
      status: 'NEED_REVISION',
      reviewCount: newReviewCount,
      correctReviewCount: 0,
      intervalDays: PROGRESSION_RULES.INTERVAL_NEED_REVISION_DAYS,
      nextReviewAt: nextDate,
      isResolved: false
    };
  }

  // Correct answer
  const newCorrectCount = currentCorrectCount + 1;
  if (newCorrectCount >= PROGRESSION_RULES.MASTERED_THRESHOLD) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + PROGRESSION_RULES.INTERVAL_MASTERED_DAYS);
    return {
      status: 'MASTERED',
      reviewCount: newReviewCount,
      correctReviewCount: newCorrectCount,
      intervalDays: PROGRESSION_RULES.INTERVAL_MASTERED_DAYS,
      nextReviewAt: nextDate,
      isResolved: true
    };
  } else {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + PROGRESSION_RULES.INTERVAL_REVIEW_AGAIN_DAYS);
    return {
      status: 'REVIEW_AGAIN',
      reviewCount: newReviewCount,
      correctReviewCount: newCorrectCount,
      intervalDays: PROGRESSION_RULES.INTERVAL_REVIEW_AGAIN_DAYS,
      nextReviewAt: nextDate,
      isResolved: false
    };
  }
}

/**
 * Automatically collects and synchronizes all revision assets for a student:
 * 1. Wrong MCQ answers & Wrong Mock Test answers
 * 2. Weak Topics (low quiz score or study progress)
 * 3. Bookmarked Questions
 * 4. Bookmarked Notes
 * 5. Important Sections
 * 6. Important Case Laws
 */
export async function autoCollectRevisionAssets(userId = 'usr-student-01') {
  try {
    // 1. Collect Wrong Answers from TestAnswer table if any are missing from WrongAnswer table
    const incorrectTestAnswers = await prisma.testAnswer.findMany({
      where: {
        attempt: { userId },
        isCorrect: false
      },
      select: {
        mcqId: true,
        selectedOptionKey: true,
        attempt: { select: { completedAt: true } }
      }
    });

    for (const ta of incorrectTestAnswers) {
      const existing = await prisma.wrongAnswer.findUnique({
        where: { userId_mcqId: { userId, mcqId: ta.mcqId } }
      });

      if (!existing) {
        await prisma.wrongAnswer.create({
          data: {
            userId,
            mcqId: ta.mcqId,
            studentAnswer: ta.selectedOptionKey,
            mistakeCount: 1,
            lastWrongAt: ta.attempt?.completedAt || new Date(),
            status: 'NEED_REVISION',
            reviewCount: 0,
            correctReviewCount: 0,
            isResolved: false
          }
        });
      }
    }

    // Sync all WrongAnswer items into RevisionItem
    const allMistakes = await prisma.wrongAnswer.findMany({
      where: { userId }
    });

    for (const mist of allMistakes) {
      await prisma.revisionItem.upsert({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType: 'MCQ',
            entityId: mist.mcqId
          }
        },
        update: {
          revisionStatus: mist.status,
          reviewCount: mist.reviewCount,
          correctReviewCount: mist.correctReviewCount,
          lastReviewedAt: mist.lastReviewedAt
        },
        create: {
          userId,
          entityType: 'MCQ',
          entityId: mist.mcqId,
          revisionStatus: mist.status || 'NEED_REVISION',
          reviewCount: mist.reviewCount || 0,
          correctReviewCount: mist.correctReviewCount || 0,
          lastReviewedAt: mist.lastReviewedAt
        }
      });
    }

    // 2. Collect Weak Topics from TestAttempts (accuracy < 60%) or StudyProgress (confidence LOW)
    const testAttempts = await prisma.testAttempt.findMany({
      where: { userId },
      select: { topicPerformance: true }
    });

    const weakTopicIds = new Set();
    for (const att of testAttempts) {
      if (!att.topicPerformance) continue;
      try {
        const perf = JSON.parse(att.topicPerformance);
        if (Array.isArray(perf)) {
          for (const tp of perf) {
            if (tp.needsRevision || (tp.total > 0 && (tp.correct / tp.total) < 0.6)) {
              if (tp.topicId && tp.topicId !== 'general-topic') {
                weakTopicIds.add(tp.topicId);
              }
            }
          }
        }
      } catch (e) {}
    }

    const lowConfidenceProgress = await prisma.studyProgress.findMany({
      where: { userId, confidenceLevel: 'LOW' },
      select: { topicId: true }
    });
    for (const sp of lowConfidenceProgress) {
      weakTopicIds.add(sp.topicId);
    }

    // Register weak topics into RevisionItem
    for (const tId of weakTopicIds) {
      const topicExists = await prisma.topic.findUnique({ where: { id: tId } });
      if (!topicExists) continue;

      const existingRev = await prisma.revisionItem.findUnique({
        where: { userId_entityType_entityId: { userId, entityType: 'TOPIC', entityId: tId } }
      });

      if (!existingRev) {
        await prisma.revisionItem.create({
          data: {
            userId,
            entityType: 'TOPIC',
            entityId: tId,
            revisionStatus: 'NEED_REVISION',
            intervalDays: 1,
            repetitionNumber: 0
          }
        });
      }
    }

    // 3 & 4. Collect Bookmarks (Questions, Notes, Sections, Case Laws)
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId }
    });

    for (const bm of bookmarks) {
      const existingRev = await prisma.revisionItem.findUnique({
        where: { userId_entityType_entityId: { userId, entityType: bm.entityType, entityId: bm.entityId } }
      });

      if (!existingRev) {
        await prisma.revisionItem.create({
          data: {
            userId,
            entityType: bm.entityType,
            entityId: bm.entityId,
            revisionStatus: 'NEED_REVISION',
            intervalDays: 1,
            repetitionNumber: 0
          }
        });
      }
    }

    // 5. Collect Important Sections (Enrolled subjects)
    const importantSections = await prisma.legalSection.findMany({
      where: {
        topic: {
          unit: {
            subject: {
              semester: {
                semesterNumber: 3
              }
            }
          }
        }
      },
      take: 12
    });

    for (const sec of importantSections) {
      const existingRev = await prisma.revisionItem.findUnique({
        where: { userId_entityType_entityId: { userId, entityType: 'LEGAL_SECTION', entityId: sec.id } }
      });
      if (!existingRev) {
        await prisma.revisionItem.create({
          data: {
            userId,
            entityType: 'LEGAL_SECTION',
            entityId: sec.id,
            revisionStatus: 'NEED_REVISION',
            intervalDays: 1
          }
        });
      }
    }

    // 6. Collect Important Case Laws (Landmark)
    const landmarkCases = await prisma.caseLaw.findMany({
      where: {
        importance: 'LANDMARK'
      },
      take: 12
    });

    for (const cl of landmarkCases) {
      const existingRev = await prisma.revisionItem.findUnique({
        where: { userId_entityType_entityId: { userId, entityType: 'CASE_LAW', entityId: cl.id } }
      });
      if (!existingRev) {
        await prisma.revisionItem.create({
          data: {
            userId,
            entityType: 'CASE_LAW',
            entityId: cl.id,
            revisionStatus: 'NEED_REVISION',
            intervalDays: 1
          }
        });
      }
    }

    return { success: true, message: 'Revision items synchronized successfully.' };
  } catch (error) {
    console.error('Error auto-collecting revision assets:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Retrieves the full Revision Hub data with aggregated statistics,
 * categorized filters (Need Revision, Review Again, Mastered),
 * and resolved entity payloads.
 */
export async function getRevisionHubData({ userId = 'usr-student-01', category = 'ALL', entityType = 'ALL', search = '' }) {
  await autoCollectRevisionAssets(userId);

  const revisionItems = await prisma.revisionItem.findMany({
    where: {
      userId,
      ...(category && category !== 'ALL' ? { revisionStatus: category } : {}),
      ...(entityType && entityType !== 'ALL' ? { entityType } : {})
    },
    orderBy: [
      { nextReviewAt: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  // Calculate overall category counts
  const [needRevisionCount, reviewAgainCount, masteredCount] = await Promise.all([
    prisma.revisionItem.count({ where: { userId, revisionStatus: 'NEED_REVISION' } }),
    prisma.revisionItem.count({ where: { userId, revisionStatus: 'REVIEW_AGAIN' } }),
    prisma.revisionItem.count({ where: { userId, revisionStatus: 'MASTERED' } })
  ]);

  // Aggregate by entity type
  const typeCounts = {
    NOTE: await prisma.revisionItem.count({ where: { userId, entityType: 'NOTE' } }),
    QUESTION: await prisma.revisionItem.count({ where: { userId, entityType: 'QUESTION' } }),
    MCQ: await prisma.revisionItem.count({ where: { userId, entityType: 'MCQ' } }),
    LEGAL_SECTION: await prisma.revisionItem.count({ where: { userId, entityType: 'LEGAL_SECTION' } }),
    CASE_LAW: await prisma.revisionItem.count({ where: { userId, entityType: 'CASE_LAW' } }),
    TOPIC: await prisma.revisionItem.count({ where: { userId, entityType: 'TOPIC' } })
  };

  // Resolve entity details
  const enrichedItems = [];
  for (const item of revisionItems) {
    let details = null;

    if (item.entityType === 'TOPIC') {
      const topic = await prisma.topic.findUnique({
        where: { id: item.entityId },
        include: { unit: { include: { subject: true } } }
      });
      if (topic) {
        details = {
          title: topic.title,
          subtitle: `${topic.unit.subject.shortCode} • Unit ${topic.unit.unitNumber}: ${topic.unit.title}`,
          url: `/academic/saurashtra-university/llb/semester-3/subjects/${topic.unit.subject.shortCode.toLowerCase()}/units/${topic.unit.unitNumber}/topics/${topic.id}`,
          badgeText: 'Weak Topic',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      }
    } else if (item.entityType === 'MCQ') {
      const mcq = await prisma.mcq.findUnique({
        where: { id: item.entityId },
        include: {
          topic: { include: { unit: { include: { subject: true } } } },
          subject: true,
          options: true
        }
      });
      if (mcq) {
        const subCode = mcq.subject?.shortCode || mcq.topic?.unit?.subject?.shortCode || 'LAW';
        details = {
          title: mcq.questionText,
          subtitle: `${subCode} • MCQ Practice`,
          explanation: mcq.explanation,
          url: '/revision/mistakes',
          badgeText: 'Wrong MCQ',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      }
    } else if (item.entityType === 'QUESTION') {
      const q = await prisma.question.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (q) {
        details = {
          title: q.questionText,
          subtitle: `${q.topic?.unit?.subject?.shortCode || 'LAW'} • ${q.marks} Marks • ${q.priority_label || 'Practice'}`,
          url: `/questions?subject=${q.topic?.unit?.subject?.id || ''}`,
          badgeText: 'Question',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      }
    } else if (item.entityType === 'NOTE') {
      const note = await prisma.note.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (note) {
        details = {
          title: `Exam Notes: ${note.topic.title}`,
          subtitle: `${note.topic?.unit?.subject?.shortCode || 'LAW'} • Unit ${note.topic?.unit?.unitNumber}`,
          preview: note.simpleNotes.slice(0, 160) + '...',
          url: `/academic/saurashtra-university/llb/semester-3/subjects/${note.topic?.unit?.subject?.shortCode.toLowerCase()}/units/${note.topic?.unit?.unitNumber}/topics/${note.topic.id}`,
          badgeText: 'Quick Note',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      }
    } else if (item.entityType === 'LEGAL_SECTION') {
      const sec = await prisma.legalSection.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (sec) {
        details = {
          title: `${sec.actName} - Section ${sec.sectionNumber}: ${sec.title}`,
          subtitle: sec.topic ? `${sec.topic.unit.subject.shortCode} • ${sec.topic.title}` : sec.actName,
          preview: sec.content.slice(0, 160) + '...',
          punishment: sec.punishment,
          badgeText: 'Statutory Section',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
      }
    } else if (item.entityType === 'CASE_LAW') {
      const cl = await prisma.caseLaw.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (cl) {
        details = {
          title: `${cl.title} (${cl.year || 'SC'})`,
          subtitle: `${cl.court} • ${cl.importance}`,
          preview: cl.keyPrinciple,
          badgeText: 'Landmark Case',
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        };
      }
    }

    if (details) {
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = details.title?.toLowerCase().includes(q);
        const matchesSub = details.subtitle?.toLowerCase().includes(q);
        const matchesPrev = details.preview?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSub && !matchesPrev) {
          continue;
        }
      }

      enrichedItems.push({
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        revisionStatus: item.revisionStatus,
        lastReviewedAt: item.lastReviewedAt,
        reviewCount: item.reviewCount,
        correctReviewCount: item.correctReviewCount,
        intervalDays: item.intervalDays,
        nextReviewAt: item.nextReviewAt,
        details
      });
    }
  }

  return {
    stats: {
      total: needRevisionCount + reviewAgainCount + masteredCount,
      needRevision: needRevisionCount,
      reviewAgain: reviewAgainCount,
      mastered: masteredCount,
      typeCounts
    },
    items: enrichedItems
  };
}

/**
 * Retrieves the Mistake Notebook data.
 * Displays: Question, Student Answer, Correct Answer, Explanation, Related Topic, Revise Topic, Try Again.
 */
export async function getMyMistakesData({ userId = 'usr-student-01', category = 'ALL', search = '', subjectId = null }) {
  await autoCollectRevisionAssets(userId);

  const wrongAnswers = await prisma.wrongAnswer.findMany({
    where: {
      userId,
      ...(category && category !== 'ALL' ? { status: category } : {})
    },
    include: {
      mcq: {
        include: {
          options: true,
          subject: true,
          topic: {
            include: {
              unit: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: [
      { lastWrongAt: 'desc' },
      { mistakeCount: 'desc' }
    ]
  });

  const [needRevisionCount, reviewAgainCount, masteredCount] = await Promise.all([
    prisma.wrongAnswer.count({ where: { userId, status: 'NEED_REVISION' } }),
    prisma.wrongAnswer.count({ where: { userId, status: 'REVIEW_AGAIN' } }),
    prisma.wrongAnswer.count({ where: { userId, status: 'MASTERED' } })
  ]);

  const mistakesList = [];

  for (const wa of wrongAnswers) {
    const mcq = wa.mcq;
    if (!mcq) continue;

    const sub = mcq.subject || mcq.topic?.unit?.subject;
    if (subjectId && sub?.id !== subjectId) continue;

    const correctOption = mcq.options.find(o => o.isCorrect);
    const studentOption = mcq.options.find(o => o.optionKey === wa.studentAnswer);

    const relatedTopic = mcq.topic ? {
      id: mcq.topic.id,
      title: mcq.topic.title,
      unitNumber: mcq.topic.unit.unitNumber,
      unitTitle: mcq.topic.unit.title,
      subjectName: sub?.title || 'Law',
      subjectCode: sub?.shortCode || 'LAW',
      reviseUrl: `/academic/saurashtra-university/llb/semester-3/subjects/${sub?.shortCode.toLowerCase()}/units/${mcq.topic.unit.unitNumber}/topics/${mcq.topic.id}`
    } : null;

    const item = {
      id: wa.id,
      mcqId: mcq.id,
      question: mcq.questionText,
      questionGu: mcq.questionTextGu,
      difficulty: mcq.difficulty,
      options: mcq.options.map(opt => ({
        key: opt.optionKey,
        text: opt.optionText,
        textGu: opt.optionTextGu,
        isCorrect: opt.isCorrect
      })),
      studentAnswer: {
        key: wa.studentAnswer || 'Skipped',
        text: studentOption ? studentOption.optionText : (wa.studentAnswer || 'No answer recorded')
      },
      correctAnswer: {
        key: correctOption ? correctOption.optionKey : 'A',
        text: correctOption ? correctOption.optionText : 'Option not specified'
      },
      explanation: mcq.explanation,
      explanationGu: mcq.explanationGu,
      relatedTopic,
      lastReviewed: wa.lastReviewedAt || wa.lastWrongAt,
      reviewCount: wa.reviewCount,
      correctReviewCount: wa.correctReviewCount,
      mistakeCount: wa.mistakeCount,
      status: wa.status,
      isResolved: wa.isResolved
    };

    if (search) {
      const q = search.toLowerCase();
      const matchesQ = item.question.toLowerCase().includes(q);
      const matchesTopic = item.relatedTopic?.title.toLowerCase().includes(q);
      const matchesExp = item.explanation?.toLowerCase().includes(q);
      if (!matchesQ && !matchesTopic && !matchesExp) continue;
    }

    mistakesList.push(item);
  }

  return {
    stats: {
      totalMistakes: needRevisionCount + reviewAgainCount + masteredCount,
      needRevision: needRevisionCount,
      reviewAgain: reviewAgainCount,
      mastered: masteredCount
    },
    mistakes: mistakesList
  };
}

/**
 * Re-attempts a wrong MCQ ("Try Again" action).
 * Evaluates the answer and applies sensible progression:
 * - Demotes to NEED_REVISION if wrong
 * - Advances to REVIEW_AGAIN on 1st/2nd correct attempt
 * - Marks MASTERED only after 3 consecutive correct reviews
 */
export async function reAttemptMistake({ userId = 'usr-student-01', wrongAnswerId, selectedKey }) {
  const wrongAnswer = await prisma.wrongAnswer.findFirst({
    where: { id: wrongAnswerId, userId },
    include: {
      mcq: {
        include: {
          options: true
        }
      }
    }
  });

  if (!wrongAnswer) {
    throw new Error('Mistake record not found.');
  }

  const correctOption = wrongAnswer.mcq.options.find(o => o.isCorrect);
  const isCorrect = correctOption ? correctOption.optionKey === selectedKey : false;

  const progression = calculateProgression({
    currentReviewCount: wrongAnswer.reviewCount,
    currentCorrectCount: wrongAnswer.correctReviewCount,
    isCorrect
  });

  // Update WrongAnswer record
  const updatedMistake = await prisma.wrongAnswer.update({
    where: { id: wrongAnswerId },
    data: {
      studentAnswer: selectedKey,
      reviewCount: progression.reviewCount,
      correctReviewCount: progression.correctReviewCount,
      status: progression.status,
      isResolved: progression.isResolved,
      lastReviewedAt: new Date(),
      ...(!isCorrect ? {
        mistakeCount: { increment: 1 },
        lastWrongAt: new Date()
      } : {})
    }
  });

  // Synchronize RevisionItem in lockstep
  await prisma.revisionItem.upsert({
    where: {
      userId_entityType_entityId: {
        userId,
        entityType: 'MCQ',
        entityId: wrongAnswer.mcqId
      }
    },
    update: {
      revisionStatus: progression.status,
      reviewCount: progression.reviewCount,
      correctReviewCount: progression.correctReviewCount,
      intervalDays: progression.intervalDays,
      nextReviewAt: progression.nextReviewAt,
      lastReviewedAt: new Date()
    },
    create: {
      userId,
      entityType: 'MCQ',
      entityId: wrongAnswer.mcqId,
      revisionStatus: progression.status,
      reviewCount: progression.reviewCount,
      correctReviewCount: progression.correctReviewCount,
      intervalDays: progression.intervalDays,
      nextReviewAt: progression.nextReviewAt,
      lastReviewedAt: new Date()
    }
  });

  return {
    success: true,
    isCorrect,
    selectedKey,
    correctKey: correctOption?.optionKey || 'A',
    correctAnswerText: correctOption?.optionText || '',
    explanation: wrongAnswer.mcq.explanation,
    newStatus: progression.status,
    correctReviewCount: progression.correctReviewCount,
    reviewCount: progression.reviewCount,
    isMastered: progression.status === 'MASTERED'
  };
}

/**
 * Retrieves student Bookmarks categorized with revision tracking.
 */
export async function getBookmarksData({ userId = 'usr-student-01', category = 'ALL', entityType = 'ALL', search = '' }) {
  await autoCollectRevisionAssets(userId);

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      ...(entityType && entityType !== 'ALL' ? { entityType } : {})
    },
    orderBy: { createdAt: 'desc' }
  });

  const enrichedBookmarks = [];

  for (const bm of bookmarks) {
    // Find matching revision item for status tracking
    const revItem = await prisma.revisionItem.findUnique({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType: bm.entityType,
          entityId: bm.entityId
        }
      }
    });

    const currentStatus = revItem?.revisionStatus || 'NEED_REVISION';
    if (category && category !== 'ALL' && currentStatus !== category) {
      continue;
    }

    let payload = null;

    if (bm.entityType === 'QUESTION') {
      const q = await prisma.question.findUnique({
        where: { id: bm.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (q) {
        payload = {
          title: q.questionText,
          subtitle: `${q.topic?.unit?.subject?.shortCode || 'LAW'} • ${q.marks} Marks • ${q.priority_label || 'Practice'}`,
          typeLabel: 'Question',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          url: `/questions?subject=${q.topic?.unit?.subject?.id || ''}`
        };
      }
    } else if (bm.entityType === 'NOTE') {
      const n = await prisma.note.findUnique({
        where: { id: bm.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (n) {
        payload = {
          title: `Note: ${n.topic.title}`,
          subtitle: `${n.topic?.unit?.subject?.shortCode || 'LAW'} • Unit ${n.topic?.unit?.unitNumber}`,
          preview: n.simpleNotes.slice(0, 150) + '...',
          typeLabel: 'Note',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          url: `/academic/saurashtra-university/llb/semester-3/subjects/${n.topic?.unit?.subject?.shortCode.toLowerCase()}/units/${n.topic?.unit?.unitNumber}/topics/${n.topic.id}`
        };
      }
    } else if (bm.entityType === 'LEGAL_SECTION') {
      const s = await prisma.legalSection.findUnique({
        where: { id: bm.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (s) {
        payload = {
          title: `${s.actName} - Section ${s.sectionNumber}: ${s.title}`,
          subtitle: s.topic ? `${s.topic.unit.subject.shortCode} • ${s.topic.title}` : s.actName,
          preview: s.content.slice(0, 150) + '...',
          typeLabel: 'Section',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
        };
      }
    } else if (bm.entityType === 'CASE_LAW') {
      const c = await prisma.caseLaw.findUnique({
        where: { id: bm.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (c) {
        payload = {
          title: `${c.title} (${c.year || 'SC'})`,
          subtitle: `${c.court} • ${c.importance}`,
          preview: c.keyPrinciple,
          typeLabel: 'Case Law',
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
        };
      }
    } else if (bm.entityType === 'MCQ') {
      const m = await prisma.mcq.findUnique({
        where: { id: bm.entityId },
        include: { subject: true, topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (m) {
        payload = {
          title: m.questionText,
          subtitle: `${m.subject?.shortCode || m.topic?.unit?.subject?.shortCode || 'LAW'} • MCQ`,
          typeLabel: 'MCQ',
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      }
    }

    if (payload) {
      if (search) {
        const q = search.toLowerCase();
        if (!payload.title.toLowerCase().includes(q) && !payload.subtitle?.toLowerCase().includes(q)) {
          continue;
        }
      }

      enrichedBookmarks.push({
        id: bm.id,
        entityType: bm.entityType,
        entityId: bm.entityId,
        notes: bm.notes,
        createdAt: bm.createdAt,
        revisionStatus: currentStatus,
        lastReviewedAt: revItem?.lastReviewedAt,
        reviewCount: revItem?.reviewCount || 0,
        correctReviewCount: revItem?.correctReviewCount || 0,
        payload
      });
    }
  }

  // Count by categories
  let needRevisionCount = 0;
  let reviewAgainCount = 0;
  let masteredCount = 0;

  for (const b of enrichedBookmarks) {
    if (b.revisionStatus === 'NEED_REVISION') needRevisionCount++;
    else if (b.revisionStatus === 'REVIEW_AGAIN') reviewAgainCount++;
    else if (b.revisionStatus === 'MASTERED') masteredCount++;
  }

  return {
    stats: {
      total: enrichedBookmarks.length,
      needRevision: needRevisionCount,
      reviewAgain: reviewAgainCount,
      mastered: masteredCount
    },
    bookmarks: enrichedBookmarks
  };
}

/**
 * Generates an active Revision Session containing a multi-asset bundle:
 * 1. Quick Notes
 * 2. Questions
 * 3. MCQs
 * 4. Sections
 * 5. Case Laws
 */
export async function generateRevisionSession({ userId = 'usr-student-01', category = 'NEED_REVISION', types = [], count = 10 }) {
  await autoCollectRevisionAssets(userId);

  const selectedTypes = types.length > 0 ? types : ['NOTE', 'QUESTION', 'MCQ', 'LEGAL_SECTION', 'CASE_LAW'];

  // Query revision items for the user matching category & allowed types
  const candidateItems = await prisma.revisionItem.findMany({
    where: {
      userId,
      ...(category && category !== 'ALL' ? { revisionStatus: category } : {}),
      entityType: { in: selectedTypes }
    },
    orderBy: [
      { nextReviewAt: 'asc' },
      { correctReviewCount: 'asc' },
      { reviewCount: 'asc' }
    ],
    take: count * 2
  });

  const sessionCards = [];

  for (const item of candidateItems) {
    if (sessionCards.length >= count) break;

    if (item.entityType === 'NOTE') {
      const note = await prisma.note.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (note) {
        let keyPointsList = [];
        try {
          if (note.keyPoints) keyPointsList = JSON.parse(note.keyPoints);
        } catch (e) {}

        sessionCards.push({
          revisionItemId: item.id,
          entityType: 'NOTE',
          entityId: note.id,
          currentStatus: item.revisionStatus,
          reviewCount: item.reviewCount,
          correctReviewCount: item.correctReviewCount,
          badge: 'Quick Note',
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          title: note.topic.title,
          subjectCode: note.topic?.unit?.subject?.shortCode || 'LAW',
          unitInfo: `Unit ${note.topic?.unit?.unitNumber}: ${note.topic?.unit?.title}`,
          content: note.simpleNotes,
          keyPoints: Array.isArray(keyPointsList) ? keyPointsList : [],
          studyUrl: `/academic/saurashtra-university/llb/semester-3/subjects/${note.topic?.unit?.subject?.shortCode.toLowerCase()}/units/${note.topic?.unit?.unitNumber}/topics/${note.topic.id}`
        });
      }
    } else if (item.entityType === 'QUESTION') {
      const q = await prisma.question.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (q) {
        sessionCards.push({
          revisionItemId: item.id,
          entityType: 'QUESTION',
          entityId: q.id,
          currentStatus: item.revisionStatus,
          reviewCount: item.reviewCount,
          correctReviewCount: item.correctReviewCount,
          badge: 'Question',
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          title: q.questionText,
          subjectCode: q.topic?.unit?.subject?.shortCode || 'LAW',
          marks: q.marks,
          priority: q.priority_label || 'Practice',
          whyImportant: q.why_important || 'Important exam question covering core syllabus concept.',
          topicTitle: q.topic?.title,
          studyUrl: `/questions?subject=${q.topic?.unit?.subject?.id || ''}`
        });
      }
    } else if (item.entityType === 'MCQ') {
      const mcq = await prisma.mcq.findUnique({
        where: { id: item.entityId },
        include: {
          options: true,
          subject: true,
          topic: { include: { unit: { include: { subject: true } } } }
        }
      });
      if (mcq) {
        const correctOpt = mcq.options.find(o => o.isCorrect);
        sessionCards.push({
          revisionItemId: item.id,
          entityType: 'MCQ',
          entityId: mcq.id,
          currentStatus: item.revisionStatus,
          reviewCount: item.reviewCount,
          correctReviewCount: item.correctReviewCount,
          badge: 'Interactive MCQ',
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          title: mcq.questionText,
          subjectCode: mcq.subject?.shortCode || mcq.topic?.unit?.subject?.shortCode || 'LAW',
          topicTitle: mcq.topic?.title,
          options: mcq.options.map(o => ({
            key: o.optionKey,
            text: o.optionText,
            isCorrect: o.isCorrect
          })),
          correctKey: correctOpt?.optionKey || 'A',
          explanation: mcq.explanation
        });
      }
    } else if (item.entityType === 'LEGAL_SECTION') {
      const sec = await prisma.legalSection.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (sec) {
        sessionCards.push({
          revisionItemId: item.id,
          entityType: 'LEGAL_SECTION',
          entityId: sec.id,
          currentStatus: item.revisionStatus,
          reviewCount: item.reviewCount,
          correctReviewCount: item.correctReviewCount,
          badge: 'Statutory Section',
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          title: `${sec.actName} - Section ${sec.sectionNumber}`,
          sectionHeading: sec.title,
          content: sec.content,
          punishment: sec.punishment,
          cognizableStatus: sec.cognizableStatus,
          bailableStatus: sec.bailableStatus,
          oldLawSection: sec.oldLawSection
        });
      }
    } else if (item.entityType === 'CASE_LAW') {
      const cl = await prisma.caseLaw.findUnique({
        where: { id: item.entityId },
        include: { topic: { include: { unit: { include: { subject: true } } } } }
      });
      if (cl) {
        sessionCards.push({
          revisionItemId: item.id,
          entityType: 'CASE_LAW',
          entityId: cl.id,
          currentStatus: item.revisionStatus,
          reviewCount: item.reviewCount,
          correctReviewCount: item.correctReviewCount,
          badge: 'Landmark Case Law',
          badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          title: cl.title,
          citation: cl.citation || 'Supreme Court',
          year: cl.year,
          court: cl.court,
          keyPrinciple: cl.keyPrinciple,
          ratioDecidendi: cl.ratioDecidendi,
          facts: cl.facts
        });
      }
    }
  }

  return {
    sessionId: `rev-session-${Date.now()}`,
    category,
    totalCards: sessionCards.length,
    cards: sessionCards
  };
}

/**
 * Submits student evaluation for an item during a Revision Session.
 * Updates review count, consecutive correct count, SM-2 interval, and status.
 */
export async function submitRevisionReview({ userId = 'usr-student-01', revisionItemId, isCorrect = false }) {
  const revItem = await prisma.revisionItem.findFirst({
    where: { id: revisionItemId, userId }
  });

  if (!revItem) {
    throw new Error('Revision item not found.');
  }

  const progression = calculateProgression({
    currentReviewCount: revItem.reviewCount,
    currentCorrectCount: revItem.correctReviewCount,
    isCorrect
  });

  const updatedRev = await prisma.revisionItem.update({
    where: { id: revisionItemId },
    data: {
      reviewCount: progression.reviewCount,
      correctReviewCount: progression.correctReviewCount,
      revisionStatus: progression.status,
      intervalDays: progression.intervalDays,
      nextReviewAt: progression.nextReviewAt,
      lastReviewedAt: new Date()
    }
  });

  // If item is an MCQ, also update WrongAnswer table
  if (revItem.entityType === 'MCQ') {
    await prisma.wrongAnswer.updateMany({
      where: { userId, mcqId: revItem.entityId },
      data: {
        reviewCount: progression.reviewCount,
        correctReviewCount: progression.correctReviewCount,
        status: progression.status,
        isResolved: progression.isResolved,
        lastReviewedAt: new Date(),
        ...(!isCorrect ? {
          mistakeCount: { increment: 1 },
          lastWrongAt: new Date()
        } : {})
      }
    });
  }

  return {
    success: true,
    revisionItemId,
    entityType: revItem.entityType,
    entityId: revItem.entityId,
    newStatus: progression.status,
    reviewCount: progression.reviewCount,
    correctReviewCount: progression.correctReviewCount,
    isMastered: progression.status === 'MASTERED',
    intervalDays: progression.intervalDays
  };
}

const revisionService = {
  calculateProgression,
  autoCollectRevisionAssets,
  getRevisionHubData,
  getMyMistakesData,
  reAttemptMistake,
  getBookmarksData,
  generateRevisionSession,
  submitRevisionReview
};

export default revisionService;
