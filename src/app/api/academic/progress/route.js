import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';

    const studyProgress = await prisma.studyProgress.findMany({
      where: { userId, isCompleted: true },
      select: { topicId: true, isCompleted: true, lastStudiedAt: true }
    });

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, entityType: 'TOPIC' },
      select: { entityId: true, createdAt: true }
    });

    return NextResponse.json({
      success: true,
      completedTopicIds: studyProgress.map(sp => sp.topicId),
      bookmarkedTopicIds: bookmarks.map(b => b.entityId)
    });
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { topicId, isCompleted, action = 'toggleCompletion', userId = 'usr-student-01' } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    // Handle Bookmark Toggle
    if (action === 'toggleBookmark') {
      const existingBookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          entityType: 'TOPIC',
          entityId: topicId
        }
      });

      if (existingBookmark) {
        await prisma.bookmark.delete({
          where: { id: existingBookmark.id }
        });
        return NextResponse.json({
          success: true,
          topicId,
          isBookmarked: false,
          message: 'Bookmark removed'
        });
      } else {
        const newBookmark = await prisma.bookmark.create({
          data: {
            userId,
            entityType: 'TOPIC',
            entityId: topicId
          }
        });
        return NextResponse.json({
          success: true,
          topicId,
          isBookmarked: true,
          bookmarkId: newBookmark.id,
          message: 'Topic bookmarked'
        });
      }
    }

    // Handle Progress / Completion Toggle
    const targetCompleted = typeof isCompleted === 'boolean' ? isCompleted : true;

    const progress = await prisma.studyProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId
        }
      },
      update: {
        isCompleted: targetCompleted,
        lastStudiedAt: new Date()
      },
      create: {
        userId,
        topicId,
        isCompleted: targetCompleted,
        lastStudiedAt: new Date()
      }
    });

    // Optionally update StudentSubjectProgress for the parent subject
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        unit: {
          include: {
            subject: {
              include: {
                units: {
                  include: {
                    topics: true
                  }
                }
              }
            }
          }
        }
      }
    });

    let subjectProgress = null;
    if (topic?.unit?.subject) {
      const subject = topic.unit.subject;
      const allSubjTopicIds = subject.units.flatMap(u => u.topics.map(t => t.id));
      const totalTopicsCount = allSubjTopicIds.length;

      const completedCount = await prisma.studyProgress.count({
        where: {
          userId,
          topicId: { in: allSubjTopicIds },
          isCompleted: true
        }
      });

      const completionPercentage = totalTopicsCount > 0 
        ? parseFloat(((completedCount / totalTopicsCount) * 100).toFixed(1))
        : 0.0;

      subjectProgress = await prisma.studentSubjectProgress.upsert({
        where: {
          userId_subjectId: {
            userId,
            subjectId: subject.id
          }
        },
        update: {
          totalTopics: totalTopicsCount,
          completedTopics: completedCount,
          completionPercentage
        },
        create: {
          userId,
          subjectId: subject.id,
          totalTopics: totalTopicsCount,
          completedTopics: completedCount,
          completionPercentage
        }
      });
    }

    return NextResponse.json({
      success: true,
      topicId,
      isCompleted: progress.isCompleted,
      subjectProgress: subjectProgress ? {
        subjectId: subjectProgress.subjectId,
        completionPercentage: subjectProgress.completionPercentage,
        completedTopics: subjectProgress.completedTopics,
        totalTopics: subjectProgress.totalTopics
      } : null
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
