import prisma from '../src/lib/prisma.js';

async function main() {
  const collegeCols = await prisma.$queryRawUnsafe('PRAGMA table_info(College);');
  console.log('College columns:', collegeCols);

  const courseCols = await prisma.$queryRawUnsafe('PRAGMA table_info(Course);');
  console.log('Course columns:', courseCols);

  const semCols = await prisma.$queryRawUnsafe('PRAGMA table_info(Semester);');
  console.log('Semester columns:', semCols);

  const subjCols = await prisma.$queryRawUnsafe('PRAGMA table_info(Subject);');
  console.log('Subject columns:', subjCols);

  process.exit(0);
}

main().catch(console.error);
