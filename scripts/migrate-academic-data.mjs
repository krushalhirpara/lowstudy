import prisma from '../src/lib/prisma.js';

async function migrate() {
  console.log('🔄 Starting Safe Academic Data Schema & Record Migration...\n');

  // 1. Add columns to College table if they don't already exist
  const existingCols = await prisma.$queryRawUnsafe('PRAGMA table_info(College);');
  const colNames = existingCols.map(c => c.name);

  if (!colNames.includes('sourceUrl')) {
    console.log('➕ Adding sourceUrl column to College table...');
    await prisma.$executeRawUnsafe('ALTER TABLE "College" ADD COLUMN "sourceUrl" TEXT;');
  }

  if (!colNames.includes('programsJson')) {
    console.log('➕ Adding programsJson column to College table...');
    await prisma.$executeRawUnsafe('ALTER TABLE "College" ADD COLUMN "programsJson" TEXT;');
  }

  console.log('✅ College table columns verified.');
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
