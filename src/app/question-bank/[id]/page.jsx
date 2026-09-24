"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
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
  Scale,
  Sparkles,
  FileText,
  AlertCircle,
  Check,
  Share2,
  Flag,
  RotateCcw,
  X,
  HelpCircle,
  Lightbulb,
  Building,
  Calendar,
  Layers,
  ListOrdered,
  GraduationCap,
  PenTool
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Student Actions State
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPracticed, setIsPracticed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('INCORRECT_CITATION');
  const [reportNotes, setReportNotes] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    if (!questionId) return;
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  async function fetchQuestion() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/questions/${questionId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load question details');
      }
      setData(json.question);
      setIsBookmarked(json.question.isBookmarked);
      setIsPracticed(json.question.isPracticed);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Action: Bookmark Toggle
  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'QUESTION',
          topicId: questionId,
          action: 'toggleBookmark'
        })
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setIsBookmarked(!nextState);
    }
  };

  // Action: Mark as Practiced Toggle
  const handleTogglePracticed = async () => {
    const nextState = !isPracticed;
    setIsPracticed(nextState);
    try {
      await fetch('/api/questions/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
    } catch (err) {
      console.error('Failed to toggle practiced status:', err);
      setIsPracticed(!nextState);
    }
  };

  // Action: Copy Question Link
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Action: Submit Content Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/questions/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          issueType: reportIssueType,
          notes: reportNotes
        })
      });
      if (res.ok) {
        setReportSubmitted(true);
        setTimeout(() => {
          setReportSubmitted(false);
          setReportModalOpen(false);
          setReportNotes('');
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading model answer and examination blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Question Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'Unable to retrieve question details.'}</p>
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Question Bank</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    questionText,
    questionTextGu,
    marks,
    difficulty,
    priority,
    priority_label,
    priority_score,
    previous_year_count,
    years_asked = [],
    syllabus_weight,
    legal_importance,
    why_important,
    isManualPriority,
    formatStyle,
    isPYQ,
    pyqInfo,
    topic = {},
    unit = {},
    subject = {},
    modelAnswer = {},
    relevantSections = [],
    relevantCaseLaws = [],
    quickPoints = [],
    examAnswerStructure = '',
    navigation = {}
  } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">

        {/* 1. Breadcrumbs */}
        <AcademicBreadcrumbs
          items={[
            { label: 'Question Bank', href: '/question-bank' },
            { label: `${subject.code} - ${subject.title}`, href: `/academic/subject/${subject.id}` },
            { label: `Unit ${unit.unitNumber}`, href: `/academic/unit/${unit.id}` },
            { label: `Topic ${topic.topicNumber}`, href: `/academic/topic/${topic.id}` },
            { label: `${marks} Marks Question` }
          ]}
        />

        {/* 2. Main Question Card & Source Badge */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badges */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono">
                {marks} MARKS
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs">
                {formatStyle}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-850 border border-slate-750 text-slate-400 text-xs">
                Difficulty: {difficulty}
              </span>
              <span className={`px-3 py-1 rounded-xl font-bold text-xs border ${
                priority_label === 'Very High Priority'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  : priority_label === 'High Priority'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : priority_label === 'Important'
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                {priority_label || 'Practice'}
              </span>
              {priority_score > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-750 text-[11px] font-mono text-slate-400">
                  Score: {priority_score}/100
                </span>
              )}
            </div>

            {/* Clear Source Distinction */}
            {isPYQ ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <span>🏛️ Authentic Previous Year Question</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium">
                <span>✍️ Original Practice Question</span>
              </div>
            )}
          </div>

          {/* Question Statement */}
          <div className="relative z-10 space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-snug">
              {questionText}
            </h1>
            {questionTextGu && (
              <p className="text-sm sm:text-base text-amber-300/90 font-medium leading-relaxed">
                {questionTextGu}
              </p>
            )}
          </div>

          {/* Authentic PYQ Details Box if genuine Previous Year Paper */}
          {isPYQ && pyqInfo && (
            <div className="relative z-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Building className="w-4 h-4" />
                <span>{pyqInfo.university}</span>
              </div>
              <div className="text-slate-300">
                Exam: <strong className="text-white">{pyqInfo.examSession} {pyqInfo.examYear}</strong> &bull; Paper Code: <span className="font-mono text-amber-400">{pyqInfo.paperCode}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold">
                {pyqInfo.sectionName} &bull; {pyqInfo.questionNumber}
              </div>
            </div>
          )}

          {/* Evidence-Based Priority & Why This is Important Card */}
          <div className="relative z-10 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Evidence-Based Preparation Priority: {priority_label || 'Practice'}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono text-xs border border-amber-500/20">
                Composite Score: {priority_score || 0}/100
              </span>
            </div>

            {why_important && (
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Why this is important:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {why_important}
                </p>
              </div>
            )}

            {/* Factor Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Previous Years</span>
                <strong className="text-white font-mono">
                  {years_asked && years_asked.length > 0 ? years_asked.join(', ') : (previous_year_count > 0 ? `${previous_year_count} times` : 'None')}
                </strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Syllabus Weight</span>
                <strong className="text-emerald-400 font-mono">
                  {syllabus_weight ? `${syllabus_weight}x Core` : '1.0x Standard'}
                </strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Legal Importance</span>
                <strong className="text-sky-400 font-mono">
                  {legal_importance ? `${legal_importance}x Doctrine` : '1.0x Standard'}
                </strong>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Classification</span>
                <strong className="text-amber-400">
                  {isManualPriority ? 'Admin Curated' : 'Evidence Calculated'}
                </strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic pt-1 text-center">
              Evidence-based educational classification derived from syllabus weight and verified past exam papers. LowStudy does not predict or guarantee upcoming examination questions.
            </p>
          </div>

          {/* Interactive Student Action Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {/* Left: Bookmark & Practiced */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                  isBookmarked
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-750 text-slate-400 hover:text-white'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                type="button"
                onClick={handleTogglePracticed}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                  isPracticed
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-750 text-slate-400 hover:text-white'
                }`}
              >
                {isPracticed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                <span>{isPracticed ? 'Marked as Practiced' : 'Mark as Practiced'}</span>
              </button>

              <Link
                href={`/question-bank/${questionId}/practice`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Practice Answer Writing</span>
              </Link>
            </div>

            {/* Right: Copy & Report Content */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-slate-800 border border-slate-750 text-slate-400 hover:text-white transition"
                title="Copy Question Link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-750 hover:border-rose-800/40 text-xs font-medium transition"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report Content</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Linear Previous / Next Question Navigation */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-800/80">
          {navigation?.prevQuestion ? (
            <Link
              href={`/question-bank/${navigation.prevQuestion.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Previous Question ({navigation.prevQuestion.marks}M)</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.prevQuestion.questionText}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">First question in subject</div>
          )}

          <Link
            href="/question-bank"
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            All Questions
          </Link>

          {navigation?.nextQuestion ? (
            <Link
              href={`/question-bank/${navigation.nextQuestion.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Next Question ({navigation.nextQuestion.marks}M)</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.nextQuestion.questionText}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Last question in subject</div>
          )}
        </div>

        {/* 4. Complete 9-Part Model Answer */}
        <div className="bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <GraduationCap className="w-6 h-6" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Model Examination Answer
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard 9-part university examination presentation format.
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs self-start sm:self-auto">
              {marks} Marks Standard
            </span>
          </div>

          {/* Structured 9-Part Answer Sections */}
          <div className="space-y-6">
            
            {/* 1. Introduction */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>1. Introduction</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/60 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.introduction}
              </p>
            </div>

            {/* 2. Definition */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>2. Definition</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-850/80 p-4 rounded-xl border border-amber-500/20 font-sans">
                {modelAnswer.definition}
              </p>
            </div>

            {/* 3. Relevant Law */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span>3. Relevant Law</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/60 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.relevantLaw}
              </p>
            </div>

            {/* 4. Legal Provision */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                <span>4. Legal Provision</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/60 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.legalProvision}
              </p>
            </div>

            {/* 5. Main Points */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>5. Main Points</span>
              </h3>
              <div className="bg-slate-850/60 p-4 rounded-xl border border-slate-800 space-y-2">
                {modelAnswer.mainPoints?.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Explanation */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>6. Explanation</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/60 p-4 rounded-xl border border-slate-800 font-sans whitespace-pre-line">
                {modelAnswer.explanation}
              </p>
            </div>

            {/* 7. Case Law */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <span>7. Case Law</span>
              </h3>
              <div className="bg-rose-950/10 border border-rose-800/30 p-4 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
                {modelAnswer.caseLaw}
              </div>
            </div>

            {/* 8. Example */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span>8. Example</span>
              </h3>
              <div className="bg-amber-950/10 border border-amber-800/30 p-4 rounded-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
                {modelAnswer.example}
              </div>
            </div>

            {/* 9. Conclusion */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>9. Conclusion</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-850/60 p-4 rounded-xl border border-slate-800 font-sans">
                {modelAnswer.conclusion}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Relevant Sections & Case Laws */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Relevant Sections */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>Relevant Sections</span>
            </h3>
            {relevantSections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {relevantSections.map((sec, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-slate-850 border border-slate-750 text-amber-400 font-mono text-xs font-bold">
                    {sec}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Applicable statutory sections cited in Model Answer.</p>
            )}
          </div>

          {/* Relevant Case Laws */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Relevant Case Laws</span>
            </h3>
            {relevantCaseLaws.length > 0 ? (
              <div className="space-y-1.5">
                {relevantCaseLaws.map((cl, idx) => (
                  <div key={idx} className="text-xs text-slate-200 bg-slate-850 p-2.5 rounded-lg border border-slate-750">
                    {cl}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Binding judicial precedents cited in Section 7.</p>
            )}
          </div>
        </div>

        {/* 6. Quick Points & Exam Answer Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quick Points */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Quick Points (Memory Aid)</span>
            </h3>
            <div className="space-y-1.5">
              {quickPoints.map((qp, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span>{qp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Answer Structure */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              <span>Exam Answer Structure</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-850 p-3 rounded-xl border border-slate-750">
              {examAnswerStructure}
            </p>
          </div>
        </div>

        {/* 7. Bottom Traversal Navigation */}
        <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-800/80">
          {navigation?.prevQuestion ? (
            <Link
              href={`/question-bank/${navigation.prevQuestion.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Previous Question ({navigation.prevQuestion.marks}M)</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.prevQuestion.questionText}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">First question in subject</div>
          )}

          {navigation?.nextQuestion ? (
            <Link
              href={`/question-bank/${navigation.nextQuestion.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Next Question ({navigation.nextQuestion.marks}M)</div>
                <div className="truncate max-w-[130px] sm:max-w-xs">{navigation.nextQuestion.questionText}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Last question in subject</div>
          )}
        </div>

        {/* 8. Report Incorrect Content Modal */}
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Flag className="w-4 h-4 text-rose-400" />
                  <span>Report Incorrect Content</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">Report Submitted</h4>
                  <p className="text-xs text-slate-400">
                    Thank you! Our academic review team will inspect this question.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Issue Category</label>
                    <select
                      value={reportIssueType}
                      onChange={(e) => setReportIssueType(e.target.value)}
                      className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200"
                    >
                      <option value="INCORRECT_CITATION">Incorrect Statutory Section / Case Citation</option>
                      <option value="OUTDATED_LAW">Outdated Law (needs BNS/BNSS/BSA update)</option>
                      <option value="FACTUAL_ERROR">Factual / Typographical Error</option>
                      <option value="INCOMPLETE_ANSWER">Incomplete Model Answer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Details / Proposed Correction</label>
                    <textarea
                      rows={4}
                      value={reportNotes}
                      onChange={(e) => setReportNotes(e.target.value)}
                      required
                      placeholder="Describe the issue or suggest the correct legal provision..."
                      className="w-full bg-slate-850 border border-slate-750 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportModalOpen(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-750"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReport}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {submittingReport ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
