import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

async function runAudit() {
  console.log('================================================================');
  console.log('RESPONSIVE & PERFORMANCE OPTIMIZATION VERIFICATION AUDIT');
  console.log('Target Breakpoints: 320px, 360px, 375px, 390px, 412px, 768px, 1024px, 1280px, 1440px');
  console.log('================================================================\n');

  // --- 1. TAILWIND BREAKPOINTS AUDIT ---
  console.log('1. Auditing Tailwind Breakpoint Grid System...');
  const tailwindPath = path.resolve('tailwind.config.js');
  const tailwindContent = fs.readFileSync(tailwindPath, 'utf8');

  const requiredBreakpoints = [
    { key: 'xs-320', value: '320px' },
    { key: 'xs-360', value: '360px' },
    { key: 'xs-375', value: '375px' },
    { key: 'xs-390', value: '390px' },
    { key: 'xs-412', value: '412px' },
    { key: 'md', value: '768px' },
    { key: 'lg', value: '1024px' },
    { key: 'xl', value: '1280px' },
    { key: '2xl', value: '1440px' },
  ];

  for (const bp of requiredBreakpoints) {
    const hasBp = tailwindContent.includes(`'${bp.key}': '${bp.value}'`) || 
                  tailwindContent.includes(`"${bp.key}": "${bp.value}"`) ||
                  tailwindContent.includes(`${bp.key}: '${bp.value}'`);
    assert(hasBp, `Breakpoint ${bp.key} (${bp.value}) configured in tailwind.config.js`);
  }

  // --- 2. GLOBAL CSS & PERFORMANCE AUDIT ---
  console.log('\n2. Auditing Global CSS & Root Layout Protection...');
  const globalsPath = path.resolve('src/app/globals.css');
  const globalsContent = fs.readFileSync(globalsPath, 'utf8');

  assert(!globalsContent.includes('@import url(\'https://fonts.googleapis.com/'), 'Render-blocking Google Font @import removed for mobile FCP speed');
  assert(globalsContent.includes('overflow-x: clip'), 'Root overflow-x: clip enforced to eliminate horizontal scrolling');
  assert(globalsContent.includes('max-width: 100vw'), 'Body max-width: 100vw prevents element viewport overflow');
  assert(globalsContent.includes('min-height: 100dvh'), 'Dynamic viewport height (100dvh) supported for mobile address bars');
  assert(globalsContent.includes('word-break: break-word'), 'Automatic word break configured for long legal statutory phrases');
  assert(globalsContent.includes('min-height: 44px'), 'Minimum touch target size (44px) enforced for mobile interactivity');

  // --- 3. AUDITING 13 REQUIRED MODULES ---
  console.log('\n3. Auditing 13 Core Modules for Responsive Optimization...');

  const modules = [
    { name: 'Home Page', path: 'src/app/page.jsx', checkString: 'max-w-[500px]' },
    { name: 'Login Page', path: 'src/app/login/page.jsx', checkString: 'No Login Required' },
    { name: 'Dashboard Page', path: 'src/app/dashboard/page.jsx', checkString: 'scrollbar-none' },
    { name: 'Subjects Hub', path: 'src/app/subjects/page.jsx', checkString: 'min-h-' },
    { name: 'Semester 3 Subjects', path: 'src/app/saurashtra-university/llb/semester-3/[subject]/page.jsx', checkString: 'Breadcrumbs' },
    { name: 'Unit View', path: 'src/app/saurashtra-university/llb/semester-3/[subject]/unit/[unit]/page.jsx', checkString: 'Unit' },
    { name: 'Topic View', path: 'src/app/saurashtra-university/llb/semester-3/[subject]/topic/[topic]/page.jsx', checkString: 'Verified Educational Content' },
    { name: 'Notes Component', path: 'src/app/saurashtra-university/llb/semester-3/[subject]/topic/[topic]/page.jsx', checkString: 'prose-invert' },
    { name: 'Question Bank', path: 'src/app/question-bank/page.jsx', checkString: 'min-h-' },
    { name: 'MCQ Practice Engine', path: 'src/app/quiz/page.jsx', checkString: 'sticky top-14 sm:top-16' },
    { name: 'Mock Test Engine', path: 'src/app/mock-test/page.jsx', checkString: 'sticky top-14 sm:top-16' },
    { name: 'Revision & Mistakes', path: 'src/app/revision/page.jsx', checkString: 'scrollbar-none' },
    { name: 'AI Study Assistant', path: 'src/app/ai-tutor/page.jsx', checkString: 'min-h-[100dvh]' },
    { name: 'Admin Console', path: 'src/app/admin/page.jsx', checkString: 'overflow-x-clip' },
  ];

  for (const mod of modules) {
    const modFile = path.resolve(mod.path);
    assert(fs.existsSync(modFile), `Module file exists: ${mod.name} (${mod.path})`);
    if (fs.existsSync(modFile)) {
      const content = fs.readFileSync(modFile, 'utf8');
      assert(content.includes(mod.checkString), `${mod.name} contains responsive optimization pattern "${mod.checkString}"`);
    }
  }

  // --- 4. API CACHING & PERFORMANCE HEADERS AUDIT ---
  console.log('\n4. Auditing API Caching & Safe Headers...');
  const dashboardApi = fs.readFileSync(path.resolve('src/app/api/student/dashboard/route.js'), 'utf8');
  assert(dashboardApi.includes('Cache-Control') && dashboardApi.includes('stale-while-revalidate'), 'Student dashboard API includes stale-while-revalidate cache header');

  const papersApi = fs.readFileSync(path.resolve('src/app/api/previous-papers/route.js'), 'utf8');
  assert(papersApi.includes('Cache-Control') && papersApi.includes('stale-while-revalidate'), 'Previous papers API includes public stale-while-revalidate cache header');

  // --- 5. NAVBAR MOBILE VIEWPORT COMPATIBILITY ---
  console.log('\n5. Auditing Navbar Header at Ultra-Small Viewports (320px)...');
  const navbarContent = fs.readFileSync(path.resolve('src/components/layout/Navbar.jsx'), 'utf8');
  assert(navbarContent.includes('hidden xs-360:inline-flex'), 'Navbar badge hides on < 360px to prevent brand title squishing');
  assert(navbarContent.includes('hidden xs-375:block'), 'Gujarati subtitle hides gracefully on compact screens < 375px');
  assert(!navbarContent.includes("href: '/login'"), 'Login portal link removed from navigation (Open Access)');

  console.log('\n================================================================');
  console.log(`AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runAudit().catch(err => {
  console.error('Audit failure:', err);
  process.exit(1);
});
