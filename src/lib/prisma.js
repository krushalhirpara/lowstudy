import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis;

/**
 * Safe singleton PrismaClient instance getter.
 * Defers instantiation until runtime execution, ensuring seamless connection
 * locally and in production (e.g. Vercel) even if DATABASE_URL is not explicitly passed.
 */
function getPrismaInstance() {
  if (!globalForPrisma.prisma) {
    const databaseUrl = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), 'prisma/dev.db')}`;

    try {
      globalForPrisma.prisma = new PrismaClient({
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    } catch (e) {
      console.warn('Warning: PrismaClient initialization warning:', e?.message || e);
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
