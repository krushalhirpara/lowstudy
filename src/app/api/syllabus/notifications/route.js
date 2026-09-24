import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public Endpoint: GET /api/syllabus/notifications
 * Returns syllabus update notifications for students.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('university') || searchParams.get('uni');
    const semesterNumber = searchParams.get('semester') ? parseInt(searchParams.get('semester'), 10) : undefined;

    const where = {};
    if (universityId) where.universityId = universityId.toLowerCase();
    if (semesterNumber) where.semesterNumber = semesterNumber;

    const notifications = await prisma.syllabusNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      total: notifications.length,
      notifications
    });
  } catch (error) {
    console.error('Error in /api/syllabus/notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabus notifications' },
      { status: 500 }
    );
  }
}
