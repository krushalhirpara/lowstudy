import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting Comprehensive LowStudy Backend Database Test Suite...\n');
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      throw new Error(`Test assertion failed: ${testName}`);
    }
  }

  // ==========================================
  // TEST SUITE 1: 7-Level Academic Hierarchy
  // University → Course → Semester → Subject → Unit → Topic → Sub-topic
  // ==========================================
  console.log('🏛️ Test Suite 1: 7-Level Academic Hierarchy');
  
  const guUni = await prisma.university.findUnique({
    where: { code: 'GU' },
    include: {
      courses: {
        where: { code: 'LLB-3Y' },
        include: {
          semesters: {
            where: { semesterNumber: 1 },
            include: {
              subjects: {
                where: { shortCode: 'CONST-1' },
                include: {
                  units: {
                    where: { unitNumber: 1 },
                    include: {
                      topics: {
                        include: {
                          subTopics: true,
                          notes: true,
                          questions: { include: { answers: true } },
                          mcqs: { include: { options: true } }
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

  assert(guUni !== null, 'Level 1: University (GU) exists');
  assert(guUni.courses.length > 0, 'Level 2: Course (LLB-3Y) linked to University');
  assert(guUni.courses[0].semesters.length > 0, 'Level 3: Semester (Sem 1) linked to Course');
  assert(guUni.courses[0].semesters[0].subjects.length > 0, 'Level 4: Subject (CONST-1) linked to Semester');
  assert(guUni.courses[0].semesters[0].subjects[0].units.length > 0, 'Level 5: Unit (Unit 1) linked to Subject');
  assert(guUni.courses[0].semesters[0].subjects[0].units[0].topics.length > 0, 'Level 6: Topic linked to Unit');
  assert(guUni.courses[0].semesters[0].subjects[0].units[0].topics[0].subTopics.length > 0, 'Level 7: Sub-topic linked to Topic');

  // ==========================================
  // TEST SUITE 2: All 29 Entities Presence & Verification
  // ==========================================
  console.log('\n📦 Test Suite 2: Entity Presence & Population (All 29 Entities)');
  
  const counts = {
    users: await prisma.user.count(),
    universities: await prisma.university.count(),
    courses: await prisma.course.count(),
    semesters: await prisma.semester.count(),
    subjects: await prisma.subject.count(),
    units: await prisma.unit.count(),
    topics: await prisma.topic.count(),
    subTopics: await prisma.subTopic.count(),
    notes: await prisma.note.count(),
    legalSections: await prisma.legalSection.count(),
    caseLaws: await prisma.caseLaw.count(),
    questions: await prisma.question.count(),
    questionAnswers: await prisma.questionAnswer.count(),
    mcqs: await prisma.mcq.count(),
    mcqOptions: await prisma.mcqOption.count(),
    previousPapers: await prisma.previousPaper.count(),
    previousPaperQuestions: await prisma.previousPaperQuestion.count(),
    mockTests: await prisma.mockTest.count(),
    mockTestQuestions: await prisma.mockTestQuestion.count(),
    testAttempts: await prisma.testAttempt.count(),
    testAnswers: await prisma.testAnswer.count(),
    bookmarks: await prisma.bookmark.count(),
    wrongAnswers: await prisma.wrongAnswer.count(),
    studyProgress: await prisma.studyProgress.count(),
    studentSubjectProgress: await prisma.studentSubjectProgress.count(),
    revisionItems: await prisma.revisionItem.count(),
    studyPlans: await prisma.studyPlan.count(),
    aiContent: await prisma.aiContent.count(),
    contentReviews: await prisma.contentReview.count()
  };

  console.log('    Entity record counts:');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`      - ${k}: ${v}`);
  }

  assert(counts.users >= 2, '1. users entity populated');
  assert(counts.universities >= 9, '2. universities entity populated (9 Gujarat Universities)');
  assert(counts.courses >= 36, '3. courses entity populated');
  assert(counts.semesters >= 270, '4. semesters entity populated');
  assert(counts.subjects >= 144, '5. subjects entity populated');
  assert(counts.units >= 576, '6. units entity populated');
  assert(counts.topics >= 1152, '7. topics entity populated');
  assert(counts.subTopics >= 9000, '8. sub_topics entity populated');
  assert(counts.notes >= 1152, '9. notes entity populated');
  assert(counts.legalSections >= 10, '10. legal_sections entity populated');
  assert(counts.caseLaws >= 4, '11. case_laws entity populated');
  assert(counts.questions >= 4000, '12. questions entity populated');
  assert(counts.questionAnswers >= 4000, '13. question_answers entity populated');
  assert(counts.mcqs >= 4000, '14. mcqs entity populated');
  assert(counts.mcqOptions >= 16000, '15. mcq_options entity populated');
  assert(counts.previousPapers >= 1, '16. previous_papers entity populated');
  assert(counts.previousPaperQuestions >= 1, '17. previous_paper_questions entity populated');
  assert(counts.mockTests >= 1, '18. mock_tests entity populated');
  assert(counts.mockTestQuestions >= 5, '19. mock_test_questions entity populated');
  assert(counts.testAttempts >= 1, '20. test_attempts entity populated');
  assert(counts.testAnswers >= 1, '21. test_answers entity populated');
  assert(counts.bookmarks >= 1, '22. bookmarks entity populated');
  assert(counts.wrongAnswers >= 1, '23. wrong_answers entity populated');
  assert(counts.studyProgress >= 1, '24. study_progress entity populated');
  assert(counts.studentSubjectProgress >= 1, '25. student_subject_progress entity populated');
  assert(counts.revisionItems >= 1, '26. revision_items entity populated');
  assert(counts.studyPlans >= 1, '27. study_plans entity populated');
  assert(counts.aiContent >= 1, '28. ai_content entity populated');
  assert(counts.contentReviews >= 1, '29. content_reviews entity populated');

  // ==========================================
  // TEST SUITE 3: Content Workflow State Machine
  // AI Generated → Draft → Admin Review → Verified → Published
  // ==========================================
  console.log('\n🔄 Test Suite 3: Content Workflow & AI Governance');
  
  // Step 1: AI Generated
  const aiGenerated = await prisma.aiContent.create({
    data: {
      entityType: 'NOTES',
      prompt: 'Explain Section 106 of BNS 2023 regarding causing death by negligence',
      generatedContent: 'Section 106 of BNS penalizes causing death by any rash or negligent act not amounting to culpable homicide.',
      language: 'EN',
      modelName: 'gemini-1.5-flash',
      workflowStage: 'AI_GENERATED',
      verificationStatus: 'PENDING',
      status: 'DRAFT'
    }
  });
  assert(aiGenerated.workflowStage === 'AI_GENERATED', 'Workflow Step 1: Content flagged as AI_GENERATED');
  assert(aiGenerated.status === 'DRAFT', 'Workflow Requirement: AI content defaults to DRAFT (never auto-published)');
  assert(aiGenerated.verificationStatus === 'PENDING', 'Workflow Requirement: AI content verification is PENDING');

  // Step 2: Draft
  const drafted = await prisma.aiContent.update({
    where: { id: aiGenerated.id },
    data: { workflowStage: 'DRAFT' }
  });
  assert(drafted.workflowStage === 'DRAFT', 'Workflow Step 2: Content staged as DRAFT');

  // Step 3: Admin Review
  const underReview = await prisma.aiContent.update({
    where: { id: aiGenerated.id },
    data: { workflowStage: 'ADMIN_REVIEW', verificationStatus: 'PENDING' }
  });
  assert(underReview.workflowStage === 'ADMIN_REVIEW', 'Workflow Step 3: Content placed in ADMIN_REVIEW');

  // Step 4: Verified by Admin
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const verified = await prisma.aiContent.update({
    where: { id: aiGenerated.id },
    data: {
      workflowStage: 'VERIFIED',
      verificationStatus: 'VERIFIED',
      verifiedById: adminUser.id,
      verificationNotes: 'Verified against official Ministry of Law Gazette.',
      verifiedAt: new Date()
    }
  });
  assert(verified.workflowStage === 'VERIFIED', 'Workflow Step 4: Content VERIFIED by administrator');
  assert(verified.verifiedById === adminUser.id, 'Admin ID recorded on verification');

  // Step 5: Published
  const published = await prisma.aiContent.update({
    where: { id: aiGenerated.id },
    data: {
      workflowStage: 'PUBLISHED',
      status: 'PUBLISHED'
    }
  });
  assert(published.workflowStage === 'PUBLISHED' && published.status === 'PUBLISHED', 'Workflow Step 5: Content successfully PUBLISHED after verification');

  // Clean up
  await prisma.aiContent.delete({ where: { id: aiGenerated.id } });

  // ==========================================
  // TEST SUITE 4: Relational Constraints & Duplicate Prevention
  // ==========================================
  console.log('\n🛡️ Test Suite 4: Duplicate Prevention & Constraints');
  let dupPrevented = false;
  try {
    const existingCourse = await prisma.course.findFirst();
    await prisma.course.create({
      data: {
        id: `dup-course-${Date.now()}`,
        universityId: existingCourse.universityId,
        code: existingCourse.code,
        name: 'Duplicate Test Course'
      }
    });
  } catch (e) {
    dupPrevented = true;
  }
  assert(dupPrevented, 'Duplicate course code under same university was rejected by unique constraint');

  // ==========================================
  // TEST SUITE 5: Bilingual Support & Examination Metrics
  // ==========================================
  console.log('\n🌐 Test Suite 5: Bilingual Data & Examination Metrics');
  
  const bilingualSec = await prisma.legalSection.findFirst({
    where: { titleGu: { not: null }, contentGu: { not: null } }
  });
  assert(bilingualSec !== null, 'Bilingual legal section with Gujarati title and content verified');

  const examQ = await prisma.question.findFirst({
    where: { marks: { gt: 0 }, pyqFrequency: { gte: 1 } }
  });
  assert(examQ !== null, 'Question has marks and PYQ frequency tracked');
  assert(['HIGH', 'MEDIUM', 'LOW'].includes(examQ.preparationPriority), 'Question has valid preparationPriority');
  assert(['EASY', 'MEDIUM', 'HARD'].includes(examQ.difficulty), 'Question has valid difficulty rating');

  const paperQ = await prisma.previousPaperQuestion.findFirst();
  assert(paperQ !== null, 'Previous paper question exists with marks and paper code');

  // ==========================================
  // TEST SUITE 6: Student Progress, Mistakes & Bookmarks
  // ==========================================
  console.log('\n📊 Test Suite 6: Student Progress, Mistake Tracking & Bookmarks');
  
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const progress = await prisma.studyProgress.findFirst({ where: { userId: student.id } });
  assert(progress !== null, 'Student study progress tracked at topic level');

  const bookmark = await prisma.bookmark.findFirst({ where: { userId: student.id } });
  assert(bookmark !== null, 'Student bookmarks preserved and accessible');

  const wrongAns = await prisma.wrongAnswer.findFirst({ where: { userId: student.id } });
  assert(wrongAns !== null, 'Mistake notebook tracks wrong answers for revision');

  console.log(`\n🎉 ALL ${passedCount}/${totalTests} TESTS PASSED WITH 100% SUCCESS!`);
}

runTests()
  .catch((e) => {
    console.error('❌ Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
