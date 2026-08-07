// LowStudy Relational Mock Database Engine
// Persists schema states to localStorage. Future-ready architecture.

import { ALL_SYLLABUS_SUBJECTS, UNIVERSITIES, SEMESTERS } from '@/data/syllabusData';

const BASE_COURSES = [
  { id: "llb", name: "Bachelor of Laws (LLB)", durationYears: 3 }
];

const BASE_MOCK_TESTS = [
  {
    id: "mt-gu-sem1",
    universityId: "gu",
    semesterId: "sem1",
    subjectId: "gu-sem1-new-const-1",
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

function getExtractedSeedData() {
  const subjects = [];
  const units = [];
  const topics = [];
  const notes = [];
  const mcqs = [];
  const caseLaws = [];
  const bareActs = [];
  const flashcards = [];

  ALL_SYLLABUS_SUBJECTS.forEach(subj => {
    subjects.push({
      id: subj.id,
      title: subj.title,
      shortCode: subj.shortCode,
      category: subj.category,
      credits: subj.credits,
      semesterId: subj.semesterId,
      universityId: subj.universityId,
      syllabusVersion: subj.syllabusVersion,
      color: subj.color
    });

    subj.units.forEach(unit => {
      units.push({
        id: unit.id,
        subjectId: subj.id,
        unitNumber: unit.unitNumber,
        title: unit.title,
        description: unit.description
      });

      unit.topics.forEach(topic => {
        topics.push({
          id: topic.id,
          unitId: unit.id,
          title: topic.title,
          description: topic.description,
          subTopics: topic.subTopics,
          importantQuestions: topic.importantQuestions,
          pyqs: topic.pyqs,
          books: topic.books,
          videos: topic.videos,
          mindMaps: topic.mindMaps
        });

        if (topic.notes) {
          notes.push({
            id: `note-${topic.id}`,
            topicId: topic.id,
            ...topic.notes
          });
        }

        if (topic.mcqs) {
          topic.mcqs.forEach((mcq, mIdx) => {
            mcqs.push({
              id: `${topic.id}-mcq-${mIdx + 1}`,
              topicId: topic.id,
              ...mcq
            });
          });
        }

        if (topic.caseLaws) {
          topic.caseLaws.forEach((cl, cIdx) => {
            caseLaws.push({
              id: `${topic.id}-case-${cIdx + 1}`,
              topicId: topic.id,
              ...cl
            });
          });
        }

        if (topic.bareActs) {
          topic.bareActs.forEach((ba, bIdx) => {
            bareActs.push({
              id: `${topic.id}-act-${bIdx + 1}`,
              topicId: topic.id,
              ...ba
            });
          });
        }

        if (topic.flashcards) {
          topic.flashcards.forEach((fc, fIdx) => {
            flashcards.push({
              id: `${topic.id}-fc-${fIdx + 1}`,
              topicId: topic.id,
              ...fc
            });
          });
        }
      });
    });
  });

  return { subjects, units, topics, notes, mcqs, caseLaws, bareActs, flashcards };
}

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
      const seed = this.getSeedData();
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.version || parsed.version < seed.version || !parsed.subjects || parsed.subjects.length !== seed.subjects.length) {
          this.state = {
            ...seed,
            profile: parsed.profile ? { ...seed.profile, ...parsed.profile } : seed.profile,
            selectedUniId: parsed.selectedUniId !== undefined ? parsed.selectedUniId : seed.selectedUniId,
            selectedSemId: parsed.selectedSemId !== undefined ? parsed.selectedSemId : seed.selectedSemId,
            selectedSyllabusVersion: parsed.selectedSyllabusVersion || seed.selectedSyllabusVersion
          };
          this.save();
        } else {
          this.state = parsed;
        }
      } else {
        this.state = seed;
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      this.state = this.getSeedData();
    }
  }

  getSeedData() {
    const extracted = getExtractedSeedData();
    return {
      version: 3,
      universities: UNIVERSITIES,
      courses: BASE_COURSES,
      semesters: SEMESTERS,
      subjects: extracted.subjects,
      units: extracted.units,
      topics: extracted.topics,
      notes: extracted.notes,
      mcqs: extracted.mcqs,
      caseLaws: extracted.caseLaws,
      bareActs: extracted.bareActs,
      flashcards: extracted.flashcards,
      mockTests: BASE_MOCK_TESTS,
      leaderboard: BASE_LEADERBOARD,
      profile: DEFAULT_PROFILE,
      adsEnabled: true,
      seoTitleTemplate: "%s | LowStudy Law Learning Platform",
      selectedUniId: "",
      selectedSemId: "",
      selectedSyllabusVersion: "new"
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

  getSelectedSyllabusVersion() {
    this.init();
    return this.state.selectedSyllabusVersion || "new";
  }

  setSelectedSyllabusVersion(val) {
    this.init();
    this.state.selectedSyllabusVersion = val;
    this.save();
  }

  getSubjects(uniId = null, semId = null, version = null) {
    this.init();
    let list = this.state.subjects || [];
    
    // Filter by university
    const targetUniId = uniId || this.state.selectedUniId;
    if (targetUniId) {
      list = list.filter(s => s.universityId === targetUniId);
    }
    
    // Filter by semester
    const targetSemId = semId || this.state.selectedSemId;
    if (targetSemId) {
      list = list.filter(s => s.semesterId === targetSemId);
    }

    // Filter by syllabus version
    const targetVersion = version || this.state.selectedSyllabusVersion || "new";
    list = list.filter(s => s.syllabusVersion === targetVersion);

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
