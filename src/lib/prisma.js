import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

/**
 * Ensures SQLite database is located in a writable location.
 * On serverless platforms (Vercel / AWS Lambda), the deployment directory (/var/task)
 * is read-only. We safely copy dev.db to /tmp/dev.db if needed.
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
      // In serverless, if /tmp/dev.db doesn't exist or is empty, copy from bundled db
      const tmpExists = fs.existsSync(tmpDbPath);
      const tmpSize = tmpExists ? fs.statSync(tmpDbPath).size : 0;

      if (!tmpExists || tmpSize === 0) {
        if (dbFilePath && fs.existsSync(dbFilePath)) {
          fs.copyFileSync(dbFilePath, tmpDbPath);
          // Also copy WAL and SHM files if present
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


