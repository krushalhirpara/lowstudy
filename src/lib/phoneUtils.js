/**
 * Indian Phone Number Utility: Normalization, Validation, and Formatting.
 */

/**
 * Normalizes any phone number input into a clean 10-digit Indian mobile number string.
 * Strips formatting characters (spaces, dashes, parentheses, dots, +91 prefix, leading 0).
 * 
 * @param {string|number} phone 
 * @returns {string|null} 10-digit normalized phone number, or null if invalid
 */
export function normalizePhoneNumber(phone) {
  if (!phone && phone !== 0) return null;
  const str = String(phone).trim();
  if (!str) return null;

  // Strip all non-digit characters
  let digits = str.replace(/\D/g, '');

  // Handle "+91" or "91" prefix for 12-digit numbers
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // Handle leading "0" prefix for 11-digit numbers (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Indian mobile numbers must be exactly 10 digits
  if (digits.length === 10) {
    return digits;
  }

  return null;
}

/**
 * Validates whether the given phone number is a valid 10-digit Indian mobile number.
 * Valid Indian mobile numbers start with 6, 7, 8, or 9.
 * 
 * @param {string|number} phone 
 * @returns {boolean}
 */
export function isValidIndianPhoneNumber(phone) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return false;
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Formats a 10-digit phone number into a friendly display string (e.g. +91 98765 43210).
 * 
 * @param {string|number} phone 
 * @returns {string}
 */
export function formatPhoneNumberForDisplay(phone) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return phone ? String(phone) : '';
  return `+91 ${normalized.slice(0, 5)} ${normalized.slice(5)}`;
}
