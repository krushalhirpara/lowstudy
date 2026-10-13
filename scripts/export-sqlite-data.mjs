/**
 * LowStudy Production Migration Helper:
 * Exports all data from SQLite database into a portable JSON snapshot.
 * Preserves all users, universities, colleges, courses, semesters, subjects,
 * units, topics, questions, syllabi, study progress, and metadata.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportAllData() {
  console.log('📦 Starting complete SQLite database export...');

  const exportPath = path.resolve(process.cwd(), 'prisma', 'sqlite-full-export.json');

  try {
    const data = {
      exportedAt: new Date().toISOString(),
      source: 'prisma/dev.db (SQLite)',
      tables: {}
    };

    // List of models in foreign key dependency order
    const modelNames = [
      'university',
      'college',
      'course',
      'semester',
      'subject',
      'unit',
      'topic',
      'syllabusSource',
      'syllabusVersion',
      'syllabusChange',
      'user',
      'examPrepQuestion',
      'examPrepOrder',
      'examPrepEntitlement',
      'bookmark',
      'revisionItem',
      'webhookEvent',
      'activityEvent',
      'loginEvent',
      'pageView',
      'auditLog',
    ];

    let totalRecords = 0;

    for (const model of modelNames) {
      if (prisma[model]) {
        try {
          const records = await prisma[model].findMany();
          data.tables[model] = records;
          totalRecords += records.length;
          console.log(`  ✓ ${model}: ${records.length} records exported`);
        } catch (err) {
          console.warn(`  ⚠ ${model}: skipped (${err.message})`);
        }
      }
    }

    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`\n🎉 Complete export finished: ${totalRecords} total records saved to ${exportPath}`);
  } catch (err) {
    console.error('Export failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportAllData();
