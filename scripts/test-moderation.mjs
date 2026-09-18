import { PrismaClient } from '@prisma/client';
import {
  createAiContentRecord,
  getModerationQueue,
  getAiContentById,
  transitionWorkflowStage,
  recordContentReview,
  promoteToOfficialCatalog,
  WORKFLOW_STAGES,
  VERIFICATION_STATUSES,
} from '../src/lib/services/moderationService.js';

const prisma = new PrismaClient();

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

async function runTests() {
  console.log('🧪 Starting Moderation & AI Content Verification Workflow Test Suite...\n');

  try {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) throw new Error('Admin user required for test');

    const sampleTopic = await prisma.topic.findFirst();
    if (!sampleTopic) throw new Error('Topic required for test');

    // -------------------------------------------------------------
    // Test 1: Creation Defaults & Safety Gates
    // -------------------------------------------------------------
    console.log('📦 Test Suite 1: AI Content Creation & Safe Defaults');
    const aiItem = await createAiContentRecord({
      entityType: 'MCQ',
      prompt: 'Generate an MCQ on BNS 103 Mob Lynching provision',
      generatedContent: {
        question: 'Under BNS Section 103(2), what is the minimum group size for mob lynching offences?',
        difficulty: 'HARD',
        options: [
          { key: 'A', text: '5 or more persons', isCorrect: true },
          { key: 'B', text: '2 or more persons', isCorrect: false },
          { key: 'C', text: '10 or more persons', isCorrect: false },
          { key: 'D', text: '3 or more persons', isCorrect: false },
        ],
        explanation: 'Section 103(2) of the Bharatiya Nyaya Sanhita 2023 specifically criminalizes murder committed by five or more persons on designated identity grounds.',
      },
      language: 'EN',
      modelName: 'gemini-1.5-pro',
    });

    assert(aiItem.id != null, 'AI content record created with ID');
    assert(aiItem.workflowStage === WORKFLOW_STAGES.AI_GENERATED, 'workflowStage defaults to AI_GENERATED');
    assert(aiItem.verificationStatus === VERIFICATION_STATUSES.PENDING, 'verificationStatus defaults to PENDING');
    assert(aiItem.status === 'DRAFT', 'status defaults to DRAFT (never auto-published)');

    // -------------------------------------------------------------
    // Test 2: Enforcement of Zero Auto-Publishing
    // -------------------------------------------------------------
    console.log('\n🚫 Test Suite 2: Zero Auto-Publishing & Illegal Shortcut Prevention');
    let publishAttemptFailed = false;
    try {
      await promoteToOfficialCatalog(aiItem.id, { actorId: adminUser.id });
    } catch (err) {
      publishAttemptFailed = true;
    }
    assert(publishAttemptFailed, 'Direct promotion of AI_GENERATED item blocked with error');

    let illegalTransitionFailed = false;
    try {
      await transitionWorkflowStage(aiItem.id, { targetStage: WORKFLOW_STAGES.PUBLISHED });
    } catch (err) {
      illegalTransitionFailed = true;
    }
    assert(illegalTransitionFailed, 'Direct transition from AI_GENERATED to PUBLISHED blocked with error');

    // -------------------------------------------------------------
    // Test 3: Controlled Workflow Lifecycle
    // -------------------------------------------------------------
    console.log('\n🔄 Test Suite 3: Controlled 5-Stage Workflow Transitions');
    // Step 1: AI_GENERATED -> DRAFT
    const draftStep = await transitionWorkflowStage(aiItem.id, {
      targetStage: WORKFLOW_STAGES.DRAFT,
      actorId: adminUser.id,
      notes: 'Initial formatting verified',
    });
    assert(draftStep.workflowStage === WORKFLOW_STAGES.DRAFT, 'Transition to DRAFT succeeded');

    // Step 2: DRAFT -> ADMIN_REVIEW
    const reviewStep = await transitionWorkflowStage(aiItem.id, {
      targetStage: WORKFLOW_STAGES.ADMIN_REVIEW,
      actorId: adminUser.id,
      notes: 'Submitted to faculty moderation queue',
    });
    assert(reviewStep.workflowStage === WORKFLOW_STAGES.ADMIN_REVIEW, 'Transition to ADMIN_REVIEW succeeded');

    // -------------------------------------------------------------
    // Test 4: Content Review Decisions & Audit Trail
    // -------------------------------------------------------------
    console.log('\n📝 Test Suite 4: Content Review Decisions & Audit Logging');
    // First review: Changes requested
    const changeReview = await recordContentReview(aiItem.id, {
      reviewerId: adminUser.id,
      reviewStatus: 'CHANGES_REQUESTED',
      remarks: 'Please ensure citation to Parliamentary Standing Committee Report is referenced.',
    });
    assert(changeReview.id != null, 'ContentReview record created');
    
    let currentCheck = await getAiContentById(aiItem.id);
    assert(currentCheck.workflowStage === WORKFLOW_STAGES.FLAGGED, 'Content transitioned to FLAGGED on changes requested');
    assert(currentCheck.reviews.length >= 1, 'Review history accessible via getAiContentById');

    // Edit and resubmit: FLAGGED -> DRAFT -> ADMIN_REVIEW
    await transitionWorkflowStage(aiItem.id, { targetStage: WORKFLOW_STAGES.DRAFT });
    await transitionWorkflowStage(aiItem.id, { targetStage: WORKFLOW_STAGES.ADMIN_REVIEW });

    // Second review: Approved
    const approvedReview = await recordContentReview(aiItem.id, {
      reviewerId: adminUser.id,
      reviewStatus: 'APPROVED',
      remarks: 'Legal sections and penal thresholds fully verified against BNS Gazette.',
    });
    assert(approvedReview.reviewStatus === 'APPROVED', 'Review approved');

    currentCheck = await getAiContentById(aiItem.id);
    assert(currentCheck.workflowStage === WORKFLOW_STAGES.VERIFIED, 'Content moved to VERIFIED stage');
    assert(currentCheck.verificationStatus === VERIFICATION_STATUSES.VERIFIED, 'Verification status is VERIFIED');
    assert(currentCheck.verifiedById === adminUser.id, 'Verifier ID correctly recorded');

    // -------------------------------------------------------------
    // Test 5: Catalog Promotion & Entity Generation
    // -------------------------------------------------------------
    console.log('\n🚀 Test Suite 5: Catalog Promotion to Live Curriculum');
    const promotion = await promoteToOfficialCatalog(aiItem.id, {
      actorId: adminUser.id,
      targetTopicId: sampleTopic.id,
    });
    assert(promotion.success === true, 'Catalog promotion succeeded');
    assert(promotion.promotedType === 'MCQ', 'Promoted entity recognized as MCQ');
    assert(promotion.promotedEntity != null, 'Live MCQ entity created in database');
    assert(promotion.promotedEntity.options.length === 4, 'All 4 MCQ options created in relational database');

    const publishedCheck = await prisma.aiContent.findUnique({ where: { id: aiItem.id } });
    assert(publishedCheck.workflowStage === WORKFLOW_STAGES.PUBLISHED, 'AI Content stage marked as PUBLISHED');
    assert(publishedCheck.status === 'PUBLISHED', 'AI Content status marked as PUBLISHED');

    // -------------------------------------------------------------
    // Test 6: Rejection Governance
    // -------------------------------------------------------------
    console.log('\n🛡️ Test Suite 6: Rejection Governance');
    const badAiItem = await createAiContentRecord({
      entityType: 'NOTES',
      prompt: 'Fabricated legal test note',
      generatedContent: 'Hallucinated citation under IPC 999',
    });

    await recordContentReview(badAiItem.id, {
      reviewerId: adminUser.id,
      reviewStatus: 'REJECTED',
      remarks: 'IPC 999 is hallucinated; non-existent provision.',
    });

    const rejectedCheck = await prisma.aiContent.findUnique({ where: { id: badAiItem.id } });
    assert(rejectedCheck.workflowStage === WORKFLOW_STAGES.REJECTED, 'Workflow stage updated to REJECTED');
    assert(rejectedCheck.verificationStatus === VERIFICATION_STATUSES.REJECTED, 'Verification status marked as REJECTED');

    let publishRejectedFailed = false;
    try {
      await promoteToOfficialCatalog(badAiItem.id, { actorId: adminUser.id });
    } catch {
      publishRejectedFailed = true;
    }
    assert(publishRejectedFailed, 'Promotion of rejected AI content rejected with error');

    // -------------------------------------------------------------
    // Test 7: Queue Querying & Pagination
    // -------------------------------------------------------------
    console.log('\n📊 Test Suite 7: Queue Querying & Filtering');
    const queue = await getModerationQueue({ limit: 10 });
    assert(queue.items.length > 0, 'Moderation queue retrieved items');
    assert(queue.pagination.total >= 2, 'Pagination metadata accurate');

    console.log(`\n========================================`);
    console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();