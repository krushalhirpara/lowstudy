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
import { MockDB } from '@/data/db';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  
  const [activeUni, setActiveUni] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [semesterSubjects, setSemesterSubjects] = useState([]);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setProfile(MockDB.getProfile());
    setActiveUni(MockDB.getSelectedUni());
    setActiveSem(MockDB.getSelectedSem());
    setLeaderboard(MockDB.getLeaderboard());
    setSemesterSubjects(MockDB.getSubjects());

    try {
      setRole(localStorage.getItem('userRole') || 'student');
    } catch (e) {
      setRole('student');
    }
  }, []);

  if (!mounted || !profile) {
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
              {profile.level}
            </span>
            <span className="text-xs text-slate-400">
              • {activeUni ? activeUni.name : "Select University in Header"} ({activeSem ? activeSem.name : "Select Semester"})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white">Welcome back, {profile.name}!</h1>
          <p className="text-xs text-slate-300">Target Exam: {profile.targetExam}</p>
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-white font-serif-title">{profile.coins} Coins</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Coins Balance</p>
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
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Badges Earned ({profile.badges.length})
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Rank #4</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {profile.badges.map((badge, idx) => (
                <div key={idx} className={`p-3 rounded-xl border ${badge.color} flex items-center gap-2.5`}>
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-[11px] font-bold text-white leading-tight">{badge.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Next Badge: Judiciary Titan</span>
            <span className="text-amber-400 font-bold">50 XP needed</span>
          </div>
        </div>

        {/* Column 2: Strong vs Weak Topics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Syllabus Performance
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strong Topics
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.strongTopics.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium leading-tight">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-semibold text-amber-400 flex items-center gap-1 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Revision
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.weakTopics.map(t => (
                    <span key={t} className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-medium leading-tight">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <Link
              href="/quiz"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Practice Weak Topics Now
            </Link>
            <p className="text-[10px] text-slate-500 leading-normal text-center">
              Strong and weak topics are computed automatically based on your MCQ answer accuracies.
            </p>
          </div>
        </div>

        {/* Column 3: Leaderboard & Bookmarks */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              LowStudy Leaderboard
            </h3>
            <ul className="space-y-2 text-xs">
              {leaderboard.map((item, idx) => {
                const isSelf = item.name.toLowerCase() === profile.name.toLowerCase();
                return (
                  <li key={idx} className={`p-2 rounded-lg flex items-center justify-between ${
                    isSelf ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold' : 'bg-slate-950/60 text-slate-300 border border-slate-800/20'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-4">#{idx + 1}</span>
                      <span className="font-semibold">{item.name} ({item.uni})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{item.xp} XP</span>
                  </li>
                );
              })}
            </ul>
          </div>
          
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <BookMarked className="w-3.5 h-3.5 text-blue-400" />
              Bookmarked Notes ({profile.bookmarks?.length || 0})
            </h3>
            <ul className="space-y-1.5 text-[11px] max-h-[80px] overflow-y-auto">
              {profile.bookmarks.length > 0 ? profile.bookmarks.map((bm, idx) => (
                <li key={idx} className="p-1.5 rounded bg-slate-950/40 border border-slate-850 text-slate-400 flex items-center justify-between">
                  <span className="truncate">{bm}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 ml-2" />
                </li>
              )) : (
                <li className="text-slate-500 italic">No bookmarked notes yet.</li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* RECOMMENDED SYLLABUS ROADMAP */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-serif-title">Active Semester Syllabus Roadmap</h3>
          <span className="text-xs text-slate-400 font-semibold">{semesterSubjects.length} subjects found</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {semesterSubjects.slice(0, 3).map((subject, idx) => (
            <div key={subject.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-amber-400">Step {idx + 1}: Core Study</span>
                  <span className="text-slate-500 font-mono uppercase">{subject.shortCode}</span>
                </div>
                <p className="text-sm font-bold text-white font-serif-title leading-snug">{subject.title}</p>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{subject.description}</p>
              </div>
              <Link 
                href={`/subjects/${subject.id}`} 
                className="inline-block pt-3 text-xs text-amber-400 hover:underline font-semibold w-max"
              >
                Study Modules & Notes →
              </Link>
            </div>
          ))}

          {semesterSubjects.length === 0 && (
            <div className="col-span-3 text-center py-6 text-slate-500 italic text-xs">
              Please select your law university and semester from the header selectors to load your syllabus roadmap.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
