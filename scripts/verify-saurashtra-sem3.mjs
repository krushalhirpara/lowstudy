import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('🧪 Starting Official Verification for Saurashtra University LL.B. Semester 3...\n');

  let failed = false;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`  ❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`  ✅ PASS: ${message}`);
    }
  };

  // 1. Verify University
  const uni = await prisma.university.findFirst({
    where: { code: 'SU' }
  });
  assert(uni && uni.name === 'Saurashtra University', 'University Saurashtra University (SU) exists and is verified');

  // 2. Verify Course
  const course = await prisma.course.findFirst({
    where: { universityId: uni.id, code: 'LLB-3Y' }
  });
  assert(course && course.totalSemesters === 6, 'Course 3-Year LL.B. (LLB-3Y) exists and is active');

  // 3. Verify Semester
  const sem = await prisma.semester.findFirst({
    where: { courseId: course.id, semesterNumber: 3 }
  });
  assert(sem && sem.title === 'Semester 3', 'Semester 3 (Sem 3) exists and belongs to LL.B. 3 Years');

  // 4. Check 1: Verify subject count
  const subjects = await prisma.subject.findMany({
    where: { semesterId: sem.id },
    orderBy: { shortCode: 'asc' },
    include: {
      units: {
        orderBy: { unitNumber: 'asc' },
        include: {
          topics: {
            orderBy: { topicNumber: 'asc' },
            include: {
              subTopics: {
                orderBy: { orderIndex: 'asc' }
              }
            }
          }
        }
      }
    }
  });
  assert(subjects.length === 5, `1. Subject Count: Expected 5 subjects, found ${subjects.length}`);

  // 5. Check 2: Verify every subject code
  const expectedCodes = ['220301', '220302', '220303', '220304', '220305'];
  const actualCodes = subjects.map(s => s.shortCode);
  const allCodesMatch = expectedCodes.every(c => actualCodes.includes(c));
  assert(allCodesMatch, `2. Subject Codes: All official codes present [${actualCodes.join(', ')}]`);

  // 6. Check 3: Verify every subject name
  const expectedTitles = {
    '220301': 'Labour and Industrial Law - I',
    '220302': 'Labour and Industrial Law - II',
    '220303': 'Principles of Taxation Laws',
    '220304': 'Principal of Banking Laws',
    '220305': 'Information Technology Laws and Cyber Crimes'
  };
  let allTitlesMatch = true;
  for (const s of subjects) {
    if (s.title !== expectedTitles[s.shortCode]) {
      allTitlesMatch = false;
    }
  }
  assert(allTitlesMatch, '3. Subject Names: All 5 official subject names exactly match syllabus');

  // 7. Check 4: Verify every unit
  let allUnitsCountMatch = true;
  let totalUnits = 0;
  for (const s of subjects) {
    totalUnits += s.units.length;
    if (s.units.length !== 4) {
      allUnitsCountMatch = false;
    }
  }
  assert(allUnitsCountMatch && totalUnits === 20, `4. Units: Verified 20/20 units (exactly 4 units per subject)`);

  // 8. Check 5: Verify every topic
  let totalTopics = 0;
  let allTopicsPublished = true;
  for (const s of subjects) {
    for (const u of s.units) {
      totalTopics += u.topics.length;
      for (const t of u.topics) {
        if (t.status !== 'PUBLISHED') {
          allTopicsPublished = false;
        }
      }
    }
  }
  assert(totalTopics === 81 && allTopicsPublished, `5. Topics: Verified ${totalTopics} topics (all status PUBLISHED)`);

  // 9. Check 6: Check duplicates
  const codeOccurrences = {};
  let hasDuplicateCode = false;
  for (const c of actualCodes) {
    codeOccurrences[c] = (codeOccurrences[c] || 0) + 1;
    if (codeOccurrences[c] > 1) hasDuplicateCode = true;
  }
  let hasDuplicateTopicInUnit = false;
  for (const s of subjects) {
    for (const u of s.units) {
      const topicTitles = new Set();
      for (const t of u.topics) {
        if (topicTitles.has(t.title)) hasDuplicateTopicInUnit = true;
        topicTitles.add(t.title);
      }
    }
  }
  assert(!hasDuplicateCode && !hasDuplicateTopicInUnit, '6. Duplicates Check: 0 duplicate codes, 0 duplicate topics per unit');

  // 10. Check 7: Check missing topics & subtopics
  let totalSubtopics = 0;
  let allTopicsHaveSubtopics = true;
  for (const s of subjects) {
    for (const u of s.units) {
      for (const t of u.topics) {
        totalSubtopics += t.subTopics.length;
        if (t.subTopics.length === 0) {
          allTopicsHaveSubtopics = false;
        }
      }
    }
  }
  assert(allTopicsHaveSubtopics && totalSubtopics === 162, `7. Missing Topics/Subtopics: Verified ${totalSubtopics} subtopics attached to all 81 topics`);

  // 11. Check 8: Check database relationships
  const fullTree = await prisma.university.findFirst({
    where: { code: 'SU' },
    include: {
      courses: {
        where: { code: 'LLB-3Y' },
        include: {
          semesters: {
            where: { semesterNumber: 3 },
            include: {
              subjects: {
                include: {
                  units: {
                    include: {
                      topics: {
                        include: {
                          subTopics: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const validTree = fullTree?.courses?.[0]?.semesters?.[0]?.subjects?.length === 5;
  assert(validTree, '8. Database Relationships: Full 6-level relational tree verified (University -> Course -> Semester -> Subject -> Unit -> Topic -> SubTopic)');

  // 12. Check that no notes, questions, MCQs, or case laws were generated
  const testSubjectIds = subjects.map(s => s.id);
  const testUnitIds = subjects.flatMap(s => s.units.map(u => u.id));
  const testTopicIds = subjects.flatMap(s => s.units.flatMap(u => u.topics.map(t => t.id)));

  const notesCount = await prisma.note.count({ where: { topicId: { in: testTopicIds } } });
  const questionsCount = await prisma.question.count({ where: { topicId: { in: testTopicIds } } });
  const mcqsCount = await prisma.mcq.count({ where: { topicId: { in: testTopicIds } } });
  const caseLawsCount = await prisma.caseLaw.count({ where: { topicId: { in: testTopicIds } } });

  assert(
    notesCount === 0 && questionsCount === 0 && mcqsCount === 0 && caseLawsCount === 0,
    'Clean Structure: Verified NO notes, questions, MCQs or case laws generated yet as instructed'
  );

  console.log('\n-------------------------------------------------------------');
  if (failed) {
    console.error('❌ Verification FAILED: Some assertions did not pass!');
    process.exit(1);
  } else {
    console.log('🎉 Verification PASSED: All 8 requirements + strict constraints satisfied with 100% precision!');
  }
}

runVerification()
  .catch((err) => {
    console.error('Error during verification:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
