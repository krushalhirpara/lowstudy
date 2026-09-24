"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  Circle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  Award,
  ArrowRight,
  RotateCcw,
  Check,
  Clock,
  HelpCircle,
  GraduationCap,
  X,
  PenTool
} from 'lucide-react';

export default function QuestionBankPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ totalCount: 0, page: 1, limit: 20, totalPages: 1 });
  
  // Available filter options
  const [filterMeta, setFilterMeta] = useState({
    subjects: [],
    marks: [2, 5, 10, 14],
    difficulties: ['EASY', 'MEDIUM', 'HARD'],
    totalQuestions: 0,
    pyqCount: 0,
    originalPracticeCount: 0
  });

  // Active filters
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedMarks, setSelectedMarks] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedSource, setSelectedSource] = useState('ALL'); // 'ALL', 'PYQ', 'ORIGINAL_PRACTICE'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch filter metadata on initial load
  useEffect(() => {
    fetchFilterMetadata();
  }, []);

  // Fetch questions whenever filters change
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedUnit, selectedTopic, selectedMarks, selectedDifficulty, selectedPriority, selectedSource, searchQuery, currentPage]);

  async function fetchFilterMetadata() {
    try {
      const res = await fetch('/api/questions?meta=true');
      const json = await res.json();
      if (json.success && json.filters) {
        setFilterMeta(json.filters);
      }
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  }

  async function fetchQuestions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.set('subjectId', selectedSubject);
      if (selectedUnit) params.set('unitId', selectedUnit);
      if (selectedTopic) params.set('topicId', selectedTopic);
      if (selectedMarks) params.set('marks', selectedMarks);
      if (selectedDifficulty && selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
      if (selectedPriority && selectedPriority !== 'ALL') params.set('priority', selectedPriority);
      if (selectedSource && selectedSource !== 'ALL') params.set('source', selectedSource);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', currentPage.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/questions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.questions || []);
        setPagination(json.pagination || { totalCount: 0, page: 1, limit: 15, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  }

  // Student Action: Bookmark Toggle
  const handleToggleBookmark = async (e, questionId) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, isBookmarked: !q.isBookmarked } : q)
    );

    try {
      await fetch('/api/academic/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'QUESTION',
          topicId: questionId, // progress endpoint handles entityId as topicId
          action: 'toggleBookmark'
        })
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Student Action: Mark as Practiced Toggle
  const handleTogglePracticed = async (e, questionId) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic UI update
    setQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, isPracticed: !q.isPracticed } : q)
    );

    try {
      await fetch('/api/questions/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
    } catch (err) {
      console.error('Failed to toggle practiced status:', err);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedSubject('');
    setSelectedUnit('');
    setSelectedTopic('');
    setSelectedMarks('');
    setSelectedDifficulty('ALL');
    setSelectedPriority('ALL');
    setSelectedSource('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Find active subject's units for cascading dropdown
  const activeSubjectObj = filterMeta.subjects.find(s => s.id === selectedSubject);
  const activeUnitObj = activeSubjectObj?.units.find(u => u.id === selectedUnit);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* 1. Header & KPI Metrics Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified University Law Question Bank</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Law Exam Question Bank
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Comprehensive repository of 2 Marks, 5 Marks, 10 Marks, and Long Answer questions with structured 9-part model answers.
              </p>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
                <div className="text-xs text-slate-400 font-medium">Total Questions</div>
                <div className="text-2xl font-black text-white mt-0.5">{filterMeta.totalQuestions || 4443}</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
                <div className="text-xs text-amber-400 font-medium">Previous Year</div>
                <div className="text-2xl font-black text-amber-400 mt-0.5">{filterMeta.pyqCount || 6}</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center">
                <div className="text-xs text-emerald-400 font-medium">Practice Qs</div>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{filterMeta.originalPracticeCount || 4437}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Search & Source Filter Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Source Tabs: All vs PYQ vs Original Practice */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold self-start">
            <button
              type="button"
              onClick={() => { setSelectedSource('ALL'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl transition ${
                selectedSource === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Questions
            </button>
            <button
              type="button"
              onClick={() => { setSelectedSource('PYQ'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                selectedSource === 'PYQ'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏛️ Previous Year</span>
              {filterMeta.pyqCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-amber-600/30 text-[10px] font-bold">
                  {filterMeta.pyqCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setSelectedSource('ORIGINAL_PRACTICE'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                selectedSource === 'ORIGINAL_PRACTICE'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>✍️ Original Practice</span>
            </button>
          </div>

          {/* Search Input & Mobile Filter Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search question, sections, cases..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
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

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Main Content: Sidebar Filters + Question Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-amber-400 hover:underline font-medium"
              >
                Reset All
              </button>
            </div>

            {/* Subject Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedUnit('');
                  setSelectedTopic('');
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">All Subjects</option>
                {filterMeta.subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.shortCode} - {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Cascading Unit Filter */}
            {activeSubjectObj && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Unit</label>
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value);
                    setSelectedTopic('');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">All Units</option>
                  {activeSubjectObj.units.map(u => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}: {u.title.substring(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cascading Topic Filter */}
            {activeUnitObj && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">All Topics</option>
                  {activeUnitObj.topics.map(t => (
                    <option key={t.id} value={t.id}>
                      Topic {t.topicNumber}: {t.title.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Marks Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Marks</label>
              <div className="grid grid-cols-2 gap-2">
                {['', '2', '5', '10', '14'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setSelectedMarks(m); setCurrentPage(1); }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      selectedMarks === m
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m ? `${m} Marks` : 'Any Marks'}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Difficulty</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setSelectedDifficulty(d); setCurrentPage(1); }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      selectedDifficulty === d
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Priority Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Evidence Priority</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'All Priorities', val: 'ALL' },
                  { label: '🔴 Very High Priority', val: 'Very High Priority' },
                  { label: '🟠 High Priority', val: 'High Priority' },
                  { label: '🔵 Important', val: 'Important' },
                  { label: '⚪ Practice', val: 'Practice' }
                ].map(p => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => { setSelectedPriority(p.val); setCurrentPage(1); }}
                    className={`py-1.5 px-2.5 rounded-lg text-left text-xs font-bold border transition ${
                      selectedPriority === p.val
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                        : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Question Cards List */}
          <main className="lg:col-span-3 space-y-4">
            
            {/* Header Result Count */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Showing <strong>{questions.length}</strong> of <strong>{pagination.totalCount}</strong> questions</span>
              {(selectedSubject || selectedMarks || selectedDifficulty !== 'ALL' || selectedPriority !== 'ALL' || selectedSource !== 'ALL' || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-amber-400 hover:underline"
                >
                  Clear active filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading questions from bank...</p>
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`group bg-slate-900/90 rounded-2xl border transition p-5 space-y-4 ${
                      q.isPracticed
                        ? 'border-emerald-800/40 bg-emerald-950/10'
                        : 'border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Card Top Metadata & Source Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Marks Badge */}
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs">
                          {q.marks} Marks
                        </span>

                        {/* Question Format / Style */}
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-[11px]">
                          {q.formatStyle || q.questionType}
                        </span>

                        {/* Subject & Unit */}
                        <span className="px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-750 text-slate-400 text-[11px]">
                          {q.subject.code} &bull; Unit {q.unit.unitNumber}
                        </span>

                        {/* Difficulty */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.difficulty === 'EASY'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : q.difficulty === 'HARD'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {q.difficulty}
                        </span>

                        {/* Evidence Priority Badge */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          q.priority_label === 'Very High Priority'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                            : q.priority_label === 'High Priority'
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                            : q.priority_label === 'Important'
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {q.priority_label || 'Practice'}
                        </span>

                        {q.priority_score > 0 && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
                            Score: {q.priority_score}/100
                          </span>
                        )}
                      </div>

                      {/* CLEAR DISTINCTION: PYQ vs Original Practice */}
                      {q.isPYQ ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          <span>🏛️ Previous Year Question</span>
                          {q.pyqInfo && (
                            <span className="text-[10px] text-amber-300/80 font-normal">
                              ({q.pyqInfo.examYear} {q.pyqInfo.examSession})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium">
                          <span>✍️ Original Practice Question</span>
                        </div>
                      )}
                    </div>

                    {/* Question Statement */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition leading-snug">
                        <Link href={`/question-bank/${q.id}`}>
                          {q.questionText}
                        </Link>
                      </h3>
                      {q.questionTextGu && (
                        <p className="text-xs text-amber-300/80 mt-1 font-medium">
                          {q.questionTextGu}
                        </p>
                      )}
                    </div>

                    {/* Evidence-Based Why This Is Important */}
                    {q.why_important && (
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-bold text-amber-300 mr-1.5">Why this is important:</span>
                          <span className="text-slate-300">{q.why_important}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Points preview if available */}
                    {q.quickPoints && q.quickPoints.length > 0 && (
                      <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-750/70 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Key Memory Points:
                        </span>
                        <div className="space-y-0.5">
                          {q.quickPoints.map((pt, i) => (
                            <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-amber-400">&bull;</span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                      {/* Left: Bookmark & Mark Practiced */}
                      <div className="flex items-center gap-2">
                        {/* Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, q.id)}
                          className={`p-2 rounded-xl border transition ${
                            q.isBookmarked
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                          }`}
                          title={q.isBookmarked ? 'Bookmarked' : 'Save Question'}
                        >
                          {q.isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-400" /> : <Bookmark className="w-4 h-4" />}
                        </button>

                        {/* Mark Practiced Button */}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePracticed(e, q.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            q.isPracticed
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-850 border-slate-750 text-slate-400 hover:text-white'
                          }`}
                        >
                          {q.isPracticed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Practiced</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              <span>Mark Practiced</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Right: Practice Writing & View Model Answer */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/question-bank/${q.id}/practice`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition duration-150 shadow-sm"
                        >
                          <PenTool className="w-3.5 h-3.5" />
                          <span>Practice Writing</span>
                        </Link>
                        <Link
                          href={`/question-bank/${q.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition duration-150 shadow-sm"
                        >
                          <span>Model Answer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
                    >
                      Previous Page
                    </button>
                    <span className="text-xs text-slate-400 font-medium">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= pagination.totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40"
                    >
                      Next Page
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-white">No questions match your filter criteria</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try clearing some filter tags or searching with different keywords.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-amber-400 text-xs font-bold hover:bg-slate-750 transition"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Drawer Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xs bg-slate-900 border-l border-slate-800 p-6 h-full overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span>Filters</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-850 border border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="">All Subjects</option>
                  {filterMeta.subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.shortCode} - {s.title}</option>
                  ))}
                </select>
              </div>

              {/* Marks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Marks</label>
                <div className="grid grid-cols-2 gap-2">
                  {['', '2', '5', '10', '14'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setSelectedMarks(m); setCurrentPage(1); }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        selectedMarks === m
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-850 border-slate-750 text-slate-400'
                      }`}
                    >
                      {m ? `${m} Marks` : 'Any'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
