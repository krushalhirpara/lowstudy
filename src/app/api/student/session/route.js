import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { normalizeCityName } from '@/data/gujaratData';
import { verifyAndEnsureUniversity, isUniversityValidForCity } from '@/lib/universityHelper';
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
    // Verify userId actually exists in DB to prevent foreign key constraint violations
    let validUserId = null;
    if (userId) {
      try {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (userExists) validUserId = userId;
      } catch {
        validUserId = null;
      }
    }

    await prisma.loginEvent.create({
      data: {
        userId: validUserId,
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

const USER_SELECT_FIELDS = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  avatar: true,
  provider: true,
  firebaseUid: true,
  city: true,
  universityId: true,
  courseId: true,
  semesterId: true,
  streakDays: true,
  xp: true,
  coins: true,
  isActive: true,
  lastLoginAt: true,
  lastActiveAt: true,
  createdAt: true,
  university: {
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
    },
  },
};

/**
 * Safe student creation helper without hardcoded academic foreign keys.
 */
async function createNewStudent({ 
  email, 
  fullName, 
  avatar = null, 
  firebaseUid = null, 
  provider = 'credentials', 
  passwordHash = null, 
  city = null, 
  universityId = null 
}) {
  const now = new Date();
  const normalizedCity = city ? normalizeCityName(city) : null;
  
  // Verify and ensure university if supplied
  let validUniId = null;
  if (universityId) {
    validUniId = await verifyAndEnsureUniversity(universityId);
    if (validUniId && normalizedCity) {
      const isValid = await isUniversityValidForCity(validUniId, normalizedCity);
      if (!isValid) {
        throw new Error('Please select a university that matches your selected city.');
      }
    }
  }

  const baseData = {
    email,
    fullName,
    avatar,
    firebaseUid,
    provider,
    city: normalizedCity,
    universityId: validUniId,
    role: 'STUDENT',
    xp: 100,
    streakDays: 1,
    coins: 50,
    isActive: true,
    lastLoginAt: now,
    lastActiveAt: now,
    ...(passwordHash ? { passwordHash } : {}),
  };

  return await prisma.user.create({
    data: baseData,
    select: USER_SELECT_FIELDS,
  });
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
      select: USER_SELECT_FIELDS,
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

    const isProfileComplete = Boolean(user.city && (user.universityId || user.university));

    return NextResponse.json({
      success: true,
      authenticated: true,
      isProfileComplete,
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
    const { action = 'login', userId, email, password, fullName, firebaseUid, photoURL, redirectUrl, city, universityId } = body;

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
    // ACTION: UPDATE / COMPLETE PROFILE
    // =========================================================================
    if (action === 'update_profile' || action === 'complete_profile') {
      const { user: sessionPayload } = getSessionFromRequest(request);
      const targetUserId = sessionPayload?.userId || userId;

      if (!targetUserId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required to update profile.' },
          { status: 401 }
        );
      }

      const existingRecord = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { city: true, universityId: true },
      });

      const updateData = {};
      if (fullName && typeof fullName === 'string' && fullName.trim()) {
        updateData.fullName = sanitizeInput(fullName.trim(), { maxLength: 100 });
      }

      let newCity = existingRecord?.city || null;
      if (city && typeof city === 'string' && city.trim()) {
        const normCity = normalizeCityName(city);
        if (normCity) {
          updateData.city = normCity;
          newCity = normCity;
        }
      }

      let newUniId = existingRecord?.universityId || null;
      if (universityId && typeof universityId === 'string' && universityId.trim()) {
        const verifiedUniId = await verifyAndEnsureUniversity(universityId);
        if (!verifiedUniId) {
          return NextResponse.json(
            { success: false, error: 'Please select a valid university.' },
            { status: 400 }
          );
        }
        updateData.universityId = verifiedUniId;
        newUniId = verifiedUniId;
      }

      // Validate city-to-university consistency
      if (newCity && newUniId) {
        const isValid = await isUniversityValidForCity(newUniId, newCity);
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: 'Please select a university that matches your selected city.' },
            { status: 400 }
          );
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: updateData,
        select: USER_SELECT_FIELDS,
      });

      const isProfileComplete = Boolean(updatedUser.city && (updatedUser.universityId || updatedUser.university));

      return NextResponse.json({
        success: true,
        action: 'update_profile',
        message: 'Profile updated successfully.',
        isProfileComplete,
        user: updatedUser,
      });
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

      const normalizedCity = typeof city === 'string' && city.trim() ? normalizeCityName(city) : null;
      if (!normalizedCity || normalizedCity.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Please enter or select your City.' },
          { status: 400 }
        );
      }

      const cleanUniInput = typeof universityId === 'string' && universityId.trim() ? universityId.trim() : null;
      if (!cleanUniInput) {
        return NextResponse.json(
          { success: false, error: 'Please select your College / University.' },
          { status: 400 }
        );
      }

      // Server verification: University must exist and be valid
      const verifiedUniId = await verifyAndEnsureUniversity(cleanUniInput);
      if (!verifiedUniId) {
        return NextResponse.json(
          { success: false, error: 'Please select a valid university.' },
          { status: 400 }
        );
      }

      // Server verification: University must match the selected city mapping
      const isMatchedWithCity = await isUniversityValidForCity(verifiedUniId, normalizedCity);
      if (!isMatchedWithCity) {
        return NextResponse.json(
          { success: false, error: 'Please select a university that matches your selected city.' },
          { status: 400 }
        );
      }

      // Check if account already exists with this email
      const existingUser = await prisma.user.findUnique({
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
          city: true,
          universityId: true,
        },
      });

      let targetUser = null;

      if (existingUser) {
        if (existingUser.passwordHash) {
          return NextResponse.json(
            { success: false, error: 'An account with this email address already exists. Please sign in.' },
            { status: 400 }
          );
        }

        // If user existed via OAuth without password, set credentials and update profile
        const { hash, salt } = hashPassword(password);
        targetUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: `${salt}:${hash}`,
            fullName: existingUser.fullName || cleanFullName,
            city: normalizedCity || existingUser.city,
            universityId: verifiedUniId || existingUser.universityId,
            lastActiveAt: new Date(),
          },
          select: USER_SELECT_FIELDS,
        });
      } else {
        // Create new student account with validated city and university
        const { hash, salt } = hashPassword(password);
        targetUser = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanFullName,
          city: normalizedCity,
          universityId: verifiedUniId,
          provider: 'credentials',
          passwordHash: `${salt}:${hash}`,
        });
      }

      // Record Audit Event
      await recordLoginAudit({
        userId: targetUser.id,
        email: targetUser.email,
        provider: 'credentials',
        success: true,
        ipAddress: clientIp,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        action: 'signup',
        message: 'Your LowStudy account has been created. Please sign in to continue.',
        isProfileComplete: Boolean(targetUser.city && (targetUser.universityId || targetUser.university)),
        user: {
          id: targetUser.id,
          email: targetUser.email,
          fullName: targetUser.fullName,
          city: targetUser.city,
          universityId: targetUser.universityId,
        },
        redirectUrl: safeRedirect,
      });
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
      const normalizedCity = typeof city === 'string' && city.trim() ? normalizeCityName(city) : null;
      const cleanUniInput = typeof universityId === 'string' && universityId.trim() ? universityId.trim() : null;

      if (!normalizedEmail || !cleanUid) {
        return NextResponse.json(
          { success: false, error: 'Valid Google email and Firebase UID are required.' },
          { status: 400 }
        );
      }

      // Verify university if provided
      let verifiedUniId = null;
      if (cleanUniInput) {
        verifiedUniId = await verifyAndEnsureUniversity(cleanUniInput);
        if (!verifiedUniId) {
          return NextResponse.json(
            { success: false, error: 'Please select a valid university.' },
            { status: 400 }
          );
        }
        if (normalizedCity) {
          const isValid = await isUniversityValidForCity(verifiedUniId, normalizedCity);
          if (!isValid) {
            return NextResponse.json(
              { success: false, error: 'Please select a university that matches your selected city.' },
              { status: 400 }
            );
          }
        }
      }

      // Check if user exists by email first, or by firebaseUid
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: USER_SELECT_FIELDS,
      });

      if (!user && cleanUid) {
        user = await prisma.user.findUnique({
          where: { firebaseUid: cleanUid },
          select: USER_SELECT_FIELDS,
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

        // Account Linking: Link Google firebaseUid, avatar, city, university and update activity
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
        if (normalizedCity && !user.city) {
          updateData.city = normalizedCity;
        }
        if (verifiedUniId && !user.universityId) {
          updateData.universityId = verifiedUniId;
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          select: USER_SELECT_FIELDS,
        });
      } else {
        // Create new user for first-time Google sign-in
        user = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanName || normalizedEmail.split('@')[0],
          avatar: cleanPhoto,
          firebaseUid: cleanUid,
          city: normalizedCity,
          universityId: verifiedUniId,
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
      const isProfileComplete = Boolean(user.city && (user.universityId || user.university));

      const response = NextResponse.json({
        success: true,
        action: 'google',
        message: 'Google Sign-In successful. Session established.',
        isProfileComplete,
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
    // ACTION: EMAIL/PASSWORD LOGIN
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
          ...USER_SELECT_FIELDS,
          passwordHash: true,
        },
      });
    } else if (normalizedEmail) {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          ...USER_SELECT_FIELDS,
          passwordHash: true,
        },
      });
    }

    const now = new Date();

    // If user does not exist on login attempt
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid email or password. Please check your credentials or create an account.' 
      }, { status: 401 });
    }

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
        select: USER_SELECT_FIELDS,
      });
    } else {
      // User exists without password hash (created via OAuth): save password hash
      const { hash, salt } = hashPassword(password);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          passwordHash: `${salt}:${hash}`,
          lastLoginAt: now,
          lastActiveAt: now,
        },
        select: USER_SELECT_FIELDS,
      });
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
    const isProfileComplete = Boolean(user.city && (user.universityId || user.university));

    const response = NextResponse.json({
      success: true,
      action: 'login',
      message: 'Authenticated successfully. Session established.',
      isProfileComplete,
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
    // 1. Prisma unique constraint violation (duplicate email or UID)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    // 2. Prisma foreign key or record not found constraints
    if (error?.code === 'P2003' || error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Please select a valid college / university.' },
        { status: 400 }
      );
    }

    // 3. User-facing validation errors
    const errorMessage = error?.message || '';
    if (
      errorMessage.startsWith('Please ') ||
      errorMessage.includes('university') ||
      errorMessage.includes('city') ||
      errorMessage.includes('password') ||
      errorMessage.includes('email') ||
      errorMessage.includes('required')
    ) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: error?.status || 400 }
      );
    }

    // 4. Log full context for true unexpected server errors
    console.error('[POST /api/student/session] Unexpected Error:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      { success: false, error: 'Authentication service error. Please try again.' },
      { status: 500 }
    );
  }
}

