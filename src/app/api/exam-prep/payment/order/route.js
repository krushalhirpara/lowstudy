import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { createExamPrepOrder, validateAcademicOrderInput } from '@/lib/services/examPrepService.js';
import prisma from '@/lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user: sessionUser, error: authError } = getSessionFromRequest(request);

    if (!sessionUser || !sessionUser.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please sign in to continue to checkout.',
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // Load fresh user data from DB
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
      select: { id: true, email: true, fullName: true, phoneNumber: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    let body = {};
    try {
      body = await request.json();
    } catch {}

    const { universityId, collegeId, courseId, semesterId, phoneNumber, fullName } = body;

    // Strict Academic Data Validation
    const validationResult = await validateAcademicOrderInput({
      universityId,
      collegeId,
      courseId,
      semesterId,
    });

    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: validationResult.error },
        { status: validationResult.status || 400 }
      );
    }

    // Persist selected academic profile and phone against student record
    if (universityId || collegeId || courseId || semesterId || phoneNumber || fullName) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          ...(universityId ? { universityId } : {}),
          ...(collegeId ? { collegeId } : {}),
          ...(courseId ? { courseId } : {}),
          ...(semesterId ? { semesterId } : {}),
          ...(phoneNumber ? { phoneNumber } : {}),
          ...(fullName ? { fullName } : {}),
          lastActiveAt: new Date(),
        },
      });
    }

    const orderResult = await createExamPrepOrder({
      userId: dbUser.id,
      userEmail: dbUser.email,
      userName: fullName || dbUser.fullName,
      userPhone: phoneNumber || dbUser.phoneNumber,
      notes: {
        ...(body.notes || {}),
        universityId: universityId || dbUser.universityId,
        collegeId: collegeId || dbUser.collegeId,
        courseId: courseId || dbUser.courseId,
        semesterId: semesterId || dbUser.semesterId,
      },
    });

    return NextResponse.json({
      success: true,
      ...orderResult,
    });
  } catch (err) {
    console.error('[API /api/exam-prep/payment/order] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to create payment order.',
      },
      { status: 500 }
    );
  }
}
