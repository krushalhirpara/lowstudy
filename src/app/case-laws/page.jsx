"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookMarked, 
  Search, 
  Gavel, 
  Bot, 
  Scale, 
  Sparkles, 
  ArrowRight, 
  FileText 
} from 'lucide-react';
import { LANDMARK_CASES } from '@/data/legalData';

export default function CaseLawsPage() {
  const [search, setSearch] = useState('');

  const filtered = LANDMARK_CASES.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.keyPrinciple.toLowerCase().includes(search.toLowerCase()) ||
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Gavel className="w-3.5 h-3.5" />
          <span>Judicial Precedents Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white">Landmark Judgment Summaries</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Concise briefs of Supreme Court & High Court landmark decisions featuring Facts, Ratio Decidendi, and Constitutional Significance.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by case title, citation, or legal doctrine (e.g. Basic Structure, Section 377, Art 21)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Case Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div 
            key={item.id}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-5 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                  {item.subject}
                </span>
                <span className="text-[11px] text-slate-400 font-mono text-right truncate">
                  {item.bench}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white font-serif-title leading-snug">
                {item.title}
              </h2>
              <p className="text-xs text-amber-400 font-mono">{item.citation}</p>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <p className="font-bold text-emerald-400 flex items-center gap-1 font-serif-title">
                  <Scale className="w-3.5 h-3.5" /> Key Legal Principle:
                </p>
                <p className="text-slate-200 font-semibold">{item.keyPrinciple}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div>
                  <span className="font-bold text-slate-400">Facts: </span>
                  <span>{item.facts}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400">Ratio Decidendi: </span>
                  <span>{item.ratio}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 font-mono">{item.importance}</span>
              <Link 
                href={`/ai-tutor?prompt=${encodeURIComponent(`Explain the full facts and ratio of ${item.title}`)}`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 btn-mobile-touch"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask AI Brief
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
