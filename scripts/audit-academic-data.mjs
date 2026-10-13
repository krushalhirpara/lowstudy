import prisma from '../src/lib/prisma.js';

async function audit() {
  console.log('=== ACADEMIC DATA AUDIT ===\n');

  // 1. Universities
  const universities = await prisma.university.findMany({
    include: {
      _count: {
        select: {
          colleges: true,
          courses: true,
          subjects: true,
          syllabusVersions: true,
          examPrepQuestions: true,
        }
      }
    }
  });

  console.log(`--- UNIVERSITIES (${universities.length}) ---`);
  for (const u of universities) {
    console.log(`• ID: "${u.id}", Code: "${u.code}", Name: "${u.name}", Status: "${u.status}", Colleges: ${u._count.colleges}, Courses: ${u._count.courses}, Subjects: ${u._count.subjects}, SyllabusVersions: ${u._count.syllabusVersions}, Questions: ${u._count.examPrepQuestions}`);
  }

  // 2. Colleges
  const colleges = await prisma.college.findMany({
    include: {
      university: { select: { code: true, name: true } }
    }
  });
  console.log(`\n--- COLLEGES (${colleges.length}) ---`);
  for (const c of colleges) {
    console.log(`• ID: "${c.id}", Name: "${c.name}", Uni: "${c.universityId}" (${c.university?.code}), City: "${c.city}", Status: "${c.status}"`);
  }

  // 3. Courses
  const courses = await prisma.course.findMany({
    include: {
      university: { select: { code: true } },
      _count: { select: { semesters: true, subjects: true } }
    }
  });
  console.log(`\n--- COURSES (${courses.length}) ---`);
  for (const crs of courses) {
    console.log(`• ID: "${crs.id}", Uni: "${crs.universityId}" (${crs.university?.code}), Name: "${crs.name}", Code: "${crs.code}", TotalSem: ${crs.totalSemesters}, SemsCount: ${crs._count.semesters}, SubjsCount: ${crs._count.subjects}, Active: ${crs.isActive}`);
  }

  // 4. Semesters & Distinct Subjects per semester
  const semesters = await prisma.semester.findMany({
    include: {
      course: {
        include: {
          university: { select: { code: true, name: true } }
        }
      },
      subjects: {
        select: { id: true, title: true, shortCode: true, isActive: true, universityId: true }
      }
    },
    orderBy: [
      { course: { universityId: 'asc' } },
      { courseId: 'asc' },
      { semesterNumber: 'asc' }
    ]
  });

  console.log(`\n--- SEMESTERS & SUBJECTS (${semesters.length} semesters) ---`);
  for (const s of semesters) {
    console.log(`• SemID: "${s.id}", Uni: "${s.course?.university?.code}", Course: "${s.course?.name}" (ID: ${s.courseId}), Sem #: ${s.semesterNumber}, Title: "${s.title}", SubjCount: ${s.subjects.length}`);
    for (const sub of s.subjects) {
      console.log(`    - [${sub.id}] "${sub.title}" (Code: ${sub.shortCode}, Active: ${sub.isActive}, SubUni: ${sub.universityId})`);
    }
  }

  // 5. Syllabus Versions
  const syllabusVersions = await prisma.syllabusVersion.findMany({
    include: {
      university: { select: { code: true } }
    }
  });
  console.log(`\n--- SYLLABUS VERSIONS (${syllabusVersions.length}) ---`);
  for (const sv of syllabusVersions) {
    console.log(`• ID: "${sv.id}", Uni: "${sv.university?.code}", Version: "${sv.versionName}", AcademicYear: "${sv.academicYear}", Status: "${sv.status}"`);
  }

  console.log('\nAudit complete.');
  process.exit(0);
}

audit().catch(e => {
  console.error(e);
  process.exit(1);
});
