"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  Bot, 
  CheckCircle2, 
  BookMarked, 
  Sparkles, 
  HelpCircle,
  Award,
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
  Gavel,
  BookOpenCheck,
  RotateCcw,
  Zap,
  Check,
  XCircle,
  Book,
  Video,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MockDB } from '@/data/db';

export default function SubjectDetailPage({ params }) {
  const subjectId = params.id;
  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [activeUnitId, setActiveUnitId] = useState(null); // unit accordion state
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // notes, acts, cases, questions, practice, quiz, revision, resources, mock_tests, ai_tutor
  const [notesType, setNotesType] = useState('simple'); // simple, detailed
  const [mounted, setMounted] = useState(false);

  // Dynamic content loaded from MockDB
  const [notes, setNotes] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [cases, setCases] = useState([]);
  const [acts, setActs] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [mockTests, setMockTests] = useState([]);

  // Interactive MCQs state handlers
  const [activeMcqIdx, setActiveMcqIdx] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [isMcqAnswered, setIsMcqAnswered] = useState(false);
  const [mcqDifficulty, setMcqDifficulty] = useState('All');
  
  // Flashcard state
  const [fcIdx, setFcIdx] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  // Timed Quiz state
  const [quizState, setQuizState] = useState('idle'); // idle, running, ended
  const [quizTimer, setQuizTimer] = useState(60);
  const [quizScore, setQuizScore] = useState(0);
  const [quizMcqIdx, setQuizMcqIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);

  // AI Tutor / Chat states
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI draft state simulation
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    const subj = MockDB.getSubjectById(subjectId);
    setSubject(subj);

    if (subj) {
      const uniList = MockDB.getUnits(subj.id);
      setUnits(uniList);
      
      // Load mock tests for this subject
      const allTests = MockDB.getMockTests();
      const filteredTests = allTests.filter(t => t.subjectId === subj.id);
      setMockTests(filteredTests);

      if (uniList.length > 0) {
        // Expand the first unit by default
        setActiveUnitId(uniList[0].id);
        const topList = MockDB.getTopics(uniList[0].id);
        if (topList.length > 0) {
          handleTopicSelect(topList[0]);
        }
      }
    }
  }, [subjectId]);

  // Handle timer countdown
  useEffect(() => {
    if (quizState !== 'running' || quizTimer <= 0) return;
    const interval = setInterval(() => {
      setQuizTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizState, quizTimer]);

  useEffect(() => {
    if (quizTimer === 0 && quizState === 'running') {
      setQuizState('ended');
    }
  }, [quizTimer, quizState]);

  const handleTopicSelect = (topic) => {
    setActiveTopic(topic);
    setNotes(MockDB.getNotes(topic.id));
    setMcqs(MockDB.getMCQs(topic.id));
    setCases(MockDB.getCaseLaws(topic.id));
    setActs(MockDB.getBareActs(topic.id));
    setFlashcards(MockDB.getFlashcards(topic.id));

    // Reset components state
    setActiveMcqIdx(0);
    setSelectedMcqOption(null);
    setIsMcqAnswered(false);
    setFcIdx(0);
    setFcFlipped(false);
    setQuizState('idle');
    setQuizTimer(60);
    setQuizScore(0);
    setQuizMcqIdx(0);
    setSelectedQuizOption(null);

    // Seed initial welcome message in AI tutor
    setChatHistory([
      { sender: 'ai', text: `Hi! I am **NyayaAI Tutor**. Ask me anything about **${topic.title}**! For example, "Explain key sections" or "Provide landmarks".` }
    ]);
  };

  // Accordion Toggle
  const toggleUnitAccordion = (unitId) => {
    if (activeUnitId === unitId) {
      setActiveUnitId(null);
    } else {
      setActiveUnitId(unitId);
    }
  };

  // Simulated AI Generator
  const triggerAiDraftNotes = () => {
    if (!activeTopic) return;
    setIsAiDrafting(true);
    setTimeout(() => {
      const generatedNote = {
        id: `note-gen-${activeTopic.id}`,
        topicId: activeTopic.id,
        simpleNotes: `[NyayaAI Drafted Summary] ${activeTopic.title} is a key legal concept. Under Indian jurisprudence, this encompasses statutory rights and constitutional guarantees.`,
        detailedNotes: `[NyayaAI Detailed Analysis] Detailed study of ${activeTopic.title}.\n1. Codification: Analyzed according to standard LLB curriculum.\n2. Key Doctrines: Focuses on regulatory intent and judicial precedents.\n3. Precedents: Supreme Court guidelines establish procedural balance.`,
        examples: [`Example: Application of ${activeTopic.title} in daily legal contracts or court trials.`],
        flowcharts: [`Concept ➔ Statutory Definition ➔ Judical Test ➔ Decision`],
        importantPoints: ["Drafted by NyayaAI engine.", "Verified according to GU/SU/VNSGU curriculum."],
        examTips: ["Ensure to cite the statutory provisions.", "Draw a clear flowchart representing the test rules."],
        faqs: [{ q: "What is the primary rule?", a: "To establish a clear nexus between act and intent." }]
      };
      
      MockDB.addNote(generatedNote);
      setNotes(generatedNote);
      setIsAiDrafting(false);
    }, 1200);
  };

  const handlePracticeSubmit = () => {
    if (selectedMcqOption === null) return;
    setIsMcqAnswered(true);
    const filteredMcqs = getFilteredMcqs();
    const activeQ = filteredMcqs[activeMcqIdx];
    if (selectedMcqOption === activeQ.correctIndex) {
      const currentProfile = MockDB.getProfile();
      MockDB.updateProfile({ xp: currentProfile.xp + 15, coins: currentProfile.coins + 5 });
    }
  };

  const handlePracticeNext = () => {
    const filteredMcqs = getFilteredMcqs();
    if (activeMcqIdx + 1 < filteredMcqs.length) {
      setActiveMcqIdx(prev => prev + 1);
      setSelectedMcqOption(null);
      setIsMcqAnswered(false);
    }
  };

  const handleQuizOptionSelect = (idx) => {
    if (selectedQuizOption !== null) return;
    setSelectedQuizOption(idx);
    const activeQ = mcqs[quizMcqIdx];
    if (idx === activeQ.correctIndex) {
      setQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (quizMcqIdx + 1 < mcqs.length) {
        setQuizMcqIdx(prev => prev + 1);
        setSelectedQuizOption(null);
      } else {
        setQuizState('ended');
        const currentProfile = MockDB.getProfile();
        MockDB.updateProfile({ xp: currentProfile.xp + 50, coins: currentProfile.coins + 20 });
      }
    }, 1250);
  };

  const handleSendChatMessage = () => {
    if (!chatMessage.trim()) return;
    const userMsg = { sender: 'user', text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsAiLoading(true);

    setTimeout(() => {
      const aiResponse = { 
        sender: 'ai', 
        text: `Here is the explanation for your query on **${activeTopic?.title || 'this topic'}**:
        
1. **Statutory Provisions**: This area is governed by the core chapters of the act. Compliance is mandatory for enforcement.
2. **Key Landmarks**: Under Indian jurisprudence, judicial discretion is applied to maintain checks and balances.
3. **Drafted Answer Outline**:
   - Write definitions first.
   - Outline key ingredients.
   - Cite the landmark precedents.`
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsAiLoading(false);
    }, 1000);
  };

  const getFilteredMcqs = () => {
    if (mcqDifficulty === 'All') return mcqs;
    return mcqs.filter(m => m.difficulty === mcqDifficulty.toLowerCase());
  };

  if (!mounted || !subject) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading syllabus explorer...
      </div>
    );
  }

  const filteredMcqs = getFilteredMcqs();
  const uniNames = { gu: "Gujarat University", su: "Saurashtra University", vnsgu: "VNSGU" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link href="/subjects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Curriculum Explorer
      </Link>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                {subject.shortCode}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-350 text-xs font-medium">
                {subject.category}
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                subject.syllabusVersion === 'new' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {subject.syllabusVersion === 'new' ? 'New Syllabus' : 'Old Syllabus'}
              </span>
              {subject.credits && (
                <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  {subject.credits} Credits
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-serif-title text-white leading-tight">{subject.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
              <span>{uniNames[subject.universityId] || subject.universityId.toUpperCase()}</span>
              <span>•</span>
              <span>{subject.semesterId === 'sem1' ? 'Semester 1' : subject.semesterId === 'sem2' ? 'Semester 2' : subject.semesterId === 'sem3' ? 'Semester 3' : subject.semesterId === 'sem4' ? 'Semester 4' : subject.semesterId === 'sem5' ? 'Semester 5' : 'Semester 6'}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Verified Official Syllabus (2026-27)
              </span>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('ai_tutor')}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shrink-0 btn-mobile-touch self-start md:self-auto"
          >
            <Bot className="w-4 h-4 text-slate-950 animate-bounce" />
            Launch AI Tutor Consultation
          </button>
        </div>
      </div>

      {/* SYLLABUS HIERARCHY MAP & WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Interactive Collapsible Accordion Syllabus Tree */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Syllabus Outline</span>
            <p className="text-[10.5px] text-slate-450 leading-relaxed">Click a unit to expand topics, then select a topic to study.</p>
          </div>

          <div className="space-y-3">
            {units.map((unit) => {
              const isExpanded = activeUnitId === unit.id;
              const unitTopics = MockDB.getTopics(unit.id);
              
              return (
                <div key={unit.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all">
                  
                  {/* Unit Accordion Header */}
                  <button
                    onClick={() => toggleUnitAccordion(unit.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900 transition-colors"
                  >
                    <div className="space-y-0.5 pr-2">
                      <span className="text-[9px] uppercase font-mono font-bold text-amber-500">Unit {unit.unitNumber}</span>
                      <h4 className="text-xs font-bold text-white leading-tight">{unit.title}</h4>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {/* Accordion Body */}
                  {isExpanded && (
                    <div className="border-t border-slate-850 p-2.5 bg-slate-950/40 space-y-1 animate-fade-in">
                      {unitTopics.map((topic) => {
                        const isSelected = activeTopic?.id === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicSelect(topic)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-[11.5px] font-medium transition-all flex items-center justify-between group ${
                              isSelected
                                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                            }`}
                          >
                            <span className="truncate pr-1.5">{topic.title}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        );
                      })}
                      {unitTopics.length === 0 && (
                        <p className="text-[10px] text-slate-550 italic p-2">No topics pre-seeded.</p>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tabbed Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Topic Banner & Navigation */}
          {activeTopic ? (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400 font-mono">Current Active Study Topic</span>
                  <h3 className="text-base font-bold text-white font-serif-title mt-0.5">{activeTopic.title}</h3>
                </div>
                
                {/* Sub-topics Badges */}
                {activeTopic.subTopics && (
                  <div className="flex flex-wrap gap-1">
                    {activeTopic.subTopics.map((st, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-medium">
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Workspace Navigation Tabs (Requirement 5 & 6) */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2 border-t border-slate-800/80 pt-3">
                {[
                  { id: 'notes', label: 'Study Notes', icon: BookOpenCheck },
                  { id: 'acts', label: 'Bare Acts & Sections', icon: FileText },
                  { id: 'cases', label: 'Landmark Cases', icon: Gavel },
                  { id: 'questions', label: 'Important Qs & PYQs', icon: HelpCircle },
                  { id: 'practice', label: 'Practice MCQs', icon: Award },
                  { id: 'quiz', label: 'Timed Quiz', icon: Clock },
                  { id: 'revision', label: 'Flashcards', icon: RotateCcw },
                  { id: 'resources', label: 'Books & Videos', icon: Book },
                  { id: 'mock_tests', label: 'Mock Tests', icon: Layers },
                  { id: 'ai_tutor', label: 'NyayaAI Tutor', icon: Bot }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center gap-1.5 shrink-0 ${
                        activeTab === t.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-slate-800 bg-slate-900/30 rounded-3xl">
              <Layers className="w-8 h-8 text-slate-650 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400 font-mono mt-2">Select a topic from the syllabus outline to begin study modules.</p>
            </div>
          )}

          {/* Tabbed Workspace Screens */}
          {activeTopic && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-8 min-h-[400px] shadow-2xl relative">
              
              {/* 1. STUDY NOTES WORKSPACE */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {notes ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
                        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850">
                          <button
                            onClick={() => setNotesType('simple')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              notesType === 'simple' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-450 hover:text-white'
                            }`}
                          >
                            Simple summary
                          </button>
                          <button
                            onClick={() => setNotesType('detailed')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              notesType === 'detailed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-450 hover:text-white'
                            }`}
                          >
                            Detailed Notes
                          </button>
                        </div>

                        <button 
                          onClick={() => {
                            const currentProfile = MockDB.getProfile();
                            const isBookmarked = currentProfile.bookmarks.includes(notes.id);
                            const updated = isBookmarked 
                              ? currentProfile.bookmarks.filter(id => id !== notes.id)
                              : [...currentProfile.bookmarks, notes.id];
                            MockDB.updateProfile({ bookmarks: updated });
                            handleTopicSelect(activeTopic);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all btn-mobile-touch flex items-center gap-1.5 ${
                            MockDB.getProfile().bookmarks.includes(notes.id)
                              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>{MockDB.getProfile().bookmarks.includes(notes.id) ? 'Bookmarked' : 'Save Note'}</span>
                        </button>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4">
                        {notesType === 'simple' ? (
                          <p className="whitespace-pre-line">{notes.simpleNotes}</p>
                        ) : (
                          <p className="whitespace-pre-line">{notes.detailedNotes}</p>
                        )}

                        {/* Examples */}
                        {notes.examples && notes.examples.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850/80 space-y-2 mt-4">
                            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Sparkles className="w-4 h-4" /> Illustrative Case Example
                            </h4>
                            <ul className="list-disc list-inside pl-1 text-[11px] sm:text-xs text-slate-350 space-y-1">
                              {notes.examples.map((ex, i) => (
                                <li key={i}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Flowcharts */}
                        {notes.flowcharts && notes.flowcharts.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-2">
                            <h4 className="text-xs font-bold text-amber-400">Concept Flowchart</h4>
                            <div className="font-mono text-[10px] bg-slate-900 p-3 rounded-lg border border-slate-800 text-amber-300">
                              {notes.flowcharts[0]}
                            </div>
                          </div>
                        )}

                        {/* Exam Tips */}
                        {notes.examTips && notes.examTips.length > 0 && (
                          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                            <h4 className="text-xs font-bold text-amber-400">💡 Exam Strategy Tip</h4>
                            <p className="text-[11px] sm:text-xs text-slate-300 leading-normal">{notes.examTips[0]}</p>
                          </div>
                        )}

                        {/* FAQs */}
                        {notes.faqs && notes.faqs.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-slate-800 mt-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Frequently Asked Questions</h4>
                            {notes.faqs.map((faq, i) => (
                              <div key={i} className="space-y-1 text-xs">
                                <p className="font-bold text-white">Q: {faq.q}</p>
                                <p className="text-slate-350 pl-2 border-l border-slate-800">A: {faq.a}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-6">
                      <HelpCircle className="w-12 h-12 text-slate-650 mx-auto animate-pulse" />
                      <div className="space-y-2 max-w-sm mx-auto">
                        <h3 className="text-sm font-bold text-white">No Static Notes Configured</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Revision notes are not pre-published for this topic. Generate notes immediately using NyayaAI.
                        </p>
                      </div>
                      <button
                        onClick={triggerAiDraftNotes}
                        disabled={isAiDrafting}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow disabled:opacity-50 inline-flex items-center gap-2 btn-mobile-touch"
                      >
                        {isAiDrafting ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating Notes...</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5" />
                            <span>Draft Notes with NyayaAI</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. BARE ACTS & SECTIONS WORKSPACE */}
              {activeTab === 'acts' && (
                <div className="space-y-6">
                  {acts.length > 0 ? acts.map((b) => (
                    <div key={b.id} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-white font-serif-title">{b.sectionNumber}: {b.title}</h3>
                          <p className="text-[10px] text-slate-450 font-mono mt-0.5">{b.actName}</p>
                        </div>
                      </div>

                      <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl text-xs sm:text-sm text-slate-250 leading-relaxed font-serif">
                        <p className="whitespace-pre-line">{b.content}</p>
                      </div>

                      {b.relatedSections && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Related Sections & Reference Links</span>
                          <div className="flex flex-wrap gap-1.5">
                            {b.relatedSections.map(s => (
                              <span key={s} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-850 text-slate-350 text-[10px] font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-450 italic text-xs">
                      No statutory Bare Act sections pre-mapped to this topic.
                    </div>
                  )}
                </div>
              )}

              {/* 3. LANDMARK CASES WORKSPACE */}
              {activeTab === 'cases' && (
                <div className="space-y-6">
                  {cases.length > 0 ? cases.map((c) => (
                    <div key={c.id} className="space-y-5">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3 flex-wrap">
                        <div>
                          <h3 className="text-lg font-bold text-white font-serif-title">{c.title}</h3>
                          <p className="text-xs text-amber-400 font-mono mt-0.5">{c.citation} • {c.bench}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold shadow-sm">
                          Landmark Judgment
                        </span>
                      </div>

                      <div className="space-y-4 text-xs text-slate-200">
                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5">
                          <p className="font-bold text-emerald-400 font-serif-title flex items-center gap-1.5">
                            <Gavel className="w-4 h-4 text-emerald-400" /> Key Legal Ratio Decidendi:
                          </p>
                          <p className="font-semibold text-slate-150 leading-relaxed">{c.keyPrinciple}</p>
                        </div>

                        <p className="leading-relaxed"><strong className="text-slate-450 block mb-0.5">Facts of the Case:</strong>{c.facts}</p>
                        <p className="leading-relaxed"><strong className="text-slate-450 block mb-0.5">Substantive Legal Issues:</strong>{c.issues}</p>
                        
                        <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                          <strong className="text-slate-450 block text-[11px] mb-0.5">Arguments Addressed:</strong>
                          {c.arguments.map((arg, idx) => (
                            <p key={idx} className="italic text-slate-350 leading-relaxed">• {arg}</p>
                          ))}
                        </div>

                        <p className="leading-relaxed"><strong className="text-slate-450 block mb-0.5">Judgment & Directions:</strong>{c.judgment}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-450 italic text-xs">
                      No landmark case judgments pre-mapped to this topic.
                    </div>
                  )}
                </div>
              )}

              {/* 4. IMPORTANT QUESTIONS & PYQS WORKSPACE */}
              {activeTab === 'questions' && (
                <div className="space-y-6">
                  {/* Important Questions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Exam Important Questions</h3>
                    {activeTopic.importantQuestions && activeTopic.importantQuestions.length > 0 ? (
                      <ul className="space-y-2.5">
                        {activeTopic.importantQuestions.map((q, idx) => (
                          <li key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-amber-500 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-200 leading-relaxed">{q}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No questions configured.</p>
                    )}
                  </div>

                  {/* Previous Year Questions */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Previous Year Exam Questions (PYQs)</h3>
                    {activeTopic.pyqs && activeTopic.pyqs.length > 0 ? (
                      <ul className="space-y-2.5">
                        {activeTopic.pyqs.map((q, idx) => (
                          <li key={idx} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-4">
                            <span className="text-xs sm:text-sm text-slate-200 font-medium">{q}</span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase tracking-wider font-mono shrink-0">
                              PYQ Link
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No PYQs pre-mapped for this topic.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 5. PRACTICE MCQS WORKSPACE */}
              {activeTab === 'practice' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                      {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => {
                            setMcqDifficulty(diff);
                            setActiveMcqIdx(0);
                            setSelectedMcqOption(null);
                            setIsMcqAnswered(false);
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            mcqDifficulty === diff ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-450 hover:text-white'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-500">Available Practice: {filteredMcqs.length}</span>
                  </div>

                  {filteredMcqs.length > 0 ? (
                    <div className="space-y-5">
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all"
                          style={{ width: `${((activeMcqIdx + 1) / filteredMcqs.length) * 100}%` }}
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                          Question {activeMcqIdx + 1} of {filteredMcqs.length} ({filteredMcqs[activeMcqIdx].difficulty})
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                          {filteredMcqs[activeMcqIdx].question}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {filteredMcqs[activeMcqIdx].options.map((opt, i) => {
                          let optStyle = "bg-slate-950 border-slate-850 text-slate-300 hover:border-amber-500/50";
                          if (selectedMcqOption === i) {
                            optStyle = "bg-amber-500/10 border-amber-500 text-amber-300 font-bold";
                          }
                          if (isMcqAnswered) {
                            if (i === filteredMcqs[activeMcqIdx].correctIndex) {
                              optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (selectedMcqOption === i) {
                              optStyle = "bg-red-500/20 border-red-500 text-red-300";
                            }
                          }

                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (isMcqAnswered) return;
                                setSelectedMcqOption(i);
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 btn-mobile-touch ${optStyle}`}
                            >
                              <span className="w-5.5 h-5.5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-[10px] font-bold text-slate-400 shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isMcqAnswered && (
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1 animate-fade-in">
                          <p className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">Statutory Explanation</p>
                          <p className="text-xs text-slate-300 leading-normal">{filteredMcqs[activeMcqIdx].explanation}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-800 flex justify-end">
                        {!isMcqAnswered ? (
                          <button
                            onClick={handlePracticeSubmit}
                            disabled={selectedMcqOption === null}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow btn-mobile-touch"
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <button
                            onClick={handlePracticeNext}
                            disabled={activeMcqIdx + 1 === filteredMcqs.length}
                            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow btn-mobile-touch flex items-center gap-1.5"
                          >
                            <span>Next Question</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-450 italic text-xs">
                      No practice MCQs found matching this difficulty filter.
                    </div>
                  )}
                </div>
              )}

              {/* 6. TIMED MINI QUIZ WORKSPACE */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {mcqs.length > 0 ? (
                    <div>
                      {quizState === 'idle' && (
                        <div className="text-center py-10 space-y-5 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-amber-400 mx-auto">
                            <Clock className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-white font-serif-title">Topic Timed Test Challenge</h3>
                            <p className="text-xs text-slate-450 leading-relaxed">
                              Evaluate your topic comprehension under test limits. 60 seconds duration. +50 XP bonus coins.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setQuizState('running');
                              setQuizTimer(60);
                              setQuizScore(0);
                              setQuizMcqIdx(0);
                              setSelectedQuizOption(null);
                            }}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow btn-mobile-touch"
                          >
                            Launch Timed Test (60s)
                          </button>
                        </div>
                      )}

                      {quizState === 'running' && (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                            <span className="text-xs font-mono text-slate-400">Question {quizMcqIdx + 1} of {mcqs.length}</span>
                            <span className="px-3 py-1 bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold font-mono text-amber-400">
                              Time Left: {quizTimer}s
                            </span>
                          </div>

                          <div className="space-y-4">
                            <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                              {mcqs[quizMcqIdx].question}
                            </h3>

                            <div className="space-y-2">
                              {mcqs[quizMcqIdx].options.map((opt, i) => {
                                let optStyle = "bg-slate-950 border-slate-850 text-slate-355 hover:border-amber-500/50";
                                if (selectedQuizOption === i) {
                                  if (i === mcqs[quizMcqIdx].correctIndex) {
                                    optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                                  } else {
                                    optStyle = "bg-red-500/20 border-red-500 text-red-300";
                                  }
                                }

                                return (
                                  <button
                                    key={i}
                                    onClick={() => handleQuizOptionSelect(i)}
                                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 btn-mobile-touch ${optStyle}`}
                                  >
                                    <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-[9px] text-slate-400 shrink-0 font-bold">
                                      {String.fromCharCode(65 + i)}
                                    </span>
                                    <span className="leading-snug">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {quizState === 'ended' && (
                        <div className="text-center py-10 space-y-5 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                            <Award className="w-6 h-6" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-white font-serif-title">Evaluation Complete!</h3>
                            <p className="text-xs text-slate-400">Topic Timed Test results:</p>
                          </div>
                          <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl">
                            <p className="text-2xl font-black text-emerald-400 font-mono">{quizScore} / {mcqs.length}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">Accuracy: {Math.round((quizScore / mcqs.length) * 100)}%</p>
                            <p className="text-[11px] text-amber-400 font-bold mt-2 flex items-center justify-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> +50 XP and +20 Coins earned!
                            </p>
                          </div>
                          <button
                            onClick={() => setQuizState('idle')}
                            className="w-full py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-white border border-slate-800 text-xs font-bold btn-mobile-touch"
                          >
                            Retry Practice
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-450 italic text-xs">
                      No timed MCQs configured for this topic.
                    </div>
                  )}
                </div>
              )}

              {/* 7. FLASHCARDS WORKSPACE */}
              {activeTab === 'revision' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-mono text-slate-500 font-bold">Concept Flashcards: {flashcards.length}</span>
                  </div>

                  {flashcards.length > 0 ? (
                    <div className="space-y-6 max-w-md mx-auto">
                      <div 
                        onClick={() => setFcFlipped(!fcFlipped)}
                        className={`h-48 rounded-2xl border-2 flex items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 select-none shadow-lg ${
                          fcFlipped 
                            ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/5 scale-102' 
                            : 'bg-slate-950 border-slate-850 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono">
                            {fcFlipped ? "Answer Explanation" : "Flashcard Question"}
                          </span>
                          <p className="text-sm sm:text-base font-bold leading-relaxed">
                            {fcFlipped ? flashcards[fcIdx].back : flashcards[fcIdx].front}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          onClick={() => {
                            if (fcIdx > 0) {
                              setFcIdx(prev => prev - 1);
                              setFcFlipped(false);
                            }
                          }}
                          disabled={fcIdx === 0}
                          className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-350 btn-mobile-touch"
                        >
                          Previous
                        </button>
                        <span className="text-xs font-mono text-slate-550">Card {fcIdx + 1} of {flashcards.length}</span>
                        <button
                          onClick={() => {
                            if (fcIdx + 1 < flashcards.length) {
                              setFcIdx(prev => prev + 1);
                              setFcFlipped(false);
                            }
                          }}
                          disabled={fcIdx + 1 === flashcards.length}
                          className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-355 btn-mobile-touch"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-450 italic text-xs">
                      No revision flashcards configured for this topic.
                    </div>
                  )}

                  {/* Mind Maps (Section Requirement) */}
                  {activeTopic.mindMaps && activeTopic.mindMaps.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Curriculum Mind Map Summary</h4>
                      <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl text-xs text-slate-300 font-mono">
                        {activeTopic.mindMaps[0]}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 8. BOOKS & VIDEOS WORKSPACE */}
              {activeTab === 'resources' && (
                <div className="space-y-6">
                  {/* Book References */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 font-mono">Recommended Reference Books</h3>
                    {activeTopic.books && activeTopic.books.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeTopic.books.map((book, idx) => (
                          <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl flex items-center gap-3">
                            <Book className="w-5 h-5 text-amber-500 shrink-0" />
                            <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">{book}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No book references configured.</p>
                    )}
                  </div>

                  {/* Video Resources (Future Ready) */}
                  <div className="space-y-3 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 font-mono">Video Lecture Resources</h3>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-[9px] uppercase tracking-wider text-emerald-400 font-mono font-bold">
                        Future Ready
                      </span>
                    </div>

                    {activeTopic.videos && activeTopic.videos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeTopic.videos.map((vid, idx) => (
                          <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <Video className="w-5 h-5 text-amber-500 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8.5px] font-mono text-slate-450">
                                YouTube Reference
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white leading-snug">{vid.title}</h4>
                            <a 
                              href={vid.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] text-amber-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              Open External Video Link →
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No video resources listed.</p>
                    )}
                  </div>
                </div>
              )}

              {/* 9. MOCK TESTS WORKSPACE */}
              {activeTab === 'mock_tests' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white font-serif-title">Subject Mock Exams</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Attempt a full curriculum mock test matching Gujarat University or Saurashtra University standards.</p>
                  </div>

                  {mockTests.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {mockTests.map((t) => (
                        <div key={t.id} className="p-5 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-4 shadow-md">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-white leading-snug">{t.title}</h4>
                            <div className="flex items-center gap-3 text-[10px] text-slate-450 font-mono">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.timeLimit} Mins</span>
                              <span>• {t.totalQuestions} Questions</span>
                            </div>
                          </div>
                          
                          <Link 
                            href={`/mock-test?testId=${t.id}`}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                          >
                            <span>Start Mock Exam</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/60">
                      <Layers className="w-7 h-7 text-slate-650 mx-auto" />
                      <p className="text-xs text-slate-400 font-mono mt-2">No custom mock tests generated. Start practice in timed quiz or MCQs.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 10. AI TUTOR (FUTURE READY) */}
              {activeTab === 'ai_tutor' && (
                <div className="space-y-5 flex flex-col h-[480px]">
                  
                  {/* AI header */}
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Interactive AI Tutor Assistant</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/20 text-[9px] uppercase tracking-wider text-emerald-400 font-mono font-bold">
                      Future Ready AI
                    </span>
                  </div>

                  {/* Chat message display */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                    {chatHistory.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                          msg.sender === 'user' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-950 border border-slate-800 text-emerald-400'
                        }`}>
                          {msg.sender === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={`p-3 rounded-2xl text-xs sm:text-xs leading-relaxed whitespace-pre-line border ${
                          msg.sender === 'user'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : 'bg-slate-950/80 border-slate-850 text-slate-200'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 animate-pulse shrink-0">
                          AI
                        </div>
                        <div className="p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl text-[10px] font-mono text-slate-450 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Tutor is drafting detailed response...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat input box */}
                  <div className="pt-3 border-t border-slate-850 flex gap-2">
                    <input 
                      type="text"
                      placeholder={`Ask NyayaAI tutor regarding ${activeTopic.title}...`}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      className="flex-1 bg-slate-950 text-xs text-white px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button 
                      onClick={handleSendChatMessage}
                      className="px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center shadow"
                    >
                      Ask Tutor
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
