import crypto from 'crypto';

// 1. Secrets & Environment
const SESSION_SECRET = process.env.SESSION_SECRET || 'lowstudy-super-secret-hmac-key-2026-law-exam';
const ADMIN_SECRET = process.env.ADMIN_SECRET || process.env.ADMIN_API_KEY || 'lowstudy-admin-key-2026';
const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Hash a plain text password using PBKDF2 with SHA-512 and a cryptographically secure salt.
 * @param {string} password 
 * @returns {{ hash: string, salt: string }}
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Invalid password provided for hashing');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a plain text password against a stored PBKDF2 hash and salt using constant-time comparison.
 * @param {string} password 
 * @param {string} storedHash 
 * @param {string} salt 
 * @returns {boolean}
 */
export function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    const bufA = Buffer.from(hashToVerify, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    console.error('Password verification error:', err.message);
    return false;
  }
}

/**
 * Create a tamper-proof HMAC-SHA256 signed session token.
 * Token structure: base64(payload).base64(signature)
 * @param {object} payload - { userId, email, role, ... }
 * @param {number} maxAgeSeconds
 * @returns {string} Signed token
 */
export function createSessionToken(payload, maxAgeSeconds = TOKEN_MAX_AGE_SECONDS) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + maxAgeSeconds;

  const data = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedData = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');

  return `${encodedData}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed session token with constant-time signature comparison.
 * @param {string} token 
 * @returns {{ valid: boolean, payload?: object, error?: string }}
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token missing or invalid format' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token structure' };
  }

  const [encodedData, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encodedData)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const jsonString = Buffer.from(encodedData, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonString);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'Session token has expired' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Token decoding failed: ' + err.message };
  }
}

/**
 * Extract and verify user session from Request cookies or Authorization Bearer header.
 * @param {Request} request 
 * @returns {{ user: object | null, error: string | null }}
 */
export function getSessionFromRequest(request) {
  try {
    // 1. Try Cookie 'lowstudy_session'
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    let token = cookies['lowstudy_session'];

    // 2. Try Authorization: Bearer <token>
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return { user: null, error: 'No session token found' };
    }

    const { valid, payload, error } = verifySessionToken(token);
    if (!valid) {
      return { user: null, error };
    }

    return { user: payload, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

/**
 * Server-side authorization verification guard.
 * Validates that the request has an active session with one of the required roles OR matches ADMIN_SECRET.
 * NEVER trusts unverified client headers like x-actor-role.
 * 
 * @param {Request} request 
 * @param {string[]} allowedRoles - Array of roles allowed (e.g. ['ADMIN'])
 * @returns {{ authorized: boolean, user?: object, status?: number, error?: string }}
 */
export function verifyAuth(request, allowedRoles = ['ADMIN']) {
  // Check programmatic admin key
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-admin-key');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (ADMIN_SECRET && (bearerToken === ADMIN_SECRET || apiKeyHeader === ADMIN_SECRET)) {
    return {
      authorized: true,
      user: {
        id: 'usr-admin-system',
        role: 'ADMIN',
        fullName: 'System Admin (API Key)',
        isSystemKey: true,
      },
    };
  }

  // Check verified session token
  const { user, error } = getSessionFromRequest(request);
  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: error || 'Authentication required',
    };
  }

  // Normalize and check roles
  const userRole = (user.role || 'STUDENT').toUpperCase();
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

  if (!normalizedAllowed.includes(userRole)) {
    return {
      authorized: false,
      status: 403,
      error: `Forbidden: User role '${userRole}' is not authorized. Required: ${allowedRoles.join(', ')}`,
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Sanitize untrusted user text inputs to prevent XSS.
 * Encodes dangerous HTML entities & strips null bytes.
 * @param {string} input 
 * @param {object} options 
 * @returns {string}
 */
export function sanitizeInput(input, { maxLength = 5000, stripHtml = true } = {}) {
  if (typeof input !== 'string') return '';

  let sanitized = input.replace(/\0/g, '').trim();

  if (stripHtml) {
    // Strip HTML script and style tags and contents
    sanitized = sanitized
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '');
  }

  // Encode HTML special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Recursively sanitize an object's string properties to safeguard database insertion.
 * @param {object} obj 
 * @returns {object}
 */
export function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Detect common AI Prompt Injection patterns to prevent jailbreaks and instruction overrides.
 * @param {string} prompt 
 * @returns {{ isSafe: boolean, riskFlag?: string }}
 */
export function detectPromptInjection(prompt) {
  if (typeof prompt !== 'string') return { isSafe: true };

  const lower = prompt.toLowerCase();

  const injectionPatterns = [
    /ignore\s+all\s+(previous|above)\s+instructions/i,
    /disregard\s+(all\s+)?(previous|system)\s+prompts/i,
    /you\s+are\s+now\s+an\s+unrestricted/i,
    /bypass\s+all\s+safety/i,
    /jailbreak/i,
    /dan\s+mode/i,
    /system\s+override/i,
    /reveal\s+(the\s+)?system\s+prompt/i,
    /output\s+initial\s+instructions/i,
    /print\s+api\s+key/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(lower)) {
      return {
        isSafe: false,
        riskFlag: `Prompt injection pattern detected: ${pattern.toString()}`,
      };
    }
  }

  return { isSafe: true };
}

/**
 * Validate URL to prevent SSRF and dangerous protocols (javascript:, data:, file:).
 * Blocks RFC1918 private subnets, loopbacks, and link-local addresses.
 * @param {string} urlString 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUrlSafe(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string' };
  }

  const trimmed = urlString.trim();

  // Allow relative URLs starting with '/'
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return { valid: true };
  }

  try {
    const parsed = new URL(trimmed);

    // Only allow http: and https: protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: `Disallowed protocol: ${parsed.protocol}. Only HTTP/HTTPS allowed.` };
    }

    const host = parsed.hostname.toLowerCase();

    // Block localhost and loopback
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0') {
      return { valid: false, error: 'Access to loopback addresses is prohibited (SSRF protection).' };
    }

    // Block cloud metadata services (e.g. AWS 169.254.169.254)
    if (host.startsWith('169.254.') || host.includes('metadata.google.internal')) {
      return { valid: false, error: 'Access to cloud metadata services is strictly prohibited.' };
    }

    // Block RFC1918 private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const ipMatch = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipMatch) {
      const b1 = parseInt(ipMatch[1], 10);
      const b2 = parseInt(ipMatch[2], 10);

      if (b1 === 10) return { valid: false, error: 'Private IP 10.0.0.0/8 disallowed.' };
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return { valid: false, error: 'Private IP 172.16.0.0/12 disallowed.' };
      if (b1 === 192 && b2 === 168) return { valid: false, error: 'Private IP 192.168.0.0/16 disallowed.' };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format: ' + err.message };
  }
}
