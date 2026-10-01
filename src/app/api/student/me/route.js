import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/security';

export const dynamic = 'force-dynamic';

const USER_SAFE_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  provider: true,
  city: true,
  phoneNumber: true,
  profileCompleted: true,
  activityNotificationOptIn: true,
  universityId: true,
  courseId: true,
  semesterId: true,
  streakDays: true,
  xp: true,
  coins: true,
  isActive: true,
  createdAt: true,
  lastLoginAt: true,
  lastActiveAt: true,
  university: {
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      logo: true,
    },
  },
  course: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
  semester: {
    select: {
      id: true,
      title: true,
      semesterNumber: true,
    },
  },
};

/**
 * GET /api/student/me
 * Secure, authoritative current-user endpoint.
 * Reads the HttpOnly session cookie, verifies the session, and queries the database.
 * Returns safe profile fields for the authenticated student.
 */
export async function GET(request) {
  try {
    const { user: sessionPayload, error: sessionError } = getSessionFromRequest(request);

    // If no valid session token exists or session expired
    if (!sessionPayload?.userId) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionPayload.userId },
      select: USER_SAFE_FIELDS,
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: 'User account disabled or not found',
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // Asynchronously update last active timestamp
    prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    const isProfileComplete = Boolean(
      user.profileCompleted || (user.city && (user.universityId || user.university) && user.phoneNumber)
    );

    return NextResponse.json(
      {
        authenticated: true,
        isProfileComplete,
        user,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/student/me:', error?.message || error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Failed to verify authenticated session',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
