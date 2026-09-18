import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Safe singleton PrismaClient instance getter.
 * Defers instantiation until runtime execution, preventing build-time database
 * queries or missing DATABASE_URL crashes during Next.js static page data collection.
 */
function getPrismaInstance() {
  if (!globalForPrisma.prisma) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      const err = new Error('DATABASE_URL environment variable is not configured.');
      err.code = 'DATABASE_UNAVAILABLE';
      throw err;
    }

    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
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
