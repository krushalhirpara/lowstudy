import prisma from '../prisma.js';

// Canonical base URL for technical SEO
export const SITE_URL = 'https://lowstudy.com';

/**
 * Clean slugify function for generating URL-safe strings
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word characters
    .trim()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-'); // remove consecutive hyphens
}

/**
 * Predefined canonical subject mapping for Saurashtra University LL.B. Semester 3
 */
export const SU_SEM3_SUBJECT_MAP = {
  'labour-and-industrial-law-1': {
    id: 'su-sem3-220301',
    code: '220301',
    title: 'Labour and Industrial Law - I',
    canonicalSlug: 'labour-and-industrial-law-1',
    aliases: ['labour-law-1', '220301', 'su-sem3-220301', 'labour-and-industrial-law-i'],
    description: 'Comprehensive study notes, bare act analysis of The Industrial Disputes Act 1947, Trade Unions Act 1926, and Gujarat Industrial Relations Act for Saurashtra University LL.B. Semester 3.',
    actName: 'The Industrial Disputes Act, 1947 & Trade Unions Act, 1926',
    credits: 5,
    color: 'from-blue-600 to-indigo-900',
  },
  'labour-and-industrial-law-2': {
    id: 'su-sem3-220302',
    code: '220302',
    title: 'Labour and Industrial Law - II',
    canonicalSlug: 'labour-and-industrial-law-2',
    aliases: ['labour-law-2', '220302', 'su-sem3-220302', 'labour-and-industrial-law-ii'],
    description: 'Statutory examination of Factories Act 1948, Minimum Wages Act 1948, Payment of Wages Act 1936, ESI Act 1948, and Employee Compensation Act for Saurashtra University exams.',
    actName: 'Factories Act, 1948 & Social Security Legislations',
    credits: 5,
    color: 'from-cyan-600 to-blue-900',
  },
  'principles-of-taxation-laws': {
    id: 'su-sem3-220303',
    code: '220303',
    title: 'Principles of Taxation Laws',
    canonicalSlug: 'principles-of-taxation-laws',
    aliases: ['taxation-laws', 'tax-law', '220303', 'su-sem3-220303'],
    description: 'In-depth legal breakdown of Constitutional taxation provisions, Income Tax Act 1961 heads of income, deductions, assessment procedure, and Goods & Services Tax (GST).',
    actName: 'Income Tax Act, 1961 & Central GST Act, 2017',
    credits: 5,
    color: 'from-emerald-600 to-teal-900',
  },
  'principal-of-banking-laws': {
    id: 'su-sem3-220304',
    code: '220304',
    title: 'Principal of Banking Laws',
    canonicalSlug: 'principal-of-banking-laws',
    aliases: ['banking-laws', 'bank-law', '220304', 'su-sem3-220304', 'principles-of-banking-laws'],
    description: 'Rigorous legal analysis of Reserve Bank of India Act 1934, Banking Regulation Act 1949, Banker-Customer relationship, Negotiable Instruments Act 1881, SARFAESI, and DRT.',
    actName: 'Banking Regulation Act, 1949 & RBI Act, 1934',
    credits: 5,
    color: 'from-amber-600 to-orange-900',
  },
  'information-technology-laws-and-cyber-crimes': {
    id: 'su-sem3-220305',
    code: '220305',
    title: 'Information Technology Laws and Cyber Crimes',
    canonicalSlug: 'information-technology-laws-and-cyber-crimes',
    aliases: ['cyber-it-laws', 'cyber-laws', 'it-act', '220305', 'su-sem3-220305', 'information-technology-law'],
    description: 'Master Information Technology Act 2000, electronic records, cyber offences, intermediary liability under Section 79, cyberspace jurisdiction, digital evidence, and DPDP Act 2023.',
    actName: 'Information Technology Act, 2000 & DPDP Act, 2023',
    credits: 5,
    color: 'from-purple-600 to-indigo-950',
  },
};

/**
 * Resolve Subject by slug or alias
 */
export function resolveSubjectSlug(slugOrCode) {
  if (!slugOrCode) return null;
  const clean = slugOrCode.toLowerCase().trim();
  for (const [canonical, data] of Object.entries(SU_SEM3_SUBJECT_MAP)) {
    if (canonical === clean || data.code === clean || data.aliases.includes(clean)) {
      return data;
    }
  }
  return null;
}

/**
 * Get University Data with full accreditation and campus metadata
 */
export async function getUniversityData() {
  const uni = await prisma.university.findUnique({
    where: { id: 'su' },
    include: {
      courses: {
        where: { isActive: true },
        include: {
          semesters: {
            orderBy: { semesterNumber: 'asc' },
          },
        },
      },
    },
  });

  return {
    id: uni?.id || 'su',
    name: uni?.name || 'Saurashtra University',
    code: uni?.code || 'SU',
    city: uni?.city || 'Rajkot',
    state: uni?.state || 'Gujarat',
    country: 'India',
    establishedYear: 1967,
    naacGrade: 'A Grade accredited by NAAC',
    ugcRecognition: 'Recognized under Section 2(f) & 12(B) of UGC Act, 1956',
    bciRecognition: 'Recognized by the Bar Council of India (BCI)',
    canonicalUrl: `${SITE_URL}/saurashtra-university/`,
    description: 'Saurashtra University Faculty of Law is premier public legal education institution in Rajkot, Gujarat. Providing Bar Council of India (BCI) compliant 3-Year LL.B. and 2-Year LL.M. degree curricula.',
    address: {
      streetAddress: 'University Road',
      addressLocality: 'Rajkot',
      addressRegion: 'Gujarat',
      postalCode: '360005',
      addressCountry: 'IN',
    },
    courses: uni?.courses || [],
  };
}

/**
 * Get LL.B. Course Data for Saurashtra University
 */
export async function getCourseData(courseCode = 'llb') {
  const uni = await getUniversityData();
  const course = await prisma.course.findFirst({
    where: {
      universityId: 'su',
      code: { in: ['LLB-3YR', 'LLB', 'llb'] },
    },
    include: {
      semesters: {
        orderBy: { semesterNumber: 'asc' },
        include: {
          subjects: {
            where: { isActive: true },
          },
        },
      },
    },
  });

  return {
    id: course?.id || 'su-llb-3yr',
    name: course?.name || 'Bachelor of Laws (LL.B.)',
    code: 'LLB',
    university: uni,
    durationYears: 3,
    totalSemesters: course?.totalSemesters || 6,
    eligibility: 'Graduation in any discipline with minimum 45% (40% for SC/ST)',
    regulatoryBody: 'Bar Council of India (BCI) & UGC',
    examinationPattern: 'Choice Based Credit System (CBCS) — 70 Marks University Exam + 30 Marks Continuous Internal Assessment',
    canonicalUrl: `${SITE_URL}/saurashtra-university/llb/`,
    description: 'Saurashtra University 3-Year LL.B. degree program comprehensive curriculum, semester syllabus breakdown, prescribed bare acts, legal notes, question banks, and mock test preparation.',
    semesters: course?.semesters || [],
  };
}

/**
 * Get Semester 3 Data for Saurashtra University LL.B.
 */
export async function getSemesterData(semesterNum = 3) {
  const course = await getCourseData('llb');
  const sem = await prisma.semester.findFirst({
    where: {
      courseId: course.id,
      semesterNumber: semesterNum,
    },
    include: {
      subjects: {
        where: { isActive: true },
        include: {
          units: {
            orderBy: { unitNumber: 'asc' },
            include: {
              topics: {
                orderBy: { topicNumber: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  // Enhance subjects with canonical slugs
  const enrichedSubjects = (sem?.subjects || []).map((sub) => {
    const matched = resolveSubjectSlug(sub.shortCode) || resolveSubjectSlug(sub.title);
    return {
      ...sub,
      canonicalSlug: matched ? matched.canonicalSlug : slugify(sub.title),
      credits: sub.credits || 4,
      totalUnits: sub.units?.length || 4,
      totalTopics: sub.units?.reduce((acc, u) => acc + (u.topics?.length || 0), 0) || 0,
    };
  });

  return {
    id: sem?.id || 'su-llb-3yr-sem3',
    semesterNumber: semesterNum,
    title: sem?.title || 'Semester 3',
    course,
    university: course.university,
    totalCredits: enrichedSubjects.reduce((acc, s) => acc + (s.credits || 4), 0),
    canonicalUrl: `${SITE_URL}/saurashtra-university/llb/semester-${semesterNum}/`,
    description: `Complete syllabus, exam notes, model questions, and statutory analysis for Saurashtra University LL.B. Semester ${semesterNum}. Covers Labour Laws I & II, Taxation Laws, Banking Laws, and IT & Cyber Crimes.`,
    subjects: enrichedSubjects,
  };
}

/**
 * Get Subject Data with its 4 Units, Topics, and References
 */
export async function getSubjectData(subjectSlug) {
  const resolved = resolveSubjectSlug(subjectSlug);
  if (!resolved) return null;

  const sem = await getSemesterData(3);
  const subject = await prisma.subject.findFirst({
    where: {
      id: resolved.id,
    },
    include: {
      units: {
        orderBy: { unitNumber: 'asc' },
        include: {
          topics: {
            orderBy: { topicNumber: 'asc' },
            include: {
              notes: { where: { status: 'PUBLISHED' } },
              questions: { where: { status: 'PUBLISHED' } },
              mcqs: true,
            },
          },
        },
      },
    },
  });

  if (!subject) return null;

  const canonicalUrl = `${SITE_URL}/saurashtra-university/llb/semester-3/${resolved.canonicalSlug}/`;

  // Enhance units with slug and topic counts
  const units = subject.units.map((u) => {
    const unitSlug = `unit-${u.unitNumber}`;
    return {
      ...u,
      slug: unitSlug,
      canonicalUrl: `${SITE_URL}/saurashtra-university/llb/semester-3/${resolved.canonicalSlug}/unit/${unitSlug}/`,
      topics: u.topics.map((t) => ({
        ...t,
        slug: slugify(t.title),
        canonicalUrl: `${SITE_URL}/saurashtra-university/llb/semester-3/${resolved.canonicalSlug}/topic/${slugify(t.title)}/`,
      })),
    };
  });

  return {
    ...subject,
    canonicalSlug: resolved.canonicalSlug,
    canonicalUrl,
    semester: sem,
    university: sem.university,
    course: sem.course,
    units,
    metaDescription: resolved.description,
  };
}

/**
 * Get Unit Data with all Topics, Syllabus outline, Statutory framework
 */
export async function getUnitData(subjectSlug, unitSlug) {
  const subject = await getSubjectData(subjectSlug);
  if (!subject) return null;

  // unitSlug could be 'unit-1', '1', 'unit-2', etc.
  const cleanUnitSlug = unitSlug.toLowerCase().trim();
  const unitNum = parseInt(cleanUnitSlug.replace('unit-', ''), 10) || 1;

  const unit = subject.units.find((u) => u.unitNumber === unitNum || u.slug === cleanUnitSlug);
  if (!unit) return null;

  const canonicalUrl = `${SITE_URL}/saurashtra-university/llb/semester-3/${subject.canonicalSlug}/unit/${unit.slug}/`;

  return {
    ...unit,
    subject,
    semester: subject.semester,
    course: subject.course,
    university: subject.university,
    canonicalUrl,
    metaDescription: `Syllabus notes and exam guide for ${subject.title}, Unit ${unit.unitNumber}: ${unit.title}. Covers statutory sections, judicial precedents, and model questions.`,
  };
}

/**
 * Parse rich JSON answer if available
 */
function parseModelAnswer(answerText) {
  if (!answerText) return null;
  try {
    if (answerText.trim().startsWith('{')) {
      return JSON.parse(answerText);
    }
  } catch (e) {
    // fallback
  }
  return {
    detailedExplanation: answerText,
  };
}

/**
 * Get Topic Data with 100% Comprehensive Educational Content (No thin content!)
 */
export async function getTopicData(subjectSlug, topicSlug) {
  const subject = await getSubjectData(subjectSlug);
  if (!subject) return null;

  const cleanTopicSlug = topicSlug.toLowerCase().trim();

  // Find matching topic across units
  let matchedTopic = null;
  let parentUnit = null;

  for (const unit of subject.units) {
    for (const t of unit.topics) {
      if (t.slug === cleanTopicSlug || t.id === cleanTopicSlug || slugify(t.title) === cleanTopicSlug) {
        matchedTopic = t;
        parentUnit = unit;
        break;
      }
    }
    if (matchedTopic) break;
  }

  // Fallback: check database directly
  if (!matchedTopic) {
    const dbTopic = await prisma.topic.findFirst({
      where: {
        unit: { subjectId: subject.id },
        OR: [
          { id: cleanTopicSlug },
          { title: { contains: cleanTopicSlug.replace(/-/g, ' ') } },
        ],
      },
      include: {
        unit: true,
        notes: { where: { status: 'PUBLISHED' } },
        questions: {
          where: { status: 'PUBLISHED' },
          include: { answers: true },
        },
        mcqs: true,
        legalSections: true,
        caseLaws: true,
      },
    });

    if (dbTopic) {
      parentUnit = subject.units.find((u) => u.id === dbTopic.unitId) || {
        ...dbTopic.unit,
        slug: `unit-${dbTopic.unit.unitNumber}`,
      };
      matchedTopic = {
        ...dbTopic,
        slug: slugify(dbTopic.title),
      };
    }
  } else {
    // Fetch full topic data with relations
    matchedTopic = await prisma.topic.findUnique({
      where: { id: matchedTopic.id },
      include: {
        notes: { where: { status: 'PUBLISHED' } },
        questions: {
          where: { status: 'PUBLISHED' },
          include: { answers: true },
        },
        mcqs: true,
        legalSections: true,
        caseLaws: true,
      },
    });
    matchedTopic = {
      ...matchedTopic,
      slug: slugify(matchedTopic.title),
    };
  }

  if (!matchedTopic) return null;

  const canonicalUrl = `${SITE_URL}/saurashtra-university/llb/semester-3/${subject.canonicalSlug}/topic/${matchedTopic.slug}/`;

  // Parse notes and model answers
  const primaryNote = matchedTopic.notes?.[0] || null;
  const keyPoints = primaryNote?.keyPoints ? (typeof primaryNote.keyPoints === 'string' ? JSON.parse(primaryNote.keyPoints) : primaryNote.keyPoints) : [];
  const mnemonics = primaryNote?.mnemonics ? (typeof primaryNote.mnemonics === 'string' ? JSON.parse(primaryNote.mnemonics) : primaryNote.mnemonics) : [];

  // Parse model answers from questions
  const enrichedQuestions = (matchedTopic.questions || []).map((q) => {
    const rawAnswer = q.answers?.[0]?.answerText;
    const parsed = parseModelAnswer(rawAnswer);
    return {
      ...q,
      answer: parsed,
      isLongEssay: q.marks >= 10,
    };
  });

  // Find previous and next topics for internal syllabus navigation
  const allSubjectTopics = subject.units.flatMap((u) => u.topics);
  const currentIndex = allSubjectTopics.findIndex((t) => t.id === matchedTopic.id || t.slug === matchedTopic.slug);
  const prevTopic = currentIndex > 0 ? allSubjectTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allSubjectTopics.length - 1 ? allSubjectTopics[currentIndex + 1] : null;

  return {
    ...matchedTopic,
    parentUnit,
    subject,
    semester: subject.semester,
    course: subject.course,
    university: subject.university,
    canonicalUrl,
    primaryNote,
    keyPoints,
    mnemonics,
    enrichedQuestions,
    prevTopic,
    nextTopic,
    metaDescription: `Complete exam notes on ${matchedTopic.title} for Saurashtra University LL.B. Semester 3 (${subject.title}). Includes statutory sections, judicial precedents, and model answers.`,
  };
}

/**
 * ============================================================================
 * SCHEMA.ORG JSON-LD GENERATORS
 * ============================================================================
 */

/**
 * Breadcrumb Schema Generator
 */
export function generateBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * University Schema Generator
 */
export function generateUniversitySchema(uni) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.name,
    alternateName: ['SU', 'Saurashtra University Rajkot'],
    url: uni.canonicalUrl,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    description: uni.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: uni.address.streetAddress,
      addressLocality: uni.address.addressLocality,
      addressRegion: uni.address.addressRegion,
      postalCode: uni.address.postalCode,
      addressCountry: uni.address.addressCountry,
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Bachelor of Laws (LL.B.)',
      credentialCategory: 'degree',
    },
  };
}

/**
 * Course Schema Generator
 */
export function generateCourseSchema(course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${course.name} - Saurashtra University`,
    description: course.description,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: course.university.name,
      url: course.university.canonicalUrl,
    },
    educationalCredentialAwarded: 'LL.B. Degree',
    timeRequired: 'P3Y', // 3 years ISO duration
    occupationalCredentialAwarded: 'Advocate (Eligible for Bar Council Enrollment)',
    url: course.canonicalUrl,
  };
}

/**
 * Semester WebPage Schema Generator
 */
export function generateSemesterSchema(sem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalWebPage',
    name: `${sem.course.name} ${sem.title} Syllabus & Preparation Guide`,
    description: sem.description,
    url: sem.canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: 'LowStudy',
      url: SITE_URL,
    },
    about: {
      '@type': 'Course',
      name: `Saurashtra University LL.B. ${sem.title}`,
      provider: {
        '@type': 'CollegeOrUniversity',
        name: sem.university.name,
      },
    },
  };
}

/**
 * Subject Schema Generator
 */
export function generateSubjectSchema(subject) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${subject.title} - Saurashtra University LL.B. Semester 3`,
    description: subject.description || subject.metaDescription,
    courseCode: subject.shortCode,
    url: subject.canonicalUrl,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: subject.university.name,
      url: subject.university.canonicalUrl,
    },
    educationalLevel: 'Undergraduate Law (LL.B.)',
    numberOfCredits: subject.credits || 4,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Blended / Self-Study & University Examination',
    },
  };
}

/**
 * Unit Schema Generator
 */
export function generateUnitSchema(unit) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Unit ${unit.unitNumber}: ${unit.title} — ${unit.subject.title}`,
    description: unit.metaDescription,
    url: unit.canonicalUrl,
    educationalAlignment: {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      targetName: unit.subject.title,
    },
    isPartOf: {
      '@type': 'Course',
      name: unit.subject.title,
      url: unit.subject.canonicalUrl,
    },
  };
}

/**
 * Topic Schema Generator (Article + LearningResource + FAQPage for maximum Google SERP rich results)
 */
export function generateTopicSchema(topic) {
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${topic.title} — Saurashtra University LL.B. Study Notes`,
      description: topic.metaDescription,
      url: topic.canonicalUrl,
      author: {
        '@type': 'Organization',
        name: 'LowStudy Legal Research Board',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'LowStudy',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/icons/icon-512x512.png`,
        },
      },
      mainEntityOfPage: topic.canonicalUrl,
      datePublished: topic.createdAt ? topic.createdAt.toISOString() : '2026-01-01T00:00:00Z',
      dateModified: topic.updatedAt ? topic.updatedAt.toISOString() : '2026-09-20T00:00:00Z',
      articleSection: `${topic.subject.title} - Unit ${topic.parentUnit.unitNumber}`,
      about: {
        '@type': 'Thing',
        name: topic.title,
      },
    },
  ];

  // Add FAQ schema if there are model practice questions
  if (topic.enrichedQuestions && topic.enrichedQuestions.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: topic.enrichedQuestions.slice(0, 5).map((q) => ({
        '@type': 'Question',
        name: q.questionText,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer?.detailedExplanation || q.answer?.introduction || 'Comprehensive answer formulation according to Bar Council of India standards.',
        },
      })),
    });
  }

  return schemas;
}
