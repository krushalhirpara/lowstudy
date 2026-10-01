import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { normalizeCityName } from '@/data/gujaratData';
import { verifyAndEnsureUniversity, isUniversityValidForCity } from '@/lib/universityHelper';
import { normalizePhoneNumber, isValidIndianPhoneNumber } from '@/lib/phoneUtils';
import { 
  createSessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  hashPassword,
  sanitizeInput,
  getSafeRedirectUrl
} from '@/lib/security';
import { recordActivityEvent } from '@/lib/activityLogger';

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

    if (success && validUserId) {
      recordActivityEvent({ type: 'LOGIN', userId: validUserId, ipAddress }).catch(() => {});
    }
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
  phoneNumber: true,
  profileCompleted: true,
  activityNotificationOptIn: true,
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
  phoneNumber = null,
  profileCompleted = false,
  universityId = null 
}) {
  const now = new Date();
  const normalizedCity = city ? normalizeCityName(city) : null;
  const normalizedPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : null;
  
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
    phoneNumber: normalizedPhone,
    profileCompleted: profileCompleted || Boolean(normalizedCity && validUniId && normalizedPhone),
    activityNotificationOptIn: false,
    universityId: validUniId,
    role: 'STUDENT',
    xp: 0,
    streakDays: 0,
    coins: 0,
    isActive: true,
    lastLoginAt: now,
    lastActiveAt: now,
    ...(passwordHash ? { passwordHash } : {}),
  };

  const newStudent = await prisma.user.create({
    data: baseData,
    select: USER_SELECT_FIELDS,
  });

  if (newStudent?.id) {
    recordActivityEvent({ type: 'SIGNUP', userId: newStudent.id }).catch(() => {});
  }

  return newStudent;
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

    const isProfileComplete = Boolean(
      user.profileCompleted || (user.city && (user.universityId || user.university) && user.phoneNumber)
    );

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
 * POST: Authenticate student via Credentials, Register new accounts, or Google Sign-In / Sign-Up.
 */
export async function POST(request) {
  try {
    const clientIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
      request.headers.get('x-real-ip') || 
      'client-ip';
    const userAgent = request.headers.get('user-agent') || '';

    // Rate Limiting Protection (40 attempts per minute)
    const rateLimit = checkRateLimit(`login-${clientIp}`, 40, 60000);
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
    const { 
      action = 'login', 
      userId, 
      email, 
      password, 
      fullName, 
      firebaseUid, 
      photoURL, 
      redirectUrl, 
      city, 
      universityId,
      phoneNumber,
      contactNumber 
    } = body;

    const rawPhone = phoneNumber || contactNumber || null;
    const normalizedEmail = typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
    const safeRedirect = getSafeRedirectUrl(redirectUrl, '/');

    // =========================================================================
    // ACTION: LOGOUT
    // =========================================================================
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
      let targetUserId = sessionPayload?.userId || userId;

      // If no session token, check if user exists by email or firebaseUid (Google signup flow)
      if (!targetUserId && (normalizedEmail || firebaseUid)) {
        const found = await prisma.user.findFirst({
          where: {
            OR: [
              ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
              ...(firebaseUid ? [{ firebaseUid: String(firebaseUid).trim() }] : []),
            ]
          },
          select: { id: true }
        });
        if (found) targetUserId = found.id;
      }

      const updateData = {};
      if (typeof body.activityNotificationOptIn === 'boolean') {
        updateData.activityNotificationOptIn = body.activityNotificationOptIn;
      }
      if (fullName && typeof fullName === 'string' && fullName.trim()) {
        updateData.fullName = sanitizeInput(fullName.trim(), { maxLength: 100 });
      }

      if (rawPhone && typeof rawPhone === 'string' && rawPhone.trim()) {
        const normPhone = normalizePhoneNumber(rawPhone);
        if (!normPhone || !isValidIndianPhoneNumber(normPhone)) {
          return NextResponse.json(
            { success: false, error: 'Please enter a valid 10-digit Indian contact number.' },
            { status: 400 }
          );
        }
        updateData.phoneNumber = normPhone;
      }

      let newCity = null;
      if (city && typeof city === 'string' && city.trim()) {
        const normCity = normalizeCityName(city);
        if (normCity) {
          updateData.city = normCity;
          newCity = normCity;
        }
      }

      let newUniId = null;
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

      // If user doesn't exist yet and we have full details + email, create the user
      let updatedUser = null;
      if (!targetUserId) {
        if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
          return NextResponse.json(
            { success: false, error: 'Valid email address is required to create profile.' },
            { status: 400 }
          );
        }
        if (!updateData.phoneNumber) {
          return NextResponse.json(
            { success: false, error: 'Please enter a valid 10-digit contact number.' },
            { status: 400 }
          );
        }
        if (!newCity || !newUniId) {
          return NextResponse.json(
            { success: false, error: 'Please select both your City and College / University.' },
            { status: 400 }
          );
        }

        updatedUser = await createNewStudent({
          email: normalizedEmail,
          fullName: updateData.fullName || normalizedEmail.split('@')[0],
          avatar: photoURL && typeof photoURL === 'string' && photoURL.startsWith('http') ? photoURL.slice(0, 500) : null,
          firebaseUid: firebaseUid ? String(firebaseUid).trim() : null,
          provider: firebaseUid ? 'google' : 'credentials',
          city: newCity,
          phoneNumber: updateData.phoneNumber,
          universityId: newUniId,
          profileCompleted: true,
        });
      } else {
        const existingRecord = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { city: true, universityId: true, phoneNumber: true, fullName: true },
        });

        const finalName = updateData.fullName || existingRecord?.fullName;
        const finalPhone = updateData.phoneNumber || existingRecord?.phoneNumber;
        const finalCity = updateData.city || existingRecord?.city;
        const finalUni = updateData.universityId || existingRecord?.universityId;

        if (finalName && finalPhone && finalCity && finalUni) {
          updateData.profileCompleted = true;
        }

        updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: updateData,
          select: USER_SELECT_FIELDS,
        });
      }

      const isProfileComplete = Boolean(
        updatedUser.profileCompleted || (updatedUser.city && updatedUser.universityId && updatedUser.phoneNumber)
      );

      // Issue session token if profile is complete
      const sessionToken = createSessionToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        universityId: updatedUser.universityId,
      });

      const response = NextResponse.json({
        success: true,
        action: 'complete_profile',
        message: 'Profile completed successfully.',
        isProfileComplete,
        user: updatedUser,
        token: sessionToken,
        redirectUrl: safeRedirect,
      });

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
    // ACTION: SIGNUP / REGISTER (Email/Password Registration)
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
        : null;

      if (!cleanFullName || cleanFullName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Please enter your Full Name.' },
          { status: 400 }
        );
      }

      // Contact Number Validation
      const normalizedPhone = normalizePhoneNumber(rawPhone);
      if (!normalizedPhone || !isValidIndianPhoneNumber(normalizedPhone)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid 10-digit Indian contact number.' },
          { status: 400 }
        );
      }

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
          passwordHash: true,
          isActive: true,
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
            fullName: cleanFullName,
            phoneNumber: normalizedPhone,
            city: normalizedCity,
            universityId: verifiedUniId,
            profileCompleted: true,
            lastActiveAt: new Date(),
          },
          select: USER_SELECT_FIELDS,
        });
      } else {
        // Create new student account with validated city, university, and contact number
        const { hash, salt } = hashPassword(password);
        targetUser = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanFullName,
          phoneNumber: normalizedPhone,
          city: normalizedCity,
          universityId: verifiedUniId,
          provider: 'credentials',
          profileCompleted: true,
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
        isProfileComplete: true,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          fullName: targetUser.fullName,
          phoneNumber: targetUser.phoneNumber,
          city: targetUser.city,
          universityId: targetUser.universityId,
        },
        redirectUrl: safeRedirect,
      });
    }

    // =========================================================================
    // ACTION: GOOGLE LOGIN (From /login Page — EXISTING USERS ONLY)
    // =========================================================================
    if (action === 'google_login') {
      const cleanUid = typeof firebaseUid === 'string' && firebaseUid.trim() ? firebaseUid.trim() : null;

      if (!normalizedEmail || !cleanUid) {
        return NextResponse.json(
          { success: false, error: 'Valid Google email and Firebase UID are required.' },
          { status: 400 }
        );
      }

      // Search database for existing user by email or firebaseUid
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

      // CRITICAL REQUIREMENT: If no LowStudy account exists, DO NOT auto-create account or session
      if (!user) {
        await recordLoginAudit({
          email: normalizedEmail,
          provider: 'google',
          success: false,
          failureReason: 'NO_ACCOUNT_FOUND',
          ipAddress: clientIp,
          userAgent,
        });

        return NextResponse.json(
          { 
            success: false, 
            notFound: true, 
            error: 'No LowStudy account found. Please sign up first to continue.' 
          },
          { status: 404 }
        );
      }

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

      const now = new Date();
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
      if (!user.avatar && photoURL && typeof photoURL === 'string') {
        updateData.avatar = photoURL.slice(0, 500);
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
        select: USER_SELECT_FIELDS,
      });

      // Record successful Google Login Event
      await recordLoginAudit({
        userId: user.id,
        email: user.email,
        provider: 'google',
        success: true,
        ipAddress: clientIp,
        userAgent,
      });

      const isProfileComplete = Boolean(
        user.profileCompleted || (user.city && (user.universityId || user.university) && user.phoneNumber)
      );

      // Issue Tamper-Proof HMAC-SHA256 Signed Session Token
      const sessionToken = createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        universityId: user.universityId,
      });

      const response = NextResponse.json({
        success: true,
        action: 'google_login',
        message: 'Google Sign-In successful. Session established.',
        isProfileComplete,
        user,
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
    // ACTION: GOOGLE (From /signup Page — Initial Firebase Auth Pre-Check)
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

      let existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: USER_SELECT_FIELDS,
      });

      if (!existingUser && cleanUid) {
        existingUser = await prisma.user.findUnique({
          where: { firebaseUid: cleanUid },
          select: USER_SELECT_FIELDS,
        });
      }

      // If this is a new Google user, return flag indicating profile completion is required
      if (!existingUser) {
        return NextResponse.json({
          success: true,
          isNewUser: true,
          isProfileComplete: false,
          message: 'Please complete your student profile to finish registration.',
          email: normalizedEmail,
          fullName: cleanName || normalizedEmail.split('@')[0],
          photoURL: cleanPhoto,
        });
      }

      // If existing user already has complete profile, issue session
      const isComplete = Boolean(
        existingUser.profileCompleted || (existingUser.city && existingUser.universityId && existingUser.phoneNumber)
      );

      if (isComplete) {
        const sessionToken = createSessionToken({
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          universityId: existingUser.universityId,
        });

        const response = NextResponse.json({
          success: true,
          action: 'google',
          isProfileComplete: true,
          user: existingUser,
          token: sessionToken,
          redirectUrl: safeRedirect,
        });

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

      return NextResponse.json({
        success: true,
        isNewUser: false,
        isProfileComplete: false,
        user: existingUser,
      });
    }

    // =========================================================================
    // ACTION: GOOGLE SIGNUP / REGISTRATION (From /signup Page with Profile Data)
    // =========================================================================
    if (action === 'google_signup') {
      const cleanUid = typeof firebaseUid === 'string' && firebaseUid.trim() ? firebaseUid.trim() : null;
      const cleanName = typeof fullName === 'string' && fullName.trim() 
        ? sanitizeInput(fullName.trim(), { maxLength: 100 }) 
        : null;
      const cleanPhoto = photoURL && typeof photoURL === 'string' && photoURL.startsWith('http') 
        ? photoURL.trim().slice(0, 500) 
        : null;
      const normalizedCity = typeof city === 'string' && city.trim() ? normalizeCityName(city) : null;
      const cleanUniInput = typeof universityId === 'string' && universityId.trim() ? universityId.trim() : null;
      const normalizedPhone = normalizePhoneNumber(rawPhone);

      if (!normalizedEmail || !cleanUid) {
        return NextResponse.json(
          { success: false, error: 'Valid Google email and Firebase UID are required.' },
          { status: 400 }
        );
      }

      // Validating Full Registration Details for Google User
      if (!cleanName || cleanName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Please enter your Full Name.' },
          { status: 400 }
        );
      }

      if (!normalizedPhone || !isValidIndianPhoneNumber(normalizedPhone)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid 10-digit Indian contact number.' },
          { status: 400 }
        );
      }

      if (!normalizedCity) {
        return NextResponse.json(
          { success: false, error: 'Please select your city.' },
          { status: 400 }
        );
      }

      if (!cleanUniInput) {
        return NextResponse.json(
          { success: false, error: 'Please select your college/university.' },
          { status: 400 }
        );
      }

      // Verify university
      const verifiedUniId = await verifyAndEnsureUniversity(cleanUniInput);
      if (!verifiedUniId) {
        return NextResponse.json(
          { success: false, error: 'Please select a valid university.' },
          { status: 400 }
        );
      }

      const isValidCityUni = await isUniversityValidForCity(verifiedUniId, normalizedCity);
      if (!isValidCityUni) {
        return NextResponse.json(
          { success: false, error: 'Please select a university that matches your selected city.' },
          { status: 400 }
        );
      }

      // Check if user exists by email or firebaseUid
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
        if (!user.isActive) {
          return NextResponse.json(
            { success: false, error: 'This account has been deactivated. Please contact support.' },
            { status: 403 }
          );
        }

        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            fullName: cleanName,
            phoneNumber: normalizedPhone,
            city: normalizedCity,
            universityId: verifiedUniId,
            firebaseUid: cleanUid,
            avatar: cleanPhoto || user.avatar,
            profileCompleted: true,
            lastLoginAt: now,
            lastActiveAt: now,
          },
          select: USER_SELECT_FIELDS,
        });
      } else {
        // Create new user for Google sign-up
        user = await createNewStudent({
          email: normalizedEmail,
          fullName: cleanName,
          phoneNumber: normalizedPhone,
          city: normalizedCity,
          universityId: verifiedUniId,
          avatar: cleanPhoto,
          firebaseUid: cleanUid,
          provider: 'google',
          profileCompleted: true,
        });
      }

      // Record successful Google Sign-Up Event
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

      const response = NextResponse.json({
        success: true,
        action: 'google_signup',
        message: 'Google registration completed successfully. Session established.',
        isProfileComplete: true,
        user,
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
    // ACTION: EMAIL / PASSWORD LOGIN
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

    // Locate user record
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

    // If user does not exist on login attempt: DO NOT CREATE ACCOUNT
    if (!user) {
      await recordLoginAudit({
        email: normalizedEmail || cleanUserId,
        provider: 'credentials',
        success: false,
        failureReason: 'USER_NOT_FOUND',
        ipAddress: clientIp,
        userAgent,
      });

      return NextResponse.json({ 
        success: false, 
        notFound: true,
        error: 'No LowStudy account found. Please create an account first.' 
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
        select: {
          ...USER_SELECT_FIELDS,
          passwordHash: true,
        },
      });
    }

    // Contact Number Verification on Login
    if (rawPhone && typeof rawPhone === 'string' && rawPhone.trim()) {
      const normInputPhone = normalizePhoneNumber(rawPhone);
      if (!normInputPhone || !isValidIndianPhoneNumber(normInputPhone)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid 10-digit Indian contact number.' },
          { status: 400 }
        );
      }

      if (user.phoneNumber) {
        const normStoredPhone = normalizePhoneNumber(user.phoneNumber);
        if (normInputPhone !== normStoredPhone) {
          await recordLoginAudit({
            userId: user.id,
            email: user.email,
            provider: 'credentials',
            success: false,
            failureReason: 'PHONE_MISMATCH',
            ipAddress: clientIp,
            userAgent,
          });

          return NextResponse.json({
            success: false,
            error: 'Please check your login details and try again.'
          }, { status: 401 });
        }
      } else {
        // If existing legacy user had no phone stored, attach it
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phoneNumber: normInputPhone },
          select: {
            ...USER_SELECT_FIELDS,
            passwordHash: true,
          },
        });
      }
    } else if (user.phoneNumber) {
      // Phone is registered on account but not provided in login request
      return NextResponse.json({
        success: false,
        error: 'Please enter your registered contact number.'
      }, { status: 400 });
    }

    // Update activity timestamps
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

    const isProfileComplete = Boolean(
      user.profileCompleted || (user.city && (user.universityId || user.university) && user.phoneNumber)
    );

    const response = NextResponse.json({
      success: true,
      action: 'login',
      message: 'Authenticated successfully. Session established.',
      isProfileComplete,
      user,
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
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    if (error?.code === 'P2003' || error?.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Please select a valid college / university.' },
        { status: 400 }
      );
    }

    const errorMessage = error?.message || '';
    if (
      errorMessage.startsWith('Please ') ||
      errorMessage.includes('university') ||
      errorMessage.includes('city') ||
      errorMessage.includes('password') ||
      errorMessage.includes('email') ||
      errorMessage.includes('contact') ||
      errorMessage.includes('phone') ||
      errorMessage.includes('required')
    ) {
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: error?.status || 400 }
      );
    }

    console.error('[POST /api/student/session] Unexpected Error:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });

    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
