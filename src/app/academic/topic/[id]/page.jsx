"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Layers,
  CheckCircle2,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  Check,
  Clock,
  ListOrdered,
  FileText,
  Scale,
  GraduationCap,
  Lightbulb,
  Languages,
  HelpCircle,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  Tag
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Student action states
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Language display preference: 'ALL' | 'EN' | 'GU'
  const [languageMode, setLanguageMode] = useState('ALL');

  // Interactive MCQ Practice state
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [mcqId]: optionKey }
  const [mcqScore, setMcqScore] = useState(0);

  useEffect(() => {
    if (!topicId) return;
    fetchTopicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  async function fetchTopicData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academic/topic/${topicId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load topic learning system');
      }
      setData(json.topic);
      setIsCompleted(json.topic.isCompleted);
      setIsBookmarked(json.topic.isBookmarked);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Student Action: Mark as completed
  const handleToggleComplete = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    setSavingProgress(true);
    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          isCompleted: nextState,
          action: 'toggleCompletion'
        })
      });
    } catch (err) {
      console.error('Failed to update completion:', err);
      setIsCompleted(!nextState);
    } finally {
      setSavingProgress(false);
    }
  };

  // Student Action: Bookmark
  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          action: 'toggleBookmark'
        })
      });
    } catch (err) {
      console.error('Failed to update bookmark:', err);
      setIsBookmarked(!nextState);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Student Action: Jump to Practice
  const handleScrollToPractice = () => {
    const el = document.getElementById('practice-questions-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Student Action: Jump to Quiz
  const handleScrollToQuiz = () => {
    const el = document.getElementById('mcq-practice-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // MCQ Selection Handler
  const handleSelectOption = (mcqId, optionKey, isCorrect) => {
    if (selectedAnswers[mcqId]) return; // already answered
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqId]: optionKey
    }));
    if (isCorrect) {
      setMcqScore(prev => prev + 1);
    }
  };

  // Reset MCQ Quiz
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setMcqScore(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading comprehensive Topic Learning System...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Topic Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'Unable to retrieve syllabus topic.'}</p>
          <Link
            href="/academic"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Academic Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    topicNumber,
    title,
    unit = {},
    subject = {},
    breadcrumbs = {},
    navigation = {},
    learningSystem = {}
  } = data;

  const {
    overview = {},
    easyExplanation = '',
    gujaratiExplanation = {},
    englishExplanation = {},
    detailedNotes = {},
    importantLegalProvisions = [],
    importantSections = [],
    caseLaws = [],
    examples = [],
    examOrientedExplanation = {},
    modelAnswer = {},
    quickRevision = [],
    importantQuestions = [],
    practiceQuestions = [],
    mcqs = []
  } = learningSystem;

  const currentIndex = navigation?.currentIndex || 1;
  const totalInSubject = navigation?.totalTopicsInSubject || 1;
  const progressPercent = Math.round((currentIndex / totalInSubject) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* 0. Breadcrumbs: University -> Course -> Semester -> Subject -> Unit -> Topic */}
        <AcademicBreadcrumbs
          items={[
            { label: breadcrumbs.university?.name || 'Saurashtra University', href: '/academic' },
            { label: breadcrumbs.course?.name || '3-Year LL.B.', href: '/academic' },
            { label: `Semester ${breadcrumbs.semester?.semesterNumber || 3}`, href: '/academic' },
            { label: `${subject.code} - ${subject.title}`, href: `/academic/subject/${subject.id}` },
            { label: `Unit ${unit.unitNumber}`, href: `/academic/unit/${unit.id}` },
            { label: `Topic ${topicNumber}` }
          ]}
        />

        {/* Topic Header & Main Action Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Top metadata badges & Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold font-mono">
                  TOPIC {topicNumber}
                </span>
                <Link
                  href={`/academic/unit/${unit.id}`}
                  className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:text-amber-400 hover:border-amber-500/40 transition"
                >
                  Unit {unit.unitNumber}: {unit.title}
                </Link>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Syllabus</span>
                </span>
              </div>

              {/* Action Buttons: Bookmark & Share */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                  className={`p-2.5 rounded-xl border transition ${
                    isBookmarked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Bookmarked' : 'Save Bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 fill-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-xl bg-slate-850 border border-slate-750 text-slate-400 hover:text-white transition"
                  title="Copy Topic Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Official Topic Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
                {subject.code} &bull; {subject.title} &bull; 100 Marks CBCS Curriculum
              </p>
            </div>

            {/* Quick Interactive Student Action Bar */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
              {/* Progress Indicator */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  {currentIndex}/{totalInSubject}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Topic {currentIndex} of {totalInSubject}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {progressPercent}% through subject
                  </div>
                </div>
              </div>

              {/* Interactive Student Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Mark as Completed Button */}
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  disabled={savingProgress}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isCompleted
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>

                {/* 2. Start Practice Button */}
                <button
                  type="button"
                  onClick={handleScrollToPractice}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-400" />
                  <span>Start Practice</span>
                </button>

                {/* 3. Start Quiz Button */}
                <button
                  type="button"
                  onClick={handleScrollToQuiz}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>

            {/* Language Switcher Bar: Fast, Accessible Bilingual Toggle */}
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Languages className="w-4 h-4 text-amber-400" />
                <span>Language Mode:</span>
              </div>

              <div className="inline-flex p-1 rounded-xl bg-slate-850 border border-slate-750 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguageMode('ALL')}
                  className={`px-3 py-1 rounded-lg transition ${
                    languageMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bilingual (Both)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode('EN')}
                  className={`px-3 py-1 rounded-lg transition ${
                    languageMode === 'EN'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguageMode('GU')}
                  className={`px-3 py-1 rounded-lg transition ${
                    languageMode === 'GU'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Previous / Next Topic Traversal Bar */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-800/80">
          {navigation?.prevTopic ? (
            <Link
              href={`/academic/topic/${navigation.prevTopic.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  Prev (Unit {navigation.prevTopic.unitNumber})
                </div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.prevTopic.title}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Beginning of subject</div>
          )}

          <Link
            href={`/academic/unit/${unit.id}`}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            Unit Topics
          </Link>

          {navigation?.nextTopic ? (
            <Link
              href={`/academic/topic/${navigation.nextTopic.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">
                  Next (Unit {navigation.nextTopic.unitNumber})
                </div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.nextTopic.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">End of subject</div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 1. TOPIC OVERVIEW */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              1. Topic Overview
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {overview.description}
          </p>

          {/* Verified Syllabus Sub-topics */}
          {overview.subtopics && overview.subtopics.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Official Syllabus Components ({overview.subtopics.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {overview.subtopics.map((st, i) => (
                  <div key={i} className="bg-slate-850/70 border border-slate-750/70 rounded-xl p-3 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {st.orderIndex || i + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{st.title}</div>
                      {st.content && (
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.content}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. EASY EXPLANATION */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-amber-500/5 via-slate-900 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Lightbulb className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              2. Easy Explanation (Simple Concept)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {easyExplanation}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 3. GUJARATI EXPLANATION & 4. ENGLISH EXPLANATION */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 3. Gujarati Explanation */}
          {(languageMode === 'ALL' || languageMode === 'GU') && (
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Languages className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  3. સરળ ગુજરાતી સમજૂતી (Gujarati Explanation)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {gujaratiExplanation.content}
              </p>
              {gujaratiExplanation.keyPointsGu && gujaratiExplanation.keyPointsGu.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    મુખ્ય મુદ્દાઓ:
                  </span>
                  {gujaratiExplanation.keyPointsGu.map((kp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-amber-400 font-bold">&bull;</span>
                      <span>{kp}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 4. English Explanation */}
          {(languageMode === 'ALL' || languageMode === 'EN') && (
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5 text-sky-400">
                <Scale className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  4. English Explanation (Formal Legal Exposition)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {englishExplanation.content}
              </p>
            </section>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. DETAILED NOTES */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              5. Detailed Notes
            </h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
            {detailedNotes.content}
          </div>

          {detailedNotes.keyPoints && detailedNotes.keyPoints.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Core Takeaways
              </h4>
              <div className="space-y-1.5">
                {detailedNotes.keyPoints.map((kp, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 6. IMPORTANT LEGAL PROVISIONS */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-sky-400">
            <Scale className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              6. Important Legal Provisions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {importantLegalProvisions.map((lp, idx) => (
              <div key={idx} className="bg-slate-850 border border-slate-750 rounded-xl p-4 space-y-1">
                <div className="text-xs font-bold text-amber-400">{lp.actName}</div>
                <div className="text-sm font-black text-white">{lp.provision}</div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lp.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. IMPORTANT SECTIONS */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Tag className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              7. Important Sections (Bare Act Citations)
            </h2>
          </div>

          <div className="space-y-3">
            {importantSections.map((sec, idx) => (
              <div key={sec.id || idx} className="bg-slate-850/80 border border-slate-750 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                    {sec.sectionNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {sec.actName}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-100">
                  {sec.title}
                </h3>

                {(languageMode === 'ALL' || languageMode === 'GU') && sec.titleGu && (
                  <div className="text-xs text-amber-300 font-medium">
                    {sec.titleGu}
                  </div>
                )}

                {(languageMode === 'ALL' || languageMode === 'EN') && sec.content && (
                  <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    &quot;{sec.content}&quot;
                  </p>
                )}

                {(languageMode === 'ALL' || languageMode === 'GU') && sec.contentGu && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                    &quot;{sec.contentGu}&quot;
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. CASE LAWS */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <Scale className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              8. Case Laws (Landmark Judicial Precedents)
            </h2>
          </div>

          <div className="space-y-4">
            {caseLaws.map((cs, idx) => (
              <div key={cs.id || idx} className="bg-slate-850/80 border border-slate-750 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[11px] font-bold border border-rose-500/20">
                    {cs.importance || 'LANDMARK PRECEDENT'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {cs.citation} {cs.year ? `(${cs.year})` : ''}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white">
                  {cs.title}
                </h3>

                {cs.bench && (
                  <div className="text-xs text-slate-400">
                    Bench: <strong className="text-slate-300">{cs.bench}</strong> &bull; {cs.court}
                  </div>
                )}

                <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-amber-400">
                    Key Principle: {cs.keyPrinciple}
                  </div>
                  {cs.keyPrincipleGu && (
                    <div className="text-xs text-amber-300/80 font-medium">
                      મુખ્ય સિદ્ધાંત: {cs.keyPrincipleGu}
                    </div>
                  )}
                  {cs.facts && (
                    <div className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Facts: </strong>{cs.facts}
                    </div>
                  )}
                  {cs.ratioDecidendi && (
                    <div className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-800">
                      <strong className="text-emerald-400">Ratio Decidendi: </strong>{cs.ratioDecidendi}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. EXAMPLES */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              9. Examples (Practical Problem Applications)
            </h2>
          </div>

          <div className="space-y-3">
            {examples.map((ex, idx) => (
              <div key={idx} className="bg-slate-850/60 border border-slate-750 rounded-xl p-4 sm:p-5 space-y-2.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{ex.scenarioTitle}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {ex.scenario}
                </p>
                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div><strong className="text-amber-400">Legal Analysis: </strong>{ex.legalAnalysis}</div>
                  <div><strong className="text-emerald-400">Key Takeaway: </strong>{ex.takeaway}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 10. EXAM-ORIENTED EXPLANATION */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sky-400">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                10. Exam-Oriented Explanation
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold">
              {examOrientedExplanation.relevanceHeader || 'High Relevance'}
            </span>
          </div>

          <p className="text-xs text-slate-400 italic">
            {examOrientedExplanation.disclaimer}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Scoring Tips */}
            <div className="bg-slate-850/80 border border-slate-750 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                Scoring Guidelines
              </h3>
              <div className="space-y-1.5">
                {examOrientedExplanation.scoringTips?.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mistakes to Avoid */}
            <div className="bg-slate-850/80 border border-slate-750 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase text-rose-400 tracking-wider">
                Common Mistakes to Avoid
              </h3>
              <div className="space-y-1.5">
                {examOrientedExplanation.commonMistakesToAvoid?.map((mst, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                    <span>{mst}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 11. MODEL EXAM ANSWER */}
        {/* ========================================================================= */}
        <section className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <GraduationCap className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Official University Blueprint</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                11. Model Exam Answer
              </h2>
            </div>

            {/* Required Badges: Expected Marks, Answer Type, Preparation Priority */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                {modelAnswer.expectedMarks || '14 Marks'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs">
                {modelAnswer.answerType || 'Long Essay'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs">
                Priority: {modelAnswer.preparationPriority || 'HIGH'}
              </span>
            </div>
          </div>

          {/* Structured 8-Part Model Answer */}
          <div className="space-y-5">
            {/* Part 1: Introduction */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>Part I: Introduction</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/50 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.introduction}
              </p>
            </div>

            {/* Part 2: Definition */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>Part II: Statutory Definition</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-850/80 p-4 rounded-xl border border-amber-500/20 font-sans">
                {modelAnswer.definition}
              </p>
            </div>

            {/* Part 3: Legal Provision */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span>Part III: Legal Provision & Statutory Backing</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/50 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.legalProvision}
              </p>
            </div>

            {/* Part 4: Essential Elements */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>Part IV: Essential Elements</span>
              </h3>
              <div className="bg-slate-850/50 p-4 rounded-xl border border-slate-800 space-y-2">
                {modelAnswer.essentialElements?.map((el, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{el}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part 5: Detailed Explanation */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>Part V: Detailed Explanation</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/50 p-4 rounded-xl border border-slate-800 font-sans whitespace-pre-line">
                {modelAnswer.detailedExplanation}
              </p>
            </div>

            {/* Part 6: Case Law */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span>Part VI: Landmark Case Law</span>
              </h3>
              <div className="bg-rose-950/10 border border-rose-800/30 p-4 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
                {modelAnswer.caseLaw}
              </div>
            </div>

            {/* Part 7: Example */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>Part VII: Practical Example</span>
              </h3>
              <div className="bg-amber-950/10 border border-amber-800/30 p-4 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                {modelAnswer.example}
              </div>
            </div>

            {/* Part 8: Conclusion */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>Part VIII: Conclusion</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/50 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.conclusion}
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 12. QUICK REVISION */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              12. Quick Revision (Key Memory Bullets)
            </h2>
          </div>

          <div className="space-y-2">
            {quickRevision.map((point, idx) => (
              <div key={idx} className="bg-slate-850/70 border border-slate-750/70 rounded-xl p-3 flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 13. IMPORTANT QUESTIONS */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5 text-sky-400">
              <HelpCircle className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                13. Important Questions (Evidence-Based Syllabus Priority)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 italic">
              Evidence-based priority &bull; No predictive guarantees
            </span>
          </div>

          <div className="space-y-4">
            {importantQuestions.map((q, idx) => {
              const priorityClass = 
                q.priority_label === 'Very High Priority'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : q.priority_label === 'High Priority'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : q.priority_label === 'Important'
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300';

              return (
                <div key={q.id || idx} className="bg-slate-850/80 border border-slate-750 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Marks */}
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        {q.marks || 14} Marks
                      </span>

                      {/* Evidence Priority Badge */}
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${priorityClass}`}>
                        {q.priority_label || 'Practice'}
                      </span>

                      {/* Score */}
                      {q.priority_score > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                          Score: {q.priority_score}/100
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-slate-400 font-semibold">
                      {q.questionType || 'DESCRIPTIVE'} &bull; Difficulty: {q.difficulty}
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-slate-100">
                    {q.questionText}
                  </div>

                  {(languageMode === 'ALL' || languageMode === 'GU') && q.questionTextGu && (
                    <div className="text-xs text-amber-300 font-medium">
                      {q.questionTextGu}
                    </div>
                  )}

                  {/* Why this is important explanation */}
                  {q.why_important && (
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 flex items-start gap-2 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 mr-1.5">Why this is important:</span>
                        <span className="text-slate-300">{q.why_important}</span>
                      </div>
                    </div>
                  )}

                  {/* Link to Model Answer */}
                  {q.id && !q.id.startsWith('temp') && (
                    <div className="pt-1 flex items-center justify-end">
                      <Link
                        href={`/question-bank/${q.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                      >
                        <span>View 9-Part Model Answer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic text-center pt-2">
            Priority scores reflect historical past paper frequency and core syllabus weight. LowStudy does not predict upcoming examination questions.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 14. PRACTICE QUESTIONS */}
        {/* ========================================================================= */}
        <section id="practice-questions-section" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              14. Practice Questions (Self-Assessment & Problem Solving)
            </h2>
          </div>

          <div className="space-y-3">
            {practiceQuestions.map((pq, idx) => (
              <div key={pq.id || idx} className="bg-slate-850/80 border border-slate-750 rounded-xl p-4 sm:p-5 space-y-2.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{pq.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {pq.problem}
                </p>
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-emerald-400">Recommended Analytical Approach: </strong>
                  {pq.approachGuide}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 15. MCQ PRACTICE */}
        {/* ========================================================================= */}
        <section id="mcq-practice-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <GraduationCap className="w-6 h-6" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  15. MCQ Practice (Interactive Quiz)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Test your grasp of this topic with instant feedback & verified explanations.
                </p>
              </div>
            </div>

            {/* Score and Reset */}
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                Score: {mcqScore} / {mcqs.length}
              </span>
              <button
                type="button"
                onClick={handleResetQuiz}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {mcqs.map((mcq, qIndex) => {
              const selectedKey = selectedAnswers[mcq.id];
              const isAnswered = !!selectedKey;

              return (
                <div key={mcq.id || qIndex} className="bg-slate-850/70 border border-slate-750/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Q{qIndex + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm sm:text-base font-bold text-white leading-snug">
                        {mcq.questionText}
                      </div>
                      {(languageMode === 'ALL' || languageMode === 'GU') && mcq.questionTextGu && (
                        <div className="text-xs text-amber-300 font-medium">
                          {mcq.questionTextGu}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {mcq.options.map((opt) => {
                      const isThisSelected = selectedKey === opt.key;
                      let buttonStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-850';

                      if (isAnswered) {
                        if (opt.isCorrect) {
                          buttonStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                        } else if (isThisSelected && !opt.isCorrect) {
                          buttonStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                        } else {
                          buttonStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(mcq.id, opt.key, opt.isCorrect)}
                          className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 text-xs sm:text-sm ${buttonStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                              {opt.key}
                            </span>
                            <span className="font-medium">{opt.text}</span>
                          </div>

                          {isAnswered && (
                            opt.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : isThisSelected ? (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : null
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Instant Explanation Box revealed upon answering */}
                  {isAnswered && mcq.explanation && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 leading-relaxed space-y-1">
                      <div className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Statutory Explanation:</span>
                      </div>
                      <p>{mcq.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Previous / Next Topic Traversal Bar at bottom */}
        <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-800/80">
          {navigation?.prevTopic ? (
            <Link
              href={`/academic/topic/${navigation.prevTopic.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Previous Topic</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.prevTopic.title}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Beginning of subject</div>
          )}

          {navigation?.nextTopic ? (
            <Link
              href={`/academic/topic/${navigation.nextTopic.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Next Topic</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.nextTopic.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">End of subject</div>
          )}
        </div>

      </div>
    </div>
  );
}
