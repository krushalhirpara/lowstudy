"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Search, 
  Filter, 
  Play, 
  Bookmark, 
  FileText, 
  Scale, 
  Award, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';

export default function RevisionHubPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL'); // ALL, NEED_REVISION, REVIEW_AGAIN, MASTERED
  const [entityType, setEntityType] = useState('ALL'); // ALL, NOTE, QUESTION, MCQ, LEGAL_SECTION, CASE_LAW, TOPIC
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRevisionData();
  }, [category, entityType]);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'ALL') params.append('category', category);
      if (entityType !== 'ALL') params.append('entityType', entityType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/revision?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching revision data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRevisionData();
  };

  const stats = data?.stats || {
    total: 0,
    needRevision: 0,
    reviewAgain: 0,
    mastered: 0,
    typeCounts: { NOTE: 0, QUESTION: 0, MCQ: 0, LEGAL_SECTION: 0, CASE_LAW: 0, TOPIC: 0 }
  };

  const masteryPercentage = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Top Banner & Breadcrumbs */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-amber-400">My Revision</span>
              </div>
              <h1 className="text-xl xs-360:text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2 sm:gap-3">
                <BookMarked className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
                <span>Revision & Mistake Book</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Evidence-based spaced repetition engine. Automatically collects weak topics, mistakes, bookmarks, sections, and case laws.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                href="/revision/session"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 btn-mobile-touch"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Start Revision Session</span>
              </Link>
              <Link
                href="/revision/mistakes"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all btn-mobile-touch"
              >
                <RotateCcw className="w-4 h-4" />
                <span>My Mistakes ({stats.typeCounts.MCQ || 0})</span>
              </Link>
              <Link
                href="/revision/bookmarks"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all btn-mobile-touch"
              >
                <Bookmark className="w-4 h-4 text-sky-400" />
                <span>Bookmarks</span>
              </Link>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/60 overflow-x-auto scrollbar-none pb-1 text-xs sm:text-sm font-semibold flex-nowrap">
            <Link
              href="/revision"
              className="px-3.5 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-2 shrink-0"
            >
              <BookMarked className="w-4 h-4" />
              <span>My Revision Hub</span>
            </Link>
            <Link
              href="/revision/mistakes"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              My Mistakes Notebook
            </Link>
            <Link
              href="/revision/bookmarks"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-sky-400" />
              Saved Bookmarks
            </Link>
            <Link
              href="/revision/session"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors ml-auto text-amber-300 font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Study Session Mode
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Status Metrics Cards (3 Categories) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Collected */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Items</span>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Auto-collected from 7 sources</span>
            </div>
          </div>

          {/* Need Revision Category */}
          <button
            onClick={() => setCategory(category === 'NEED_REVISION' ? 'ALL' : 'NEED_REVISION')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'NEED_REVISION'
                ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Need Revision
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                Interval: 1 Day
              </span>
            </div>
            <div className="text-3xl font-black text-rose-400">{stats.needRevision}</div>
            <div className="text-xs text-slate-400 mt-1">0/3 streak • Requires urgent focus</div>
          </button>

          {/* Review Again Category */}
          <button
            onClick={() => setCategory(category === 'REVIEW_AGAIN' ? 'ALL' : 'REVIEW_AGAIN')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'REVIEW_AGAIN'
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Review Again
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                Interval: 3 Days
              </span>
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.reviewAgain}</div>
            <div className="text-xs text-slate-400 mt-1">1-2/3 streak • In active retention</div>
          </button>

          {/* Mastered Category */}
          <button
            onClick={() => setCategory(category === 'MASTERED' ? 'ALL' : 'MASTERED')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'MASTERED'
                ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mastered
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                Interval: 14 Days
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.mastered}</div>
            <div className="text-xs text-slate-400 mt-1">3/3 streak verified • {masteryPercentage}% mastery</div>
          </button>

        </div>

        {/* Progression Logic Rationale Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Sensible Spaced Progression System
                <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded">Leitner Rule</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
                Items require <strong className="text-slate-200">3 consecutive correct reviews</strong> before unlocking <strong className="text-emerald-400">Mastered</strong>. A single failure immediately returns the item to <strong className="text-rose-400">Need Revision</strong>, preventing premature mastery.
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 bg-slate-950 p-3 rounded-xl border border-slate-800 shrink-0">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Curriculum Mastery</span>
              <span className="font-bold text-emerald-400">{masteryPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${(stats.mastered / (stats.total || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${(stats.reviewAgain / (stats.total || 1)) * 100}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${(stats.needRevision / (stats.total || 1)) * 100}%` }} className="bg-rose-500 h-full" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${category === 'ALL' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setCategory('NEED_REVISION')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${category === 'NEED_REVISION' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-400 hover:bg-rose-500/10'}`}
              >
                Need Revision ({stats.needRevision})
              </button>
              <button
                onClick={() => setCategory('REVIEW_AGAIN')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${category === 'REVIEW_AGAIN' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-amber-400 hover:bg-amber-500/10'}`}
              >
                Review Again ({stats.reviewAgain})
              </button>
              <button
                onClick={() => setCategory('MASTERED')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${category === 'MASTERED' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
              >
                Mastered ({stats.mastered})
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search topics, sections, cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Asset Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { key: 'ALL', label: 'All Formats', count: stats.total },
              { key: 'NOTE', label: 'Quick Notes', count: stats.typeCounts.NOTE },
              { key: 'QUESTION', label: 'Questions', count: stats.typeCounts.QUESTION },
              { key: 'MCQ', label: 'Wrong MCQs', count: stats.typeCounts.MCQ },
              { key: 'LEGAL_SECTION', label: 'Sections', count: stats.typeCounts.LEGAL_SECTION },
              { key: 'CASE_LAW', label: 'Case Laws', count: stats.typeCounts.CASE_LAW },
              { key: 'TOPIC', label: 'Weak Topics', count: stats.typeCounts.TOPIC }
            ].map(pill => (
              <button
                key={pill.key}
                onClick={() => setEntityType(pill.key)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  entityType === pill.key
                    ? 'bg-slate-800 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {pill.label} <span className="opacity-60 ml-1 text-[11px]">({pill.count || 0})</span>
              </button>
            ))}
          </div>

        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-400">Loading revision schedule...</div>
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No items found for this filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Items will automatically populate here as you practice MCQs, take mock tests, bookmark notes, or when weak topics are detected.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => { setCategory('ALL'); setEntityType('ALL'); setSearchQuery(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
              >
                Reset Filters
              </button>
              <Link
                href="/quiz"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all"
              >
                Take MCQ Practice
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.items.map((item) => {
              const d = item.details || {};
              const isMastered = item.revisionStatus === 'MASTERED';
              const isReviewAgain = item.revisionStatus === 'REVIEW_AGAIN';
              const isNeedRevision = item.revisionStatus === 'NEED_REVISION';

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 ${
                    isMastered ? 'border-emerald-500/20 hover:border-emerald-500/40' :
                    isReviewAgain ? 'border-amber-500/20 hover:border-amber-500/40' :
                    'border-rose-500/20 hover:border-rose-500/40'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header: Format Badge & Status Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${d.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {d.badgeText || item.entityType}
                      </span>

                      {/* Status Indicator */}
                      <div className="flex items-center gap-2">
                        {/* 3-Step Progression Dots */}
                        <div className="flex items-center gap-1" title={`${item.correctReviewCount || 0} of 3 reviews to Mastery`}>
                          {[1, 2, 3].map((step) => {
                            const filled = (item.correctReviewCount || 0) >= step;
                            return (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full ${
                                  filled
                                    ? isMastered ? 'bg-emerald-400' : 'bg-amber-400'
                                    : 'bg-slate-800'
                                }`}
                              />
                            );
                          })}
                        </div>

                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isMastered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          isReviewAgain ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {item.revisionStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div>
                      <div className="text-xs font-semibold text-slate-400">{d.subtitle}</div>
                      <h4 className="text-base font-bold text-white mt-1 line-clamp-2 leading-snug">
                        {d.title}
                      </h4>
                    </div>

                    {/* Content Preview if applicable */}
                    {d.preview && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                        {d.preview}
                      </p>
                    )}

                    {/* Punishment or Extra Statutory note */}
                    {d.punishment && (
                      <div className="text-[11px] text-amber-300/90 font-medium">
                        ⚖️ Punishment: {d.punishment}
                      </div>
                    )}
                  </div>

                  {/* Footer: Metadata & Action Link */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span>Reviews: <strong className="text-slate-200">{item.reviewCount || 0}</strong></span>
                      <span>•</span>
                      <span>Interval: <strong className="text-slate-200">{item.intervalDays || 1}d</strong></span>
                    </div>

                    {d.url ? (
                      <Link
                        href={d.url}
                        className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
                      >
                        Study Now
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    ) : (
                      <Link
                        href="/revision/session"
                        className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        Practice
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
