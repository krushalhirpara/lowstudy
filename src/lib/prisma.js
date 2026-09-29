import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis;

/**
 * Resolves SQLite file paths to valid absolute paths.
 */
function resolveDatabaseUrl(url) {
  if (!url || typeof url !== 'string') {
    const defaultDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
    return `file:${defaultDbPath}`;
  }

  if (url.startsWith('file:')) {
    const rawPath = url.replace(/^file:/, '').trim();
    if (!path.isAbsolute(rawPath)) {
      // Check if file exists relative to cwd or inside prisma/
      const cwdRelative = path.resolve(process.cwd(), rawPath);
      const prismaRelative = path.resolve(process.cwd(), 'prisma', rawPath.replace(/^\.\//, ''));
      
      if (fs.existsSync(prismaRelative)) {
        return `file:${prismaRelative}`;
      }
      if (fs.existsSync(cwdRelative)) {
        return `file:${cwdRelative}`;
      }
      // Default to prisma/dev.db if file not found yet
      const fallbackPrisma = path.resolve(process.cwd(), 'prisma/dev.db');
      if (fs.existsSync(fallbackPrisma)) {
        return `file:${fallbackPrisma}`;
      }
      return `file:${cwdRelative}`;
    }
  }

  return url;
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

