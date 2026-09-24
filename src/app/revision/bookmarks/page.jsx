"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bookmark, 
  BookMarked, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Scale, 
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function BookmarksRevisionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL'); // ALL, NEED_REVISION, REVIEW_AGAIN, MASTERED
  const [entityType, setEntityType] = useState('ALL'); // ALL, QUESTION, NOTE, LEGAL_SECTION, CASE_LAW, MCQ
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [category, entityType]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'ALL') params.append('category', category);
      if (entityType !== 'ALL') params.append('entityType', entityType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/revision/bookmarks?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookmarks();
  };

  const stats = data?.stats || { total: 0, needRevision: 0, reviewAgain: 0, mastered: 0 };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-sky-500/20 selection:text-sky-300">
      
      {/* Top Banner & Breadcrumbs */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href="/revision" className="hover:text-amber-400 transition-colors">Revision</Link>
                <span>/</span>
                <span className="text-sky-400">Bookmarks</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-sky-400" />
                Bookmarked Study Items
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Questions, Notes, Sections, and Landmark Cases saved for focused revision and spaced repetition.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/revision/session"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Start Revision Session
              </Link>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/60 overflow-x-auto pb-1 text-sm font-semibold">
            <Link
              href="/revision"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
            >
              <BookMarked className="w-4 h-4" />
              My Revision Hub
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
              className="px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center gap-2"
            >
              <Bookmark className="w-4 h-4" />
              Saved Bookmarks ({stats.total})
            </Link>
            <Link
              href="/revision/session"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors ml-auto text-amber-300 font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Revision Session
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Category Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setCategory(category === 'NEED_REVISION' ? 'ALL' : 'NEED_REVISION')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'NEED_REVISION'
                ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Need Revision
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded">
                0/3 Streak
              </span>
            </div>
            <div className="text-3xl font-black text-rose-400">{stats.needRevision}</div>
            <p className="text-xs text-slate-400 mt-1">Pending first thorough review</p>
          </button>

          <button
            onClick={() => setCategory(category === 'REVIEW_AGAIN' ? 'ALL' : 'REVIEW_AGAIN')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'REVIEW_AGAIN'
                ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                Review Again
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                1-2/3 Streak
              </span>
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.reviewAgain}</div>
            <p className="text-xs text-slate-400 mt-1">Under spaced review cycle</p>
          </button>

          <button
            onClick={() => setCategory(category === 'MASTERED' ? 'ALL' : 'MASTERED')}
            className={`text-left rounded-2xl p-5 border transition-all ${
              category === 'MASTERED'
                ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mastered
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                3/3 Streak
              </span>
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.mastered}</div>
            <p className="text-xs text-slate-400 mt-1">High confidence retained</p>
          </button>
        </div>

        {/* Filter Pills and Search */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              {['ALL', 'NEED_REVISION', 'REVIEW_AGAIN', 'MASTERED'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    category === cat
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {[
              { key: 'ALL', label: 'All Items' },
              { key: 'QUESTION', label: 'Questions' },
              { key: 'NOTE', label: 'Notes' },
              { key: 'LEGAL_SECTION', label: 'Sections' },
              { key: 'CASE_LAW', label: 'Case Laws' }
            ].map((pill) => (
              <button
                key={pill.key}
                onClick={() => setEntityType(pill.key)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  entityType === pill.key
                    ? 'bg-slate-800 text-sky-300 border-sky-500/40 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-400">Loading bookmarks...</div>
          </div>
        ) : !data?.bookmarks || data.bookmarks.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No bookmarked items found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Bookmark questions, sections, case laws, or notes while studying to save them into your personalized revision space.
            </p>
            <div className="pt-2">
              <Link
                href="/question-bank"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-2"
              >
                Explore Question Bank
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.bookmarks.map((bm) => {
              const p = bm.payload || {};
              const isMastered = bm.revisionStatus === 'MASTERED';
              const isReviewAgain = bm.revisionStatus === 'REVIEW_AGAIN';
              const streak = bm.correctReviewCount || 0;

              return (
                <div
                  key={bm.id}
                  className={`bg-slate-900/70 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 ${
                    isMastered ? 'border-emerald-500/20' :
                    isReviewAgain ? 'border-amber-500/20' :
                    'border-rose-500/20'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${p.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {p.typeLabel || bm.entityType}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1" title={`${streak} of 3 correct reviews to Mastered`}>
                          {[1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className={`w-2 h-2 rounded-full ${
                                streak >= step
                                  ? isMastered ? 'bg-emerald-400' : 'bg-amber-400'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>

                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isMastered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          isReviewAgain ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {bm.revisionStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-400">{p.subtitle}</div>
                      <h4 className="text-base font-bold text-white mt-1 line-clamp-2 leading-snug">
                        {p.title}
                      </h4>
                    </div>

                    {p.preview && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                        {p.preview}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      Reviews: <strong className="text-slate-200">{bm.reviewCount}</strong>
                    </div>

                    {p.url && (
                      <Link
                        href={p.url}
                        className="font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 group"
                      >
                        Study Item
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
