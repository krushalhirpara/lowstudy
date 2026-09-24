"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  X, 
  BookOpen, 
  Scale, 
  FileText, 
  Layers, 
  Award, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  CornerDownLeft
} from 'lucide-react';
import { LANDMARK_CASES, IPC_VS_BNS_MAP } from '@/data/legalData';
import { GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'subjects', 'bare-acts', 'cases', 'syllabus'
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveFilter('all');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedQuery = query.trim().toLowerCase();

  // 1. Search Subjects
  const matchedSubjects = trimmedQuery
    ? ALL_SYLLABUS_SUBJECTS.filter(s => 
        s.title.toLowerCase().includes(trimmedQuery) ||
        s.shortCode.toLowerCase().includes(trimmedQuery) ||
        s.category?.toLowerCase().includes(trimmedQuery)
      ).slice(0, 4)
    : [];

  // 2. Search Bare Acts & BNS Map
  const matchedBareActs = trimmedQuery
    ? IPC_VS_BNS_MAP.filter(b => 
        b.offence.toLowerCase().includes(trimmedQuery) ||
        b.ipc.toLowerCase().includes(trimmedQuery) ||
        b.bns.toLowerCase().includes(trimmedQuery)
      ).slice(0, 4)
    : [];

  // 3. Search Case Laws
  const matchedCases = trimmedQuery
    ? LANDMARK_CASES.filter(c => 
        c.title.toLowerCase().includes(trimmedQuery) ||
        c.citation.toLowerCase().includes(trimmedQuery) ||
        c.principle.toLowerCase().includes(trimmedQuery) ||
        c.subject.toLowerCase().includes(trimmedQuery)
      ).slice(0, 4)
    : [];

  // 4. Search Universities
  const matchedUnis = trimmedQuery
    ? GUJARAT_UNIVERSITIES.filter(u => 
        u.name.toLowerCase().includes(trimmedQuery) ||
        u.shortName.toLowerCase().includes(trimmedQuery) ||
        u.city?.toLowerCase().includes(trimmedQuery)
      ).slice(0, 3)
    : [];

  const handleFullSearch = (e) => {
    e.preventDefault();
    if (!trimmedQuery) return;
    onClose();
    router.push(`/research?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const hasResults = matchedSubjects.length > 0 || matchedBareActs.length > 0 || matchedCases.length > 0 || matchedUnis.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 sm:pt-20 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-auto sm:my-0 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form onSubmit={handleFullSearch} className="relative flex items-center p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-amber-600 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, BNS sections, judgments, syllabus..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200 rounded-lg transition"
          >
            ESC
          </button>
        </form>

        {/* Filter Pills */}
        <div className="px-4 sm:px-5 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'subjects', label: 'Subjects' },
            { id: 'bare-acts', label: 'Bare Acts' },
            { id: 'cases', label: 'Case Laws' },
            { id: 'syllabus', label: 'Syllabus' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeFilter === tab.id
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-4">
          {!trimmedQuery ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Search LowStudy Knowledge Base</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Type any law subject, section (e.g. 103 BNS, 420 IPC), landmark case, or Gujarat university.
                </p>
              </div>

              {/* Quick Prompt Tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  'BNS Section 103(2)',
                  'Labour Law - I',
                  'Kesavananda Bharati',
                  'Saurashtra University Sem 3',
                  'Limitation Act'
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-medium border border-slate-200 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-10 text-center space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No immediate matches for "{query}"</h3>
              <p className="text-xs text-slate-500">
                Press Enter to run a comprehensive legal research and ratio search.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFullSearch}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <span>Search Legal Research Database</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subjects Category */}
              {(activeFilter === 'all' || activeFilter === 'subjects') && matchedSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Law Subjects
                  </span>
                  <div className="space-y-1">
                    {matchedSubjects.map((s) => (
                      <Link
                        key={s.id}
                        href={`/subjects/${s.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50/70 border border-slate-100 hover:border-amber-200 transition group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {s.shortCode}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                              {s.title}
                            </h4>
                            <p className="text-[10px] text-slate-500">{s.category} • Semester {s.semesterId?.replace('sem', '') || 1}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Bare Acts & BNS Category */}
              {(activeFilter === 'all' || activeFilter === 'bare-acts') && matchedBareActs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" /> Bare Acts & Sections (BNS ↔ IPC)
                  </span>
                  <div className="space-y-1">
                    {matchedBareActs.map((b, idx) => (
                      <Link
                        key={idx}
                        href="/bns-vs-ipc"
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition group"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                              {b.offence}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {b.bns}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{b.ipc} &bull; {b.change}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Laws Category */}
              {(activeFilter === 'all' || activeFilter === 'cases') && matchedCases.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-purple-600" /> Landmark Judgments
                  </span>
                  <div className="space-y-1">
                    {matchedCases.map((c) => (
                      <Link
                        key={c.id}
                        href="/case-laws"
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50/70 border border-slate-100 hover:border-purple-200 transition group"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-900 truncate">
                            {c.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono line-clamp-1">
                            {c.citation} &bull; {c.principle}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Universities Category */}
              {(activeFilter === 'all' || activeFilter === 'syllabus') && matchedUnis.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> Gujarat Universities
                  </span>
                  <div className="space-y-1">
                    {matchedUnis.map((u) => (
                      <Link
                        key={u.id}
                        href={`/universities/${u.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg">{u.logo}</span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                              {u.name}
                            </h4>
                            <p className="text-[10px] text-slate-500">{u.city} &bull; Verified Syllabus 2026-27</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700 shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700 shadow-2xs">↓</kbd>
              to navigate
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700 shadow-2xs">ESC</kbd>
              to close
            </span>
          </div>

          <button
            type="button"
            onClick={handleFullSearch}
            className="text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
          >
            <span>Full Research Search</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
