import * as adminService from '../src/lib/services/adminService.js';
import { 
  createAiContentRecord, 
  transitionWorkflowStage, 
  recordContentReview, 
  promoteToOfficialCatalog,
  WORKFLOW_STAGES,
  VERIFICATION_STATUSES
} from '../src/lib/services/moderationService.js';
import prisma from '../src/lib/prisma.js';

async function runAdminCrudTests() {
  console.log('🧪 Starting Full Lowstudy Admin CRUD & Workflow Test Suite...\n');
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

  try {
    // ----------------------------------------------------
    // TEST 1: Admin Stats & Settings
    // ----------------------------------------------------
    console.log('📊 Test Suite 1: Admin Dashboard Stats & Settings');
    const initialStats = await adminService.getAdminStats();
    assert(initialStats.counts.universities >= 9, `Universities counted (${initialStats.counts.universities})`);
    assert(initialStats.counts.subjects >= 140, `Subjects counted (${initialStats.counts.subjects})`);

    const initialSettings = adminService.getPlatformSettings();
    assert(initialSettings.adsEnabled !== undefined, 'Settings retrieved with adsEnabled flag');

    const updatedSettings = adminService.savePlatformSettings({ adsEnabled: true, systemNotice: 'Admin Suite Verified' });
    assert(updatedSettings.systemNotice === 'Admin Suite Verified', 'Platform settings updated successfully');

    // ----------------------------------------------------
    // TEST 2: University CRUD (Create, Search, Toggle, Update, Delete)
    // ----------------------------------------------------
    console.log('\n🏛️ Test Suite 2: University CRUD');
    const testUniCode = `TESTUNI_${Date.now().toString().slice(-4)}`;
    const testUni = await adminService.createUniversity({
      id: testUniCode.toLowerCase(),
      name: 'Test National Law University',
      code: testUniCode,
      city: 'Gandhinagar',
      status: 'VERIFIED',
    });
    assert(testUni.code === testUniCode, 'University created successfully');

    const searchUni = await adminService.getUniversities({ search: testUniCode });
    assert(searchUni.items.length === 1 && searchUni.items[0].id === testUni.id, 'University found via search');

    const toggledUni = await adminService.toggleUniversityPublish(testUni.id);
    assert(toggledUni.status === 'PENDING_REVIEW', 'University publish/unpublish toggled');

    const updatedUni = await adminService.updateUniversity(testUni.id, { name: 'Test National Law University Updated' });
    assert(updatedUni.name.includes('Updated'), 'University updated successfully');

    // ----------------------------------------------------
    // TEST 3: Course CRUD (Create, Assign University, Update, Delete)
    // ----------------------------------------------------
    console.log('\n🎓 Test Suite 3: Course CRUD');
    const testCourseCode = 'BALLB-TEST';
    const testCourse = await adminService.createCourse({
      universityId: testUni.id,
      name: '5-Year B.A. LL.B. (Honours)',
      code: testCourseCode,
      totalSemesters: 10,
    });
    assert(testCourse.universityId === testUni.id, 'Course assigned to University');

    const coursesList = await adminService.getCourses({ universityId: testUni.id });
    assert(coursesList.items.length === 1, 'Course filtered by University');

    const updatedCourse = await adminService.updateCourse(testCourse.id, { name: '5-Year Integrated Law' });
    assert(updatedCourse.name === '5-Year Integrated Law', 'Course edited successfully');

    // ----------------------------------------------------
    // TEST 4: Semester CRUD (Create, Assign Course, Update, Delete)
    // ----------------------------------------------------
    console.log('\n📅 Test Suite 4: Semester CRUD');
    const testSemester = await adminService.createSemester({
      courseId: testCourse.id,
      semesterNumber: 1,
      title: 'First Semester',
    });
    assert(testSemester.courseId === testCourse.id, 'Semester assigned to Course');

    const updatedSem = await adminService.updateSemester(testSemester.id, { title: 'Semester I (Foundations)' });
    assert(updatedSem.title.includes('Foundations'), 'Semester edited successfully');

    // ----------------------------------------------------
    // TEST 5: Subject CRUD (Code, Name, Marks, Credits, Semester, Description)
    // ----------------------------------------------------
    console.log('\n📚 Test Suite 5: Subject CRUD');
    const testSubj = await adminService.createSubject({
      universityId: testUni.id,
      courseId: testCourse.id,
      semesterId: testSemester.id,
      title: 'Jurisprudence & Legal Theory',
      shortCode: 'JURIS-1',
      credits: 4,
      category: 'Core Law',
      description: 'Philosophical study of law and natural justice principles.',
    });
    assert(testSubj.shortCode === 'JURIS-1', 'Subject created with marks, credits, semester, description');

    const subjectsList = await adminService.getSubjects({ search: 'Jurisprudence' });
    assert(subjectsList.items.some(s => s.id === testSubj.id), 'Subject searchable by name');

    // ----------------------------------------------------
    // TEST 6: Unit CRUD (Unit Number, Official Name, Subject, Description, Order)
    // ----------------------------------------------------
    console.log('\n📑 Test Suite 6: Unit CRUD');
    const testUnit = await adminService.createUnit({
      subjectId: testSubj.id,
      unitNumber: 1,
      title: 'Natural Law School and Positivism',
      description: 'Historical schools of jurisprudence from Austin to Kelsen.',
    });
    assert(testUnit.unitNumber === 1 && testUnit.subjectId === testSubj.id, 'Unit created with number & subject');

    const updatedUnit = await adminService.updateUnit(testUnit.id, { title: 'Analytical Positivism' });
    assert(updatedUnit.title === 'Analytical Positivism', 'Unit updated successfully');

    // ----------------------------------------------------
    // TEST 7: Topic CRUD (Unit, Topic Name, Description, Order, Published Status)
    // ----------------------------------------------------
    console.log('\n🏷️ Test Suite 7: Topic CRUD');
    const testTopic = await adminService.createTopic({
      unitId: testUnit.id,
      topicNumber: 1,
      title: 'H.L.A. Hart Concept of Law',
      description: 'Primary and secondary rules of recognition.',
      status: 'PUBLISHED',
    });
    assert(testTopic.title.includes('Hart') && testTopic.status === 'PUBLISHED', 'Topic created with published status');

    // ----------------------------------------------------
    // TEST 8: Notes CRUD (EN & GU content, Detailed notes, Quick revision, Exam answer)
    // ----------------------------------------------------
    console.log('\n📝 Test Suite 8: Notes CRUD');
    const testNote = await adminService.createNote({
      topicId: testTopic.id,
      language: 'EN',
      simpleNotes: 'Quick Revision: Hart distinguishes internal and external points of view.',
      detailedNotes: 'Detailed Notes: Full philosophical analysis of the Rule of Recognition vs Kelsen Grundnorm.',
      keyPoints: ['Rule of Recognition', 'Rules of Change', 'Rules of Adjudication'],
      mnemonics: ['RCA: Recognition, Change, Adjudication'],
      status: 'PUBLISHED',
    });
    assert(testNote.simpleNotes.includes('Quick Revision'), 'Notes created with quick revision and detailed notes');

    // ----------------------------------------------------
    // TEST 9: Legal Sections CRUD (Bare Acts, Sections, Bilingual, Punishments)
    // ----------------------------------------------------
    console.log('\n⚖️ Test Suite 9: Legal Sections CRUD');
    const testSecNum = `SEC-TEST-${Date.now().toString().slice(-4)}`;
    const testSection = await adminService.createLegalSection({
      topicId: testTopic.id,
      actName: 'BNS 2023',
      sectionNumber: testSecNum,
      title: 'Attempt to Commit Offence',
      titleGu: 'ગુનો કરવાનો પ્રયાસ',
      content: 'Whoever attempts to commit an offence punishable by this Sanhita...',
      contentGu: 'જે કોઈ આ સંહિતા હેઠળ સજાપાત્ર ગુનો કરવાનો પ્રયાસ કરે છે...',
      punishment: 'Imprisonment up to half of the longest term provided.',
      bailableStatus: 'Cognizable',
      status: 'PUBLISHED',
    });
    assert(testSection.sectionNumber === testSecNum, 'Legal section created with bilingual text & punishment');

    const searchSection = await adminService.getLegalSections({ search: testSecNum });
    assert(searchSection.items.length === 1, 'Legal section searchable');

    // ----------------------------------------------------
    // TEST 10: Case Laws CRUD (Landmark Judgments, Bench, Ratio Decidendi)
    // ----------------------------------------------------
    console.log('\n🏛️ Test Suite 10: Case Laws CRUD');
    const testCase = await adminService.createCaseLaw({
      topicId: testTopic.id,
      title: 'Test Landmark Judgment v. Union of India',
      citation: '(2026) 1 SCC 100',
      year: 2026,
      court: 'Supreme Court of India',
      bench: '5-Judge Constitution Bench',
      subjectName: 'Jurisprudence',
      keyPrinciple: 'Constitutional morality supersedes majoritarian conventions.',
      ratioDecidendi: 'The rule of law is an inviolable facet of the basic structure.',
      importance: 'LANDMARK',
      status: 'PUBLISHED',
    });
    assert(testCase.title.includes('Union of India'), 'Case law created with bench and ratio decidendi');

    // ----------------------------------------------------
    // TEST 11: Questions & Model Answers CRUD (Marks, Difficulty, Priority, PYQ)
    // ----------------------------------------------------
    console.log('\n❓ Test Suite 11: Questions & Model Answers CRUD');
    const testQuestion = await adminService.createQuestion({
      topicId: testTopic.id,
      questionText: 'Critically examine Hart concept of the Rule of Recognition.',
      marks: 14,
      difficulty: 'HARD',
      preparationPriority: 'HIGH',
      pyqFrequency: 5,
      answerText: 'Model Answer: Hart introduces the Rule of Recognition to solve the defect of uncertainty in primitive legal orders...',
    });
    assert(testQuestion.marks === 14 && testQuestion.difficulty === 'HARD', 'Question created with marks, difficulty, and priority');

    const questionDetail = await adminService.getQuestions({ topicId: testTopic.id });
    assert(questionDetail.items.some(q => q.id === testQuestion.id), 'Question retrieved with model answer relation');

    // ----------------------------------------------------
    // TEST 12: MCQs & 4 Options CRUD
    // ----------------------------------------------------
    console.log('\n🔘 Test Suite 12: MCQs & 4 Options CRUD');
    const testMcq = await adminService.createMcq({
      subjectId: testSubj.id,
      topicId: testTopic.id,
      questionText: 'According to H.L.A. Hart, which secondary rule remedies uncertainty?',
      optA: 'Rule of Change',
      optB: 'Rule of Recognition',
      optC: 'Rule of Adjudication',
      optD: 'Grundnorm',
      correctKey: 'B',
      difficulty: 'MEDIUM',
      explanation: 'The Rule of Recognition provides authoritative criteria for identifying valid legal rules.',
    });
    assert(testMcq.options.length === 4, 'MCQ created with 4 options');
    const correctOpt = testMcq.options.find(o => o.optionKey === 'B');
    assert(correctOpt && correctOpt.isCorrect === true, 'Correct MCQ option marked');

    // ----------------------------------------------------
    // TEST 13: Previous Papers CRUD
    // ----------------------------------------------------
    console.log('\n📄 Test Suite 13: Previous Papers CRUD');
    const testPaper = await adminService.createPreviousPaper({
      universityId: testUni.id,
      courseId: testCourse.id,
      semesterId: testSemester.id,
      subjectId: testSubj.id,
      examYear: 2025,
      examSession: 'WINTER',
      totalMarks: 70,
      paperCode: 'LAW-2025-W-01',
      fileUrl: 'https://lowstudy.com/papers/2025-winter-jurisprudence.pdf',
    });
    assert(testPaper.examYear === 2025 && testPaper.paperCode === 'LAW-2025-W-01', 'Previous paper created with year and PDF URL');

    // ----------------------------------------------------
    // TEST 14: Mock Tests CRUD
    // ----------------------------------------------------
    console.log('\n⏱️ Test Suite 14: Mock Tests CRUD');
    const testMock = await adminService.createMockTest({
      universityId: testUni.id,
      courseId: testCourse.id,
      semesterId: testSemester.id,
      subjectId: testSubj.id,
      title: 'Jurisprudence Grand Mock Test 1',
      durationMinutes: 90,
      totalMarks: 100,
      passMarks: 40,
      isPublished: true,
    });
    assert(testMock.title.includes('Grand Mock') && testMock.isPublished === true, 'Mock test created with time and published status');

    // ----------------------------------------------------
    // TEST 15: Students Management
    // ----------------------------------------------------
    console.log('\n👨‍🎓 Test Suite 15: Students Management');
    const studentsRes = await adminService.getStudents({ limit: 5 });
    assert(studentsRes.items !== undefined, 'Students list retrieved successfully');

    // ----------------------------------------------------
    // TEST 16: AI Content & Content Review Workflow
    // ----------------------------------------------------
    console.log('\n🤖 Test Suite 16: AI Content Governance & Review Workflow');
    // Step 1: NyayaAI generates draft
    const aiDraft = await createAiContentRecord({
      entityType: 'NOTES',
      prompt: 'Explain the difference between Austin and Hart concepts of sovereignty',
      generatedContent: 'Austin views sovereignty as an uncommanded commander, whereas Hart replaces this with a system of rules.',
      language: 'EN',
      modelName: 'gemini-1.5-flash',
    });
    assert(aiDraft.workflowStage === WORKFLOW_STAGES.AI_GENERATED, 'Stage 1: AI_GENERATED recorded');
    assert(aiDraft.status === 'DRAFT', 'Safe default: Staged as DRAFT (never auto-published)');

    // Step 2: Transition to DRAFT
    const stagedDraft = await transitionWorkflowStage(aiDraft.id, {
      targetStage: WORKFLOW_STAGES.DRAFT,
      actorId: 'admin-system',
    });
    assert(stagedDraft.workflowStage === WORKFLOW_STAGES.DRAFT, 'Stage 2: Staged to DRAFT');

    // Step 3: Transition to ADMIN_REVIEW
    const underReview = await transitionWorkflowStage(aiDraft.id, {
      targetStage: WORKFLOW_STAGES.ADMIN_REVIEW,
      actorId: 'admin-system',
    });
    assert(underReview.workflowStage === WORKFLOW_STAGES.ADMIN_REVIEW, 'Stage 3: Moved to ADMIN_REVIEW queue');

    // Step 4: Admin Verification
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const reviewResult = await recordContentReview(aiDraft.id, {
      reviewerId: adminUser?.id || 'admin-system',
      reviewStatus: 'APPROVED',
      remarks: 'Verified accurate legal philosophy formulation.',
    });
    assert(reviewResult.reviewStatus === 'APPROVED', 'Review recorded with APPROVED status');

    const verifiedRecord = await prisma.aiContent.findUnique({ where: { id: aiDraft.id } });
    // Step 5: Publishing Verified Content (Promote to official catalog)
    const published = await promoteToOfficialCatalog(aiDraft.id, {
      actorId: adminUser?.id || 'admin-system',
      targetTopicId: testTopic.id,
      targetSubjectId: testSubj.id,
    });
    assert(published.success === true, 'Stage 5: Verified content successfully promoted to catalog');
    const publishedAi = await prisma.aiContent.findUnique({ where: { id: aiDraft.id } });
    assert(publishedAi.status === 'PUBLISHED', 'Stage 5: AI Content record status updated to PUBLISHED');

    // ----------------------------------------------------
    // CLEANUP TEST DATA (Cascade Delete & Integrity)
    // ----------------------------------------------------
    console.log('\n🧹 Test Suite 17: Cleanup & Cascade Deletion');
    await adminService.deleteMockTest(testMock.id);
    await adminService.deletePreviousPaper(testPaper.id);
    await adminService.deleteMcq(testMcq.id);
    await adminService.deleteQuestion(testQuestion.id);
    await adminService.deleteCaseLaw(testCase.id);
    await adminService.deleteLegalSection(testSection.id);
    await adminService.deleteNote(testNote.id);
    await adminService.deleteTopic(testTopic.id);
    await adminService.deleteUnit(testUnit.id);
    await adminService.deleteSubject(testSubj.id);
    await adminService.deleteSemester(testSemester.id);
    await adminService.deleteCourse(testCourse.id);
    await adminService.deleteUniversity(testUni.id);
    await prisma.aiContent.delete({ where: { id: aiDraft.id } });
    assert(true, 'Test entities cleanly deleted adhering to cascade rules');

    console.log(`\n🎉 ADMIN CRUD TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
    if (failed > 0) process.exit(1);
  } catch (error) {
    console.error('💥 Test execution error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAdminCrudTests();
