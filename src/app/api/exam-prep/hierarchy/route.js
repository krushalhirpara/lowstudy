import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId');
    const courseId = searchParams.get('courseId');
    const semesterId = searchParams.get('semesterId');

    // 1. If no university selected, return all active universities with their courses count
    if (!universityId) {
      const universities = await prisma.university.findMany({
        where: { status: 'VERIFIED' },
        orderBy: { established: 'asc' },
        select: {
          id: true,
          name: true,
          code: true,
          city: true,
          state: true,
          logo: true,
          academicYear: true,
          _count: {
            select: {
              courses: true,
              subjects: true,
              examPrepQuestions: true,
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        universities: universities.map(u => ({
          ...u,
          examPrepCount: u._count.examPrepQuestions,
        }))
      });
    }

    // 2. Fetch specific university with courses, semesters, and subjects
    const university = await prisma.university.findUnique({
      where: { id: universityId },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
        colleges: {
          where: { status: 'VERIFIED' },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            city: true,
          }
        },
        courses: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            code: true,
            totalSemesters: true,
            semesters: {
              orderBy: { semesterNumber: 'asc' },
              select: {
                id: true,
                semesterNumber: true,
                title: true,
                subjects: {
                  where: { isActive: true },
                  orderBy: { shortCode: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    shortCode: true,
                    category: true,
                    syllabusVersion: true,
                    credits: true,
                    _count: {
                      select: {
                        examPrepQuestions: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!university) {
      return NextResponse.json(
        { success: false, error: 'University not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      university,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/hierarchy] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to load academic hierarchy.' },
      { status: 500 }
    );
  }
}
