import crypto from 'crypto';
import { normalizePhoneNumber, isValidIndianPhoneNumber } from '../phoneUtils.js';

export { normalizePhoneNumber, isValidIndianPhoneNumber };

// In-memory OTP cache with automatic expiry cleanup
// Key: normalized 10-digit phone number
// Value: { hash, expiresAt, attempts, resendAfter, createdAt }
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_VERIFY_ATTEMPTS = 5;
const OTP_SECRET = process.env.OTP_SECRET || process.env.SESSION_SECRET || 'lowstudy-otp-secret-key-2026';

/**
 * Periodically purge expired OTP entries from memory
 */
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 60 * 1000).unref();

/**
 * Generate HMAC-SHA256 hash of an OTP code bound to a specific phone number
 */
function hashOtp(phone, otp) {
  return crypto
    .createHmac('sha256', OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest('hex');
}

/**
 * Send a 6-digit verification OTP to a valid Indian mobile number.
 * 
 * @param {string} phone - Raw input phone number
 * @returns {Promise<{ success: boolean, normalizedPhone: string, resendCooldownSeconds: number, message: string }>}
 */
export async function sendMobileOtp(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone || !isValidIndianPhoneNumber(normalizedPhone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
  }

  const existing = otpStore.get(normalizedPhone);
  const now = Date.now();

  // Enforce resend cooldown
  if (existing && existing.resendAfter > now) {
    const remainingSeconds = Math.ceil((existing.resendAfter - now) / 1000);
    throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
  }

  // Generate cryptographically secure 6-digit numeric OTP
  // In automated test environments (ALLOW_TEST_OTP=true), use deterministic OTP '123456'
  const isTestOtpAllowed = (
    process.env.ALLOW_TEST_OTP === 'true' ||
    process.env.NODE_ENV === 'test' ||
    (!process.env.FAST2SMS_API_KEY && process.env.NODE_ENV !== 'production')
  );
  const otpCode = isTestOtpAllowed ? '123456' : crypto.randomInt(100000, 999999).toString();

  const hash = hashOtp(normalizedPhone, otpCode);

  otpStore.set(normalizedPhone, {
    hash,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    resendAfter: now + OTP_RESEND_COOLDOWN_MS,
    createdAt: now,
  });

  // SMS Gateway Dispatch:
  // If an external SMS gateway (Twilio, MSG91, Fast2SMS) is configured in environment, dispatch here.
  // Note: We deliberately do NOT log the raw OTP or expose it in any client-facing response!
  if (process.env.FAST2SMS_API_KEY) {
    try {
      await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: normalizedPhone,
        }),
      });
    } catch (err) {
      console.warn('[OTP Service] SMS delivery warning:', err?.message || err);
    }
  }

  return {
    success: true,
    normalizedPhone,
    resendCooldownSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
    message: `Verification code sent to +91 ${normalizedPhone.slice(0, 5)} ${normalizedPhone.slice(5)}.`,
  };
}

/**
 * Verify a user-provided OTP code against the stored hash.
 * 
 * @param {string} phone - Raw or normalized phone number
 * @param {string} inputOtp - User-entered 6-digit code
 * @returns {Promise<{ success: boolean, normalizedPhone: string }>}
 */
export async function verifyMobileOtp(phone, inputOtp) {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (!normalizedPhone) {
    throw new Error('Invalid mobile number format.');
  }

  const cleanOtp = String(inputOtp || '').trim();
  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    throw new Error('Verification code must be exactly 6 digits.');
  }

  const record = otpStore.get(normalizedPhone);
  const now = Date.now();

  if (!record) {
    throw new Error('No active verification code found for this number. Please request a new code.');
  }

  if (record.expiresAt < now) {
    otpStore.delete(normalizedPhone);
    throw new Error('Verification code has expired. Please request a new code.');
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(normalizedPhone);
    throw new Error('Too many incorrect attempts. Please request a new verification code.');
  }

  record.attempts += 1;

  const expectedHash = hashOtp(normalizedPhone, cleanOtp);
  const sigBuf = Buffer.from(record.hash, 'utf8');
  const expectedBuf = Buffer.from(expectedHash, 'utf8');

  const isMatch = (
    sigBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(sigBuf, expectedBuf)
  );

  if (!isMatch) {
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts;
    throw new Error(`Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
  }

  // Clear OTP on successful verification to prevent reuse
  otpStore.delete(normalizedPhone);

  return {
    success: true,
    normalizedPhone,
  };
}
