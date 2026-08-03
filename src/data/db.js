// LowStudy Relational Mock Database Engine
// Persists schema states to localStorage. Future-ready architecture.

const BASE_UNIVERSITIES = [
  { id: "gu", name: "Gujarat University", code: "GU", logo: "🏛️" },
  { id: "su", name: "Saurashtra University", code: "SU", logo: "📜" },
  { id: "vnsgu", name: "Veer Narmad South Gujarat University", code: "VNSGU", logo: "🦁" }
];

const BASE_COURSES = [
  { id: "llb", name: "Bachelor of Laws (LLB)", durationYears: 3 }
];

const BASE_SEMESTERS = [
  { id: "sem1", name: "Semester 1", num: 1 },
  { id: "sem2", name: "Semester 2", num: 2 },
  { id: "sem3", name: "Semester 3", num: 3 },
  { id: "sem4", name: "Semester 4", num: 4 },
  { id: "sem5", name: "Semester 5", num: 5 },
  { id: "sem6", name: "Semester 6", num: 6 }
];

const BASE_SUBJECTS = [
  // Semester 1
  { id: "constitutional-law-1", title: "Constitutional Law - I", shortCode: "CONST-1", semesterId: "sem1", category: "Core Law", color: "from-blue-600 to-indigo-900" },
  { id: "contract-law-1", title: "Law of Contract - I", shortCode: "CONTRACT-1", semesterId: "sem1", category: "Civil Law", color: "from-sky-600 to-blue-950" },
  { id: "tort-law", title: "Law of Torts & Consumer Protection", shortCode: "TORTS", semesterId: "sem1", category: "Civil Law", color: "from-violet-600 to-purple-900" },
  
  // Semester 2
  { id: "constitutional-law-2", title: "Constitutional Law - II", shortCode: "CONST-2", semesterId: "sem2", category: "Core Law", color: "from-indigo-600 to-indigo-950" },
  { id: "contract-law-2", title: "Law of Contract - II (Special Contracts)", shortCode: "CONTRACT-2", semesterId: "sem2", category: "Civil Law", color: "from-cyan-600 to-blue-900" },
  { id: "bns", title: "Bharatiya Nyaya Sanhita (BNS, 2023)", shortCode: "BNS", semesterId: "sem2", category: "Criminal Law", color: "from-amber-600 to-red-900" },
  
  // Semester 3
  { id: "family-law-1", title: "Family Law - I (Hindu Law)", shortCode: "FAMILY-1", semesterId: "sem3", category: "Personal Law", color: "from-rose-600 to-pink-900" },
  { id: "bnss", title: "Bharatiya Nagarik Suraksha Sanhita (BNSS)", shortCode: "BNSS", semesterId: "sem3", category: "Criminal Procedure", color: "from-emerald-600 to-teal-900" },
  
  // Semester 4
  { id: "family-law-2", title: "Family Law - II (Muslim Law & Succession)", shortCode: "FAMILY-2", semesterId: "sem4", category: "Personal Law", color: "from-pink-700 to-red-950" },
  { id: "bsa", title: "Bharatiya Sakshya Adhiniyam (BSA, 2023)", shortCode: "BSA", semesterId: "sem4", category: "Evidence Law", color: "from-purple-600 to-indigo-950" },
  { id: "environmental-law", title: "Environmental Law & NGT Act", shortCode: "ENV", semesterId: "sem4", category: "Public Law", color: "from-green-600 to-emerald-900" },
  
  // Semester 5
  { id: "cpc", title: "Code of Civil Procedure (CPC, 1908)", shortCode: "CPC", semesterId: "sem5", category: "Civil Procedure", color: "from-blue-700 to-slate-900" },
  { id: "company-law", title: "Companies Act, 2013", shortCode: "COMPANY", semesterId: "sem5", category: "Corporate Law", color: "from-cyan-600 to-slate-900" },
  { id: "ipr", title: "Intellectual Property Rights (IPR)", shortCode: "IPR", semesterId: "sem5", category: "Specialized Law", color: "from-fuchsia-600 to-purple-950" },
  
  // Semester 6
  { id: "taxation", title: "Taxation Laws (Direct & GST)", shortCode: "TAX", semesterId: "sem6", category: "Commercial Law", color: "from-yellow-600 to-amber-950" },
  { id: "arbitration", title: "Arbitration & Conciliation Act", shortCode: "ADR", semesterId: "sem6", category: "Commercial Law", color: "from-indigo-600 to-blue-900" },
  { id: "cyber-law", title: "Cyber Law & IT Act, 2000", shortCode: "CYBER", semesterId: "sem6", category: "Specialized Law", color: "from-teal-600 to-emerald-950" }
];

// Baseline syllabus content (Units & Topics mapping)
const BASE_UNITS = [
  { id: "const1-u1", subjectId: "constitutional-law-1", unitNumber: 1, title: "Historical Background & Preamble", description: "Evolution of the Constitution and the fundamental philosophy of the Preamble." },
  { id: "const1-u2", subjectId: "constitutional-law-1", unitNumber: 2, title: "Part III - Fundamental Rights (Articles 12-18)", description: "Concept of State, Judicial Review, and Rights to Equality." },
  { id: "const1-u3", subjectId: "constitutional-law-1", unitNumber: 3, title: "Part III - Freedoms & Article 21", description: "Fundamental freedoms under Article 19 and the right to life under Article 21." },
  { id: "const1-u4", subjectId: "constitutional-law-1", unitNumber: 4, title: "Constitutional Remedies", description: "Article 32 and Article 226 writ jurisdictions." },
  
  { id: "bns-u1", subjectId: "bns", unitNumber: 1, title: "General Principles & Punishments", description: "Preliminary sections, definitions, and types of punishments under BNS 2023." },
  { id: "bns-u2", subjectId: "bns", unitNumber: 2, title: "Offences Affecting Human Body", description: "Culpable homicide, murder, mob lynching, and causing hurt." },
  { id: "bns-u3", subjectId: "bns", unitNumber: 3, title: "Offences Against Property & Women", description: "Theft, cheating, criminal trespass, and crimes against women." }
];

const BASE_TOPICS = [
  { id: "const1-u1-t1", unitId: "const1-u1", title: "Preamble and Basic Structure Doctrine", description: "Analysis of the Preamble as part of the Constitution and the limits of amending powers." },
  { id: "const1-u2-t1", unitId: "const1-u2", title: "Concept of State under Article 12", description: "Definition of 'State' and extension to public/private utility bodies." },
  { id: "const1-u2-t2", unitId: "const1-u2", title: "Article 14: Equality Before Law", description: "Rule of Law, reasonable classification, and non-arbitrariness doctrine." },
  { id: "const1-u3-t1", unitId: "const1-u3", title: "Article 21: Right to Life and Liberty", description: "Due process of law, expanding horizons of Article 21, and key precedents." },
  
  { id: "bns-u1-t1", unitId: "bns-u1", title: "IPC to BNS Transition Overview", description: "Main changes, section renumberings, and community service introduction." },
  { id: "bns-u2-t1", unitId: "bns-u2", title: "BNS Section 103: Murder", description: "Elements of murder, comparison with IPC 302, and mob lynching provisions." },
  { id: "bns-u3-t1", unitId: "bns-u3", title: "BNS Section 318: Cheating", description: "renamed IPC 420, digital fraud inclusions, and punishment frameworks." }
];

const BASE_NOTES = [
  {
    id: "note-const1-u1-t1",
    topicId: "const1-u1-t1",
    simpleNotes: "The Preamble is the introductory statement of the Constitution which sets out its goals, values, and principles. The Basic Structure Doctrine limits Parliament's amending powers under Article 368. It prevents Parliament from changing fundamental features like Democracy, Secularism, and Judicial Review.",
    detailedNotes: "The Preamble represents the soul of the Indian Constitution, as outlined in the landmark Berubari Union Case (1960) and later redefined in Kesavananda Bharati v. State of Kerala (1973). The Kesavananda case established by a 7:6 majority that while Article 368 gives Parliament broad power to amend the constitution, this power cannot be used to damage, alter or destroy its 'Basic Structure' (fundamental pillars such as Democracy, Rule of Law, Separation of Powers, and Federalism).",
    examples: [
      "If Parliament passes a law making India a monarchy instead of a republic, this law would violate the Basic Structure and be declared void by the judiciary.",
      "Amending Article 368 to completely remove Judicial Review violates the Basic Structure."
    ],
    flowcharts: [
      "Parliament Power (Art 368) ➔ Subject to Judicial Review ➔ Cannot destroy Basic Structure (Secularism, Rule of Law, Republic)"
    ],
    importantPoints: [
      "The Preamble is part of the Indian Constitution.",
      "The Preamble cannot be used to override clear provisions of the constitution, but helps resolve ambiguity.",
      "Basic Structure list is not exhaustive and is defined case-by-case by the SC."
    ],
    examTips: [
      "Always start basic structure questions by citing Kesavananda Bharati (1973) 4 SCC 225.",
      "Mention the 13-judge bench size (largest in Indian history) and the 7:6 ratio."
    ],
    faqs: [
      { q: "Is the Preamble enforceable in a court of law?", a: "No, the Preamble is non-justiciable. It cannot be directly enforced, but is used to interpret constitutional provisions." },
      { q: "Has the Preamble ever been amended?", a: "Yes, once. By the 42nd Amendment Act (1976), adding the words 'Socialist', 'Secular', and 'Integrity'." }
    ]
  },
  {
    id: "note-bns-u2-t1",
    topicId: "bns-u2-t1",
    simpleNotes: "BNS Section 103 defines the offence and punishment of Murder, which was previously IPC Section 302. Punishment is death penalty or life imprisonment and a fine. It also includes explicit punishments for Mob Lynching.",
    detailedNotes: "Section 103 of Bharatiya Nyaya Sanhita (BNS) 2023 replaces the historical Section 302 of IPC 1860. Section 103(1) states that whoever commits murder shall be punished with death or life imprisonment, and fine. Crucially, Section 103(2) introduces a new provision targeting Mob Lynching: when a group of 5 or more persons commits murder on grounds of race, caste, community, sex, place of birth, language or personal belief, each member is punished with death or life imprisonment.",
    examples: [
      "A poisons B's food with the intent to cause B's death. B dies. A has committed murder under BNS 103(1).",
      "A mob of 6 people attacks and kills a person over their religious beliefs. All participants are liable to death/life imprisonment under BNS 103(2)."
    ],
    flowcharts: [
      "Culpable Homicide (Sec 100 BNS) ➔ Escalates to Murder (Sec 103 BNS) if elements of intentional death are met ➔ Punished under Sec 103(1) or 103(2)"
    ],
    importantPoints: [
      "Replaces IPC Section 302.",
      "Death penalty application is governed by the 'Rarest of Rare Cases' doctrine.",
      "Explicitly codifies group mob violence / lynching."
    ],
    examTips: [
      "Cite Bachan Singh v. State of Punjab (1980) for the 'Rarest of Rare Cases' guidelines which still apply under BNS 103."
    ],
    faqs: [
      { q: "What is the difference between Section 103(1) and 103(2)?", a: "Section 103(1) applies to individual murder, while Section 103(2) applies specifically to mob lynching by 5 or more persons based on discriminatory factors." }
    ]
  }
];

const BASE_MCQS = [
  { id: 1, topicId: "const1-u1-t1", question: "Which landmark case established the 'Basic Structure Doctrine' in India?", options: ["Golaknath Case", "Kesavananda Bharati Case", "Minerva Mills Case", "Maneka Gandhi Case"], correctIndex: 1, difficulty: "easy", explanation: "Kesavananda Bharati v. State of Kerala (1973) is the seminal case that propounded the Basic Structure Doctrine." },
  { id: 2, topicId: "const1-u1-t1", question: "How many judges sat on the bench of the Kesavananda Bharati case?", options: ["9", "11", "13", "7"], correctIndex: 2, difficulty: "medium", explanation: "A historic 13-judge constitutional bench heard the Kesavananda case, deciding the matter with a 7:6 majority." },
  { id: 3, topicId: "const1-u1-t1", question: "Which of the following is NOT part of the Basic Structure list as defined by the Supreme Court?", options: ["Judicial Review", "Secularism", "Absolute Right to Private Property", "Rule of Law"], correctIndex: 2, difficulty: "hard", explanation: "The absolute right to private property was explicitly removed from the Fundamental Rights and is NOT part of the Basic Structure." },
  
  { id: 4, topicId: "bns-u2-t1", question: "Which section of the BNS 2023 prescribes punishment for Murder?", options: ["Section 302", "Section 103", "Section 101", "Section 318"], correctIndex: 1, difficulty: "easy", explanation: "Section 103 of BNS 2023 replaces IPC Section 302 for the punishment of murder." },
  { id: 5, topicId: "bns-u2-t1", question: "Under BNS Section 103(2), mob lynching requires a group of how many persons?", options: ["2 or more", "3 or more", "5 or more", "10 or more"], correctIndex: 2, difficulty: "medium", explanation: "BNS Section 103(2) specifies that mob lynching provisions are triggered when a group of 5 or more persons act in concert." }
];

const BASE_CASE_LAWS = [
  {
    id: "kesavananda",
    topicId: "const1-u1-t1",
    title: "Kesavananda Bharati v. State of Kerala (1973)",
    citation: "(1973) 4 SCC 225",
    bench: "13 Judges (7:6 Majority)",
    subject: "Constitutional Law",
    keyPrinciple: "Basic Structure Doctrine",
    facts: "The head of a Hindu matha challenged land reform acts in Kerala which limited the matha's property rights under Articles 25, 26, 14, 19(1)(f), and 31.",
    issues: "Whether the power of Parliament to amend the Constitution under Article 368 is absolute or limited.",
    arguments: [
      "Petitioners argued that amending power does not allow destroying the fundamental identity of the constitution.",
      "The State argued that the power of parliament under Article 368 is unlimited and supreme."
    ],
    judgment: "The Supreme Court held that while Parliament can amend any part of the Constitution including Fundamental Rights, it cannot amend or destroy the Basic Structure of the Constitution.",
    ratio: "Amending power does not include power to destroy the essential identity and core principles of the constitution.",
    importance: "Widely regarded as the savior of constitutional democracy in India."
  }
];

const BASE_BARE_ACTS = [
  { id: "act-bns-103", topicId: "bns-u2-t1", actName: "BNS 2023", sectionNumber: "Section 103", title: "Punishment for Murder", content: "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. (2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other ground, each member of such group shall be punished with death or with imprisonment for life or imprisonment for a term which shall not be less than seven years, and shall also be liable to fine.", relatedSections: ["Section 100 (Culpable Homicide)", "Section 101 (Murder definition)"] }
];

const BASE_FLASHCARDS = [
  { id: "fc-1", topicId: "const1-u1-t1", front: "Who propounded the Basic Structure Doctrine?", back: "The Supreme Court of India in Kesavananda Bharati v. State of Kerala (1973)." },
  { id: "fc-2", topicId: "const1-u1-t1", front: "Is the right to property a basic structure?", back: "No. It is a constitutional right under Article 300A, but NOT a fundamental right or basic structure." },
  { id: "fc-3", topicId: "bns-u2-t1", front: "What is the BNS section for murder?", back: "Section 103 of BNS 2023 (formerly IPC Section 302)." }
];

const BASE_MOCK_TESTS = [
  {
    id: "mt-gu-sem1",
    universityId: "gu",
    semesterId: "sem1",
    subjectId: "constitutional-law-1",
    title: "Gujarat University Constitutional Law - I Mock Exam",
    timeLimit: 15,
    totalQuestions: 4,
    questions: [
      { question: "The Preamble was amended by which constitutional amendment?", options: ["42nd Amendment", "44th Amendment", "24th Amendment", "86th Amendment"], correctIndex: 0, explanation: "The 42nd Amendment Act of 1976 added the words Secular, Socialist, and Integrity." },
      { question: "Writ of Habeas Corpus is filed for what reason?", options: ["To prevent unlawful detention", "To direct performance of public duty", "To quash judicial orders", "To check eligibility for public office"], correctIndex: 0, explanation: "Habeas Corpus literally means 'produce the body' and safeguards personal liberty against unlawful detention." },
      { question: "Under Article 12, 'State' includes which of the following?", options: ["Government and Parliament of India", "Government and Legislature of States", "All local or other authorities within India", "All of the above"], correctIndex: 3, explanation: "Article 12 defines State broadly to include Government, Parliament, legislatures, and all local/other authorities." },
      { question: "Which article is referred to as the heart and soul of the Constitution by Dr. B.R. Ambedkar?", options: ["Article 19", "Article 21", "Article 32", "Article 14"], correctIndex: 2, explanation: "Dr. B.R. Ambedkar called Article 32 (Right to Constitutional Remedies) the heart and soul of the Constitution." }
    ],
    negativeMarking: true
  }
];

const BASE_LEADERBOARD = [
  { name: "Neha Patel", uni: "VNSGU", xp: 2850, rank: 1, badge: "⚖️ Senior Counsel" },
  { name: "Rajesh Vaghela", uni: "GU", xp: 2400, rank: 2, badge: "📜 Scholar" },
  { name: "Jignesh Mewada", uni: "SU", xp: 1950, rank: 3, badge: "📜 Scholar" },
  { name: "Arjun Sharma", uni: "GU", xp: 1450, rank: 4, badge: "🎯 Quiz Master" }
];

const DEFAULT_PROFILE = {
  name: "Arjun Sharma",
  role: "LLB Student",
  targetExam: "Judiciary Services & AIBE XIX",
  streakDays: 7,
  xp: 1450,
  coins: 320,
  level: "Advocate Apprentice",
  badges: [
    { title: "Consti Scholar", icon: "⚖️", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { title: "BNS Explorer", icon: "📜", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { title: "Quiz Master", icon: "🎯", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { title: "7-Day Streak", icon: "🔥", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
  ],
  strongTopics: ["Preamble and Basic Structure Doctrine"],
  weakTopics: ["BNS Section 318: Cheating"],
  bookmarks: ["note-const1-u1-t1"],
  completedTopics: []
};

class MockDBClass {
  constructor() {
    this.isLoaded = false;
    this.state = {};
  }

  init() {
    if (typeof window === "undefined") return;
    if (this.isLoaded) return;

    try {
      const data = localStorage.getItem("lowstudy_db");
      if (data) {
        this.state = JSON.parse(data);
      } else {
        this.state = this.getSeedData();
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      this.state = this.getSeedData();
    }
  }

  getSeedData() {
    return {
      universities: BASE_UNIVERSITIES,
      courses: BASE_COURSES,
      semesters: BASE_SEMESTERS,
      subjects: BASE_SUBJECTS,
      units: BASE_UNITS,
      topics: BASE_TOPICS,
      notes: BASE_NOTES,
      mcqs: BASE_MCQS,
      caseLaws: BASE_CASE_LAWS,
      bareActs: BASE_BARE_ACTS,
      flashcards: BASE_FLASHCARDS,
      mockTests: BASE_MOCK_TESTS,
      leaderboard: BASE_LEADERBOARD,
      profile: DEFAULT_PROFILE,
      adsEnabled: true,
      seoTitleTemplate: "%s | LowStudy Law Learning Platform",
      selectedUniId: "",
      selectedSemId: ""
    };
  }

  save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("lowstudy_db", JSON.stringify(this.state));
    } catch (e) {}
  }

  // --- QUERY APIS ---

  getUniversities() {
    this.init();
    return this.state.universities || [];
  }

  getSemesters() {
    this.init();
    return this.state.semesters || [];
  }

  getSelectedUni() {
    this.init();
    return this.state.universities?.find(u => u.id === this.state.selectedUniId) || null;
  }

  getSelectedSem() {
    this.init();
    return this.state.semesters?.find(s => s.id === this.state.selectedSemId) || null;
  }

  setSelectedUniAndSem(uniId, semId) {
    this.init();
    this.state.selectedUniId = uniId;
    this.state.selectedSemId = semId;
    this.save();
  }

  getSubjects(uniId = null, semId = null) {
    this.init();
    let list = this.state.subjects || [];
    // If semester filter is active
    const targetSemId = semId || this.state.selectedSemId;
    if (targetSemId) {
      list = list.filter(s => s.semesterId === targetSemId);
    }
    return list;
  }

  getSubjectById(id) {
    this.init();
    return this.state.subjects?.find(s => s.id === id) || null;
  }

  getUnits(subjectId) {
    this.init();
    return this.state.units?.filter(u => u.subjectId === subjectId) || [];
  }

  getTopics(unitId) {
    this.init();
    return this.state.topics?.filter(t => t.unitId === unitId) || [];
  }

  getNotes(topicId) {
    this.init();
    return this.state.notes?.find(n => n.topicId === topicId) || null;
  }

  getMCQs(topicId) {
    this.init();
    return this.state.mcqs?.filter(m => m.topicId === topicId) || [];
  }

  getCaseLaws(topicId) {
    this.init();
    return this.state.caseLaws?.filter(c => c.topicId === topicId) || [];
  }

  getBareActs(topicId) {
    this.init();
    return this.state.bareActs?.filter(b => b.topicId === topicId) || [];
  }

  getFlashcards(topicId) {
    this.init();
    return this.state.flashcards?.filter(f => f.topicId === topicId) || [];
  }

  getMockTests() {
    this.init();
    const uniId = this.state.selectedUniId;
    const semId = this.state.selectedSemId;
    let list = this.state.mockTests || [];
    if (uniId) {
      list = list.filter(t => t.universityId === uniId);
    }
    if (semId) {
      list = list.filter(t => t.semesterId === semId);
    }
    return list;
  }

  getMockTestById(id) {
    this.init();
    return this.state.mockTests?.find(t => t.id === id) || null;
  }

  getLeaderboard() {
    this.init();
    return this.state.leaderboard || [];
  }

  getProfile() {
    this.init();
    return this.state.profile || DEFAULT_PROFILE;
  }

  updateProfile(profileData) {
    this.init();
    this.state.profile = { ...this.state.profile, ...profileData };
    this.save();
    return this.state.profile;
  }

  getAdsSetting() {
    this.init();
    return this.state.adsEnabled;
  }

  setAdsSetting(val) {
    this.init();
    this.state.adsEnabled = val;
    this.save();
  }

  // --- ADMIN CRUD APIS ---

  addSubject(subj) {
    this.init();
    this.state.subjects.push(subj);
    this.save();
  }

  addUnit(unit) {
    this.init();
    this.state.units.push(unit);
    this.save();
  }

  addTopic(topic) {
    this.init();
    this.state.topics.push(topic);
    this.save();
  }

  addNote(note) {
    this.init();
    this.state.notes.push(note);
    this.save();
  }

  addMCQ(mcq) {
    this.init();
    this.state.mcqs.push(mcq);
    this.save();
  }

  addCaseLaw(c) {
    this.init();
    this.state.caseLaws.push(c);
    this.save();
  }

  addBareAct(act) {
    this.init();
    this.state.bareActs.push(act);
    this.save();
  }

  deleteSubject(id) {
    this.init();
    this.state.subjects = this.state.subjects.filter(s => s.id !== id);
    this.save();
  }
}

export const MockDB = new MockDBClass();
