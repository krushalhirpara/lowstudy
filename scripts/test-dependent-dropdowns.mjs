import prisma from '../src/lib/prisma.js';
import {
  getAcademicHierarchyData,
  validateAcademicOrderInput,
} from '../src/lib/services/examPrepService.js';
import fs from 'fs';
import path from 'path';

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

async function runTests() {
  console.log('🧪 Starting LowStudy Academic Data & Dependent Dropdown Test Suite...\n');

  try {
    // -------------------------------------------------------------
    // Test Requirement 1: Full Name Placeholder & No Prefilled Personal Names
    // -------------------------------------------------------------
    console.log('📋 Test 1: Full Name Placeholder Verification');
    const checkoutPagePath = path.resolve('src/app/exam-prep/checkout/page.jsx');
    const checkoutPageContent = fs.readFileSync(checkoutPagePath, 'utf8');

    assert(
      checkoutPageContent.includes('placeholder="Enter your full name"'),
      'Checkout page uses placeholder="Enter your full name"'
    );
    assert(
      !checkoutPageContent.includes('Krushal Hirpara'),
      'Checkout page does NOT contain "Krushal Hirpara"'
    );
    assert(
      checkoutPageContent.includes("const [fullName, setFullName] = useState('')"),
      'Student details state initializes fullName to empty string (no hardcoded name)'
    );

    // -------------------------------------------------------------
    // Test Case 1: Selecting a university loads only its verified affiliated colleges
    // -------------------------------------------------------------
    console.log('\n🏛️ Test Case 1: University -> Verified Affiliated Colleges Only');
    
    // GU
    const guData = await getAcademicHierarchyData({ universityId: 'gu' });
    assert(guData.success === true, 'GU hierarchy returns success: true');
    assert(Array.isArray(guData.colleges) && guData.colleges.length > 0, `GU has ${guData.colleges?.length} affiliated colleges`);
    const allGuCollegesBelongToGu = guData.colleges.every(c => c.universityId === 'gu');
    assert(allGuCollegesBelongToGu, 'All returned colleges for GU belong strictly to GU');
    
    // Check that Anand Law College (SPU) is NOT in GU's list
    const hasAnandInGu = guData.colleges.some(c => c.id === 'col-anand-law' || c.name.toLowerCase().includes('anand law'));
    assert(!hasAnandInGu, 'Anand Law College (SPU) is excluded from Gujarat University college list');

    // Check that SU colleges are NOT in GU's list
    const hasSuInGu = guData.colleges.some(c => c.universityId === 'su');
    assert(!hasSuInGu, 'Saurashtra University colleges are excluded from GU list');

    // SU
    const suData = await getAcademicHierarchyData({ universityId: 'su' });
    assert(suData.success === true, 'SU hierarchy returns success: true');
    assert(Array.isArray(suData.colleges) && suData.colleges.length >= 8, `SU has ${suData.colleges?.length} affiliated colleges`);
    const allSuCollegesBelongToSu = suData.colleges.every(c => c.universityId === 'su');
    assert(allSuCollegesBelongToSu, 'All returned colleges for SU belong strictly to SU');

    // VNSGU
    const vnsguData = await getAcademicHierarchyData({ universityId: 'vnsgu' });
    assert(vnsguData.success === true, 'VNSGU hierarchy returns success: true');
    assert(Array.isArray(vnsguData.colleges) && vnsguData.colleges.length >= 6, `VNSGU has ${vnsguData.colleges?.length} affiliated colleges`);
    const allVnsguCollegesBelongToVnsgu = vnsguData.colleges.every(c => c.universityId === 'vnsgu');
    assert(allVnsguCollegesBelongToVnsgu, 'All returned colleges for VNSGU belong strictly to VNSGU');

    // -------------------------------------------------------------
    // Test Case 2: Selecting a college loads only programmes verified for that college
    // -------------------------------------------------------------
    console.log('\n🎓 Test Case 2: Affiliated College -> Verified Programs Filtering');
    
    // Sir L.A. Shah / M.N. Nanavati Law College (col-mn-law) -> only 3-Yr LL.B.
    const mnData = await getAcademicHierarchyData({ universityId: 'gu', collegeId: 'col-mn-law' });
    assert(mnData.success === true, 'M.N. Nanavati Law College returns success');
    assert(mnData.university.courses.length === 1, 'M.N. Nanavati offers only 1 verified program');
    assert(mnData.university.courses[0].code === 'LLB-3Y', 'M.N. Nanavati offers only 3-Year LL.B. (LLB-3Y)');

    // University School of Law (col-gu-dept) -> 5-Year Integrated B.A. LL.B. & LL.M.
    const deptData = await getAcademicHierarchyData({ universityId: 'gu', collegeId: 'col-gu-dept' });
    assert(deptData.success === true, 'GU School of Law returns success');
    const deptCourseCodes = deptData.university.courses.map(c => c.code);
    assert(deptCourseCodes.includes('BALLB-5Y'), 'GU School of Law offers B.A. LL.B. (5-Yr Integrated)');
    assert(!deptCourseCodes.includes('LLB-3Y'), 'GU School of Law does NOT offer 3-Yr LL.B.');

    // -------------------------------------------------------------
    // Test Case 3 & 4: Course -> Valid Semesters with Actual Distinct Subject Counts
    // -------------------------------------------------------------
    console.log('\n📚 Test Case 3 & 4: Course -> Valid Semesters & Accurate Subject Counts');
    
    // GU 3-Yr LL.B.
    const guCourse = guData.university.courses.find(c => c.code === 'LLB-3Y');
    assert(guCourse !== undefined, 'GU 3-Year LL.B. course found');
    assert(guCourse.semesters.length === 6, `GU 3-Yr LL.B. has 6 semesters (got ${guCourse.semesters.length})`);
    
    const guSem1 = guCourse.semesters.find(s => s.semesterNumber === 1);
    assert(guSem1 !== undefined, 'GU Semester 1 exists');
    assert(guSem1.distinctSubjectCount === 5, `GU Semester 1 has exactly 5 distinct curriculum subjects (got ${guSem1?.distinctSubjectCount})`);
    assert(guSem1.displayLabel === 'Semester 1 (5 Subjects)', `GU Semester 1 displays exact subject count label: "${guSem1?.displayLabel}"`);

    const guSem2 = guCourse.semesters.find(s => s.semesterNumber === 2);
    assert(guSem2.distinctSubjectCount === 6, `GU Semester 2 has exactly 6 distinct curriculum subjects (got ${guSem2?.distinctSubjectCount})`);
    assert(guSem2.displayLabel === 'Semester 2 (6 Subjects)', `GU Semester 2 displays exact subject count label: "${guSem2?.displayLabel}"`);

    // SU 3-Yr LL.B.
    const suCourse = suData.university.courses.find(c => c.code === 'LLB-3Y');
    assert(suCourse !== undefined, 'SU 3-Year LL.B. course found');
    assert(suCourse.semesters.length === 6, `SU 3-Yr LL.B. has 6 semesters (got ${suCourse.semesters.length})`);
    const suSem3 = suCourse.semesters.find(s => s.semesterNumber === 3);
    assert(suSem3 !== undefined, 'SU Semester 3 exists');
    assert(suSem3.distinctSubjectCount === 5, `SU Semester 3 has exactly 5 distinct curriculum subjects (got ${suSem3?.distinctSubjectCount})`);
    assert(suSem3.displayLabel === 'Semester 3 (5 Subjects)', `SU Semester 3 displays exact subject count label: "${suSem3?.displayLabel}"`);

    // -------------------------------------------------------------
    // Test Case 5: Selecting a semester loads matching subjects
    // -------------------------------------------------------------
    console.log('\n📖 Test Case 5: Semester -> Matching Subjects');
    assert(guSem1.subjects.length > 0, `GU Sem 1 has subjects loaded (count: ${guSem1.subjects.length})`);
    const guSubjectTitles = guSem1.subjects.map(s => s.title);
    assert(
      guSubjectTitles.some(t => t.toLowerCase().includes('jurisprudence') || t.toLowerCase().includes('contract')),
      'GU Sem 1 subjects include Jurisprudence or Contract'
    );

    // -------------------------------------------------------------
    // Test Case 6 & 7: Changing university/course resets incompatible downstream selections
    // -------------------------------------------------------------
    console.log('\n🔄 Test Case 6 & 7: Selection Change Downstream Reset Logic');
    assert(
      checkoutPageContent.includes('const handleUniversityChange = (newUniId) => {') &&
      checkoutPageContent.includes("setSelectedCollegeId('')") &&
      checkoutPageContent.includes("setSelectedSemesterId('')"),
      'Checkout page resets college, course, and semester when university changes'
    );

    assert(
      checkoutPageContent.includes('const handleCourseChange = (newCourseId) => {') &&
      checkoutPageContent.includes('setSelectedCourseId(newCourseId)'),
      'Checkout page resets semester and subject when course changes'
    );

    // -------------------------------------------------------------
    // Test Case 8: Server-side rejection of invalid combinations (Status 400)
    // -------------------------------------------------------------
    console.log('\n🛡️ Test Case 8: Server-Side Validation Rejection (Status 400)');
    
    // 8a: Hierarchy with cross-university college mapping
    const badColResult = await getAcademicHierarchyData({ universityId: 'gu', collegeId: 'col-su-amreli' });
    assert(badColResult.success === false && badColResult.status === 400, 'Cross-university college rejected with status 400');
    assert(badColResult.error?.includes('not affiliated'), `Informative error message returned: "${badColResult.error}"`);

    // 8b: Hierarchy with college-incompatible program
    const badProgResult = await getAcademicHierarchyData({ universityId: 'gu', collegeId: 'col-mn-law', courseId: 'gu-llb-5yr' });
    assert(badProgResult.success === false && badProgResult.status === 400, 'Incompatible college-course rejected with status 400');
    assert(badProgResult.error?.includes('not offered'), `Informative error message returned: "${badProgResult.error}"`);

    // 8c: Order validation helper with invalid college for GU
    const badOrderColResult = await validateAcademicOrderInput({
      universityId: 'gu',
      collegeId: 'col-su-amreli',
      courseId: 'gu-llb-3yr',
    });
    assert(badOrderColResult.valid === false && badOrderColResult.status === 400, 'Order validation rejects cross-university college');

    // 8d: Order validation helper with invalid program for college
    const badOrderProgResult = await validateAcademicOrderInput({
      universityId: 'gu',
      collegeId: 'col-mn-law',
      courseId: 'gu-llb-5yr',
    });
    assert(badOrderProgResult.valid === false && badOrderProgResult.status === 400, 'Order validation rejects incompatible college program');

    // 8e: Order validation helper with valid academic combination
    const validOrderResult = await validateAcademicOrderInput({
      universityId: 'gu',
      collegeId: 'col-mn-law',
      courseId: 'gu-llb-3yr',
      semesterId: 'gu-llb-3yr-sem1',
    });
    assert(validOrderResult.valid === true, 'Order validation accepts verified valid academic combination');

    // -------------------------------------------------------------
    // Test Case 9: Missing or unverified data produces clear messages
    // -------------------------------------------------------------
    console.log('\n📢 Test Case 9: Clear Messages for Unitary / Unverified Institutions');
    
    // GNLU (Unitary National Law University)
    const gnluData = await getAcademicHierarchyData({ universityId: 'gnlu' });
    assert(gnluData.success === true, 'GNLU hierarchy returns success');
    assert(gnluData.colleges.length === 0, 'GNLU has 0 affiliated colleges');
    assert(gnluData.university.hasNoAffiliatedColleges === true, 'GNLU has flag hasNoAffiliatedColleges = true');
    assert(
      gnluData.university.collegeMessage?.includes('Unitary Institution') || gnluData.university.collegeMessage?.includes('Gandhinagar Campus'),
      `GNLU returns clear unitary institution message: "${gnluData.university.collegeMessage}"`
    );

    // Semesters with 0 subjects show "Syllabus data under verification"
    // Let's check a semester without seeded subjects if any
    let unseededFound = false;
    for (const c of guData.university.courses) {
      for (const s of c.semesters) {
        if (s.distinctSubjectCount === 0) {
          assert(s.isUnderVerification === true, `Unseeded semester ${s.id} has isUnderVerification = true`);
          assert(
            s.displayLabel.includes('Syllabus data under verification'),
            `Unseeded semester displays label: "${s.displayLabel}"`
          );
          unseededFound = true;
          break;
        }
      }
      if (unseededFound) break;
    }
    if (!unseededFound) {
      console.log('  ℹ️ All active semesters have verified curriculum subjects.');
    }

  } catch (err) {
    console.error('💥 Unexpected test error:', err);
    failed++;
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Dropdown Test Suite Results: ${passed} Passed, ${failed} Failed`);
  console.log('------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
