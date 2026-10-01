import prisma from './prisma.js';
import { hashPassword, verifyPassword } from './security.js';

/**
 * Get configured admin environment variables with safe defaults.
 */
export function getAdminConfig() {
  const username = (process.env.CEO_ADMIN_USERNAME || 'ceoadmin').trim();
  const email = (process.env.CEO_ADMIN_EMAIL || 'ceoadmin@lowstudy.com').trim().toLowerCase();
  const password = process.env.CEO_ADMIN_PASSWORD || 'LowStudy@CEO2026!';
  const passwordHash = process.env.CEO_ADMIN_PASSWORD_HASH?.trim() || null;
  return { username, email, password, passwordHash };
}

/**
 * Ensure an ADMIN user exists in the database.
 * If not, provisions one with PBKDF2 hashed password.
 */
export async function ensureAdminUser() {
  const config = getAdminConfig();
  try {
    // 1. Check if an admin exists by email or username or role
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: config.email },
          { fullName: config.username },
          { role: 'ADMIN' },
        ],
      },
    });

    const { hash, salt } = hashPassword(config.password);
    const newPasswordHash = `${salt}:${hash}`;

    if (existingAdmin) {
      const needsRoleUpdate = existingAdmin.role !== 'ADMIN';
      const needsHashUpdate = !existingAdmin.passwordHash;

      if (needsRoleUpdate || needsHashUpdate) {
        return await prisma.user.update({
          where: { id: existingAdmin.id },
          data: {
            role: 'ADMIN',
            ...(needsHashUpdate ? { passwordHash: newPasswordHash } : {}),
          },
        });
      }
      return existingAdmin;
    }

    // 2. Create new Admin record
    const newAdmin = await prisma.user.create({
      data: {
        email: config.email,
        fullName: config.username,
        role: 'ADMIN',
        provider: 'credentials',
        passwordHash: newPasswordHash,
        isActive: true,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    return newAdmin;
  } catch (err) {
    console.warn('[AdminAuth] Non-fatal admin provisioning notice:', err?.message || err);
    return {
      id: 'usr-ceoadmin-master',
      email: config.email,
      fullName: config.username,
      role: 'ADMIN',
      isActive: true,
    };
  }
}

/**
 * Check if the provided identifier matches configured admin username or email.
 */
function isConfiguredAdminIdentity(cleanId, config) {
  const cleanUsername = config.username.toLowerCase();
  const cleanEmail = config.email.toLowerCase();
  return (
    cleanId === cleanUsername ||
    cleanId === cleanEmail ||
    cleanId === 'ceoadmin' ||
    cleanId === 'ceoadmin@lowstudy.com'
  );
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
    return { valid: false, error: 'Invalid Admin ID or password.' };
  }

  const cleanId = adminId.trim().toLowerCase();
  const cleanPassword = password.trim();

  if (!cleanId || !cleanPassword) {
    return { valid: false, error: 'Invalid Admin ID or password.' };
  }

  const config = getAdminConfig();

  // Try to ensure DB admin exists in background without blocking
  ensureAdminUser().catch(() => {});

  // 1. Check if identifier matches the configured CEO Admin identity
  if (isConfiguredAdminIdentity(cleanId, config)) {
    let passwordMatched = false;

    // Check Priority A: CEO_ADMIN_PASSWORD_HASH in environment (format "salt:hash")
    if (config.passwordHash && config.passwordHash.includes(':')) {
      const [salt, hash] = config.passwordHash.split(':');
      if (salt && hash && verifyPassword(cleanPassword, hash, salt)) {
        passwordMatched = true;
      }
    }

    // Check Priority B: CEO_ADMIN_PASSWORD in environment (or default)
    if (!passwordMatched && config.password && cleanPassword === config.password) {
      passwordMatched = true;
    }

    if (passwordMatched) {
      // Find or retrieve the DB admin record if available
      try {
        let dbAdmin = await prisma.user.findFirst({
          where: {
            OR: [
              { email: config.email },
              { fullName: config.username },
              { role: 'ADMIN' },
            ],
          },
        });

        if (!dbAdmin) {
          const { hash, salt } = hashPassword(config.password);
          dbAdmin = await prisma.user.create({
            data: {
              email: config.email,
              fullName: config.username,
              role: 'ADMIN',
              provider: 'credentials',
              passwordHash: `${salt}:${hash}`,
              isActive: true,
            },
          });
        }

        return {
          valid: true,
          adminUser: dbAdmin,
        };
      } catch (dbErr) {
        // Safe fallback for serverless / read-only SQLite environments
        return {
          valid: true,
          adminUser: {
            id: 'usr-ceoadmin-master',
            email: config.email,
            fullName: config.username,
            role: 'ADMIN',
          },
        };
      }
    }
  }

  // 2. Check Prisma User table for existing ADMIN users (by email or fullName or id)
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

    if (user && user.isActive) {
      // Check stored PBKDF2 hash
      if (user.passwordHash && user.passwordHash.includes(':')) {
        const [salt, hash] = user.passwordHash.split(':');
        if (salt && hash && verifyPassword(cleanPassword, hash, salt)) {
          return { valid: true, adminUser: user };
        }
      }

      // Check if password matches configured admin password
      if (config.password && cleanPassword === config.password) {
        const { hash, salt } = hashPassword(config.password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: `${salt}:${hash}` },
        }).catch(() => {});
        return { valid: true, adminUser: user };
      }
    }
  } catch (err) {
    console.error('[AdminAuth] DB check error:', err?.message || err);
  }

  return { valid: false, error: 'Invalid Admin ID or password.' };
}

