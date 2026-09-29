import { NextResponse } from 'next/server';

/**
 * Decode and validate session payload in Edge runtime
 */
function parseEdgeSession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  try {
    // Base64url decode
    const base64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    const jsonStr = atob(padded);
    const payload = JSON.parse(jsonStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Edge-compatible safe redirect sanitizer
 */
function getSafeRedirect(targetUrl, fallback = '/dashboard') {
  if (!targetUrl || typeof targetUrl !== 'string') return fallback;
  const trimmed = targetUrl.trim().replace(/[\r\n\0]/g, '');
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) return fallback;
  if (trimmed.startsWith('/login') || trimmed.startsWith('/signup') || trimmed.startsWith('/ceoadmin')) return fallback;
  if (trimmed.toLowerCase().includes('javascript:') || trimmed.toLowerCase().includes('data:')) return fallback;
  return trimmed;
}

// Protected Student Route Prefixes (Student Private Learning Areas)
const PROTECTED_STUDENT_ROUTES = [
  '/dashboard',
  '/subjects',
  '/practice',
  '/mock-test',
  '/mock-tests',
  '/quiz',
  '/mcq',
  '/notes',
  '/case-laws',
  '/bare-acts',
  '/ai-tutor',
  '/nyayaai',
  '/ai',
  '/drafting',
  '/moot-court',
  '/study-plan',
  '/planner',
  '/revision',
  '/question-bank',
  '/exam-mode',
  '/research',
  '/practice-writing',
  '/curriculum',
  '/previous-papers',
  '/academic',
];

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip Next.js internal assets, static files, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get('lowstudy_session')?.value;
  const session = parseEdgeSession(sessionCookie);
  const isAuthenticated = !!session?.userId;
  const isAdmin = session?.role?.toUpperCase() === 'ADMIN';

  // 3. CEO Admin Route Protection
  if (pathname.startsWith('/ceoadmin')) {
    // If requesting the admin login landing page (/ceoadmin or /ceoadmin/)
    if (pathname === '/ceoadmin' || pathname === '/ceoadmin/') {
      // If already authenticated as ADMIN, send to admin dashboard
      if (isAdmin) {
        return NextResponse.redirect(new URL('/ceoadmin/dashboard', request.url));
      }
      // Allow access to login page
      return NextResponse.next();
    }

    // For all subroutes under /ceoadmin/* (e.g. /ceoadmin/dashboard, /ceoadmin/users, etc.)
    if (!isAdmin) {
      // Non-admin or unauthenticated visitor gets redirected to /ceoadmin login
      return NextResponse.redirect(new URL('/ceoadmin', request.url));
    }

    return NextResponse.next();
  }

  // 4. Student Protected Routes Check
  // Check static list + semester curriculum learning routes (e.g. /saurashtra-university/llb/semester-3)
  const isSemesterCurriculum = pathname.includes('/llb/semester-');
  const isProtectedStudentRoute = isSemesterCurriculum || PROTECTED_STUDENT_ROUTES.some(
    prefix => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedStudentRoute) {
    if (!isAuthenticated) {
      const redirectTarget = `${pathname}${search || ''}`;
      const signupUrl = new URL('/signup', request.url);
      signupUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(signupUrl);
    }
  }

  // 5. If already logged in and visiting /login or /signup, redirect to target or dashboard
  if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const safeTarget = getSafeRedirect(redirectParam, '/dashboard');
    return NextResponse.redirect(new URL(safeTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
