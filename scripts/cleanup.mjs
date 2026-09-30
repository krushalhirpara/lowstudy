import prisma from '../src/lib/prisma.js';

async function main() {
  await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'live.student' } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'google.student' } } });
  console.log('Database cleaned.');
  await prisma.$disconnect();
}

main();
