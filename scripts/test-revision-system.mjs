import { 
  autoCollectRevisionAssets, 
  getRevisionHubData, 
  getMyMistakesData, 
  reAttemptMistake, 
  getBookmarksData, 
  generateRevisionSession, 
  submitRevisionReview,
  calculateProgression 
} from '../src/lib/services/revisionService.js';
import prisma from '../src/lib/prisma.js';

async function runTests() {
  console.log('=== STARTING REVISION & MISTAKE BOOK VERIFICATION ===');
  const userId = 'usr-student-01';

  // 1. Verify Sensible Progression Logic in isolation
  console.log('\n--- 1. Testing Sensible Progression Logic ---');
  const p1 = calculateProgression({ currentReviewCount: 0, currentCorrectCount: 0, isCorrect: true });
  console.log('Attempt 1 (Correct):', { status: p1.status, streak: p1.correctReviewCount, interval: p1.intervalDays });
  if (p1.status !== 'REVIEW_AGAIN' || p1.correctReviewCount !== 1) {
    throw new Error(`P1 failed: expected REVIEW_AGAIN with streak 1, got ${p1.status}`);
  }

  const p2 = calculateProgression({ currentReviewCount: 1, currentCorrectCount: 1, isCorrect: true });
  console.log('Attempt 2 (Correct):', { status: p2.status, streak: p2.correctReviewCount, interval: p2.intervalDays });
  if (p2.status !== 'REVIEW_AGAIN' || p2.correctReviewCount !== 2) {
    throw new Error(`P2 failed: expected REVIEW_AGAIN with streak 2, got ${p2.status}`);
  }

  const p3 = calculateProgression({ currentReviewCount: 2, currentCorrectCount: 2, isCorrect: true });
  console.log('Attempt 3 (Correct):', { status: p3.status, streak: p3.correctReviewCount, interval: p3.intervalDays });
  if (p3.status !== 'MASTERED' || p3.correctReviewCount !== 3) {
    throw new Error(`P3 failed: expected MASTERED with streak 3, got ${p3.status}`);
  }

  const pFail = calculateProgression({ currentReviewCount: 5, currentCorrectCount: 3, isCorrect: false });
  console.log('Attempt 4 (Incorrect):', { status: pFail.status, streak: pFail.correctReviewCount, interval: pFail.intervalDays });
  if (pFail.status !== 'NEED_REVISION' || pFail.correctReviewCount !== 0) {
    throw new Error(`P4 failed: expected demotion to NEED_REVISION with streak 0, got ${pFail.status}`);
  }
  console.log('✔ Progression logic tests passed!');

  // 2. Test Auto-Collection
  console.log('\n--- 2. Testing Auto-Collection ---');
  const collectResult = await autoCollectRevisionAssets(userId);
  console.log('Auto-collection result:', collectResult);
  if (!collectResult.success) {
    throw new Error('Auto-collection failed: ' + collectResult.error);
  }

  // 3. Test Revision Hub Data
  console.log('\n--- 3. Testing Revision Hub Data ---');
  const hubData = await getRevisionHubData({ userId, category: 'ALL' });
  console.log('Hub Stats:', hubData.stats);
  console.log('Total Enriched Items:', hubData.items.length);
  if (hubData.items.length === 0) {
    console.warn('Warning: No items in hubData. Checking if sample data exists.');
  } else {
    console.log('Sample Item:', {
      type: hubData.items[0].entityType,
      title: hubData.items[0].details?.title,
      status: hubData.items[0].revisionStatus
    });
  }

  // 4. Test Mistake Notebook Data
  console.log('\n--- 4. Testing Mistake Notebook Data ---');
  const mistakeData = await getMyMistakesData({ userId, category: 'ALL' });
  console.log('Mistake Stats:', mistakeData.stats);
  console.log('Total Mistakes:', mistakeData.mistakes.length);
  if (mistakeData.mistakes.length > 0) {
    const sampleM = mistakeData.mistakes[0];
    console.log('Sample Mistake:', {
      question: sampleM.question?.slice(0, 60),
      studentAnswer: sampleM.studentAnswer,
      correctAnswer: sampleM.correctAnswer,
      relatedTopic: sampleM.relatedTopic?.title,
      status: sampleM.status
    });

    // Test Re-attempt
    console.log('\n--- 5. Testing Mistake Re-attempt (Try Again) ---');
    const correctKey = sampleM.correctAnswer.key;
    const reAttemptRes = await reAttemptMistake({
      userId,
      wrongAnswerId: sampleM.id,
      selectedKey: correctKey
    });
    console.log('Re-attempt with correct key result:', reAttemptRes);
    if (!reAttemptRes.isCorrect) {
      throw new Error('Expected re-attempt to be correct!');
    }
  }

  // 6. Test Bookmarks
  console.log('\n--- 6. Testing Bookmarks Retrieval ---');
  const bookmarkData = await getBookmarksData({ userId, category: 'ALL' });
  console.log('Bookmark Stats:', bookmarkData.stats);
  console.log('Total Bookmarks:', bookmarkData.bookmarks.length);

  // 7. Test Revision Session Generation
  console.log('\n--- 7. Testing Revision Session Generation ---');
  const sessionData = await generateRevisionSession({ userId, category: 'ALL', count: 10 });
  console.log('Session total cards:', sessionData.totalCards);
  const cardTypes = sessionData.cards.map(c => c.entityType);
  console.log('Card formats included:', Array.from(new Set(cardTypes)));

  if (sessionData.cards.length > 0) {
    const testCard = sessionData.cards[0];
    console.log('\n--- 8. Testing Session Review Submission ---');
    const submitRes = await submitRevisionReview({
      userId,
      revisionItemId: testCard.revisionItemId,
      isCorrect: true
    });
    console.log('Review submission result:', submitRes);
  }

  console.log('\n=== ALL REVISION & MISTAKE BOOK VERIFICATION TESTS PASSED! ===');
  await prisma.$disconnect();
  process.exit(0);
}

runTests().catch(async (err) => {
  console.error('Test failed:', err);
  await prisma.$disconnect();
  process.exit(1);
});
