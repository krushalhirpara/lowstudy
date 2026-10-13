import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { getSessionFromRequest } from '@/lib/security.js';

export const dynamic = 'force-dynamic';

const ENTITY_TYPE = 'EXAM_PREP_QUESTION';

export async function GET(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);
    if (!sessionUser?.userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        bookmarks: [],
        revisions: {},
      });
    }

    const userId = sessionUser.userId;

    const [bookmarks, revisionItems] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId, entityType: ENTITY_TYPE },
        select: { entityId: true },
      }),
      prisma.revisionItem.findMany({
        where: { userId, entityType: ENTITY_TYPE },
        select: { entityId: true, revisionStatus: true },
      }),
    ]);

    const revisionsMap = {};
    for (const r of revisionItems) {
      revisionsMap[r.entityId] = r.revisionStatus;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      bookmarks: bookmarks.map(b => b.entityId),
      revisions: revisionsMap,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/study-state] GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve study state.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user: sessionUser } = getSessionFromRequest(request);
    if (!sessionUser?.userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to save bookmarks and revision progress.' },
        { status: 401 }
      );
    }

    const userId = sessionUser.userId;
    const body = await request.json().catch(() => ({}));
    const { action, questionId, status } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required.' },
        { status: 400 }
      );
    }

    if (action === 'toggle_bookmark') {
      const existing = await prisma.bookmark.findFirst({
        where: { userId, entityType: ENTITY_TYPE, entityId: questionId },
      });

      if (existing) {
        await prisma.bookmark.delete({
          where: { id: existing.id },
        });
        return NextResponse.json({
          success: true,
          action: 'removed',
          isBookmarked: false,
          questionId,
        });
      } else {
        await prisma.bookmark.create({
          data: {
            userId,
            entityType: ENTITY_TYPE,
            entityId: questionId,
          },
        });
        return NextResponse.json({
          success: true,
          action: 'added',
          isBookmarked: true,
          questionId,
        });
      }
    }

    if (action === 'set_revision') {
      const targetStatus = status === 'MASTERED' ? 'MASTERED' : status === 'NEED_REVISION' ? 'NEED_REVISION' : 'NONE';

      if (targetStatus === 'NONE') {
        await prisma.revisionItem.deleteMany({
          where: { userId, entityType: ENTITY_TYPE, entityId: questionId },
        });
        return NextResponse.json({
          success: true,
          revisionStatus: null,
          questionId,
        });
      }

      const item = await prisma.revisionItem.upsert({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType: ENTITY_TYPE,
            entityId: questionId,
          },
        },
        update: {
          revisionStatus: targetStatus,
          lastReviewedAt: new Date(),
        },
        create: {
          userId,
          entityType: ENTITY_TYPE,
          entityId: questionId,
          revisionStatus: targetStatus,
          lastReviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        revisionStatus: item.revisionStatus,
        questionId,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[API /api/exam-prep/study-state] POST error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update study state.' },
      { status: 500 }
    );
  }
}
