import { NextResponse } from 'next/server';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES, GUJARAT_CITIES } from '@/data/gujaratData';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
    const city = (searchParams.get('city') || '').trim().toLowerCase();

    // 1. Try DB lookup first
    let universities = [];
    try {
      const dbUnis = await prisma.university.findMany({
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { name: { contains: search } },
                    { code: { contains: search } },
                    { city: { contains: search } },
                  ],
                }
              : {},
            city ? { city: { equals: city } } : {},
          ],
        },
        include: {
          colleges: {
            select: { id: true, name: true, city: true },
          },
          courses: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { established: 'asc' },
      });

      if (dbUnis && dbUnis.length > 0) {
        universities = dbUnis;
      }
    } catch (dbErr) {
      console.warn('[API /universities] Database lookup fallback to static data:', dbErr?.message);
    }

    // 2. Fallback to rich static dataset if DB is empty or during static generation
    if (universities.length === 0) {
      universities = GUJARAT_UNIVERSITIES.map((uni) => ({
        ...uni,
        colleges: GUJARAT_COLLEGES.filter((c) => c.universityId === uni.id),
      })).filter((uni) => {
        if (search) {
          const match =
            uni.name.toLowerCase().includes(search) ||
            uni.code.toLowerCase().includes(search) ||
            uni.city.toLowerCase().includes(search);
          if (!match) return false;
        }
        if (city && uni.city.toLowerCase() !== city) {
          return false;
        }
        return true;
      });
    }

    return NextResponse.json({
      success: true,
      count: universities.length,
      universities,
      cities: GUJARAT_CITIES,
    });
  } catch (error) {
    console.error('[API /universities] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve universities.',
      },
      { status: 500 }
    );
  }
}
