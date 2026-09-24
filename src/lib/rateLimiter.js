/**
 * In-Memory Sliding Window Rate Limiter
 * Guards AI assistant and sensitive endpoints against abuse.
 */

const requestLog = new Map();

// Periodic cleanup of stale records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requestLog.entries()) {
      const validTimestamps = timestamps.filter(t => now - t < 60000);
      if (validTimestamps.length === 0) {
        requestLog.delete(key);
      } else {
        requestLog.set(key, validTimestamps);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks rate limit for a client identifier.
 * @param {string} clientId - IP address or User ID
 * @param {number} maxRequests - Max allowed requests within window (default 30)
 * @param {number} windowMs - Window duration in milliseconds (default 60,000ms = 1 min)
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function checkRateLimit(clientId = 'anonymous', maxRequests = 30, windowMs = 60000) {
  const now = Date.now();
  const timestamps = requestLog.get(clientId) || [];

  // Filter timestamps within current window
  const windowStart = now - windowMs;
  const recentTimestamps = timestamps.filter(t => t > windowStart);

  if (recentTimestamps.length >= maxRequests) {
    const oldest = recentTimestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return {
      allowed: false,
      remaining: 0,
      resetMs,
      limit: maxRequests
    };
  }

  // Record this request
  recentTimestamps.push(now);
  requestLog.set(clientId, recentTimestamps);

  return {
    allowed: true,
    remaining: maxRequests - recentTimestamps.length,
    resetMs: windowMs,
    limit: maxRequests
  };
}

export default {
  checkRateLimit
};
