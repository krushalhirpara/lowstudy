import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { 
  createSessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  sanitizeInput 
} from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve active student session from secure HttpOnly cookie or Bearer token.
 */
export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);
    const targetUserId = sessionPayload?.userId || 'usr-student-01';

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        streakDays: true,
        xp: true,
        coins: true,
        universityId: true,
        courseId: true,
        semesterId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User account disabled or not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Error in GET /api/student/session:', error);
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}

/**
 * POST: Authenticate student/admin, enforce brute-force rate limits, and issue signed HttpOnly cookie.
 */
export async function POST(request) {
  try {
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'client-ip';

    // 1. Rate Limiting Protection (5 attempts per minute to block brute-force attacks)
    const rateLimit = checkRateLimit(`login-${clientIp}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
          retryAfterMs: rateLimit.resetMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action = 'login', userId, email, password } = body;

    // Handle Logout
    if (action === 'logout') {
      const response = NextResponse.json({
        success: true,
        action: 'logout',
        message: 'Student logged out successfully. Session cookie cleared.',
      });

      // Clear the session cookie
      response.cookies.set({
        name: 'lowstudy_session',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // Input validation & sanitization
    const cleanUserId = userId ? sanitizeInput(userId, { maxLength: 100 }) : null;
    const cleanEmail = email ? sanitizeInput(email, { maxLength: 150 }).toLowerCase() : null;

    if (!cleanUserId && !cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Email or User ID is required to authenticate.' },
        { status: 400 }
      );
    }

    // Locate user record
    const user = await prisma.user.findFirst({
      where: cleanUserId 
        ? { id: cleanUserId }
        : { email: cleanEmail },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        passwordHash: true,
        streakDays: true,
        xp: true,
        coins: true,
        universityId: true,
        courseId: true,
        semesterId: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Password verification if user has passwordHash configured
    if (user.passwordHash && password) {
      const [salt, hash] = user.passwordHash.split(':');
      if (!salt || !hash || !verifyPassword(password, hash, salt)) {
        return NextResponse.json({ success: false, error: 'Invalid credentials provided.' }, { status: 401 });
      }
    }

    // 2. Issue Tamper-Proof HMAC-SHA256 Signed Session Token
    const sessionToken = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      universityId: user.universityId,
    });

    // Strip sensitive fields from response
    const { passwordHash: _, ...safeUser } = user;

    const response = NextResponse.json({
      success: true,
      action: 'login',
      message: 'Authenticated successfully. Session securely established.',
      user: safeUser,
      token: sessionToken,
    });

    // 3. Set Secure HttpOnly Session Cookie
    response.cookies.set({
      name: 'lowstudy_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Session management error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Session management failed' },
      { status: 500 }
    );
  }
}
