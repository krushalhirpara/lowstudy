import prisma from '../prisma.js';

/**
 * Service to manage law exam Question Bank querying, filtering, and model answer resolution.
 */
export async function getQuestionsList(filters = {}) {
  const {
    subjectId,
    unitId,
    topicId,
    marks,
    questionType,
    difficulty,
    priority,
    source, // 'ALL', 'PYQ', 'ORIGINAL_PRACTICE'
    search,
    page = 1,
    limit = 20,
    userId = 'usr-student-01'
  } = filters;

  const where = {
    status: 'PUBLISHED'
  };

  // Hierarchy filters
  if (topicId) {
    where.topicId = topicId;
  } else if (unitId) {
    where.topic = { unitId };
  } else if (subjectId) {
    where.topic = { unit: { subjectId } };
  }

  // Marks filter
  if (marks) {
    const marksNum = parseInt(marks, 10);
    if (!isNaN(marksNum)) {
      where.marks = marksNum;
    }
  }

  // Difficulty filter
  if (difficulty && difficulty !== 'ALL') {
    where.difficulty = difficulty.toUpperCase();
  }

  // Priority filter
  if (priority && priority !== 'ALL') {
    if (['Very High Priority', 'High Priority', 'Important', 'Practice'].includes(priority)) {
      where.priority_label = priority;
    } else {
      where.preparationPriority = priority.toUpperCase();
    }
  }

  // Question Type filter
  if (questionType && questionType !== 'ALL') {
    where.questionType = questionType.toUpperCase();
  }

  // Authentic Source filter: PYQ vs Original Practice
  if (source === 'PYQ') {
    where.paperQuestions = { some: {} };
  } else if (source === 'ORIGINAL_PRACTICE') {
    where.paperQuestions = { none: {} };
  }

  // Search query
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { questionText: { contains: q } },
      { questionTextGu: { contains: q } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const [totalCount, questionsRaw] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      skip,
      take,
      orderBy: [
        { marks: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
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
        answers: {
          select: {
            id: true,
            language: true,
            keyPoints: true,
            modelStructure: true,
            isVerified: true
          },
          take: 1
        },
        paperQuestions: {
          include: {
            paper: {
              include: {
                university: { select: { name: true, code: true } }
              }
            }
          }
        }
      }
    })
  ]);

  // Fetch student bookmarks and practiced status for the returned questions
  const questionIds = questionsRaw.map(q => q.id);
  const [bookmarks, practicedItems] = await Promise.all([
    prisma.bookmark.findMany({
      where: {
        userId,
        entityType: 'QUESTION',
        entityId: { in: questionIds }
      }
    }),
    prisma.revisionItem.findMany({
      where: {
        userId,
        entityType: 'QUESTION',
        entityId: { in: questionIds },
        repetitionNumber: { gt: 0 }
      }
    })
  ]);

  const bookmarkedSet = new Set(bookmarks.map(b => b.entityId));
  const practicedSet = new Set(practicedItems.map(p => p.entityId));

  const questions = questionsRaw.map(q => {
    const isPYQ = q.paperQuestions.length > 0;
    const pyqInfo = isPYQ ? {
      university: q.paperQuestions[0].paper.university.name,
      universityCode: q.paperQuestions[0].paper.university.code,
      examYear: q.paperQuestions[0].paper.examYear,
      examSession: q.paperQuestions[0].paper.examSession,
      paperCode: q.paperQuestions[0].paper.paperCode,
      sectionName: q.paperQuestions[0].sectionName,
      questionNumber: q.paperQuestions[0].questionNumber
    } : null;

    let quickPoints = [];
    let formatStyle = q.questionType;
    try {
      if (q.answers[0]?.keyPoints) {
        quickPoints = JSON.parse(q.answers[0].keyPoints);
      }
      if (q.answers[0]?.modelStructure) {
        const struct = JSON.parse(q.answers[0].modelStructure);
        if (struct.formatStyle) formatStyle = struct.formatStyle;
      }
    } catch (e) {
      // ignore JSON parse error
    }

    return {
      id: q.id,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      marks: q.marks,
      difficulty: q.difficulty,
      priority: q.preparationPriority,
      priority_score: q.priority_score,
      priority_label: q.priority_label || 'Practice',
      previous_year_count: q.previous_year_count,
      years_asked: q.years_asked ? JSON.parse(q.years_asked) : [],
      syllabus_weight: q.syllabus_weight,
      legal_importance: q.legal_importance,
      why_important: q.why_important || 'Curriculum-aligned question for exam practice.',
      isManualPriority: q.isManualPriority,
      questionType: q.questionType,
      formatStyle,
      isPYQ,
      sourceType: isPYQ ? 'PREVIOUS_YEAR' : 'ORIGINAL_PRACTICE',
      pyqInfo,
      quickPoints: quickPoints.slice(0, 3),
      isBookmarked: bookmarkedSet.has(q.id),
      isPracticed: practicedSet.has(q.id),
      topic: {
        id: q.topic.id,
        topicNumber: q.topic.topicNumber,
        title: q.topic.title
      },
      unit: {
        id: q.topic.unit.id,
        unitNumber: q.topic.unit.unitNumber,
        title: q.topic.unit.title
      },
      subject: {
        id: q.topic.unit.subject.id,
        code: q.topic.unit.subject.shortCode,
        title: q.topic.unit.subject.title
      }
    };
  });

  return {
    questions,
    pagination: {
      totalCount,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(totalCount / take)
    }
  };
}

/**
 * Fetch a single question with its complete 9-part model answer,
 * relevant statutory provisions, case laws, and linear prev/next IDs.
 */
export async function getQuestionDetail(questionId, userId = 'usr-student-01') {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      topic: {
        include: {
          unit: {
            include: {
              subject: {
                include: {
                  university: true,
                  course: true,
                  semester: true
                }
              }
            }
          }
        }
      },
      answers: {
        include: {
          verifiedBy: {
            select: { fullName: true, role: true }
          }
        }
      },
      paperQuestions: {
        include: {
          paper: {
            include: {
              university: true
            }
          }
        }
      }
    }
  });

  if (!question) return null;

  // Student bookmark & practiced status
  const [bookmark, practicedItem] = await Promise.all([
    prisma.bookmark.findFirst({
      where: {
        userId,
        entityType: 'QUESTION',
        entityId: question.id
      }
    }),
    prisma.revisionItem.findFirst({
      where: {
        userId,
        entityType: 'QUESTION',
        entityId: question.id,
        repetitionNumber: { gt: 0 }
      }
    })
  ]);

  // Linear Previous and Next Question Navigation within the subject
  const subjectId = question.topic.unit.subject.id;
  const adjacentQuestions = await prisma.question.findMany({
    where: {
      status: 'PUBLISHED',
      topic: { unit: { subjectId } }
    },
    orderBy: [
      { marks: 'asc' },
      { createdAt: 'desc' }
    ],
    select: { id: true, questionText: true, marks: true }
  });

  const currentIndex = adjacentQuestions.findIndex(q => q.id === question.id);
  const prevQuestion = currentIndex > 0 ? adjacentQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < adjacentQuestions.length - 1 ? adjacentQuestions[currentIndex + 1] : null;

  // Authentic Previous Year Information
  const isPYQ = question.paperQuestions.length > 0;
  const pyqInfo = isPYQ ? {
    university: question.paperQuestions[0].paper.university.name,
    universityCode: question.paperQuestions[0].paper.university.code,
    examYear: question.paperQuestions[0].paper.examYear,
    examSession: question.paperQuestions[0].paper.examSession,
    paperCode: question.paperQuestions[0].paper.paperCode,
    sectionName: question.paperQuestions[0].sectionName,
    questionNumber: question.paperQuestions[0].questionNumber,
    isCompulsory: question.paperQuestions[0].isCompulsory
  } : null;

  // Model Answer - Standard 9-Part Structure
  const primaryAnswer = question.answers[0] || null;
  let modelAnswer = null;
  let quickPoints = [];
  let relevantCaseLaws = [];
  let relevantSections = [];
  let examAnswerStructure = "1. Introduction 2. Definition 3. Statutory Provision 4. Essential Elements 5. Analysis 6. Case Precedent 7. Conclusion.";
  let formatStyle = question.questionType;

  if (primaryAnswer?.keyPoints) {
    try { quickPoints = JSON.parse(primaryAnswer.keyPoints); } catch (e) {}
  }
  if (primaryAnswer?.judicialCitations) {
    try { relevantCaseLaws = JSON.parse(primaryAnswer.judicialCitations); } catch (e) {}
  }
  if (primaryAnswer?.modelStructure) {
    try {
      const struct = JSON.parse(primaryAnswer.modelStructure);
      if (struct.sections) relevantSections = struct.sections;
      if (struct.examAnswerStructure) examAnswerStructure = struct.examAnswerStructure;
      if (struct.formatStyle) formatStyle = struct.formatStyle;
    } catch (e) {}
  }

  // Parse 9-part answerText
  if (primaryAnswer?.answerText) {
    try {
      const parsed = JSON.parse(primaryAnswer.answerText);
      if (typeof parsed === 'object' && parsed.introduction) {
        modelAnswer = {
          introduction: parsed.introduction,
          definition: parsed.definition || `Statutory definition under ${question.topic.unit.subject.title}.`,
          relevantLaw: parsed.relevantLaw || question.topic.unit.subject.title,
          legalProvision: parsed.legalProvision || `Governed by the parent enactment for ${question.topic.title}.`,
          mainPoints: Array.isArray(parsed.mainPoints) ? parsed.mainPoints : (parsed.essentialElements || [
            "Statutory jurisdiction of the parties",
            "Mandatory compliance with statutory notices",
            "Adherence to natural justice and fair procedure"
          ]),
          explanation: parsed.explanation || parsed.detailedExplanation || `Comprehensive legal analysis of ${question.topic.title}.`,
          caseLaw: parsed.caseLaw || (relevantCaseLaws[0] || "Supreme Court of India binding precedents on rule of law."),
          example: parsed.example || `Factual problem application demonstrating the legal test in practice.`,
          conclusion: parsed.conclusion || `Synthesis and practical legal significance.`
        };
      }
    } catch (e) {
      // not JSON format
    }
  }

  if (!modelAnswer) {
    modelAnswer = {
      introduction: `This question evaluates '${question.questionText}' under ${question.topic.unit.subject.title}. It requires a balanced exposition of statutory mandates, procedural pre-conditions, and judicial precedents.`,
      definition: `Statutory definitions and legislative parameters governing ${question.topic.title}.`,
      relevantLaw: question.topic.unit.subject.title,
      legalProvision: `Applicable provisions of ${question.topic.unit.subject.title} read with constitutional guidelines.`,
      mainPoints: [
        "Jurisdictional prerequisites under the relevant statute",
        "Mandatory procedural conditions precedent",
        "Rights, liabilities, and duties created by the enactment",
        "Remedies available to an aggrieved party in law"
      ],
      explanation: `The legal doctrine governing this topic ensures certainty and prevents arbitrary action. The courts have consistently held that statutory conditions precedent must be strictly observed.`,
      caseLaw: relevantCaseLaws[0] || `Supreme Court of India has established that statutory powers must be exercised reasonably, bonafide, and in accordance with natural justice.`,
      example: `Where an authority or party fails to comply with statutory notice and procedural mandates, the resulting order is void ab initio.`,
      conclusion: `In examination answers, students must structure their presentation with clear subheadings, statutory section citations, and relevant case law ratios.`
    };
  }

  return {
    id: question.id,
    questionText: question.questionText,
    questionTextGu: question.questionTextGu,
    marks: question.marks,
    difficulty: question.difficulty,
    priority: question.preparationPriority,
    priority_score: question.priority_score,
    priority_label: question.priority_label || 'Practice',
    previous_year_count: question.previous_year_count,
    years_asked: question.years_asked ? (Array.isArray(question.years_asked) ? question.years_asked : JSON.parse(question.years_asked || '[]')) : [],
    syllabus_weight: question.syllabus_weight,
    legal_importance: question.legal_importance,
    why_important: question.why_important || 'Curriculum-aligned question for exam practice.',
    isManualPriority: question.isManualPriority,
    questionType: question.questionType,
    formatStyle,
    isPYQ,
    sourceType: isPYQ ? 'PREVIOUS_YEAR' : 'ORIGINAL_PRACTICE',
    pyqInfo,
    isBookmarked: !!bookmark,
    isPracticed: !!practicedItem,

    // Hierarchy
    topic: {
      id: question.topic.id,
      topicNumber: question.topic.topicNumber,
      title: question.topic.title
    },
    unit: {
      id: question.topic.unit.id,
      unitNumber: question.topic.unit.unitNumber,
      title: question.topic.unit.title
    },
    subject: {
      id: question.topic.unit.subject.id,
      code: question.topic.unit.subject.shortCode,
      title: question.topic.unit.subject.title,
      university: question.topic.unit.subject.university.name,
      course: question.topic.unit.subject.course.name,
      semester: question.topic.unit.subject.semester.semesterNumber
    },

    // 9-Part Model Answer
    modelAnswer,
    relevantSections,
    relevantCaseLaws,
    quickPoints,
    examAnswerStructure,

    // Navigation
    navigation: {
      currentIndex: currentIndex + 1,
      totalInSubject: adjacentQuestions.length,
      prevQuestion,
      nextQuestion
    }
  };
}

/**
 * Toggle practiced status for a question.
 */
export async function toggleQuestionPracticed(questionId, userId = 'usr-student-01') {
  const existing = await prisma.revisionItem.findFirst({
    where: {
      userId,
      entityType: 'QUESTION',
      entityId: questionId
    }
  });

  if (existing) {
    const nextState = existing.repetitionNumber > 0 ? 0 : 1;
    await prisma.revisionItem.update({
      where: { id: existing.id },
      data: { repetitionNumber: nextState, updatedAt: new Date() }
    });
    return { isPracticed: nextState > 0 };
  } else {
    await prisma.revisionItem.create({
      data: {
        userId,
        entityType: 'QUESTION',
        entityId: questionId,
        repetitionNumber: 1
      }
    });
    return { isPracticed: true };
  }
}

/**
 * Report incorrect content on a question.
 */
export async function reportQuestionContent({ questionId, issueType, notes, userId = 'usr-student-01' }) {
  const comment = notes ? `[${issueType || 'CONTENT_ERROR'}] ${notes}` : (issueType || 'CONTENT_ERROR');
  const review = await prisma.contentReview.create({
    data: {
      entityType: 'QUESTION',
      entityId: questionId,
      remarks: comment,
      reviewStatus: 'PENDING',
      reviewerId: userId
    }
  });

  return { success: true, reviewId: review.id };
}

/**
 * Get available filter options (subjects, units, topics, marks, difficulties, counts).
 */
export async function getQuestionBankFilters() {
  const [subjects, marksDist, diffDist, priorityDist, totalQuestions, pyqCount] = await Promise.all([
    prisma.subject.findMany({
      select: {
        id: true,
        shortCode: true,
        title: true,
        units: {
          orderBy: { unitNumber: 'asc' },
          select: {
            id: true,
            unitNumber: true,
            title: true,
            topics: {
              orderBy: { topicNumber: 'asc' },
              select: { id: true, topicNumber: true, title: true }
            }
          }
        }
      }
    }),
    prisma.question.groupBy({ by: ['marks'], _count: { id: true } }),
    prisma.question.groupBy({ by: ['difficulty'], _count: { id: true } }),
    prisma.question.groupBy({ by: ['priority_label'], _count: { id: true } }),
    prisma.question.count({ where: { status: 'PUBLISHED' } }),
    prisma.previousPaperQuestion.count()
  ]);

  const priorityMap = {};
  priorityDist.forEach(p => {
    if (p.priority_label) priorityMap[p.priority_label] = p._count.id;
  });

  return {
    subjects,
    marks: marksDist.map(m => m.marks).sort((a, b) => a - b),
    difficulties: diffDist.map(d => d.difficulty),
    priorities: ['Very High Priority', 'High Priority', 'Important', 'Practice'],
    priorityCounts: priorityMap,
    totalQuestions,
    pyqCount,
    originalPracticeCount: Math.max(0, totalQuestions - pyqCount)
  };
}
