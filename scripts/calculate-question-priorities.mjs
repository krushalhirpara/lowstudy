import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIORITY_LABELS = {
  VERY_HIGH: 'Very High Priority',
  HIGH: 'High Priority',
  IMPORTANT: 'Important',
  PRACTICE: 'Practice'
};

function calculateScore({
  previousYearCount = 0,
  yearsAsked = [],
  syllabusWeight = 1.0,
  legalImportance = 1.0,
  hasStatutorySections = true,
  relatedTopicQuestionCount = 1
}) {
  let parsedYears = yearsAsked.map(y => parseInt(y, 10)).filter(y => !isNaN(y));
  const pyqCount = Math.max(previousYearCount, parsedYears.length);

  // 1. Previous-Year Frequency (0 - 35)
  let fFrequency = 0;
  if (pyqCount >= 3) fFrequency = 35;
  else if (pyqCount === 2) fFrequency = 28;
  else if (pyqCount === 1) fFrequency = 18;

  // 2. Recency (0 - 20)
  let fRecency = 0;
  if (parsedYears.length > 0) {
    const mostRecent = Math.max(...parsedYears);
    if (mostRecent >= 2024) fRecency = 20;
    else if (mostRecent === 2023) fRecency = 15;
    else if (mostRecent === 2022) fRecency = 10;
    else fRecency = 5;
  }

  // 3. Syllabus Importance (0 - 15)
  const clampedSyllabus = Math.min(Math.max(syllabusWeight, 0.5), 2.0);
  const fSyllabus = Math.round((clampedSyllabus / 2.0) * 15);

  // 4. Core Legal Concept (0 - 15)
  const clampedLegal = Math.min(Math.max(legalImportance, 0.5), 2.5);
  const fLegal = Math.round((clampedLegal / 2.5) * 15);

  // 5. Statutory Importance (0 - 10)
  const fStatutory = hasStatutorySections ? 10 : 4;

  // 6. Related Topic Frequency (0 - 5)
  const fRelated = Math.min(Math.max(relatedTopicQuestionCount, 1), 5);

  const total = Math.min(Math.max(Math.round(fFrequency + fRecency + fSyllabus + fLegal + fStatutory + fRelated), 5), 100);

  let label = PRIORITY_LABELS.PRACTICE;
  if (total >= 75) label = PRIORITY_LABELS.VERY_HIGH;
  else if (total >= 60) label = PRIORITY_LABELS.HIGH;
  else if (total >= 40) label = PRIORITY_LABELS.IMPORTANT;

  const sortedYears = [...new Set(parsedYears)].sort((a, b) => b - a);
  let why = '';
  if (pyqCount >= 2 && sortedYears.length > 0) {
    why = `Appeared in multiple available previous papers (${sortedYears.join(', ')}) and covers a core syllabus concept under the verified curriculum.`;
  } else if (pyqCount === 1 && sortedYears.length > 0) {
    why = `Featured in verified university examination paper (${sortedYears[0]}) and addresses a fundamental statutory provision.`;
  } else if (clampedLegal >= 2.0) {
    why = `Foundational legal doctrine with high syllabus weight and direct Bare Act grounding; essential for conceptual clarity.`;
  } else if (clampedSyllabus >= 1.3) {
    why = `Core unit syllabus topic with high curricular representation; valuable for comprehensive exam readiness.`;
  } else {
    why = `Standard curriculum topic designed for systematic concept reinforcement and descriptive answer-writing practice.`;
  }

  return {
    score: total,
    label,
    count: pyqCount,
    years: JSON.stringify(sortedYears),
    syllabusWeight: clampedSyllabus,
    legalImportance: clampedLegal,
    why
  };
}

async function main() {
  console.log('Calculating evidence-based question priorities...');
  
  const questions = await prisma.question.findMany({
    include: {
      paperQuestions: {
        include: { paper: true }
      },
      topic: {
        include: {
          unit: {
            include: { subject: true }
          }
        }
      }
    }
  });

  console.log(`Found ${questions.length} total questions.`);

  let counts = {
    [PRIORITY_LABELS.VERY_HIGH]: 0,
    [PRIORITY_LABELS.HIGH]: 0,
    [PRIORITY_LABELS.IMPORTANT]: 0,
    [PRIORITY_LABELS.PRACTICE]: 0
  };

  for (const q of questions) {
    const paperYears = q.paperQuestions
      .map(pq => pq.paper?.examYear)
      .filter(Boolean)
      .map(y => parseInt(y, 10));

    let legalImp = 1.0;
    const txt = (q.questionText || '').toLowerCase();
    if (
      txt.includes('definition') ||
      txt.includes('define') ||
      txt.includes('workman') ||
      txt.includes('strike') ||
      txt.includes('lock-out') ||
      txt.includes('natural justice') ||
      txt.includes('section 43a')
    ) {
      legalImp = 2.2;
    } else if (txt.includes('distinguish') || txt.includes('explain') || txt.includes('procedure')) {
      legalImp = 1.6;
    }

    let syllWeight = 1.0;
    if (q.marks >= 10) syllWeight = 1.4;
    else if (q.marks === 5) syllWeight = 1.2;

    const res = calculateScore({
      previousYearCount: paperYears.length,
      yearsAsked: paperYears,
      syllabusWeight: syllWeight,
      legalImportance: legalImp,
      hasStatutorySections: true,
      relatedTopicQuestionCount: 3
    });

    await prisma.question.update({
      where: { id: q.id },
      data: {
        priority_score: res.score,
        priority_label: res.label,
        previous_year_count: res.count,
        years_asked: res.years,
        syllabus_weight: res.syllabusWeight,
        legal_importance: res.legalImportance,
        why_important: res.why,
        preparationPriority: res.label === PRIORITY_LABELS.VERY_HIGH ? 'HIGH' : (res.label === PRIORITY_LABELS.PRACTICE ? 'LOW' : 'MEDIUM')
      }
    });

    counts[res.label] = (counts[res.label] || 0) + 1;
    console.log(`- [${res.label}] (Score: ${res.score}) ${q.questionText.slice(0, 55)}...`);
    console.log(`  Why: ${res.why}`);
  }

  console.log('\nPriority Distribution Summary:');
  console.log(counts);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
