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
 * Standard email format validator
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 150;
}

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
 * POST: Authenticate student/admin via Credentials, Register new accounts, or Google Sign-In,
 * link existing accounts if email matches, and issue signed HttpOnly cookie.
 */
export async function POST(request) {
  try {
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'client-ip';

    // 1. Rate Limiting Protection (15 attempts per minute to block brute-force attacks)
    const rateLimit = checkRateLimit(`login-${clientIp}`, 15, 60000);
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
    const { action = 'login', userId, email, password, fullName, firebaseUid, photoURL } = body;

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

    // Normalize email cleanly (lowercase + trim whitespace)
    const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;

    // =========================================================================
    // ACTION: SIGNUP / REGISTER (Email + Password Account Creation)
    // =========================================================================
    if (action === 'signup' || action === 'register') {
      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const cleanFullName = typeof fullName === 'string' && fullName.trim()
        ? sanitizeInput(fullName.trim(), { maxLength: 100 })
        : normalizedEmail.split('@')[0];

      // Check if account already exists with this email
      let existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          avatar: true,
          provider: true,
          passwordHash: true,
          isActive: true,
          universityId: true,
        },
      });

      let targetUser = null;

      if (existingUser) {
        // If user exists and already has a password set, prompt them to sign in
        if (existingUser.passwordHash) {
          return NextResponse.json(
            {
              success: false,
              error: 'An account with this email already exists. Please sign in with your password or Google.',
              accountExists: true,
            },
            { status: 409 }
          );
        }

        // If user exists without password (e.g. seeded or Google user setting password), update their credentials
        const { hash, salt } = hashPassword(password);
        targetUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: `${salt}:${hash}`,
            fullName: existingUser.fullName || cleanFullName,
          },
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
      } else {
        // Create new student account
        const { hash, salt } = hashPassword(password);
        targetUser = await prisma.user.create({
          data: {
            email: normalizedEmail,
            fullName: cleanFullName,
            passwordHash: `${salt}:${hash}`,
            provider: 'credentials',
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
            streakDays: true,
            xp: true,
            coins: true,
            universityId: true,
            courseId: true,
            semesterId: true,
            isActive: true,
          },
        });
      }

      // Issue Tamper-Proof HMAC-SHA256 Signed Session Token
      const sessionToken = createSessionToken({
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        universityId: targetUser.universityId,
      });

      const response = NextResponse.json({
        success: true,
        action: 'signup',
        message: 'Account created successfully. Session established.',
        user: targetUser,
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
    // ACTION: GOOGLE SIGN-IN / ACCOUNT LINKING
    // =========================================================================
    if (action === 'google') {
      const cleanUid = typeof firebaseUid === 'string' ? firebaseUid.trim() : null;
      const cleanName = typeof fullName === 'string' && fullName.trim() 
        ? sanitizeInput(fullName.trim(), { maxLength: 100 }) 
        : null;
      const cleanPhoto = photoURL && typeof photoURL === 'string' && photoURL.startsWith('http') 
        ? photoURL.trim().slice(0, 500) 
        : null;

      if (!normalizedEmail || !cleanUid) {
        return NextResponse.json(
          { success: false, error: 'Valid Google email and Firebase UID are required.' },
          { status: 400 }
        );
      }

      // Check if user already exists by email OR by firebaseUid
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normalizedEmail },
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
            email: normalizedEmail,
            fullName: cleanName || normalizedEmail.split('@')[0],
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
    // ACTION: STANDARD EMAIL/PASSWORD LOGIN
    // =========================================================================
    const cleanUserId = typeof userId === 'string' && userId.trim() 
      ? sanitizeInput(userId.trim(), { maxLength: 100 }) 
      : null;

    if (!cleanUserId && !normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email or User ID is required to authenticate.' },
        { status: 400 }
      );
    }

    // Locate user record using findUnique
    let user = null;
    if (cleanUserId) {
      user = await prisma.user.findUnique({
        where: { id: cleanUserId },
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
    } else if (normalizedEmail) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
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
    }

    // Generic error message for non-existent user or wrong password to prevent user enumeration
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password. Please try again.' 
      }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Password verification
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password is required.' }, { status: 400 });
      }
      const [salt, hash] = user.passwordHash.split(':');
      if (!salt || !hash || !verifyPassword(password, hash, salt)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid email or password. Please try again.' 
        }, { status: 401 });
      }
    } else if (user.provider === 'google' && !user.passwordHash) {
      // User registered only via Google and has no password set yet
      return NextResponse.json({
        success: false,
        error: 'This account is linked with Google Sign-In. Please click "Continue with Google" to log in.',
        provider: 'google',
      }, { status: 400 });
    } else if (!user.passwordHash && password) {
      // Seeded or legacy user without password hash: set password on first valid login
      const { hash, salt } = hashPassword(password);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: `${salt}:${hash}` },
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
      { success: false, error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}
