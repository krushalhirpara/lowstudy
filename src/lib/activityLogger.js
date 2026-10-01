import crypto from 'crypto';
import prisma from './prisma.js';

// Secret used for non-reversible user hash masking for client-side self-exclusion
const HASH_SALT = process.env.SESSION_SECRET || 'lowstudy-social-proof-activity-salt-2026';

// Allowed event types
export const VALID_ACTIVITY_TYPES = [
  'LOGIN',
  'SIGNUP',
  'DAILY_QUIZ',
  'MCQ_PRACTICE',
  'MOCK_TEST',
  'NYAYAAI',
  'SUBJECT_STUDY',
  'CASE_LAWS',
  'BARE_ACT',
  'DRAFTING',
  'MOOT_COURT',
];

// In-memory throttling map to prevent database spam and ensure deduplication
// key: `${identifier}_${type}` -> timestamp
const THROTTLE_CACHE = new Map();
const SAME_TYPE_COOLDOWN_MS = 60 * 1000; // 60s cooldown for exact same action by same user
const ANY_TYPE_COOLDOWN_MS = 10 * 1000;  // 10s cooldown for any action by same user

// Clean up memory cache every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of THROTTLE_CACHE.entries()) {
    if (now - timestamp > SAME_TYPE_COOLDOWN_MS * 2) {
      THROTTLE_CACHE.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a safe, irreversible 16-char hash for client self-event filtering.
 * @param {string} userId 
 * @returns {string}
 */
export function hashUserIdForClient(userId) {
  if (!userId || typeof userId !== 'string') return '';
  return crypto
    .createHmac('sha256', HASH_SALT)
    .update(String(userId).trim())
    .digest('hex')
    .slice(0, 16);
}

/**
 * Extract safe first name if user has explicitly opted into public activity display.
 * @param {string|null} fullName 
 * @param {boolean} optIn 
 * @returns {string} "A student" or sanitized First Name
 */
export function resolvePublicDisplayName(fullName, optIn) {
  if (!optIn || !fullName || typeof fullName !== 'string') {
    return 'A student';
  }
  const clean = fullName.trim().replace(/[^\p{L}\s]/gu, '');
  const firstName = clean.split(/\s+/)[0];
  if (!firstName || firstName.length < 2) {
    return 'A student';
  }
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

/**
 * Format public social-proof activity notification message.
 * @param {object} event 
 * @returns {{ title: string, subtitle: string, icon: string }}
 */
export function formatActivityPayload(event) {
  const actor = event.publicDisplayName || 'A student';
  const isPersonalized = actor !== 'A student';
  const subject = event.subjectTitle ? String(event.subjectTitle).trim().slice(0, 50) : '';

  switch (event.type) {
    case 'LOGIN':
      return {
        title: isPersonalized ? `${actor} just logged in` : 'A student just logged in',
        subtitle: 'Active now on LowStudy',
        icon: 'login',
      };

    case 'SIGNUP':
      return {
        title: isPersonalized ? `${actor} just joined LowStudy` : 'A new student just joined LowStudy',
        subtitle: 'Gujarat Law Community',
        icon: 'signup',
      };

    case 'DAILY_QUIZ':
      return {
        title: isPersonalized ? `${actor} is practicing Daily Quiz` : 'A student is practicing Daily Quiz',
        subtitle: 'Exam Revision Challenge',
        icon: 'quiz',
      };

    case 'MCQ_PRACTICE':
      return {
        title: isPersonalized ? `${actor} is solving MCQs` : 'A student is solving MCQs',
        subtitle: 'Objective Law Practice',
        icon: 'mcq',
      };

    case 'MOCK_TEST':
      return {
        title: isPersonalized ? `${actor} started a Mock Test` : 'A student just started a Mock Test',
        subtitle: 'Timed Exam Simulation',
        icon: 'mock',
      };

    case 'NYAYAAI':
      return {
        title: isPersonalized ? `${actor} is using NyayaAI` : 'A student is using NyayaAI',
        subtitle: 'AI Legal Tutor & Research',
        icon: 'ai',
      };

    case 'SUBJECT_STUDY':
      return {
        title: subject
          ? (isPersonalized ? `${actor} is studying ${subject}` : `A student is studying ${subject}`)
          : (isPersonalized ? `${actor} is studying a law subject` : 'A student is studying a law subject'),
        subtitle: 'Verified Gujarat Syllabus',
        icon: 'subject',
      };

    case 'CASE_LAWS':
      return {
        title: isPersonalized ? `${actor} is exploring Case Laws` : 'A student is exploring Case Laws',
        subtitle: 'Supreme Court & High Court Precedents',
        icon: 'case',
      };

    case 'BARE_ACT':
      return {
        title: isPersonalized ? `${actor} is reading a Bare Act` : 'A student is reading a Bare Act',
        subtitle: 'BNS, BNSS, BSA & Core Acts',
        icon: 'bareact',
      };

    case 'DRAFTING':
      return {
        title: isPersonalized ? `${actor} is using Drafting Lab` : 'A student is using Drafting Lab',
        subtitle: 'Pleadings & Legal Instruments',
        icon: 'drafting',
      };

    case 'MOOT_COURT':
      return {
        title: isPersonalized ? `${actor} is practicing Moot Court` : 'A student is practicing Moot Court',
        subtitle: 'Oral Advocacy & Memorials',
        icon: 'moot',
      };

    default:
      return {
        title: isPersonalized ? `${actor} is active on LowStudy` : 'A student is active on LowStudy',
        subtitle: 'Law Learning Platform',
        icon: 'default',
      };
  }
}

/**
 * Record a genuine real-time activity event with strict rate-limiting, deduplication, and privacy enforcement.
 * @param {object} params
 * @param {string} params.type - Event Type (e.g. 'LOGIN', 'NYAYAAI', 'DAILY_QUIZ')
 * @param {string} [params.userId] - Optional authenticated student User ID
 * @param {string} [params.subjectTitle] - Optional safe subject title
 * @param {string} [params.ipAddress] - Client IP for anonymous throttling
 * @returns {Promise<object|null>}
 */
export async function recordActivityEvent({
  type,
  userId = null,
  subjectTitle = null,
  ipAddress = null,
}) {
  if (!VALID_ACTIVITY_TYPES.includes(type)) {
    return null;
  }

  const now = Date.now();
  const identifier = userId ? `usr_${userId}` : `ip_${crypto.createHash('sha256').update(ipAddress || 'unknown').digest('hex').slice(0, 16)}`;
  const specificThrottleKey = `${identifier}_${type}`;
  const globalThrottleKey = `${identifier}_any`;

  // 1. Check in-memory rate-limit throttling
  const lastSpecific = THROTTLE_CACHE.get(specificThrottleKey) || 0;
  const lastGlobal = THROTTLE_CACHE.get(globalThrottleKey) || 0;

  if (now - lastSpecific < SAME_TYPE_COOLDOWN_MS) {
    return null; // Throttled: same action too recent
  }
  if (now - lastGlobal < ANY_TYPE_COOLDOWN_MS) {
    return null; // Throttled: general actions too rapid
  }

  // Update in-memory cache
  THROTTLE_CACHE.set(specificThrottleKey, now);
  THROTTLE_CACHE.set(globalThrottleKey, now);

  try {
    let publicDisplayName = 'A student';

    // 2. Resolve privacy opt-in if userId is present
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            fullName: true,
            activityNotificationOptIn: true,
            role: true,
          },
        });

        // Do not record internal ADMIN actions in student social-proof feed
        if (user?.role === 'ADMIN') {
          return null;
        }

        if (user?.activityNotificationOptIn && user?.fullName) {
          publicDisplayName = resolvePublicDisplayName(user.fullName, true);
        }
      } catch (userLookupErr) {
        console.warn('[ActivityLogger] User lookup fallback:', userLookupErr?.message);
      }
    }

    // Sanitize subjectTitle
    let cleanSubject = null;
    if (subjectTitle && typeof subjectTitle === 'string') {
      cleanSubject = subjectTitle
        .replace(/<[^>]+>/g, '')
        .trim()
        .slice(0, 60);
    }

    const ipHash = ipAddress
      ? crypto.createHash('sha256').update(ipAddress + HASH_SALT).digest('hex').slice(0, 16)
      : null;

    // 3. Persist to Database
    const event = await prisma.activityEvent.create({
      data: {
        type,
        userId: userId || null,
        publicDisplayName,
        subjectTitle: cleanSubject,
        ipHash,
      },
    });

    return event;
  } catch (err) {
    console.warn('[ActivityLogger] Failed to record event non-fatally:', err?.message || err);
    return null;
  }
}
