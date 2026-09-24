import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const unitId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    // 1. Fetch Unit with parent hierarchy and topics
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        subject: {
          include: {
            university: true,
            course: true,
            semester: true,
            units: {
              orderBy: { unitNumber: 'asc' },
              select: { id: true, unitNumber: true, title: true }
            }
          }
        },
        topics: {
          orderBy: { topicNumber: 'asc' },
          include: {
            subTopics: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    });

    if (!unit) {
      return NextResponse.json({ error: `Unit not found: ${unitId}` }, { status: 404 });
    }

    // 2. Fetch Progress & Bookmarks for topics in this unit
    const topicIds = unit.topics.map(t => t.id);

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

    // 3. Previous and Next Unit navigation within the subject
    const allUnitsInSubj = unit.subject.units;
    const currentUnitIdx = allUnitsInSubj.findIndex(u => u.id === unit.id);
    const prevUnit = currentUnitIdx > 0 ? allUnitsInSubj[currentUnitIdx - 1] : null;
    const nextUnit = currentUnitIdx < allUnitsInSubj.length - 1 ? allUnitsInSubj[currentUnitIdx + 1] : null;

    // 4. Calculate unit stats
    const totalTopics = unit.topics.length;
    const completedTopics = unit.topics.filter(t => completedTopicIds.has(t.id)).length;
    const completionPercentage = totalTopics > 0 
      ? Math.round((completedTopics / totalTopics) * 100) 
      : 0;

    const enhancedTopics = unit.topics.map(t => ({
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

    // Fetch priority questions in this unit
    const unitQuestions = await prisma.question.findMany({
      where: {
        status: 'PUBLISHED',
        topicId: { in: topicIds }
      },
      orderBy: [
        { priority_score: 'desc' },
        { marks: 'desc' }
      ],
      take: 6,
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
          select: { id: true, title: true, topicNumber: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      unit: {
        id: unit.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        description: unit.description,
        totalTopics,
        completedTopics,
        completionPercentage,
        topics: enhancedTopics,
        priorityQuestions: unitQuestions,
        subject: {
          id: unit.subject.id,
          code: unit.subject.shortCode,
          title: unit.subject.title,
          category: unit.subject.category,
          credits: unit.subject.credits,
          marks: 100
        },
        breadcrumbs: {
          university: unit.subject.university,
          course: unit.subject.course,
          semester: unit.subject.semester,
          subject: {
            id: unit.subject.id,
            code: unit.subject.shortCode,
            title: unit.subject.title
          }
        },
        navigation: {
          prevUnit,
          nextUnit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching unit detail:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
