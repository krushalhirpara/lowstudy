import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest, sanitizeInput } from '@/lib/security';
import { normalizeCityName } from '@/data/gujaratData';
import { verifyAndEnsureUniversity, isUniversityValidForCity } from '@/lib/universityHelper';

export const dynamic = 'force-dynamic';

const PROFILE_SELECT_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  provider: true,
  city: true,
  universityId: true,
  courseId: true,
  semesterId: true,
  streakDays: true,
  xp: true,
  coins: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
  university: {
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      logo: true,
    },
  },
};

/**
 * GET /api/student/profile
 * Retrieves the profile of the currently logged in student.
 */
export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    if (!sessionPayload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionPayload.userId },
      select: PROFILE_SELECT_FIELDS,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User profile not found.' },
        { status: 404 }
      );
    }

    const isProfileComplete = Boolean(user.city && (user.universityId || user.university));

    return NextResponse.json({
      success: true,
      isProfileComplete,
      user,
    });
  } catch (err) {
    console.error('[GET /api/student/profile] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve student profile.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/student/profile
 * Updates the student's personal profile (Full Name, City, University).
 * Protected against tampering with sensitive authentication attributes.
 */
export async function PATCH(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    if (!sessionPayload?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { fullName, city, universityId } = body;

    const dataToUpdate = {};

    if (typeof fullName === 'string' && fullName.trim()) {
      dataToUpdate.fullName = sanitizeInput(fullName.trim(), { maxLength: 100 });
    }

    if (typeof city === 'string' && city.trim()) {
      const normalized = normalizeCityName(city);
      if (normalized) {
        dataToUpdate.city = normalized;
      }
    }

    if (typeof universityId === 'string' && universityId.trim()) {
      const verifiedUniId = await verifyAndEnsureUniversity(universityId);
      if (!verifiedUniId) {
        return NextResponse.json(
          { success: false, error: 'Please select a valid college / university.' },
          { status: 400 }
        );
      }
      dataToUpdate.universityId = verifiedUniId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid profile updates provided.' },
        { status: 400 }
      );
    }

    // Validate consistency if city or university is being changed
    if (dataToUpdate.city !== undefined || dataToUpdate.universityId !== undefined) {
      const currentUser = await prisma.user.findUnique({
        where: { id: sessionPayload.userId },
        select: { city: true, universityId: true },
      });

      const finalCity = dataToUpdate.city !== undefined ? dataToUpdate.city : currentUser?.city;
      const finalUniId = dataToUpdate.universityId !== undefined ? dataToUpdate.universityId : currentUser?.universityId;

      if (finalCity && finalUniId) {
        const isValid = await isUniversityValidForCity(finalUniId, finalCity);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Please select a university that matches your selected city.' },
            { status: 400 }
          );
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: sessionPayload.userId },
      data: dataToUpdate,
      select: PROFILE_SELECT_FIELDS,
    });

    const isProfileComplete = Boolean(updatedUser.city && (updatedUser.universityId || updatedUser.university));

    return NextResponse.json({
      success: true,
      message: 'Student profile updated successfully.',
      isProfileComplete,
      user: updatedUser,
    });
  } catch (err) {
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Please select a valid college / university.' },
        { status: 400 }
      );
    }
    console.error('[PATCH /api/student/profile] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to update student profile.' },
      { status: 500 }
    );
  }
}

