/**
 * Client-side helper to record genuine learning activities in the background.
 * Uses sendBeacon if available, otherwise fetch with keepalive.
 * Never throws or interrupts UI.
 * 
 * @param {string} type - Event Type (e.g. 'DAILY_QUIZ', 'SUBJECT_STUDY', 'MOOT_COURT')
 * @param {object} [options]
 * @param {string} [options.subjectTitle] - Subject Title (e.g. "Labour Law")
 */
export function trackActivityClient(type, { subjectTitle = null } = {}) {
  if (typeof window === 'undefined' || !type) return;

  try {
    const payload = JSON.stringify({
      type,
      subjectTitle: subjectTitle ? String(subjectTitle).slice(0, 60) : null,
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/activity/record', blob);
    } else {
      fetch('/api/activity/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking catch
  }
}
