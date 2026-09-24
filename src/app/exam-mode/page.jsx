"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Award,
  BookMarked,
  Timer,
  FileText,
  HelpCircle,
  Scale,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Zap,
  Eye,
  PenTool,
  Check,
  Building,
  Target
} from 'lucide-react';

const MODULE_TABS = [
  { id: 'QUICK_REVISION', label: 'Quick Revision', icon: Zap, countKey: 'quickRevision' },
  { id: 'IMPORTANT_QUESTIONS', label: 'Important Questions', icon: HelpCircle, countKey: 'importantQuestions' },
  { id: 'IMPORTANT_SECTIONS', label: 'Important Sections', icon: FileText, countKey: 'importantSections' },
  { id: 'IMPORTANT_CASE_LAWS', label: 'Important Case Laws', icon: Scale, countKey: 'importantCaseLaws' },
  { id: 'PREVIOUS_PAPERS', label: 'Previous Papers', icon: Building, countKey: 'previousPapers' },
  { id: 'MOCK_TESTS', label: 'Mock Tests', icon: Timer, countKey: 'mockTests' }
];

const HORIZON_TABS = [
  { id: 'THREE_DAY', label: '3-Day Revision', days: 3, subtitle: 'Urgent Weak Topics & PYQ Triage' },
  { id: 'SEVEN_DAY', label: '7-Day Revision', days: 7, subtitle: '1-Week Balanced Syllabus Sprint' },
  { id: 'FIFTEEN_DAY', label: '15-Day Revision', days: 15, subtitle: 'Comprehensive Master Exam Coverage' }
];

const PRIORITY_BADGES = {
  1: { label: '1. Weak Topic', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  2: { label: '2. Important Topic', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  3: { label: '3. PYQ Relevant', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  4: { label: '4. Uncompleted Topic', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  5: { label: '5. Spaced Revision', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  6: { label: '6. Mock Test', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
};

export default function ExamModePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Horizon & Day
  const [selectedHorizon, setSelectedHorizon] = useState('SEVEN_DAY');
  const [activeDayNumber, setActiveDayNumber] = useState(1);
  const [revisionSchedule, setRevisionSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Active Module View
  const [activeModuleTab, setActiveModuleTab] = useState('QUICK_REVISION');

  useEffect(() => {
    fetchExamModeData();
  }, []);

  const fetchExamModeData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/exam-mode?userId=usr-student-01');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load Exam Mode data');
      setData(json.data);
      setRevisionSchedule(json.data.revisionSchedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchHorizon = async (horizonId) => {
    setSelectedHorizon(horizonId);
    setActiveDayNumber(1);
    try {
      setScheduleLoading(true);
      const res = await fetch('/api/exam-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'usr-student-01', horizon: horizonId })
      });
      const json = await res.json();
      if (json.success && json.schedule) {
        setRevisionSchedule(json.schedule);
      }
    } catch (err) {
      console.error('Failed to switch horizon:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-poppins">
        <div className="text-center space-y-3">
          <Flame className="w-10 h-10 text-amber-500 animate-pulse mx-auto" />
          <p className="text-sm font-mono text-slate-400">Loading Distraction-Free Exam Mode...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center font-poppins">
        <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Exam Mode Error</h2>
          <p className="text-xs text-slate-400">{error || 'Could not load data.'}</p>
          <button
            onClick={fetchExamModeData}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { overview, subjectProgress, weakTopics, modules, compliance } = data;
  const activeDay = revisionSchedule?.days?.find(d => d.dayNumber === activeDayNumber) || revisionSchedule?.days?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins pb-24 selection:bg-amber-500 selection:text-slate-950">
      
      {/* 1. TOP FOCUS HEADER: Countdown, Readiness & Key Counters */}
      <div className="border-b border-slate-850 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-14 z-30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Left: Brand Badge & Days Remaining Big Counter */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black font-mono text-amber-400 leading-none">
                    {overview.daysRemaining}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Days
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    Focused Exam Mode
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {overview.targetExamTitle}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black font-serif-title text-white tracking-tight leading-snug">
                  {overview.daysRemaining} Days Remaining to University Exams
                </h1>
              </div>
            </div>

            {/* Right: The 4 Core Exam Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              
              {/* Metric 1: Syllabus Completion */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Syllabus</span>
                <span className="text-base font-black text-emerald-400">{overview.syllabusCompletionPercentage}%</span>
              </div>

              {/* Metric 2: Revision Pending */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Revision Due</span>
                <span className="text-base font-black text-amber-400">{overview.revisionPendingCount} items</span>
              </div>

              {/* Metric 3: Mock Tests Pending */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Mock Tests</span>
                <span className="text-base font-black text-blue-400">{overview.mockTestsPendingCount} pending</span>
              </div>

              {/* Metric 4: Weak Topics */}
              <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Weak Topics</span>
                <span className="text-base font-black text-rose-400">{overview.weakTopicsCount} focus</span>
              </div>

            </div>

          </div>

          {/* Overall Syllabus Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Overall Syllabus Readiness: {overview.completedTopics} of {overview.totalTopics} Topics Covered</span>
              <span className="font-bold text-emerald-400">{overview.syllabusCompletionPercentage}% Complete</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overview.syllabusCompletionPercentage}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* 2. STRICT COMPLIANCE & NON-PREDICTION NOTICE */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-200">
              Lowstudy Academic Compliance & Anti-Prediction Advisory
            </p>
            <p className="leading-relaxed">
              {compliance.DISCLAIMER} <span className="text-slate-200 font-semibold">{compliance.NO_PREDICTION_NOTICE}</span> {compliance.SYLLABUS_NOTICE}
            </p>
          </div>
        </div>

        {/* 3. SUBJECT PROGRESS STRIP (5 Semester 3 Subjects) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h2 className="font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Semester 3 Subject Progress
            </h2>
            <span className="text-slate-500 font-mono text-[11px]">5 Prescribed Law Subjects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {subjectProgress.map((subj) => (
              <Link
                key={subj.id}
                href={subj.subjectUrl}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between gap-3 shadow-sm group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">[{subj.code}]</span>
                    <span className="text-white font-bold">{subj.completionPercentage}%</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-amber-300 transition">
                    {subj.title}
                  </h3>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${subj.completionPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{subj.completedTopics}/{subj.totalTopics} Topics</span>
                    {subj.weakTopicsCount > 0 && (
                      <span className="text-rose-400 font-bold">{subj.weakTopicsCount} Weak</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. MULTI-HORIZON REVISION PLAN GENERATOR (3-Day, 7-Day, 15-Day) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                Adaptive Exam Plan
              </span>
              <h3 className="text-lg font-black text-white font-serif-title">
                Exam Revision Plan Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prioritized strictly by the 6-level hierarchy: Weak Topics &rarr; Important Topics &rarr; PYQs &rarr; Uncompleted &rarr; Revision &rarr; Mock Tests.
              </p>
            </div>

            {/* Horizon Selector Tabs */}
            <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
              {HORIZON_TABS.map((h) => {
                const isActive = selectedHorizon === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => handleSwitchHorizon(h.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{h.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6-Level Hierarchy Reference Strip */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
            <span className="text-slate-400 font-bold uppercase">Priority Order Applied:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">1. Weak Topics</span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">2. Important Topics</span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">3. PYQ Relevant</span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">4. Uncompleted</span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">5. Revision</span>
              <span className="text-slate-600">&rarr;</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">6. Mock Tests</span>
            </div>
          </div>

          {/* Multi-Day Navigation Tabs */}
          {revisionSchedule && revisionSchedule.days && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {revisionSchedule.days.map((d) => {
                  const isCurrent = d.dayNumber === activeDayNumber;
                  return (
                    <button
                      key={d.dayNumber}
                      onClick={() => setActiveDayNumber(d.dayNumber)}
                      className={`px-4 py-2 rounded-xl border shrink-0 text-left transition ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold leading-tight">{d.dayTitle}</div>
                      <div className={`text-[10px] font-mono ${isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>
                        {d.tasks.length} Tasks &bull; {d.totalMinutes}m
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Day Tasks List */}
              {scheduleLoading ? (
                <div className="p-8 text-center text-slate-400">
                  <RotateCcw className="w-6 h-6 animate-spin mx-auto text-amber-400 mb-2" />
                  <p className="text-xs font-mono">Generating prioritized revision schedule...</p>
                </div>
              ) : activeDay ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1">
                    <span className="font-bold text-white">{activeDay.dayTitle} ({activeDay.dateStr})</span>
                    <span>Total Planned Time: {activeDay.totalMinutes} Minutes</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeDay.tasks.map((task) => {
                      const priorityStyle = PRIORITY_BADGES[task.priorityLevel] || PRIORITY_BADGES[4];
                      return (
                        <div
                          key={task.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${priorityStyle.color}`}>
                                {task.priorityLabel}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {task.durationMinutes} mins
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white leading-snug">
                              {task.title}
                            </h4>

                            <p className="text-xs text-slate-400 font-mono">
                              [{task.subjectCode}] {task.subjectTitle}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-850 flex justify-end">
                            <Link
                              href={task.actionUrl}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition font-mono"
                            >
                              <span>{task.actionText}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          )}

        </div>

        {/* 5. THE 6 CORE EXAM MODE MODULES (Distraction-Free Tabbed Layout) */}
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              The 6 Core Exam Preparation Modules
            </h2>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Instant access without navigation friction
            </span>
          </div>

          {/* Module Selector Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {MODULE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeModuleTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveModuleTab(tab.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span className="text-xs font-bold leading-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MODULE VIEW 1: Quick Revision */}
          {activeModuleTab === 'QUICK_REVISION' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-serif-title">
                    Quick Revision & Spaced Recall
                  </h3>
                  <p className="text-xs text-slate-400">
                    Spaced flashcards, statutory sections, and mistake book entries awaiting active recall.
                  </p>
                </div>
                <Link
                  href="/revision/session"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Launch Quick Revision Session</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Revision Items</span>
                  <p className="text-xl font-bold text-white">{modules.quickRevision.totalItems}</p>
                  <span className="text-slate-500 text-[11px]">Synced across Semester 3</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Pending Review</span>
                  <p className="text-xl font-bold text-amber-400">{modules.quickRevision.pendingReviewCount}</p>
                  <span className="text-slate-500 text-[11px]">Due for spaced repetition</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Mistake Book</span>
                  <p className="text-xl font-bold text-rose-400">Active</p>
                  <Link href="/revision/mistakes" className="text-amber-400 hover:underline text-[11px] block">
                    Review My Mistakes &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* MODULE VIEW 2: Important Questions */}
          {activeModuleTab === 'IMPORTANT_QUESTIONS' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-serif-title">
                    High-Priority Exam Questions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Curated questions with evidence-based priority scores, model answer structures, and practice launchers.
                  </p>
                </div>
                <Link
                  href="/question-bank"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 font-mono"
                >
                  View Full Question Bank &rarr;
                </Link>
              </div>

              <div className="space-y-3">
                {modules.importantQuestions.slice(0, 5).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px]">
                          {q.marks} MARKS
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          [{q.subjectCode}] Unit {q.unitNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          {q.priority_label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {q.questionText}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Why Important: {q.why_important}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={q.practiceUrl}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Practice</span>
                      </Link>
                      <Link
                        href={q.modelAnswerUrl}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                      >
                        Model Answer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE VIEW 3: Important Sections */}
          {activeModuleTab === 'IMPORTANT_SECTIONS' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-serif-title">
                  Statutory Bare Act Sections
                </h3>
                <p className="text-xs text-slate-400">
                  Critical legislative sections, definitions, and essential ingredients across Semester 3 subjects.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.importantSections.map((sec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                        {sec.section}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        [{sec.subjectCode}]
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{sec.act}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-850">
                      {sec.summary}
                    </p>

                    <div className="text-[11px] font-mono text-amber-400/90 pt-1">
                      <strong>Lead Precedent:</strong> {sec.leadCase}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE VIEW 4: Important Case Laws */}
          {activeModuleTab === 'IMPORTANT_CASE_LAWS' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white font-serif-title">
                  Landmark Judicial Precedents
                </h3>
                <p className="text-xs text-slate-400">
                  Leading Supreme Court & High Court rulings with authoritative citations and ratios decidendi.
                </p>
              </div>

              <div className="space-y-3">
                {modules.importantCaseLaws.map((cl, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white font-serif-title">
                        {cl.caseName}
                      </h4>
                      <span className="text-xs font-mono text-amber-400">
                        {cl.citation}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <span>{cl.court}</span>
                      <span>&bull;</span>
                      <span>Topic: {cl.topic}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-850">
                      <strong>Ratio Decidendi:</strong> {cl.ratio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE VIEW 5: Previous Papers */}
          {activeModuleTab === 'PREVIOUS_PAPERS' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-serif-title">
                    Authentic Previous University Papers (2021–2024)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Saurashtra University examination papers available for PDF review or interactive mock attempt.
                  </p>
                </div>
                <Link
                  href="/previous-papers"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 font-mono"
                >
                  Full Papers Archive &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {modules.previousPapers.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                        {p.session} {p.year}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-1 leading-snug">
                        {p.subjectTitle}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">Code: {p.subjectCode}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                      <Link
                        href={p.practiceUrl}
                        className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-center font-bold text-xs rounded-lg transition"
                      >
                        Attempt
                      </Link>
                      <Link
                        href={p.paperUrl}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
                        title="View Paper"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE VIEW 6: Mock Tests */}
          {activeModuleTab === 'MOCK_TESTS' && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-serif-title">
                    Simulated Examination Mock Tests
                  </h3>
                  <p className="text-xs text-slate-400">
                    Timed tests with negative marking, question navigation, and topic accuracy analytics.
                  </p>
                </div>
                <Link
                  href="/mock-test"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  Configure Custom Mock Test
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {modules.mockTests.map((test) => (
                  <div key={test.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-400 font-bold">{test.totalMarks} Marks</span>
                        <span className="text-slate-400">{test.durationMinutes} Mins</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {test.title}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        test.isAttempted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {test.isAttempted ? 'Attempted' : 'Unattempted'}
                      </span>

                      <Link
                        href={test.testUrl}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                      >
                        Start Test
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
