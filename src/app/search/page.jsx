"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  BookOpen, 
  Scale, 
  FileText, 
  Layers, 
  Building2, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { LANDMARK_CASES, IPC_VS_BNS_MAP } from '@/data/legalData';
import { GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'subjects', 'bare-acts', 'cases', 'syllabus'

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const trimmed = query.trim().toLowerCase();

  const matchedSubjects = trimmed
    ? ALL_SYLLABUS_SUBJECTS.filter(s => 
        s.title.toLowerCase().includes(trimmed) ||
        s.shortCode.toLowerCase().includes(trimmed) ||
        s.category?.toLowerCase().includes(trimmed)
      )
    : ALL_SYLLABUS_SUBJECTS.slice(0, 6);

  const matchedBareActs = trimmed
    ? IPC_VS_BNS_MAP.filter(b => 
        b.offence.toLowerCase().includes(trimmed) ||
        b.ipc.toLowerCase().includes(trimmed) ||
        b.bns.toLowerCase().includes(trimmed)
      )
    : IPC_VS_BNS_MAP.slice(0, 6);

  const matchedCases = trimmed
    ? LANDMARK_CASES.filter(c => 
        c.title.toLowerCase().includes(trimmed) ||
        c.citation.toLowerCase().includes(trimmed) ||
        c.principle.toLowerCase().includes(trimmed) ||
        c.subject.toLowerCase().includes(trimmed)
      )
    : LANDMARK_CASES.slice(0, 6);

  const matchedUnis = trimmed
    ? GUJARAT_UNIVERSITIES.filter(u => 
        u.name.toLowerCase().includes(trimmed) ||
        u.shortName.toLowerCase().includes(trimmed) ||
        u.city?.toLowerCase().includes(trimmed)
      )
    : GUJARAT_UNIVERSITIES.slice(0, 6);

  const totalResults = matchedSubjects.length + matchedBareActs.length + matchedCases.length + matchedUnis.length;

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
            <Search className="w-4 h-4" />
            <span>GLOBAL LEGAL KNOWLEDGE BASE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search LowStudy Platform
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects, BNS sections, landmark judgments, syllabus, universities..."
              className="w-full pl-12 pr-28 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 transition shadow-2xs"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Search
            </button>
          </form>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: `All Results (${totalResults})` },
              { id: 'subjects', label: `Subjects (${matchedSubjects.length})` },
              { id: 'bare-acts', label: `Bare Acts (${matchedBareActs.length})` },
              { id: 'cases', label: `Case Laws (${matchedCases.length})` },
              { id: 'syllabus', label: `Universities (${matchedUnis.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Subjects */}
        {(activeTab === 'all' || activeTab === 'subjects') && matchedSubjects.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" /> Law Subjects
              </h2>
              <Link href="/subjects" className="text-xs font-bold text-amber-700 hover:underline">
                View All Subjects →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedSubjects.map((s) => (
                <Link
                  key={s.id}
                  href={`/subjects/${s.id}`}
                  className="p-4 bg-white border border-slate-200 hover:border-amber-400 rounded-2xl transition shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {s.shortCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Semester {s.semesterId?.replace('sem', '') || 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition line-clamp-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{s.category}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bare Acts */}
        {(activeTab === 'all' || activeTab === 'bare-acts') && matchedBareActs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Bare Acts (BNS 2023 vs IPC 1860)
              </h2>
              <Link href="/bns-vs-ipc" className="text-xs font-bold text-emerald-700 hover:underline">
                Full 358-Section Table →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedBareActs.map((b, idx) => (
                <Link
                  key={idx}
                  href="/bns-vs-ipc"
                  className="p-4 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl transition shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-rose-700 font-mono font-bold">{b.ipc}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{b.bns}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                    {b.offence}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{b.change}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Case Laws */}
        {(activeTab === 'all' || activeTab === 'cases') && matchedCases.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-600" /> Landmark Case Laws
              </h2>
              <Link href="/case-laws" className="text-xs font-bold text-purple-700 hover:underline">
                View All Case Laws →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedCases.map((c) => (
                <Link
                  key={c.id}
                  href="/case-laws"
                  className="p-4 bg-white border border-slate-200 hover:border-purple-400 rounded-2xl transition shadow-2xs space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{c.subject}</span>
                    <span className="text-slate-400 font-mono">{c.year}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition line-clamp-1">
                    {c.title}
                  </h3>
                  <p className="text-xs font-mono text-amber-700">{c.citation}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.principle}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Universities */}
        {(activeTab === 'all' || activeTab === 'syllabus') && matchedUnis.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Gujarat Universities
              </h2>
              <Link href="/universities" className="text-xs font-bold text-blue-700 hover:underline">
                Explore All Universities →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {matchedUnis.map((u) => (
                <Link
                  key={u.id}
                  href={`/universities/${u.id}`}
                  className="p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl transition shadow-2xs space-y-2 group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl">{u.logo}</span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition mt-2">
                      {u.name}
                    </h3>
                    <p className="text-xs text-slate-500">{u.city} &bull; 2026-27 Syllabus</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 flex items-center gap-1 pt-2">
                    Open Syllabus Portal <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-poppins">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading LowStudy Search...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
