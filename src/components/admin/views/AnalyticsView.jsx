"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Award, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function AnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load analytics');
      setAnalytics(json.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-mono text-xs">
        Loading platform analytics & mastery metrics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400 space-y-3">
        <p className="text-xs">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const diff = analytics?.difficultyBreakdown || { easy: 0, medium: 0, hard: 0 };
  const stats = analytics?.stats || {};
  const totalQuestions = (diff.easy || 0) + (diff.medium || 0) + (diff.hard || 0) || 1;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400">Total Curriculum Depth</span>
          <p className="text-3xl font-bold text-white font-serif-title">
            {((stats.subjects || 0) + (stats.units || 0) + (stats.topics || 0)).toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-mono block">
            {stats.subjects} Subjects • {stats.topics} Topics
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400">Question Bank Volume</span>
          <p className="text-3xl font-bold text-amber-400 font-serif-title">
            {((stats.questions || 0) + (stats.mcqs || 0)).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block">
            {stats.questions} Descriptive • {stats.mcqs} MCQs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400">Legal Section Mappings</span>
          <p className="text-3xl font-bold text-purple-400 font-serif-title">
            {stats.legalSections || 0}
          </p>
          <span className="text-[11px] text-purple-300 font-mono block">
            BNS, BNSS, BSA, IPC, CrPC
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400">Student Exam Attempts</span>
          <p className="text-3xl font-bold text-cyan-400 font-serif-title">
            {stats.testAttempts || 0}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block">
            Across {stats.mockTests || 0} Mock Tests
          </span>
        </div>
      </div>

      {/* Difficulty Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Exam Question Difficulty Distribution
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Easy Questions</span>
                <span className="text-slate-300">{diff.easy} ({Math.round((diff.easy / totalQuestions) * 100)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(diff.easy / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-amber-400 font-bold">Medium Difficulty</span>
                <span className="text-slate-300">{diff.medium} ({Math.round((diff.medium / totalQuestions) * 100)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(diff.medium / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-400 font-bold">Hard / Complex Problem Questions</span>
                <span className="text-slate-300">{diff.hard} ({Math.round((diff.hard / totalQuestions) * 100)}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(diff.hard / totalQuestions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Student Exam Attempts */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            Recent Student Mock Exam Activity
          </h3>

          <div className="space-y-2.5">
            {analytics?.recentAttempts?.length > 0 ? (
              analytics.recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">
                      {attempt.user?.fullName || attempt.user?.email || 'Student Attempt'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {attempt.mockTest?.title || 'Mock Test'}
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-emerald-400 font-bold block">
                      Score: {attempt.score}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono py-8 text-center">
                No recent mock test attempts logged.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
