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
          '/ceoadmin',
          '/ceoadmin/*',
          '/api/',
          '/api/*',
          '/dashboard',
          '/dashboard/*',
          '/exam-prep/checkout',
          '/exam-prep/success',
          '/exam-prep/failure',
          '/exam-prep/library',
          '/exam-prep/library/*',
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
