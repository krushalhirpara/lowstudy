import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sem = await prisma.semester.findFirst({
    where: { courseId: 'su-llb-3yr', semesterNumber: 3 },
    include: {
      course: { include: { university: true } },
      subjects: {
        include: {
          units: {
            include: {
              topics: {
                include: {
                  notes: true,
                  legalSections: true,
                  caseLaws: true,
                  questions: true,
                  mcqs: true,
                }
              }
            }
          }
        }
      }
    }
  });

  console.log('Uni:', sem.course.university.name);
  console.log('Course:', sem.course.name);
  console.log('Semester:', sem.title, '(id=' + sem.id + ')');
  for (const sub of sem.subjects) {
    console.log(`\n=== Subject: [${sub.shortCode}] ${sub.title} (id=${sub.id}) ===`);
    for (const u of sub.units) {
      console.log(`  Unit ${u.unitNumber}: ${u.title} (id=${u.id})`);
      for (const t of u.topics) {
        console.log(`    Topic ${t.topicNumber}: ${t.title} (id=${t.id})`);
        if (t.notes[0]) {
          console.log(`      Sample note length: simple=${t.notes[0].simpleNotes?.length || 0}, detailed=${t.notes[0].detailedNotes?.length || 0}`);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
