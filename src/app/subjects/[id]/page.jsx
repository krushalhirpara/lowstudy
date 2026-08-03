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
  FileText,
  Gavel,
  BookOpenCheck,
  RotateCcw,
  Zap,
  Check,
  XCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { MockDB } from '@/data/db';

export default function SubjectDetailPage({ params }) {
  const subjectId = params.id;
  const [subject, setSubject] = useState(null);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [activeUnit, setActiveUnit] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // notes, practice, cases, acts, revision, quiz
  const [notesType, setNotesType] = useState('simple'); // simple, detailed
  const [mounted, setMounted] = useState(false);

  // Dynamic content loaded from MockDB
  const [notes, setNotes] = useState(null);
  const [mcqs, setMcqs] = useState([]);
  const [cases, setCases] = useState([]);
  const [acts, setActs] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  // Interactive state handlers
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
      if (uniList.length > 0) {
        setActiveUnit(uniList[0]);
        const topList = MockDB.getTopics(uniList[0].id);
        setTopics(topList);
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
  };

  const handleUnitSelect = (unit) => {
    setActiveUnit(unit);
    const topList = MockDB.getTopics(unit.id);
    setTopics(topList);
    if (topList.length > 0) {
      handleTopicSelect(topList[0]);
    } else {
      setActiveTopic(null);
      setNotes(null);
      setMcqs([]);
      setCases([]);
      setActs([]);
      setFlashcards([]);
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
      
      // Update local storage db
      MockDB.addNote(generatedNote);
      setNotes(generatedNote);
      setIsAiDrafting(false);
    }, 1500);
  };

  const handlePracticeSubmit = () => {
    if (selectedMcqOption === null) return;
    setIsMcqAnswered(true);
    const filteredMcqs = getFilteredMcqs();
    const activeQ = filteredMcqs[activeMcqIdx];
    if (selectedMcqOption === activeQ.correctIndex) {
      // Award XP
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
        // Award Timed bonus coins
        const currentProfile = MockDB.getProfile();
        MockDB.updateProfile({ xp: currentProfile.xp + 50, coins: currentProfile.coins + 20 });
      }
    }, 1200);
  };

  const getFilteredMcqs = () => {
    if (mcqDifficulty === 'All') return mcqs;
    return mcqs.filter(m => m.difficulty === mcqDifficulty.toLowerCase());
  };

  if (!mounted || !subject) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading syllabus center...
      </div>
    );
  }

  const filteredMcqs = getFilteredMcqs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link href="/subjects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Curriculum Directory
      </Link>

      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                {subject.shortCode}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                {subject.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white leading-tight">{subject.title}</h1>
            <p className="text-xs sm:text-sm text-slate-350 max-w-3xl leading-relaxed">{subject.description}</p>
          </div>

          <Link 
            href={`/ai-tutor?prompt=${encodeURIComponent(`Explain all units of ${subject.title}`)}`}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shrink-0 btn-mobile-touch self-start md:self-auto"
          >
            <Bot className="w-4 h-4 text-slate-950" />
            NyayaAI Tutor Consultation
          </Link>
        </div>
      </div>

      {/* SYLLABUS HIERARCHY MAP & WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Grid: Units & Topics Index */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Unit selection selector */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Syllabus Division</span>
            <select
              value={activeUnit?.id || ''}
              onChange={(e) => {
                const uni = units.find(u => u.id === e.target.value);
                if (uni) handleUnitSelect(uni);
              }}
              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-xs font-bold p-3.5 rounded-xl focus:outline-none"
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>Unit {u.unitNumber}: {u.title}</option>
              ))}
            </select>
          </div>

          {/* Topics items list */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Topics in Unit {activeUnit?.unitNumber}</span>
            <div className="space-y-1.5 flex flex-col">
              {topics.map((t) => {
                const isActive = activeTopic?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTopicSelect(t)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between btn-mobile-touch ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow' 
                        : 'bg-slate-900 border-slate-850 text-slate-350 hover:bg-slate-850 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                  </button>
                );
              })}
              {topics.length === 0 && (
                <p className="text-xs text-slate-500 italic p-3">No topics listed under this unit.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Grid: Tabbed Workspace */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Topic Banner */}
          {activeTopic && (
            <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400 font-mono">Active Target Study Topic</span>
                <h3 className="text-base font-bold text-white font-serif-title mt-0.5">{activeTopic.title}</h3>
              </div>
              
              {/* Dynamic Tabs Headers */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1.5 sm:pb-0">
                {[
                  { id: 'notes', label: 'Study Notes', icon: BookOpenCheck },
                  { id: 'practice', label: 'MCQs Practice', icon: QuestionIcon },
                  { id: 'cases', label: 'Case Precedents', icon: Gavel },
                  { id: 'acts', label: 'Bare Acts', icon: FileText },
                  { id: 'revision', label: 'Flashcards', icon: RotateCcw },
                  { id: 'quiz', label: 'Timed Quiz', icon: Clock }
                ].map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center gap-1.5 shrink-0 ${
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
          )}

          {/* Tab Workspaces */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-7 min-h-[350px] shadow-2xl relative">
            
            {/* 1. STUDY NOTES WORKSPACE */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                {notes ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
                      {/* Simple vs Detailed Toggle */}
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

                    {/* Notes Content */}
                    <div className="prose prose-invert prose-slate max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4">
                      {notesType === 'simple' ? (
                        <p className="whitespace-pre-line">{notes.simpleNotes}</p>
                      ) : (
                        <p className="whitespace-pre-line">{notes.detailedNotes}</p>
                      )}

                      {/* Examples */}
                      {notes.examples && notes.examples.length > 0 && (
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-2">
                          <h4 className="text-xs font-bold text-emerald-400 font-serif-title flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> Illustrative Example
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
                          <h4 className="text-xs font-bold text-amber-400 font-serif-title">Structural Flow</h4>
                          <div className="font-mono text-[10px] bg-slate-900 p-3 rounded-lg border border-slate-800 text-amber-300">
                            {notes.flowcharts[0]}
                          </div>
                        </div>
                      )}

                      {/* Exam Tips */}
                      {notes.examTips && notes.examTips.length > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                          <h4 className="text-xs font-bold text-amber-400 font-serif-title">💡 Crack The Exam Tip</h4>
                          <p className="text-[11px] sm:text-xs text-slate-300 leading-normal">{notes.examTips[0]}</p>
                        </div>
                      )}

                      {/* FAQs */}
                      {notes.faqs && notes.faqs.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-slate-800">
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
                  /* Simulator for AI draft notes */
                  <div className="text-center py-10 space-y-6">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center mx-auto text-slate-500">
                      <HelpCircle className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-2 max-w-sm mx-auto">
                      <h3 className="text-sm font-bold text-white">Syllabus notes not published</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        There are no student revision notes pre-published for this topic yet. Generate them instantly using NyayaAI.
                      </p>
                    </div>
                    <button
                      onClick={triggerAiDraftNotes}
                      disabled={isAiDrafting}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 inline-flex items-center gap-2 btn-mobile-touch disabled:opacity-50"
                    >
                      {isAiDrafting ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating notes via NyayaAI...</span>
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

            {/* 2. MCQS PRACTICE WORKSPACE */}
            {activeTab === 'practice' && (
              <div className="space-y-6">
                {/* Practice configuration header */}
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
                  <span className="text-xs font-mono text-slate-500">Practice questions: {filteredMcqs.length}</span>
                </div>

                {filteredMcqs.length > 0 ? (
                  <div className="space-y-5">
                    {/* Progress indicator */}
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

                    {/* Options list */}
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

                    {/* Explanation */}
                    {isMcqAnswered && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-1 animate-fade-in">
                        <p className="text-[10px] uppercase font-bold text-amber-400 font-mono tracking-wider">Statutory Explanation</p>
                        <p className="text-xs text-slate-300 leading-normal">{filteredMcqs[activeMcqIdx].explanation}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-800 flex justify-end">
                      {!isMcqAnswered ? (
                        <button
                          onClick={handlePracticeSubmit}
                          disabled={selectedMcqOption === null}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 btn-mobile-touch"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          onClick={handlePracticeNext}
                          disabled={activeMcqIdx + 1 === filteredMcqs.length}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/10 btn-mobile-touch flex items-center gap-1.5"
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

            {/* 3. CASE LAW WORKSPACE */}
            {activeTab === 'cases' && (
              <div className="space-y-6">
                {cases.length > 0 ? cases.map((c) => (
                  <div key={c.id} className="space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
                      <div>
                        <h3 className="text-lg font-bold text-white font-serif-title">{c.title}</h3>
                        <p className="text-xs text-amber-400 font-mono mt-0.5">{c.citation} • {c.bench}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold">
                        Landmark Judgment
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-200">
                      <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                        <p className="font-bold text-emerald-400 font-serif-title flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" /> Key Legal Principle:
                        </p>
                        <p className="font-semibold text-slate-200 leading-normal">{c.keyPrinciple}</p>
                      </div>

                      <p className="leading-relaxed"><strong className="text-slate-450">Facts: </strong>{c.facts}</p>
                      <p className="leading-relaxed"><strong className="text-slate-450">Core Issues: </strong>{c.issues}</p>
                      
                      <div className="pl-3 border-l-2 border-slate-800 space-y-1">
                        <strong className="text-slate-450 block text-[11px]">Arguments Addressed:</strong>
                        {c.arguments.map((arg, idx) => (
                          <p key={idx} className="italic text-slate-350 leading-relaxed">• {arg}</p>
                        ))}
                      </div>

                      <p className="leading-relaxed"><strong className="text-slate-450">Ratio Decidendi: </strong>{c.ratio}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-slate-450 italic text-xs">
                    No landmark case laws pre-mapped to this topic. Use the Case Laws tab in Navbar to search wider directory.
                  </div>
                )}
              </div>
            )}

            {/* 4. BARE ACT MODULE */}
            {activeTab === 'acts' && (
              <div className="space-y-6">
                {acts.length > 0 ? acts.map((b) => (
                  <div key={b.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white font-serif-title">{b.sectionNumber}: {b.title}</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.actName}</p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <p className="whitespace-pre-line">{b.content}</p>
                    </div>

                    {b.relatedSections && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Related Sections</span>
                        <div className="flex flex-wrap gap-1.5">
                          {b.relatedSections.map(s => (
                            <span key={s} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono">
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

            {/* 5. REVISION FLASHCARDS & MIND MAPS */}
            {activeTab === 'revision' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-slate-500">Flashcards loaded: {flashcards.length}</span>
                </div>

                {flashcards.length > 0 ? (
                  <div className="space-y-6 max-w-md mx-auto">
                    {/* Interactive flip card wrapper */}
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
                          {fcFlipped ? "Back / Explanation" : "Front / Question"}
                        </span>
                        <p className="text-sm sm:text-base font-bold leading-relaxed">
                          {fcFlipped ? flashcards[fcIdx].back : flashcards[fcIdx].front}
                        </p>
                      </div>
                    </div>

                    {/* Navigation controllers */}
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => {
                          if (fcIdx > 0) {
                            setFcIdx(prev => prev - 1);
                            setFcFlipped(false);
                          }
                        }}
                        disabled={fcIdx === 0}
                        className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-300 btn-mobile-touch"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-mono text-slate-500">Card {fcIdx + 1} of {flashcards.length}</span>
                      <button
                        onClick={() => {
                          if (fcIdx + 1 < flashcards.length) {
                            setFcIdx(prev => prev + 1);
                            setFcFlipped(false);
                          }
                        }}
                        disabled={fcIdx + 1 === flashcards.length}
                        className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 disabled:opacity-40 rounded-xl text-xs font-bold text-slate-300 btn-mobile-touch"
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
                          <h3 className="text-base font-bold text-white font-serif-title">Topic Practice timed test</h3>
                          <p className="text-xs text-slate-450 leading-relaxed">
                            Evaluate your topic clarity under time constraints. 60 seconds duration. +50 XP timed bonus coins.
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
                          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/25 btn-mobile-touch"
                        >
                          Launch Timed Test (60s)
                        </button>
                      </div>
                    )}

                    {quizState === 'running' && (
                      <div className="space-y-5">
                        {/* Quiz stats header */}
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                          <span className="text-xs font-mono text-slate-400">Question {quizMcqIdx + 1} of {mcqs.length}</span>
                          <span className="px-3 py-1 bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold font-mono text-amber-400">
                            Time Left: {quizTimer}s
                          </span>
                        </div>

                        {/* Question */}
                        <div className="space-y-4">
                          <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                            {mcqs[quizMcqIdx].question}
                          </h3>

                          {/* Options */}
                          <div className="space-y-2">
                            {mcqs[quizMcqIdx].options.map((opt, i) => {
                              let optStyle = "bg-slate-950 border-slate-850 text-slate-350 hover:border-amber-500/50";
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
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
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
                            <Sparkles className="w-3.5 h-3.5 animate-spin" /> +50 XP and +20 Coins earned!
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
                    No evaluation MCQs configured for this topic.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
