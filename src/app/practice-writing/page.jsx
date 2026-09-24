"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Search,
  BookOpen,
  Sparkles,
  Award,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  ListOrdered,
  RotateCcw
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';

export default function PracticeWritingIndexPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarks, setSelectedMarks] = useState('ALL');

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedPriority, selectedMarks]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let url = `/api/questions?limit=50`;
      if (selectedSubject !== 'ALL') url += `&subjectId=${selectedSubject}`;
      if (selectedPriority !== 'ALL') url += `&priority=${selectedPriority}`;
      if (selectedMarks !== 'ALL') url += `&marks=${selectedMarks}`;
      if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setQuestions(json.data.questions || []);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins pb-20">
      
      {/* 1. Header Banner */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  Exam Writing Engine
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Saurashtra University &bull; LL.B. Sem 3
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-title text-white tracking-tight">
                Exam Answer Writing Practice
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Draft full-length legal answers under exam conditions and receive instant <strong>AI Practice Feedback</strong> evaluated against verified model answers, statutory sections, and landmark case precedents.
              </p>
            </div>

            {/* Quick Practice Info Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-4 text-xs font-mono">
              <div className="text-center px-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">10 Checks</p>
                <p className="text-base font-bold text-amber-400">Diagnostic</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Model Truth</p>
                <p className="text-base font-bold text-emerald-400">Verified</p>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Citation Check</p>
                <p className="text-base font-bold text-blue-400">Flagged</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* 2. Compliance Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300/90 flex items-start gap-3 shadow-md">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-white">
              Lowstudy Academic Compliance & Practice Advisory
            </p>
            <p className="leading-relaxed">
              Every written submission is evaluated with <span className="font-bold text-amber-300">AI Practice Feedback</span>. 
              This is strictly an educational self-assessment aid and <em>not official university marking</em>. 
              Lowstudy does not claim or guarantee examination marks. Any legal citations not in verified syllabus content are flagged for bare-act cross-referencing.
            </p>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question text, doctrine, or section..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Subject Filter */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              >
                <option value="ALL">All Subjects</option>
                <option value="su-sem3-220301">Labour Law - I (220301)</option>
                <option value="su-sem3-220302">Labour Law - II (220302)</option>
                <option value="su-sem3-220303">Taxation Laws (220303)</option>
                <option value="su-sem3-220304">Banking Laws (220304)</option>
                <option value="su-sem3-220305">Cyber & IT Laws (220305)</option>
              </select>
            </div>

            {/* Marks Filter */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Marks Weightage</label>
              <select
                value={selectedMarks}
                onChange={(e) => setSelectedMarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              >
                <option value="ALL">All Marks (2M, 5M, 10M, 14M)</option>
                <option value="14">14 Marks (Full Question)</option>
                <option value="10">10 Marks (Long Answer)</option>
                <option value="5">5 Marks (Short Note)</option>
                <option value="2">2 Marks (Definition)</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Evidence Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              >
                <option value="ALL">All Priorities</option>
                <option value="Very High Priority">Very High Priority</option>
                <option value="High Priority">High Priority</option>
                <option value="Important">Important</option>
                <option value="Practice">Practice</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Questions Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RotateCcw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p className="text-xs font-mono">Loading questions for writing practice...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
            <p>No questions matched your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Showing {questions.length} questions available for practice</span>
              <span>Click 'Write Answer' to launch workspace</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-4 shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold font-mono text-[10px]">
                          {q.marks} MARKS
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          [{q.subject?.code}] Unit {q.unit?.unitNumber}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px] font-bold">
                        {q.priority_label || 'Practice'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                      {q.questionText}
                    </h3>

                    {q.questionTextGu && (
                      <p className="text-xs text-amber-300/80 font-gujarati line-clamp-1">
                        {q.questionTextGu}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {q.formatStyle || q.questionType}
                    </span>

                    <Link
                      href={`/question-bank/${q.id}/practice`}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Write Answer</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
