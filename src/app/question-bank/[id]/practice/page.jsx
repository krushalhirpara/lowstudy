"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Scale,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Clock,
  PenTool,
  Save,
  Check,
  X,
  FileText,
  HelpCircle,
  Eye,
  Award,
  Layers,
  Info,
  ListOrdered,
  Building,
  Flag,
  Copy
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';

const STRUCTURE_PARTS = [
  { num: 1, label: 'Introduction', hint: 'Context, doctrine origin & general background' },
  { num: 2, label: 'Definition', hint: 'Statutory definition or authoritative judicial meaning' },
  { num: 3, label: 'Legal Provision', hint: 'Name of governing Act & relevant Sections' },
  { num: 4, label: 'Essential Elements', hint: 'Core ingredients, conditions or tests required' },
  { num: 5, label: 'Explanation', hint: 'Substantive legal analysis and principle reasoning' },
  { num: 6, label: 'Landmark Case Laws', hint: 'Precedent citations, ratio decidendi & court rulings' },
  { num: 7, label: 'Illustrations / Examples', hint: 'Factual or hypothetical practical application' },
  { num: 8, label: 'Exceptions / Qualifications', hint: 'Statutory exceptions or defense clauses' },
  { num: 9, label: 'Conclusion', hint: 'Synthesizing summary and contemporary legal trend' }
];

export default function ExamAnswerPracticePage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.id;

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student Writing Workspace State
  const [studentAnswer, setStudentAnswer] = useState('');
  const [timeSpentSecs, setTimeSpentSecs] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [structureGuideOpen, setStructureGuideOpen] = useState(false);

  // Evaluation & Feedback State
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modelAnswerModalOpen, setModelAnswerModalOpen] = useState(false);
  const [modelAnswerData, setModelAnswerData] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [historyAttempts, setHistoryAttempts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Timer reference
  const timerRef = useRef(null);

  // Load question and previous practice attempts
  useEffect(() => {
    if (!questionId) return;
    loadQuestionData();
    loadPracticeHistory();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questionId]);

  // Stopwatch
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeSpentSecs(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const loadQuestionData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/questions/${questionId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load question');
      setQuestion(json.question);
      setModelAnswerData(json.question.modelAnswer);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeHistory = async () => {
    try {
      const res = await fetch(`/api/questions/${questionId}/practice?userId=usr-student-01`);
      const json = await res.json();
      if (json.success && Array.isArray(json.history)) {
        setHistoryAttempts(json.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const wordCount = studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).filter(Boolean).length : 0;

  // Submit Answer for AI Practice Feedback
  const handleSubmitEvaluation = async () => {
    if (!studentAnswer.trim()) {
      alert('Please write an answer before requesting feedback.');
      return;
    }

    try {
      setEvaluating(true);
      setIsTimerRunning(false);
      const res = await fetch(`/api/questions/${questionId}/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-student-01',
          studentAnswer,
          timeSpentSecs,
          saveAttempt: true
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to generate feedback');

      setFeedback(json.evaluation);
      setSavedSuccess(true);
      loadPracticeHistory();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  // Action: Retry (keeps student text so they can revise and re-evaluate)
  const handleRetry = () => {
    setFeedback(null);
    setSavedSuccess(false);
    setIsTimerRunning(true);
  };

  // Action: Practice Again (fresh workspace)
  const handlePracticeAgain = () => {
    if (studentAnswer.trim() && !feedback) {
      if (!confirm('Start a fresh answer? Your unsaved draft will be cleared.')) return;
    }
    setStudentAnswer('');
    setTimeSpentSecs(0);
    setFeedback(null);
    setSavedSuccess(false);
    setIsTimerRunning(true);
  };

  // Action: Save Answer manually
  const handleSaveAnswer = async () => {
    if (!studentAnswer.trim()) return;
    try {
      await fetch(`/api/questions/${questionId}/practice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-student-01',
          studentAnswer,
          timeSpentSecs,
          saveAttempt: true
        })
      });
      setSavedSuccess(true);
      loadPracticeHistory();
      alert('Your written answer and feedback have been saved to your practice log.');
    } catch (err) {
      console.error(err);
      alert('Failed to save answer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-poppins">
        <div className="text-center space-y-3">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
          <p className="text-sm text-slate-400 font-mono">Loading exam writing workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-poppins flex items-center justify-center">
        <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Question Not Found</h2>
          <p className="text-xs text-slate-400">{error || 'Could not load question details.'}</p>
          <Link
            href="/question-bank"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Question Bank
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins pb-20">
      
      {/* 1. Header Navigation & Sticky Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href={`/question-bank/${question.id}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Back to Question View"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-amber-400 uppercase">
                  [{question.subject.code}]
                </span>
                <span className="text-slate-400">
                  Unit {question.unit.unitNumber} &bull; Topic {question.topic.topicNumber}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white font-serif-title truncate max-w-md sm:max-w-xl">
                Exam Answer Writing Practice
              </h1>
            </div>
          </div>

          {/* Live Counters: Stopwatch & Word Count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <Clock className={`w-3.5 h-3.5 ${isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-200 font-bold">{formatTime(timeSpentSecs)}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">Words: </span>
              <span className={`font-bold ${wordCount >= (question.marks >= 10 ? 180 : 80) ? 'text-emerald-400' : 'text-amber-400'}`}>
                {wordCount}
              </span>
              <span className="text-slate-500 text-[10px]"> / {question.marks >= 10 ? '180+' : '80+'}</span>
            </div>

            {historyAttempts.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                History ({historyAttempts.length})
              </button>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 2. Compliance Disclaimer Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Educational Self-Assessment Notice:</strong> This interactive workspace generates 
            <span className="font-bold text-amber-300"> AI Practice Feedback</span> to help you structure legal arguments. 
            This is <em>not official university marking</em>, and makes no claim or guarantee of specific examination marks.
          </p>
        </div>

        {/* 3. Question Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black">
                {question.marks} MARKS
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 font-semibold">
                {question.formatStyle || question.questionType}
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400">
                Difficulty: {question.difficulty}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
                {question.priority_label || 'Practice'}
              </span>
            </div>

            {question.isPYQ ? (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold flex items-center gap-1.5">
                🏛️ Authentic Previous Year Question
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                ✍️ Original Practice Question
              </span>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif-title leading-snug">
              {question.questionText}
            </h2>
            {question.questionTextGu && (
              <p className="text-sm sm:text-base text-amber-300/90 font-gujarati font-medium">
                {question.questionTextGu}
              </p>
            )}
          </div>

          {/* Quick toggle for 9-Part Structure Guide */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setStructureGuideOpen(!structureGuideOpen)}
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-mono transition"
            >
              <ListOrdered className="w-4 h-4 text-amber-400" />
              <span>{structureGuideOpen ? 'Hide Structure Guide' : 'Show 9-Part Exam Answer Structure Guide'}</span>
            </button>

            <button
              onClick={() => setModelAnswerModalOpen(true)}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Verified Model Answer</span>
            </button>
          </div>

          {/* Collapsible 9-Part Structure Guide */}
          {structureGuideOpen && (
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 pt-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Standard Law University 9-Part Structure
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {STRUCTURE_PARTS.map((part) => (
                  <div key={part.num} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                    <div className="font-bold text-amber-400 font-mono">
                      {part.num}. {part.label}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">
                      {part.hint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Past Practice History Drawer (if requested) */}
        {showHistory && historyAttempts.length > 0 && (
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Your Past Practice Attempts for this Question
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {historyAttempts.map((att, idx) => (
                <div key={att.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-white">
                      Attempt #{historyAttempts.length - idx} &bull; {att.wordCount} words
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {new Date(att.createdAt).toLocaleDateString()} &bull; {formatTime(att.timeSpentSecs)} spent
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setStudentAnswer(att.studentAnswer);
                        if (att.evaluation) setFeedback(att.evaluation);
                        setShowHistory(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                    >
                      Load Answer & Feedback
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Writing Workspace OR Evaluation Feedback */}
        {!feedback ? (
          /* WRITING WORKSPACE */
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Draft Your Exam Answer Below
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Target: {question.marks} Marks ({question.marks >= 10 ? 'Long Answer' : 'Short Note'})
              </div>
            </div>

            <div className="relative">
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Structure your answer here:&#10;&#10;1. Introduction & Background&#10;2. Statutory Definition&#10;3. Relevant Statutory Provision (Act & Sections)&#10;4. Essential Elements / Core Tests&#10;5. Substantive Legal Analysis&#10;6. Landmark Judicial Precedents (Ratio Decidendi)&#10;7. Practical Illustration / Example&#10;8. Concluding Synthesis..."
                rows={16}
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-500 rounded-2xl p-5 text-sm sm:text-base text-slate-100 placeholder:text-slate-600 focus:outline-none transition leading-relaxed font-sans resize-y"
              />
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition"
                >
                  {isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear your current answer?')) {
                      setStudentAnswer('');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-rose-300 transition"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmitEvaluation}
                  disabled={evaluating || !studentAnswer.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${evaluating ? 'animate-spin' : ''}`} />
                  <span>{evaluating ? 'Evaluating Answer...' : 'Submit for AI Practice Feedback'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* AI PRACTICE FEEDBACK VIEW                                         */
          /* ================================================================= */
          <div className="space-y-6">
            
            {/* Feedback Header Banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 w-max">
                    <Sparkles className="w-3.5 h-3.5" />
                    {feedback.feedbackTitle || 'AI Practice Feedback'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-serif-title">
                    Practice Evaluation & Answer Analysis
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Word Count</span>
                    <span className="text-sm font-mono font-bold text-white">{feedback.metrics?.wordCount} words</span>
                  </div>
                  <div className="text-right px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Time Taken</span>
                    <span className="text-sm font-mono font-bold text-amber-400">{formatTime(feedback.metrics?.timeSpentSecs || timeSpentSecs)}</span>
                  </div>
                </div>
              </div>

              {/* Explicit Non-Official Marking Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {feedback.disclaimer}
                </p>
              </div>

              {/* 4 ACTION BUTTONS REQUIRED: Save Answer, Retry, View Model Answer, Practice Again */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Action 1: Save Answer */}
                  <button
                    onClick={handleSaveAnswer}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Save Answer</span>
                  </button>

                  {/* Action 2: Retry */}
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry / Edit Answer</span>
                  </button>

                  {/* Action 3: View Model Answer */}
                  <button
                    onClick={() => setModelAnswerModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-xs font-bold text-blue-300 border border-blue-500/30 transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Model Answer</span>
                  </button>
                </div>

                {/* Action 4: Practice Again */}
                <button
                  onClick={handlePracticeAgain}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5 text-amber-400" />
                  <span>Practice Again</span>
                </button>
              </div>
            </div>

            {/* Flagged Unverified Citations Alert Box (if any) */}
            {feedback.flaggedUnverifiedLegalInfo && feedback.flaggedUnverifiedLegalInfo.length > 0 && (
              <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm font-mono">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Unverified Legal Information Flagged</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feedback.unverifiedFlagNote}
                </p>
                <div className="space-y-2">
                  {feedback.flaggedUnverifiedLegalInfo.map((flag, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/20 text-xs text-rose-200">
                      <strong>Notice:</strong> {flag.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10 Diagnostic Checks Grid */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  10-Point Legal Criteria Diagnostic Check
                </h4>
                <span className="text-xs font-mono text-slate-400">
                  Evaluated against verified syllabus model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {feedback.diagnosticChecks?.map((check) => {
                  const isIdentified = check.status === 'IDENTIFIED';
                  const isPartial = check.status === 'PARTIAL';
                  return (
                    <div
                      key={check.dimension}
                      className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                        isIdentified
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : isPartial
                          ? 'bg-amber-500/5 border-amber-500/20'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isIdentified ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isPartial ? (
                          <Info className="w-4 h-4 text-amber-400" />
                        ) : (
                          <X className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white">{check.dimension}</span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              isIdentified
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isPartial
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {check.observation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* THE 3 DETAILED SECTIONS: What was done well, What is missing, What should be improved */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Section 1: What was done well */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/25 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono pb-2 border-b border-slate-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What Was Done Well</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {feedback.feedback?.whatWasDoneWell?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2: What is missing */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/25 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-mono pb-2 border-b border-slate-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>What Is Missing</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {feedback.feedback?.whatIsMissing?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3: What should be improved */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/25 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm font-mono pb-2 border-b border-slate-800">
                  <Sparkles className="w-4 h-4" />
                  <span>What Should Be Improved</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {feedback.feedback?.whatShouldBeImproved?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold mt-0.5">&bull;</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Student's Written Answer (collapsible / readable) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Your Submitted Answer
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(studentAnswer);
                    alert('Answer copied to clipboard');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {studentAnswer}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 6. VERIFIED MODEL ANSWER MODAL / DRAWER                             */}
      {/* =================================================================== */}
      {modelAnswerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-serif-title">
                  Verified 9-Part Model Answer
                </h3>
              </div>
              <button
                onClick={() => setModelAnswerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-200 leading-relaxed scrollbar-thin">
              
              {/* Question summary inside modal */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  {question.marks} Marks &bull; {question.subject.title}
                </div>
                <div className="font-bold text-white">{question.questionText}</div>
              </div>

              {/* 9 Standard Parts */}
              {modelAnswerData ? (
                <div className="space-y-4">
                  {modelAnswerData.introduction && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">1. Introduction</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{modelAnswerData.introduction}</p>
                    </div>
                  )}

                  {modelAnswerData.definition && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">2. Definition</h4>
                      <div className="p-3 rounded-xl bg-slate-950 border-l-2 border-amber-400 text-xs text-slate-200 italic">
                        {modelAnswerData.definition}
                      </div>
                    </div>
                  )}

                  {modelAnswerData.legalProvision && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">3. Relevant Law & Legal Provision</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{modelAnswerData.legalProvision}</p>
                    </div>
                  )}

                  {modelAnswerData.mainPoints && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">4. Essential Elements / Main Points</h4>
                      {Array.isArray(modelAnswerData.mainPoints) ? (
                        <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                          {modelAnswerData.mainPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-300">{modelAnswerData.mainPoints}</p>
                      )}
                    </div>
                  )}

                  {modelAnswerData.explanation && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">5. Explanation & Analysis</h4>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{modelAnswerData.explanation}</p>
                    </div>
                  )}

                  {modelAnswerData.caseLaw && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">6. Landmark Case Law</h4>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono">
                        {modelAnswerData.caseLaw}
                      </div>
                    </div>
                  )}

                  {modelAnswerData.example && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">7. Practical Example</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{modelAnswerData.example}</p>
                    </div>
                  )}

                  {modelAnswerData.conclusion && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono">8. Conclusion</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{modelAnswerData.conclusion}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Info className="w-6 h-6 mx-auto text-amber-400" />
                  <p>Model answer details available in Question Bank view.</p>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setModelAnswerModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                Close Model Answer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
