"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Flame, 
  Sparkles, 
  Award, 
  BookMarked, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock,
  Target,
  GraduationCap,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { USER_STUDENT_PROFILE, SUBJECTS_DATA } from '@/data/legalData';

export default function DashboardPage() {
  const [profile, setProfile] = useState(USER_STUDENT_PROFILE);
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setRole(localStorage.getItem('userRole') || 'student');
    } catch (e) {
      setRole('student');
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading profile...
      </div>
    );
  }

  if (role !== 'student') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif-title text-white">Student Dashboard Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently logged in with Admin credentials. The Student Dashboard contains personalized progress tracking, Streaks, XP metrics, and bookmarked notes.
          </p>
        </div>
        <div className="pt-2">
          <button 
            onClick={() => {
              try {
                localStorage.setItem('userRole', 'student');
              } catch (e) {}
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25"
          >
            Switch to Student Role
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
              {profile.level}
            </span>
            <span className="text-xs text-slate-400">• {profile.targetExam}</span>
          </div>
          <h1 className="text-3xl font-bold font-serif-title text-white">Welcome back, {profile.name}!</h1>
          <p className="text-xs text-slate-300">{profile.role}</p>
        </div>

        {/* Right Stats Tickers */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-lg font-bold text-white font-serif-title">{profile.streakDays} Days</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Streak</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400 font-serif-title">{profile.xp} XP</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Points</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3-COLUMN ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Badges Earned */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Badges Earned ({profile.badges.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Rank #14</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {profile.badges.map((badge, idx) => (
              <div key={idx} className={`p-3 rounded-xl border ${badge.color} flex items-center gap-2.5`}>
                <span className="text-xl">{badge.icon}</span>
                <span className="text-xs font-bold text-white">{badge.title}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Next Badge: Judiciary Titan</span>
            <span className="text-amber-400 font-bold">50 XP needed</span>
          </div>
        </div>

        {/* Column 2: Strong vs Weak Topics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Topic Performance Analytics
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong Subjects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.strongTopics.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Needs Revision (Weak Topics)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.weakTopics.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Saved Bookmarks */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-blue-400" />
            Bookmarked Notes & Sections
          </h3>

          <ul className="space-y-2 text-xs">
            {profile.bookmarks.map((bm, idx) => (
              <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between">
                <span className="truncate">{bm}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* RECENT ACTIVITY & RECOMMENDED STUDY ROADMAP */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white font-serif-title">Recommended Study Roadmap for AIBE & Judiciary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Step 1: Criminal Law</span>
              <span>In Progress</span>
            </div>
            <p className="text-sm font-bold text-white">Bharatiya Nyaya Sanhita (BNS 2023)</p>
            <p className="text-xs text-slate-400">Complete Section 103 to 152 comparative notes.</p>
            <Link href="/bare-acts" className="inline-block pt-1 text-xs text-amber-400 hover:underline font-semibold">
              Continue Learning →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Step 2: Daily Practice</span>
              <span>Ready</span>
            </div>
            <p className="text-sm font-bold text-white">Constitutional Law Daily Mock</p>
            <p className="text-xs text-slate-400">4 MCQs on Preamble and Fundamental Rights.</p>
            <Link href="/quiz" className="inline-block pt-1 text-xs text-emerald-400 hover:underline font-semibold">
              Start Test (+100 XP) →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Step 3: AI Consultation</span>
              <span>Available</span>
            </div>
            <p className="text-sm font-bold text-white">Ask NyayaAI Doubt Solver</p>
            <p className="text-xs text-slate-400">Clear doubts on Section 34 CPC or Res Judicata.</p>
            <Link href="/ai-tutor" className="inline-block pt-1 text-xs text-purple-400 hover:underline font-semibold">
              Open AI Assistant →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
