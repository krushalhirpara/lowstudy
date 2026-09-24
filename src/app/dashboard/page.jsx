"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Layers,
  GraduationCap,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Bookmark,
  RefreshCw,
  Target,
  Flame,
  FileText,
  Calendar,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check,
  Building2,
  Timer,
  ListTodo,
  PenTool,
  Scale,
  Bot,
  Search,
  Calculator,
  Briefcase
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [studyPlanTasks, setStudyPlanTasks] = useState([]);
  const [sessionToast, setSessionToast] = useState('');

  useEffect(() => {
    setMounted(true);
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardData(json.data);
        setStudyPlanTasks(json.data.sections.todaysStudyPlan || []);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle study plan task
  const handleToggleTask = (taskId) => {
    setStudyPlanTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t))
    );
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-mono text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-amber-600" />
        Loading Saurashtra University Student Dashboard...
      </div>
    );
  }

  const { student, academicContext, overallPreparationPercentage, coreMetrics, subjectProgress, sections } = dashboardData;
  const continueItem = sections.continuePreparation;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950 pb-28">
      
      {/* Toast notification */}
      {sessionToast && (
        <div className="fixed top-16 right-4 z-50 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sessionToast}</span>
        </div>
      )}

      {/* 1. Academic Context Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-14 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 text-xs text-slate-700 shrink-0 whitespace-nowrap">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              {academicContext.university.name} ({academicContext.university.code})
            </span>
            <span className="text-slate-400">&bull;</span>
            <span className="font-semibold text-slate-800 text-[11px] sm:text-xs">{academicContext.course.name}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] sm:text-[11px] font-bold text-slate-700">
              {academicContext.semester.title}
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-amber-600">
                {student.fullName ? student.fullName.charAt(0) : 'A'}
              </div>
              <div className="hidden md:block text-left font-mono">
                <p className="text-[11px] font-bold text-slate-900 leading-tight">{student.fullName}</p>
                <p className="text-[9px] text-slate-500">ID: {student.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 2. Top Hero: Continue Preparation & Overall Preparation Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* SECTION 1: PROMINENT "CONTINUE PREPARATION" ACTION (Takes 2 Columns) */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/30 shadow-xl flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Continue Preparation
                </span>
                {continueItem && (
                  <span className="text-xs font-mono text-slate-400">
                    [{continueItem.subjectCode}] Unit {continueItem.unitNumber}
                  </span>
                )}
              </div>

              {continueItem ? (
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif-title text-white leading-snug">
                    {continueItem.topicTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Resume your structured learning. Model exam answers, statutory provisions, essential elements, and case laws are ready for your study.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-white">
                    Ready to Begin Semester 3 Studies
                  </h2>
                  <p className="text-xs text-slate-400">
                    Start with Labour and Industrial Law - I Unit 1 to establish foundational case law principles.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Last Activity: Today</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/exam-mode"
                  className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-md transition flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Enter Exam Mode</span>
                </Link>

                <Link
                  href={continueItem?.continueUrl || '/academic'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 btn-mobile-touch"
                >
                  <span>Continue Preparation</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* OVERALL PREPARATION GAUGE (1 Column) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Overall Preparation
              </span>
              <p className="text-xs text-slate-400">
                Composite readiness across all 5 Semester 3 subjects.
              </p>
            </div>

            {/* Preparation Meter */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-amber-500 transition-all duration-1000 ease-out"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * overallPreparationPercentage) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black font-mono text-white">
                    {overallPreparationPercentage}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                    Prepared
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                Syllabus Scope: 5 Core Subjects
              </span>
            </div>
          </div>

        </div>

        {/* 3. Core Metric Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Questions Solved</span>
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-mono text-white">{coreMetrics.questionsSolved}</p>
            <p className="text-[11px] text-slate-500">Descriptive & PYQs</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">MCQs Solved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">{coreMetrics.mcqsSolved}</p>
            <p className="text-[11px] text-slate-500">Practice & Tests</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Mock Tests</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400">{coreMetrics.mockTestsCompleted}</p>
            <p className="text-[11px] text-slate-500">Evaluated Exams</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Study Streak</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black font-mono text-white">{coreMetrics.studyStreak} Days</p>
            <p className="text-[11px] text-slate-500">Daily Study Consistency</p>
          </div>
        </div>

        {/* 3.5. Law Student Practice & AI Studio Launchpad */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Law Student AI & Clinical Practice Suite
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🟢 Grounded in Gujarat Syllabus
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href="/practice/drafting"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-105 transition">
                <PenTool className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition leading-tight">
                AI Drafting Lab
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">Notices, Plaints & Bail</p>
            </Link>

            <Link
              href="/practice/moot-court"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 w-fit group-hover:scale-105 transition">
                <Scale className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition leading-tight">
                Moot Court Arena
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">Memorials & AI Judge</p>
            </Link>

            <Link
              href="/practice/answer-evaluator"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit group-hover:scale-105 transition">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition leading-tight">
                Answer Evaluator
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">IRAC Rubric & Scores</p>
            </Link>

            <Link
              href="/ai/document-analyzer"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit group-hover:scale-105 transition">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition leading-tight">
                Document Analyzer
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">Pleadings & FIRs</p>
            </Link>

            <Link
              href="/research"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 w-fit group-hover:scale-105 transition">
                <Search className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition leading-tight">
                Ratio & Precedents
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">Supreme Court Cases</p>
            </Link>

            <Link
              href="/career"
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-400/60 hover:bg-slate-850 transition group text-left space-y-1.5"
            >
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit group-hover:scale-105 transition">
                <Briefcase className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition leading-tight">
                Career & Judiciary
              </h4>
              <p className="text-[10px] text-slate-400 leading-snug">Clerkships & JMFC</p>
            </Link>
          </div>
        </div>

        {/* 4. Subject Progress for the 5 Semester 3 Subjects */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white font-serif-title flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>Subject Progress & Curriculum Mastery</span>
              </h2>
              <p className="text-xs text-slate-400">
                Official syllabus tracking for all 5 Saurashtra University Semester 3 law subjects.
              </p>
            </div>
            <Link
              href="/curriculum"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>View Full Syllabus</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 5 Subjects Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectProgress.map((subj) => (
              <div
                key={subj.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-5 shadow-lg"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold">
                      Code {subj.code}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">
                      {subj.overallPercentage}% Prepared
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug font-serif-title">
                    {subj.title}
                  </h3>

                  {/* Main Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${subj.overallPercentage}%` }}
                    />
                  </div>
                </div>

                {/* The 5 Sub-metrics requested */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  
                  {/* Metric 1: Topic Completion */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>Topics</span>
                      <span className="text-amber-400">{subj.topicCompletion.percentage}%</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {subj.topicCompletion.completed} / {subj.topicCompletion.total}
                    </p>
                  </div>

                  {/* Metric 2: Notes Progress */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>Notes</span>
                      <span className="text-blue-400">{subj.notesProgress.percentage}%</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {subj.notesProgress.read} / {subj.notesProgress.total} Read
                    </p>
                  </div>

                  {/* Metric 3: Questions Practiced */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>Questions</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {subj.questionsPracticed.practiced} Practiced
                    </p>
                  </div>

                  {/* Metric 4: MCQs Solved */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                      <span>MCQs</span>
                      <span className="text-emerald-400">{subj.mcqsSolved.accuracy}% Acc</span>
                    </div>
                    <p className="text-xs font-bold text-white">
                      {subj.mcqsSolved.solved} Solved
                    </p>
                  </div>

                  {/* Metric 5: Test Performance (Full Width) */}
                  <div className="col-span-2 p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Performance</span>
                      <span className="text-xs font-bold text-white">
                        {subj.testPerformance.averageScore}% Avg Score &bull; {subj.testPerformance.testsAttempted} Mock Tests
                      </span>
                    </div>
                    <span className="text-xs text-amber-400 font-bold">
                      Last: {subj.testPerformance.lastScore}%
                    </span>
                  </div>

                </div>

                {/* Subject CTA Button */}
                <Link
                  href={subj.subjectUrl}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <span>Open Subject Syllabus</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            ))}
          </div>
        </div>

        {/* 5. Supporting Sections Grid (Study Plan, Weak Topics, Mistakes, Tests, Bookmarks, PYQs, Exam) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS: Study Plan, Weak Topics, Important Questions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 2: TODAY'S STUDY PLAN */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-serif-title">Today's Academic Study Plan</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    {studyPlanTasks.filter(t => t.isCompleted).length} of {studyPlanTasks.length} Done
                  </span>
                  <Link
                    href="/study-plan"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20"
                  >
                    Open AI Plan &rarr;
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                {studyPlanTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      task.isCompleted
                        ? 'bg-slate-950/40 border-slate-850 text-slate-500'
                        : 'bg-slate-950/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 transition ${
                        task.isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      {task.isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className="font-bold uppercase text-amber-400">[{task.subjectCode}]</span>
                        <span className="text-slate-400">{task.estimatedMins} Mins Target</span>
                      </div>
                      <p className={`text-xs sm:text-sm font-semibold leading-snug ${task.isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                    </div>

                    <Link
                      href={task.actionUrl}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-bold text-slate-300 shrink-0"
                    >
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 3: WEAK TOPICS */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-bold text-white font-serif-title">Weak Topics (Targeted Remediation)</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Priority Review</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sections.weakTopics.map((wt) => (
                  <div
                    key={wt.topicId}
                    className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold">
                        <span>[{wt.subjectCode}] Unit {wt.unitNumber}</span>
                        <span className="text-rose-400">Needs Study</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1 leading-snug">{wt.title}</h4>
                    </div>

                    <Link
                      href={wt.revisionUrl}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Revise Weak Topic</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 8: IMPORTANT QUESTIONS (High-Yield / PYQs) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-serif-title">High-Yield Exam Questions</h3>
                </div>
                <Link href="/question-bank" className="text-xs text-amber-400 hover:underline font-bold">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {sections.importantQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 uppercase font-bold">[{q.subjectCode}] &bull; {q.marks} Marks</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 border border-amber-500/25 text-amber-300">
                        {q.priorityLabel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                      {q.questionText}
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      Why Important: {q.whyImportant}
                    </p>
                    <div className="pt-1">
                      <Link
                        href={q.practiceUrl}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                      >
                        <span>Practice Question & Model Answer</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: Upcoming Exam, Wrong Answers, Recent Tests, Bookmarks, Quick Revision */}
          <div className="space-y-6">
            
            {/* SECTION 9: UPCOMING EXAM COUNTDOWN */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Calendar className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Upcoming Examination</h3>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-white leading-snug">{sections.upcomingExam.title}</p>
                <p className="text-xs text-slate-400">{sections.upcomingExam.session}</p>
              </div>

              {/* Countdown Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 text-center font-mono">
                <span className="text-4xl font-black text-amber-400">{sections.upcomingExam.daysRemaining}</span>
                <p className="text-xs uppercase font-bold text-slate-400 mt-1">Days Remaining</p>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                <p>&bull; 5 Theory Papers (500 Marks Total)</p>
                <p>&bull; Target: 70%+ First Class Distinction</p>
              </div>
            </div>

            {/* SECTION 4: WRONG ANSWERS (MY MISTAKES) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white font-serif-title">My Mistakes</h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  {sections.wrongAnswers.totalMistakes} Active
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Every wrong answer is automatically filed here until answered correctly.
              </p>

              <div className="space-y-2">
                {sections.wrongAnswers.recentMistakes.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-xs space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">[{m.subjectCode}] {m.topicTitle}</span>
                    <p className="text-slate-200 line-clamp-1">{m.questionText}</p>
                  </div>
                ))}
              </div>

              <Link
                href={sections.wrongAnswers.practiceUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Drill Mistake Notebook</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* SECTION 6: RECENT TESTS */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white font-serif-title">Recent Tests</h3>
                </div>
                <Link href="/mock-test" className="text-xs text-amber-400 hover:underline font-bold">
                  Take Test
                </Link>
              </div>

              <div className="space-y-2.5">
                {sections.recentTests.slice(0, 3).map(test => (
                  <div key={test.id} className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white font-mono">{test.practiceMode}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Score: {test.score}/{test.totalQuestions} ({test.percentage}%)
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      test.percentage >= 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {test.percentage >= 50 ? 'Passed' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 5: BOOKMARKS */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Bookmarks</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">{sections.bookmarks.length} Saved</span>
              </div>

              <div className="space-y-2">
                {sections.bookmarks.map(bm => (
                  <Link
                    key={bm.id}
                    href={bm.url}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 hover:text-amber-300 flex items-center justify-between group transition"
                  >
                    <span className="font-mono text-[11px] font-semibold uppercase">[{bm.entityType}]</span>
                    <span className="text-slate-400 group-hover:text-amber-400">View &rarr;</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* SECTION 7: QUICK REVISION (Spaced Repetition SM-2 Queue) */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Quick Revision Deck</h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">{sections.quickRevision.totalDue} Cards Due</span>
              </div>

              <p className="text-xs text-slate-400">
                Spaced repetition items scheduled for recall today.
              </p>

              <Link
                href="/quiz"
                className="w-full py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Start Daily Spaced Revision</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
