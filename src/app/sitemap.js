import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '@/data/gujaratData';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';
import { SUBJECTS_DATA } from '@/data/legalData';

/**
 * Dynamic XML Sitemap Generator for Next.js App Router
 * URL: https://lowstudy.com/sitemap.xml
 */
export default async function sitemap() {
  const baseUrl = 'https://lowstudy.com';
  const currentDate = new Date().toISOString();

  // 1. Core Public Static Pages
  const staticRoutes = [
    '',
    '/gujarat-law-colleges',
    '/subjects',
    '/bare-acts',
    '/case-laws',
    '/quiz',
    '/dictionary',
    '/ai-tutor',
    '/bns-vs-ipc',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Gujarat University Pages
  const universityRoutes = GUJARAT_UNIVERSITIES.map((uni) => ({
    url: `${baseUrl}/universities/${uni.id}`,
    lastModified: uni.lastVerified || currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Affiliated Gujarat Law College Pages
  const collegeRoutes = GUJARAT_COLLEGES.map((college) => ({
    url: `${baseUrl}/colleges/${college.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 4. Subjects Pages
  const subjectIds = Array.from(new Set([
    ...SUBJECTS_DATA.map(s => s.id),
    ...ALL_SYLLABUS_SUBJECTS.map(s => s.id)
  ]));

  const subjectRoutes = subjectIds.map((subId) => ({
    url: `${baseUrl}/subjects/${subId}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 5. BNS Topic Pages
  const bnsTopics = ['murder', 'cheating', 'criminal-conspiracy', 'defamation', 'theft', 'robbery'];
  const bnsRoutes = bnsTopics.map((topic) => ({
    url: `${baseUrl}/bns/${topic}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 6. Blog Articles
  const blogSlugs = [
    'gujarat-university-llb-exam-preparation-guide',
    'bns-vs-ipc-key-differences-for-law-students',
    'important-constitutional-law-articles-for-exams',
    'bnss-vs-crpc-procedural-law-changes-explained',
  ];
  const blogRoutes = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...universityRoutes,
    ...collegeRoutes,
    ...subjectRoutes,
    ...bnsRoutes,
    ...blogRoutes,
  ];
}
