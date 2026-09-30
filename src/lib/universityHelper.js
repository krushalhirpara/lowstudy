import prisma from './prisma.js';
import { 
  GUJARAT_UNIVERSITIES, 
  GUJARAT_COLLEGES,
  normalizeCityName, 
  getUniversityMappedCities as getStaticMappedCities,
  getUniversitiesForCity as getStaticUniversitiesForCity,
  isUniversityValidForCity as isStaticUniversityValidForCity,
  isCityWithMappedUniversities as isStaticCityWithMappedUniversities
} from '../data/gujaratData.js';

export { 
  getStaticMappedCities as getUniversityMappedCities,
  getStaticUniversitiesForCity as getUniversitiesForCity,
  isStaticCityWithMappedUniversities as isCityWithMappedUniversities
};

/**
 * Verifies university existence in DB and auto-ensures from authoritative registry if needed.
 * Returns valid university ID or null if unrecognized.
 * 
 * @param {string} universityId 
 * @returns {Promise<string|null>}
 */
export async function verifyAndEnsureUniversity(universityId) {
  if (!universityId || typeof universityId !== 'string') return null;
  const cleanId = universityId.trim().toLowerCase();
  if (!cleanId) return null;

  try {
    // 1. Check existing university in DB
    const existing = await prisma.university.findUnique({
      where: { id: cleanId },
      select: { id: true, name: true, status: true },
    });

    if (existing) {
      return existing.id;
    }

    // Also check by unique uppercase code (e.g. "GU", "SU")
    const existingByCode = await prisma.university.findUnique({
      where: { code: cleanId.toUpperCase() },
      select: { id: true },
    });

    if (existingByCode) {
      return existingByCode.id;
    }

    // 2. Lookup in authoritative GUJARAT_UNIVERSITIES registry
    const matchInRegistry = GUJARAT_UNIVERSITIES.find(
      (u) => u.id.toLowerCase() === cleanId || u.code.toLowerCase() === cleanId
    );

    if (matchInRegistry) {
      // Auto-upsert so foreign key constraint is guaranteed to succeed in any database
      const created = await prisma.university.upsert({
        where: { id: matchInRegistry.id },
        update: {},
        create: {
          id: matchInRegistry.id,
          name: matchInRegistry.name,
          code: matchInRegistry.code,
          city: matchInRegistry.city,
          district: matchInRegistry.district || null,
          type: matchInRegistry.type || 'State Public University',
          established: matchInRegistry.established || null,
          logo: matchInRegistry.logo || null,
          officialWebsite: matchInRegistry.officialWebsite || null,
          officialSyllabusSource: matchInRegistry.officialSyllabusSource || null,
          status: matchInRegistry.status || 'VERIFIED',
          academicYear: matchInRegistry.academicYear || '2026-27',
        },
        select: { id: true },
      });
      return created.id;
    }
  } catch (err) {
    console.warn('[UniversityHelper] University verification notice:', err?.message);
  }

  return null;
}

/**
 * Validates whether a university is valid for the specified city.
 * Checks DB if available, falling back to authoritative static dataset.
 * 
 * @param {string} universityId
 * @param {string} [city]
 * @returns {Promise<boolean>}
 */
export async function isUniversityValidForCity(universityId, city) {
  if (!universityId || typeof universityId !== 'string' || !universityId.trim()) {
    return false;
  }

  const cleanUniId = universityId.trim().toLowerCase();

  // If no city specified, check if university is valid
  if (!city || typeof city !== 'string' || !city.trim()) {
    const validUni = await verifyAndEnsureUniversity(cleanUniId);
    return Boolean(validUni);
  }

  const normCity = normalizeCityName(city);
  if (!normCity) return true;

  try {
    // 1. Check DB for matching university or affiliated colleges in that city
    const dbUni = await prisma.university.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: cleanUniId },
              { code: cleanUniId.toUpperCase() }
            ]
          },
          {
            OR: [
              { city: { equals: normCity } },
              { district: { equals: normCity } },
              { colleges: { some: { city: { equals: normCity } } } },
              { colleges: { some: { district: { equals: normCity } } } }
            ]
          }
        ]
      },
      select: { id: true }
    });

    if (dbUni) {
      return true;
    }
  } catch (err) {
    // Fall back to static dataset verification
  }

  // 2. Authoritative static fallback
  return isStaticUniversityValidForCity(cleanUniId, normCity);
}

