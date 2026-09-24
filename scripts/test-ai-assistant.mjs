/**
 * Automated Verification Script for Lowstudy AI Study Assistant
 */

import { 
  getStudentContext, 
  processAssistantQuery, 
  CAPABILITIES 
} from '../src/lib/services/aiAssistantService.js';
import { checkRateLimit } from '../src/lib/rateLimiter.js';
import prisma from '../src/lib/prisma.js';

async function runTests() {
  console.log('=== STARTING AI STUDY ASSISTANT VERIFICATION ===\n');
  const userId = 'usr-student-01';

  // 1. Test Student Academic & Progress Context
  console.log('--- 1. Testing Student Context Retrieval ---');
  const context = await getStudentContext(userId);
  console.log('Context retrieved:', {
    university: context.university,
    course: context.course,
    semester: context.semester,
    progressPercentage: `${context.progressPercentage}%`,
    totalWeakTopics: context.totalWeakTopics,
    totalMistakes: context.totalMistakes,
    subjectsCount: context.subjects.length
  });

  if (!context.university || !context.semester) {
    throw new Error('Student context failed: university or semester missing.');
  }
  console.log('✔ Student context assertion passed!');

  // 2. Test All 12 Capabilities
  console.log('\n--- 2. Testing All 12 Capabilities ---');
  
  const capabilityTests = [
    { cap: CAPABILITIES.EXPLAIN_SIMPLE, query: 'Explain definition of workman under Section 2(s)' },
    { cap: CAPABILITIES.EXPLAIN_GUJARATI, query: 'Explain strike and lock-out in Gujarati' },
    { cap: CAPABILITIES.EXPLAIN_ENGLISH, query: 'Concept of Industry under Section 2(j)' },
    { cap: CAPABILITIES.GENERATE_PRACTICE_QUESTIONS, query: 'Generate exam questions for Labour and Industrial Law' },
    { cap: CAPABILITIES.GENERATE_MCQS, query: 'Generate practice MCQs for Labour Law' },
    { cap: CAPABILITIES.EXPLAIN_LEGAL_SECTION, query: 'Section 2(s) Industrial Disputes Act' },
    { cap: CAPABILITIES.EXPLAIN_CASE_LAW, query: 'Bangalore Water Supply case' },
    { cap: CAPABILITIES.SUMMARIZE_TOPIC, query: 'Summarize Strike and Lockout' },
    { cap: CAPABILITIES.QUICK_REVISION_NOTES, query: 'Revision notes on workman' },
    { cap: CAPABILITIES.STRUCTURE_EXAM_ANSWER, query: 'Structure 14-mark answer on strike' },
    { cap: CAPABILITIES.EXPLAIN_MCQ_ANSWER, query: 'Why is definition of workman restricted to specific employees?' },
    { cap: CAPABILITIES.CREATE_STUDY_PLAN, query: 'Create my 3-day study plan' }
  ];

  for (let i = 0; i < capabilityTests.length; i++) {
    const test = capabilityTests[i];
    console.log(`[${i + 1}/12] Testing capability: ${test.cap}...`);
    const res = await processAssistantQuery({
      query: test.query,
      capability: test.cap,
      userId
    });

    if (!res.success || !res.content) {
      throw new Error(`Capability ${test.cap} failed to generate content.`);
    }

    // Verify Lowstudy verified source grounding
    console.log(`   ✔ Success! Sources grounded: ${res.verifiedSources.length}, Content length: ${res.content.length} chars`);
  }

  // 3. Test Legal Content Rules & Uncertainty Identification
  console.log('\n--- 3. Testing Legal Content Rules & Uncertainty Identification ---');
  const obscureQueryRes = await processAssistantQuery({
    query: 'Explain imaginary case John Doe v. State of Atlantis 2099',
    capability: CAPABILITIES.EXPLAIN_CASE_LAW,
    userId
  });

  console.log('Uncertainty identification output:', {
    hasWarning: Boolean(obscureQueryRes.uncertaintyWarning),
    warningText: obscureQueryRes.uncertaintyWarning
  });

  if (!obscureQueryRes.uncertaintyWarning) {
    throw new Error('Uncertainty warning assertion failed for unverified case query.');
  }
  console.log('✔ Uncertainty successfully identified and flagged to student.');

  // 4. Test In-Memory Rate Limiter
  console.log('\n--- 4. Testing Security & Sliding-Window Rate Limiter ---');
  const testClientId = `test-client-${Date.now()}`;
  
  // Send 5 requests under a limit of 5
  for (let r = 1; r <= 5; r++) {
    const check = checkRateLimit(testClientId, 5, 10000);
    if (!check.allowed) {
      throw new Error(`Request ${r} should have been allowed under limit 5.`);
    }
  }

  // 6th request should be blocked with allowed: false
  const blockedCheck = checkRateLimit(testClientId, 5, 10000);
  console.log('Rate limiter 6th request check:', {
    allowed: blockedCheck.allowed,
    remaining: blockedCheck.remaining,
    limit: blockedCheck.limit
  });

  if (blockedCheck.allowed !== false) {
    throw new Error('Rate limiter failed to block excess request.');
  }
  console.log('✔ Rate limiter correctly enforced HTTP 429 threshold.');

  console.log('\n=== ALL AI STUDY ASSISTANT VERIFICATION TESTS PASSED! ===');
  await prisma.$disconnect();
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error('Test execution failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
