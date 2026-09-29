import prisma from '../src/lib/prisma.js';

async function check() {
  const uni = await prisma.university.findUnique({ where: { id: 'su' } });
  console.log('uni su:', uni ? uni.name : 'NOT FOUND');
  const col = await prisma.college.findUnique({ where: { id: 'col-la-shah' } });
  console.log('col col-la-shah:', col ? col.name : 'NOT FOUND');
  const course = await prisma.course.findUnique({ where: { id: 'su-llb-3yr' } });
  console.log('course su-llb-3yr:', course ? course.name : 'NOT FOUND');
  const sem = await prisma.semester.findUnique({ where: { id: 'su-llb-3yr-sem3' } });
  console.log('sem su-llb-3yr-sem3:', sem ? sem.title : 'NOT FOUND');

  const universities = await prisma.university.findMany({ select: { id: true, name: true } });
  console.log('All universities in DB:', universities);
}

check().finally(async () => {
  await prisma.$disconnect();
});
