import prisma from '../src/lib/prisma.js';

async function testAcademicFlow() {
  console.log("=== TESTING STUDENT-FACING ACADEMIC HIERARCHY & ROUTES ===");

  // 1. Test University & Semester resolution
  const university = await prisma.university.findFirst({
    where: { code: 'SU' }
  });
  console.log(`[PASS] University: ${university?.name} (${university?.code})`);

  const course = await prisma.course.findFirst({
    where: { universityId: university.id, code: 'LLB-3Y' }
  });
  console.log(`[PASS] Course: ${course?.name} (${course?.code})`);

  const semester = await prisma.semester.findFirst({
    where: { courseId: course.id, semesterNumber: 3 }
  });
  console.log(`[PASS] Semester: ${semester?.title} (Sem ${semester?.semesterNumber})`);

  // 2. View 1 & 2: Subject Listing
  const subjects = await prisma.subject.findMany({
    where: { semesterId: semester.id },
    orderBy: { shortCode: 'asc' },
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
  });

  console.log(`\n--- View 1 & 2: Semester Dashboard & Subject Listing ---`);
  console.log(`Found ${subjects.length} subjects for Semester 3:`);
  subjects.forEach(s => {
    const totalTopics = s.units.reduce((acc, u) => acc + u.topics.length, 0);
    console.log(` - [${s.shortCode}] ${s.title}: ${s.units.length} units, ${totalTopics} topics, 100 Marks`);
  });

  if (subjects.length !== 5) {
    throw new Error(`Expected 5 subjects, found ${subjects.length}`);
  }

  // 3. View 3 & 4: Subject Detail Page & Unit Listing
  const targetSubject = subjects[0];
  console.log(`\n--- View 3 & 4: Subject Detail Page & Unit Listing for [${targetSubject.shortCode}] ---`);
  console.log(`Subject Name: ${targetSubject.title}`);
  console.log(`Units Count: ${targetSubject.units.length}`);
  targetSubject.units.forEach(u => {
    console.log(`   Unit ${u.unitNumber}: "${u.title}" (${u.topics.length} topics)`);
  });

  // 4. View 5 & 6: Unit Detail Page & Topic Listing
  const targetUnit = targetSubject.units[0];
  console.log(`\n--- View 5 & 6: Unit Detail Page & Topic Listing for Unit ${targetUnit.unitNumber} ---`);
  console.log(`Unit Title: ${targetUnit.title}`);
  console.log(`Topics in Unit: ${targetUnit.topics.length}`);
  targetUnit.topics.forEach(t => {
    console.log(`   Topic ${t.topicNumber}: "${t.title}" (${t.subTopics.length} verified subtopics)`);
  });

  // 5. View 7: Topic Detail Page
  const targetTopic = targetUnit.topics[0];
  console.log(`\n--- View 7: Topic Detail Page for Topic ${targetTopic.topicNumber} ---`);
  console.log(`Topic Title: ${targetTopic.title}`);
  console.log(`Verified Subtopics in DB: ${targetTopic.subTopics.length}`);
  targetTopic.subTopics.forEach(st => {
    console.log(`     #${st.orderIndex}: ${st.title}`);
  });

  // 6. Test StudyProgress & Bookmark mutation simulation
  console.log(`\n--- Testing Student Interaction Simulation (Progress & Bookmarks) ---`);
  const testUserId = 'usr-student-01';
  
  // Upsert progress
  const progressRecord = await prisma.studyProgress.upsert({
    where: {
      userId_topicId: {
        userId: testUserId,
        topicId: targetTopic.id
      }
    },
    update: { isCompleted: true, lastStudiedAt: new Date() },
    create: {
      userId: testUserId,
      topicId: targetTopic.id,
      isCompleted: true,
      lastStudiedAt: new Date(),
      timeSpentSeconds: 120
    }
  });
  console.log(`[PASS] StudyProgress upserted successfully: Topic ${targetTopic.id} -> Completed = ${progressRecord.isCompleted}`);

  // Upsert bookmark
  const bookmarkRecord = await prisma.bookmark.upsert({
    where: {
      userId_entityType_entityId: {
        userId: testUserId,
        entityType: 'TOPIC',
        entityId: targetTopic.id
      }
    },
    update: {},
    create: {
      userId: testUserId,
      entityType: 'TOPIC',
      entityId: targetTopic.id
    }
  });
  console.log(`[PASS] Bookmark upserted successfully: Topic ${targetTopic.id} -> Bookmarked`);

  console.log("\nALL ACADEMIC NAVIGATION AND FLOW DATA TESTS PASSED SUCCESSFULLY!");
}

testAcademicFlow()
  .catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
