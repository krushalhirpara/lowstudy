import prisma from '../prisma.js';
import fs from 'fs';
import path from 'path';

/**
 * Settings persistence helper.
 * Reads and writes platform configuration (AdSense, system flags) from a persistent JSON file.
 */
const SETTINGS_FILE = path.join(process.cwd(), 'src', 'data', 'platformSettings.json');

export function getPlatformSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading platform settings:', e.message);
  }
  return {
    adsEnabled: true,
    premiumGating: true,
    adSensePublisherId: 'ca-pub-6428712390812345',
    adSlots: {
      headerBanner: '1234567890',
      inArticle: '2345678901',
      sidebar: '3456789012',
    },
    maintenanceMode: false,
    systemNotice: '',
    autoSyncSyllabus: true,
  };
}

export function savePlatformSettings(newSettings) {
  try {
    const current = getPlatformSettings();
    const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (e) {
    console.error('Error saving platform settings:', e.message);
    throw e;
  }
}

/**
 * Platform Stats Aggregator for Admin Dashboard
 */
export async function getAdminStats() {
  const [
    universities,
    courses,
    semesters,
    subjects,
    units,
    topics,
    notes,
    legalSections,
    caseLaws,
    questions,
    mcqs,
    previousPapers,
    mockTests,
    students,
    aiContent,
    contentReviews,
    testAttempts,
  ] = await Promise.all([
    prisma.university.count(),
    prisma.course.count(),
    prisma.semester.count(),
    prisma.subject.count(),
    prisma.unit.count(),
    prisma.topic.count(),
    prisma.note.count(),
    prisma.legalSection.count(),
    prisma.caseLaw.count(),
    prisma.question.count(),
    prisma.mcq.count(),
    prisma.previousPaper.count(),
    prisma.mockTest.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.aiContent.count(),
    prisma.contentReview.count(),
    prisma.testAttempt.count(),
  ]);

  const pendingReviews = await prisma.aiContent.count({
    where: { workflowStage: { in: ['AI_GENERATED', 'DRAFT', 'ADMIN_REVIEW'] } },
  });

  const verifiedAiContent = await prisma.aiContent.count({
    where: { verificationStatus: 'VERIFIED' },
  });

  const settings = getPlatformSettings();

  return {
    counts: {
      universities,
      courses,
      semesters,
      subjects,
      units,
      topics,
      notes,
      legalSections,
      caseLaws,
      questions,
      mcqs,
      previousPapers,
      mockTests,
      students,
      aiContent,
      contentReviews,
      testAttempts,
      pendingReviews,
      verifiedAiContent,
    },
    settings,
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// 1. UNIVERSITIES CRUD
// ==========================================
export async function getUniversities({ search = '', status = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
      { city: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const [items, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { courses: true, subjects: true, previousPapers: true },
        },
      },
    }),
    prisma.university.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createUniversity(data) {
  if (!data.name || !data.code || !data.city) {
    throw new Error('Name, code, and city are required fields.');
  }

  const codeUpper = data.code.trim().toUpperCase();
  const id = data.id || codeUpper.toLowerCase();

  return await prisma.university.create({
    data: {
      id,
      name: data.name.trim(),
      code: codeUpper,
      city: data.city.trim(),
      district: data.district || null,
      state: data.state || 'Gujarat',
      type: data.type || 'State Public University',
      established: data.established ? parseInt(data.established, 10) : null,
      logo: data.logo || null,
      officialWebsite: data.officialWebsite || null,
      officialSyllabusSource: data.officialSyllabusSource || null,
      status: data.status || 'VERIFIED',
      academicYear: data.academicYear || '2026-27',
    },
  });
}

export async function updateUniversity(id, data) {
  return await prisma.university.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      ...(data.city && { city: data.city.trim() }),
      ...(data.district !== undefined && { district: data.district }),
      ...(data.state && { state: data.state }),
      ...(data.type && { type: data.type }),
      ...(data.established !== undefined && { established: data.established ? parseInt(data.established, 10) : null }),
      ...(data.logo !== undefined && { logo: data.logo }),
      ...(data.officialWebsite !== undefined && { officialWebsite: data.officialWebsite }),
      ...(data.officialSyllabusSource !== undefined && { officialSyllabusSource: data.officialSyllabusSource }),
      ...(data.status && { status: data.status }),
      ...(data.academicYear && { academicYear: data.academicYear }),
    },
  });
}

export async function deleteUniversity(id) {
  return await prisma.university.delete({
    where: { id },
  });
}

export async function toggleUniversityPublish(id) {
  const current = await prisma.university.findUnique({ where: { id } });
  if (!current) throw new Error('University not found');
  const newStatus = current.status === 'VERIFIED' ? 'PENDING_REVIEW' : 'VERIFIED';
  return await prisma.university.update({
    where: { id },
    data: { status: newStatus },
  });
}

// ==========================================
// 2. COURSES CRUD
// ==========================================
export async function getCourses({ universityId = '', search = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};

  if (universityId) where.universityId = universityId;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        university: { select: { id: true, name: true, code: true } },
        _count: { select: { semesters: true, subjects: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createCourse(data) {
  if (!data.universityId || !data.name || !data.code) {
    throw new Error('universityId, name, and code are required.');
  }

  const id = data.id || `${data.universityId}-${data.code}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  return await prisma.course.create({
    data: {
      id,
      universityId: data.universityId,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      totalSemesters: data.totalSemesters ? parseInt(data.totalSemesters, 10) : 6,
      description: data.description || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
}

export async function updateCourse(id, data) {
  return await prisma.course.update({
    where: { id },
    data: {
      ...(data.universityId && { universityId: data.universityId }),
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      ...(data.totalSemesters && { totalSemesters: parseInt(data.totalSemesters, 10) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
    },
  });
}

export async function deleteCourse(id) {
  return await prisma.course.delete({
    where: { id },
  });
}

// ==========================================
// 3. SEMESTERS CRUD
// ==========================================
export async function getSemesters({ courseId = '', page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (courseId) where.courseId = courseId;

  const [items, total] = await Promise.all([
    prisma.semester.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ courseId: 'asc' }, { semesterNumber: 'asc' }],
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            university: { select: { id: true, name: true, code: true } },
          },
        },
        _count: { select: { subjects: true } },
      },
    }),
    prisma.semester.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createSemester(data) {
  if (!data.courseId || data.semesterNumber === undefined) {
    throw new Error('courseId and semesterNumber are required.');
  }

  const semNum = parseInt(data.semesterNumber, 10);
  const id = data.id || `${data.courseId}-sem${semNum}`.toLowerCase();
  const title = data.title || `Semester ${semNum}`;

  return await prisma.semester.create({
    data: {
      id,
      courseId: data.courseId,
      semesterNumber: semNum,
      title,
    },
  });
}

export async function updateSemester(id, data) {
  return await prisma.semester.update({
    where: { id },
    data: {
      ...(data.courseId && { courseId: data.courseId }),
      ...(data.semesterNumber !== undefined && { semesterNumber: parseInt(data.semesterNumber, 10) }),
      ...(data.title && { title: data.title.trim() }),
    },
  });
}

export async function deleteSemester(id) {
  return await prisma.semester.delete({
    where: { id },
  });
}

// ==========================================
// 4. SUBJECTS CRUD
// ==========================================
export async function getSubjects({
  universityId = '',
  courseId = '',
  semesterId = '',
  category = '',
  syllabusVersion = '',
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};

  if (universityId) where.universityId = universityId;
  if (courseId) where.courseId = courseId;
  if (semesterId) where.semesterId = semesterId;
  if (category) where.category = category;
  if (syllabusVersion) where.syllabusVersion = syllabusVersion;

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { shortCode: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.subject.findMany({
      where,
      skip,
      take: limit,
      orderBy: { title: 'asc' },
      include: {
        university: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, semesterNumber: true, title: true } },
        _count: { select: { units: true, mcqs: true, previousPapers: true } },
      },
    }),
    prisma.subject.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createSubject(data) {
  if (!data.universityId || !data.courseId || !data.semesterId || !data.title || !data.shortCode) {
    throw new Error('universityId, courseId, semesterId, title, and shortCode are required.');
  }

  const id =
    data.id ||
    `${data.semesterId}-${data.shortCode}-${data.syllabusVersion || 'new'}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

  return await prisma.subject.create({
    data: {
      id,
      universityId: data.universityId,
      courseId: data.courseId,
      semesterId: data.semesterId,
      title: data.title.trim(),
      shortCode: data.shortCode.trim().toUpperCase(),
      category: data.category || 'Core Law',
      credits: data.credits ? parseInt(data.credits, 10) : 4,
      syllabusVersion: data.syllabusVersion || 'new',
      color: data.color || 'from-blue-600 to-indigo-900',
      description: data.description || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
}

export async function updateSubject(id, data) {
  return await prisma.subject.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.shortCode && { shortCode: data.shortCode.trim().toUpperCase() }),
      ...(data.category && { category: data.category }),
      ...(data.credits !== undefined && { credits: parseInt(data.credits, 10) }),
      ...(data.syllabusVersion && { syllabusVersion: data.syllabusVersion }),
      ...(data.color && { color: data.color }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      ...(data.semesterId && { semesterId: data.semesterId }),
      ...(data.courseId && { courseId: data.courseId }),
      ...(data.universityId && { universityId: data.universityId }),
    },
  });
}

export async function deleteSubject(id) {
  return await prisma.subject.delete({
    where: { id },
  });
}

// ==========================================
// 5. UNITS CRUD
// ==========================================
export async function getUnits({ subjectId = '', search = '', page = 1, limit = 50 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (subjectId) where.subjectId = subjectId;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ subjectId: 'asc' }, { unitNumber: 'asc' }],
      include: {
        subject: {
          select: {
            id: true,
            title: true,
            shortCode: true,
            semester: { select: { id: true, title: true } },
          },
        },
        _count: { select: { topics: true } },
      },
    }),
    prisma.unit.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createUnit(data) {
  if (!data.subjectId || !data.title || data.unitNumber === undefined) {
    throw new Error('subjectId, title, and unitNumber are required.');
  }

  const unitNum = parseInt(data.unitNumber, 10);
  const id = data.id || `${data.subjectId}-u${unitNum}`.toLowerCase();

  return await prisma.unit.create({
    data: {
      id,
      subjectId: data.subjectId,
      unitNumber: unitNum,
      title: data.title.trim(),
      description: data.description || null,
    },
  });
}

export async function updateUnit(id, data) {
  return await prisma.unit.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.unitNumber !== undefined && { unitNumber: parseInt(data.unitNumber, 10) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.subjectId && { subjectId: data.subjectId }),
    },
  });
}

export async function deleteUnit(id) {
  return await prisma.unit.delete({
    where: { id },
  });
}

// ==========================================
// 6. TOPICS CRUD
// ==========================================
export async function getTopics({ unitId = '', status = '', search = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (unitId) where.unitId = unitId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.topic.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ unitId: 'asc' }, { topicNumber: 'asc' }],
      include: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            title: true,
            subject: { select: { id: true, title: true, shortCode: true } },
          },
        },
        _count: {
          select: {
            notes: true,
            questions: true,
            mcqs: true,
            legalSections: true,
            caseLaws: true,
          },
        },
      },
    }),
    prisma.topic.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createTopic(data) {
  if (!data.unitId || !data.title) {
    throw new Error('unitId and title are required.');
  }

  const topicNum = data.topicNumber ? parseInt(data.topicNumber, 10) : 1;
  const id =
    data.id ||
    `${data.unitId}-t${topicNum}-${data.title.slice(0, 20)}`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

  return await prisma.topic.create({
    data: {
      id,
      unitId: data.unitId,
      topicNumber: topicNum,
      title: data.title.trim(),
      description: data.description || null,
      language: data.language || 'EN',
      status: data.status || 'PUBLISHED',
    },
  });
}

export async function updateTopic(id, data) {
  return await prisma.topic.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.topicNumber !== undefined && { topicNumber: parseInt(data.topicNumber, 10) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.language && { language: data.language }),
      ...(data.status && { status: data.status }),
      ...(data.unitId && { unitId: data.unitId }),
    },
  });
}

export async function deleteTopic(id) {
  return await prisma.topic.delete({
    where: { id },
  });
}

// ==========================================
// 7. NOTES CRUD (Dual English & Gujarati, Exam Answer, Mnemonics)
// ==========================================
export async function getNotes({ topicId = '', language = '', status = '', search = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (topicId) where.topicId = topicId;
  if (language) where.language = language;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { simpleNotes: { contains: search } },
      { detailedNotes: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.note.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            unit: {
              select: {
                id: true,
                title: true,
                subject: { select: { id: true, title: true } },
              },
            },
          },
        },
      },
    }),
    prisma.note.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createNote(data) {
  if (!data.topicId || !data.simpleNotes || !data.detailedNotes) {
    throw new Error('topicId, simpleNotes, and detailedNotes are required.');
  }

  const id = data.id || `note-${data.topicId}-${Date.now()}`.toLowerCase();

  return await prisma.note.create({
    data: {
      id,
      topicId: data.topicId,
      language: data.language || 'EN',
      simpleNotes: data.simpleNotes,
      detailedNotes: data.detailedNotes,
      keyPoints: typeof data.keyPoints === 'object' ? JSON.stringify(data.keyPoints) : data.keyPoints || null,
      mnemonics: typeof data.mnemonics === 'object' ? JSON.stringify(data.mnemonics) : data.mnemonics || null,
      status: data.status || 'PUBLISHED',
      verifiedById: data.verifiedById || null,
    },
  });
}

export async function updateNote(id, data) {
  return await prisma.note.update({
    where: { id },
    data: {
      ...(data.simpleNotes && { simpleNotes: data.simpleNotes }),
      ...(data.detailedNotes && { detailedNotes: data.detailedNotes }),
      ...(data.language && { language: data.language }),
      ...(data.status && { status: data.status }),
      ...(data.keyPoints !== undefined && {
        keyPoints: typeof data.keyPoints === 'object' ? JSON.stringify(data.keyPoints) : data.keyPoints,
      }),
      ...(data.mnemonics !== undefined && {
        mnemonics: typeof data.mnemonics === 'object' ? JSON.stringify(data.mnemonics) : data.mnemonics,
      }),
      ...(data.topicId && { topicId: data.topicId }),
    },
  });
}

export async function deleteNote(id) {
  return await prisma.note.delete({
    where: { id },
  });
}

// ==========================================
// 8. LEGAL SECTIONS CRUD (Bare Acts)
// ==========================================
export async function getLegalSections({ actName = '', status = '', search = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (actName) where.actName = actName;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { sectionNumber: { contains: search } },
      { title: { contains: search } },
      { content: { contains: search } },
      { oldLawSection: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.legalSection.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ actName: 'asc' }, { sectionNumber: 'asc' }],
      include: {
        topic: { select: { id: true, title: true } },
      },
    }),
    prisma.legalSection.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createLegalSection(data) {
  if (!data.actName || !data.sectionNumber || !data.title || !data.content) {
    throw new Error('actName, sectionNumber, title, and content are required.');
  }

  const id =
    data.id ||
    `${data.actName}-${data.sectionNumber}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  return await prisma.legalSection.create({
    data: {
      id,
      topicId: data.topicId || null,
      actName: data.actName.trim(),
      sectionNumber: data.sectionNumber.trim(),
      title: data.title.trim(),
      titleGu: data.titleGu || null,
      content: data.content,
      contentGu: data.contentGu || null,
      oldLawSection: data.oldLawSection || null,
      oldLawAct: data.oldLawAct || null,
      punishment: data.punishment || null,
      punishmentGu: data.punishmentGu || null,
      bailableStatus: data.bailableStatus || null,
      cognizableStatus: data.cognizableStatus || null,
      compoundableStatus: data.compoundableStatus || null,
      status: data.status || 'PUBLISHED',
    },
  });
}

export async function updateLegalSection(id, data) {
  return await prisma.legalSection.update({
    where: { id },
    data: {
      ...(data.actName && { actName: data.actName.trim() }),
      ...(data.sectionNumber && { sectionNumber: data.sectionNumber.trim() }),
      ...(data.title && { title: data.title.trim() }),
      ...(data.titleGu !== undefined && { titleGu: data.titleGu }),
      ...(data.content && { content: data.content }),
      ...(data.contentGu !== undefined && { contentGu: data.contentGu }),
      ...(data.oldLawSection !== undefined && { oldLawSection: data.oldLawSection }),
      ...(data.oldLawAct !== undefined && { oldLawAct: data.oldLawAct }),
      ...(data.punishment !== undefined && { punishment: data.punishment }),
      ...(data.punishmentGu !== undefined && { punishmentGu: data.punishmentGu }),
      ...(data.bailableStatus !== undefined && { bailableStatus: data.bailableStatus }),
      ...(data.cognizableStatus !== undefined && { cognizableStatus: data.cognizableStatus }),
      ...(data.compoundableStatus !== undefined && { compoundableStatus: data.compoundableStatus }),
      ...(data.status && { status: data.status }),
      ...(data.topicId !== undefined && { topicId: data.topicId || null }),
    },
  });
}

export async function deleteLegalSection(id) {
  return await prisma.legalSection.delete({
    where: { id },
  });
}

// ==========================================
// 9. CASE LAWS CRUD
// ==========================================
export async function getCaseLaws({ court = '', importance = '', status = '', search = '', page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (court) where.court = court;
  if (importance) where.importance = importance;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { citation: { contains: search } },
      { keyPrinciple: { contains: search } },
      { subjectName: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.caseLaw.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        topic: { select: { id: true, title: true } },
      },
    }),
    prisma.caseLaw.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createCaseLaw(data) {
  if (!data.title || !data.keyPrinciple || !data.ratioDecidendi) {
    throw new Error('title, keyPrinciple, and ratioDecidendi are required.');
  }

  const id =
    data.id ||
    (data.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 45) + '-' + Date.now().toString().slice(-4));

  return await prisma.caseLaw.create({
    data: {
      id,
      topicId: data.topicId || null,
      title: data.title.trim(),
      citation: data.citation || null,
      year: data.year ? parseInt(data.year, 10) : null,
      court: data.court || 'Supreme Court of India',
      bench: data.bench || null,
      subjectName: data.subjectName || null,
      keyPrinciple: data.keyPrinciple,
      keyPrincipleGu: data.keyPrincipleGu || null,
      facts: data.facts || null,
      issues: data.issues || null,
      argumentsText: data.argumentsText || null,
      judgment: data.judgment || null,
      ratioDecidendi: data.ratioDecidendi,
      ratioDecidendiGu: data.ratioDecidendiGu || null,
      importance: data.importance || 'LANDMARK',
      status: data.status || 'PUBLISHED',
    },
  });
}

export async function updateCaseLaw(id, data) {
  return await prisma.caseLaw.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.citation !== undefined && { citation: data.citation }),
      ...(data.year !== undefined && { year: data.year ? parseInt(data.year, 10) : null }),
      ...(data.court && { court: data.court }),
      ...(data.bench !== undefined && { bench: data.bench }),
      ...(data.subjectName !== undefined && { subjectName: data.subjectName }),
      ...(data.keyPrinciple && { keyPrinciple: data.keyPrinciple }),
      ...(data.keyPrincipleGu !== undefined && { keyPrincipleGu: data.keyPrincipleGu }),
      ...(data.facts !== undefined && { facts: data.facts }),
      ...(data.issues !== undefined && { issues: data.issues }),
      ...(data.argumentsText !== undefined && { argumentsText: data.argumentsText }),
      ...(data.judgment !== undefined && { judgment: data.judgment }),
      ...(data.ratioDecidendi && { ratioDecidendi: data.ratioDecidendi }),
      ...(data.ratioDecidendiGu !== undefined && { ratioDecidendiGu: data.ratioDecidendiGu }),
      ...(data.importance && { importance: data.importance }),
      ...(data.status && { status: data.status }),
      ...(data.topicId !== undefined && { topicId: data.topicId || null }),
    },
  });
}

export async function deleteCaseLaw(id) {
  return await prisma.caseLaw.delete({
    where: { id },
  });
}

// ==========================================
// 10. QUESTIONS & MODEL ANSWERS CRUD
// ==========================================
export async function getQuestions({
  topicId = '',
  difficulty = '',
  priority = '',
  status = '',
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (topicId) where.topicId = topicId;
  if (difficulty) where.difficulty = difficulty;
  if (priority) where.preparationPriority = priority;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { questionText: { contains: search } },
      { questionTextGu: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            unit: {
              select: {
                id: true,
                title: true,
                subject: { select: { id: true, title: true, shortCode: true } },
              },
            },
          },
        },
        answers: {
          select: {
            id: true,
            language: true,
            answerText: true,
            keyPoints: true,
            judicialCitations: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.question.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createQuestion(data) {
  if (!data.topicId || !data.questionText) {
    throw new Error('topicId and questionText are required.');
  }

  const question = await prisma.question.create({
    data: {
      topicId: data.topicId,
      questionText: data.questionText.trim(),
      questionTextGu: data.questionTextGu || null,
      marks: data.marks ? parseInt(data.marks, 10) : 10,
      difficulty: data.difficulty || 'MEDIUM',
      preparationPriority: data.preparationPriority || 'HIGH',
      pyqFrequency: data.pyqFrequency ? parseInt(data.pyqFrequency, 10) : 1,
      questionType: data.questionType || 'DESCRIPTIVE',
      status: data.status || 'PUBLISHED',
    },
  });

  if (data.answerText) {
    await prisma.questionAnswer.create({
      data: {
        questionId: question.id,
        language: data.answerLanguage || 'EN',
        answerText: data.answerText,
        keyPoints: data.keyPoints || null,
        judicialCitations: data.judicialCitations || null,
        modelStructure: data.modelStructure || 'IRAC',
        isVerified: true,
      },
    });
  }

  return question;
}

export async function updateQuestion(id, data) {
  const updated = await prisma.question.update({
    where: { id },
    data: {
      ...(data.questionText && { questionText: data.questionText.trim() }),
      ...(data.questionTextGu !== undefined && { questionTextGu: data.questionTextGu }),
      ...(data.marks !== undefined && { marks: parseInt(data.marks, 10) }),
      ...(data.difficulty && { difficulty: data.difficulty }),
      ...(data.preparationPriority && { preparationPriority: data.preparationPriority }),
      ...(data.priority_label && { 
        priority_label: data.priority_label,
        isManualPriority: true
      }),
      ...(data.why_important !== undefined && { why_important: data.why_important }),
      ...(data.priority_score !== undefined && { priority_score: parseFloat(data.priority_score) }),
      ...(data.pyqFrequency !== undefined && { pyqFrequency: parseInt(data.pyqFrequency, 10) }),
      ...(data.questionType && { questionType: data.questionType }),
      ...(data.status && { status: data.status }),
      ...(data.topicId && { topicId: data.topicId }),
    },
  });

  if (data.answerText) {
    const existing = await prisma.questionAnswer.findFirst({ where: { questionId: id } });
    if (existing) {
      await prisma.questionAnswer.update({
        where: { id: existing.id },
        data: {
          answerText: data.answerText,
          keyPoints: data.keyPoints !== undefined ? data.keyPoints : existing.keyPoints,
          judicialCitations: data.judicialCitations !== undefined ? data.judicialCitations : existing.judicialCitations,
        },
      });
    } else {
      await prisma.questionAnswer.create({
        data: {
          questionId: id,
          language: data.answerLanguage || 'EN',
          answerText: data.answerText,
          keyPoints: data.keyPoints || null,
          judicialCitations: data.judicialCitations || null,
        },
      });
    }
  }

  return updated;
}

export async function deleteQuestion(id) {
  return await prisma.question.delete({
    where: { id },
  });
}

// ==========================================
// 11. MCQS CRUD (Multiple Choice Questions)
// ==========================================
export async function getMcqs({
  topicId = '',
  subjectId = '',
  difficulty = '',
  priority = '',
  status = '',
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (topicId) where.topicId = topicId;
  if (subjectId) where.subjectId = subjectId;
  if (difficulty) where.difficulty = difficulty;
  if (priority) where.preparationPriority = priority;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { questionText: { contains: search } },
      { explanation: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.mcq.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        options: { orderBy: { optionKey: 'asc' } },
        subject: { select: { id: true, title: true, shortCode: true } },
        topic: { select: { id: true, title: true } },
      },
    }),
    prisma.mcq.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createMcq(data) {
  if (!data.questionText || !data.explanation) {
    throw new Error('questionText and explanation are required.');
  }

  const mcq = await prisma.mcq.create({
    data: {
      topicId: data.topicId || null,
      subjectId: data.subjectId || null,
      questionText: data.questionText.trim(),
      questionTextGu: data.questionTextGu || null,
      difficulty: data.difficulty || 'MEDIUM',
      preparationPriority: data.preparationPriority || 'HIGH',
      explanation: data.explanation,
      explanationGu: data.explanationGu || null,
      status: data.status || 'PUBLISHED',
    },
  });

  const rawOptions = data.options || [
    { optionKey: 'A', optionText: data.optA || '', isCorrect: data.correctKey === 'A' },
    { optionKey: 'B', optionText: data.optB || '', isCorrect: data.correctKey === 'B' },
    { optionKey: 'C', optionText: data.optC || '', isCorrect: data.correctKey === 'C' },
    { optionKey: 'D', optionText: data.optD || '', isCorrect: data.correctKey === 'D' },
  ];

  for (const opt of rawOptions) {
    if (opt.optionText) {
      await prisma.mcqOption.create({
        data: {
          mcqId: mcq.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          optionTextGu: opt.optionTextGu || null,
          isCorrect: Boolean(opt.isCorrect),
        },
      });
    }
  }

  return await prisma.mcq.findUnique({
    where: { id: mcq.id },
    include: { options: true },
  });
}

export async function updateMcq(id, data) {
  const updated = await prisma.mcq.update({
    where: { id },
    data: {
      ...(data.questionText && { questionText: data.questionText.trim() }),
      ...(data.questionTextGu !== undefined && { questionTextGu: data.questionTextGu }),
      ...(data.difficulty && { difficulty: data.difficulty }),
      ...(data.preparationPriority && { preparationPriority: data.preparationPriority }),
      ...(data.explanation && { explanation: data.explanation }),
      ...(data.explanationGu !== undefined && { explanationGu: data.explanationGu }),
      ...(data.status && { status: data.status }),
      ...(data.topicId !== undefined && { topicId: data.topicId || null }),
      ...(data.subjectId !== undefined && { subjectId: data.subjectId || null }),
    },
  });

  if (data.options || data.optA || data.correctKey) {
    await prisma.mcqOption.deleteMany({ where: { mcqId: id } });
    const rawOptions = data.options || [
      { optionKey: 'A', optionText: data.optA || '', isCorrect: data.correctKey === 'A' },
      { optionKey: 'B', optionText: data.optB || '', isCorrect: data.correctKey === 'B' },
      { optionKey: 'C', optionText: data.optC || '', isCorrect: data.correctKey === 'C' },
      { optionKey: 'D', optionText: data.optD || '', isCorrect: data.correctKey === 'D' },
    ];

    for (const opt of rawOptions) {
      if (opt.optionText) {
        await prisma.mcqOption.create({
          data: {
            mcqId: id,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            optionTextGu: opt.optionTextGu || null,
            isCorrect: Boolean(opt.isCorrect),
          },
        });
      }
    }
  }

  return await prisma.mcq.findUnique({
    where: { id },
    include: { options: true },
  });
}

export async function deleteMcq(id) {
  return await prisma.mcq.delete({
    where: { id },
  });
}

// ==========================================
// 12. PREVIOUS PAPERS CRUD
// ==========================================
export async function getPreviousPapers({
  universityId = '',
  courseId = '',
  semesterId = '',
  subjectId = '',
  examYear = '',
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (universityId) where.universityId = universityId;
  if (courseId) where.courseId = courseId;
  if (semesterId) where.semesterId = semesterId;
  if (subjectId) where.subjectId = subjectId;
  if (examYear) where.examYear = parseInt(examYear, 10);
  if (search) {
    where.OR = [
      { paperCode: { contains: search } },
      { examSession: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.previousPaper.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ examYear: 'desc' }, { examSession: 'asc' }],
      include: {
        university: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        semester: { select: { id: true, title: true } },
        subject: { select: { id: true, title: true, shortCode: true } },
      },
    }),
    prisma.previousPaper.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createPreviousPaper(data) {
  if (!data.universityId || !data.courseId || !data.semesterId || !data.subjectId || !data.examYear) {
    throw new Error('universityId, courseId, semesterId, subjectId, and examYear are required.');
  }

  const examYear = parseInt(data.examYear, 10);
  const examSession = data.examSession || 'WINTER';
  const id =
    data.id ||
    `${data.subjectId}-${examYear}-${examSession}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  return await prisma.previousPaper.create({
    data: {
      id,
      universityId: data.universityId,
      courseId: data.courseId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      examYear,
      examSession,
      totalMarks: data.totalMarks ? parseInt(data.totalMarks, 10) : 70,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 180,
      paperCode: data.paperCode || null,
      fileUrl: data.fileUrl || null,
    },
  });
}

export async function updatePreviousPaper(id, data) {
  return await prisma.previousPaper.update({
    where: { id },
    data: {
      ...(data.examYear !== undefined && { examYear: parseInt(data.examYear, 10) }),
      ...(data.examSession && { examSession: data.examSession }),
      ...(data.totalMarks !== undefined && { totalMarks: parseInt(data.totalMarks, 10) }),
      ...(data.durationMinutes !== undefined && { durationMinutes: parseInt(data.durationMinutes, 10) }),
      ...(data.paperCode !== undefined && { paperCode: data.paperCode }),
      ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
      ...(data.subjectId && { subjectId: data.subjectId }),
      ...(data.semesterId && { semesterId: data.semesterId }),
      ...(data.courseId && { courseId: data.courseId }),
      ...(data.universityId && { universityId: data.universityId }),
    },
  });
}

export async function deletePreviousPaper(id) {
  return await prisma.previousPaper.delete({
    where: { id },
  });
}

// ==========================================
// 13. MOCK TESTS CRUD
// ==========================================
export async function getMockTests({
  subjectId = '',
  universityId = '',
  isPublished,
  search = '',
  page = 1,
  limit = 20,
} = {}) {
  const skip = (page - 1) * limit;
  const where = {};
  if (subjectId) where.subjectId = subjectId;
  if (universityId) where.universityId = universityId;
  if (isPublished !== undefined && isPublished !== '') {
    where.isPublished = isPublished === 'true' || isPublished === true;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.mockTest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subject: { select: { id: true, title: true, shortCode: true } },
        university: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true, testAttempts: true } },
      },
    }),
    prisma.mockTest.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createMockTest(data) {
  if (!data.title) {
    throw new Error('title is required.');
  }

  const id =
    data.id ||
    data.title.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 50) + '-' + Date.now();

  return await prisma.mockTest.create({
    data: {
      id,
      title: data.title.trim(),
      description: data.description || null,
      universityId: data.universityId || null,
      courseId: data.courseId || null,
      semesterId: data.semesterId || null,
      subjectId: data.subjectId || null,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes, 10) : 60,
      totalMarks: data.totalMarks ? parseInt(data.totalMarks, 10) : 50,
      passingMarks: data.passingMarks || data.passMarks ? parseInt(data.passingMarks || data.passMarks, 10) : 25,
      hasNegativeMarking: data.hasNegativeMarking !== undefined ? Boolean(data.hasNegativeMarking) : true,
      negativeMarkValue: data.negativeMarkValue !== undefined ? parseFloat(data.negativeMarkValue) : (data.negativeMarking ? parseFloat(data.negativeMarking) : 0.25),
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : false,
    },
  });
}

export async function updateMockTest(id, data) {
  return await prisma.mockTest.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.durationMinutes !== undefined && { durationMinutes: parseInt(data.durationMinutes, 10) }),
      ...(data.totalMarks !== undefined && { totalMarks: parseInt(data.totalMarks, 10) }),
      ...((data.passingMarks !== undefined || data.passMarks !== undefined) && {
        passingMarks: parseInt(data.passingMarks || data.passMarks, 10),
      }),
      ...(data.hasNegativeMarking !== undefined && { hasNegativeMarking: Boolean(data.hasNegativeMarking) }),
      ...(data.negativeMarkValue !== undefined && { negativeMarkValue: parseFloat(data.negativeMarkValue) }),
      ...(data.isPublished !== undefined && { isPublished: Boolean(data.isPublished) }),
      ...(data.subjectId !== undefined && { subjectId: data.subjectId || null }),
      ...(data.semesterId !== undefined && { semesterId: data.semesterId || null }),
      ...(data.courseId !== undefined && { courseId: data.courseId || null }),
      ...(data.universityId !== undefined && { universityId: data.universityId || null }),
    },
  });
}

export async function deleteMockTest(id) {
  return await prisma.mockTest.delete({
    where: { id },
  });
}

// ==========================================
// 14. STUDENTS MANAGEMENT
// ==========================================
export async function getStudents({ universityId = '', search = '', isActive, page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const where = { role: 'STUDENT' };

  if (universityId) where.universityId = universityId;
  if (isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true' || isActive === true;
  }
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        university: { select: { id: true, name: true, code: true } },
        course: { select: { id: true, name: true, code: true } },
        _count: { select: { testAttempts: true, bookmarks: true, wrongAnswers: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateStudent(id, data) {
  return await prisma.user.update({
    where: { id },
    data: {
      ...(data.fullName && { fullName: data.fullName.trim() }),
      ...(data.email && { email: data.email.trim() }),
      ...(data.xp !== undefined && { xp: parseInt(data.xp, 10) }),
      ...(data.streakDays !== undefined && { streakDays: parseInt(data.streakDays, 10) }),
      ...(data.coins !== undefined && { coins: parseInt(data.coins, 10) }),
      ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      ...(data.universityId !== undefined && { universityId: data.universityId || null }),
      ...(data.courseId !== undefined && { courseId: data.courseId || null }),
    },
  });
}

export async function deleteStudent(id) {
  return await prisma.user.delete({
    where: { id },
  });
}
