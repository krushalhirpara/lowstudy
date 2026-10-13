import { verifyAdminCredentials, ensureAdminUser, getAdminConfig } from '../src/lib/adminAuth.js';
import { createSessionToken, verifySessionToken, verifyPassword, hashPassword } from '../src/lib/security.js';

async function runTests() {
  console.log('--- Starting Admin Auth Tests ---');

  // Test 1: Config defaults
  const config = getAdminConfig();
  console.log('Test 1 - Config check:', {
    username: config.username,
    email: config.email,
    hasPassword: !!config.password,
    hasPasswordHash: !!config.passwordHash,
  });

  // Test 2: PBKDF2 hashing & verification
  const testPw = 'LowStudy@CEO2026!';
  const { hash, salt } = hashPassword(testPw);
  const pwValid = verifyPassword(testPw, hash, salt);
  const wrongPwValid = verifyPassword('WrongPassword123!', hash, salt);
  console.log('Test 2 - PBKDF2 verify valid:', pwValid === true ? 'PASS' : 'FAIL');
  console.log('Test 2 - PBKDF2 reject wrong:', wrongPwValid === false ? 'PASS' : 'FAIL');

  // Test 3: ensureAdminUser
  const admin = await ensureAdminUser();
  console.log('Test 3 - ensureAdminUser:', admin?.role === 'ADMIN' ? 'PASS' : 'FAIL', {
    id: admin?.id,
    email: admin?.email,
    role: admin?.role,
  });

  // Test 4: verifyAdminCredentials with username
  const testWithUsername = await verifyAdminCredentials('ceoadmin', 'LowStudy@CEO2026!');
  console.log('Test 4 - Login with username (ceoadmin):', testWithUsername.valid ? 'PASS' : 'FAIL');

  // Test 5: verifyAdminCredentials with email
  const testWithEmail = await verifyAdminCredentials('ceoadmin@lowstudy.com', 'LowStudy@CEO2026!');
  console.log('Test 5 - Login with email (ceoadmin@lowstudy.com):', testWithEmail.valid ? 'PASS' : 'FAIL');

  // Test 6: verifyAdminCredentials with case-insensitivity & whitespace
  const testWithWhitespace = await verifyAdminCredentials('  CeoAdmin@LowStudy.com  ', 'LowStudy@CEO2026!');
  console.log('Test 6 - Login with whitespace & casing:', testWithWhitespace.valid ? 'PASS' : 'FAIL');

  // Test 7: Reject invalid password
  const testWrongPw = await verifyAdminCredentials('ceoadmin', 'WrongPassword123!');
  console.log('Test 7 - Reject wrong password:', testWrongPw.valid === false ? 'PASS' : 'FAIL');

  // Test 8: Reject non-existent user
  const testNonExistent = await verifyAdminCredentials('randomhacker@example.com', 'SomePassword!');
  console.log('Test 8 - Reject non-existent user:', testNonExistent.valid === false ? 'PASS' : 'FAIL');

  // Test 9: Session token creation & verification
  const token = createSessionToken({
    userId: testWithUsername.adminUser.id,
    email: testWithUsername.adminUser.email,
    role: 'ADMIN',
    isAdmin: true,
  });
  const sessionResult = verifySessionToken(token);
  console.log('Test 9 - Session token verify:', sessionResult.valid && sessionResult.payload.role === 'ADMIN' ? 'PASS' : 'FAIL');

  console.log('--- All Admin Auth Tests Completed ---');
}

runTests().catch(console.error);
