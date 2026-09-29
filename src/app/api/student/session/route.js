import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { 
  createSessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  hashPassword,
  sanitizeInput,
  getSafeRedirectUrl
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
 * Helper to record login events defensively.
 */
async function recordLoginAudit({ userId = null, email, provider, success, ipAddress, userAgent, failureReason = null }) {
  try {
    await prisma.loginEvent.create({
      data: {
        userId,
        email: email ? email.toLowerCase() : 'unknown',
        provider: provider || 'credentials',
        success,
        ipAddress: ipAddress ? ipAddress.slice(0, 100) : null,
        userAgent: userAgent ? userAgent.slice(0, 300) : null,
        failureReason: failureReason ? failureReason.slice(0, 200) : null,
      },
    });
  } catch (err) {
    console.warn('[LoginEvent] Non-fatal login audit error:', err?.message);
  }
}

/**
 * Safe student creation helper that gracefully handles foreign key defaults.
 */
async function createNewStudent({ email, fullName, avatar, firebaseUid, provider = 'google', passwordHash = null }) {
  const now = new Date();
  const baseData = {
    email,
    fullName,
    avatar,
    firebaseUid,
    provider,
    role: 'STUDENT',
    xp: 100,
    streakDays: 1,
    coins: 50,
    isActive: true,
    lastLoginAt: now,
    lastActiveAt: now,
    ...(passwordHash ? { passwordHash } : {}),
  };

  const selectFields = {
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
    lastLoginAt: true,
    lastActiveAt: true,
  };

  // Attempt 1: Try with default Gujarat law academic path
  try {
    return await prisma.user.create({
      data: {
        ...baseData,
        universityId: 'su',
        collegeId: 'col-la-shah',
        courseId: 'su-llb-3yr',
        semesterId: 'su-llb-3yr-sem3',
      },
      select: selectFields,
    });
  } catch (fkError) {
    // If foreign key constraint failed (e.g. unseeded database), create standalone student
    console.warn('[Session Route] Creating student without academic FKs due to:', fkError?.code || fkError?.message);
    return await prisma.user.create({
      data: baseData,
      select: selectFields,
    });
  }
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
        lastLoginAt: true,
        lastActiveAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User account disabled or not found' },
        { status: 401 }
      );
    }

    // Touch lastActiveAt asynchronously
    prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Error in GET /api/student/session:', error?.message || error);
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
    const userAgent = request.headers.get('user-agent') || '';

    // Rate Limiting Protection (30 attempts per minute)
    const rateLimit = checkRateLimit(`login-${clientIp}`, 30, 60000);
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
    const { action = 'login', userId, email, password, fullName, firebaseUid, photoURL, redirectUrl } = body;

    // Normalize email cleanly (lowercase + trim whitespace)
    const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const safeRedirect = getSafeRedirectUrl(redirectUrl, '/dashboard');

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
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // =========================================================================
    // ACTION: SIGNUP / REGISTER
    // =========================================================================
    if (action === 'signup' || action === 'register') {
      if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      if (!password || typeof password !== 'string' || password.length < 4) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 4 characters long.' },
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
        // If user exists, update password hash and log in
        const { hash, salt } = hashPassword(password);
        targetUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: `${salt}:${hash}`,
            fullName: existingUser.fullName || cleanFullName,
            lastLoginAt: new Date(),
            lastActiveAt: new Date(),
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
            lastLoginAt: true,
            lastActiveAt: true,
          },
        });
      } else {
        // Create new student account
        const { hash, salt } = hashPassword(password);
        targetUser = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanFullName,
          provider: 'credentials',
          passwordHash: `${salt}:${hash}`,
        });
      }

      // Record Login Event Audit
      await recordLoginAudit({
        userId: targetUser.id,
        email: targetUser.email,
        provider: 'credentials',
        success: true,
        ipAddress: clientIp,
        userAgent,
      });

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
        redirectUrl: safeRedirect,
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
    }

    // =========================================================================
    // ACTION: GOOGLE SIGN-IN / ACCOUNT LINKING
    // =========================================================================
    if (action === 'google') {
      const cleanUid = typeof firebaseUid === 'string' && firebaseUid.trim() ? firebaseUid.trim() : null;
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

      // Check if user exists by email first, or by firebaseUid
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
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
          lastLoginAt: true,
          lastActiveAt: true,
        }
      });

      if (!user && cleanUid) {
        user = await prisma.user.findUnique({
          where: { firebaseUid: cleanUid },
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
            lastLoginAt: true,
            lastActiveAt: true,
          }
        });
      }

      const now = new Date();

      if (user) {
        // User exists: verify active status
        if (!user.isActive) {
          await recordLoginAudit({
            userId: user.id,
            email: normalizedEmail,
            provider: 'google',
            success: false,
            failureReason: 'ACCOUNT_DEACTIVATED',
            ipAddress: clientIp,
            userAgent,
          });

          return NextResponse.json(
            { success: false, error: 'This account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }

        // Account Linking: Link Google firebaseUid, avatar, and update activity
        const updateData = {
          lastLoginAt: now,
          lastActiveAt: now,
        };
        if (!user.firebaseUid || user.firebaseUid !== cleanUid) {
          const conflictingUser = await prisma.user.findUnique({ where: { firebaseUid: cleanUid } });
          if (!conflictingUser || conflictingUser.id === user.id) {
            updateData.firebaseUid = cleanUid;
          }
        }
        if (!user.avatar && cleanPhoto) {
          updateData.avatar = cleanPhoto;
        }
        if (!user.fullName && cleanName) {
          updateData.fullName = cleanName;
        }

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
            lastLoginAt: true,
            lastActiveAt: true,
          }
        });
      } else {
        // Create new user for first-time Google sign-in
        user = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanName || normalizedEmail.split('@')[0],
          avatar: cleanPhoto,
          firebaseUid: cleanUid,
          provider: 'google',
        });
      }

      // Record successful Google Login Event
      await recordLoginAudit({
        userId: user.id,
        email: user.email,
        provider: 'google',
        success: true,
        ipAddress: clientIp,
        userAgent,
      });

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
        redirectUrl: safeRedirect,
      });

      // Set Secure HttpOnly Session Cookie (7 days, SameSite=Lax)
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
    }

    // =========================================================================
    // ACTION: EMAIL/PASSWORD LOGIN (With Seamless Auto-Account Setup for New Students)
    // =========================================================================
    const cleanUserId = typeof userId === 'string' && userId.trim() 
      ? sanitizeInput(userId.trim(), { maxLength: 100 }) 
      : null;

    if (!cleanUserId && !normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your password.' },
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

    const now = new Date();

    // If user does not exist yet: Seamlessly create account and log in
    if (!user) {
      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      const cleanFullName = typeof fullName === 'string' && fullName.trim()
        ? sanitizeInput(fullName.trim(), { maxLength: 100 })
        : normalizedEmail.split('@')[0];

      const { hash, salt } = hashPassword(password);
      user = await createNewStudent({
        email: normalizedEmail,
        fullName: cleanFullName,
        provider: 'credentials',
        passwordHash: `${salt}:${hash}`,
      });
    } else {
      // User exists: check active status
      if (!user.isActive) {
        await recordLoginAudit({
          userId: user.id,
          email: normalizedEmail || user.email,
          provider: 'credentials',
          success: false,
          failureReason: 'ACCOUNT_DEACTIVATED',
          ipAddress: clientIp,
          userAgent,
        });

        return NextResponse.json(
          { success: false, error: 'This account has been deactivated. Please contact support.' },
          { status: 403 }
        );
      }

      // Password verification
      if (user.passwordHash) {
        const [salt, hash] = user.passwordHash.split(':');
        if (!salt || !hash || !verifyPassword(password, hash, salt)) {
          await recordLoginAudit({
            userId: user.id,
            email: normalizedEmail || user.email,
            provider: 'credentials',
            success: false,
            failureReason: 'INVALID_PASSWORD',
            ipAddress: clientIp,
            userAgent,
          });

          return NextResponse.json({ 
            success: false, 
            error: 'Incorrect password. Please check your password or continue with Google.' 
          }, { status: 401 });
        }

        // Update activity timestamps and full name if provided
        const updateData = {
          lastLoginAt: now,
          lastActiveAt: now,
        };
        if (fullName && typeof fullName === 'string' && fullName.trim() && !user.fullName) {
          updateData.fullName = sanitizeInput(fullName.trim(), { maxLength: 100 });
        }

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
            streakDays: true,
            xp: true,
            coins: true,
            universityId: true,
            courseId: true,
            semesterId: true,
            isActive: true,
            lastLoginAt: true,
            lastActiveAt: true,
          },
        });
      } else {
        // User exists without password hash: save password hash
        const { hash, salt } = hashPassword(password);
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            passwordHash: `${salt}:${hash}`,
            lastLoginAt: now,
            lastActiveAt: now,
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
            lastLoginAt: true,
            lastActiveAt: true,
          },
        });
      }
    }

    // Record Successful Login Event
    await recordLoginAudit({
      userId: user.id,
      email: user.email,
      provider: 'credentials',
      success: true,
      ipAddress: clientIp,
      userAgent,
    });

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
      message: 'Authenticated successfully. Session established.',
      user: safeUser,
      token: sessionToken,
      redirectUrl: safeRedirect,
    });

    // Set Secure HttpOnly Session Cookie (7 days, SameSite=Lax)
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
  } catch (error) {
    console.error('[POST /api/student/session] Error:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json(
      { success: false, error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}


