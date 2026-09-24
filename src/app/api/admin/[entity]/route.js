import { NextResponse } from 'next/server';
import * as adminService from '@/lib/services/adminService';
import { getModerationQueue, createAiContentRecord } from '@/lib/services/moderationService';
import prisma from '@/lib/prisma';
import { verifyAuth, sanitizeObject } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { entity } = params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const search = searchParams.get('search') || searchParams.get('q') || '';

    switch (entity) {
      case 'stats': {
        const stats = await adminService.getAdminStats();
        return NextResponse.json({ success: true, ...stats });
      }

      case 'settings': {
        const settings = adminService.getPlatformSettings();
        return NextResponse.json({ success: true, settings });
      }

      case 'analytics': {
        const stats = await adminService.getAdminStats();
        // Aggregated difficulty distribution
        const [easyCount, medCount, hardCount] = await Promise.all([
          prisma.question.count({ where: { difficulty: 'EASY' } }),
          prisma.question.count({ where: { difficulty: 'MEDIUM' } }),
          prisma.question.count({ where: { difficulty: 'HARD' } }),
        ]);

        const recentAttempts = await prisma.testAttempt.findMany({
          take: 10,
          orderBy: { completedAt: 'desc' },
          include: {
            user: { select: { fullName: true, email: true } },
            mockTest: { select: { title: true } },
          },
        });

        return NextResponse.json({
          success: true,
          analytics: {
            stats: stats.counts,
            difficultyBreakdown: { easy: easyCount, medium: medCount, hard: hardCount },
            recentAttempts,
          },
        });
      }

      case 'universities': {
        const status = searchParams.get('status') || '';
        const res = await adminService.getUniversities({ search, status, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'courses': {
        const universityId = searchParams.get('universityId') || '';
        const res = await adminService.getCourses({ universityId, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'semesters': {
        const courseId = searchParams.get('courseId') || '';
        const res = await adminService.getSemesters({ courseId, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'subjects': {
        const universityId = searchParams.get('universityId') || '';
        const courseId = searchParams.get('courseId') || '';
        const semesterId = searchParams.get('semesterId') || '';
        const category = searchParams.get('category') || '';
        const syllabusVersion = searchParams.get('syllabusVersion') || '';
        const res = await adminService.getSubjects({
          universityId,
          courseId,
          semesterId,
          category,
          syllabusVersion,
          search,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      case 'units': {
        const subjectId = searchParams.get('subjectId') || '';
        const res = await adminService.getUnits({ subjectId, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'topics': {
        const unitId = searchParams.get('unitId') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getTopics({ unitId, status, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'notes': {
        const topicId = searchParams.get('topicId') || '';
        const language = searchParams.get('language') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getNotes({ topicId, language, status, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'legal-sections': {
        const actName = searchParams.get('actName') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getLegalSections({ actName, status, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'case-laws': {
        const court = searchParams.get('court') || '';
        const importance = searchParams.get('importance') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getCaseLaws({ court, importance, status, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'questions': {
        const topicId = searchParams.get('topicId') || '';
        const difficulty = searchParams.get('difficulty') || '';
        const priority = searchParams.get('priority') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getQuestions({
          topicId,
          difficulty,
          priority,
          status,
          search,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      case 'mcqs': {
        const topicId = searchParams.get('topicId') || '';
        const subjectId = searchParams.get('subjectId') || '';
        const difficulty = searchParams.get('difficulty') || '';
        const priority = searchParams.get('priority') || '';
        const status = searchParams.get('status') || '';
        const res = await adminService.getMcqs({
          topicId,
          subjectId,
          difficulty,
          priority,
          status,
          search,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      case 'previous-papers': {
        const universityId = searchParams.get('universityId') || '';
        const courseId = searchParams.get('courseId') || '';
        const semesterId = searchParams.get('semesterId') || '';
        const subjectId = searchParams.get('subjectId') || '';
        const examYear = searchParams.get('examYear') || '';
        const res = await adminService.getPreviousPapers({
          universityId,
          courseId,
          semesterId,
          subjectId,
          examYear,
          search,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      case 'mock-tests': {
        const subjectId = searchParams.get('subjectId') || '';
        const universityId = searchParams.get('universityId') || '';
        const isPublished = searchParams.get('isPublished');
        const res = await adminService.getMockTests({
          subjectId,
          universityId,
          isPublished,
          search,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      case 'students': {
        const universityId = searchParams.get('universityId') || '';
        const isActive = searchParams.get('isActive');
        const res = await adminService.getStudents({ universityId, isActive, search, page, limit });
        return NextResponse.json({ success: true, ...res });
      }

      case 'ai-content':
      case 'content-review': {
        const stage = searchParams.get('stage') || undefined;
        const status = searchParams.get('status') || undefined;
        const entityType = searchParams.get('entityType') || undefined;
        const language = searchParams.get('language') || undefined;
        const res = await getModerationQueue({
          workflowStage: stage,
          verificationStatus: status,
          entityType,
          language,
          page,
          limit,
        });
        return NextResponse.json({ success: true, ...res });
      }

      default:
        return NextResponse.json({ success: false, error: `Entity '${entity}' not recognized.` }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error in GET /api/admin/${params?.entity}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // 1. Rate Limiting Protection (60 requests / minute)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`admin-${clientIp}`, 60, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Admin API rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // 2. Server-Side Role Verification Guard
    const auth = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER']);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized access to Admin API' },
        { status: auth.status || 401 }
      );
    }

    const { entity } = params;
    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeObject(rawBody);

    switch (entity) {
      case 'settings': {
        const updated = adminService.savePlatformSettings(body);
        return NextResponse.json({ success: true, settings: updated });
      }

      case 'universities': {
        const item = await adminService.createUniversity(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'courses': {
        const item = await adminService.createCourse(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'semesters': {
        const item = await adminService.createSemester(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'subjects': {
        const item = await adminService.createSubject(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'units': {
        const item = await adminService.createUnit(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'topics': {
        const item = await adminService.createTopic(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'notes': {
        const item = await adminService.createNote(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'legal-sections': {
        const item = await adminService.createLegalSection(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'case-laws': {
        const item = await adminService.createCaseLaw(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'questions': {
        const item = await adminService.createQuestion(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'mcqs': {
        const item = await adminService.createMcq(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'previous-papers': {
        const item = await adminService.createPreviousPaper(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'mock-tests': {
        const item = await adminService.createMockTest(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      case 'ai-content': {
        const item = await createAiContentRecord(body);
        return NextResponse.json({ success: true, item }, { status: 201 });
      }

      default:
        return NextResponse.json({ success: false, error: `Creation for '${entity}' not supported.` }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error in POST /api/admin/${params?.entity}:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create record' },
      { status: 400 }
    );
  }
}
