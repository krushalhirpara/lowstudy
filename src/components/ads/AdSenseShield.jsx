"use client";

import { useEffect } from 'react';

/**
 * AdSenseShield provides a client-side defensive boundary for Google AdSense.
 * It ensures that unhandled runtime exceptions or script collisions from third-party
 * advertising scripts (e.g., adsbygoogle.js, toClass, no_div, TagError) can NEVER crash the React
 * application tree or trigger Next.js "Application error: a client-side exception has occurred".
 */
export default function AdSenseShield() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Defensive initialization of adsbygoogle array
    window.adsbygoogle = window.adsbygoogle || [];

    const isAdSenseError = (errorMsg = '', filename = '', stack = '') => {
      const lowerMsg = String(errorMsg).toLowerCase();
      const lowerFile = String(filename).toLowerCase();
      const lowerStack = String(stack).toLowerCase();

      return (
        lowerFile.includes('adsbygoogle') ||
        lowerFile.includes('pagead2') ||
        lowerFile.includes('googlesyndication') ||
        lowerFile.includes('doubleclick') ||
        lowerMsg.includes('adsbygoogle') ||
        lowerMsg.includes('no_div') ||
        lowerMsg.includes('n_div') ||
        lowerMsg.includes('toclass') ||
        lowerMsg.includes('tagerror') ||
        lowerMsg.includes('no slot size') ||
        lowerMsg.includes('already have ads') ||
        lowerMsg.includes('only one adsense') ||
        lowerStack.includes('adsbygoogle') ||
        lowerStack.includes('googlesyndication')
      );
    };

    const handleWindowError = (event) => {
      const errorMsg = event?.message || event?.error?.message || '';
      const filename = event?.filename || '';
      const stack = event?.error?.stack || '';

      if (isAdSenseError(errorMsg, filename, stack)) {
        console.warn('[AdSense Shield] Safely caught external ad script error:', errorMsg || 'Third-party ad exception');
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
      const reasonMsg = event?.reason?.message || String(event?.reason || '');
      const stack = event?.reason?.stack || '';

      if (isAdSenseError(reasonMsg, '', stack)) {
        console.warn('[AdSense Shield] Safely caught external ad rejection:', reasonMsg);
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
