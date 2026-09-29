import prisma from './prisma.js';
import { GUJARAT_UNIVERSITIES } from '../data/gujaratData.js';

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
