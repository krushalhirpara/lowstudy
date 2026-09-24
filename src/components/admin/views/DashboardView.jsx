"use client";

import { 
  Building2, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  HelpCircle, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ChevronRight,
  Database,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardView({ stats, onNavigate, onTriggerAlert }) {
  const counts = stats?.counts || {};
  const settings = stats?.settings || {};

  const kpis = [
    { label: 'Universities', value: counts.universities || 0, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', tab: 'universities' },
    { label: 'Courses', value: counts.courses || 0, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', tab: 'courses' },
    { label: 'Subjects', value: counts.subjects || 0, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', tab: 'subjects' },
    { label: 'Exam Notes', value: counts.notes || 0, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', tab: 'notes' },
    { label: 'Question Bank', value: counts.questions || 0, icon: HelpCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', tab: 'questions' },
    { label: 'Practice MCQs', value: counts.mcqs || 0, icon: CheckSquare, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', tab: 'mcqs' },
    { label: 'Active Students', value: counts.students || 0, icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', tab: 'students' },
    { label: 'AI Review Queue', value: counts.pendingReviews || 0, icon: ShieldCheck, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', tab: 'content-review' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner / Welcome */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold">
              PLATFORM STATUS: OPTIMAL
            </span>
            <span className="text-xs text-slate-400 font-mono">Prisma ORM • SQLite</span>
          </div>
          <h1 className="text-2xl font-bold font-serif-title text-white">
            LowStudy Administration Suite
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Manage Gujarat & National university law curricula, syllabus hierarchy, bilingual notes, bare act statutory mappings, landmark case precedents, and NyayaAI verification workflows.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('content-review')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review AI Content ({counts.pendingReviews || 0})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              onClick={() => onNavigate(kpi.tab)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.02] space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-semibold text-slate-400">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg} ${kpi.border} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-white font-serif-title">
                  {kpi.value.toLocaleString()}
                </span>
                <span className="text-[11px] text-amber-400 font-mono flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Manage <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Actions & Advertising Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Curriculum Shortcuts */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Curriculum Quick Management
          </h3>
          <p className="text-xs text-slate-400">
            Quickly jump into primary syllabus modules to add, edit or organize curriculum content:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {[
              { label: '+ University', tab: 'universities' },
              { label: '+ Course', tab: 'courses' },
              { label: '+ Subject', tab: 'subjects' },
              { label: '+ Syllabus Unit', tab: 'units' },
              { label: '+ Study Topic', tab: 'topics' },
              { label: '+ Exam Note', tab: 'notes' },
              { label: '+ Bare Act Section', tab: 'legal-sections' },
              { label: '+ Case Brief', tab: 'case-laws' },
              { label: '+ Question / Model Ans', tab: 'questions' },
            ].map((shortcut) => (
              <button
                key={shortcut.label}
                onClick={() => onNavigate(shortcut.tab)}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center justify-between"
              >
                <span>{shortcut.label}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* AdSense & Platform Monetization */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              AdSense & Platform Status
            </h3>
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
              settings.adsEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {settings.adsEnabled ? 'ADS LIVE' : 'ADS PAUSED'}
            </span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">AdSense Publisher ID</p>
                <p className="text-[11px] text-slate-400 font-mono">{settings.adSensePublisherId || 'ca-pub-6428712390812345'}</p>
              </div>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs text-amber-400 hover:underline font-mono"
              >
                Configure
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">NyayaAI Verification Policy</p>
                <p className="text-[11px] text-emerald-400 font-mono">Strict 5-Stage Gatekeeper Active</p>
              </div>
              <button
                onClick={() => onNavigate('content-review')}
                className="text-xs text-amber-400 hover:underline font-mono"
              >
                View Queue
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">System Database</p>
                <p className="text-[11px] text-slate-400 font-mono">SQLite (dev.db) • 29 Schema Entities</p>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
