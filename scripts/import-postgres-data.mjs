/**
 * LowStudy Production Migration Helper:
 * Restores data from sqlite-full-export.json into a target PostgreSQL database.
 * 
 * Usage:
 *   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require" node scripts/import-postgres-data.mjs
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const exportPath = path.resolve(process.cwd(), 'prisma', 'sqlite-full-export.json');

async function importData() {
  console.log('🚀 Starting import to PostgreSQL database...');

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
    console.error('❌ Error: DATABASE_URL environment variable must be set to a valid PostgreSQL connection string.');
    console.error('Example: DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"');
    process.exit(1);
  }

  if (!fs.existsSync(exportPath)) {
    console.error(`❌ Error: Export file not found at ${exportPath}. Run 'node scripts/export-sqlite-data.mjs' first.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(exportPath, 'utf8');
  const exportPayload = JSON.parse(rawData);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    console.log('🔌 Connecting to target database...');
    await prisma.$connect();
    console.log('✅ Connection established.');

    const tables = exportPayload.tables;

    // Convert date string fields back to Date objects
    function parseDates(item) {
      const cloned = { ...item };
      for (const [key, value] of Object.entries(cloned)) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          cloned[key] = new Date(value);
        }
      }
      return cloned;
    }

    // Import order respecting foreign key constraints
    const importOrder = [
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

    let totalRestored = 0;

    for (const model of importOrder) {
      const records = tables[model];
      if (!records || records.length === 0) continue;

      console.log(`\nImporting ${records.length} records into ${model}...`);
      let successCount = 0;

      for (const record of records) {
        const cleanRecord = parseDates(record);
        try {
          if (record.id) {
            await prisma[model].upsert({
              where: { id: record.id },
              update: cleanRecord,
              create: cleanRecord,
            });
          } else {
            await prisma[model].create({
              data: cleanRecord,
            });
          }
          successCount++;
        } catch (err) {
          console.warn(`  ⚠ Warning inserting ${model} (${record.id || 'id-less'}): ${err.message}`);
        }
      }

      console.log(`  ✓ ${successCount}/${records.length} ${model} records imported`);
      totalRestored += successCount;
    }

    console.log(`\n🎉 PostgreSQL Migration Import Complete: ${totalRestored} records restored.`);
  } catch (err) {
    console.error('❌ Import failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
