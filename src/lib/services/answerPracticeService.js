import prisma from '../prisma.js';

export const PRACTICE_COMPLIANCE_DISCLAIMER = {
  TITLE: "AI Practice Feedback",
  NOTICE: "Educational Self-Assessment Notice: This evaluation is an automated pedagogical guide designed to help you structure legal arguments. This is NOT official university examination marking and does NOT guarantee examination marks or grades.",
  UNVERIFIED_FLAG_NOTE: "Lowstudy flags any cited sections or judicial precedents that cannot be cross-referenced with verified syllabus authorities. We never invent or fabricate legal corrections."
};

/**
 * Extracts cited sections from text using regex (e.g., "Section 2(j)", "Sec. 22", "Article 21")
 */
function extractSectionsFromText(text = '') {
  const regex = /(?:Section|Sec\.|Article|Art\.)\s*([0-9]+[A-Za-z]*(?:\([a-zA-Z0-9]+\))*)/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[0].trim());
  }
  return Array.from(new Set(matches));
}

/**
 * Extracts case law mentions from text (e.g. "X v. Y" or "X vs. Y" or "In re X")
 */
function extractCaseLawsFromText(text = '') {
  const regex = /([A-Z][A-Za-z0-9\s.,'&]+?\s+(?:v\.|vs\.|versus)\s+[A-Z][A-Za-z0-9\s.,'&]+?(?:\([0-9]{4}\)|AIR\s+[0-9]{4}|SCC)?)/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0].trim().replace(/\s+/g, ' ');
    if (raw.length > 5 && raw.length < 90) {
      matches.push(raw);
    }
  }
  return Array.from(new Set(matches));
}

/**
 * Evaluates a student's descriptive legal exam answer against verified model content
 */
export async function evaluateStudentAnswer({
  userId = 'usr-student-01',
  questionId,
  studentAnswer = '',
  timeSpentSecs = 0
}) {
  if (!questionId) {
    throw new Error('Question ID is required for answer practice evaluation');
  }

  const cleanAnswer = (studentAnswer || '').trim();
  const wordCount = cleanAnswer.length > 0 ? cleanAnswer.split(/\s+/).filter(Boolean).length : 0;

  // 1. Fetch Question with its verified model answer and syllabus context
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
      answers: {
        where: { isVerified: true },
        take: 1
      }
    }
  });

  if (!question) {
    throw new Error(`Question not found: ${questionId}`);
  }

  // Fallback to any answer if no verified one explicitly flagged
  let primaryAnswer = question.answers?.[0];
  if (!primaryAnswer) {
    const fallbackAnswer = await prisma.questionAnswer.findFirst({
      where: { questionId }
    });
    primaryAnswer = fallbackAnswer;
  }

  // Parse verified model answer components
  let verifiedModel = {
    introduction: '',
    definition: '',
    relevantLaw: '',
    legalProvision: '',
    mainPoints: [],
    explanation: '',
    caseLaw: '',
    example: '',
    conclusion: ''
  };

  let verifiedSections = [];
  let verifiedCitations = [];
  let verifiedKeyPoints = [];

  if (primaryAnswer) {
    // Parse 9-part answerText
    try {
      if (primaryAnswer.answerText) {
        const parsed = JSON.parse(primaryAnswer.answerText);
        if (typeof parsed === 'object') {
          verifiedModel = { ...verifiedModel, ...parsed };
        }
      }
    } catch (e) {
      // If not JSON, use answerText as explanation
      verifiedModel.explanation = primaryAnswer.answerText;
    }

    // Parse modelStructure for verified sections
    try {
      if (primaryAnswer.modelStructure) {
        const struct = JSON.parse(primaryAnswer.modelStructure);
        if (Array.isArray(struct.sections)) verifiedSections = struct.sections;
        if (Array.isArray(struct.caseLaws)) verifiedCitations = struct.caseLaws;
      }
    } catch (e) {}

    // Parse judicial citations
    try {
      if (primaryAnswer.judicialCitations) {
        const parsed = JSON.parse(primaryAnswer.judicialCitations);
        if (Array.isArray(parsed)) verifiedCitations = [...verifiedCitations, ...parsed];
      }
    } catch (e) {}

    // Parse key points
    try {
      if (primaryAnswer.keyPoints) {
        const parsed = JSON.parse(primaryAnswer.keyPoints);
        if (Array.isArray(parsed)) verifiedKeyPoints = parsed;
      }
    } catch (e) {}
  }

  // Normalize verified sections (e.g. "Section 2(j)" -> "2(j)")
  const cleanSectionStr = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const verifiedSectionTokens = verifiedSections.map(cleanSectionStr);

  // Extract student's cited sections and case laws
  const studentCitedSections = extractSectionsFromText(cleanAnswer);
  const studentCitedCases = extractCaseLawsFromText(cleanAnswer);

  const answerLower = cleanAnswer.toLowerCase();

  // =========================================================================
  // 10 DIAGNOSTIC CHECKS
  // =========================================================================

  // Check 1: Definition
  const hasDefinition = answerLower.includes('definition') || 
                        answerLower.includes('defined as') || 
                        answerLower.includes('means and includes') ||
                        answerLower.includes('denotes') ||
                        (verifiedModel.definition && answerLower.includes(verifiedModel.definition.slice(0, 20).toLowerCase()));
  const definitionCheck = {
    dimension: 'Definition',
    status: hasDefinition ? 'IDENTIFIED' : 'MISSING',
    score: hasDefinition ? 10 : 0,
    observation: hasDefinition
      ? 'Clear formal legal definition or statutory meaning provided.'
      : 'Missing formal legal definition. Legal answers must explicitly state the statutory definition.'
  };

  // Check 2: Legal Provision (Statutory Framework)
  const statuteName = (question.topic.unit.subject.title || '').toLowerCase();
  const hasStatuteMention = answerLower.includes('act') || 
                            answerLower.includes('code') || 
                            answerLower.includes('statute') ||
                            answerLower.includes('constitution') ||
                            (verifiedModel.legalProvision && answerLower.includes(verifiedModel.legalProvision.slice(0, 15).toLowerCase()));
  const legalProvisionCheck = {
    dimension: 'Legal Provision',
    status: hasStatuteMention ? 'IDENTIFIED' : 'PARTIAL',
    score: hasStatuteMention ? 10 : 4,
    observation: hasStatuteMention
      ? 'Relevant governing enactment/statute referenced in the answer.'
      : 'Incomplete statutory context. Specify the governing Act (e.g., Industrial Disputes Act, 1947 or Constitution of India).'
  };

  // Check 3: Relevant Sections & Unverified Citations Flagging
  const verifiedFoundSections = [];
  const unverifiedStudentSections = [];

  for (const rawSec of studentCitedSections) {
    const rawClean = cleanSectionStr(rawSec);
    const isVerified = verifiedSectionTokens.some(v => rawClean.includes(v) || v.includes(rawClean));
    if (isVerified) {
      verifiedFoundSections.push(rawSec);
    } else {
      unverifiedStudentSections.push(rawSec);
    }
  }

  // Also check if verified sections appear in plain text
  for (const vSec of verifiedSections) {
    if (answerLower.includes(vSec.toLowerCase()) && !verifiedFoundSections.includes(vSec)) {
      verifiedFoundSections.push(vSec);
    }
  }

  const sectionsStatus = verifiedFoundSections.length > 0
    ? (verifiedFoundSections.length >= verifiedSections.length ? 'IDENTIFIED' : 'PARTIAL')
    : (verifiedSections.length === 0 ? 'NOT_APPLICABLE' : 'MISSING');

  const relevantSectionsCheck = {
    dimension: 'Relevant Sections',
    status: sectionsStatus,
    score: sectionsStatus === 'IDENTIFIED' ? 10 : (sectionsStatus === 'PARTIAL' ? 6 : 2),
    verifiedSectionsFound: verifiedFoundSections,
    verifiedSectionsExpected: verifiedSections,
    unverifiedSectionsCited: unverifiedStudentSections,
    observation: verifiedFoundSections.length > 0
      ? `Accurately identified key statutory section(s): ${verifiedFoundSections.join(', ')}.`
      : `Missing explicit section citation. Verified model answer emphasizes: ${verifiedSections.slice(0, 3).join(', ') || 'governing statutory sections'}.`
  };

  // Check 4: Essential Elements (Core ingredients from verified main points)
  let elementsCount = 0;
  const verifiedElements = Array.isArray(verifiedModel.mainPoints) && verifiedModel.mainPoints.length > 0
    ? verifiedModel.mainPoints
    : verifiedKeyPoints;

  for (const elem of verifiedElements) {
    const words = elem.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    const matchesElem = words.some(w => answerLower.includes(w.toLowerCase()));
    if (matchesElem) elementsCount++;
  }

  const elementsStatus = verifiedElements.length === 0 
    ? (wordCount > 60 ? 'IDENTIFIED' : 'PARTIAL')
    : (elementsCount >= Math.ceil(verifiedElements.length * 0.5) ? 'IDENTIFIED' : (elementsCount > 0 ? 'PARTIAL' : 'MISSING'));

  const essentialElementsCheck = {
    dimension: 'Essential Elements',
    status: elementsStatus,
    score: elementsStatus === 'IDENTIFIED' ? 10 : (elementsStatus === 'PARTIAL' ? 6 : 2),
    matchedElementsCount: elementsCount,
    totalExpectedElements: verifiedElements.length || 4,
    observation: elementsStatus === 'IDENTIFIED'
      ? `Identified core statutory ingredients and legal tests required for full marks.`
      : `Partially covered essential ingredients. Ensure all foundational tests are enumerated.`
  };

  // Check 5: Explanation
  const targetWords = question.marks >= 10 ? 180 : (question.marks >= 5 ? 100 : 50);
  const explanationDepth = wordCount >= targetWords ? 'IDENTIFIED' : (wordCount >= Math.round(targetWords * 0.5) ? 'PARTIAL' : 'MISSING');
  const explanationCheck = {
    dimension: 'Explanation',
    status: explanationDepth,
    score: explanationDepth === 'IDENTIFIED' ? 10 : (explanationDepth === 'PARTIAL' ? 6 : 2),
    wordCount,
    recommendedWordCount: targetWords,
    observation: explanationDepth === 'IDENTIFIED'
      ? `Substantive analytical depth provided with sufficient legal discussion (${wordCount} words).`
      : `Explanation is brief for a ${question.marks}-mark question (${wordCount}/${targetWords} words). Expand on doctrine rationale.`
  };

  // Check 6: Case Laws & Unverified Citations Flagging
  const verifiedFoundCases = [];
  const unverifiedStudentCases = [];

  for (const studentCase of studentCitedCases) {
    const caseLower = studentCase.toLowerCase();
    const isVerified = verifiedCitations.some(v => {
      const vLower = v.toLowerCase();
      return caseLower.includes(vLower.slice(0, 10)) || vLower.includes(caseLower.slice(0, 10));
    });

    if (isVerified) {
      verifiedFoundCases.push(studentCase);
    } else {
      unverifiedStudentCases.push(studentCase);
    }
  }

  // Also check if verified citations appear in plain answer text
  for (const vCit of verifiedCitations) {
    const vKey = vCit.split(/v\.|vs\./i)[0].trim().toLowerCase();
    if (answerLower.includes(vKey) && !verifiedFoundCases.some(c => c.toLowerCase().includes(vKey))) {
      verifiedFoundCases.push(vCit);
    }
  }

  const caseLawStatus = verifiedFoundCases.length > 0 
    ? 'IDENTIFIED' 
    : (verifiedCitations.length === 0 ? 'NOT_APPLICABLE' : 'MISSING');

  const caseLawsCheck = {
    dimension: 'Case Laws',
    status: caseLawStatus,
    score: caseLawStatus === 'IDENTIFIED' ? 10 : (caseLawStatus === 'NOT_APPLICABLE' ? 8 : 2),
    verifiedCasesFound: verifiedFoundCases,
    verifiedCasesExpected: verifiedCitations,
    unverifiedCasesCited: unverifiedStudentCases,
    observation: verifiedFoundCases.length > 0
      ? `Landmark precedent cited: ${verifiedFoundCases[0]}.`
      : `No landmark judicial precedents cited. Model answer incorporates: ${verifiedCitations.slice(0, 2).join('; ') || 'leading High Court / Supreme Court authorities'}.`
  };

  // Check 7: Examples (Illustrations)
  const hasExample = answerLower.includes('example') || 
                     answerLower.includes('illustration') || 
                     answerLower.includes('for instance') ||
                     answerLower.includes('e.g.');
  const examplesCheck = {
    dimension: 'Examples',
    status: hasExample ? 'IDENTIFIED' : 'MISSING',
    score: hasExample ? 10 : 3,
    observation: hasExample
      ? 'Provided practical illustration or hypothetical scenario applying the rule.'
      : 'No factual examples or illustrations included. Practical illustrations solidify high exam scores.'
  };

  // Check 8: Conclusion
  const hasConclusion = answerLower.includes('conclusion') || 
                        answerLower.includes('in conclusion') || 
                        answerLower.includes('hence') || 
                        answerLower.includes('therefore') ||
                        answerLower.includes('thus') ||
                        answerLower.includes('to summarize');
  const conclusionCheck = {
    dimension: 'Conclusion',
    status: hasConclusion ? 'IDENTIFIED' : 'MISSING',
    score: hasConclusion ? 10 : 2,
    observation: hasConclusion
      ? 'Synthesizing conclusion summarizes legal position and contemporary judicial trend.'
      : 'Missing concluding paragraph. End with a crisp 2-3 sentence synthesis of the current legal standing.'
  };

  // Check 9: Structure
  const paragraphCount = cleanAnswer.split(/\n+/).filter(p => p.trim().length > 0).length;
  const hasHeadings = /(?:Introduction|Definition|Section|Essential|Elements|Case Law|Conclusion)/i.test(cleanAnswer);
  const isStructured = paragraphCount >= 3 || hasHeadings;
  const structureCheck = {
    dimension: 'Structure',
    status: isStructured ? 'IDENTIFIED' : 'PARTIAL',
    score: isStructured ? 10 : 5,
    paragraphCount,
    hasHeadings,
    observation: isStructured
      ? 'Logical progression with distinct paragraphs or structured headings.'
      : 'Structure is monolithic. Organize answers into clear parts: Introduction -> Provision -> Elements -> Analysis -> Precedent -> Conclusion.'
  };

  // Check 10: Relevance
  const questionWords = question.questionText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const matchedQWords = questionWords.filter(w => answerLower.includes(w));
  const relevanceRatio = questionWords.length > 0 ? matchedQWords.length / questionWords.length : 1;
  const isRelevant = relevanceRatio >= 0.3 && wordCount >= 30;
  const relevanceCheck = {
    dimension: 'Relevance',
    status: isRelevant ? 'IDENTIFIED' : 'MISSING',
    score: isRelevant ? 10 : 2,
    observation: isRelevant
      ? 'Answer directly addresses the specific legal question asked.'
      : 'Answer deviates from the core question subject matter. Refocus on direct requirements of the prompt.'
  };

  // Composite Rubric
  const allChecks = [
    definitionCheck,
    legalProvisionCheck,
    relevantSectionsCheck,
    essentialElementsCheck,
    explanationCheck,
    caseLawsCheck,
    examplesCheck,
    conclusionCheck,
    structureCheck,
    relevanceCheck
  ];

  const totalScore = allChecks.reduce((sum, c) => sum + c.score, 0);
  const overallPercentage = Math.round(totalScore);

  // =========================================================================
  // 3 FEEDBACK CATEGORIES: What was done well, What is missing, What to improve
  // =========================================================================

  const whatWasDoneWell = [];
  const whatIsMissing = [];
  const whatShouldBeImproved = [];

  // 1. What was done well
  if (hasDefinition) whatWasDoneWell.push("Accurately identified and stated the core statutory or doctrinal definition.");
  if (hasStatuteMention) whatWasDoneWell.push(`Properly grounded arguments within the governing legislative framework (${question.topic.unit.subject.title}).`);
  if (verifiedFoundSections.length > 0) whatWasDoneWell.push(`Successfully cited verified statutory provisions: ${verifiedFoundSections.join(', ')}.`);
  if (elementsStatus === 'IDENTIFIED') whatWasDoneWell.push("Clearly enumerated the foundational legal ingredients and tests.");
  if (verifiedFoundCases.length > 0) whatWasDoneWell.push(`Applied landmark precedent: ${verifiedFoundCases[0]}.`);
  if (hasExample) whatWasDoneWell.push("Included practical illustrations to demonstrate real-world application.");
  if (hasConclusion) whatWasDoneWell.push("Included a coherent concluding synthesis.");
  if (wordCount >= targetWords) whatWasDoneWell.push(`Maintained comprehensive analytical length (${wordCount} words).`);

  if (whatWasDoneWell.length === 0) {
    whatWasDoneWell.push("Attempted the question and established initial context for the topic.");
  }

  // 2. What is missing
  if (!hasDefinition) whatIsMissing.push("Formal legal definition: Begin by quoting or defining the precise statutory terminology.");
  if (verifiedSections.length > 0 && verifiedFoundSections.length === 0) {
    whatIsMissing.push(`Crucial statutory section(s): Model answer specifies ${verifiedSections.join(', ')}.`);
  }
  if (verifiedCitations.length > 0 && verifiedFoundCases.length === 0) {
    whatIsMissing.push(`Landmark judicial precedent: Incorporate ${verifiedCitations.slice(0, 2).join('; ')}.`);
  }
  if (!hasExample) whatIsMissing.push("Hypothetical or practical illustration applying the legal doctrine.");
  if (!hasConclusion) whatIsMissing.push("Concluding paragraph summarizing the current judicial and statutory position.");
  if (wordCount < targetWords) {
    whatIsMissing.push(`Elaboration: Expand by at least ${targetWords - wordCount} words to satisfy ${question.marks}-mark university criteria.`);
  }

  // 3. What should be improved
  if (!isStructured) {
    whatShouldBeImproved.push("Answer Formatting: Divide your text into standard 9-part headings (Introduction -> Definition -> Statutory Provision -> Essential Elements -> Legal Analysis -> Landmark Precedents -> Conclusion).");
  }
  if (elementsStatus !== 'IDENTIFIED') {
    whatShouldBeImproved.push("Statutory Ingredient Enumeration: Present core ingredients in bullet points or numbered tests for examiner readability.");
  }
  if (verifiedFoundCases.length > 0) {
    whatShouldBeImproved.push("Case Law Articulation: State the precise ratio decidendi and key judgment principle rather than just naming the case.");
  } else {
    whatShouldBeImproved.push("Precedent Integration: Memorize leading case ratios for this unit to elevate answer credibility.");
  }

  // Flagged Unverified Legal Citations
  const flaggedUnverifiedLegalInfo = [];
  if (unverifiedStudentSections.length > 0) {
    flaggedUnverifiedLegalInfo.push({
      type: 'UNVERIFIED_SECTION',
      items: unverifiedStudentSections,
      message: `The following section citation(s) could not be verified against the curated model syllabus answer: ${unverifiedStudentSections.join(', ')}. Please verify directly in the authentic Bare Act.`
    });
  }
  if (unverifiedStudentCases.length > 0) {
    flaggedUnverifiedLegalInfo.push({
      type: 'UNVERIFIED_CASE_LAW',
      items: unverifiedStudentCases,
      message: `The following case citation(s) could not be verified against verified curriculum authorities: ${unverifiedStudentCases.join(', ')}. Cross-reference with standard law reporters.`
    });
  }

  const evaluationResult = {
    feedbackTitle: PRACTICE_COMPLIANCE_DISCLAIMER.TITLE,
    disclaimer: PRACTICE_COMPLIANCE_DISCLAIMER.NOTICE,
    unverifiedFlagNote: PRACTICE_COMPLIANCE_DISCLAIMER.UNVERIFIED_FLAG_NOTE,
    evaluatedAt: new Date().toISOString(),
    metrics: {
      wordCount,
      recommendedWordCount: targetWords,
      timeSpentSecs,
      questionMarks: question.marks,
      rubricPercentage: overallPercentage
    },
    diagnosticChecks: allChecks,
    feedback: {
      whatWasDoneWell,
      whatIsMissing,
      whatShouldBeImproved
    },
    flaggedUnverifiedLegalInfo,
    modelAnswerComparison: {
      verifiedSections,
      verifiedCitations,
      verifiedKeyPoints,
      modelStructure: verifiedModel
    }
  };

  return {
    question: {
      id: question.id,
      questionText: question.questionText,
      questionTextGu: question.questionTextGu,
      marks: question.marks,
      difficulty: question.difficulty,
      priority_label: question.priority_label,
      questionType: question.questionType,
      topic: {
        id: question.topic.id,
        title: question.topic.title,
        unitNumber: question.topic.unit.unitNumber,
        subject: {
          id: question.topic.unit.subject.id,
          code: question.topic.unit.subject.shortCode,
          title: question.topic.unit.subject.title
        }
      }
    },
    studentAnswer: cleanAnswer,
    evaluation: evaluationResult
  };
}

/**
 * Saves a completed practice attempt to the database and syncs revision status
 */
export async function savePracticeAttempt({
  userId = 'usr-student-01',
  questionId,
  studentAnswer,
  evaluation,
  wordCount = 0,
  timeSpentSecs = 0
}) {
  const attempt = await prisma.answerPracticeAttempt.create({
    data: {
      userId,
      questionId,
      studentAnswer,
      evaluationJson: JSON.stringify(evaluation),
      wordCount,
      timeSpentSecs,
      status: 'SAVED'
    }
  });

  // Automatically update Question revision status and StudyProgress
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { topicId: true }
    });

    if (question?.topicId) {
      // Mark topic as practiced
      await prisma.studyProgress.upsert({
        where: {
          userId_topicId: { userId, topicId: question.topicId }
        },
        update: {
          lastStudiedAt: new Date(),
          timeSpentSeconds: { increment: Math.max(300, timeSpentSecs) }
        },
        create: {
          userId,
          topicId: question.topicId,
          isCompleted: true,
          confidenceLevel: 'MEDIUM',
          lastStudiedAt: new Date(),
          timeSpentSeconds: Math.max(300, timeSpentSecs)
        }
      });
    }

    // Upsert Revision Item for this Question
    await prisma.revisionItem.upsert({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType: 'QUESTION',
          entityId: questionId
        }
      },
      update: {
        reviewCount: { increment: 1 },
        correctReviewCount: { increment: 1 },
        repetitionNumber: { increment: 1 },
        revisionStatus: 'REVIEW_AGAIN',
        lastReviewedAt: new Date()
      },
      create: {
        userId,
        entityType: 'QUESTION',
        entityId: questionId,
        reviewCount: 1,
        correctReviewCount: 1,
        repetitionNumber: 1,
        revisionStatus: 'REVIEW_AGAIN',
        lastReviewedAt: new Date()
      }
    });
  } catch (err) {
    console.error('Non-critical: Failed to update revision progress:', err);
  }

  return attempt;
}

/**
 * Retrieves past practice history and saved drafts for a question
 */
export async function getQuestionPracticeHistory({
  userId = 'usr-student-01',
  questionId
}) {
  const attempts = await prisma.answerPracticeAttempt.findMany({
    where: { userId, questionId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return attempts.map(a => ({
    id: a.id,
    questionId: a.questionId,
    studentAnswer: a.studentAnswer,
    wordCount: a.wordCount,
    timeSpentSecs: a.timeSpentSecs,
    status: a.status,
    createdAt: a.createdAt,
    evaluation: typeof a.evaluationJson === 'string' ? JSON.parse(a.evaluationJson) : a.evaluationJson
  }));
}
