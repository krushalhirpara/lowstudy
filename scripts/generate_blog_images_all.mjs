import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const outDir = './public/images/blog';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const clusters = {
  university: {
    bg1: '#0F172A',
    bg2: '#1E293B',
    accent1: '#38BDF8',
    accent2: '#0EA5E9',
    badge: 'UNIVERSITY SYLLABUS',
    iconType: 'university'
  },
  exam: {
    bg1: '#1E1B4B',
    bg2: '#312E81',
    accent1: '#F59E0B',
    accent2: '#D97706',
    badge: 'LAW EXAM PREPARATION',
    iconType: 'exam'
  },
  bns: {
    bg1: '#14532D',
    bg2: '#166534',
    accent1: '#4ADE80',
    accent2: '#22C55E',
    badge: 'CRIMINAL LAW REFORMS 2023',
    iconType: 'statute'
  },
  caselaw: {
    bg1: '#3B0764',
    bg2: '#581C87',
    accent1: '#C084FC',
    accent2: '#A855F7',
    badge: 'CASE LAWS & PRECEDENTS',
    iconType: 'gavel'
  },
  skills: {
    bg1: '#18181B',
    bg2: '#27272A',
    accent1: '#F43F5E',
    accent2: '#E11D48',
    badge: 'LEGAL ADVOCACY & SKILLS',
    iconType: 'drafting'
  }
};

const articles = [
  // Cluster A: University
  {
    slug: 'gujarat-university-llb-syllabus-2026-27',
    title: 'Gujarat University LL.B. Syllabus',
    subtitle: '2026-27 Semester Roadmap & Subject Guide',
    cluster: 'university',
    tag: 'GU AHMEDABAD • SEMESTERS 1-6'
  },
  {
    slug: 'saurashtra-university-llb-syllabus-2026-27',
    title: 'Saurashtra University LL.B. Syllabus',
    subtitle: '2026-27 CBCS Subjects & Semester 3 Notes',
    cluster: 'university',
    tag: 'SU RAJKOT • CBCS CURRICULUM'
  },
  {
    slug: 'vnsgu-llb-syllabus-2026-27',
    title: 'VNSGU Surat LL.B. Syllabus',
    subtitle: '2026-27 Semester Structure & Exam Blueprint',
    cluster: 'university',
    tag: 'VNSGU SURAT • 3-YR & 5-YR LL.B.'
  },
  {
    slug: 'how-to-read-an-llb-syllabus-and-build-study-plan',
    title: 'How to Read an LL.B. Syllabus',
    subtitle: 'Blueprint for Building a High-Yield Semester Study Plan',
    cluster: 'university',
    tag: 'STUDY METHODOLOGY • UNIT BREAKDOWNS'
  },
  {
    slug: 'llb-semester-preparation-guide-organize-subjects-units',
    title: 'LL.B. Semester Preparation Guide',
    subtitle: 'Organizing Subjects, Units, Modules & Revision Slots',
    cluster: 'university',
    tag: 'SEMESTER STRATEGY • STUDY CALENDAR'
  },

  // Cluster B: Exam Prep
  {
    slug: 'how-to-write-a-20-mark-law-exam-answer',
    title: 'How to Write a 20-Mark Law Answer',
    subtitle: 'The 5-Pillar IRAC Method for Gujarat Law Exams',
    cluster: 'exam',
    tag: 'IRAC METHOD • DESCRIPTIVE ANSWERS'
  },
  {
    slug: 'how-to-write-a-10-mark-law-answer',
    title: 'How to Write a 10-Mark Law Answer',
    subtitle: 'Concise Structuring & High-Scoring Short Notes',
    cluster: 'exam',
    tag: 'SHORT NOTES • TIME ALLOCATION'
  },
  {
    slug: 'irac-method-for-law-students-answer-structure',
    title: 'IRAC Method Masterclass',
    subtitle: 'Issue • Rule • Application • Conclusion Blueprint',
    cluster: 'exam',
    tag: 'LEGAL REASONING • EXAM TEMPLATE'
  },
  {
    slug: 'how-to-prepare-for-llb-exams-in-30-days',
    title: 'LL.B. Exam Prep in 30 Days',
    subtitle: 'High-Yield Subject Prioritization & Crash Strategy',
    cluster: 'exam',
    tag: '30-DAY CRASH PLAN • SYLLABUS TRIAGE'
  },
  {
    slug: 'how-to-revise-law-subjects-before-university-exams',
    title: 'How to Revise Law Subjects',
    subtitle: 'Active Recall, Spaced Repetition & Pre-Exam Sprints',
    cluster: 'exam',
    tag: 'REVISION FRAMEWORK • MEMORY DRILLS'
  },
  {
    slug: 'how-to-remember-legal-provisions-sections-and-case-laws',
    title: 'Remembering Sections & Case Laws',
    subtitle: 'Mnemonic Techniques & Section Mapping Strategies',
    cluster: 'exam',
    tag: 'MNEMONICS • SECTION RECALL'
  },
  {
    slug: 'important-mistakes-law-students-should-avoid-in-exams',
    title: 'Top Exam Mistakes to Avoid',
    subtitle: '7 Critical Errors That Cost Law Students Top Grades',
    cluster: 'exam',
    tag: 'COMMON PITFALLS • EVALUATOR INSIGHTS'
  },
  {
    slug: 'how-to-prepare-for-law-mcqs-and-objective-exams',
    title: 'Law MCQ & Objective Prep',
    subtitle: 'Elimination Tactics, Bare Act Nuances & Speed Drills',
    cluster: 'exam',
    tag: 'OBJECTIVE QUESTIONS • SPEED STRATEGY'
  },
  {
    slug: 'how-to-use-previous-year-questions-for-llb-exam-preparation',
    title: 'Mastering PYQs for Law Exams',
    subtitle: 'Pattern Analysis, Recurring Questions & Trend Mapping',
    cluster: 'exam',
    tag: 'PREVIOUS PAPERS • RECURRING TRENDS'
  },
  {
    slug: 'how-to-make-effective-revision-notes-for-law-subjects',
    title: 'Effective Law Revision Notes',
    subtitle: 'Creating High-Yield Summary Sheets & Flowcharts',
    cluster: 'exam',
    tag: 'SUMMARY SHEETS • FLOWCHARTS'
  },

  // Cluster C: BNS / BNSS / BSA
  {
    slug: 'bns-2023-vs-ipc-1860-key-differences',
    title: 'BNS 2023 vs IPC 1860',
    subtitle: 'Comprehensive Section Mapping & New Codified Offenses',
    cluster: 'bns',
    tag: 'STATUTORY REFORMS • SECTION CONVERTER'
  },
  {
    slug: 'bnss-2023-vs-crpc-1973-what-law-students-need-to-understand',
    title: 'BNSS 2023 vs CrPC 1973',
    subtitle: 'Zero FIR, Forensic Mandates & Time-Bound Trials',
    cluster: 'bns',
    tag: 'PROCEDURAL LAW • ZERO FIR & TIMELINES'
  },
  {
    slug: 'bsa-2023-vs-indian-evidence-act-1872-key-changes',
    title: 'BSA 2023 vs Evidence Act',
    subtitle: 'Electronic Records Admissibility & Section 63 Rules',
    cluster: 'bns',
    tag: 'DIGITAL EVIDENCE • STATUTORY SCHEDULES'
  },
  {
    slug: 'important-bns-provisions-every-law-student-should-study',
    title: 'Important BNS Provisions',
    subtitle: 'Top 25 Substantive Penal Sections for University Exams',
    cluster: 'bns',
    tag: 'CRIMINAL CODE • HIGH-YIELD SECTIONS'
  },
  {
    slug: 'important-bnss-provisions-every-law-student-should-study',
    title: 'Important BNSS Provisions',
    subtitle: 'Essential Procedural Powers, Arrest, Bail & Trial Rules',
    cluster: 'bns',
    tag: 'PROCEDURE CODE • INVESTIGATION & BAIL'
  },
  {
    slug: 'important-bsa-provisions-every-law-student-should-study',
    title: 'Important BSA Provisions',
    subtitle: 'Admissibility, Primary/Secondary Evidence & Presumptions',
    cluster: 'bns',
    tag: 'EVIDENCE LAW • BURDEN OF PROOF'
  },
  {
    slug: 'how-to-study-bns-bnss-and-bsa-for-law-exams',
    title: 'Studying the 3 New Criminal Laws',
    subtitle: 'Dual-Citation Technique & Transition Exam Strategy',
    cluster: 'bns',
    tag: 'TRANSITION TACTICS • BNS / BNSS / BSA'
  },

  // Cluster D: Case Laws & Legal Concepts
  {
    slug: 'how-to-study-landmark-case-laws-for-llb-exams',
    title: 'How to Study Landmark Case Laws',
    subtitle: 'Extracting Facts, Legal Issues & Majority Holdings',
    cluster: 'caselaw',
    tag: 'CASE BRIEFS • PRECEDENT EXTRACTION'
  },
  {
    slug: 'how-to-write-a-case-law-answer-in-university-exam',
    title: 'Writing Case Law Answers',
    subtitle: 'Citing Ratios, Distinguishing Facts & Proving Relevance',
    cluster: 'caselaw',
    tag: 'CASE CITATIONS • EXAM SCRIPTS'
  },
  {
    slug: 'ratio-decidendi-vs-obiter-dicta-guide',
    title: 'Ratio Decidendi vs Obiter Dicta',
    subtitle: 'Understanding Binding Precedent vs Judicial Passing Remarks',
    cluster: 'caselaw',
    tag: 'JURISPRUDENCE • ARTICLE 141'
  },
  {
    slug: 'what-is-precedent-in-indian-law',
    title: 'Doctrine of Precedent in India',
    subtitle: 'Stare Decisis, Hierarchy of Courts & Constitutional Mandate',
    cluster: 'caselaw',
    tag: 'STARE DECISIS • SUPREME COURT RATIOS'
  },
  {
    slug: 'how-to-find-relevant-case-laws-for-a-law-subject',
    title: 'Finding Relevant Case Laws',
    subtitle: 'Researching Supreme Court & Gujarat High Court Judgments',
    cluster: 'caselaw',
    tag: 'LEGAL RESEARCH • REPERTORY DIGESTS'
  },
  {
    slug: 'how-to-read-and-understand-a-supreme-court-judgment',
    title: 'Reading Supreme Court Judgments',
    subtitle: 'Navigating Concurring, Dissenting & Majority Opinions',
    cluster: 'caselaw',
    tag: 'JUDGMENT ANALYSIS • JUDICIAL REASONING'
  },

  // Cluster E: Career & Legal Skills
  {
    slug: 'legal-drafting-basics-how-students-can-start-learning',
    title: 'Legal Drafting Basics for Students',
    subtitle: 'Order 6 CPC Pleadings, Plaints, Petitions & Legal Notices',
    cluster: 'skills',
    tag: 'CIVIL PLEADINGS • ORDER 6 CPC RULES'
  },
  {
    slug: 'moot-court-preparation-guide-for-llb-students',
    title: 'Moot Court Preparation Guide',
    subtitle: 'Proposition Analysis, Memorial Drafting & Oral Advocacy',
    cluster: 'skills',
    tag: 'MOOT ADVOCACY • APPELLATE ARGUMENTATION'
  }
];

function generateSvg(art) {
  const c = clusters[art.cluster];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg-grad-${escapeXml(art.slug)}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.bg1}" />
      <stop offset="100%" stop-color="${c.bg2}" />
    </linearGradient>
    <linearGradient id="accent-grad-${escapeXml(art.slug)}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c.accent1}" />
      <stop offset="100%" stop-color="${c.accent2}" />
    </linearGradient>
    <pattern id="grid-${escapeXml(art.slug)}" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
    <filter id="glow-${escapeXml(art.slug)}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="1200" height="630" fill="url(#bg-grad-${escapeXml(art.slug)})"/>
  <rect width="1200" height="630" fill="url(#grid-${escapeXml(art.slug)})"/>

  <!-- Ambient Glow Orbs -->
  <circle cx="1050" cy="150" r="280" fill="${c.accent1}" opacity="0.12" filter="url(#glow-${escapeXml(art.slug)})"/>
  <circle cx="150" cy="500" r="200" fill="${c.accent2}" opacity="0.08" filter="url(#glow-${escapeXml(art.slug)})"/>

  <!-- Decorative Border Frame -->
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>

  <!-- Header Branding & Category Badge -->
  <g transform="translate(80, 95)">
    <!-- LowStudy Logo Pill -->
    <rect x="0" y="0" width="140" height="34" rx="17" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="22" y="22" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#F8FAFC" letter-spacing="1">LOWSTUDY</text>
    
    <!-- Category Pill -->
    <rect x="155" y="0" width="220" height="34" rx="17" fill="${c.accent1}" fill-opacity="0.15" stroke="${c.accent1}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="175" y="22" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="${c.accent1}" letter-spacing="0.5">${escapeXml(c.badge)}</text>
  </g>

  <!-- Article Title & Subtitle Content -->
  <g transform="translate(80, 240)">
    <!-- Subtitle / Tag -->
    <text x="0" y="0" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="${c.accent1}" letter-spacing="2">${escapeXml(art.tag)}</text>

    <!-- Main Title -->
    <text x="0" y="65" font-family="'Merriweather', Georgia, serif" font-size="44" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${escapeXml(art.title)}</text>

    <!-- Subtitle description -->
    <text x="0" y="125" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400" fill="#94A3B8">${escapeXml(art.subtitle)}</text>
  </g>

  <!-- Bottom Badges & Verified Seal -->
  <g transform="translate(80, 500)">
    <line x1="0" y1="-25" x2="1040" y2="-25" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    
    <text x="0" y="15" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B">Curated by LowStudy Legal Editorial Team</text>
    <text x="360" y="15" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B">•</text>
    <text x="380" y="15" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#64748B">Syllabus Aligned &amp; Statutorily Verified</text>

    <rect x="880" y="-8" width="160" height="34" rx="10" fill="url(#accent-grad-${escapeXml(art.slug)})"/>
    <text x="912" y="14" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#0F172A">READ GUIDE →</text>
  </g>

  <!-- Legal Art Graphic / Silhouette on Right -->
  <g transform="translate(920, 180)" opacity="0.85">
    <circle cx="100" cy="100" r="90" fill="none" stroke="${c.accent1}" stroke-width="1.5" stroke-dasharray="4 4"/>
    <circle cx="100" cy="100" r="70" fill="rgba(255,255,255,0.02)"/>
    <!-- Scales / Emblem Graphic -->
    <path d="M 100 45 L 100 155 M 65 65 L 135 65 M 65 65 L 45 105 L 85 105 Z M 135 65 L 115 105 L 155 105 Z M 80 155 L 120 155" fill="none" stroke="${c.accent1}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

async function buildAllImages() {
  console.log('Generating 30 valid SVGs and WebPs...');
  
  for (const art of articles) {
    const svgContent = generateSvg(art);
    const svgPath = path.join(outDir, `${art.slug}.svg`);
    const webpPath = path.join(outDir, `${art.slug}.webp`);
    
    // 1. Write SVG
    fs.writeFileSync(svgPath, svgContent, 'utf-8');
    
    // 2. Convert to WebP using Sharp
    await sharp(Buffer.from(svgContent))
      .resize(1200, 630)
      .webp({ quality: 92 })
      .toFile(webpPath);
      
    console.log(`✓ Created: ${art.slug}.svg and ${art.slug}.webp`);
  }

  // Generate Fallback image
  const fallbackArt = {
    slug: 'blog-fallback',
    title: 'LowStudy Law Academic Guide',
    subtitle: 'Verified Legal Notes, Syllabi & Case Briefs for Law Students',
    cluster: 'university',
    tag: 'LOWSTUDY LEGAL ACADEMY'
  };

  const fallbackSvg = generateSvg(fallbackArt);
  fs.writeFileSync(path.join(outDir, 'blog-fallback.svg'), fallbackSvg, 'utf-8');
  await sharp(Buffer.from(fallbackSvg))
    .resize(1200, 630)
    .webp({ quality: 92 })
    .toFile(path.join(outDir, 'blog-fallback.webp'));

  console.log('✓ Created: blog-fallback.svg and blog-fallback.webp');
  console.log('All 30 + fallback images generated with 100% valid XML and WebP buffers!');
}

buildAllImages();
