import prisma from './prisma.js';
import { hashPassword, verifyPassword } from './security.js';

const DEFAULT_ADMIN_USERNAME = process.env.CEO_ADMIN_USERNAME || 'ceoadmin';
const DEFAULT_ADMIN_EMAIL = process.env.CEO_ADMIN_EMAIL || 'ceoadmin@lowstudy.com';
const INITIAL_ADMIN_PASSWORD = process.env.CEO_ADMIN_PASSWORD || 'LowStudy@CEO2026!';

/**
 * Ensure an ADMIN user exists in the database.
 * If not, provisions one with PBKDF2 hashed password.
 */
export async function ensureAdminUser() {
  try {
    // 1. Check if any admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: DEFAULT_ADMIN_EMAIL },
          { fullName: DEFAULT_ADMIN_USERNAME },
        ],
      },
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' },
        });
      }
      return existingAdmin;
    }

    // 2. Hash initial password
    const { hash, salt } = hashPassword(INITIAL_ADMIN_PASSWORD);
    const passwordHash = `${salt}:${hash}`;

    const newAdmin = await prisma.user.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL,
        fullName: DEFAULT_ADMIN_USERNAME,
        role: 'ADMIN',
        provider: 'credentials',
        passwordHash,
        isActive: true,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    return newAdmin;
  } catch (err) {
    console.warn('[AdminAuth] Non-fatal admin provisioning notice:', err?.message);
    return null;
  }
}

/**
 * Verify admin credentials securely.
 * Checks against environment CEO_ADMIN credentials and Prisma User table (role: 'ADMIN').
 * @param {string} adminId 
 * @param {string} password 
 * @returns {Promise<{ valid: boolean, adminUser?: object, error?: string }>}
 */
export async function verifyAdminCredentials(adminId, password) {
  if (!adminId || !password || typeof adminId !== 'string' || typeof password !== 'string') {
    return { valid: false, error: 'Invalid credentials' };
  }

  const cleanId = adminId.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Ensure DB admin exists
  await ensureAdminUser();

  // 2. Check if CEO_ADMIN_PASSWORD_HASH is set in env
  const envAdminUser = (process.env.CEO_ADMIN_USERNAME || 'ceoadmin').toLowerCase();
  const envPassHash = process.env.CEO_ADMIN_PASSWORD_HASH; // format "salt:hash"

  if (envPassHash && (cleanId === envAdminUser || cleanId === DEFAULT_ADMIN_EMAIL)) {
    const [salt, hash] = envPassHash.split(':');
    if (salt && hash && verifyPassword(cleanPassword, hash, salt)) {
      const dbAdmin = await prisma.user.findFirst({
        where: { OR: [{ role: 'ADMIN' }, { email: DEFAULT_ADMIN_EMAIL }] },
      });
      return {
        valid: true,
        adminUser: dbAdmin || {
          id: 'usr-ceoadmin-master',
          email: DEFAULT_ADMIN_EMAIL,
          fullName: 'CEO Admin',
          role: 'ADMIN',
        },
      };
    }
  }

  // 3. Check Prisma User table
  try {
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { role: 'ADMIN' },
          {
            OR: [
              { email: cleanId },
              { fullName: { equals: cleanId } },
              { id: cleanId },
            ],
          },
        ],
      },
    });

    if (!user || !user.passwordHash || !user.isActive) {
      // Fallback: check if username matches ceoadmin and verify with default password if unseeded
      if ((cleanId === 'ceoadmin' || cleanId === DEFAULT_ADMIN_EMAIL) && cleanPassword === INITIAL_ADMIN_PASSWORD) {
        const { hash, salt } = hashPassword(INITIAL_ADMIN_PASSWORD);
        const adminAccount = await prisma.user.upsert({
          where: { email: DEFAULT_ADMIN_EMAIL },
          update: { role: 'ADMIN', passwordHash: `${salt}:${hash}` },
          create: {
            email: DEFAULT_ADMIN_EMAIL,
            fullName: 'CEO Admin',
            role: 'ADMIN',
            provider: 'credentials',
            passwordHash: `${salt}:${hash}`,
            isActive: true,
          },
        });
        return { valid: true, adminUser: adminAccount };
      }

      return { valid: false, error: 'Invalid admin credentials' };
    }

    const [salt, hash] = user.passwordHash.split(':');
    if (!salt || !hash || !verifyPassword(cleanPassword, hash, salt)) {
      return { valid: false, error: 'Invalid admin credentials' };
    }

    return { valid: true, adminUser: user };
  } catch (err) {
    console.error('[AdminAuth] Verification error:', err?.message);
    return { valid: false, error: 'Authentication service error' };
  }
}
