import sitemap from '../src/app/sitemap.js';
import robots from '../src/app/robots.js';
import { getCanonicalUrl } from '../src/utils/seo.js';
import { 
  getUniversityData, 
  getCourseData, 
  getSemesterData, 
  getSubjectData, 
  getUnitData, 
  getTopicData 
} from '../src/lib/services/seoDataService.js';

async function runSeoAudit() {
  console.log('🔍 Starting Technical SEO & Indexing Repair Verification...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. SITEMAP AUDIT
  console.log('📄 1. XML Sitemap Audit');
  const sitemapEntries = await sitemap();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 50, `Sitemap generated ${sitemapEntries.length} URLs (expected > 50)`);

  let trailingSlashCount = 0;
  let nonHttpsCount = 0;
  let privateRouteInSitemap = 0;

  for (const entry of sitemapEntries) {
    const url = entry.url;
    // Check non-root trailing slashes
    if (url !== 'https://lowstudy.com' && url.endsWith('/')) {
      trailingSlashCount++;
      console.error(`     Trailing slash found in sitemap: ${url}`);
    }
    if (!url.startsWith('https://lowstudy.com')) {
      nonHttpsCount++;
    }
    if (url.includes('/ceoadmin') || url.includes('/dashboard') || url.includes('/exam-prep/library') || url.includes('/exam-prep/checkout')) {
      privateRouteInSitemap++;
      console.error(`     Private route leaked in sitemap: ${url}`);
    }
  }

  assert(trailingSlashCount === 0, `All sitemap URLs use clean, no-trailing-slash format (Found ${trailingSlashCount} trailing slashes)`);
  assert(nonHttpsCount === 0, `All sitemap URLs use absolute https://lowstudy.com (Found ${nonHttpsCount} non-compliant URLs)`);
  assert(privateRouteInSitemap === 0, `No private/admin routes in sitemap (Found ${privateRouteInSitemap} private URLs)`);

  // 2. ROBOTS.TXT AUDIT
  console.log('\n🤖 2. Robots.txt Audit');
  const robotsConfig = robots();
  assert(robotsConfig.sitemap === 'https://lowstudy.com/sitemap.xml', 'Robots.txt declares sitemap https://lowstudy.com/sitemap.xml');
  assert(robotsConfig.rules[0].disallow.includes('/ceoadmin') || robotsConfig.rules[0].disallow.includes('/ceoadmin/*'), 'Robots disallows /ceoadmin');
  assert(robotsConfig.rules[0].disallow.includes('/dashboard') || robotsConfig.rules[0].disallow.includes('/dashboard/*'), 'Robots disallows /dashboard');
  assert(robotsConfig.rules[0].disallow.includes('/exam-prep/library') || robotsConfig.rules[0].disallow.includes('/exam-prep/library/*'), 'Robots disallows /exam-prep/library');
  assert(robotsConfig.rules[0].allow.includes('/'), 'Robots allows root / for crawling');

  // 3. SAURASHTRA UNIVERSITY SEO HIERARCHY CANONICALS
  console.log('\n🏛️ 3. Saurashtra University Canonical URLs');
  const uni = await getUniversityData();
  assert(uni.canonicalUrl === 'https://lowstudy.com/saurashtra-university', `University canonical: ${uni.canonicalUrl}`);

  const course = await getCourseData('llb');
  assert(course.canonicalUrl === 'https://lowstudy.com/saurashtra-university/llb', `Course canonical: ${course.canonicalUrl}`);

  const sem3 = await getSemesterData(3);
  assert(sem3.canonicalUrl === 'https://lowstudy.com/saurashtra-university/llb/semester-3', `Semester canonical: ${sem3.canonicalUrl}`);

  const subject = await getSubjectData('labour-and-industrial-law-1');
  assert(subject.canonicalUrl === 'https://lowstudy.com/saurashtra-university/llb/semester-3/labour-and-industrial-law-1', `Subject canonical: ${subject.canonicalUrl}`);

  const unit = await getUnitData('labour-and-industrial-law-1', 'unit-1');
  assert(unit.canonicalUrl === 'https://lowstudy.com/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/unit/unit-1', `Unit canonical: ${unit.canonicalUrl}`);

  const topic = await getTopicData('labour-and-industrial-law-1', 'fundamental-concepts-scope-of-unit-1');
  assert(topic.canonicalUrl === 'https://lowstudy.com/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/topic/fundamental-concepts-scope-of-unit-1', `Topic canonical: ${topic.canonicalUrl}`);

  // 4. CANONICAL HELPER UTILITY
  console.log('\n🔗 4. Canonical Helper Utility');
  assert(getCanonicalUrl('') === 'https://lowstudy.com', 'getCanonicalUrl("") -> https://lowstudy.com');
  assert(getCanonicalUrl('/') === 'https://lowstudy.com', 'getCanonicalUrl("/") -> https://lowstudy.com');
  assert(getCanonicalUrl('/exam-prep') === 'https://lowstudy.com/exam-prep', 'getCanonicalUrl("/exam-prep") -> https://lowstudy.com/exam-prep');
  assert(getCanonicalUrl('/saurashtra-university/llb/') === 'https://lowstudy.com/saurashtra-university/llb', 'getCanonicalUrl strips trailing slash');

  console.log('\n==============================================');
  console.log(`🎉 Technical SEO Verification: ${passed} PASSED, ${failed} FAILED`);
  console.log('==============================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSeoAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
