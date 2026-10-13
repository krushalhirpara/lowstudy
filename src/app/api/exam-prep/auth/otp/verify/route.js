import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma.js';
import { verifyMobileOtp } from '@/lib/services/otpService.js';
import { getSessionFromRequest, createSessionToken, sanitizeInput } from '@/lib/security.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phoneNumber, otp, fullName, universityId, collegeId, courseId, semesterId } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and verification code are required.' },
        { status: 400 }
      );
    }

    // 1. Verify OTP with cryptographically safe matching
    const verifyResult = await verifyMobileOtp(phoneNumber, otp);
    const normalizedPhone = verifyResult.normalizedPhone;
    const cleanName = sanitizeInput(fullName || '').trim();

    // 2. Check if request already has an authenticated session
    const { user: sessionUser } = getSessionFromRequest(request);
    let targetUser = null;

    if (sessionUser?.userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: sessionUser.userId },
      });
    }

    // If not authenticated via session, check if a user already exists with this verified phone number
    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { phoneNumber: normalizedPhone },
      });
    }

    // 3. Create or update user with verified mobile identity & academic profile
    if (targetUser) {
      targetUser = await prisma.user.update({
        where: { id: targetUser.id },
        data: {
          phoneNumber: normalizedPhone,
          ...(cleanName ? { fullName: cleanName } : {}),
          ...(universityId ? { universityId } : {}),
          ...(collegeId ? { collegeId } : {}),
          ...(courseId ? { courseId } : {}),
          ...(semesterId ? { semesterId } : {}),
          profileCompleted: true,
          lastActiveAt: new Date(),
        },
      });
    } else {
      // Create new student record with verified mobile
      const placeholderEmail = `${normalizedPhone}@student.lowstudy.com`;
      targetUser = await prisma.user.create({
        data: {
          phoneNumber: normalizedPhone,
          email: placeholderEmail,
          fullName: cleanName || 'Law Student',
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

    // 4. Issue authenticated session token
    const token = createSessionToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      fullName: targetUser.fullName,
      phoneNumber: targetUser.phoneNumber,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully.',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        phoneNumber: targetUser.phoneNumber,
        universityId: targetUser.universityId,
        courseId: targetUser.courseId,
        semesterId: targetUser.semesterId,
      },
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: 'lowstudy_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.warn('[API /api/exam-prep/auth/otp/verify] Error:', err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Verification failed.' },
      { status: 400 }
    );
  }
}
