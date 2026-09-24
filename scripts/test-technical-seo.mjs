import { 
  getUniversityData, 
  getCourseData, 
  getSemesterData, 
  getSubjectData, 
  getUnitData, 
  getTopicData,
  generateUniversitySchema,
  generateCourseSchema,
  generateSemesterSchema,
  generateSubjectSchema,
  generateUnitSchema,
  generateTopicSchema,
  SU_SEM3_SUBJECT_MAP,
  SITE_URL,
  slugify
} from '../src/lib/services/seoDataService.js';
import sitemapGenerator from '../src/app/sitemap.js';
import robotsGenerator from '../src/app/robots.js';
import prisma from '../src/lib/prisma.js';

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

async function runTests() {
  console.log('====================================================');
  console.log('TECHNICAL SEO COMPREHENSIVE VERIFICATION SUITE');
  console.log('====================================================\n');

  // Test 1: University Level SEO & Schema
  console.log('Test 1: University Level (/saurashtra-university/)');
  const uni = await getUniversityData();
  assert(uni.name === 'Saurashtra University', 'University name is Saurashtra University');
  assert(uni.canonicalUrl === `${SITE_URL}/saurashtra-university/`, 'Canonical URL is exact match');
  assert(uni.city === 'Rajkot' && uni.state === 'Gujarat', 'Location is Rajkot, Gujarat');
  assert(uni.establishedYear === 1967, 'Established year is 1967');

  const uniSchema = generateUniversitySchema(uni);
  assert(uniSchema['@type'] === 'CollegeOrUniversity', 'Schema @type is CollegeOrUniversity');
  assert(uniSchema.address?.addressLocality === 'Rajkot', 'Schema PostalAddress is valid');
  assert(uniSchema.url === `${SITE_URL}/saurashtra-university/`, 'Schema URL is canonical');

  // Test 2: Course Level SEO & Schema
  console.log('\nTest 2: Course Level (/saurashtra-university/llb/)');
  const course = await getCourseData('llb');
  assert(course.name.includes('Bachelor of Laws'), 'Course name is Bachelor of Laws (LL.B.)');
  assert(course.canonicalUrl === `${SITE_URL}/saurashtra-university/llb/`, 'Canonical URL is /saurashtra-university/llb/');
  assert(course.durationYears === 3 && course.totalSemesters === 6, 'Course duration is 3 years, 6 semesters');

  const courseSchema = generateCourseSchema(course);
  assert(courseSchema['@type'] === 'Course', 'Schema @type is Course');
  assert(courseSchema.timeRequired === 'P3Y', 'Schema duration is ISO P3Y');

  // Test 3: Semester Level SEO & Schema
  console.log('\nTest 3: Semester Level (/saurashtra-university/llb/semester-3/)');
  const sem3 = await getSemesterData(3);
  assert(sem3.semesterNumber === 3, 'Semester number is 3');
  assert(sem3.canonicalUrl === `${SITE_URL}/saurashtra-university/llb/semester-3/`, 'Canonical URL matches specification');
  assert(sem3.subjects.length === 5, 'Semester 3 has all 5 core law subjects');
  assert(sem3.totalCredits >= 20, `Semester 3 total credits equal ${sem3.totalCredits} (>= 20)`);

  const semSchema = generateSemesterSchema(sem3);
  assert(semSchema['@type'] === 'EducationalWebPage', 'Schema @type is EducationalWebPage');
  assert(semSchema.about?.name.includes('Semester 3'), 'Schema describes Semester 3');

  // Test 4: Subject Level SEO & Schema (All 5 subjects)
  console.log('\nTest 4: Subject Level (/saurashtra-university/llb/semester-3/[subject]/)');
  const expectedSubjectSlugs = [
    'labour-and-industrial-law-1',
    'labour-and-industrial-law-2',
    'principles-of-taxation-laws',
    'principal-of-banking-laws',
    'information-technology-laws-and-cyber-crimes'
  ];

  for (const slug of expectedSubjectSlugs) {
    const sub = await getSubjectData(slug);
    assert(sub !== null, `Subject "${slug}" resolved successfully`);
    assert(sub.canonicalUrl === `${SITE_URL}/saurashtra-university/llb/semester-3/${slug}/`, `Subject "${slug}" has correct canonical URL`);
    assert(sub.units.length === 4, `Subject "${slug}" contains exactly 4 units`);
    assert(sub.credits >= 4, `Subject "${slug}" has ${sub.credits} credits (>= 4)`);

    const subSchema = generateSubjectSchema(sub);
    assert(subSchema['@type'] === 'Course', `Subject "${slug}" schema is Course`);
    assert(subSchema.numberOfCredits >= 4, `Subject "${slug}" schema credits is ${subSchema.numberOfCredits}`);
  }

  // Test 5: Unit Level SEO & Schema
  console.log('\nTest 5: Unit Level (/saurashtra-university/llb/semester-3/[subject]/unit/[unit]/)');
  const sampleUnit = await getUnitData('labour-and-industrial-law-1', 'unit-1');
  assert(sampleUnit !== null, 'Unit 1 for Labour Law 1 resolved successfully');
  assert(sampleUnit.unitNumber === 1, 'Unit number is 1');
  assert(sampleUnit.canonicalUrl === `${SITE_URL}/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/unit/unit-1/`, 'Unit canonical URL matches specification');
  assert(sampleUnit.topics.length > 0, `Unit 1 contains ${sampleUnit.topics.length} topics`);

  const unitSchema = generateUnitSchema(sampleUnit);
  assert(unitSchema['@type'] === 'LearningResource', 'Unit schema is LearningResource');
  assert(unitSchema.isPartOf?.['@type'] === 'Course', 'Unit isPartOf links to Course');

  // Test 6: Topic Level SEO, Schema & ZERO THIN PAGES Verification
  console.log('\nTest 6: Topic Level Educational Content & Zero Thin Content');
  let testedTopicCount = 0;
  let wordCountViolations = 0;

  for (const slug of expectedSubjectSlugs) {
    const sub = await getSubjectData(slug);
    for (const unit of sub.units) {
      for (const topicBrief of unit.topics) {
        testedTopicCount++;
        const topic = await getTopicData(slug, topicBrief.slug);
        
        assert(topic !== null, `Topic "${topicBrief.title.slice(0, 30)}..." loaded`);
        assert(topic.canonicalUrl.includes('/topic/'), `Topic canonical URL includes /topic/`);

        // Content density verification
        const simpleNotesLen = topic.primaryNote?.simpleNotes?.length || 0;
        const detailedNotesLen = topic.primaryNote?.detailedNotes?.length || 0;
        const answerTextLen = topic.enrichedQuestions?.[0]?.answer?.detailedExplanation?.length || 0;
        const totalContentLength = simpleNotesLen + detailedNotesLen + answerTextLen;

        // Ensure rich educational content (at least 300 characters of substantive legal notes)
        if (totalContentLength < 300) {
          wordCountViolations++;
          console.error(`  THIN CONTENT DETECTED on topic: ${topic.title} (Len: ${totalContentLength})`);
        }

        // Check schema on a sample of topics
        if (testedTopicCount <= 3) {
          const topicSchemas = generateTopicSchema(topic);
          assert(topicSchemas.length >= 1, `Topic has at least 1 schema object`);
          assert(topicSchemas[0]['@type'] === 'Article', `Topic primary schema is Article`);
          if (topicSchemas.length > 1) {
            assert(topicSchemas[1]['@type'] === 'FAQPage', `Topic secondary schema is FAQPage`);
          }
        }
      }
    }
  }

  assert(testedTopicCount >= 20, `Verified ${testedTopicCount} topic pages across Semester 3`);
  assert(wordCountViolations === 0, 'Zero thin topic pages confirmed! All topics have rich educational text');

  // Test 7: XML Sitemap Completeness
  console.log('\nTest 7: Dynamic XML Sitemap Verification');
  const sitemapEntries = await sitemapGenerator();
  assert(Array.isArray(sitemapEntries) && sitemapEntries.length > 100, `Sitemap generated ${sitemapEntries.length} total entries`);
  
  const suUrls = sitemapEntries.filter(entry => entry.url.includes('saurashtra-university'));
  assert(suUrls.length >= 100, `Sitemap contains ${suUrls.length} Saurashtra University URLs`);
  
  const hasUni = suUrls.some(e => e.url === `${SITE_URL}/saurashtra-university/`);
  const hasCourse = suUrls.some(e => e.url === `${SITE_URL}/saurashtra-university/llb/`);
  const hasSem = suUrls.some(e => e.url === `${SITE_URL}/saurashtra-university/llb/semester-3/`);
  const hasSubject = suUrls.some(e => e.url === `${SITE_URL}/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/`);
  const hasUnit = suUrls.some(e => e.url === `${SITE_URL}/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/unit/unit-1/`);
  const hasTopic = suUrls.some(e => e.url.includes('/topic/'));

  assert(hasUni, 'Sitemap includes /saurashtra-university/');
  assert(hasCourse, 'Sitemap includes /saurashtra-university/llb/');
  assert(hasSem, 'Sitemap includes /saurashtra-university/llb/semester-3/');
  assert(hasSubject, 'Sitemap includes /saurashtra-university/llb/semester-3/labour-and-industrial-law-1/');
  assert(hasUnit, 'Sitemap includes /saurashtra-university/llb/semester-3/labour-and-industrial-law-1/unit/unit-1/');
  assert(hasTopic, 'Sitemap includes /saurashtra-university/llb/semester-3/.../topic/.../');

  // Test 8: robots.txt Verification
  console.log('\nTest 8: Robots.txt Configuration');
  const robotsConfig = robotsGenerator();
  assert(robotsConfig.rules[0].allow === '/', 'Robots.txt allows root /');
  assert(robotsConfig.sitemap === `${SITE_URL}/sitemap.xml`, 'Robots.txt references sitemap.xml');
  assert(robotsConfig.rules[0].disallow.includes('/admin'), 'Robots.txt protects /admin');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(async (err) => {
  console.error('Fatal test error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
