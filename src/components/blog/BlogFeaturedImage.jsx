"use client";

import React, { useState, useRef } from 'react';

const DEFAULT_FALLBACK = '/images/blog/blog-fallback.webp';

/**
 * High-performance, resilient Blog Featured Image component with safe onError fallback.
 * Prevents broken image icons, infinite loops, and layout shifts.
 */
export default function BlogFeaturedImage({
  src,
  alt = 'LowStudy Legal Study Guide Featured Image',
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  priority = false,
  width = 1200,
  height = 630,
}) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const errorHandledRef = useRef(false);

  const handleError = () => {
    if (!errorHandledRef.current) {
      errorHandledRef.current = true;
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-slate-950 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}
