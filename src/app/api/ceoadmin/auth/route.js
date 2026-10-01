import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { createSessionToken, getSessionFromRequest } from '@/lib/security';
import { verifyAdminCredentials, getAdminConfig } from '@/lib/adminAuth';

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

    let admin = null;
    try {
      admin = await prisma.user.findUnique({
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
    } catch (dbErr) {
      console.warn('[GET /api/ceoadmin/auth] Non-fatal DB read warning:', dbErr?.message || dbErr);
    }

    // Fallback if admin is stored in-memory / master session
    if (!admin && (sessionPayload.userId === 'usr-ceoadmin-master' || sessionPayload.role === 'ADMIN')) {
      const config = getAdminConfig();
      admin = {
        id: sessionPayload.userId || 'usr-ceoadmin-master',
        fullName: config.username || 'CEO Admin',
        email: sessionPayload.email || config.email || 'ceoadmin@lowstudy.com',
        role: 'ADMIN',
        avatar: null,
        lastLoginAt: new Date(),
      };
    }

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

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both Admin ID and Password.' },
        { status: 400 }
      );
    }

    // Handle Admin Login Verification
    const { valid, adminUser, error } = await verifyAdminCredentials(adminId, password);

    if (!valid || !adminUser) {
      // Record failed admin login attempt in audit log if possible
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
      } catch {}

      return NextResponse.json(
        { success: false, error: error || 'Invalid Admin ID or password.' },
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

    // Issue Tamper-Proof HMAC-SHA256 Signed Admin Session Token (7 days validity)
    const sessionToken = createSessionToken({
      userId: adminUser.id,
      email: adminUser.email || 'ceoadmin@lowstudy.com',
      role: 'ADMIN',
      isAdmin: true,
    });

    const safeAdmin = {
      id: adminUser.id,
      fullName: adminUser.fullName || 'CEO Admin',
      email: adminUser.email || 'ceoadmin@lowstudy.com',
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
      { success: false, error: 'Admin authentication is temporarily unavailable. Please contact the developer.' },
      { status: 500 }
    );
  }
}

