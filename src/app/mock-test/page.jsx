"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  BookmarkPlus,
  BookOpen,
  Layers,
  AlertTriangle,
  Flame,
  Check,
  X,
  RefreshCw,
  GraduationCap,
  Timer,
  Shuffle,
  BarChart3,
  Sliders,
  ExternalLink,
  FileText,
  Building2,
  Target
} from 'lucide-react';

const TEST_TYPES_UI = [
  {
    id: 'UNIT_TEST',
    title: 'Unit Test',
    shortTitle: 'Unit',
    icon: Layers,
    badge: 'Unit Level',
    desc: 'Targeted drill on a specific syllabus unit across its core topics',
    defaultQuestions: 15,
    defaultTime: 20
  },
  {
    id: 'SUBJECT_TEST',
    title: 'Subject Test',
    shortTitle: 'Subject',
    icon: GraduationCap,
    badge: 'Subject Mock',
    desc: 'Comprehensive subject exam balancing all statutory units and legal sections',
    defaultQuestions: 30,
    defaultTime: 40
  },
  {
    id: 'FULL_SEMESTER_TEST',
    title: 'Full Semester Grand Exam',
    shortTitle: 'Grand Mock',
    icon: Building2,
    badge: 'Multi-Subject',
    desc: 'Official semester-wide simulator spanning all core LL.B. semester subjects',
    defaultQuestions: 60,
    defaultTime: 90
  },
  {
    id: 'PREVIOUS_PAPER_PRACTICE',
    title: 'Previous Paper Practice',
    shortTitle: 'Past Paper',
    icon: FileText,
    badge: 'University PYQ',
    desc: 'Practice test structured around official university past exam sessions',
    defaultQuestions: 25,
    defaultTime: 35
  },
  {
    id: 'CUSTOM_TEST',
    title: 'Custom Practice Test',
    shortTitle: 'Custom',
    icon: Sliders,
    badge: 'Configurable',
    desc: 'Design your own exam: choose subjects, units, question count, and time',
    defaultQuestions: 20,
    defaultTime: 30
  }
];

export default function MockTestEnginePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState('SUBJECT_TEST');
  const [testState, setTestState] = useState('idle'); // 'idle', 'loading', 'running', 'result'
  
  // Metadata & Academic Hierarchy
  const [meta, setMeta] = useState({
    subjects: [],
    previousPapers: [],
    existingMockTests: [],
    totalMcqs: 0,
    totalMistakes: 0
  });
  const [metaLoading, setMetaLoading] = useState(true);

  // Configuration Selectors
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedPaperId, setSelectedPaperId] = useState('');
  const [questionCount, setQuestionCount] = useState(30);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1.0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(40);
  const [hasNegativeMarking, setHasNegativeMarking] = useState(true);
  const [negativeMarkValue, setNegativeMarkValue] = useState(0.25);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [languagePreference, setLanguagePreference] = useState('both'); // 'en', 'gu', 'both'

  // Running Exam State
  const [sessionMeta, setSessionMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [mcqId]: 'A' | 'B' | 'C' | 'D' }
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [mcqId]: boolean }
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [attemptId, setAttemptId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Results State
  const [submissionResult, setSubmissionResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary', 'subjects', 'units', 'topics', 'weakTopics', 'review'
  const [revisionToast, setRevisionToast] = useState({});

  useEffect(() => {
    setMounted(true);
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setMetaLoading(true);
      const res = await fetch('/api/mock-test/config');
      const data = await res.json();
      if (data.success && data.data) {
        setMeta(data.data);
        if (data.data.subjects.length > 0) {
          const firstSub = data.data.subjects[0];
          setSelectedSubjectId(firstSub.id);
          if (firstSub.units.length > 0) {
            setSelectedUnitId(firstSub.units[0].id);
          }
        }
        if (data.data.previousPapers.length > 0) {
          setSelectedPaperId(data.data.previousPapers[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching mock test meta:', err);
    } finally {
      setMetaLoading(false);
    }
  };

  // Adjust defaults when test type changes
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    const def = TEST_TYPES_UI.find(t => t.id === typeId);
    if (def) {
      setQuestionCount(def.defaultQuestions);
      setTimeLimitMinutes(def.defaultTime);
    }
  };

  const handleSubjectChange = (subId) => {
    setSelectedSubjectId(subId);
    const subj = meta.subjects.find(s => s.id === subId);
    if (subj && subj.units.length > 0) {
      setSelectedUnitId(subj.units[0].id);
    } else {
      setSelectedUnitId('');
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (testState !== 'running') return;

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);

      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState]);

  // Launch Test Session
  const handleStartTest = async () => {
    setTestState('loading');
    setSubmitError('');

    try {
      const payload = {
        testType: selectedType,
        subjectId: selectedSubjectId || null,
        unitId: selectedUnitId || null,
        paperId: selectedPaperId || null,
        customConfig: {
          questionCount,
          marksPerQuestion,
          timeLimitMinutes,
          hasNegativeMarking,
          negativeMarkValue,
          randomize: randomizeQuestions
        },
        userId: 'usr-student-01'
      };

      const res = await fetch('/api/mock-test/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success || !data.data.questions || data.data.questions.length === 0) {
        alert(data.error || 'No questions available matching this test configuration.');
        setTestState('idle');
        return;
      }

      const generatedAttemptId = `att-mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setAttemptId(generatedAttemptId);
      setSessionMeta(data.data.testMeta);
      setQuestions(data.data.questions);
      setCurrentIdx(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setSecondsElapsed(0);
      setSecondsRemaining((data.data.testMeta.timeLimitMinutes || timeLimitMinutes) * 60);

      setTestState('running');
    } catch (err) {
      console.error('Error starting test:', err);
      alert('Failed to connect to mock test server. Please retry.');
      setTestState('idle');
    }
  };

  // Option select
  const handleSelectOption = (mcqId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [mcqId]: optionKey
    }));
  };

  // Clear answer
  const handleClearAnswer = (mcqId) => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[mcqId];
      return copy;
    });
  };

  // Mark for review
  const handleToggleFlag = (mcqId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [mcqId]: !prev[mcqId]
    }));
  };

  // Auto-submit on time up
  const handleAutoSubmitTimeUp = async () => {
    alert('⏱️ Time limit reached! Your test answers are being submitted automatically.');
    await executeSubmission();
  };

  // Submit test attempt
  const executeSubmission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        attemptId,
        mockTestId: sessionMeta?.mockTestId || null,
        testType: sessionMeta?.testType || selectedType,
        subjectId: sessionMeta?.subjectId || selectedSubjectId || null,
        unitId: sessionMeta?.unitId || selectedUnitId || null,
        answers: userAnswers,
        timeSpentSeconds: secondsElapsed,
        testConfig: {
          marksPerQuestion: sessionMeta?.marksPerQuestion || marksPerQuestion,
          hasNegativeMarking: sessionMeta?.hasNegativeMarking ?? hasNegativeMarking,
          negativeMarkValue: sessionMeta?.negativeMarkValue ?? negativeMarkValue,
          passingMarks: sessionMeta?.passingMarks
        },
        userId: 'usr-student-01'
      };

      const res = await fetch('/api/mock-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to submit test attempt.');
      }

      setSubmissionResult(data.data);
      setTestState('result');
      setShowConfirmModal(false);
      setActiveResultTab('summary');
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add to revision
  const handleAddToRevision = async (mcqId) => {
    try {
      const res = await fetch('/api/mcq/practice/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcqId, userId: 'usr-student-01' })
      });
      const data = await res.json();
      if (data.success) {
        setRevisionToast(prev => ({ ...prev, [mcqId]: '✓ Added to Revision' }));
        setTimeout(() => {
          setRevisionToast(prev => {
            const next = { ...prev };
            delete next[mcqId];
            return next;
          });
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to add to revision:', err);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSubjectObj = meta.subjects.find(s => s.id === selectedSubjectId);
  const currentUnitsList = currentSubjectObj?.units || [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-amber-500" />
        Loading Production Mock Test Engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-24">
      
      {/* Top Header & Breadcrumbs */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition">Home</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" /> Mock Test Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium">
              Official LL.B. Simulator
            </span>
            <Link
              href="/quiz"
              className="text-xs px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition flex items-center gap-1.5"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span>MCQ Practice Hub</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================
            VIEW 1: IDLE / TEST TYPE CONFIGURATION SCREEN
            ======================================================== */}
        {testState === 'idle' && (
          <div className="space-y-8">
            
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Target className="w-3.5 h-3.5" />
                <span>Production Examination Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-title tracking-tight text-white">
                Law Mock Test Engine
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Take timed, graded examination simulations aligned with Saurashtra University standards. Includes 3-tier performance diagnostics (Subject, Unit, Topic), automatic Mistake Notebook entry, and targeted weak-topic revision.
              </p>
            </div>

            {/* 5 Test Types Tabs */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Select Examination Type
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {TEST_TYPES_UI.map((type) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;

                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 min-h-[120px] relative ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2.5 rounded-xl ${
                          isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400">
                          {type.badge}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold leading-tight">{type.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Configuration Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif-title flex items-center gap-2">
                    <Timer className="w-5 h-5 text-amber-400" />
                    <span>Configure {TEST_TYPES_UI.find(t => t.id === selectedType)?.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {TEST_TYPES_UI.find(t => t.id === selectedType)?.desc}
                  </p>
                </div>

                {/* Negative marking switch */}
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Negative Marking</p>
                    <p className="text-[10px] text-slate-500">-0.25 on incorrect responses</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasNegativeMarking(!hasNegativeMarking)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      hasNegativeMarking ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        hasNegativeMarking ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dynamic Selectors Based on Test Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Subject Selector (Unit Test, Subject Test, Custom Test) */}
                {['UNIT_TEST', 'SUBJECT_TEST', 'CUSTOM_TEST'].includes(selectedType) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Select Subject</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    >
                      {meta.subjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.shortCode ? `[${s.shortCode}] ` : ''}{s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Unit Selector (Unit Test) */}
                {selectedType === 'UNIT_TEST' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Select Syllabus Unit</label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      disabled={currentUnitsList.length === 0}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
                    >
                      {currentUnitsList.map(u => (
                        <option key={u.id} value={u.id}>
                          Unit {u.unitNumber}: {u.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Previous Paper Selector (Previous Paper Practice) */}
                {selectedType === 'PREVIOUS_PAPER_PRACTICE' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Select Past Paper / Session</label>
                    <select
                      value={selectedPaperId}
                      onChange={(e) => setSelectedPaperId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    >
                      {meta.previousPapers.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.subject?.shortCode || 'Law'} - {p.examSession} {p.examYear} ({p.paperCode || 'Official Paper'})
                        </option>
                      ))}
                      {meta.previousPapers.length === 0 && (
                        <option value="">High-Frequency University PYQs (All Subjects)</option>
                      )}
                    </select>
                  </div>
                )}

                {/* Full Semester Info */}
                {selectedType === 'FULL_SEMESTER_TEST' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Semester Scope</label>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                      Saurashtra University LL.B. Sem 3 (5 Core Subjects)
                    </div>
                  </div>
                )}

                {/* Question Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase font-bold">Number of Questions</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 25, 30, 60].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setQuestionCount(cnt);
                          // Adjust time dynamically ~ 1.3 mins per question
                          setTimeLimitMinutes(Math.max(15, Math.ceil(cnt * 1.3)));
                        }}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                          questionCount === cnt
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limit Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase font-bold">Exam Time Limit (Minutes)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[20, 40, 90].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setTimeLimitMinutes(mins)}
                        className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                          timeLimitMinutes === mins
                            ? 'bg-amber-500 text-slate-950 border-amber-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {mins} Mins
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Randomization Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400 uppercase font-bold">Question Order</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRandomizeQuestions(true)}
                      className={`py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        randomizeQuestions
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Randomized</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRandomizeQuestions(false)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        !randomizeQuestions
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      Sequential
                    </button>
                  </div>
                </div>

              </div>

              {/* Exam Rules & Parameter Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                  <span>Total Questions: <strong className="text-white">{questionCount}</strong></span>
                  <span>&bull;</span>
                  <span>Total Marks: <strong className="text-amber-400">{questionCount * marksPerQuestion}</strong></span>
                  <span>&bull;</span>
                  <span>Pass Threshold: <strong className="text-emerald-400">{Math.round(questionCount * marksPerQuestion * 0.5)}</strong></span>
                  <span>&bull;</span>
                  <span>Duration: <strong className="text-white">{timeLimitMinutes} Mins</strong></span>
                  <span>&bull;</span>
                  <span>Penalty: <strong className="text-rose-400">{hasNegativeMarking ? `-${negativeMarkValue}` : 'None'}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleStartTest}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Exam Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            VIEW 2: LOADING STATE
            ======================================================== */}
        {testState === 'loading' && (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Initializing Mock Test Simulator...</h3>
              <p className="text-xs text-slate-400">
                Applying exam security, randomizing questions, and setting up multi-tier performance trackers.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: RUNNING TEST WORKSPACE
            ======================================================== */}
        {testState === 'running' && questions.length > 0 && (
          <div className="space-y-6">
            
            {/* Top Examination Header */}
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-lg sticky top-14 sm:top-16 z-20">
              
              {/* Test Identity */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {sessionMeta?.typeTitle || 'Exam Simulator'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-rose-500/20 border border-rose-500/30 text-rose-300">
                      Exam Security Active
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                    {sessionMeta?.title || 'Mock Examination'}
                  </h3>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full sm:w-auto sm:flex-1 max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Answered: {Object.keys(userAnswers).length}/{questions.length}</span>
                  <span>{Math.round((Object.keys(userAnswers).length / questions.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Countdown Timer & Controls */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                  secondsRemaining <= 120
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                    : secondsRemaining <= 300
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-amber-500/30 text-amber-400'
                }`}>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{formatTimer(secondsRemaining)}</span>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setLanguagePreference('en')}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      languagePreference === 'en' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguagePreference('gu')}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      languagePreference === 'gu' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    ગુજ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguagePreference('both')}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      languagePreference === 'both' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                    }`}
                  >
                    Both
                  </button>
                </div>

                {/* Mobile / Tablet Palette Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
                  className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold flex items-center gap-1 border border-slate-700"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Matrix</span>
                </button>
              </div>

            </div>

            {/* Main Layout: Question Workspace (Left) + Question Matrix (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              <div className="lg:col-span-3 space-y-6">
                {(() => {
                  const currentQ = questions[currentIdx];
                  if (!currentQ) return null;
                  const isFlagged = flaggedQuestions[currentQ.id];
                  const selectedOptKey = userAnswers[currentQ.id];

                  return (
                    <div className="p-3.5 xs-360:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4 sm:space-y-6 shadow-xl relative">
                      
                      {/* Meta bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold">
                            Question {currentIdx + 1} of {questions.length}
                          </span>
                          {currentQ.subject && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold">
                              {currentQ.subject.code || currentQ.subject.title}
                            </span>
                          )}
                          {currentQ.unit && (
                            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                              Unit {currentQ.unit.unitNumber}
                            </span>
                          )}
                          {currentQ.topic && (
                            <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                              {currentQ.topic.title}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-950 border border-slate-800 text-slate-300">
                            +{currentQ.marks || 1.0} Marks {sessionMeta?.hasNegativeMarking ? `(-${sessionMeta.negativeMarkValue})` : ''}
                          </span>
                        </div>

                        {/* Mark for Review Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFlag(currentQ.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                            isFlagged
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
                          <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
                        </button>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-2">
                        {(languagePreference === 'en' || languagePreference === 'both' || !currentQ.questionTextGu) && (
                          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white font-serif-title leading-relaxed">
                            {currentQ.questionText}
                          </h2>
                        )}
                        {(languagePreference === 'gu' || languagePreference === 'both') && currentQ.questionTextGu && (
                          <h3 className="text-base sm:text-lg font-medium text-amber-200/90 leading-relaxed font-sans pt-1">
                            {currentQ.questionTextGu}
                          </h3>
                        )}
                      </div>

                      {/* Options List */}
                      <div className="space-y-3 pt-2">
                        {currentQ.options.map((opt) => {
                          const isSelected = selectedOptKey === opt.key;

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => handleSelectOption(currentQ.id, opt.key)}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 group relative ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                                  : 'bg-slate-950/70 border-slate-800/90 text-slate-300 hover:border-slate-750 hover:bg-slate-950'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-black shrink-0 transition ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-900 border border-slate-800 text-slate-400 group-hover:border-slate-700'
                              }`}>
                                {opt.key}
                              </span>

                              <div className="space-y-0.5 flex-1 text-xs sm:text-sm pt-0.5">
                                {(languagePreference === 'en' || languagePreference === 'both' || !opt.textGu) && (
                                  <p className="leading-snug">{opt.text}</p>
                                )}
                                {(languagePreference === 'gu' || languagePreference === 'both') && opt.textGu && (
                                  <p className="text-amber-200/80 leading-snug font-sans text-xs">
                                    {opt.textGu}
                                  </p>
                                )}
                              </div>

                              {isSelected && (
                                <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Navigation & Controls */}
                      <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                            disabled={currentIdx === 0}
                            className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-bold disabled:opacity-40 transition flex items-center gap-1.5"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                          </button>

                          {selectedOptKey && (
                            <button
                              type="button"
                              onClick={() => handleClearAnswer(currentQ.id)}
                              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs font-bold transition flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Clear Answer</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {currentIdx + 1 < questions.length ? (
                            <button
                              type="button"
                              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowConfirmModal(true)}
                              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                            >
                              <span>Submit Test</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>

              {/* Question Matrix Sidebar */}
              <div className={`lg:col-span-1 space-y-4 ${
                showPaletteDrawer
                  ? 'fixed inset-x-0 bottom-0 top-auto z-40 bg-slate-900 border-t border-slate-800 p-5 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto'
                  : 'hidden lg:block'
              }`}>
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      Exam Palette
                    </span>
                    {showPaletteDrawer && (
                      <button
                        type="button"
                        onClick={() => setShowPaletteDrawer(false)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Matrix Tiles */}
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = userAnswers[q.id] !== undefined;
                      const isFlagged = flaggedQuestions[q.id];
                      const isCurrent = currentIdx === idx;

                      let tileClasses = "bg-slate-950 border-slate-800 text-slate-500";
                      if (isAnswered && isFlagged) {
                        tileClasses = "bg-amber-500/25 border-amber-500 text-amber-200 font-bold";
                      } else if (isAnswered) {
                        tileClasses = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold";
                      } else if (isFlagged) {
                        tileClasses = "bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold";
                      }

                      if (isCurrent) {
                        tileClasses += " ring-2 ring-white text-white";
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => {
                            setCurrentIdx(idx);
                            setShowPaletteDrawer(false);
                          }}
                          className={`h-9 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all ${tileClasses}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Matrix Legend */}
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-[10px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
                      <span>Answered ({Object.keys(userAnswers).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/40" />
                      <span>Marked for Review ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" />
                      <span>Unanswered ({questions.length - Object.keys(userAnswers).length})</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Test</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Pre-Submission Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white font-serif-title">Submit Examination?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you ready to submit your test? Once confirmed, your answers will be evaluated and performance metrics generated.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2.5 p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center font-mono">
                <div>
                  <p className="text-base font-black text-emerald-400">{Object.keys(userAnswers).length}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Answered</p>
                </div>
                <div>
                  <p className="text-base font-black text-amber-400">
                    {questions.length - Object.keys(userAnswers).length}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Skipped</p>
                </div>
                <div>
                  <p className="text-base font-black text-purple-400">
                    {Object.values(flaggedQuestions).filter(Boolean).length}
                  </p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Flagged</p>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-semibold">
                  {submitError}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition"
                >
                  Return to Test
                </button>
                <button
                  type="button"
                  onClick={executeSubmission}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 4: RESULTS, MULTI-TIER ANALYTICS & WEAK TOPIC REVISION
            ======================================================== */}
        {testState === 'result' && submissionResult && (
          <div className="space-y-8">
            
            {/* 1. Hero Score Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1 max-w-lg mx-auto">
                <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 font-mono text-[10px] uppercase font-bold text-amber-400">
                  {sessionMeta?.typeTitle || 'Mock Test'} Concluded
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif-title text-white">
                  Examination Result & Analytics
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Calculated using verified academic grading criteria.
                </p>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    {submissionResult.summary.score}
                    <span className="text-xs text-slate-500 font-normal"> / {submissionResult.summary.totalMarks}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Score</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {submissionResult.summary.correctCount}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Correct</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <p className="text-2xl sm:text-3xl font-black text-rose-400">
                    {submissionResult.summary.incorrectCount}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Wrong</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <p className="text-2xl sm:text-3xl font-black text-slate-400">
                    {submissionResult.summary.skippedCount}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Skipped</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 col-span-2 sm:col-span-1">
                  <p className="text-2xl sm:text-3xl font-black text-blue-400">
                    {submissionResult.summary.timeUsedFormatted}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Time Used</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold border ${
                  submissionResult.summary.isPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  {submissionResult.summary.percentage}% &bull; {submissionResult.summary.isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'} ({submissionResult.summary.masteryStatus})
                </span>

                {submissionResult.summary.penaltyDeduction > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-850 font-mono text-xs text-rose-400">
                    Penalty: -{submissionResult.summary.penaltyDeduction} Marks
                  </span>
                )}
              </div>

              {/* My Mistakes Alert */}
              {submissionResult.summary.incorrectCount > 0 && (
                <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {submissionResult.summary.incorrectCount} wrong answer{submissionResult.summary.incorrectCount > 1 ? 's' : ''} logged into My Mistakes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Saved in your Mistake Notebook so you can re-attempt them anytime until 100% mastered.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/quiz"
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-slate-950 text-xs font-black shrink-0 transition"
                  >
                    Open Notebook
                  </Link>
                </div>
              )}

              {/* Action Buttons: Retry, Review, Revise */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleStartTest}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveResultTab('review')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Review Answers</span>
                </button>

                {submissionResult.performance.weakTopics.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveResultTab('weakTopics')}
                    className="px-5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-2 border border-rose-500/40"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Revise Weak Topics ({submissionResult.performance.weakTopics.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setTestState('idle')}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold transition"
                >
                  Return to Hub
                </button>
              </div>

            </div>

            {/* Performance Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveResultTab('summary')}
                className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  activeResultTab === 'summary' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Diagnostics Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveResultTab('subjects')}
                className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  activeResultTab === 'subjects' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Subject-wise ({submissionResult.performance.subjects.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveResultTab('units')}
                className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  activeResultTab === 'units' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Unit-wise ({submissionResult.performance.units.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveResultTab('topics')}
                className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  activeResultTab === 'topics' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Topic-wise ({submissionResult.performance.topics.length})</span>
              </button>
              {submissionResult.performance.weakTopics.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveResultTab('weakTopics')}
                  className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                    activeResultTab === 'weakTopics' ? 'bg-rose-500 text-slate-950' : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Weak Topics ({submissionResult.performance.weakTopics.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveResultTab('review')}
                className={`px-4 py-2 rounded-xl transition font-bold flex items-center gap-1.5 whitespace-nowrap ${
                  activeResultTab === 'review' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Review Questions</span>
              </button>
            </div>

            {/* TAB CONTENT: Subject-wise Performance */}
            {(activeResultTab === 'summary' || activeResultTab === 'subjects') && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span>Subject-wise Performance Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissionResult.performance.subjects.map(sp => (
                    <div key={sp.subjectId} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-amber-400 uppercase">[{sp.subjectCode}]</span>
                        <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                          {sp.masteryLevel}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{sp.title}</h4>
                      
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span>Marks: {sp.marksScored} / {sp.maxMarks}</span>
                          <span className="font-bold text-white">{sp.accuracy}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              sp.accuracy >= 75 ? 'bg-emerald-500' : sp.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${sp.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Unit-wise Performance */}
            {(activeResultTab === 'summary' || activeResultTab === 'units') && (
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Unit-wise Performance Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {submissionResult.performance.units.map(up => (
                    <div key={up.unitId} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold uppercase">[{up.subjectCode}] Unit {up.unitNumber}</span>
                        <span className="text-white font-bold">{up.accuracy}%</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{up.title}</h4>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            up.accuracy >= 75 ? 'bg-emerald-500' : up.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${up.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Topic-wise Performance */}
            {(activeResultTab === 'summary' || activeResultTab === 'topics') && (
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Topic-wise Performance Breakdown</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submissionResult.performance.topics.map((tp, idx) => (
                    <div
                      key={tp.topicId || idx}
                      className={`p-4 rounded-2xl border space-y-2 ${
                        tp.isWeakTopic ? 'bg-rose-500/5 border-rose-500/25' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-bold uppercase">[{tp.subjectCode}] U{tp.unitNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tp.isWeakTopic
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {tp.accuracy}%
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{tp.title}</h4>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>{tp.correct} of {tp.total} correct</span>
                        {tp.isWeakTopic && <span className="text-rose-400 font-bold">Weak Topic</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Weak Topics & Direct Revision Action */}
            {(activeResultTab === 'summary' || activeResultTab === 'weakTopics') && submissionResult.performance.weakTopics.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/20 border border-rose-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-base font-bold text-white">Identified Weak Topics (Requires Revision)</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Topics with accuracy below 60% are flagged as vulnerable. Click "Revise Topic" to open the Topic Learning System with model answers, statutory sections, and case laws.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {submissionResult.performance.weakTopics.map(wt => (
                      <div key={wt.topicId} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-3 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                            [{wt.subjectCode}] Unit {wt.unitNumber} &bull; {wt.accuracy}% Accuracy
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1 leading-snug">{wt.title}</h4>
                        </div>
                        
                        <Link
                          href={wt.revisionUrl}
                          className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Revise Topic</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Detailed Question-by-Question Review */}
            {(activeResultTab === 'review' || activeResultTab === 'summary') && (
              <div className="space-y-4 pt-4">
                <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Question-by-Question Examination Review</span>
                </h3>

                <div className="space-y-4">
                  {submissionResult.questionsReview.map((q, idx) => {
                    const isCorrect = q.isCorrect;
                    const isSkipped = q.isSkipped;
                    const hasToast = revisionToast[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`p-6 rounded-3xl border space-y-4 transition-all ${
                          isCorrect
                            ? 'bg-slate-900/90 border-emerald-500/20'
                            : isSkipped
                            ? 'bg-slate-900/70 border-slate-800'
                            : 'bg-slate-900/90 border-rose-500/25'
                        }`}
                      >
                        {/* Question Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono font-bold text-white">
                              Question {idx + 1}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider ${
                              isCorrect
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isSkipped
                                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {isCorrect ? '✓ Correct' : isSkipped ? '– Skipped' : '✗ Incorrect'}
                            </span>
                            {q.savedToMyMistakes && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                In My Mistakes
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 font-mono">
                            {q.subject && <span>{q.subject.shortCode || q.subject.title}</span>}
                            {q.topic && <span> &bull; {q.topic.title}</span>}
                          </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-1">
                          <h4 className="text-sm sm:text-base font-bold text-white font-serif-title leading-relaxed">
                            {q.questionText}
                          </h4>
                          {q.questionTextGu && (
                            <p className="text-xs sm:text-sm font-medium text-amber-200/80 leading-relaxed font-sans">
                              {q.questionTextGu}
                            </p>
                          )}
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {q.options.map((opt) => {
                            const isUserPick = q.selectedOptionKey === opt.key;
                            const isRightAnswer = q.correctOptionKey === opt.key;

                            let optionStyle = "bg-slate-950/60 border-slate-800/80 text-slate-400";
                            if (isRightAnswer) {
                              optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold";
                            } else if (isUserPick && !isCorrect) {
                              optionStyle = "bg-rose-500/10 border-rose-500/40 text-rose-300";
                            }

                            return (
                              <div
                                key={opt.key}
                                className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm ${optionStyle}`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                                  isRightAnswer
                                    ? 'bg-emerald-500 text-slate-950 font-black'
                                    : isUserPick && !isCorrect
                                    ? 'bg-rose-500 text-slate-950 font-black'
                                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                                }`}>
                                  {opt.key}
                                </span>
                                <div className="space-y-0.5 flex-1 pt-0.5">
                                  <p>{opt.text}</p>
                                  {opt.textGu && (
                                    <p className="text-xs text-amber-200/70">{opt.textGu}</p>
                                  )}
                                </div>
                                {isRightAnswer && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />}
                                {isUserPick && !isCorrect && <X className="w-4 h-4 text-rose-400 shrink-0 mt-1" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Statutory Explanation */}
                        {q.explanation && (
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              Statutory Legal Provision & Explanation
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {q.explanation}
                            </p>
                            {q.explanationGu && (
                              <p className="text-xs text-amber-200/80 leading-relaxed pt-1 border-t border-slate-850/60 font-sans">
                                {q.explanationGu}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Question Action Bar */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-850">
                          {q.topic?.id ? (
                            <Link
                              href={`/academic/topic/${q.topic.id}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Revise Topic: {q.topic.title}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : <div />}

                          <div className="flex items-center gap-2">
                            {hasToast ? (
                              <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                {hasToast}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToRevision(q.id)}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                                <span>Add to Revision</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
