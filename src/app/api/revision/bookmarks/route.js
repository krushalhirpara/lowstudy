import { NextResponse } from 'next/server';
import { getBookmarksData } from '@/lib/services/revisionService';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-student-01';
    const category = searchParams.get('category') || 'ALL';
    const entityType = searchParams.get('entityType') || 'ALL';
    const search = searchParams.get('search') || '';

    const data = await getBookmarksData({ userId, category, entityType, search });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/revision/bookmarks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 'usr-student-01', entityType, entityId, notes } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { success: false, error: 'entityType and entityId are required.' },
        { status: 400 }
      );
    }

    // Toggle bookmark
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_entityType_entityId: {
          userId,
          entityType,
          entityId
        }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, isBookmarked: false });
    } else {
      const created = await prisma.bookmark.create({
        data: {
          userId,
          entityType,
          entityId,
          notes
        }
      });
      // Also register into RevisionItem
      await prisma.revisionItem.upsert({
        where: {
          userId_entityType_entityId: {
            userId,
            entityType,
            entityId
          }
        },
        update: {},
        create: {
          userId,
          entityType,
          entityId,
          revisionStatus: 'NEED_REVISION'
        }
      });
      return NextResponse.json({ success: true, isBookmarked: true, bookmark: created });
    }
  } catch (error) {
    console.error('Error in POST /api/revision/bookmarks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}
