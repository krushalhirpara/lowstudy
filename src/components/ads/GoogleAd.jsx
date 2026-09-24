"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * Defensive Google AdSense Unit Component
 * 
 * Guarantees:
 * 1. Safe client-only execution (never runs on server or during initial hydration)
 * 2. Isolates AdSense errors so an ad failure NEVER crashes React or causes a blank screen
 * 3. Prevents duplicate push calls on the same container
 * 4. Verifies container visibility and dimensions before pushing to adsbygoogle
 */
export default function GoogleAd({
  slot = '1234567890',
  client = 'ca-pub-4372092895969608',
  format = 'auto',
  responsive = 'true',
  layoutKey = '',
  className = '',
  style = { display: 'block' },
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || pushedRef.current || adError) return;

    // Small delay to ensure layout computation is complete and container has dimensions
    const timer = setTimeout(() => {
      try {
        if (!adRef.current) return;

        // Check if the container is attached to DOM and has dimensions
        const rect = adRef.current.getBoundingClientRect();
        if (rect.width === 0 && format !== 'fluid') {
          // If container is hidden (e.g. display: none tab), wait or skip safely
          return;
        }

        // Check if already initialized by AdSense
        if (adRef.current.getAttribute('data-adsbygoogle-status')) {
          pushedRef.current = true;
          return;
        }

        if (typeof window !== 'undefined') {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          pushedRef.current = true;
        }
      } catch (err) {
        console.warn('[AdSense Component] Non-fatal error loading ad slot:', slot, err?.message || err);
        setAdError(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isMounted, slot, format, adError]);

  // SSR or Server Rendering -> Render clean container placeholder or null
  if (!isMounted || adError) {
    return null;
  }

  return (
    <div className={`ad-container overflow-hidden text-center my-4 ${className}`} aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
      />
    </div>
  );
}

/**
 * Convenience Responsive Banner Wrapper
 */
export function AdBanner({ slot, className = '' }) {
  return (
    <GoogleAd
      slot={slot}
      format="auto"
      responsive="true"
      className={`w-full max-w-4xl mx-auto ${className}`}
    />
  );
}
