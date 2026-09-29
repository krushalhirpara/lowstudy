import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { createSessionToken, getSessionFromRequest } from '@/lib/security';
import { verifyAdminCredentials } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ceoadmin/auth - Check if current session is authenticated as ADMIN
 */
export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);

    if (!sessionPayload?.userId || sessionPayload.role?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({
        authenticated: false,
        user: null,
      }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: sessionPayload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        lastLoginAt: true,
      },
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({
        authenticated: false,
        user: null,
      }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: admin,
    });
  } catch (err) {
    return NextResponse.json({
      authenticated: false,
      error: 'Session check failed',
    }, { status: 500 });
  }
}

/**
 * POST /api/ceoadmin/auth - Login / Logout for CEO Admin
 */
export async function POST(request) {
  try {
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'admin-ip';
    const userAgent = request.headers.get('user-agent') || '';

    // Rate Limit Admin Login (10 attempts per minute per IP to prevent brute-force)
    const rateLimit = checkRateLimit(`admin-login-${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please wait 60 seconds.',
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action = 'login', adminId, password } = body;

    // Handle Admin Logout
    if (action === 'logout') {
      const response = NextResponse.json({
        success: true,
        message: 'Admin logged out successfully.',
      });

      response.cookies.set({
        name: 'lowstudy_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // Handle Admin Login
    const { valid, adminUser, error } = await verifyAdminCredentials(adminId, password);

    if (!valid || !adminUser) {
      // Record failed admin login attempt
      try {
        await prisma.loginEvent.create({
          data: {
            email: adminId ? String(adminId).slice(0, 100) : 'unknown',
            provider: 'admin',
            success: false,
            failureReason: 'INVALID_CREDENTIALS',
            ipAddress: clientIp,
            userAgent: userAgent.slice(0, 300),
          },
        });
      } catch (logErr) {
        console.warn('[Admin Login Audit] Failed to record login audit:', logErr?.message);
      }

      // Return generic 401 without leaking existence of username
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid Admin ID or password.' },
        { status: 401 }
      );
    }

    // Record successful admin login
    const now = new Date();
    try {
      await prisma.loginEvent.create({
        data: {
          userId: adminUser.id,
          email: adminUser.email || 'ceoadmin@lowstudy.com',
          provider: 'admin',
          success: true,
          ipAddress: clientIp,
          userAgent: userAgent.slice(0, 300),
        },
      });

      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          lastLoginAt: now,
          lastActiveAt: now,
        },
      }).catch(() => {});
    } catch {}

    // Issue Tamper-Proof HMAC-SHA256 Signed Admin Session Token
    const sessionToken = createSessionToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: 'ADMIN',
      isAdmin: true,
    });

    const safeAdmin = {
      id: adminUser.id,
      fullName: adminUser.fullName || 'CEO Admin',
      email: adminUser.email,
      role: 'ADMIN',
    };

    const response = NextResponse.json({
      success: true,
      message: 'CEO Admin authenticated successfully.',
      user: safeAdmin,
      token: sessionToken,
      redirectUrl: '/ceoadmin/dashboard',
    });

    // Set Secure HttpOnly Session Cookie (7 days)
    response.cookies.set({
      name: 'lowstudy_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('[POST /api/ceoadmin/auth] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication service error.' },
      { status: 500 }
    );
  }
}
