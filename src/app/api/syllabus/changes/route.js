import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public Endpoint: GET /api/syllabus/changes
 * Returns detected & approved syllabus changes.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('university') || searchParams.get('uni');
    const versionId = searchParams.get('versionId');

    const where = {};
    if (versionId) {
      where.syllabusVersionId = versionId;
    } else if (universityId) {
      where.syllabusVersion = { universityId: universityId.toLowerCase() };
    }

    const changes = await prisma.syllabusChange.findMany({
      where,
      include: {
        syllabusVersion: {
          select: {
            id: true,
            version: true,
            academicYear: true,
            semesterNumber: true,
            university: { select: { name: true, code: true } }
          }
        },
        reviewedBy: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      totalChanges: changes.length,
      changes
    });
  } catch (error) {
    console.error('Error in /api/syllabus/changes:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch syllabus changes' },
      { status: 500 }
    );
  }
}
