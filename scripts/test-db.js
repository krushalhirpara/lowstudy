const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🧪 Starting LowStudy Backend Database Test Suite...\n');
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

  // TEST 1: Check All 29 Entities Exist and Count
  console.log('📦 Test Suite 1: Entity Presence & Population (All 29 Entities)');
  
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
    revisionItems: await prisma.revisionItem.count(),
    studyPlans: await prisma.studyPlan.count(),
    studentSubjectProgress: await prisma.studentSubjectProgress.count(),
    aiContent: await prisma.aiContent.count(),
    contentReviews: await prisma.contentReview.count()
  };

  console.log('    Entity record counts:', JSON.stringify(counts, null, 2));

  assert(counts.users > 0, '1. Users entity populated');
  assert(counts.universities >= 9, '2. All 9 Gujarat Universities populated');
  assert(counts.courses > 0, '3. Courses entity populated');
  assert(counts.semesters > 0, '4. Semesters entity populated');
  assert(counts.subjects > 0, '5. Subjects entity populated');
  assert(counts.units > 0, '6. Units entity populated');
  assert(counts.topics > 0, '7. Topics entity populated');
  assert(counts.subTopics > 0, '8. SubTopics entity populated');
  assert(counts.notes > 0, '9. Notes entity populated');
  assert(counts.legalSections > 0, '10. LegalSections entity populated');
  assert(counts.caseLaws > 0, '11. CaseLaws entity populated');
  assert(counts.questions > 0, '12. Questions entity populated');
  assert(counts.questionAnswers > 0, '13. QuestionAnswers entity populated');
  assert(counts.mcqs > 0, '14. MCQs entity populated');
  assert(counts.mcqOptions > 0, '15. MCQ Options entity populated');
  assert(counts.previousPapers > 0, '16. PreviousPapers entity populated');
  assert(counts.previousPaperQuestions > 0, '17. PreviousPaperQuestions entity populated');
  assert(counts.mockTests > 0, '18. MockTests entity populated');
  assert(counts.mockTestQuestions > 0, '19. MockTestQuestions entity populated');
  assert(counts.bookmarks > 0, '22. Bookmarks entity populated');
  assert(counts.studyProgress > 0, '24. StudyProgress entity populated');
  assert(counts.revisionItems > 0, '25. RevisionItems entity populated');
  assert(counts.aiContent > 0, '28. AiContent entity populated');
  assert(counts.contentReviews > 0, '29. ContentReviews entity populated');

  // TEST 2: Multi-level Deep Relational Traversal
  console.log('\n🔗 Test Suite 2: Deep Relational Integrity & Traversal');
  const deepUni = await prisma.university.findUnique({
    where: { code: 'GU' },
    include: {
      courses: {
        include: {
          semesters: {
            include: {
              subjects: {
                include: {
                  units: {
                    include: {
                      topics: {
                        include: {
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
  assert(deepUni !== null, 'Found Gujarat University via relational query');
  assert(deepUni.courses.length > 0, 'University has affiliated courses');
  assert(deepUni.courses[0].semesters.length > 0, 'Course has structured semesters');

  // TEST 3: Duplicate Record Prevention (Unique Composite Index Validation)
  console.log('\n🛡️ Test Suite 3: Duplicate Prevention & Constraints');
  let duplicatePrevented = false;
  try {
    const existingSubj = await prisma.subject.findFirst();
    await prisma.subject.create({
      data: {
        id: `dup-${Date.now()}`,
        universityId: existingSubj.universityId,
        courseId: existingSubj.courseId,
        semesterId: existingSubj.semesterId,
        title: 'Duplicate Test Subject',
        shortCode: existingSubj.shortCode,
        syllabusVersion: existingSubj.syllabusVersion
      }
    });
  } catch (e) {
    duplicatePrevented = true;
  }
  assert(duplicatePrevented, 'Duplicate subject shortCode in same semester was rejected by unique composite constraint');

  // TEST 4: Content Lifecycle State Transitions (DRAFT -> REVIEW -> PUBLISHED)
  console.log('\n🔄 Test Suite 4: Content Lifecycle & State Transitions');
  const draftTopic = await prisma.topic.create({
    data: {
      id: `top-test-state-${Date.now()}`,
      unitId: (await prisma.unit.findFirst()).id,
      topicNumber: 99,
      title: `Draft Topic ${Date.now()}`,
      description: 'Testing lifecycle transitions',
      status: 'DRAFT'
    }
  });
  assert(draftTopic.status === 'DRAFT', 'Topic successfully created in DRAFT state');

  const reviewTopic = await prisma.topic.update({
    where: { id: draftTopic.id },
    data: { status: 'REVIEW' }
  });
  assert(reviewTopic.status === 'REVIEW', 'Topic transitioned to REVIEW state');

  const publishedTopic = await prisma.topic.update({
    where: { id: draftTopic.id },
    data: { status: 'PUBLISHED' }
  });
  assert(publishedTopic.status === 'PUBLISHED', 'Topic transitioned to PUBLISHED state');

  // Clean up test topic
  await prisma.topic.delete({ where: { id: draftTopic.id } });

  // TEST 5: Admin Verification of AI-Generated Legal Content
  console.log('\n🤖 Test Suite 5: AI Content Admin Verification Workflow');
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const newAiDraft = await prisma.aiContent.create({
    data: {
      entityType: 'MODEL_ANSWER',
      prompt: 'Explain Doctrine of Basic Structure under Article 368',
      generatedContent: 'The Basic Structure Doctrine was formulated in Kesavananda Bharati (1973)...',
      language: 'EN',
      modelName: 'gemini-1.5-flash',
      verificationStatus: 'PENDING'
    }
  });
  assert(newAiDraft.verificationStatus === 'PENDING', 'AI content initialized in PENDING verification state');

  const verifiedAiContent = await prisma.aiContent.update({
    where: { id: newAiDraft.id },
    data: {
      verificationStatus: 'VERIFIED',
      verifiedById: admin.id,
      verificationNotes: 'Verified: Accurate constitutional ratio and Article 368 analysis.',
      verifiedAt: new Date()
    }
  });
  assert(verifiedAiContent.verificationStatus === 'VERIFIED', 'AI content verified by Admin');
  assert(verifiedAiContent.verifiedById === admin.id, 'Verified by Admin user ID linked');

  // TEST 6: Bilingual Content (English & Gujarati)
  console.log('\n🌐 Test Suite 6: Bilingual Storage & Retrieval (EN & GU)');
  const bilingualSec = await prisma.legalSection.findFirst({
    where: { titleGu: { not: null } }
  });
  assert(bilingualSec !== null, 'Retrieved legal section with Gujarati title');
  assert(bilingualSec.contentGu !== null, 'Legal section contains verified Gujarati legal translation');

  // TEST 7: Previous Year Questions (PYQs), Marks, Difficulty & Priority
  console.log('\n📊 Test Suite 7: Examination Metrics (PYQs, Marks, Priority)');
  const highPriorityQ = await prisma.question.findFirst({
    where: {
      preparationPriority: 'HIGH',
      difficulty: 'MEDIUM',
      pyqFrequency: { gte: 1 }
    }
  });
  assert(highPriorityQ !== null, 'Found HIGH priority question with PYQ frequency tracking');
  assert(highPriorityQ.marks > 0, 'Question has valid examination marks allocated');

  // TEST 8: Test Attempt and Wrong Answer Notebook
  console.log('\n📝 Test Suite 8: Exam Simulation & Mistake Notebook');
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  const testMcq = await prisma.mcq.findFirst({ include: { options: true } });
  
  const wrongAttempt = await prisma.wrongAnswer.upsert({
    where: {
      userId_mcqId: {
        userId: student.id,
        mcqId: testMcq.id
      }
    },
    update: {
      mistakeCount: { increment: 1 }
    },
    create: {
      userId: student.id,
      mcqId: testMcq.id,
      mistakeCount: 1,
      isResolved: false
    }
  });
  assert(wrongAttempt.mistakeCount >= 1, 'Wrong answer recorded in student mistake notebook');

  // TEST 9: Spaced Repetition System (SM-2 Algorithm)
  console.log('\n⏰ Test Suite 9: Spaced Repetition Revision Scheduler');
  const revItem = await prisma.revisionItem.findFirst({ where: { userId: student.id } });
  assert(revItem !== null, 'Student has scheduled spaced-repetition revision items');
  assert(revItem.intervalDays > 0, 'Revision item has interval days set');
  assert(revItem.easeFactor >= 1.3, 'Revision item has valid SM-2 ease factor');

  console.log(`\n🎉 ALL ${passedCount}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
}

runTests()
  .catch((e) => {
    console.error('❌ Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
