/**
 * Dynamic robots.txt Generator for Next.js App Router
 * URL: https://lowstudy.com/robots.txt
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*',
          '/dashboard',
          '/dashboard/*',
          '/private/',
          '/user/',
          '/account/',
          '/chat/private/',
        ],
      },
    ],
    sitemap: 'https://lowstudy.com/sitemap.xml',
    host: 'https://lowstudy.com',
  };
}
