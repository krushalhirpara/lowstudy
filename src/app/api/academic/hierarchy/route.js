import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityCode = (searchParams.get('university') || searchParams.get('uni') || 'SU').toUpperCase();
    const courseCode = searchParams.get('course') || 'LLB-3Y';
    const semesterNum = parseInt(searchParams.get('semester') || searchParams.get('sem') || '3', 10);
    const userId = searchParams.get('userId') || 'usr-student-01';

    // 1. Find University
    const university = await prisma.university.findFirst({
      where: {
        OR: [
          { code: universityCode },
          { id: universityCode.toLowerCase() }
        ]
      }
    });

    if (!university) {
      return NextResponse.json({ error: `University not found: ${universityCode}` }, { status: 404 });
    }

    // 2. Find Course
    const course = await prisma.course.findFirst({
      where: {
        universityId: university.id,
        OR: [
          { code: courseCode },
          { id: `${university.id}-${courseCode.toLowerCase()}` },
          { id: 'su-llb-3yr' }
        ]
      }
    });

    if (!course) {
      return NextResponse.json({ error: `Course not found: ${courseCode}` }, { status: 404 });
    }

    // 3. Find Semester
    const semester = await prisma.semester.findFirst({
      where: {
        courseId: course.id,
        semesterNumber: semesterNum
      }
    });

    if (!semester) {
      return NextResponse.json({ error: `Semester ${semesterNum} not found` }, { status: 404 });
    }

    // 4. Fetch Subjects with full hierarchy
    const subjects = await prisma.subject.findMany({
      where: { semesterId: semester.id },
      orderBy: { shortCode: 'asc' },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' },
          include: {
            topics: {
              orderBy: { topicNumber: 'asc' },
              include: {
                subTopics: {
                  orderBy: { orderIndex: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    // 5. Fetch Student StudyProgress & Bookmarks for this user
    const allTopicIds = subjects.flatMap(s => s.units.flatMap(u => u.topics.map(t => t.id)));
    
    const studyProgressRecords = await prisma.studyProgress.findMany({
      where: {
        userId,
        topicId: { in: allTopicIds }
      }
    });

    const completedTopicIds = new Set(
      studyProgressRecords.filter(sp => sp.isCompleted).map(sp => sp.topicId)
    );

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        entityType: 'TOPIC',
        entityId: { in: allTopicIds }
      }
    });

    const bookmarkedTopicIds = new Set(bookmarks.map(b => b.entityId));

    // 6. Calculate Progress & Enhance Structure
    let totalSemesterTopics = 0;
    let completedSemesterTopics = 0;

    const enhancedSubjects = subjects.map(s => {
      let subjTopicsCount = 0;
      let subjCompletedCount = 0;

      const enhancedUnits = s.units.map(u => {
        const unitTopicsCount = u.topics.length;
        const unitCompletedCount = u.topics.filter(t => completedTopicIds.has(t.id)).length;
        const unitCompletionPercentage = unitTopicsCount > 0 
          ? Math.round((unitCompletedCount / unitTopicsCount) * 100) 
          : 0;

        subjTopicsCount += unitTopicsCount;
        subjCompletedCount += unitCompletedCount;

        const enhancedTopics = u.topics.map(t => ({
          id: t.id,
          topicNumber: t.topicNumber,
          title: t.title,
          description: t.description,
          status: t.status,
          isCompleted: completedTopicIds.has(t.id),
          isBookmarked: bookmarkedTopicIds.has(t.id),
          subtopicsCount: t.subTopics.length,
          subtopics: t.subTopics.map(st => ({
            id: st.id,
            orderIndex: st.orderIndex,
            title: st.title,
            content: st.content
          }))
        }));

        return {
          id: u.id,
          unitNumber: u.unitNumber,
          title: u.title,
          description: u.description,
          topicsCount: unitTopicsCount,
          completedCount: unitCompletedCount,
          completionPercentage: unitCompletionPercentage,
          topics: enhancedTopics
        };
      });

      const subjCompletionPercentage = subjTopicsCount > 0 
        ? Math.round((subjCompletedCount / subjTopicsCount) * 100) 
        : 0;

      totalSemesterTopics += subjTopicsCount;
      completedSemesterTopics += subjCompletedCount;

      return {
        id: s.id,
        code: s.shortCode,
        title: s.title,
        category: s.category,
        credits: s.credits,
        marks: 100,
        description: s.description,
        unitsCount: s.units.length,
        topicsCount: subjTopicsCount,
        completedCount: subjCompletedCount,
        completionPercentage: subjCompletionPercentage,
        units: enhancedUnits
      };
    });

    const semesterCompletionPercentage = totalSemesterTopics > 0 
      ? Math.round((completedSemesterTopics / totalSemesterTopics) * 100) 
      : 0;

    // Available Semesters for course
    const allSemesters = await prisma.semester.findMany({
      where: { courseId: course.id },
      orderBy: { semesterNumber: 'asc' },
      select: { id: true, semesterNumber: true, title: true }
    });

    return NextResponse.json({
      success: true,
      hierarchy: {
        university: {
          id: university.id,
          name: university.name,
          code: university.code,
          city: university.city,
          state: university.state,
          academicYear: university.academicYear
        },
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          totalSemesters: course.totalSemesters
        },
        semester: {
          id: semester.id,
          semesterNumber: semester.semesterNumber,
          title: semester.title
        },
        allSemesters,
        progressSummary: {
          totalSubjects: enhancedSubjects.length,
          totalUnits: enhancedSubjects.reduce((acc, s) => acc + s.unitsCount, 0),
          totalTopics: totalSemesterTopics,
          completedTopics: completedSemesterTopics,
          completionPercentage: semesterCompletionPercentage,
          bookmarkedCount: bookmarkedTopicIds.size
        },
        subjects: enhancedSubjects
      }
    });
  } catch (error) {
    console.error('Error in academic hierarchy API:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
