import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyAuth, sanitizeInput } from '@/lib/security.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const semesterId = searchParams.get('semesterId');
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status') || 'ALL';
    const marks = searchParams.get('marks');
    const search = sanitizeInput(searchParams.get('search') || '').trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(universityId ? { universityId } : {}),
      ...(semesterId ? { semesterId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(status && status !== 'ALL' ? { publicationStatus: status } : {}),
      ...(marks ? { marks: parseInt(marks, 10) } : {}),
      ...(search ? {
        OR: [
          { questionText: { contains: search } },
          { modelAnswer: { contains: search } },
        ]
      } : {}),
    };

    const [total, questions] = await Promise.all([
      prisma.examPrepQuestion.count({ where }),
      prisma.examPrepQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ marks: 'asc' }, { updatedAt: 'desc' }],
        include: {
          subject: { select: { id: true, title: true, shortCode: true } },
          semester: { select: { id: true, semesterNumber: true, title: true } },
          university: { select: { id: true, name: true, code: true } },
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      questions,
    });
  } catch (err) {
    console.error('[GET /api/ceoadmin/exam-prep/questions] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch questions.' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json();
    const {
      universityId,
      courseId,
      semesterId,
      subjectId,
      questionText,
      questionTextGu,
      marks = 10,
      marksCategory = '10_MARKS',
      expectedAnswerLength,
      suggestedTimeMinutes = 15,
      difficulty = 'MEDIUM',
      importanceLevel = 'HIGH',
      modelAnswer,
      modelAnswerGu,
      answerStructure,
      legalProvisions,
      caseLawReferences,
      keyRevisionPoints,
      sourceReferences,
      publicationStatus = 'PUBLISHED',
      verificationStatus = 'VERIFIED',
    } = body;

    if (!universityId || !courseId || !semesterId || !subjectId || !questionText || !modelAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required question fields (University, Course, Semester, Subject, Question, Model Answer).' },
        { status: 400 }
      );
    }

    const question = await prisma.examPrepQuestion.create({
      data: {
        universityId,
        courseId,
        semesterId,
        subjectId,
        questionText: sanitizeInput(questionText, { stripHtml: false }),
        questionTextGu: questionTextGu ? sanitizeInput(questionTextGu, { stripHtml: false }) : null,
        marks: parseInt(marks, 10) || 10,
        marksCategory,
        expectedAnswerLength: expectedAnswerLength || null,
        suggestedTimeMinutes: parseInt(suggestedTimeMinutes, 10) || 15,
        difficulty,
        importanceLevel,
        modelAnswer: sanitizeInput(modelAnswer, { stripHtml: false }),
        modelAnswerGu: modelAnswerGu ? sanitizeInput(modelAnswerGu, { stripHtml: false }) : null,
        answerStructure: typeof answerStructure === 'string' ? answerStructure : JSON.stringify(answerStructure || []),
        legalProvisions: typeof legalProvisions === 'string' ? legalProvisions : JSON.stringify(legalProvisions || []),
        caseLawReferences: typeof caseLawReferences === 'string' ? caseLawReferences : JSON.stringify(caseLawReferences || []),
        keyRevisionPoints: typeof keyRevisionPoints === 'string' ? keyRevisionPoints : JSON.stringify(keyRevisionPoints || []),
        sourceReferences: sourceReferences || 'LowStudy Editorial Board',
        publicationStatus,
        verificationStatus,
        reviewedById: auth.user?.id || null,
        reviewedAt: new Date(),
      }
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id || null,
        action: 'QUESTION_CREATED',
        entityType: 'EXAM_PREP_QUESTION',
        entityId: question.id,
        details: `Created question: ${question.questionText.slice(0, 50)}... (${question.marks} marks)`,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Question created successfully.',
      question,
    });
  } catch (err) {
    console.error('[POST /api/ceoadmin/exam-prep/questions] Error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to create question.' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json();
    const { id, ...dataToUpdate } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
    }

    const payload = {};
    if (dataToUpdate.questionText) payload.questionText = sanitizeInput(dataToUpdate.questionText, { stripHtml: false });
    if (dataToUpdate.questionTextGu !== undefined) payload.questionTextGu = dataToUpdate.questionTextGu ? sanitizeInput(dataToUpdate.questionTextGu, { stripHtml: false }) : null;
    if (dataToUpdate.modelAnswer) payload.modelAnswer = sanitizeInput(dataToUpdate.modelAnswer, { stripHtml: false });
    if (dataToUpdate.modelAnswerGu !== undefined) payload.modelAnswerGu = dataToUpdate.modelAnswerGu ? sanitizeInput(dataToUpdate.modelAnswerGu, { stripHtml: false }) : null;
    if (dataToUpdate.marks !== undefined) payload.marks = parseInt(dataToUpdate.marks, 10);
    if (dataToUpdate.marksCategory) payload.marksCategory = dataToUpdate.marksCategory;
    if (dataToUpdate.difficulty) payload.difficulty = dataToUpdate.difficulty;
    if (dataToUpdate.importanceLevel) payload.importanceLevel = dataToUpdate.importanceLevel;
    if (dataToUpdate.publicationStatus) payload.publicationStatus = dataToUpdate.publicationStatus;
    if (dataToUpdate.verificationStatus) payload.verificationStatus = dataToUpdate.verificationStatus;
    if (dataToUpdate.answerStructure !== undefined) {
      payload.answerStructure = typeof dataToUpdate.answerStructure === 'string' ? dataToUpdate.answerStructure : JSON.stringify(dataToUpdate.answerStructure);
    }
    if (dataToUpdate.legalProvisions !== undefined) {
      payload.legalProvisions = typeof dataToUpdate.legalProvisions === 'string' ? dataToUpdate.legalProvisions : JSON.stringify(dataToUpdate.legalProvisions);
    }
    if (dataToUpdate.caseLawReferences !== undefined) {
      payload.caseLawReferences = typeof dataToUpdate.caseLawReferences === 'string' ? dataToUpdate.caseLawReferences : JSON.stringify(dataToUpdate.caseLawReferences);
    }
    if (dataToUpdate.keyRevisionPoints !== undefined) {
      payload.keyRevisionPoints = typeof dataToUpdate.keyRevisionPoints === 'string' ? dataToUpdate.keyRevisionPoints : JSON.stringify(dataToUpdate.keyRevisionPoints);
    }

    payload.reviewedById = auth.user?.id || null;
    payload.reviewedAt = new Date();

    const updated = await prisma.examPrepQuestion.update({
      where: { id },
      data: payload,
    });

    return NextResponse.json({
      success: true,
      message: 'Question updated successfully.',
      question: updated,
    });
  } catch (err) {
    console.error('[PUT /api/ceoadmin/exam-prep/questions] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to update question.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Question ID required' }, { status: 400 });
    }

    await prisma.examPrepQuestion.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Question deleted successfully.',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to delete question.' }, { status: 500 });
  }
}
