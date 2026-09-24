import prisma from '../prisma.js';

export const PRIORITY_LABELS = {
  VERY_HIGH: 'Very High Priority',
  HIGH: 'High Priority',
  IMPORTANT: 'Important',
  PRACTICE: 'Practice'
};

export const PRIORITY_DISCLAIMER = 
  'Evidence-based educational classification derived from syllabus weight and verified past exam papers. LowStudy does not predict or guarantee upcoming examination questions.';

/**
 * Calculates evidence-based priority score (0-100), label, and rationale for a question.
 * 
 * Factors:
 * 1. Previous-year frequency (weight: 35%)
 * 2. Recency of appearance (weight: 20%)
 * 3. Syllabus importance (weight: 15%)
 * 4. Core legal concept (weight: 15%)
 * 5. Statutory importance (weight: 10%)
 * 6. Related topic frequency (weight: 5%)
 */
export function calculateQuestionPriorityScore({
  previousYearCount = 0,
  yearsAsked = [],
  syllabusWeight = 1.0,
  legalImportance = 1.0,
  hasStatutorySections = true,
  relatedTopicQuestionCount = 1,
  subjectTitle = '',
  unitTitle = ''
}) {
  // Normalize yearsAsked
  let parsedYears = [];
  if (Array.isArray(yearsAsked)) {
    parsedYears = yearsAsked.map(y => parseInt(y, 10)).filter(y => !isNaN(y));
  } else if (typeof yearsAsked === 'string') {
    try {
      const parsed = JSON.parse(yearsAsked);
      if (Array.isArray(parsed)) {
        parsedYears = parsed.map(y => parseInt(y, 10)).filter(y => !isNaN(y));
      }
    } catch {
      parsedYears = yearsAsked.split(',').map(y => parseInt(y.trim(), 10)).filter(y => !isNaN(y));
    }
  }

  const pyqCount = Math.max(previousYearCount, parsedYears.length);

  // 1. Previous-Year Frequency (0 - 35 points)
  let fFrequency = 0;
  if (pyqCount >= 3) fFrequency = 35;
  else if (pyqCount === 2) fFrequency = 28;
  else if (pyqCount === 1) fFrequency = 18;
  else fFrequency = 0;

  // 2. Recency (0 - 20 points)
  let fRecency = 0;
  if (parsedYears.length > 0) {
    const mostRecent = Math.max(...parsedYears);
    if (mostRecent >= 2024) fRecency = 20;
    else if (mostRecent === 2023) fRecency = 15;
    else if (mostRecent === 2022) fRecency = 10;
    else fRecency = 5;
  }

  // 3. Syllabus Importance (0 - 15 points)
  // Standard syllabusWeight is 1.0; fundamental units can be 1.5; specialized 0.7
  const clampedSyllabusWeight = Math.min(Math.max(syllabusWeight, 0.5), 2.0);
  const fSyllabus = Math.round((clampedSyllabusWeight / 2.0) * 15);

  // 4. Core Legal Concept (0 - 15 points)
  // legalImportance is 1.0 for normal, 2.0 for core definitions, 2.5 for landmark doctrines
  const clampedLegalImportance = Math.min(Math.max(legalImportance, 0.5), 2.5);
  const fLegalConcept = Math.round((clampedLegalImportance / 2.5) * 15);

  // 5. Statutory Importance (0 - 10 points)
  const fStatutory = hasStatutorySections ? 10 : 4;

  // 6. Related Topic Frequency (0 - 5 points)
  let fRelated = Math.min(Math.max(relatedTopicQuestionCount, 1), 5);

  // Total raw score
  let totalScore = fFrequency + fRecency + fSyllabus + fLegalConcept + fStatutory + fRelated;
  totalScore = Math.min(Math.max(Math.round(totalScore), 5), 100);

  // Label Mapping
  let label = PRIORITY_LABELS.PRACTICE;
  if (totalScore >= 70) {
    label = PRIORITY_LABELS.VERY_HIGH;
  } else if (totalScore >= 55) {
    label = PRIORITY_LABELS.HIGH;
  } else if (totalScore >= 35) {
    label = PRIORITY_LABELS.IMPORTANT;
  } else {
    label = PRIORITY_LABELS.PRACTICE;
  }

  // Generate Evidence Justification ("Why this is important")
  // Strict rule: NEVER claim "This question will definitely come" or predict exam.
  let whyImportant = '';
  const sortedYears = [...new Set(parsedYears)].sort((a, b) => b - a);

  if (pyqCount >= 2 && sortedYears.length > 0) {
    whyImportant = `Appeared in multiple available previous papers (${sortedYears.join(', ')}) and covers a core syllabus concept under the verified curriculum.`;
  } else if (pyqCount === 1 && sortedYears.length > 0) {
    whyImportant = `Featured in verified university examination paper (${sortedYears[0]}) and addresses a fundamental statutory provision.`;
  } else if (clampedLegalImportance >= 2.0) {
    whyImportant = `Foundational legal doctrine with high syllabus weight and direct Bare Act grounding; essential for conceptual clarity.`;
  } else if (clampedSyllabusWeight >= 1.3) {
    whyImportant = `Core unit syllabus topic with high curricular representation; valuable for comprehensive exam readiness.`;
  } else {
    whyImportant = `Standard curriculum topic designed for systematic concept reinforcement and descriptive answer-writing practice.`;
  }

  return {
    priority_score: totalScore,
    priority_label: label,
    previous_year_count: pyqCount,
    years_asked: JSON.stringify(sortedYears),
    syllabus_weight: clampedSyllabusWeight,
    legal_importance: clampedLegalImportance,
    why_important: whyImportant,
    factorBreakdown: {
      frequencyScore: fFrequency,
      recencyScore: fRecency,
      syllabusScore: fSyllabus,
      coreLegalScore: fLegalConcept,
      statutoryScore: fStatutory,
      relatedScore: fRelated
    }
  };
}

/**
 * Re-scores a single question in the database based on authentic past papers and curriculum data.
 */
export async function recalculateQuestionPriority(questionId) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
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
      paperQuestions: {
        include: {
          paper: true
        }
      }
    }
  });

  if (!question) {
    throw new Error(`Question ${questionId} not found`);
  }

  // If priority was manually set by admin, do not overwrite unless forced
  if (question.isManualPriority) {
    return question;
  }

  // Collect verified years from paperQuestions
  const paperYears = question.paperQuestions
    .map(pq => pq.paper?.examYear)
    .filter(Boolean)
    .map(y => parseInt(y, 10));

  // Determine legal importance based on question keywords / marks
  let legalImp = 1.0;
  const qText = (question.questionText || '').toLowerCase();
  if (
    qText.includes('definition') ||
    qText.includes('define') ||
    qText.includes('workman') ||
    qText.includes('strike') ||
    qText.includes('lock-out') ||
    qText.includes('natural justice') ||
    qText.includes('section 43a') ||
    qText.includes('mens rea')
  ) {
    legalImp = 2.2;
  } else if (qText.includes('distinguish') || qText.includes('explain') || qText.includes('procedure')) {
    legalImp = 1.6;
  }

  // Determine syllabus weight based on unit position and marks
  let syllWeight = 1.0;
  if (question.marks >= 10) syllWeight = 1.4;
  else if (question.marks === 5) syllWeight = 1.2;

  const priorityData = calculateQuestionPriorityScore({
    previousYearCount: paperYears.length,
    yearsAsked: paperYears,
    syllabusWeight: syllWeight,
    legalImportance: legalImp,
    hasStatutorySections: true,
    relatedTopicQuestionCount: 3,
    subjectTitle: question.topic?.unit?.subject?.title || '',
    unitTitle: question.topic?.unit?.title || ''
  });

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      priority_score: priorityData.priority_score,
      priority_label: priorityData.priority_label,
      previous_year_count: priorityData.previous_year_count,
      years_asked: priorityData.years_asked,
      syllabus_weight: priorityData.syllabus_weight,
      legal_importance: priorityData.legal_importance,
      why_important: priorityData.why_important,
      preparationPriority: priorityData.priority_label === PRIORITY_LABELS.VERY_HIGH ? 'HIGH' : (priorityData.priority_label === PRIORITY_LABELS.PRACTICE ? 'LOW' : 'MEDIUM')
    }
  });

  return updated;
}

/**
 * Recalculates priorities for all published questions in the database.
 */
export async function recalculateAllQuestionsPriorities() {
  const questions = await prisma.question.findMany({
    select: { id: true, isManualPriority: true }
  });

  let updatedCount = 0;
  for (const q of questions) {
    if (!q.isManualPriority) {
      await recalculateQuestionPriority(q.id);
      updatedCount++;
    }
  }

  return { total: questions.length, updated: updatedCount };
}

/**
 * Admin manual override for a question's priority.
 */
export async function adminOverrideQuestionPriority(questionId, {
  priorityLabel,
  customWhyImportant = null,
  resetToAuto = false
}) {
  if (resetToAuto) {
    await prisma.question.update({
      where: { id: questionId },
      data: { isManualPriority: false }
    });
    return await recalculateQuestionPriority(questionId);
  }

  const validLabels = Object.values(PRIORITY_LABELS);
  if (!validLabels.includes(priorityLabel)) {
    throw new Error(`Invalid priority label. Must be one of: ${validLabels.join(', ')}`);
  }

  // Calculate corresponding baseline score for manual priority
  let manualScore = 50;
  if (priorityLabel === PRIORITY_LABELS.VERY_HIGH) manualScore = 85;
  else if (priorityLabel === PRIORITY_LABELS.HIGH) manualScore = 68;
  else if (priorityLabel === PRIORITY_LABELS.IMPORTANT) manualScore = 50;
  else if (priorityLabel === PRIORITY_LABELS.PRACTICE) manualScore = 25;

  const currentQ = await prisma.question.findUnique({
    where: { id: questionId },
    select: { why_important: true }
  });

  const updated = await prisma.question.update({
    where: { id: questionId },
    data: {
      priority_label: priorityLabel,
      priority_score: manualScore,
      isManualPriority: true,
      why_important: customWhyImportant || currentQ?.why_important || `Curated as ${priorityLabel} based on academic syllabus review.`,
      preparationPriority: priorityLabel === PRIORITY_LABELS.VERY_HIGH ? 'HIGH' : (priorityLabel === PRIORITY_LABELS.PRACTICE ? 'LOW' : 'MEDIUM')
    }
  });

  return updated;
}
