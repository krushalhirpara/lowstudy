'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getOrCreateSessionId() {
  if (typeof window === 'undefined') return '';
  try {
    let sid = window.sessionStorage.getItem('ls_analytics_sid');
    if (!sid) {
      sid = 'ls_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      window.sessionStorage.setItem('ls_analytics_sid', sid);
    }
    return sid;
  } catch {
    return 'ls_temp_' + Date.now();
  }
}

function TrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    if (!pathname) return;

    // Do not track ceoadmin pages or internal APIs
    if (pathname.startsWith('/ceoadmin') || pathname.startsWith('/api')) {
      return;
    }

    const fullPath = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    // Prevent duplicate tracking of the same path
    if (lastTrackedPath.current === fullPath) {
      return;
    }
    lastTrackedPath.current = fullPath;

    const sessionId = getOrCreateSessionId();
    const deviceType = getDeviceType();
    const pageTitle = typeof document !== 'undefined' ? document.title : '';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload = JSON.stringify({
      path: fullPath,
      pageTitle,
      referrer,
      deviceType,
      sessionId,
    });

    const timer = setTimeout(() => {
      try {
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/track', blob);
        } else {
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Non-blocking tracking catch
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerInner />
    </Suspense>
  );
}
