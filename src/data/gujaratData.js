// LowStudy — Gujarat Law Education & Institution Registry
// Comprehensive database of Gujarat Universities, Affiliated Law Colleges, and Syllabus Metadata.

export const GUJARAT_STATES = [
  { id: "gujarat", name: "Gujarat", code: "GJ", isDefault: true }
];

export const GUJARAT_UNIVERSITIES = [
  {
    id: "gu",
    name: "Gujarat University",
    code: "GU",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "State Public University",
    established: 1949,
    logo: "🏛️",
    officialWebsite: "https://www.gujaratuniversity.ac.in",
    officialSyllabusSource: "https://www.gujaratuniversity.ac.in/syllabus",
    status: "VERIFIED",
    lastVerified: "2026-09-01",
    academicYear: "2026-27"
  },
  {
    id: "su",
    name: "Saurashtra University",
    code: "SU",
    city: "Rajkot",
    district: "Rajkot",
    type: "State Public University",
    established: 1967,
    logo: "📜",
    officialWebsite: "https://www.saurashtrauniversity.edu",
    officialSyllabusSource: "https://www.saurashtrauniversity.edu/syllabi",
    status: "VERIFIED",
    lastVerified: "2026-08-28",
    academicYear: "2026-27"
  },
  {
    id: "vnsgu",
    name: "Veer Narmad South Gujarat University",
    code: "VNSGU",
    city: "Surat",
    district: "Surat",
    type: "State Public University",
    established: 1965,
    logo: "🦁",
    officialWebsite: "https://www.vnsgu.ac.in",
    officialSyllabusSource: "https://www.vnsgu.ac.in/syllabus.php",
    status: "VERIFIED",
    lastVerified: "2026-09-05",
    academicYear: "2026-27"
  },
  {
    id: "msu",
    name: "Maharaja Sayajirao University of Baroda",
    code: "MSU",
    city: "Vadodara",
    district: "Vadodara",
    type: "State Autonomous University",
    established: 1949,
    logo: "🏛️",
    officialWebsite: "https://www.msubaroda.ac.in",
    officialSyllabusSource: "https://www.msubaroda.ac.in/Academics/Syllabus",
    status: "VERIFIED",
    lastVerified: "2026-08-15",
    academicYear: "2026-27"
  },
  {
    id: "hngu",
    name: "Hemchandracharya North Gujarat University",
    code: "HNGU",
    city: "Patan",
    district: "Patan",
    type: "State Public University",
    established: 1986,
    logo: "📚",
    officialWebsite: "https://www.ngu.ac.in",
    officialSyllabusSource: "https://www.ngu.ac.in/syllabus",
    status: "VERIFIED",
    lastVerified: "2026-08-20",
    academicYear: "2026-27"
  },
  {
    id: "mkbu",
    name: "Maharaja Krishnakumarsinhji Bhavnagar University",
    code: "MKBU",
    city: "Bhavnagar",
    district: "Bhavnagar",
    type: "State Public University",
    established: 1978,
    logo: "🎓",
    officialWebsite: "https://www.mkbhavuni.edu.in",
    officialSyllabusSource: "https://www.mkbhavuni.edu.in/syllabus",
    status: "VERIFIED",
    lastVerified: "2026-07-30",
    academicYear: "2026-27"
  },
  {
    id: "gnlu",
    name: "Gujarat National Law University",
    code: "GNLU",
    city: "Gandhinagar",
    district: "Gandhinagar",
    type: "National Law University",
    established: 2003,
    logo: "⚖️",
    officialWebsite: "https://gnlu.ac.in",
    officialSyllabusSource: "https://gnlu.ac.in/academic-syllabus",
    status: "VERIFIED",
    lastVerified: "2026-09-02",
    academicYear: "2026-27"
  },
  {
    id: "parul",
    name: "Parul University (Faculty of Law)",
    code: "PU",
    city: "Vadodara",
    district: "Vadodara",
    type: "Private State University",
    established: 2015,
    logo: "🏰",
    officialWebsite: "https://paruluniversity.ac.in",
    officialSyllabusSource: "https://paruluniversity.ac.in/faculty-of-law",
    status: "VERIFIED",
    lastVerified: "2026-08-10",
    academicYear: "2026-27"
  },
  {
    id: "gls",
    name: "GLS University (Faculty of Law)",
    code: "GLS",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "Private State University",
    established: 2015,
    logo: "🏛️",
    officialWebsite: "https://www.glsuniversity.ac.in",
    officialSyllabusSource: "https://www.glsuniversity.ac.in/law",
    status: "VERIFIED",
    lastVerified: "2026-08-18",
    academicYear: "2026-27"
  }
];

export const GUJARAT_COLLEGES = [
  {
    id: "col-la-shah",
    name: "Sir L.A. Shah Law College",
    universityId: "gu",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "Grant-in-Aid Law College",
    officialWebsite: "https://lashahlawcollege.org",
    status: "VERIFIED",
    programs: ["llb-3yr", "llb-5yr"]
  },
  {
    id: "col-mn-law",
    name: "Motilal Nehru Law College",
    universityId: "gu",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "Government Aided Law College",
    officialWebsite: "https://mnlawcollege.org",
    status: "VERIFIED",
    programs: ["llb-3yr"]
  },
  {
    id: "col-im-nanavati",
    name: "I.M. Nanavati Law College",
    universityId: "gu",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "Private Grant-in-Aid",
    officialWebsite: "http://imnanavatilawcollege.org",
    status: "VERIFIED",
    programs: ["llb-3yr", "llm"]
  },
  {
    id: "col-siddharth",
    name: "Siddharth Law College",
    universityId: "gu",
    city: "Gandhinagar",
    district: "Gandhinagar",
    type: "Government Aided",
    officialWebsite: "https://siddharthlawcollege.in",
    status: "VERIFIED",
    programs: ["llb-3yr"]
  },
  {
    id: "col-vt-choksi",
    name: "V.T. Choksi Sarvajanik Law College",
    universityId: "vnsgu",
    city: "Surat",
    district: "Surat",
    type: "Grant-in-Aid Law College",
    officialWebsite: "https://vtchoksilaw.ac.in",
    status: "VERIFIED",
    programs: ["llb-3yr", "llm"]
  },
  {
    id: "col-sheth-mn",
    name: "Sheth M.N. Law College",
    universityId: "hngu",
    city: "Patan",
    district: "Patan",
    type: "Grant-in-Aid Law College",
    officialWebsite: "https://mnlawpatan.org",
    status: "VERIFIED",
    programs: ["llb-3yr"]
  },
  {
    id: "col-anand-law",
    name: "Anand Law College",
    universityId: "gu",
    city: "Anand",
    district: "Anand",
    type: "Self-Finance Law College",
    officialWebsite: "https://alc.ac.in",
    status: "VERIFIED",
    programs: ["llb-3yr", "llb-5yr", "llm"]
  },
  {
    id: "col-kp-shah",
    name: "K.P. Shah Law College",
    universityId: "su",
    city: "Jamnagar",
    district: "Jamnagar",
    type: "Grant-in-Aid",
    officialWebsite: "https://kpshahlawcollege.org",
    status: "VERIFIED",
    programs: ["llb-3yr"]
  },
  {
    id: "col-msu-fol",
    name: "Faculty of Law, M.S. University",
    universityId: "msu",
    city: "Vadodara",
    district: "Vadodara",
    type: "University Constituent Faculty",
    officialWebsite: "https://msubaroda.ac.in/Faculty/Law",
    status: "VERIFIED",
    programs: ["llb-3yr", "llb-5yr", "llm"]
  },
  {
    id: "col-gu-dept",
    name: "School of Law, Gujarat University",
    universityId: "gu",
    city: "Ahmedabad",
    district: "Ahmedabad",
    type: "University Department",
    officialWebsite: "https://www.gujaratuniversity.ac.in/department/law",
    status: "VERIFIED",
    programs: ["llb-3yr", "llb-5yr", "llm"]
  }
];

export const LAW_PROGRAMS = [
  { id: "llb-3yr", name: "3-Year LL.B. (Bachelor of Laws)", totalSemesters: 6, code: "LLB-3Y" },
  { id: "llb-5yr", name: "5-Year Integrated B.A. LL.B. (Hons.)", totalSemesters: 10, code: "BALLB-5Y" },
  { id: "bballb-5yr", name: "5-Year Integrated B.B.A. LL.B. (Hons.)", totalSemesters: 10, code: "BBALLB-5Y" },
  { id: "llm", name: "Master of Laws (LL.M.)", totalSemesters: 4, code: "LLM-2Y" }
];

export const ACADEMIC_YEARS = [
  { id: "2026-27", name: "2026-27 (Current Academic Year)", isCurrent: true },
  { id: "2025-26", name: "2025-26 (Previous Academic Batch)", isCurrent: false },
  { id: "2024-25", name: "2024-25 (Archived Batch)", isCurrent: false }
];
