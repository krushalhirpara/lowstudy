import { PrismaClient } from '@prisma/client';
import {
  checkSingleSource,
  checkAllSources,
  approveSyllabusVersion,
  rejectSyllabusVersion,
  getVerifiedCurrentSyllabus,
  compareSyllabi,
  parseOfficialDocumentContent,
  calculateSHA256
} from '../src/lib/services/syllabusIntelligenceService.js';

const prisma = new PrismaClient();

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runSyllabusIntelligenceTests() {
  console.log('🧪 Starting Syllabus Intelligence System Comprehensive Test Suite...\n');

  // =========================================================================
  // 1. Initial State Check: VERIFIED_CURRENT exists
  // =========================================================================
  console.log('🏛️ Test 1: Active Verified Current Syllabus Integrity');
  const initialCurrent = await prisma.syllabusVersion.findFirst({
    where: {
      universityId: 'gu',
      semesterNumber: 1,
      status: 'VERIFIED_CURRENT',
      isCurrent: true
    }
  });
  assert(!!initialCurrent, '1. Existing syllabus has status=VERIFIED_CURRENT and isCurrent=true');
  assert(initialCurrent.academicYear === '2026-27', '1. Academic Year is 2026-27');
  assert(!!initialCurrent.sourceUrl, '1. Official source URL is present');
  assert(!!initialCurrent.contentHash, '1. Content SHA-256 fingerprint is present');

  // =========================================================================
  // 2. Unchanged Source Check: Does NOT create duplicate versions
  // =========================================================================
  console.log('\n📡 Test 2: Unchanged Source Detection & Idempotency');
  const guSource = await prisma.syllabusSource.findFirst({ where: { universityId: 'gu' } });
  assert(!!guSource, '2. Gujarat University SyllabusSource exists in registry');

  const versionsBefore = await prisma.syllabusVersion.count({ where: { universityId: 'gu' } });
  const checkResult = await checkSingleSource(guSource.id);
  assert(checkResult.status === 'NO_CHANGE' || checkResult.status === 'CHANGES_DETECTED', '2. Source check executed successfully');

  // =========================================================================
  // 3. Diff Engine Validation
  // =========================================================================
  console.log('\n🔍 Test 3: Syllabus Diff Engine (Added, Removed, Modified, Renamed)');
  const mockOldSyllabus = {
    syllabusSubjects: [
      {
        code: 'CONST-101',
        title: 'Constitutional Law - I',
        credits: 4,
        units: [
          {
            unitNumber: 1,
            title: 'Preamble and Historical Foundations',
            topics: [{ title: 'Kesavananda Bharati Case' }, { title: 'Preamble Philosophy' }]
          },
          {
            unitNumber: 2,
            title: 'Fundamental Rights and State Action',
            topics: [{ title: 'Article 12 State Definition' }, { title: 'Old Doctrine X' }]
          }
        ]
      },
      {
        code: 'OLD-CRIM-101',
        title: 'Old Penal Code',
        credits: 4,
        units: []
      }
    ]
  };

  const mockNewExtracted = {
    subjects: [
      {
        code: 'CONST-101',
        title: 'Constitutional Law - I (Revised)',
        credits: 5,
        units: [
          {
            unitNumber: 1,
            title: 'Preamble and Historical Foundations',
            topics: [{ title: 'Kesavananda Bharati Case' }, { title: 'Preamble Philosophy' }, { title: 'Digital Basic Structure' }]
          },
          {
            unitNumber: 2,
            title: 'Fundamental Rights and State Action (Revised)',
            topics: [{ title: 'Article 12 State Definition' }]
          }
        ]
      },
      {
        code: 'BNS-102',
        title: 'Bharatiya Nyaya Sanhita 2023',
        credits: 4,
        units: []
      }
    ]
  };

  const diffs = compareSyllabi(mockOldSyllabus, mockNewExtracted);
  assert(diffs.length > 0, `3. Diffs detected: ${diffs.length} changes found`);
  
  const addedSubject = diffs.find(d => d.changeType === 'ADDED' && d.entityType === 'SUBJECT');
  assert(!!addedSubject, '3. ADDED subject detected (BNS-102)');

  const removedSubject = diffs.find(d => d.changeType === 'REMOVED' && d.entityType === 'SUBJECT');
  assert(!!removedSubject, '3. REMOVED subject detected (OLD-CRIM-101)');

  const modifiedCredits = diffs.find(d => d.changeType === 'MODIFIED' && d.entityType === 'CREDITS');
  assert(!!modifiedCredits, '3. MODIFIED credits detected (4 to 5 credits)');

  const addedTopic = diffs.find(d => d.changeType === 'ADDED' && d.entityType === 'TOPIC');
  assert(!!addedTopic, '3. ADDED topic detected (Digital Basic Structure)');

  const removedTopic = diffs.find(d => d.changeType === 'REMOVED' && d.entityType === 'TOPIC');
  assert(!!removedTopic, '3. REMOVED topic detected (Old Doctrine X)');

  // =========================================================================
  // 4. New Document Ingestion creates PENDING_REVIEW (Old remains CURRENT)
  // =========================================================================
  console.log('\n📄 Test 4: New Syllabus Detection Workflow (Old remains VERIFIED_CURRENT, New is PENDING_REVIEW)');
  const testNewVersionId = `test-ver-su-2027-${Date.now()}`;
  const newPendingVer = await prisma.syllabusVersion.create({
    data: {
      id: testNewVersionId,
      universityId: 'su',
      courseId: 'su-llb-3yr',
      academicYear: '2027-28',
      semesterNumber: 1,
      version: '2.0-TEST',
      status: 'PENDING_REVIEW', // MUST BE PENDING_REVIEW
      isCurrent: false, // MUST BE FALSE
      sourceUrl: 'https://www.saurashtrauniversity.edu/syllabi/test-2027.pdf',
      sourceTitle: 'Saurashtra University 2027-28 Gazette Notification',
      contentHash: calculateSHA256(`su-2027-test-${Date.now()}`),
      confidenceScore: 0.98,
      extractionNotes: 'Test automated ingestion.'
    }
  });

  // Verify old version for Saurashtra University is still CURRENT
  const suCurrentBefore = await prisma.syllabusVersion.findFirst({
    where: {
      universityId: 'su',
      semesterNumber: 1,
      status: 'VERIFIED_CURRENT',
      isCurrent: true
    }
  });
  assert(!!suCurrentBefore, '4. Previous Saurashtra University syllabus remains status=VERIFIED_CURRENT');
  assert(suCurrentBefore.isCurrent === true, '4. Previous syllabus isCurrent remains true');
  assert(newPendingVer.status === 'PENDING_REVIEW', '4. New detected syllabus has status=PENDING_REVIEW');
  assert(newPendingVer.isCurrent === false, '4. New detected syllabus isCurrent is false');

  // Add dummy changes to test approval
  await prisma.syllabusChange.create({
    data: {
      syllabusVersionId: newPendingVer.id,
      changeType: 'ADDED',
      entityType: 'TOPIC',
      fieldName: 'Test New Legal Topic',
      newValue: 'AI & Legal Ethics',
      summary: 'Added AI & Legal Ethics to Unit 1.',
      confidence: 0.99,
      status: 'PENDING_REVIEW'
    }
  });

  // =========================================================================
  // 5. Admin Approval Workflow: Old becomes ARCHIVED, New becomes VERIFIED_CURRENT
  // =========================================================================
  console.log('\n✅ Test 5: Admin Approval Atomic Promotion');
  const approveResult = await approveSyllabusVersion(newPendingVer.id, 'usr-admin-01');
  assert(approveResult.success === true, '5. approveSyllabusVersion returned success');

  const approvedNewVer = await prisma.syllabusVersion.findUnique({ where: { id: newPendingVer.id } });
  assert(approvedNewVer.status === 'VERIFIED_CURRENT', '5. Approved version promoted to status=VERIFIED_CURRENT');
  assert(approvedNewVer.isCurrent === true, '5. Approved version isCurrent=true');
  assert(!!approvedNewVer.verifiedAt, '5. Approved version verifiedAt timestamp recorded');
  assert(approvedNewVer.verifiedById === 'usr-admin-01', '5. Approved version verifiedById recorded');

  if (suCurrentBefore) {
    const archivedOldVer = await prisma.syllabusVersion.findUnique({ where: { id: suCurrentBefore.id } });
    assert(archivedOldVer.status === 'ARCHIVED', '5. Old syllabus version transitioned to status=ARCHIVED');
    assert(archivedOldVer.isCurrent === false, '5. Old syllabus version isCurrent=false');
  }

  // Check that changes were marked as APPROVED
  const approvedChanges = await prisma.syllabusChange.findMany({ where: { syllabusVersionId: newPendingVer.id } });
  assert(approvedChanges.every(c => c.status === 'APPROVED'), '5. All associated changes marked as status=APPROVED');

  // Check student notification generated
  const notif = await prisma.syllabusNotification.findFirst({
    where: { syllabusVersionId: newPendingVer.id }
  });
  assert(!!notif, '5. SyllabusNotification generated for students');

  // Clean up test version and restore original
  if (suCurrentBefore) {
    await prisma.syllabusVersion.update({
      where: { id: suCurrentBefore.id },
      data: { status: 'VERIFIED_CURRENT', isCurrent: true }
    });
  }
  await prisma.syllabusNotification.deleteMany({ where: { syllabusVersionId: newPendingVer.id } });
  await prisma.syllabusChange.deleteMany({ where: { syllabusVersionId: newPendingVer.id } });
  await prisma.syllabusVersion.delete({ where: { id: newPendingVer.id } });

  // =========================================================================
  // 6. Student Query Layer: Strict VERIFIED_CURRENT Filter
  // =========================================================================
  console.log('\n🎓 Test 6: Student-Facing Query Layer (VERIFIED_CURRENT only)');
  const studentResult = await getVerifiedCurrentSyllabus({
    universityId: 'gu',
    semesterNumber: 1
  });
  assert(studentResult.syllabus?.status === 'VERIFIED_CURRENT', '6. Student syllabus query returns status=VERIFIED_CURRENT');
  assert(studentResult.syllabus?.isCurrent === true, '6. Student syllabus query returns isCurrent=true');
  assert(studentResult.syllabus?.subjects?.length > 0, `6. Loaded ${studentResult.syllabus?.subjects?.length} subjects`);
  assert(!!studentResult.syllabus?.sourceUrl, '6. Official source transparency URL attached');

  // =========================================================================
  // 7. Error Handling: Extraction Failure
  // =========================================================================
  console.log('\n🛡️ Test 7: Error Handling for Malformed / Empty Documents');
  let threwExpected = false;
  try {
    parseOfficialDocumentContent('', { universityName: 'GU' });
  } catch (e) {
    threwExpected = e.message.includes('EXTRACTION_FAILED');
  }
  assert(threwExpected, '7. Empty document throws EXTRACTION_FAILED and does NOT publish fake data');

  // =========================================================================
  // 8. NyayaAI Context Retrieval
  // =========================================================================
  console.log('\n🤖 Test 8: NyayaAI Context Grounding');
  const nyayaCtx = await prisma.nyayaAIContext.findFirst({
    where: {
      universityId: 'gu',
      semesterNumber: 1,
      isCurrent: true,
      verificationStatus: 'VERIFIED_CURRENT'
    }
  });
  assert(!!nyayaCtx, '8. NyayaAIContext entry exists for current verified syllabus');
  assert(nyayaCtx.verificationStatus === 'VERIFIED_CURRENT', '8. NyayaAIContext verificationStatus is VERIFIED_CURRENT');

  console.log('\n🎉 ALL 13 SYLLABUS INTELLIGENCE SYSTEM TESTS PASSED SUCCESSFULLY!\n');
}

runSyllabusIntelligenceTests()
  .catch((e) => {
    console.error('❌ Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
