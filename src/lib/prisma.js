import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

/**
 * Ensures SQLite database is located in a writable location.
 * On serverless platforms (Vercel / AWS Lambda), the deployment directory (/var/task)
 * is read-only. We safely copy dev.db to /tmp/dev.db with mtime / size sync.
 */
function ensureWritableSqlitePath(dbFilePath) {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY
  );

  const tmpDbPath = path.resolve('/tmp', 'dev.db');

  if (isServerless) {
    try {
      const tmpExists = fs.existsSync(tmpDbPath);
      const tmpSize = tmpExists ? fs.statSync(tmpDbPath).size : 0;
      const bundledExists = dbFilePath && fs.existsSync(dbFilePath);
      const bundledSize = bundledExists ? fs.statSync(dbFilePath).size : 0;
      const bundledMtime = bundledExists ? fs.statSync(dbFilePath).mtimeMs : 0;
      const tmpMtime = tmpExists ? fs.statSync(tmpDbPath).mtimeMs : 0;

      // Copy if /tmp/dev.db doesn't exist, is empty, or bundled dev.db is newer/larger
      if (!tmpExists || tmpSize === 0 || (bundledExists && bundledMtime > tmpMtime && bundledSize > 0)) {
        if (bundledExists) {
          fs.copyFileSync(dbFilePath, tmpDbPath);
          const walSource = `${dbFilePath}-wal`;
          const shmSource = `${dbFilePath}-shm`;
          if (fs.existsSync(walSource)) fs.copyFileSync(walSource, `${tmpDbPath}-wal`);
          if (fs.existsSync(shmSource)) fs.copyFileSync(shmSource, `${tmpDbPath}-shm`);
        }
      }
      return tmpDbPath;
    } catch (err) {
      console.warn('[Prisma] Notice while preparing /tmp/dev.db for serverless:', err?.message);
    }
  }

  // Check if directory of dbFilePath is writable
  if (dbFilePath) {
    try {
      const dir = path.dirname(dbFilePath);
      if (fs.existsSync(dir)) {
        fs.accessSync(dir, fs.constants.W_OK);
        return dbFilePath;
      }
    } catch {
      // Directory is read-only, fallback to /tmp
      try {
        if (!fs.existsSync(tmpDbPath) && fs.existsSync(dbFilePath)) {
          fs.copyFileSync(dbFilePath, tmpDbPath);
        }
        return tmpDbPath;
      } catch (err) {
        console.warn('[Prisma] Fallback to /tmp failed:', err?.message);
      }
    }
  }

  return dbFilePath;
}

/**
 * Self-healing schema synchronization for SQLite databases.
 * Automatically checks and adds any missing columns (e.g. phoneNumber) non-destructively.
 */
let schemaIntegrityChecked = false;
async function ensureDatabaseSchemaIntegrity(client) {
  if (schemaIntegrityChecked) return;
  schemaIntegrityChecked = true;

  try {
    // Only applies to SQLite providers
    const userColumns = await client.$queryRawUnsafe(`PRAGMA table_info("User");`);
    if (!Array.isArray(userColumns) || userColumns.length === 0) return;

    const colNames = userColumns.map(c => c.name);

    if (!colNames.includes('phoneNumber')) {
      console.log('[Prisma Schema Self-Heal] Adding missing User.phoneNumber column');
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "phoneNumber" TEXT;`);
    }

    if (!colNames.includes('profileCompleted')) {
      console.log('[Prisma Schema Self-Heal] Adding missing User.profileCompleted column');
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "profileCompleted" BOOLEAN NOT NULL DEFAULT 0;`);
    }

    if (!colNames.includes('city')) {
      console.log('[Prisma Schema Self-Heal] Adding missing User.city column');
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "city" TEXT;`);
    }

    if (!colNames.includes('universityId')) {
      console.log('[Prisma Schema Self-Heal] Adding missing User.universityId column');
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "universityId" TEXT;`);
    }

    if (!colNames.includes('activityNotificationOptIn')) {
      console.log('[Prisma Schema Self-Heal] Adding missing User.activityNotificationOptIn column');
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "activityNotificationOptIn" BOOLEAN NOT NULL DEFAULT 0;`);
    }

    if (!colNames.includes('lastLoginAt')) {
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME;`);
    }

    if (!colNames.includes('lastActiveAt')) {
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "lastActiveAt" DATETIME;`);
    }

    // Ensure ActivityEvent table exists
    await client.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ActivityEvent" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "userId" TEXT,
        "publicDisplayName" TEXT,
        "subjectTitle" TEXT,
        "ipHash" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ActivityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Ensure indexes exist
    await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_phoneNumber_idx" ON "User"("phoneNumber");`);
    await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");`);
    await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ActivityEvent_type_idx" ON "ActivityEvent"("type");`);
    await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ActivityEvent_createdAt_idx" ON "ActivityEvent"("createdAt");`);
  } catch (err) {
    // Non-fatal notice: log cleanly without crashing
    console.warn('[Prisma Schema Self-Heal] Notice:', err?.message || err);
  }
}

/**
 * Resolves SQLite file paths to valid absolute paths with serverless write support.
 */
function resolveDatabaseUrl(url) {
  if (!url || typeof url !== 'string') {
    const defaultDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    const writablePath = ensureWritableSqlitePath(defaultDbPath);
    return `file:${writablePath}`;
  }

  // Non-SQLite database URLs (PostgreSQL, MySQL, Turso/LibSQL) pass through unchanged
  if (!url.startsWith('file:')) {
    return url;
  }

  const rawPath = url.replace(/^file:/, '').trim();
  let absoluteDbPath = rawPath;

  if (!path.isAbsolute(rawPath)) {
    const prismaRelative = path.resolve(process.cwd(), 'prisma', rawPath.replace(/^\.\//, ''));
    const cwdRelative = path.resolve(process.cwd(), rawPath);

    if (fs.existsSync(prismaRelative)) {
      absoluteDbPath = prismaRelative;
    } else if (fs.existsSync(cwdRelative)) {
      absoluteDbPath = cwdRelative;
    } else {
      const fallbackPrisma = path.resolve(process.cwd(), 'prisma/dev.db');
      absoluteDbPath = fs.existsSync(fallbackPrisma) ? fallbackPrisma : cwdRelative;
    }
  }

  const writablePath = ensureWritableSqlitePath(absoluteDbPath);
  return `file:${writablePath}`;
}

/**
 * Safe singleton PrismaClient instance getter.
 * Defers instantiation until runtime execution, ensuring seamless connection
 * locally and in production (e.g. Vercel) even if DATABASE_URL is relative.
 */
function getPrismaInstance() {
  if (!globalForPrisma.prisma) {
    const resolvedUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

    try {
      globalForPrisma.prisma = new PrismaClient({
        datasources: {
          db: {
            url: resolvedUrl,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    } catch (e) {
      console.error('[Prisma] Initialization error:', e?.message || e);
      globalForPrisma.prisma = new PrismaClient();
    }

    // Trigger non-blocking schema integrity self-heal
    ensureDatabaseSchemaIntegrity(globalForPrisma.prisma).catch(() => {});
  }

  return globalForPrisma.prisma;
}

/**
 * Proxy object wrapping PrismaClient.
 * Module import does not instantiate PrismaClient or touch the database.
 * Runtime calls lazily initialize and reuse the singleton PrismaClient.
 */
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrismaInstance();
      const value = client[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    },
  }
);

export default prisma;


