/**
 * Previous Year Paper Service (LowStudy)
 * 
 * Provides:
 * 1. Admin paper upload (University, Course, Semester, Subject, Year, PDF, Metadata).
 * 2. Admin AI-generated mapping review & correction before publication.
 * 3. Student paper discovery, search, and hierarchy navigation:
 *    Previous Paper -> Question -> Subject -> Unit -> Topic -> Year.
 * 4. Evidence-based analysis (Frequently asked topics, repeated concepts, year-wise, unit-wise)
 *    Strictly labeled: "Based on available previous papers."
 */

import prisma from '../prisma.js';

export const MANDATORY_ANALYSIS_DISCLAIMER = "Based on available previous papers.";
export const PREDICTIVE_CLAIM_WARNING = "Do not present previous-paper frequency as a guarantee of future questions.";

/**
 * Search and retrieve previous examination papers with filters and pagination.
 */
export async function getPreviousPapers({
  universityId = '',
  courseId = '',
  semesterId = '',
  subjectId = '',
  examYear = '',
  examSession = '',
  status = 'PUBLISHED', // 'ALL', 'PUBLISHED', 'DRAFT', 'AI_MAPPED', 'REVIEWED'
  search = '',
  page = 1,
  limit = 20
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};

  if (universityId) where.universityId = universityId;
  if (courseId) where.courseId = courseId;
  if (semesterId) where.semesterId = semesterId;
  if (subjectId) where.subjectId = subjectId;
  if (examYear) where.examYear = parseInt(examYear, 10);
  if (examSession && examSession !== 'ALL') where.examSession = examSession;
  if (status && status !== 'ALL') where.status = status;

  if (search) {
    where.OR = [
      { paperCode: { contains: search } },
      { title: { contains: search } },
      { examSession: { contains: search } },
      { subject: { title: { contains: search } } },
      { subject: { shortCode: { contains: search } } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.previousPaper.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { examYear: 'desc' },
        { examSession: 'asc' }
      ],
      include: {
        university: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, semesterNumber: true, title: true } },
        subject: { select: { id: true, title: true, shortCode: true, category: true, credits: true } },
        _count: {
          select: { paperQuestions: true }
        }
      }
    }),
    prisma.previousPaper.count({ where })
  ]);

  return {
    items: items.map(p => ({
      ...p,
      questionCount: p._count.paperQuestions,
      displayTitle: p.title || `${p.subject?.title} (${p.examSession} ${p.examYear})`,
      allowDownload: p.allowDownload ?? true
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get full previous paper by ID with questions and syllabus hierarchy.
 */
export async function getPreviousPaperById(id) {
  const paper = await prisma.previousPaper.findUnique({
    where: { id },
    include: {
      university: true,
      course: true,
      semester: true,
      subject: {
        include: {
          units: {
            orderBy: { unitNumber: 'asc' },
            include: {
              topics: {
                orderBy: { topicNumber: 'asc' }
              }
            }
          }
        }
      },
      paperQuestions: {
        orderBy: [
          { sectionName: 'asc' },
          { questionNumber: 'asc' }
        ],
        include: {
          question: {
            include: {
              topic: {
                include: {
                  unit: {
                    include: {
                      subject: true
                    }
                  }
                }
              },
              answers: {
                where: { isVerified: true },
                take: 1
              }
            }
          }
        }
      }
    }
  });

  if (!paper) {
    return null;
  }

  // Format structured questions
  const structuredQuestions = paper.paperQuestions.map(pq => {
    const q = pq.question;
    const t = q.topic;
    const u = t?.unit;
    const s = u?.subject;

    let modelAnswer = null;
    if (q.answers && q.answers.length > 0) {
      const a = q.answers[0];
      let structureObj = null;
      try {
        if (a.modelStructure) structureObj = JSON.parse(a.modelStructure);
      } catch (e) {}

      modelAnswer = {
        answerText: a.answerText,
        keyPoints: a.keyPoints,
        judicialCitations: a.judicialCitations,
        structure: structureObj
      };
    }

    return {
      mappingId: pq.id,
      questionId: q.id,
      sectionName: pq.sectionName,
      questionNumber: pq.questionNumber,
      marks: pq.marks,
      isCompulsory: pq.isCompulsory,
      examYear: pq.examYear || paper.examYear,
      mappingStatus: pq.mappingStatus || 'VERIFIED',
      confidence: pq.confidence || 1.0,
      mappingNotes: pq.mappingNotes,
      
      // Question Content
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      difficulty: q.difficulty,
      priorityLabel: q.priority_label || 'Practice',
      whyImportant: q.why_important || 'Featured in verified university examination paper.',
      questionType: q.questionType,
      
      // Hierarchy: Question -> Subject -> Unit -> Topic -> Year
      hierarchy: {
        subjectId: s?.id || paper.subjectId,
        subjectTitle: s?.title || paper.subject?.title,
        subjectCode: s?.shortCode || paper.subject?.shortCode,
        unitId: u?.id || null,
        unitNumber: u?.unitNumber || null,
        unitTitle: u?.title || null,
        topicId: t?.id || null,
        topicNumber: t?.topicNumber || null,
        topicTitle: t?.title || null,
        examYear: pq.examYear || paper.examYear
      },

      modelAnswer
    };
  });

  // Group questions by section
  const sectionsMap = {};
  for (const q of structuredQuestions) {
    const sec = q.sectionName || 'General Section';
    if (!sectionsMap[sec]) {
      sectionsMap[sec] = {
        name: sec,
        questions: []
      };
    }
    sectionsMap[sec].questions.push(q);
  }

  return {
    ...paper,
    displayTitle: paper.title || `${paper.subject?.title} (${paper.examSession} ${paper.examYear})`,
    sections: Object.values(sectionsMap),
    structuredQuestions,
    totalQuestions: structuredQuestions.length
  };
}

/**
 * Admin: Create a new Previous Year Paper with metadata and PDF.
 */
export async function createPreviousPaper(data) {
  if (!data.universityId || !data.courseId || !data.semesterId || !data.subjectId || !data.examYear) {
    throw new Error('universityId, courseId, semesterId, subjectId, and examYear are required.');
  }

  const examYear = parseInt(data.examYear, 10);
  const examSession = data.examSession || 'WINTER';
  const id = data.id || `${data.subjectId}-${examYear}-${examSession}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  const created = await prisma.previousPaper.create({
    data: {
      id,
      universityId: data.universityId,
      courseId: data.courseId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      examYear,
      examSession,
      title: data.title || null,
      totalMarks: data.totalMarks ? parseInt(data.totalMarks, 10) : 70,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 180,
      paperCode: data.paperCode || null,
      fileUrl: data.fileUrl || null,
      allowDownload: data.allowDownload !== undefined ? Boolean(data.allowDownload) : true,
      status: data.status || 'PUBLISHED',
      instructions: data.instructions || 'Answer all compulsory questions. Read questions carefully before answering.'
    },
    include: {
      subject: true,
      university: true
    }
  });

  return created;
}

/**
 * Admin: Update previous paper metadata, status, or download permissions.
 */
export async function updatePreviousPaper(id, data) {
  return await prisma.previousPaper.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.examYear !== undefined && { examYear: parseInt(data.examYear, 10) }),
      ...(data.examSession && { examSession: data.examSession }),
      ...(data.totalMarks !== undefined && { totalMarks: parseInt(data.totalMarks, 10) }),
      ...(data.durationMinutes !== undefined && { durationMinutes: parseInt(data.durationMinutes, 10) }),
      ...(data.paperCode !== undefined && { paperCode: data.paperCode }),
      ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
      ...(data.allowDownload !== undefined && { allowDownload: Boolean(data.allowDownload) }),
      ...(data.status && { status: data.status }),
      ...(data.instructions !== undefined && { instructions: data.instructions })
    }
  });
}

/**
 * Admin: Delete a previous paper.
 */
export async function deletePreviousPaper(id) {
  return await prisma.previousPaper.delete({
    where: { id }
  });
}

/**
 * Admin / AI Question Mapping:
 * Ingests extracted questions and links them to the paper.
 */
export async function mapQuestionsToPaper(paperId, questionsList = []) {
  const paper = await prisma.previousPaper.findUnique({ where: { id: paperId } });
  if (!paper) throw new Error('Paper not found.');

  const createdMappings = [];

  for (const qItem of questionsList) {
    let questionId = qItem.questionId;

    // If new question, create in Question table
    if (!questionId) {
      const createdQ = await prisma.question.create({
        data: {
          topicId: qItem.topicId,
          questionText: qItem.questionText,
          questionTextGu: qItem.questionTextGu || null,
          marks: qItem.marks || 14,
          difficulty: qItem.difficulty || 'MEDIUM',
          preparationPriority: qItem.priority || 'HIGH',
          priority_label: qItem.priorityLabel || 'High Priority',
          why_important: qItem.whyImportant || `Featured in ${paper.examYear} university exam paper.`,
          questionType: qItem.questionType || 'DESCRIPTIVE',
          status: 'PUBLISHED',
          previous_year_count: 1,
          years_asked: JSON.stringify([paper.examYear])
        }
      });
      questionId = createdQ.id;
    }

    const mapping = await prisma.previousPaperQuestion.create({
      data: {
        paperId,
        questionId,
        sectionName: qItem.sectionName || 'Section A',
        questionNumber: qItem.questionNumber || 'Q1',
        marks: qItem.marks || 14,
        isCompulsory: qItem.isCompulsory !== undefined ? Boolean(qItem.isCompulsory) : true,
        examYear: paper.examYear,
        mappingStatus: qItem.mappingStatus || 'AI_SUGGESTED',
        confidence: qItem.confidence || 0.85,
        mappingNotes: qItem.mappingNotes || null
      }
    });

    createdMappings.push(mapping);
  }

  return createdMappings;
}

/**
 * Admin: Correct AI-generated mappings before publication.
 * Allows re-assigning topic, changing marks, section, question number, and marking VERIFIED.
 */
export async function updateQuestionMapping(mappingId, data) {
  const mapping = await prisma.previousPaperQuestion.findUnique({
    where: { id: mappingId },
    include: { question: true }
  });

  if (!mapping) {
    throw new Error('Mapping not found.');
  }

  // Update PreviousPaperQuestion
  const updatedMapping = await prisma.previousPaperQuestion.update({
    where: { id: mappingId },
    data: {
      ...(data.sectionName && { sectionName: data.sectionName }),
      ...(data.questionNumber && { questionNumber: data.questionNumber }),
      ...(data.marks !== undefined && { marks: parseInt(data.marks, 10) }),
      ...(data.isCompulsory !== undefined && { isCompulsory: Boolean(data.isCompulsory) }),
      mappingStatus: data.mappingStatus || 'MANUAL_OVERRIDE',
      confidence: 1.0,
      ...(data.mappingNotes !== undefined && { mappingNotes: data.mappingNotes })
    }
  });

  // Update underlying Question if topic or questionText was edited
  if (data.topicId || data.questionText || data.questionTextGu || data.marks !== undefined) {
    await prisma.question.update({
      where: { id: mapping.questionId },
      data: {
        ...(data.topicId && { topicId: data.topicId }),
        ...(data.questionText && { questionText: data.questionText }),
        ...(data.questionTextGu !== undefined && { questionTextGu: data.questionTextGu }),
        ...(data.marks !== undefined && { marks: parseInt(data.marks, 10) })
      }
    });
  }

  return updatedMapping;
}

/**
 * Evidence-Based Paper Analysis:
 * 1. Frequently Asked Topics
 * 2. Repeated Concepts
 * 3. Year-wise Distribution
 * 4. Unit-wise Distribution
 * 
 * CRITICAL RULE:
 * All analysis is strictly labeled: "Based on available previous papers."
 * Never present previous-paper frequency as a guarantee of future questions.
 */
export async function getPaperAnalysis({ subjectId, universityId = 'su', semesterId = 'su-llb-3yr-sem3' }) {
  if (!subjectId) {
    throw new Error('subjectId is required for paper analysis.');
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      units: {
        orderBy: { unitNumber: 'asc' },
        include: {
          topics: {
            orderBy: { topicNumber: 'asc' }
          }
        }
      }
    }
  });

  if (!subject) {
    throw new Error('Subject not found.');
  }

  // Fetch all previous paper questions for this subject
  const paperQuestions = await prisma.previousPaperQuestion.findMany({
    where: {
      paper: {
        subjectId,
        status: 'PUBLISHED'
      }
    },
    include: {
      paper: true,
      question: {
        include: {
          topic: {
            include: {
              unit: true
            }
          }
        }
      }
    }
  });

  const distinctPapers = await prisma.previousPaper.findMany({
    where: { subjectId, status: 'PUBLISHED' },
    orderBy: { examYear: 'asc' }
  });

  const availableYears = Array.from(new Set(distinctPapers.map(p => p.examYear))).sort((a, b) => a - b);
  const totalAvailablePapers = distinctPapers.length;

  // 1. Frequently Asked Topics
  const topicStatsMap = {};
  for (const u of subject.units) {
    for (const t of u.topics) {
      topicStatsMap[t.id] = {
        topicId: t.id,
        topicTitle: t.title,
        unitNumber: u.unitNumber,
        unitTitle: u.title,
        timesAsked: 0,
        yearsAppeared: new Set(),
        totalMarksAsked: 0,
        sampleQuestions: []
      };
    }
  }

  // 2. Unit-wise Distribution
  const unitStatsMap = {};
  for (const u of subject.units) {
    unitStatsMap[u.id] = {
      unitId: u.id,
      unitNumber: u.unitNumber,
      unitTitle: u.title,
      questionCount: 0,
      totalMarks: 0,
      percentageMarks: 0
    };
  }

  // 3. Year-wise Distribution
  const yearStatsMap = {};
  for (const y of availableYears) {
    yearStatsMap[y] = {
      year: y,
      paperCount: distinctPapers.filter(p => p.examYear === y).length,
      questionCount: 0,
      totalMarks: 0
    };
  }

  // Process questions
  let grandTotalMarks = 0;
  for (const pq of paperQuestions) {
    const q = pq.question;
    const t = q.topic;
    const u = t?.unit;
    const year = pq.examYear || pq.paper.examYear;
    const marks = pq.marks || q.marks || 10;
    grandTotalMarks += marks;

    // Topic map
    if (t && topicStatsMap[t.id]) {
      topicStatsMap[t.id].timesAsked++;
      topicStatsMap[t.id].yearsAppeared.add(year);
      topicStatsMap[t.id].totalMarksAsked += marks;
      if (topicStatsMap[t.id].sampleQuestions.length < 3) {
        topicStatsMap[t.id].sampleQuestions.push({
          questionText: q.questionText,
          marks,
          year
        });
      }
    }

    // Unit map
    if (u && unitStatsMap[u.id]) {
      unitStatsMap[u.id].questionCount++;
      unitStatsMap[u.id].totalMarks += marks;
    }

    // Year map
    if (yearStatsMap[year]) {
      yearStatsMap[year].questionCount++;
      yearStatsMap[year].totalMarks += marks;
    }
  }

  // Finalize Unit percentages
  const unitDistribution = Object.values(unitStatsMap).map(u => ({
    ...u,
    percentageMarks: grandTotalMarks > 0 ? Math.round((u.totalMarks / grandTotalMarks) * 100) : 0
  }));

  // Finalize Frequently Asked Topics (sorted by times asked)
  const frequentlyAskedTopics = Object.values(topicStatsMap)
    .filter(t => t.timesAsked > 0)
    .map(t => ({
      ...t,
      yearsAppeared: Array.from(t.yearsAppeared).sort(),
      frequencyLabel: t.timesAsked >= 3 ? 'High Frequency' : t.timesAsked === 2 ? 'Repeated' : 'Appeared',
      evidenceRationale: `Appeared in ${t.timesAsked} available previous paper(s) (${Array.from(t.yearsAppeared).join(', ')}). Based on available previous papers.`
    }))
    .sort((a, b) => b.timesAsked - a.timesAsked || b.totalMarksAsked - a.totalMarksAsked);

  // 4. Repeated Concepts
  const repeatedConcepts = frequentlyAskedTopics
    .filter(t => t.timesAsked >= 2)
    .map(t => ({
      topicTitle: t.topicTitle,
      unitNumber: t.unitNumber,
      timesAsked: t.timesAsked,
      years: t.yearsAppeared,
      evidenceNote: `Appeared in ${t.timesAsked} available previous papers (${t.yearsAppeared.join(', ')}). Based on available previous papers.`
    }));

  return {
    subject: {
      id: subject.id,
      title: subject.title,
      shortCode: subject.shortCode
    },
    meta: {
      totalAvailablePapers,
      availableYears,
      totalQuestionsAnalyzed: paperQuestions.length,
      disclaimer: MANDATORY_ANALYSIS_DISCLAIMER,
      warning: PREDICTIVE_CLAIM_WARNING
    },
    frequentlyAskedTopics,
    repeatedConcepts,
    unitDistribution,
    yearDistribution: Object.values(yearStatsMap)
  };
}

const previousPaperService = {
  MANDATORY_ANALYSIS_DISCLAIMER,
  PREDICTIVE_CLAIM_WARNING,
  getPreviousPapers,
  getPreviousPaperById,
  createPreviousPaper,
  updatePreviousPaper,
  deletePreviousPaper,
  mapQuestionsToPaper,
  updateQuestionMapping,
  getPaperAnalysis
};

export default previousPaperService;
