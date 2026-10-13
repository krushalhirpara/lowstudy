/**
 * LowStudy GA4 & Search Console Analytics Helper
 * Provides safe, client-side event tracking for Google Analytics 4 (Measurement ID: G-37P31VWPP7).
 * Never interrupts user interface or fails on SSR.
 */

export const GA_MEASUREMENT_ID = 'G-37P31VWPP7';

/**
 * Dispatch custom GA4 event safely
 * @param {string} eventName - Standard or custom GA4 event name (e.g. 'sign_up', 'begin_checkout', 'purchase')
 * @param {Record<string, any>} [eventParams] - Parameters to associate with the event
 */
export function trackGA4Event(eventName, eventParams = {}) {
  if (typeof window === 'undefined' || !eventName) return;

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        send_to: GA_MEASUREMENT_ID,
        ...eventParams,
      });
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams,
      });
    }
  } catch (err) {
    // Non-blocking defensive catch
  }
}

/**
 * Track Exam Prep Pass purchase conversion in GA4
 * @param {object} details
 * @param {string} details.transactionId - Razorpay payment ID or order ID
 * @param {number} [details.value=299] - Amount in INR
 */
export function trackExamPrepPurchase({ transactionId, value = 299 } = {}) {
  trackGA4Event('purchase', {
    transaction_id: transactionId,
    value: value,
    currency: 'INR',
    items: [
      {
        item_id: 'exam_prep_pass_299',
        item_name: 'LowStudy Exam Prep Pass',
        price: value,
        quantity: 1,
        item_category: 'Legal Education',
      },
    ],
  });
}

/**
 * Track student signup or login conversion
 * @param {string} method - 'phone_otp' | 'google' | 'credentials'
 */
export function trackStudentSignup(method = 'phone_otp') {
  trackGA4Event('sign_up', {
    method,
  });
}

/**
 * Track start of checkout
 * @param {number} [value=299]
 */
export function trackBeginCheckout(value = 299) {
  trackGA4Event('begin_checkout', {
    value,
    currency: 'INR',
    items: [
      {
        item_id: 'exam_prep_pass_299',
        item_name: 'LowStudy Exam Prep Pass',
        price: value,
        quantity: 1,
      },
    ],
  });
}
