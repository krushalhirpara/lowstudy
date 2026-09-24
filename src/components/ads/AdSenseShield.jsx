"use client";

import { useEffect } from 'react';

/**
 * AdSenseShield provides a client-side defensive boundary for Google AdSense.
 * It ensures that unhandled runtime exceptions or script collisions from third-party
 * advertising scripts (e.g., adsbygoogle.js, toClass, n_div) can NEVER crash the React
 * application tree or trigger Next.js "Application error: a client-side exception has occurred".
 */
export default function AdSenseShield() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Defensive initialization of adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];

    const handleWindowError = (event) => {
      const errorMsg = event?.message || event?.error?.message || '';
      const filename = event?.filename || '';

      const isAdSenseRelated =
        filename.includes('adsbygoogle') ||
        filename.includes('pagead2') ||
        filename.includes('googlesyndication') ||
        filename.includes('doubleclick') ||
        errorMsg.includes('toClass') ||
        errorMsg.includes('n_div') ||
        errorMsg.includes('adsbygoogle') ||
        errorMsg.includes('TagError');

      if (isAdSenseRelated) {
        // Prevent third-party ad error from crashing the application
        console.warn('[AdSense Shield] Safely caught external ad exception:', errorMsg || 'Third-party script error');
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        if (typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
        return true;
      }
    };

    const handleUnhandledRejection = (event) => {
      const reason = event?.reason?.message || String(event?.reason || '');
      if (
        reason.includes('adsbygoogle') ||
        reason.includes('pagead2') ||
        reason.includes('toClass') ||
        reason.includes('n_div')
      ) {
        console.warn('[AdSense Shield] Safely caught external ad rejection:', reason);
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        return true;
      }
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
