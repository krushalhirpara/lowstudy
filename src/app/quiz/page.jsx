"use client";

import { useState, useEffect, useRef, useId } from 'react';
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
  FolderOpen,
  GraduationCap,
  Timer,
  Shuffle,
  BarChart3,
  ListFilter,
  Eye,
  Sliders,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const MODES = [
  { id: 'TOPIC', title: 'Topic Practice', icon: BookOpen, desc: 'Targeted drill on a specific syllabus topic' },
  { id: 'UNIT', title: 'Unit Practice', icon: Layers, desc: 'Practice all legal topics across a complete unit' },
  { id: 'SUBJECT', title: 'Subject Practice', icon: GraduationCap, desc: 'Full-course evaluation on an entire law subject' },
  { id: 'MIXED', title: 'Mixed Practice', icon: Sliders, desc: 'Multi-subject practice across active curriculum' },
  { id: 'RANDOM', title: 'Random Practice', icon: Shuffle, desc: 'Instant rapid-fire from 4,600+ verified MCQs' },
  { id: 'TIMED_QUIZ', title: 'Timed Quiz', icon: Timer, desc: 'Official exam simulator with countdown & strict rules' },
  { id: 'MY_MISTAKES', title: 'My Mistakes', icon: AlertTriangle, desc: 'Re-attempt past wrong questions to master weak spots' }
];

export default function McqPracticePage() {
  const [mounted, setMounted] = useState(false);
  const [selectedMode, setSelectedMode] = useState('RANDOM');
  const [quizState, setQuizState] = useState('idle'); // 'idle', 'loading', 'running', 'submitting', 'result'
  
  // Metadata from DB
  const [meta, setMeta] = useState({ subjects: [], totalMcqs: 0, totalMistakes: 0 });
  const [metaLoading, setMetaLoading] = useState(true);

  // Configuration Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyFilter, setDifficultyFilter] = useState(''); // '', 'EASY', 'MEDIUM', 'HARD'
  const [useNegativeMarking, setUseNegativeMarking] = useState(true);
  const [timedDurationMinutes, setTimedDurationMinutes] = useState(15);
  const [languagePreference, setLanguagePreference] = useState('both'); // 'en', 'gu', 'both'

  // Running Quiz State
  const [questions, setQuestions] = useState([]);
  const [sessionMeta, setSessionMeta] = useState(null);
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
  const [revisionToast, setRevisionToast] = useState({}); // { [mcqId]: message }

  // Load hierarchy metadata on mount
  useEffect(() => {
    setMounted(true);
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      setMetaLoading(true);
      const res = await fetch('/api/mcq/meta');
      const data = await res.json();
      if (data.success) {
        setMeta(data.data);
        if (data.data.subjects.length > 0) {
          const firstSubj = data.data.subjects[0];
          setSelectedSubjectId(firstSubj.id);
          if (firstSubj.units.length > 0) {
            setSelectedUnitId(firstSubj.units[0].id);
            if (firstSubj.units[0].topics.length > 0) {
              setSelectedTopicId(firstSubj.units[0].topics[0].id);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load MCQ meta:', err);
    } finally {
      setMetaLoading(false);
    }
  };

  // Keep Unit & Topic selectors in sync when Subject changes
  const handleSubjectChange = (subjId) => {
    setSelectedSubjectId(subjId);
    const subj = meta.subjects.find(s => s.id === subjId);
    if (subj && subj.units.length > 0) {
      setSelectedUnitId(subj.units[0].id);
      if (subj.units[0].topics.length > 0) {
        setSelectedTopicId(subj.units[0].topics[0].id);
      } else {
        setSelectedTopicId('');
      }
    } else {
      setSelectedUnitId('');
      setSelectedTopicId('');
    }
  };

  const handleUnitChange = (unitId) => {
    setSelectedUnitId(unitId);
    const subj = meta.subjects.find(s => s.id === selectedSubjectId);
    const unit = subj?.units.find(u => u.id === unitId);
    if (unit && unit.topics.length > 0) {
      setSelectedTopicId(unit.topics[0].id);
    } else {
      setSelectedTopicId('');
    }
  };

  // Timer Tick
  useEffect(() => {
    if (quizState !== 'running') return;

    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);

      if (selectedMode === 'TIMED_QUIZ') {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmitOnTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState, selectedMode, userAnswers]);

  // Launch Practice Session
  const handleStartPractice = async (overrideMode = null) => {
    const activeMode = overrideMode || selectedMode;
    setQuizState('loading');
    setSubmitError('');

    try {
      const isExam = activeMode === 'TIMED_QUIZ';
      const params = new URLSearchParams({
        mode: activeMode,
        count: String(questionCount),
        isExamMode: isExam ? 'true' : 'false'
      });

      if (activeMode === 'TOPIC' && selectedTopicId) params.append('topicId', selectedTopicId);
      if (activeMode === 'UNIT' && selectedUnitId) params.append('unitId', selectedUnitId);
      if ((activeMode === 'SUBJECT' || activeMode === 'MIXED') && selectedSubjectId) {
        params.append('subjectId', selectedSubjectId);
      }
      if (difficultyFilter) params.append('difficulty', difficultyFilter);

      const res = await fetch(`/api/mcq/practice?${params.toString()}`);
      const data = await res.json();

      if (!data.success || !data.data.questions || data.data.questions.length === 0) {
        alert(data.error || 'No questions found for the selected configuration. Try another subject or difficulty.');
        setQuizState('idle');
        return;
      }

      // Generate unique attempt ID to prevent duplicate submissions
      const uniqueAttemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setAttemptId(uniqueAttemptId);

      setQuestions(data.data.questions);
      setSessionMeta(data.data.sessionMeta);
      setCurrentIdx(0);
      setUserAnswers({});
      setFlaggedQuestions({});
      setSecondsElapsed(0);

      if (isExam) {
        const totalSecs = (data.data.sessionMeta.timeLimitMinutes || timedDurationMinutes || 15) * 60;
        setSecondsRemaining(totalSecs);
      } else {
        setSecondsRemaining(0);
      }

      setQuizState('running');
    } catch (err) {
      console.error('Error starting practice session:', err);
      alert('Unable to connect to practice server. Please retry.');
      setQuizState('idle');
    }
  };

  // Answer selection
  const handleSelectOption = (mcqId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [mcqId]: optionKey
    }));
  };

  // Clear answer
  const handleClearAnswer = (mcqId) => {
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[mcqId];
      return updated;
    });
  };

  // Toggle flag for review
  const handleToggleFlag = (mcqId) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [mcqId]: !prev[mcqId]
    }));
  };

  // Auto-submit when countdown hits zero
  const handleAutoSubmitOnTimeUp = async () => {
    alert('⏱️ Time has expired! Your answers are being submitted automatically.');
    await executeSubmission();
  };

  // Submit Session
  const executeSubmission = async () => {
    if (isSubmitting) return; // Prevent double clicks
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        attemptId,
        mode: sessionMeta?.mode || selectedMode,
        subjectId: selectedSubjectId || null,
        unitId: selectedUnitId || null,
        topicId: selectedTopicId || null,
        answers: userAnswers,
        timeSpentSeconds: secondsElapsed,
        useNegativeMarking,
        userId: 'usr-student-01'
      };

      const res = await fetch('/api/mcq/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit practice session');
      }

      setSubmissionResult(data.data);
      setQuizState('result');
      setShowConfirmModal(false);
      // Refresh metadata count (mistakes updated)
      fetchMeta();
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add MCQ to Spaced Revision
  const handleAddToRevision = async (mcqId) => {
    try {
      const res = await fetch('/api/mcq/practice/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mcqId, userId: 'usr-student-01' })
      });
      const data = await res.json();
      if (data.success) {
        setRevisionToast(prev => ({ ...prev, [mcqId]: '✓ Added to Spaced Revision' }));
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

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Currently viewed subject & unit objects for selectors
  const currentSubjectObj = meta.subjects.find(s => s.id === selectedSubjectId);
  const currentUnitsList = currentSubjectObj?.units || [];
  const currentUnitObj = currentUnitsList.find(u => u.id === selectedUnitId);
  const currentTopicsList = currentUnitObj?.topics || [];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-amber-500" />
        Initializing Saurashtra University Law MCQ Engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 pb-20">
      
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition">Home</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> MCQ Practice System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-medium">
              4,690+ Verified Questions
            </span>
            {meta.totalMistakes > 0 && (
              <button
                onClick={() => {
                  setSelectedMode('MY_MISTAKES');
                  setQuizState('idle');
                }}
                className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1 font-semibold"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>My Mistakes ({meta.totalMistakes})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================
            VIEW 1: IDLE / CONFIGURATION HUB
            ======================================================== */}
        {quizState === 'idle' && (
          <div className="space-y-8">
            
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Master Gujarati & English Law MCQs</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-title tracking-tight text-white">
                Law MCQ Practice System
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Official syllabus questions with full statutory explanations, bilingual support, and automatic Mistake Notebook logging for Saurashtra University LL.B. & Bar exams.
              </p>
            </div>

            {/* Mode Selection Tabs */}
            <div className="space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Select Practice Mode
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = selectedMode === mode.id;
                  const isMistakeTab = mode.id === 'MY_MISTAKES';

                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className={`p-3 sm:p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 min-h-[95px] relative group ${
                        isSelected
                          ? isMistakeTab
                            ? 'bg-rose-500/15 border-rose-500 text-white ring-2 ring-rose-500/30'
                            : 'bg-amber-500/15 border-amber-500 text-white ring-2 ring-amber-500/30'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl ${
                          isSelected
                            ? isMistakeTab ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400 group-hover:text-amber-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isMistakeTab && meta.totalMistakes > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-slate-950 font-mono text-[10px] font-black">
                            {meta.totalMistakes}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold leading-tight">{mode.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{mode.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Specific Configuration Panel */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif-title flex items-center gap-2">
                    {selectedMode === 'TOPIC' && <BookOpen className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'UNIT' && <Layers className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'SUBJECT' && <GraduationCap className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'MIXED' && <Sliders className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'RANDOM' && <Shuffle className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'TIMED_QUIZ' && <Timer className="w-5 h-5 text-amber-400" />}
                    {selectedMode === 'MY_MISTAKES' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                    <span>Configure {MODES.find(m => m.id === selectedMode)?.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {MODES.find(m => m.id === selectedMode)?.desc}
                  </p>
                </div>

                {/* Negative marking switch */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-850">
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-200">Negative Marking</p>
                    <p className="text-[10px] text-slate-500">-0.25 on wrong answers</p>
                  </div>
                  <button
                    onClick={() => setUseNegativeMarking(!useNegativeMarking)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      useNegativeMarking ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        useNegativeMarking ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Dynamic Selectors Based on Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Subject Selector (for TOPIC, UNIT, SUBJECT, MIXED) */}
                {['TOPIC', 'UNIT', 'SUBJECT', 'MIXED'].includes(selectedMode) && (
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

                {/* Unit Selector (for TOPIC, UNIT) */}
                {['TOPIC', 'UNIT'].includes(selectedMode) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Select Unit</label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => handleUnitChange(e.target.value)}
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

                {/* Topic Selector (for TOPIC) */}
                {selectedMode === 'TOPIC' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Select Topic</label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={currentTopicsList.length === 0}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
                    >
                      {currentTopicsList.map(t => (
                        <option key={t.id} value={t.id}>
                          Topic {t.topicNumber}: {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Question Count Selector */}
                {selectedMode !== 'MY_MISTAKES' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Number of Questions</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 20, 30].map(count => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                            questionCount === count
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Difficulty Filter */}
                {selectedMode !== 'MY_MISTAKES' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Difficulty Filter</label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition"
                    >
                      <option value="">All Difficulties (Balanced)</option>
                      <option value="EASY">Easy (Fundamental Definitions)</option>
                      <option value="MEDIUM">Medium (Statutory Applications)</option>
                      <option value="HARD">Hard (Case Laws & Exceptions)</option>
                    </select>
                  </div>
                )}

                {/* Timed Quiz Duration Selector */}
                {selectedMode === 'TIMED_QUIZ' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase font-bold">Exam Timer Limit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[10, 15, 30].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setTimedDurationMinutes(mins)}
                          className={`py-2 rounded-xl text-xs font-mono font-bold border transition ${
                            timedDurationMinutes === mins
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {mins} Mins
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* My Mistakes Info Banner */}
                {selectedMode === 'MY_MISTAKES' && (
                  <div className="md:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Mistake Notebook (Active: {meta.totalMistakes})</p>
                        <p className="text-xs text-slate-400">
                          Questions you answered incorrectly in prior tests are queued here. Answering correctly will resolve them!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldAlert className="w-4 h-4 text-amber-500/70" />
                  <span>
                    {selectedMode === 'TIMED_QUIZ'
                      ? 'Exam Mode: Correct answers & statutory explanations are strictly concealed until submission.'
                      : 'Practice Mode: Comprehensive score & per-topic mastery metrics compiled after submission.'}
                  </span>
                </div>

                <button
                  onClick={() => handleStartPractice()}
                  disabled={selectedMode === 'MY_MISTAKES' && meta.totalMistakes === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedMode === 'TIMED_QUIZ' ? 'Launch Timed Exam Simulator' : 'Start Practice Session'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-white">Per-Topic Performance</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatic diagnostic breakdown reveals which specific syllabus units require revision before finals.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-white">Spaced Revision schedule</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Easily add challenging MCQs to your spaced revision schedule with 1 click after evaluating results.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-white">Auto Mistake Notebook</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never repeat errors: every wrong answer is instantly filed into My Mistakes until you answer it correctly.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            VIEW 2: LOADING STATE
            ======================================================== */}
        {quizState === 'loading' && (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Generating Practice Session...</h3>
              <p className="text-xs text-slate-400">
                Fetching verified questions, setting up exam parameters, and initializing topic trackers.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            VIEW 3: RUNNING QUIZ WORKSPACE
            ======================================================== */}
        {quizState === 'running' && questions.length > 0 && (
          <div className="space-y-6">
            
            {/* Top Workspace Header Bar */}
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 sm:gap-4 shadow-lg sticky top-14 sm:top-16 z-20">
              
              {/* Session Identity & Mode */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  {selectedMode === 'TIMED_QUIZ' ? <Timer className="w-5 h-5 text-amber-400 animate-pulse" /> : <Award className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {sessionMeta?.modeTitle || selectedMode}
                    </span>
                    {sessionMeta?.isExamMode && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-rose-500/20 border border-rose-500/30 text-rose-300">
                        Exam Security Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Question {currentIdx + 1} of {questions.length}
                  </h3>
                </div>
              </div>

              {/* Center: Real-time Progress Bar */}
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

              {/* Right: Timer & Palette Drawer Toggle */}
              <div className="flex items-center gap-2">
                {/* Timer Badge */}
                <div className={`px-3 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center gap-1.5 ${
                  selectedMode === 'TIMED_QUIZ'
                    ? secondsRemaining <= 120
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-950 border-amber-500/30 text-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>
                    {selectedMode === 'TIMED_QUIZ'
                      ? formatTimer(secondsRemaining)
                      : formatTimer(secondsElapsed)}
                  </span>
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

            {/* Main Quiz Layout: Question Card (Left) + Question Matrix (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Question Main Card */}
              <div className="lg:col-span-3 space-y-6">
                
                {(() => {
                  const currentQ = questions[currentIdx];
                  if (!currentQ) return null;
                  const isFlagged = flaggedQuestions[currentQ.id];
                  const selectedOptKey = userAnswers[currentQ.id];

                  return (
                    <div className="p-3.5 xs-360:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 space-y-4 sm:space-y-6 shadow-xl relative">
                      
                      {/* Question Meta Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold">
                            Q{currentIdx + 1}
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
                          {currentQ.difficulty && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              currentQ.difficulty === 'EASY'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : currentQ.difficulty === 'MEDIUM'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {currentQ.difficulty}
                            </span>
                          )}
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
                        {/* English Question */}
                        {(languagePreference === 'en' || languagePreference === 'both' || !currentQ.questionTextGu) && (
                          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white font-serif-title leading-relaxed">
                            {currentQ.questionText}
                          </h2>
                        )}

                        {/* Gujarati Question */}
                        {(languagePreference === 'gu' || languagePreference === 'both') && currentQ.questionTextGu && (
                          <h3 className="text-base sm:text-lg font-medium text-amber-200/90 leading-relaxed font-sans pt-1">
                            {currentQ.questionTextGu}
                          </h3>
                        )}
                      </div>

                      {/* Options List (A, B, C, D) */}
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

                      {/* Bottom Action Controls: Prev, Clear, Next, Submit */}
                      <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        
                        {/* Left: Previous & Clear Answer */}
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

                        {/* Right: Next or Submit */}
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
                              <span>Submit Practice</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  );
                })()}

              </div>

              {/* Question Matrix Sidebar (Desktop Sticky + Mobile Drawer) */}
              <div className={`lg:col-span-1 space-y-4 ${
                showPaletteDrawer
                  ? 'fixed inset-x-0 bottom-0 top-auto z-40 bg-slate-900 border-t border-slate-800 p-5 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto'
                  : 'hidden lg:block'
              }`}>
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      Question Matrix
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

                  {/* Matrix Tile Buttons */}
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

                  {/* Legend */}
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

                  {/* Submit Test Button in Sidebar */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Session</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* Confirmation Modal to Prevent Unintentional/Duplicate Submissions */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-6 shadow-2xl">
              
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white font-serif-title">Submit Practice Session?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you ready to submit your answers? Your score, topic diagnostics, and mistake log will be compiled.
                </p>
              </div>

              {/* Status Summary */}
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

              {/* Action Buttons */}
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
                      <span>Evaluating...</span>
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
            VIEW 4: TEST RESULTS & COMPREHENSIVE REVIEW
            ======================================================== */}
        {quizState === 'result' && submissionResult && (
          <div className="space-y-8">
            
            {/* 1. Hero Score Card */}
            <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1 max-w-lg mx-auto">
                <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 font-mono text-[10px] uppercase font-bold text-amber-400">
                  {sessionMeta?.modeTitle || selectedMode} Concluded
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-serif-title text-white">
                  Practice Evaluation Completed
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your performance has been evaluated against Saurashtra University standards.
                </p>
              </div>

              {/* Core Score Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto font-mono">
                
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850">
                  <p className="text-2xl sm:text-3xl font-black text-amber-400">
                    {submissionResult.summary.score}
                    <span className="text-xs text-slate-500 font-normal"> / {submissionResult.summary.maxScore}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Final Score</p>
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

              {/* Accuracy & Mastery Badge */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className={`px-4 py-1.5 rounded-full font-mono text-xs font-bold border ${
                  submissionResult.summary.percentage >= 75
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : submissionResult.summary.percentage >= 50
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  Accuracy: {submissionResult.summary.percentage}% ({submissionResult.summary.masteryLevel})
                </span>
                
                {useNegativeMarking && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-850 font-mono text-xs text-slate-400">
                    Negative Penalty Applied (-0.25)
                  </span>
                )}
              </div>

              {/* My Mistakes Alert Banner */}
              {submissionResult.summary.incorrectCount > 0 && (
                <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {submissionResult.summary.incorrectCount} wrong answer{submissionResult.summary.incorrectCount > 1 ? 's' : ''} saved to My Mistakes
                      </p>
                      <p className="text-[11px] text-slate-400">
                        These have been automatically added to your Mistake Notebook so you can practice until mastered.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMode('MY_MISTAKES');
                      handleStartPractice('MY_MISTAKES');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-slate-950 text-xs font-black shrink-0 transition"
                  >
                    Drill Mistakes
                  </button>
                </div>
              )}

              {/* Action Navigation Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleStartPractice()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizState('idle')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition flex items-center gap-2 border border-slate-700"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Change Mode / Practice Hub</span>
                </button>

                <Link
                  href="/curriculum"
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>View Curriculum</span>
                </Link>
              </div>

            </div>

            {/* 2. Topic Performance Section (Crucial Requirement) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-serif-title flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <span>Topic Performance Breakdown</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Accuracy per syllabus topic in this session. Target topics flagged with "Needs Revision".
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {submissionResult.topicPerformance.map((tp, idx) => (
                  <div
                    key={tp.topicId || idx}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                      tp.needsRevision
                        ? 'bg-rose-500/5 border-rose-500/25'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                          [{tp.subjectCode}] Unit {tp.unitNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          tp.needsRevision
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {tp.needsRevision ? 'Needs Revision' : 'Mastered'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {tp.topicTitle}
                      </h4>

                      {/* Accuracy progress bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>{tp.correct} of {tp.total} correct</span>
                          <span className="font-bold text-white">{tp.accuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              tp.accuracy >= 75 ? 'bg-emerald-500' : tp.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${tp.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Direct Action: Understand Topic */}
                    {tp.topicId && tp.topicId !== 'general-topic' && (
                      <Link
                        href={`/academic/topic/${tp.topicId}`}
                        className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Understand Topic</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Detailed Question-by-Question Review with Statutory Explanations */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-serif-title flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Detailed Question-by-Question Review</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review statutory provisions, your answers, model explanations, and add items to your revision deck.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {submissionResult.questionsReview.map((q, idx) => {
                  const isCorrect = q.isCorrect;
                  const isSkipped = q.isSkipped;
                  const hasRevisionToast = revisionToast[q.id];

                  return (
                    <div
                      key={q.id}
                      className={`p-6 sm:p-7 rounded-3xl border space-y-5 transition-all ${
                        isCorrect
                          ? 'bg-slate-900/90 border-emerald-500/20'
                          : isSkipped
                          ? 'bg-slate-900/70 border-slate-800'
                          : 'bg-slate-900/90 border-rose-500/25'
                      }`}
                    >
                      {/* Header Badge */}
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
                              Saved in My Mistakes
                            </span>
                          )}
                        </div>

                        {/* Top-right question tags */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          {q.subject && <span>{q.subject.shortCode || q.subject.title}</span>}
                          {q.topic && <span>&bull; {q.topic.title}</span>}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-1">
                        <h4 className="text-base sm:text-lg font-bold text-white font-serif-title leading-relaxed">
                          {q.questionText}
                        </h4>
                        {q.questionTextGu && (
                          <p className="text-sm font-medium text-amber-200/80 leading-relaxed font-sans">
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
                              {isRightAnswer && (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                              )}
                              {isUserPick && !isCorrect && (
                                <X className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Statutory Explanation */}
                      {q.explanation && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Statutory Legal Reason & Explanation
                          </p>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                          {q.explanationGu && (
                            <p className="text-xs text-amber-200/80 leading-relaxed pt-1 border-t border-slate-850/60 font-sans">
                              {q.explanationGu}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Question Actions: Understand Topic + Add to Revision */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-850">
                        
                        {/* Understand Topic Link */}
                        {q.topic?.id ? (
                          <Link
                            href={`/academic/topic/${q.topic.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Understand Topic: {q.topic.title}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <div />
                        )}

                        {/* Add to Revision CTA */}
                        <div className="flex items-center gap-2">
                          {hasRevisionToast ? (
                            <span className="text-xs font-mono text-emerald-400 font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
                              {hasRevisionToast}
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

          </div>
        )}

      </div>
    </div>
  );
}
