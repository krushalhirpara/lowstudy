"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BookOpen,
  PenTool,
  Award,
  BookMarked,
  Timer,
  ChevronRight,
  ArrowRight,
  CalendarDays,
  Check,
  X,
  FastForward,
  Info,
  Layers,
  Scale,
  ShieldAlert,
  Sliders,
  TrendingUp
} from 'lucide-react';

const HORIZONS = [
  { key: 'TODAY', label: "Today's Plan", days: 1, desc: "Immediate 5-stage daily focus" },
  { key: 'THREE_DAY', label: "3-Day Plan", days: 3, desc: "Targeted weak-topic sprint" },
  { key: 'SEVEN_DAY', label: "7-Day Plan", days: 7, desc: "Balanced weekly syllabus coverage" },
  { key: 'FIFTEEN_DAY', label: "15-Day Plan", days: 15, desc: "Comprehensive exam master sprint" }
];

const STAGE_CONFIG = {
  LEARN: {
    label: '1. Learn',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    icon: BookOpen,
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  PRACTICE: {
    label: '2. Practice',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    icon: PenTool,
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  MCQ: {
    label: '3. MCQ Drill',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    icon: Award,
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  },
  REVISION: {
    label: '4. Revision',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    icon: BookMarked,
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  TEST: {
    label: '5. Timed Test',
    color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
    icon: Timer,
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  }
};

export default function StudyPlanPage() {
  const [selectedHorizon, setSelectedHorizon] = useState('SEVEN_DAY');
  const [activeDayIndex, setActiveDayIndex] = useState(1);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Form Inputs for customization
  const [dailyHours, setDailyHours] = useState(2.5);
  const [examDate, setExamDate] = useState('2026-11-15');
  const [reschedulingTaskId, setReschedulingTaskId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  // Fetch plan
  const fetchPlan = async (horizonKey = selectedHorizon) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/study-plan?userId=usr-student-01&horizon=${horizonKey}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setDailyHours(data.plan.dailyHours || 2.5);
        if (data.plan.targetExamDate) {
          setExamDate(new Date(data.plan.targetExamDate).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan(selectedHorizon);
    setActiveDayIndex(1);
  }, [selectedHorizon]);

  // Regenerate plan
  const handleRegeneratePlan = async () => {
    try {
      setRegenerating(true);
      const res = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-student-01',
          targetExamDate: examDate,
          dailyHours: Number(dailyHours),
          horizon: selectedHorizon
        })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setActiveDayIndex(1);
      }
    } catch (err) {
      console.error('Error regenerating plan:', err);
    } finally {
      setRegenerating(false);
    }
  };

  // Execute task actions (Accept, Complete, Skip, Reschedule)
  const handleTaskAction = async (taskId, action, customDate = null) => {
    if (!plan) return;
    try {
      setActionLoading(taskId);
      const res = await fetch('/api/study-plan/task', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-student-01',
          planId: plan.id,
          taskId,
          action,
          newDate: customDate
        })
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        setReschedulingTaskId(null);
      }
    } catch (err) {
      console.error(`Error performing ${action} on task:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const activeDay = plan?.days?.find(d => d.dayIndex === activeDayIndex) || plan?.days?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins pb-16">
      {/* 1. Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive AI Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Saurashtra University - LL.B. Sem 3
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-title text-white tracking-tight">
                Adaptive AI Study Plan
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Personalized study schedule optimized according to your mock test scores, mistake notebook, weak topic confidence, and syllabus previous-year patterns.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            {plan && (
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
                <div className="text-center px-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Completion</p>
                  <p className="text-xl font-mono font-bold text-amber-400">{plan.completionPercentage}%</p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tasks Done</p>
                  <p className="text-xl font-mono font-bold text-emerald-400">
                    {plan.metrics?.completedTasks || 0} / {plan.metrics?.totalTasks || 0}
                  </p>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center px-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Exam Countdown</p>
                  <p className="text-xl font-mono font-bold text-blue-400">
                    {plan.daysRemainingToExam || 45}d
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Horizon Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {HORIZONS.map((h) => {
              const isActive = selectedHorizon === h.key;
              return (
                <button
                  key={h.key}
                  onClick={() => setSelectedHorizon(h.key)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                      {h.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {h.days} {h.days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{h.desc}</p>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* 3. Statutory & Educational Compliance Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-300">
              Lowstudy Academic Compliance & Workload Advisory
            </p>
            <p className="leading-relaxed">
              This study plan is an adaptive pedagogical aid designed according to syllabus structure and student progress. 
              <span className="font-bold text-slate-200"> Lowstudy makes no claim or guarantee of specific marks or examination grades</span>, 
              nor does it predict exact future university question papers. Workloads are strictly time-boxed between 1.0 and 5.0 hours daily to prevent burnout.
            </p>
          </div>
        </div>

        {/* 4. Adaptive Controls & Inputs Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                Adaptive Plan Configuration
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Realistic workload bounds: 1.0 - 5.0 hrs/day
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            {/* Input 1: Target Exam Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono"
              />
            </div>

            {/* Input 2: Available Study Time (Hours/Day) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Available Study Time
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {dailyHours} Hours ({Math.round(dailyHours * 60)} mins/day)
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1.0 hr (Light)</span>
                <span>3.0 hrs (Optimal)</span>
                <span>5.0 hrs (Sprint)</span>
              </div>
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleRegeneratePlan}
              disabled={regenerating || loading}
              className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Recomputing Plan...' : 'Regenerate Adaptive Plan'}</span>
            </button>
          </div>
        </div>

        {/* 5. Pedagogical Sequence Explanation Ribbon */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Strict Pedagogical Sequence Applied
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Learn &rarr; Practice &rarr; MCQ &rarr; Revision &rarr; Test
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <span className="font-bold block">1. LEARN</span>
              <span className="text-[10px] text-slate-400">Concepts & Notes</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span className="font-bold block">2. PRACTICE</span>
              <span className="text-[10px] text-slate-400">Model Answers</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="font-bold block">3. MCQ</span>
              <span className="text-[10px] text-slate-400">Active Recall</span>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <span className="font-bold block">4. REVISION</span>
              <span className="text-[10px] text-slate-400">Mistake Notebook</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <span className="font-bold block">5. TEST</span>
              <span className="text-[10px] text-slate-400">Timed Checkpoint</span>
            </div>
          </div>
        </div>

        {/* 6. Multi-Day Selector (if 3, 7, or 15 days) */}
        {plan && plan.days && plan.days.length > 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Select Day Schedule:</span>
              <span>Showing {plan.days.length} Days Schedule</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {plan.days.map((d) => {
                const isCurrent = d.dayIndex === activeDayIndex;
                const dayCompletedTasks = d.tasks.filter(t => t.status === 'COMPLETED').length;
                const isDayAllDone = dayCompletedTasks === d.tasks.length && d.tasks.length > 0;

                return (
                  <button
                    key={d.dayIndex}
                    onClick={() => setActiveDayIndex(d.dayIndex)}
                    className={`px-4 py-2.5 rounded-xl border shrink-0 text-left transition flex items-center gap-2.5 ${
                      isCurrent
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md'
                        : isDayAllDone
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{d.dayTitle}</div>
                      <div className={`text-[10px] font-mono ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                        {d.subjectFocus?.code} • {dayCompletedTasks}/{d.tasks.length} Done
                      </div>
                    </div>
                    {isDayAllDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Active Day Tasks Feed */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p>Loading adaptive study schedule...</p>
          </div>
        ) : activeDay ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white font-serif-title">
                    {activeDay.dayTitle}: {activeDay.subjectFocus?.title}
                  </span>
                  {activeDay.isWeakTopicFocus && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                      Weak Topic Focus
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Target Topic: {activeDay.subjectFocus?.topicTitle} (Unit {activeDay.subjectFocus?.unitNumber}) • {activeDay.totalMinutes} mins planned
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Accept all pending tasks for this day
                    activeDay.tasks.forEach(t => {
                      if (t.status === 'PENDING') handleTaskAction(t.id, 'ACCEPT');
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                >
                  Accept All Day Tasks
                </button>
              </div>
            </div>

            {/* Tasks ordered by pedagogical sequence */}
            <div className="space-y-3">
              {activeDay.tasks.map((task) => {
                const stageCfg = STAGE_CONFIG[task.sequenceStage] || STAGE_CONFIG.LEARN;
                const StageIcon = stageCfg.icon;
                const isCompleted = task.status === 'COMPLETED';
                const isAccepted = task.status === 'ACCEPTED';
                const isSkipped = task.status === 'SKIPPED';
                const isRescheduled = task.status === 'RESCHEDULED';
                const isLoadingAction = actionLoading === task.id;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-slate-950/40 border-slate-850 opacity-80'
                        : isSkipped
                        ? 'bg-slate-950/30 border-slate-850 opacity-60'
                        : 'bg-slate-900 border-slate-800 shadow-md hover:border-slate-700'
                    }`}
                  >
                    {/* Left: Task details & Stage */}
                    <div className="flex items-start gap-4">
                      {/* Checkbox / Completion Trigger */}
                      <button
                        onClick={() => handleTaskAction(task.id, isCompleted ? 'ACCEPT' : 'COMPLETE')}
                        disabled={isLoadingAction}
                        title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 transition ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'border-slate-700 hover:border-amber-400 bg-slate-950'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4 text-slate-600" />}
                      </button>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border flex items-center gap-1 ${stageCfg.badgeBg}`}>
                            <StageIcon className="w-3 h-3" />
                            {stageCfg.label}
                          </span>

                          <span className="text-[11px] font-mono text-slate-400">
                            {task.durationMinutes} mins
                          </span>

                          {/* Status pill */}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                              Completed
                            </span>
                          )}
                          {isAccepted && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                              Accepted
                            </span>
                          )}
                          {isSkipped && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                              Skipped
                            </span>
                          )}
                          {isRescheduled && (
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                              Rescheduled to {task.scheduledDate}
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base font-bold leading-snug ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5 text-[11px] text-amber-400/90 font-mono">
                          <Info className="w-3.5 h-3.5" />
                          <span>{task.priorityReason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Jump Button */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                      
                      {/* Action 1: Direct link to material */}
                      <Link
                        href={task.actionUrl}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{task.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </Link>

                      {/* Action 2: Accept */}
                      {!isCompleted && !isAccepted && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'ACCEPT')}
                          disabled={isLoadingAction}
                          className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition"
                        >
                          Accept
                        </button>
                      )}

                      {/* Action 3: Complete */}
                      {!isCompleted && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'COMPLETE')}
                          disabled={isLoadingAction}
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                        >
                          Complete
                        </button>
                      )}

                      {/* Action 4: Skip */}
                      {!isCompleted && !isSkipped && (
                        <button
                          onClick={() => handleTaskAction(task.id, 'SKIP')}
                          disabled={isLoadingAction}
                          className="px-2.5 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition"
                          title="Skip this task"
                        >
                          Skip
                        </button>
                      )}

                      {/* Action 5: Reschedule */}
                      <button
                        onClick={() => setReschedulingTaskId(reschedulingTaskId === task.id ? null : task.id)}
                        className="px-2.5 py-2 rounded-xl bg-slate-950 text-slate-400 hover:text-purple-300 border border-slate-800 text-xs transition"
                        title="Reschedule task"
                      >
                        <CalendarDays className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reschedule Popover / Inline Box */}
                    {reschedulingTaskId === task.id && (
                      <div className="col-span-full w-full p-3 rounded-xl bg-slate-950 border border-purple-500/30 mt-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-purple-400" />
                          <span>Reschedule to date:</span>
                          <input
                            type="date"
                            value={rescheduleDate || task.scheduledDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTaskAction(task.id, 'RESCHEDULE', rescheduleDate || task.scheduledDate)}
                            className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
                          >
                            Save Reschedule
                          </button>
                          <button
                            onClick={() => setReschedulingTaskId(null)}
                            className="px-2 py-1 text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* 8. Bottom Information Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              Evidence-Based Prioritization Formula
            </h4>
            <p className="leading-relaxed">
              Topics are weighted by combining four dynamic factors: Low Student Confidence (35%), Unresolved Mistake Book Items (20%), Previous University Paper Recurrence (25%), and Syllabus Incompletion (20%).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              Realistic Cognitive Pacing
            </h4>
            <p className="leading-relaxed">
              Every day adheres to the strict 5-stage learning sequence (Learn &rarr; Practice &rarr; MCQ &rarr; Revision &rarr; Test) divided proportionally according to your configured daily hours, ensuring optimal retention without cognitive overload.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
