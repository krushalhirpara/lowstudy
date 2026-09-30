import { 
  GUJARAT_UNIVERSITIES, 
  GUJARAT_COLLEGES, 
  GUJARAT_CITIES,
  getUniversityMappedCities,
  getUniversitiesForCity,
  isUniversityValidForCity,
  isCityWithMappedUniversities,
  normalizeCityName
} from '../src/data/gujaratData.js';
import { 
  verifyAndEnsureUniversity, 
  isUniversityValidForCity as serverIsUniversityValidForCity 
} from '../src/lib/universityHelper.js';
import prisma from '../src/lib/prisma.js';

async function runTests() {
  console.log('====================================================');
  console.log('LOWSTUDY — CITY → UNIVERSITY DEPENDENT DROPDOWN TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: City blank -> All active universities visible
  // ----------------------------------------------------
  console.log('TEST 1: City blank -> All active universities visible');
  const allUnisEmpty = getUniversitiesForCity('');
  const allUnisNull = getUniversitiesForCity(null);
  assert(allUnisEmpty.length === GUJARAT_UNIVERSITIES.length, 'getUniversitiesForCity("") returns all universities');
  assert(allUnisNull.length === GUJARAT_UNIVERSITIES.length, 'getUniversitiesForCity(null) returns all universities');
  assert(allUnisEmpty.some(u => u.id === 'gu') && allUnisEmpty.some(u => u.id === 'vnsgu') && allUnisEmpty.some(u => u.id === 'su'), 'Contains GU, VNSGU, SU');

  // ----------------------------------------------------
  // TEST 2: City = Surat -> Only Surat-mapped universities
  // ----------------------------------------------------
  console.log('\nTEST 2: City = Surat -> Only Surat-mapped universities');
  const suratUnis = getUniversitiesForCity('Surat');
  assert(suratUnis.length === 1 && suratUnis[0].id === 'vnsgu', 'Surat maps exclusively to VNSGU');
  assert(isUniversityValidForCity('vnsgu', 'Surat') === true, 'VNSGU is valid for Surat');
  assert(isUniversityValidForCity('gu', 'Surat') === false, 'GU is INVALID for Surat');
  assert(isUniversityValidForCity('su', 'Surat') === false, 'SU is INVALID for Surat');

  // Server async helper verification
  const serverSuratValid = await serverIsUniversityValidForCity('vnsgu', 'Surat');
  const serverSuratInvalid = await serverIsUniversityValidForCity('gu', 'Surat');
  assert(serverSuratValid === true, 'Server helper confirms VNSGU is valid for Surat');
  assert(serverSuratInvalid === false, 'Server helper rejects GU for Surat');

  // Case-insensitivity check
  const suratLower = getUniversitiesForCity('surat');
  const suratUpper = getUniversitiesForCity('SURAT');
  const suratWhitespace = getUniversitiesForCity('  Surat  ');
  assert(suratLower.length === 1 && suratLower[0].id === 'vnsgu', 'Case-insensitive: "surat" works');
  assert(suratUpper.length === 1 && suratUpper[0].id === 'vnsgu', 'Case-insensitive: "SURAT" works');
  assert(suratWhitespace.length === 1 && suratWhitespace[0].id === 'vnsgu', 'Whitespace-trimmed: "  Surat  " works');

  // ----------------------------------------------------
  // TEST 3: City = Ahmedabad -> Only Ahmedabad-mapped universities
  // ----------------------------------------------------
  console.log('\nTEST 3: City = Ahmedabad -> Only Ahmedabad-mapped universities');
  const ahmedabadUnis = getUniversitiesForCity('Ahmedabad');
  const ahdIds = ahmedabadUnis.map(u => u.id);
  assert(ahdIds.includes('gu') && ahdIds.includes('gls') && ahdIds.length === 2, 'Ahmedabad maps to GU and GLS');
  assert(isUniversityValidForCity('gu', 'Ahmedabad') === true, 'GU is valid for Ahmedabad');
  assert(isUniversityValidForCity('gls', 'Ahmedabad') === true, 'GLS is valid for Ahmedabad');
  assert(isUniversityValidForCity('vnsgu', 'Ahmedabad') === false, 'VNSGU is INVALID for Ahmedabad');

  // ----------------------------------------------------
  // TEST 4: City = Rajkot -> Only Rajkot-mapped universities
  // ----------------------------------------------------
  console.log('\nTEST 4: City = Rajkot -> Only Rajkot-mapped universities');
  const rajkotUnis = getUniversitiesForCity('Rajkot');
  assert(rajkotUnis.length === 1 && rajkotUnis[0].id === 'su', 'Rajkot maps to SU (Saurashtra University)');
  assert(isUniversityValidForCity('su', 'Rajkot') === true, 'SU is valid for Rajkot');
  assert(isUniversityValidForCity('gu', 'Rajkot') === false, 'GU is INVALID for Rajkot');

  // ----------------------------------------------------
  // TEST 5: City = Vadodara -> MSU & Parul
  // ----------------------------------------------------
  console.log('\nTEST 5: City = Vadodara -> MSU & Parul');
  const vadodaraUnis = getUniversitiesForCity('Vadodara');
  const vadIds = vadodaraUnis.map(u => u.id);
  assert(vadIds.includes('msu') && vadIds.includes('parul') && vadIds.length === 2, 'Vadodara maps to MSU and Parul');

  // ----------------------------------------------------
  // TEST 6: Affiliated College Cities (Gandhinagar, Anand, Jamnagar)
  // ----------------------------------------------------
  console.log('\nTEST 6: Affiliated College Cities (Gandhinagar, Anand, Jamnagar)');
  const gandhinagarUnis = getUniversitiesForCity('Gandhinagar').map(u => u.id);
  assert(gandhinagarUnis.includes('gnlu') && gandhinagarUnis.includes('gu'), 'Gandhinagar includes GNLU and GU (via Siddharth Law College)');
  
  const anandUnis = getUniversitiesForCity('Anand').map(u => u.id);
  assert(anandUnis.includes('gu'), 'Anand includes GU (via Anand Law College)');

  const jamnagarUnis = getUniversitiesForCity('Jamnagar').map(u => u.id);
  assert(jamnagarUnis.includes('su'), 'Jamnagar includes SU (via K.P. Shah Law College)');

  // ----------------------------------------------------
  // TEST 7: Custom City with No Mapped Universities
  // ----------------------------------------------------
  console.log('\nTEST 7: Custom City with No Mapped Universities');
  const morbiUnis = getUniversitiesForCity('Morbi');
  assert(morbiUnis.length === 0, 'Morbi has 0 mapped universities in verified registry');
  const customCityUnis = getUniversitiesForCity('New Custom City');
  assert(customCityUnis.length === 0, 'New Custom City has 0 mapped universities');
  assert(isCityWithMappedUniversities('Morbi') === false, 'isCityWithMappedUniversities("Morbi") is false');
  assert(isCityWithMappedUniversities('Surat') === true, 'isCityWithMappedUniversities("Surat") is true');
  // Custom cities do not block signup with a valid active university
  assert(isUniversityValidForCity('gu', 'Morbi') === true, 'GU allowed when custom city with no mapped unis is entered');

  // ----------------------------------------------------
  // TEST 8: Database University Verification & Creation
  // ----------------------------------------------------
  console.log('\nTEST 8: Database University Verification & Creation');
  const verifiedVnsgu = await verifyAndEnsureUniversity('vnsgu');
  assert(verifiedVnsgu === 'vnsgu', 'verifyAndEnsureUniversity("vnsgu") returns "vnsgu"');

  const verifiedGu = await verifyAndEnsureUniversity('gu');
  assert(verifiedGu === 'gu', 'verifyAndEnsureUniversity("gu") returns "gu"');

  // Test DB User insertion with city and universityId
  const timestamp = Date.now();
  const testUser = await prisma.user.create({
    data: {
      email: `test.student.${timestamp}@lowstudy.com`,
      fullName: 'Test Dependent Dropdown Student',
      city: 'Surat',
      universityId: 'vnsgu',
      role: 'STUDENT',
    },
    include: {
      university: true,
    }
  });

  assert(testUser.city === 'Surat', 'User created with city="Surat"');
  assert(testUser.universityId === 'vnsgu', 'User created with universityId="vnsgu"');
  assert(testUser.university?.name === 'Veer Narmad South Gujarat University', 'University relation correctly resolved in database');

  // Clean up test user
  await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

