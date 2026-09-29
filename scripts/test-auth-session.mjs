import prisma from '../src/lib/prisma.js';
import { 
  createSessionToken, 
  verifySessionToken, 
  getSessionFromRequest, 
  verifyPassword, 
  hashPassword,
  sanitizeInput 
} from '../src/lib/security.js';

async function testAuth() {
  console.log('--- Testing Google Auth Logic directly ---');

  const testEmail = `test-google-${Date.now()}@gmail.com`;
  const testUid = `firebase-uid-${Date.now()}`;
  const testName = 'Test Google Student';
  const testPhoto = 'https://lh3.googleusercontent.com/a/test-photo';

  console.log(`1. Testing New Google User creation for ${testEmail}...`);
  try {
    // Look for user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: testEmail },
          { firebaseUid: testUid }
        ]
      }
    });
    console.log('User found before creation:', user);

    // Create user
    user = await prisma.user.create({
      data: {
        email: testEmail,
        fullName: testName,
        avatar: testPhoto,
        firebaseUid: testUid,
        provider: 'google',
        role: 'STUDENT',
        universityId: 'su',
        collegeId: 'col-la-shah',
        courseId: 'su-llb-3yr',
        semesterId: 'su-llb-3yr-sem3',
        xp: 100,
        streakDays: 1,
        coins: 50,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatar: true,
        provider: true,
        firebaseUid: true,
        streakDays: true,
        xp: true,
        coins: true,
        universityId: true,
        courseId: true,
        semesterId: true,
        isActive: true,
      }
    });
    console.log('Created User successfully:', user);

    // Create token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      universityId: user.universityId,
    });
    console.log('Generated token length:', token.length);

    // Verify token
    const verification = verifySessionToken(token);
    console.log('Token verification:', verification);

    // 2. Existing Google User
    console.log('\n2. Testing Existing Google User lookup & update...');
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: testEmail },
          { firebaseUid: testUid }
        ]
      }
    });
    console.log('Found existing user:', existing?.id);

    // Clean up test user
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleaned up test user successfully.');

  } catch (err) {
    console.error('ERROR during Auth test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
