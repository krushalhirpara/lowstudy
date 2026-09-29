import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '../data/gujaratData.js';
import { ALL_SYLLABUS_SUBJECTS } from '../data/syllabusData.js';
import { SUBJECTS_DATA } from '../data/legalData.js';
import { SU_SEM3_SUBJECT_MAP, slugify } from '../lib/services/seoDataService.js';
import prisma from '../lib/prisma.js';

/**
 * Dynamic XML Sitemap Generator for Next.js App Router
 * URL: https://lowstudy.com/sitemap.xml
 */
export default async function sitemap() {
  const baseUrl = 'https://lowstudy.com';
  const currentDate = new Date().toISOString();

  // 1. Core Public Static Hub Pages
  const staticRoutes = [
    '',
    '/universities',
    '/colleges',
    '/gujarat-law-colleges',
    '/subjects',
    '/bare-acts',
    '/case-laws',
    '/bns-vs-ipc',
    '/quiz',
    '/mock-test',
    '/dictionary',
    '/ai-tutor',
    '/career',
    '/pricing',
    '/tools',
    '/blog',
    '/previous-papers',
    '/question-bank',
    '/revision',
    '/study-plan',
    '/practice-writing',
    '/exam-mode',
    '/curriculum',
    '/syllabus/history',
    '/academic',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.85,
  }));

  // 2. Saurashtra University Complete Technical SEO Hierarchy
  const suBaseRoutes = [
    {
      url: `${baseUrl}/saurashtra-university/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/saurashtra-university/llb/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
    {
      url: `${baseUrl}/saurashtra-university/llb/semester-3/`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.90,
    },
  ];

  // Subject, Unit, and Topic routes for Saurashtra University LL.B. Sem 3
  const suSubjectRoutes = [];
  const suUnitRoutes = [];
  const suTopicRoutes = [];

  try {
    const sem3Subjects = await prisma.subject.findMany({
      where: { semesterId: 'su-llb-3yr-sem3', isActive: true },
      include: {
        units: {
          orderBy: { unitNumber: 'asc' },
          include: {
            topics: {
              where: { status: 'PUBLISHED' },
              orderBy: { topicNumber: 'asc' },
            },
          },
        },
      },
    });

    for (const sub of sem3Subjects) {
      const subjectMapping = Object.values(SU_SEM3_SUBJECT_MAP).find(
        (m) => m.id === sub.id || m.code === sub.shortCode
      );
      const subjectSlug = subjectMapping ? subjectMapping.canonicalSlug : slugify(sub.title);

      suSubjectRoutes.push({
        url: `${baseUrl}/saurashtra-university/llb/semester-3/${subjectSlug}/`,
        lastModified: sub.updatedAt?.toISOString() || currentDate,
        changeFrequency: 'weekly',
        priority: 0.85,
      });

      for (const unit of sub.units) {
        const unitSlug = `unit-${unit.unitNumber}`;
        suUnitRoutes.push({
          url: `${baseUrl}/saurashtra-university/llb/semester-3/${subjectSlug}/unit/${unitSlug}/`,
          lastModified: unit.updatedAt?.toISOString() || currentDate,
          changeFrequency: 'weekly',
          priority: 0.80,
        });

        for (const topic of unit.topics) {
          const topicSlug = slugify(topic.title);
          suTopicRoutes.push({
            url: `${baseUrl}/saurashtra-university/llb/semester-3/${subjectSlug}/topic/${topicSlug}/`,
            lastModified: topic.updatedAt?.toISOString() || currentDate,
            changeFrequency: 'weekly',
            priority: 0.85,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error querying Saurashtra University sitemap data:', err);
  }

  // 3. Gujarat University Detail Pages
  const universityRoutes = GUJARAT_UNIVERSITIES.map((uni) => ({
    url: `${baseUrl}/universities/${uni.id}`,
    lastModified: uni.lastVerified || currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 4. Affiliated Gujarat Law College Detail Pages
  const collegeRoutes = GUJARAT_COLLEGES.map((college) => ({
    url: `${baseUrl}/colleges/${college.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // 5. Subject Detail Pages (General LL.B. Subjects)
  const subjectIds = Array.from(new Set([
    ...SUBJECTS_DATA.map(s => s.id),
    ...ALL_SYLLABUS_SUBJECTS.map(s => s.id)
  ]));

  const generalSubjectRoutes = subjectIds.map((subId) => ({
    url: `${baseUrl}/subjects/${subId}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 6. BNS Specific Topic Pages
  const bnsTopics = ['murder', 'cheating', 'criminal-conspiracy', 'defamation', 'theft', 'robbery'];
  const bnsRoutes = bnsTopics.map((topic) => ({
    url: `${baseUrl}/bns/${topic}`,
    lastModified: currentDate,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 7. Law Blog & Exam Preparation Articles
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
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...suBaseRoutes,
    ...suSubjectRoutes,
    ...suUnitRoutes,
    ...suTopicRoutes,
    ...universityRoutes,
    ...collegeRoutes,
    ...generalSubjectRoutes,
    ...bnsRoutes,
    ...blogRoutes,
  ];
}
