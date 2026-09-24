import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const subjectId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    // 1. Fetch Subject with full relational tree
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        university: true,
        course: true,
        semester: true,
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

    if (!subject) {
      return NextResponse.json({ error: `Subject not found: ${subjectId}` }, { status: 404 });
    }

    // 2. Fetch Progress & Bookmarks for this subject's topics
    const topicIds = subject.units.flatMap(u => u.topics.map(t => t.id));

    const studyProgress = await prisma.studyProgress.findMany({
      where: {
        userId,
        topicId: { in: topicIds }
      }
    });
    const completedTopicIds = new Set(studyProgress.filter(sp => sp.isCompleted).map(sp => sp.topicId));

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        entityType: 'TOPIC',
        entityId: { in: topicIds }
      }
    });
    const bookmarkedTopicIds = new Set(bookmarks.map(b => b.entityId));

    // 3. Find Adjacent Subjects for Prev / Next navigation
    const allSubjectsInSem = await prisma.subject.findMany({
      where: { semesterId: subject.semesterId },
      orderBy: { shortCode: 'asc' },
      select: { id: true, shortCode: true, title: true }
    });

    const currentIndex = allSubjectsInSem.findIndex(s => s.id === subject.id);
    const prevSubject = currentIndex > 0 ? allSubjectsInSem[currentIndex - 1] : null;
    const nextSubject = currentIndex < allSubjectsInSem.length - 1 ? allSubjectsInSem[currentIndex + 1] : null;

    // 4. Enhance units with completion calculation
    let totalTopics = 0;
    let completedTopics = 0;

    const enhancedUnits = subject.units.map(u => {
      const uTopicsCount = u.topics.length;
      const uCompletedCount = u.topics.filter(t => completedTopicIds.has(t.id)).length;
      const uPercentage = uTopicsCount > 0 ? Math.round((uCompletedCount / uTopicsCount) * 100) : 0;

      totalTopics += uTopicsCount;
      completedTopics += uCompletedCount;

      return {
        id: u.id,
        unitNumber: u.unitNumber,
        title: u.title,
        description: u.description,
        topicsCount: uTopicsCount,
        completedCount: uCompletedCount,
        completionPercentage: uPercentage,
        topics: u.topics.map(t => ({
          id: t.id,
          topicNumber: t.topicNumber,
          title: t.title,
          description: t.description,
          status: t.status,
          isCompleted: completedTopicIds.has(t.id),
          isBookmarked: bookmarkedTopicIds.has(t.id),
          subtopicsCount: t.subTopics.length
        }))
      };
    });

    const completionPercentage = totalTopics > 0 
      ? Math.round((completedTopics / totalTopics) * 100) 
      : 0;

    // Fetch top evidence priority questions for this subject
    const priorityQuestions = await prisma.question.findMany({
      where: {
        status: 'PUBLISHED',
        topicId: { in: topicIds }
      },
      orderBy: [
        { priority_score: 'desc' },
        { marks: 'desc' }
      ],
      take: 8,
      select: {
        id: true,
        questionText: true,
        questionTextGu: true,
        marks: true,
        difficulty: true,
        priority_label: true,
        priority_score: true,
        why_important: true,
        previous_year_count: true,
        years_asked: true,
        topic: {
          select: {
            id: true,
            title: true,
            topicNumber: true,
            unit: { select: { unitNumber: true } }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      subject: {
        id: subject.id,
        code: subject.shortCode,
        title: subject.title,
        category: subject.category,
        credits: subject.credits,
        marks: 100,
        description: subject.description,
        color: subject.color,
        university: {
          id: subject.university.id,
          name: subject.university.name,
          code: subject.university.code
        },
        course: {
          id: subject.course.id,
          name: subject.course.name,
          code: subject.course.code
        },
        semester: {
          id: subject.semester.id,
          title: subject.semester.title,
          semesterNumber: subject.semester.semesterNumber
        },
        totalUnits: enhancedUnits.length,
        totalTopics,
        completedTopics,
        completionPercentage,
        units: enhancedUnits,
        priorityQuestions,
        navigation: {
          prev: prevSubject,
          next: nextSubject
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subject detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
