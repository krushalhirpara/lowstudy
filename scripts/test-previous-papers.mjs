/**
 * Test script for Previous Year Paper Module
 */

import {
  createPreviousPaper,
  getPreviousPapers,
  getPreviousPaperById,
  updatePreviousPaper,
  mapQuestionsToPaper,
  updateQuestionMapping,
  getPaperAnalysis,
  MANDATORY_ANALYSIS_DISCLAIMER
} from '../src/lib/services/previousPaperService.js';
import prisma from '../src/lib/prisma.js';

async function runTests() {
  console.log('=== STARTING PREVIOUS YEAR PAPER MODULE VERIFICATION ===\n');

  // Pre-cleanup any prior test paper
  await prisma.previousPaper.deleteMany({
    where: {
      subjectId: 'su-sem3-220301',
      examYear: 2025,
      examSession: 'WINTER'
    }
  });

  // 1. Test Admin Paper Creation
  console.log('--- 1. Testing Admin Paper Upload & Creation ---');
  const testPaperId = `test-paper-${Date.now()}`;
  const createdPaper = await createPreviousPaper({
    id: testPaperId,
    universityId: 'su',
    courseId: 'su-llb-3yr',
    semesterId: 'su-llb-3yr-sem3',
    subjectId: 'su-sem3-220301',
    examYear: 2025,
    examSession: 'WINTER',
    title: 'Winter 2025 Examination - Labour and Industrial Law - I',
    totalMarks: 70,
    durationMinutes: 180,
    paperCode: 'SU-LLB-SEM3-220301-W25',
    fileUrl: 'https://example.com/papers/su-220301-w25.pdf',
    allowDownload: true,
    status: 'AI_MAPPED',
    instructions: '1. All questions are compulsory. 2. Support answers with case laws.'
  });

  console.log('✔ Paper created:', {
    id: createdPaper.id,
    title: createdPaper.title,
    allowDownload: createdPaper.allowDownload,
    status: createdPaper.status
  });

  if (!createdPaper.allowDownload || createdPaper.status !== 'AI_MAPPED') {
    throw new Error('Paper creation assertion failed for allowDownload or status.');
  }

  // 2. Test Question Mapping Ingestion
  console.log('\n--- 2. Testing AI Question Mapping Ingestion ---');
  // Find a topic in su-sem3-220301
  const sampleTopic = await prisma.topic.findFirst({
    where: { unit: { subjectId: 'su-sem3-220301' } },
    include: { unit: { include: { subject: true } } }
  });

  const sampleTopic2 = await prisma.topic.findFirst({
    where: { 
      unit: { subjectId: 'su-sem3-220301' },
      id: { not: sampleTopic.id }
    },
    include: { unit: { include: { subject: true } } }
  });

  const mappings = await mapQuestionsToPaper(testPaperId, [
    {
      topicId: sampleTopic.id,
      questionText: 'Examine the constitutional validity of provisions relating to industrial dispute settlement.',
      questionTextGu: 'ઔદ્યોગિક વિવાદ નિવારણ સંબંધિત જોગવાઈઓની બંધારણીય માન્યતા તપાસો.',
      marks: 14,
      sectionName: 'Section A (Long Questions)',
      questionNumber: 'Q1',
      isCompulsory: true,
      mappingStatus: 'AI_SUGGESTED',
      confidence: 0.88,
      mappingNotes: 'AI extracted from Page 1'
    }
  ]);

  console.log('✔ Mapped question created:', {
    mappingId: mappings[0].id,
    questionId: mappings[0].questionId,
    status: mappings[0].mappingStatus,
    confidence: mappings[0].confidence
  });

  // 3. Test Admin Mapping Correction Before Publication
  console.log('\n--- 3. Testing Admin Mapping Correction Before Publication ---');
  const corrected = await updateQuestionMapping(mappings[0].id, {
    topicId: sampleTopic2.id,
    marks: 15,
    sectionName: 'Section A (Core Essay Questions)',
    questionNumber: 'Q1(a)',
    mappingStatus: 'MANUAL_OVERRIDE',
    mappingNotes: 'Admin corrected topic assignment to Unit 2 topic.'
  });

  console.log('✔ Mapping corrected by Admin:', {
    mappingId: corrected.id,
    sectionName: corrected.sectionName,
    questionNumber: corrected.questionNumber,
    marks: corrected.marks,
    mappingStatus: corrected.mappingStatus,
    confidence: corrected.confidence
  });

  if (corrected.mappingStatus !== 'MANUAL_OVERRIDE' || corrected.marks !== 15) {
    throw new Error('Mapping correction assertion failed.');
  }

  // Publish paper
  await updatePreviousPaper(testPaperId, { status: 'PUBLISHED' });
  console.log('✔ Paper approved and marked PUBLISHED.');

  // 4. Test Paper Retrieval with Hierarchy
  console.log('\n--- 4. Testing Paper Retrieval & Syllabus Hierarchy ---');
  const paperDetail = await getPreviousPaperById(testPaperId);
  console.log('Paper Details retrieved:', {
    id: paperDetail.id,
    totalQuestions: paperDetail.totalQuestions,
    sectionsCount: paperDetail.sections.length
  });

  const firstQ = paperDetail.structuredQuestions[0];
  console.log('Hierarchy verification:', {
    paperYear: firstQ.hierarchy.examYear,
    subjectCode: firstQ.hierarchy.subjectCode,
    unitNumber: firstQ.hierarchy.unitNumber,
    topicTitle: firstQ.hierarchy.topicTitle
  });

  if (!firstQ.hierarchy.subjectCode || !firstQ.hierarchy.topicTitle) {
    throw new Error('Syllabus hierarchy mapping failed.');
  }

  // 5. Test Paper Search and Filtering
  console.log('\n--- 5. Testing Paper Search & Filtering ---');
  const listRes = await getPreviousPapers({
    universityId: 'su',
    subjectId: 'su-sem3-220301',
    examYear: 2025
  });

  console.log('Search returned papers count:', listRes.items.length);
  if (listRes.items.length === 0) {
    throw new Error('Failed to search created paper.');
  }

  // 6. Test Evidence-Based Analysis & Mandatory Disclaimer
  console.log('\n--- 6. Testing Evidence-Based Analysis & Label Assertions ---');
  const analysis = await getPaperAnalysis({
    subjectId: 'su-sem3-220301',
    universityId: 'su'
  });

  console.log('Analysis Meta:', analysis.meta);
  console.log('Unit Distribution Units Count:', analysis.unitDistribution.length);
  console.log('Frequently Asked Topics Count:', analysis.frequentlyAskedTopics.length);
  if (analysis.frequentlyAskedTopics.length > 0) {
    console.log('Sample Frequently Asked Topic:', {
      title: analysis.frequentlyAskedTopics[0].topicTitle,
      timesAsked: analysis.frequentlyAskedTopics[0].timesAsked,
      evidenceRationale: analysis.frequentlyAskedTopics[0].evidenceRationale
    });
  }

  if (analysis.meta.disclaimer !== MANDATORY_ANALYSIS_DISCLAIMER) {
    throw new Error(`Mandatory disclaimer mismatch: expected "${MANDATORY_ANALYSIS_DISCLAIMER}", got "${analysis.meta.disclaimer}"`);
  }
  console.log(`✔ Mandatory Label Verified: "${analysis.meta.disclaimer}"`);

  // Clean up test paper
  await prisma.previousPaper.delete({ where: { id: testPaperId } });
  console.log('\n✔ Test paper cleaned up successfully.');

  console.log('\n=== ALL PREVIOUS YEAR PAPER MODULE TESTS PASSED! ===');
  await prisma.$disconnect();
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error('Test execution error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
