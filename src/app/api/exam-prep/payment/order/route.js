import { NextResponse } from 'next/server';
import { getSessionFromRequest, createSessionToken, sanitizeInput } from '@/lib/security.js';
import { createExamPrepOrder, validateAcademicOrderInput } from '@/lib/services/examPrepService.js';
import { isValidIndianPhoneNumber, normalizePhoneNumber } from '@/lib/phoneUtils.js';
import prisma from '@/lib/prisma.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {}

    const { universityId, collegeId, courseId, semesterId, phoneNumber, fullName } = body;

    // 1. Validate student name
    const cleanName = sanitizeInput(fullName || '').trim();
    if (!cleanName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Full Name is required to register for Exam Prep Pass.',
        },
        { status: 400 }
      );
    }

    // 2. Validate 10-digit Indian mobile number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone || !isValidIndianPhoneNumber(normalizedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'A valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9) is required.',
        },
        { status: 400 }
      );
    }

    // 3. Strict Academic Data Validation
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

    // 4. Resolve or create student account
    const { user: sessionUser } = getSessionFromRequest(request);
    let targetUser = null;

    if (sessionUser?.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: sessionUser.userId },
      });
    }

    if (!targetUser) {
      // Find existing student by mobile number
      targetUser = await prisma.user.findFirst({
        where: { phoneNumber: normalizedPhone },
      });
    }

    if (targetUser) {
      // Update existing student profile with academic selection and contact
      targetUser = await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          fullName: cleanName || targetUser.fullName,
          phoneNumber: normalizedPhone,
          ...(universityId ? { universityId } : {}),
          ...(collegeId ? { collegeId } : {}),
          ...(courseId ? { courseId } : {}),
          ...(semesterId ? { semesterId } : {}),
          profileCompleted: true,
          lastActiveAt: new Date(),
        },
      });
    } else {
      // Create new student account for registration
      const placeholderEmail = `${normalizedPhone}@student.lowstudy.com`;
      targetUser = await prisma.user.create({
        data: {
          fullName: cleanName,
          phoneNumber: normalizedPhone,
          email: placeholderEmail,
          role: 'STUDENT',
          universityId: universityId || null,
          collegeId: collegeId || null,
          courseId: courseId || null,
          semesterId: semesterId || null,
          profileCompleted: true,
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      });
    }

    // 5. Create Server-Enforced Order (₹299 / 29900 paise)
    const orderResult = await createExamPrepOrder({
      userId: targetUser.id,
      userEmail: targetUser.email,
      userName: cleanName || targetUser.fullName,
      userPhone: normalizedPhone,
      notes: {
        ...(body.notes || {}),
        universityId: universityId || targetUser.universityId,
        collegeId: collegeId || targetUser.collegeId,
        courseId: courseId || targetUser.courseId,
        semesterId: semesterId || targetUser.semesterId,
        isPhoneVerified: false, // OTP removed: treated as user-provided
      },
    });

    // 6. Issue authenticated session token so student account is securely bound
    const token = createSessionToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      fullName: targetUser.fullName,
      phoneNumber: targetUser.phoneNumber,
    });

    const response = NextResponse.json({
      success: true,
      ...orderResult,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
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
