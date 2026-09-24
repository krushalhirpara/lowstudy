import prisma from '../prisma.js';

/**
 * Valid workflow stages:
 * AI_GENERATED -> DRAFT -> ADMIN_REVIEW -> VERIFIED -> PUBLISHED
 * (Branching: ADMIN_REVIEW -> REJECTED or FLAGGED -> DRAFT)
 */
export const WORKFLOW_STAGES = {
  AI_GENERATED: 'AI_GENERATED',
  DRAFT: 'DRAFT',
  ADMIN_REVIEW: 'ADMIN_REVIEW',
  VERIFIED: 'VERIFIED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
};

export const VERIFICATION_STATUSES = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  FLAGGED: 'FLAGGED',
};

export const ALLOWED_TRANSITIONS = {
  [WORKFLOW_STAGES.AI_GENERATED]: [WORKFLOW_STAGES.DRAFT, WORKFLOW_STAGES.REJECTED],
  [WORKFLOW_STAGES.DRAFT]: [WORKFLOW_STAGES.ADMIN_REVIEW, WORKFLOW_STAGES.REJECTED],
  [WORKFLOW_STAGES.ADMIN_REVIEW]: [
    WORKFLOW_STAGES.VERIFIED,
    WORKFLOW_STAGES.REJECTED,
    WORKFLOW_STAGES.FLAGGED,
    WORKFLOW_STAGES.DRAFT,
  ],
  [WORKFLOW_STAGES.FLAGGED]: [WORKFLOW_STAGES.DRAFT, WORKFLOW_STAGES.REJECTED],
  [WORKFLOW_STAGES.VERIFIED]: [WORKFLOW_STAGES.PUBLISHED, WORKFLOW_STAGES.ADMIN_REVIEW],
  [WORKFLOW_STAGES.PUBLISHED]: [],
  [WORKFLOW_STAGES.REJECTED]: [WORKFLOW_STAGES.DRAFT], // Allow reviving if fixed
};

/**
 * Creates a new AI content record with mandatory safe defaults.
 * Under zero circumstances will this be auto-published or auto-verified.
 */
export async function createAiContentRecord({
  entityType,
  prompt,
  generatedContent,
  language = 'EN',
  modelName = 'gemini-1.5-flash',
}) {
  if (!entityType || !prompt || !generatedContent) {
    throw new Error('entityType, prompt, and generatedContent are required.');
  }

  const contentStr = typeof generatedContent === 'object' 
    ? JSON.stringify(generatedContent) 
    : String(generatedContent);

  return await prisma.aiContent.create({
    data: {
      entityType,
      prompt,
      generatedContent: contentStr,
      language,
      modelName,
      // Mandatory governance defaults:
      workflowStage: WORKFLOW_STAGES.AI_GENERATED,
      verificationStatus: VERIFICATION_STATUSES.PENDING,
      status: 'DRAFT',
    },
  });
}

/**
 * Retrieves the moderation queue with filtering and pagination.
 */
export async function getModerationQueue({
  workflowStage,
  verificationStatus,
  entityType,
  language,
  page = 1,
  limit = 20,
} = {}) {
  const where = {};

  if (workflowStage) where.workflowStage = workflowStage;
  if (verificationStatus) where.verificationStatus = verificationStatus;
  if (entityType) where.entityType = entityType;
  if (language) where.language = language;

  const skip = (Math.max(1, page) - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.aiContent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.aiContent.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Retrieves a single AI content item with full audit review history.
 */
export async function getAiContentById(id) {
  const content = await prisma.aiContent.findUnique({
    where: { id },
    include: {
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!content) return null;

  // Fetch reviews associated with this entity
  const reviews = await prisma.contentReview.findMany({
    where: {
      entityType: 'AI_CONTENT',
      entityId: id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    ...content,
    reviews,
  };
}

/**
 * Transitions an AI content record to a new workflow stage.
 * Enforces legal accuracy gating and state machine rules.
 */
export async function transitionWorkflowStage(id, { targetStage, actorId, notes } = {}) {
  const current = await prisma.aiContent.findUnique({ where: { id } });
  if (!current) {
    throw new Error(`AI Content with id ${id} not found.`);
  }

  // Check if transition is allowed
  const allowed = ALLOWED_TRANSITIONS[current.workflowStage] || [];
  if (!allowed.includes(targetStage)) {
    throw new Error(
      `Illegal transition: Cannot transition from ${current.workflowStage} to ${targetStage}. Allowed next stages: [${allowed.join(', ')}]`
    );
  }

  // Publication gate: Cannot publish without verified status
  if (targetStage === WORKFLOW_STAGES.PUBLISHED) {
    if (current.verificationStatus !== VERIFICATION_STATUSES.VERIFIED) {
      throw new Error('Cannot publish content that has not been explicitly VERIFIED by an admin or faculty member.');
    }
  }

  const updateData = {
    workflowStage: targetStage,
  };

  if (targetStage === WORKFLOW_STAGES.VERIFIED) {
    updateData.verificationStatus = VERIFICATION_STATUSES.VERIFIED;
    updateData.verifiedById = actorId || null;
    updateData.verificationNotes = notes || current.verificationNotes;
    updateData.verifiedAt = new Date();
  } else if (targetStage === WORKFLOW_STAGES.REJECTED) {
    updateData.verificationStatus = VERIFICATION_STATUSES.REJECTED;
    updateData.verificationNotes = notes || current.verificationNotes;
  } else if (targetStage === WORKFLOW_STAGES.FLAGGED) {
    updateData.verificationStatus = VERIFICATION_STATUSES.FLAGGED;
    updateData.verificationNotes = notes || current.verificationNotes;
  } else if (targetStage === WORKFLOW_STAGES.PUBLISHED) {
    updateData.status = 'PUBLISHED';
  }

  return await prisma.aiContent.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Records a formal content review from an Admin or Faculty member.
 */
export async function recordContentReview(id, { reviewerId, reviewStatus, remarks }) {
  if (!reviewerId || !reviewStatus) {
    throw new Error('reviewerId and reviewStatus are required.');
  }

  const content = await prisma.aiContent.findUnique({ where: { id } });
  if (!content) {
    throw new Error(`AI Content with id ${id} not found.`);
  }

  // Create review audit record
  const review = await prisma.contentReview.create({
    data: {
      entityType: 'AI_CONTENT',
      entityId: id,
      reviewerId,
      reviewStatus,
      remarks: remarks || '',
    },
  });

  // Apply corresponding workflow stage updates
  if (reviewStatus === 'APPROVED') {
    await prisma.aiContent.update({
      where: { id },
      data: {
        verificationStatus: VERIFICATION_STATUSES.VERIFIED,
        workflowStage: WORKFLOW_STAGES.VERIFIED,
        verifiedById: reviewerId,
        verificationNotes: remarks || 'Approved by reviewer',
        verifiedAt: new Date(),
      },
    });
  } else if (reviewStatus === 'CHANGES_REQUESTED') {
    await prisma.aiContent.update({
      where: { id },
      data: {
        verificationStatus: VERIFICATION_STATUSES.FLAGGED,
        workflowStage: WORKFLOW_STAGES.FLAGGED,
        verificationNotes: remarks || 'Changes requested by reviewer',
      },
    });
  } else if (reviewStatus === 'REJECTED') {
    await prisma.aiContent.update({
      where: { id },
      data: {
        verificationStatus: VERIFICATION_STATUSES.REJECTED,
        workflowStage: WORKFLOW_STAGES.REJECTED,
        verificationNotes: remarks || 'Rejected by reviewer',
      },
    });
  }

  return review;
}

/**
 * Promotes an approved and verified AI Content item into the live catalog.
 */
export async function promoteToOfficialCatalog(id, { actorId, targetTopicId, targetSubjectId } = {}) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Valid content ID is required.');
  }

  const content = await prisma.aiContent.findUnique({ where: { id: id.trim() } });
  if (!content) {
    throw new Error(`AI Content with id ${id} not found.`);
  }

  if (content.verificationStatus !== VERIFICATION_STATUSES.VERIFIED) {
    throw new Error('Content must be VERIFIED before it can be promoted to the official catalog.');
  }

  let promotedEntity = null;
  let parsedContent = null;
  try {
    parsedContent = JSON.parse(content.generatedContent);
  } catch {
    parsedContent = content.generatedContent;
  }

  // Topic lookup fallback if not provided
  let topicId = targetTopicId;
  if (!topicId) {
    const fallbackTopic = await prisma.topic.findFirst();
    topicId = fallbackTopic ? fallbackTopic.id : null;
  }

  let subjectId = targetSubjectId;
  if (!subjectId) {
    const fallbackSubject = await prisma.subject.findFirst();
    subjectId = fallbackSubject ? fallbackSubject.id : null;
  }

  if (content.entityType === 'MCQ') {
    const questionText = typeof parsedContent === 'object' ? parsedContent.question : content.prompt;
    const explanation = typeof parsedContent === 'object' ? parsedContent.explanation : 'Generated by AI';
    const options = (typeof parsedContent === 'object' && Array.isArray(parsedContent.options)) 
      ? parsedContent.options 
      : [
          { key: 'A', text: 'Option A', isCorrect: true },
          { key: 'B', text: 'Option B', isCorrect: false },
          { key: 'C', text: 'Option C', isCorrect: false },
          { key: 'D', text: 'Option D', isCorrect: false },
        ];

    promotedEntity = await prisma.mcq.create({
      data: {
        topicId: topicId || 'unknown',
        subjectId: subjectId || 'unknown',
        questionText,
        explanation,
        difficulty: (parsedContent.difficulty || 'MEDIUM').toUpperCase(),
        preparationPriority: 'HIGH',
        status: 'PUBLISHED',
        options: {
          create: options.map(opt => ({
            optionKey: opt.key || 'A',
            optionText: opt.text || opt.optionText || '',
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
      },
      include: {
        options: true,
      },
    });
  } else if (content.entityType === 'NOTES') {
    const simpleNotes = typeof parsedContent === 'object' ? (parsedContent.simpleNotes || parsedContent.content) : content.generatedContent;
    const detailedNotes = typeof parsedContent === 'object' ? (parsedContent.detailedNotes || parsedContent.content) : content.generatedContent;

    promotedEntity = await prisma.note.create({
      data: {
        id: `note-ai-${id}-${Date.now()}`.toLowerCase(),
        topicId: topicId || 'unknown',
        language: content.language || 'EN',
        simpleNotes: simpleNotes || '',
        detailedNotes: detailedNotes || '',
        keyPoints: JSON.stringify(parsedContent.keyPoints || []),
        mnemonics: parsedContent.mnemonics || null,
        status: 'PUBLISHED',
        verifiedById: actorId || content.verifiedById,
      },
    });
  } else if (content.entityType === 'MODEL_ANSWER') {
    const question = await prisma.question.findFirst({
      where: topicId ? { topicId } : {},
    });

    if (question) {
      promotedEntity = await prisma.questionAnswer.create({
        data: {
          questionId: question.id,
          language: content.language || 'EN',
          answerText: typeof parsedContent === 'object' ? (parsedContent.answer || parsedContent.content) : content.generatedContent,
          keyPoints: JSON.stringify(parsedContent.keyPoints || []),
          judicialCitations: JSON.stringify(parsedContent.citations || []),
          modelStructure: 'IRAC',
          isVerified: true,
          verifiedById: actorId || content.verifiedById,
        },
      });
    }
  }

  // Update AI Content status to PUBLISHED
  await prisma.aiContent.update({
    where: { id },
    data: {
      workflowStage: WORKFLOW_STAGES.PUBLISHED,
      status: 'PUBLISHED',
    },
  });

  return {
    success: true,
    promotedType: content.entityType,
    promotedEntity,
  };
}