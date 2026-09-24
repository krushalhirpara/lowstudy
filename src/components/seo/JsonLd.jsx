import React from 'react';

/**
 * JsonLd component for safely injecting Schema.org JSON-LD structured data into HTML head.
 * @param {Object} props.data - The JSON-LD schema object
 */
export default function JsonLd({ data }) {
  if (!data) return null;

  // Safely serialize and escape < as \u003c to prevent script-breakout XSS vulnerabilities
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}
