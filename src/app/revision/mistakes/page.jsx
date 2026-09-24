"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  HelpCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  ArrowRight, 
  AlertCircle, 
  Languages, 
  Award,
  BookMarked,
  Layers,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function MyMistakesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL'); // ALL, NEED_REVISION, REVIEW_AGAIN, MASTERED
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive "Try Again" states: map of wrongAnswerId => { selectedKey, submitting, result }
  const [tryAgainMap, setTryAgainMap] = useState({});
  const [showGujaratiMap, setShowGujaratiMap] = useState({});

  useEffect(() => {
    fetchMistakes();
  }, [category]);

  const fetchMistakes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'ALL') params.append('category', category);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/revision/mistakes?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error loading mistake book:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMistakes();
  };

  const toggleTryAgain = (id) => {
    setTryAgainMap(prev => ({
      ...prev,
      [id]: prev[id]?.isOpen ? null : { isOpen: true, selectedKey: null, result: null, submitting: false }
    }));
  };

  const selectTryAgainOption = (id, key) => {
    setTryAgainMap(prev => ({
      ...prev,
      [id]: { ...prev[id], selectedKey: key, error: null }
    }));
  };

  const submitTryAgain = async (id) => {
    const state = tryAgainMap[id];
    if (!state || !state.selectedKey) return;

    setTryAgainMap(prev => ({
      ...prev,
      [id]: { ...prev[id], submitting: true, error: null }
    }));

    try {
      const res = await fetch('/api/revision/mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wrongAnswerId: id,
          selectedKey: state.selectedKey
        })
      });
      const result = await res.json();
      if (result.success) {
        setTryAgainMap(prev => ({
          ...prev,
          [id]: { ...prev[id], submitting: false, result }
        }));

        // Update item locally
        setData(prev => {
          if (!prev) return prev;
          const updatedMistakes = prev.mistakes.map(m => {
            if (m.id === id) {
              return {
                ...m,
                status: result.newStatus,
                correctReviewCount: result.correctReviewCount,
                reviewCount: result.reviewCount,
                isResolved: result.isMastered,
                lastReviewed: new Date().toISOString(),
                studentAnswer: {
                  key: result.selectedKey,
                  text: m.options.find(o => o.key === result.selectedKey)?.text || result.selectedKey
                }
              };
            }
            return m;
          });

          return {
            ...prev,
            mistakes: updatedMistakes
          };
        });
      } else {
        setTryAgainMap(prev => ({
          ...prev,
          [id]: { ...prev[id], submitting: false, error: result.error || 'Failed to submit.' }
        }));
      }
    } catch (err) {
      setTryAgainMap(prev => ({
        ...prev,
        [id]: { ...prev[id], submitting: false, error: 'Network error occurred.' }
      }));
    }
  };

  const toggleLanguage = (id) => {
    setShowGujaratiMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const stats = data?.stats || { totalMistakes: 0, needRevision: 0, reviewAgain: 0, mastered: 0 };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-rose-500/20 selection:text-rose-300">
      
      {/* Top Banner & Navigation */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href="/revision" className="hover:text-amber-400 transition-colors">Revision</Link>
                <span>/</span>
                <span className="text-rose-400">My Mistakes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-rose-400" />
                Mistake Notebook
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Every wrong MCQ and Mock Test answer automatically cataloged here. Re-attempt to advance retention from Need Revision to Mastered.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/revision"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <BookMarked className="w-4 h-4 text-amber-400" />
                All Revision ({stats.totalMistakes})
              </Link>
              <Link
                href="/quiz"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Award className="w-4 h-4" />
                MCQ Practice
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
              className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              My Mistakes ({stats.totalMistakes})
            </Link>
            <Link
              href="/revision/bookmarks"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors"
            >
              Saved Bookmarks
            </Link>
            <Link
              href="/revision/session"
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 flex items-center gap-2 transition-colors ml-auto text-amber-300 font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Start Practice Session
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
            <p className="text-xs text-slate-400 mt-1">Immediate practice recommended</p>
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
            <p className="text-xs text-slate-400 mt-1">Strengthen memory retention</p>
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
            <p className="text-xs text-slate-400 mt-1">Successfully resolved mistakes</p>
          </button>
        </div>

        {/* Search & Active Category Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Category:</span>
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              {['ALL', 'NEED_REVISION', 'REVIEW_AGAIN', 'MASTERED'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    category === cat
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search mistake questions, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Mistakes List */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-400">Loading mistake notebook...</div>
          </div>
        ) : !data?.mistakes || data.mistakes.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">No mistakes in this category</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Whenever you answer an MCQ or Mock Test question incorrectly, it will automatically appear here with student answer, correct answer, explanation, and topic revision links.
            </p>
            <div className="pt-2">
              <Link
                href="/quiz"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Practice MCQs Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {data.mistakes.map((item, index) => {
              const isGujarati = showGujaratiMap[item.id] || false;
              const tryState = tryAgainMap[item.id];
              const isMastered = item.status === 'MASTERED';
              const isReviewAgain = item.status === 'REVIEW_AGAIN';
              const streak = item.correctReviewCount || 0;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-900/80 border rounded-2xl p-6 space-y-5 transition-all ${
                    isMastered ? 'border-emerald-500/30 bg-slate-900/50' :
                    isReviewAgain ? 'border-amber-500/30' :
                    'border-rose-500/30'
                  }`}
                >
                  {/* Top Bar: Academic Context & Progression Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {item.relatedTopic ? (
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          {item.relatedTopic.subjectCode} • Unit {item.relatedTopic.unitNumber}: {item.relatedTopic.title}
                        </span>
                      ) : (
                        <span className="text-slate-400">General Legal Knowledge</span>
                      )}
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-[11px]">
                        Mistakes recorded: <strong className="text-rose-400">{item.mistakeCount}</strong>
                      </span>
                    </div>

                    {/* Progression Indicators */}
                    <div className="flex items-center gap-2.5">
                      {/* Streak Dots */}
                      <div className="flex items-center gap-1" title={`${streak} of 3 correct reviews to Mastered`}>
                        {[1, 2, 3].map((step) => (
                          <div
                            key={step}
                            className={`w-2.5 h-2.5 rounded-full ${
                              streak >= step
                                ? isMastered ? 'bg-emerald-400' : 'bg-amber-400'
                                : 'bg-slate-800 border border-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isMastered ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        isReviewAgain ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>

                      {/* Gujarati Translation Toggle */}
                      {item.questionGu && (
                        <button
                          onClick={() => toggleLanguage(item.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Languages className="w-3.5 h-3.5 text-amber-400" />
                          {isGujarati ? 'English' : 'ગુજરાતી'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1. Question */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Question</span>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                      {isGujarati && item.questionGu ? item.questionGu : item.question}
                    </h3>
                  </div>

                  {/* 2 & 3. Student Answer vs Correct Answer Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Student Answer */}
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          Your Student Answer
                        </span>
                        <span className="font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px]">
                          Option {item.studentAnswer.key}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-rose-200 pt-1">
                        {item.studentAnswer.text}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Official Correct Answer
                        </span>
                        <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px]">
                          Option {item.correctAnswer.key}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-emerald-200 pt-1">
                        {item.correctAnswer.text}
                      </div>
                    </div>

                  </div>

                  {/* 4. Explanation */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Legal Explanation & Statutory Rationale
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-0.5">
                      {isGujarati && item.explanationGu ? item.explanationGu : item.explanation}
                    </p>
                  </div>

                  {/* 5, 6, 7: Related Topic, Revise Topic, Try Again Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Related Topic with Link */}
                    {item.relatedTopic ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Related Topic:</span>
                        <Link
                          href={item.relatedTopic.reviseUrl}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                        >
                          {item.relatedTopic.title}
                          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </div>
                    ) : <div />}

                    {/* Actions: Revise Topic & Try Again */}
                    <div className="flex items-center gap-2.5">
                      {item.relatedTopic && (
                        <Link
                          href={item.relatedTopic.reviseUrl}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          Revise Topic
                        </Link>
                      )}

                      <button
                        onClick={() => toggleTryAgain(item.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          tryState?.isOpen
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {tryState?.isOpen ? 'Close Try Again' : 'Try Again'}
                      </button>
                    </div>

                  </div>

                  {/* Interactive "Try Again" Tray */}
                  {tryState?.isOpen && (
                    <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/30 space-y-4 animate-in fade-in-50 duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-rose-400" />
                          Re-Attempt MCQ Now
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Select the correct answer to advance retention
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.options.map((opt) => {
                          const isSelected = tryState.selectedKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => selectTryAgainOption(item.id, opt.key)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-start gap-2.5 transition-all ${
                                isSelected
                                  ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500/40'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {tryState.error && (
                        <div className="text-xs text-rose-400 font-semibold">{tryState.error}</div>
                      )}

                      {tryState.result && (
                        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-3 ${
                          tryState.result.isCorrect
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200'
                            : 'bg-rose-500/15 border-rose-500 text-rose-200'
                        }`}>
                          {tryState.result.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-sm">
                              {tryState.result.isCorrect ? 'Correct! Streak updated.' : 'Still Incorrect. Review the explanation.'}
                            </div>
                            <div className="text-[11px] text-slate-300 mt-0.5">
                              New Status: <strong className="uppercase">{tryState.result.newStatus.replace('_', ' ')}</strong> ({tryState.result.correctReviewCount}/3 to Mastered)
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => submitTryAgain(item.id)}
                          disabled={!tryState.selectedKey || tryState.submitting}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                          {tryState.submitting ? 'Checking...' : 'Submit Attempt'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Footer: Review Tracking Details */}
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Last Attempt: {item.lastReviewed ? new Date(item.lastReviewed).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                    </span>
                    <span>
                      Total Reviews: <strong className="text-slate-300">{item.reviewCount || 0}</strong> • Consecutive Correct: <strong className="text-emerald-400">{item.correctReviewCount || 0}</strong>
                    </span>
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
