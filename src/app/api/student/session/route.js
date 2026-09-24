import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { 
  createSessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  hashPassword,
  sanitizeInput 
} from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * GET: Retrieve active student session from secure HttpOnly cookie or Bearer token.
 */
export async function GET(request) {
  try {
    const { user: sessionPayload } = getSessionFromRequest(request);

    // If no valid session cookie/token exists, report not authenticated
    if (!sessionPayload?.userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionPayload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        provider: true,
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
      { success: false, authenticated: false, error: 'Session verification failed' },
      { status: 500 }
    );
  }
}

/**
 * POST: Authenticate student/admin via Credentials or Google Sign-In,
 * link existing accounts if email matches, and issue signed HttpOnly cookie.
 */
export async function POST(request) {
  try {
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'client-ip';

    // 1. Rate Limiting Protection (10 attempts per minute to block brute-force attacks)
    const rateLimit = checkRateLimit(`login-${clientIp}`, 10, 60000);
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
    const { action = 'login', userId, email, password, firebaseUid, fullName, photoURL } = body;

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

    // =========================================================================
    // GOOGLE SIGN-IN / ACCOUNT LINKING
    // =========================================================================
    if (action === 'google') {
      const cleanEmail = email ? sanitizeInput(email, { maxLength: 150 }).toLowerCase() : null;
      const cleanUid = firebaseUid ? sanitizeInput(firebaseUid, { maxLength: 128 }) : null;
      const cleanName = fullName ? sanitizeInput(fullName, { maxLength: 100 }) : null;
      const cleanPhoto = photoURL && typeof photoURL === 'string' && photoURL.startsWith('http') 
        ? sanitizeInput(photoURL, { maxLength: 500 }) 
        : null;

      if (!cleanEmail || !cleanUid) {
        return NextResponse.json(
          { success: false, error: 'Valid Google email and Firebase UID are required.' },
          { status: 400 }
        );
      }

      // Check if user already exists by email OR by firebaseUid
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: cleanEmail },
            { firebaseUid: cleanUid }
          ]
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatar: true,
          provider: true,
          firebaseUid: true,
          passwordHash: true,
          streakDays: true,
          xp: true,
          coins: true,
          universityId: true,
          courseId: true,
          semesterId: true,
          isActive: true,
        }
      });

      if (user) {
        // User exists: verify active status
        if (!user.isActive) {
          return NextResponse.json(
            { success: false, error: 'This account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }

        // Account Linking: If user registered via email/password, link Google firebaseUid and avatar
        const updateData = {};
        if (!user.firebaseUid) {
          updateData.firebaseUid = cleanUid;
        }
        if (!user.avatar && cleanPhoto) {
          updateData.avatar = cleanPhoto;
        }
        if (!user.fullName && cleanName) {
          updateData.fullName = cleanName;
        }

        if (Object.keys(updateData).length > 0) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              avatar: true,
              provider: true,
              firebaseUid: true,
              streakDays: true,
              xp: true,
              coins: true,
              universityId: true,
              courseId: true,
              semesterId: true,
              isActive: true,
            }
          });
        }
      } else {
        // Create new user for first-time Google sign-in
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            fullName: cleanName || cleanEmail.split('@')[0],
            avatar: cleanPhoto,
            firebaseUid: cleanUid,
            provider: 'google',
            role: 'STUDENT',
            universityId: 'su',
            collegeId: 'col-la-shah',
            courseId: 'su-llb-3yr',
            semesterId: 'su-llb-3yr-sem3',
            xp: 100,
            streakDays: 1,
            coins: 50,
            isActive: true,
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            avatar: true,
            provider: true,
            firebaseUid: true,
            streakDays: true,
            xp: true,
            coins: true,
            universityId: true,
            courseId: true,
            semesterId: true,
            isActive: true,
          }
        });
      }

      // Issue Tamper-Proof HMAC-SHA256 Signed Session Token
      const sessionToken = createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
      });

      const { passwordHash: _, ...safeUser } = user;

      const response = NextResponse.json({
        success: true,
        action: 'google',
        message: 'Google Sign-In successful. Session established.',
        user: safeUser,
        token: sessionToken,
      });

      // Set Secure HttpOnly Session Cookie (7 days)
      response.cookies.set({
        name: 'lowstudy_session',
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // =========================================================================
    // STANDARD EMAIL/PASSWORD LOGIN
    // =========================================================================
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
        avatar: true,
        provider: true,
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
      return NextResponse.json({ 
        success: false, 
        error: 'No account found with this email. Please check your credentials or continue with Google.' 
      }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Password verification if user has passwordHash configured
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password is required.' }, { status: 400 });
      }
      const [salt, hash] = user.passwordHash.split(':');
      if (!salt || !hash || !verifyPassword(password, hash, salt)) {
        return NextResponse.json({ success: false, error: 'Invalid password. Please try again.' }, { status: 401 });
      }
    } else if (user.provider === 'google' && !user.passwordHash) {
      // User registered only via Google and has no password set yet
      return NextResponse.json({
        success: false,
        error: 'This account is linked with Google Sign-In. Please click "Continue with Google" to log in.',
        provider: 'google',
      }, { status: 400 });
    }

    // Issue Tamper-Proof HMAC-SHA256 Signed Session Token
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

    // Set Secure HttpOnly Session Cookie
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
