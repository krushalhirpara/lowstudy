"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Layers,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';
import TopicCard from '@/components/academic/TopicCard';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL, INCOMPLETE, COMPLETED, BOOKMARKED

  useEffect(() => {
    if (!unitId) return;
    fetchUnit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function fetchUnit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academic/unit/${unitId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load unit details');
      }
      setData(json.unit);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle local optimistic update when a topic is completed or bookmarked
  const handleToggleComplete = async (topicId, isCompleted) => {
    if (!data) return;
    // Update local state
    const updatedTopics = data.topics.map(t => {
      if (t.id === topicId) {
        return { ...t, isCompleted };
      }
      return t;
    });
    const completedCount = updatedTopics.filter(t => t.isCompleted).length;
    const completionPercentage = updatedTopics.length > 0 
      ? Math.round((completedCount / updatedTopics.length) * 100) 
      : 0;

    setData({
      ...data,
      topics: updatedTopics,
      completedTopics: completedCount,
      completionPercentage
    });

    // Send API request
    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          isCompleted,
          action: 'toggleCompletion'
        })
      });
    } catch (err) {
      console.error('Failed to sync completion:', err);
    }
  };

  const handleToggleBookmark = async (topicId, isBookmarked) => {
    if (!data) return;
    const updatedTopics = data.topics.map(t => {
      if (t.id === topicId) {
        return { ...t, isBookmarked };
      }
      return t;
    });
    setData({
      ...data,
      topics: updatedTopics
    });

    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          action: 'toggleBookmark'
        })
      });
    } catch (err) {
      console.error('Failed to sync bookmark:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading unit curriculum & topics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Unit Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'Unable to retrieve unit details.'}</p>
          <Link
            href="/academic"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    unitNumber,
    title,
    description,
    totalTopics,
    completedTopics,
    completionPercentage,
    topics = [],
    subject = {},
    breadcrumbs = {},
    navigation = {}
  } = data;

  // Filter topics based on search query and completion/bookmark filters
  const filteredTopics = topics.filter(t => {
    // Mode filter
    if (filterMode === 'INCOMPLETE' && t.isCompleted) return false;
    if (filterMode === 'COMPLETED' && !t.isCompleted) return false;
    if (filterMode === 'BOOKMARKED' && !t.isBookmarked) return false;

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = t.title.toLowerCase().includes(q);
    const matchesDesc = t.description && t.description.toLowerCase().includes(q);
    const matchesSub = t.subtopics && t.subtopics.some(st => st.title.toLowerCase().includes(q));
    return matchesTitle || matchesDesc || matchesSub;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

        {/* Breadcrumbs: University -> Course -> Semester -> Subject -> Unit */}
        <AcademicBreadcrumbs
          items={[
            { label: breadcrumbs.university?.name || 'Saurashtra University', href: '/academic' },
            { label: breadcrumbs.course?.name || '3-Year LL.B.', href: '/academic' },
            { label: `Semester ${breadcrumbs.semester?.semesterNumber || 3}`, href: '/academic' },
            { label: `${subject.code} - ${subject.title}`, href: `/academic/subject/${subject.id}` },
            { label: `Unit ${unitNumber}: ${title}` }
          ]}
        />

        {/* 5. Unit Detail Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Header tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black tracking-wide uppercase">
                UNIT {unitNumber}
              </span>
              <Link
                href={`/academic/subject/${subject.id}`}
                className="px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-semibold hover:text-amber-400 hover:border-amber-500/40 transition"
              >
                {subject.code} &bull; {subject.title}
              </Link>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Syllabus</span>
              </span>
            </div>

            {/* Unit Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Unit Metrics & Progress Bar */}
            <div className="bg-slate-850/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Unit Progress: {completionPercentage}% Completed
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400">
                  <span className="text-emerald-400 font-bold">{completedTopics}</span> of {totalTopics} topics studied
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Previous / Next Unit Navigation Bar */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-800/80">
          {navigation?.prevUnit ? (
            <Link
              href={`/academic/unit/${navigation.prevUnit.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Previous Unit</div>
                <div className="truncate max-w-[140px] sm:max-w-xs">Unit {navigation.prevUnit.unitNumber}: {navigation.prevUnit.title}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">First unit in subject</div>
          )}

          <Link
            href={`/academic/subject/${subject.id}`}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            All Units
          </Link>

          {navigation?.nextUnit ? (
            <Link
              href={`/academic/unit/${navigation.nextUnit.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Next Unit</div>
                <div className="truncate max-w-[140px] sm:max-w-xs">Unit {navigation.nextUnit.unitNumber}: {navigation.nextUnit.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Last unit in subject</div>
          )}
        </div>

        {/* Evidence-Based Unit Priority Questions */}
        {data.priorityQuestions && data.priorityQuestions.length > 0 && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  High-Yield Evidence Priority Questions in Unit {unitNumber}
                </h2>
              </div>
              <Link
                href={`/question-bank?subject=${subject.id}&unit=${unitNumber}`}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
              >
                <span>View All in Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.priorityQuestions.map(q => {
                const priorityClass =
                  q.priority_label === 'Very High Priority'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : q.priority_label === 'High Priority'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : q.priority_label === 'Important'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300';

                return (
                  <div key={q.id} className="bg-slate-850/90 border border-slate-750 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${priorityClass}`}>
                        {q.priority_label || 'Practice'}
                      </span>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {q.marks} Marks &bull; Score: {q.priority_score}/100
                      </span>
                    </div>

                    <Link href={`/question-bank/${q.id}`} className="block group">
                      <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-400 transition line-clamp-2">
                        {q.questionText}
                      </p>
                    </Link>

                    {q.why_important && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <strong className="text-amber-300 font-semibold">Why this is important: </strong>
                        {q.why_important}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-[11px] text-slate-500 italic text-center pt-1">
              Evidence-based educational classification derived from syllabus weight and verified past exam papers. LowStudy does not predict or guarantee upcoming examination questions.
            </p>
          </section>
        )}

        {/* 6. Topic Listing Section Header with Filters & Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Syllabus Topics ({filteredTopics.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Official syllabus topics for Unit {unitNumber}. Click to begin in-depth study.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Filter Pills */}
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({topics.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('INCOMPLETE')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterMode === 'INCOMPLETE'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({topics.length - completedTopics})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterMode === 'COMPLETED'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Done ({completedTopics})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('BOOKMARKED')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterMode === 'BOOKMARKED'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Saved
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Topic Cards List */}
          {filteredTopics.length > 0 ? (
            <div className="space-y-3">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onToggleComplete={handleToggleComplete}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No topics match your current criteria</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try switching the filter tab or clearing your search term.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterMode('ALL'); }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-amber-400 text-xs font-semibold hover:bg-slate-750"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
