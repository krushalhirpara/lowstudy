import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/adminService';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { entity, id } = params;

    let item = null;
    switch (entity) {
      case 'universities':
        item = await prisma.university.findUnique({ where: { id } });
        break;
      case 'courses':
        item = await prisma.course.findUnique({ where: { id }, include: { university: true } });
        break;
      case 'semesters':
        item = await prisma.semester.findUnique({ where: { id }, include: { course: true } });
        break;
      case 'subjects':
        item = await prisma.subject.findUnique({
          where: { id },
          include: { university: true, course: true, semester: true },
        });
        break;
      case 'units':
        item = await prisma.unit.findUnique({ where: { id }, include: { subject: true } });
        break;
      case 'topics':
        item = await prisma.topic.findUnique({ where: { id }, include: { unit: true } });
        break;
      case 'notes':
        item = await prisma.note.findUnique({ where: { id }, include: { topic: true } });
        break;
      case 'legal-sections':
        item = await prisma.legalSection.findUnique({ where: { id }, include: { topic: true } });
        break;
      case 'case-laws':
        item = await prisma.caseLaw.findUnique({ where: { id }, include: { topic: true } });
        break;
      case 'questions':
        item = await prisma.question.findUnique({
          where: { id },
          include: { answers: true, topic: true },
        });
        break;
      case 'mcqs':
        item = await prisma.mcq.findUnique({
          where: { id },
          include: { options: true, topic: true, subject: true },
        });
        break;
      case 'previous-papers':
        item = await prisma.previousPaper.findUnique({
          where: { id },
          include: { university: true, subject: true },
        });
        break;
      case 'mock-tests':
        item = await prisma.mockTest.findUnique({
          where: { id },
          include: { subject: true, questions: { include: { mcq: true } } },
        });
        break;
      case 'students':
        item = await prisma.user.findUnique({
          where: { id },
          include: { university: true, course: true },
        });
        break;
      default:
        return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    if (!item) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error(`Error in GET /api/admin/${params?.entity}/${params?.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { entity, id } = params;
    const body = await request.json().catch(() => ({}));

    let updated = null;
    switch (entity) {
      case 'universities':
        updated = await adminService.updateUniversity(id, body);
        break;
      case 'courses':
        updated = await adminService.updateCourse(id, body);
        break;
      case 'semesters':
        updated = await adminService.updateSemester(id, body);
        break;
      case 'subjects':
        updated = await adminService.updateSubject(id, body);
        break;
      case 'units':
        updated = await adminService.updateUnit(id, body);
        break;
      case 'topics':
        updated = await adminService.updateTopic(id, body);
        break;
      case 'notes':
        updated = await adminService.updateNote(id, body);
        break;
      case 'legal-sections':
        updated = await adminService.updateLegalSection(id, body);
        break;
      case 'case-laws':
        updated = await adminService.updateCaseLaw(id, body);
        break;
      case 'questions':
        updated = await adminService.updateQuestion(id, body);
        break;
      case 'mcqs':
        updated = await adminService.updateMcq(id, body);
        break;
      case 'previous-papers':
        updated = await adminService.updatePreviousPaper(id, body);
        break;
      case 'mock-tests':
        updated = await adminService.updateMockTest(id, body);
        break;
      case 'students':
        updated = await adminService.updateStudent(id, body);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Update not supported for this entity' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error(`Error in PUT /api/admin/${params?.entity}/${params?.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { entity, id } = params;

    if (entity === 'universities') {
      const updated = await adminService.toggleUniversityPublish(id);
      return NextResponse.json({ success: true, item: updated });
    }

    const body = await request.json().catch(() => ({}));
    return await PUT(request, { params });
  } catch (error) {
    console.error(`Error in PATCH /api/admin/${params?.entity}/${params?.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { entity, id } = params;

    switch (entity) {
      case 'universities':
        await adminService.deleteUniversity(id);
        break;
      case 'courses':
        await adminService.deleteCourse(id);
        break;
      case 'semesters':
        await adminService.deleteSemester(id);
        break;
      case 'subjects':
        await adminService.deleteSubject(id);
        break;
      case 'units':
        await adminService.deleteUnit(id);
        break;
      case 'topics':
        await adminService.deleteTopic(id);
        break;
      case 'notes':
        await adminService.deleteNote(id);
        break;
      case 'legal-sections':
        await adminService.deleteLegalSection(id);
        break;
      case 'case-laws':
        await adminService.deleteCaseLaw(id);
        break;
      case 'questions':
        await adminService.deleteQuestion(id);
        break;
      case 'mcqs':
        await adminService.deleteMcq(id);
        break;
      case 'previous-papers':
        await adminService.deletePreviousPaper(id);
        break;
      case 'mock-tests':
        await adminService.deleteMockTest(id);
        break;
      case 'students':
        await adminService.deleteStudent(id);
        break;
      default:
        return NextResponse.json({ success: false, error: 'Delete not supported for this entity' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `${entity} ${id} deleted successfully.` });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/${params?.entity}/${params?.id}:`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
