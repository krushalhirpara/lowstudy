import { NextResponse } from 'next/server';
import { 
  GUJARAT_UNIVERSITIES, 
  GUJARAT_COLLEGES, 
  GUJARAT_CITIES, 
  getUniversityMappedCities,
  getUniversitiesForCity,
  normalizeCityName 
} from '@/data/gujaratData';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || searchParams.get('q') || '').trim().toLowerCase();
    const cityRaw = (searchParams.get('city') || '').trim();
    const city = normalizeCityName(cityRaw) || (cityRaw ? cityRaw.toLowerCase() : '');

    // 1. Try DB lookup first
    let universities = [];
    try {
      const cityCondition = city
        ? {
            OR: [
              { city: { equals: city } },
              { district: { equals: city } },
              { colleges: { some: { city: { equals: city } } } },
              { colleges: { some: { district: { equals: city } } } },
            ],
          }
        : {};

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
            cityCondition,
          ],
        },
        include: {
          colleges: {
            select: { id: true, name: true, city: true, district: true },
          },
          courses: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { established: 'asc' },
      });

      if (dbUnis && dbUnis.length > 0) {
        universities = dbUnis.map((uni) => {
          const mappedSet = new Set();
          if (uni.city) mappedSet.add(normalizeCityName(uni.city) || uni.city);
          if (uni.district) mappedSet.add(normalizeCityName(uni.district) || uni.district);
          uni.colleges?.forEach((col) => {
            if (col.city) mappedSet.add(normalizeCityName(col.city) || col.city);
            if (col.district) mappedSet.add(normalizeCityName(col.district) || col.district);
          });
          // Also merge static mappings if available
          const staticMapped = getUniversityMappedCities(uni.id);
          staticMapped.forEach((c) => mappedSet.add(c));

          return {
            ...uni,
            mappedCities: Array.from(mappedSet),
          };
        });
      }
    } catch (dbErr) {
      console.warn('[API /universities] Database lookup fallback to static data:', dbErr?.message);
    }

    // 2. Fallback to authoritative static dataset
    if (universities.length === 0 && (!city || getUniversitiesForCity(city).length > 0 || !search)) {
      const baseList = city ? getUniversitiesForCity(city) : GUJARAT_UNIVERSITIES;

      universities = baseList
        .map((uni) => ({
          ...uni,
          mappedCities: uni.mappedCities || getUniversityMappedCities(uni.id),
          colleges: GUJARAT_COLLEGES.filter((c) => c.universityId === uni.id),
        }))
        .filter((uni) => {
          if (search) {
            const match =
              uni.name.toLowerCase().includes(search) ||
              uni.code.toLowerCase().includes(search) ||
              (uni.city && uni.city.toLowerCase().includes(search)) ||
              uni.mappedCities.some((c) => c.toLowerCase().includes(search));
            if (!match) return false;
          }
          return true;
        });
    }

    return NextResponse.json({
      success: true,
      count: universities.length,
      selectedCity: cityRaw || null,
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

