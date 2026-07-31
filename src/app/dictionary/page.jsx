"use client";

import { useState } from 'react';
import { Layers, Search, BookOpen, Sparkles, Bot } from 'lucide-react';
import { LEGAL_DICTIONARY } from '@/data/legalData';
import Link from 'next/link';

export default function DictionaryPage() {
  const [search, setSearch] = useState('');

  const filtered = LEGAL_DICTIONARY.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.phrase.toLowerCase().includes(search.toLowerCase()) ||
    item.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Legal Maxims & Terminology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white">Legal Dictionary</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Latin legal maxims, statutory terminology, and procedural jargon defined for law exams and court practice.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search legal term (e.g. Ratio Decidendi, Habeas Corpus, Mens Rea)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-amber-400 font-serif-title">{item.term}</h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                MAXIM
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-slate-300 italic">"{item.phrase}"</p>
              {item.devanagari && (
                <span className="text-xs font-semibold text-emerald-400 font-devanagari-serif bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  {item.devanagari}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">{item.definition}</p>

            <div className="pt-2 flex justify-end">
              <Link 
                href={`/ai-tutor?prompt=${encodeURIComponent(`Explain the legal maxim '${item.term}' with landmark Indian Supreme Court cases`)}`}
                className="text-[11px] text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
              >
                <Bot className="w-3.5 h-3.5" />
                Ask NyayaAI for Case Examples →
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
