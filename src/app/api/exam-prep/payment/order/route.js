import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/security.js';
import { createExamPrepOrder } from '@/lib/services/examPrepService.js';
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

    const orderResult = await createExamPrepOrder({
      userId: dbUser.id,
      userEmail: dbUser.email,
      userName: dbUser.fullName,
      userPhone: dbUser.phoneNumber,
      notes: body.notes || {},
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
