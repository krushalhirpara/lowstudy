"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Filter, Layers, ArrowRight, Bookmark } from 'lucide-react';
import { SUBJECTS_DATA } from '@/data/legalData';

export default function SubjectsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Core Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Personal Law', 'Specialized Law', 'Commercial Law'];

  const filtered = SUBJECTS_DATA.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white">15 Core Legal Subjects</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Comprehensive structured notes, section breakdowns, landmark cases, and revision flashcards for Indian legal education.
        </p>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search subject by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((subj) => (
          <div 
            key={subj.id}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 text-[11px] font-bold font-mono">
                  {subj.shortCode}
                </span>
                <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                  {subj.category}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white font-serif-title">{subj.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{subj.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{subj.modulesCount} Modules</span>
                <span>{subj.casesCount} Cases</span>
              </div>

              <Link 
                href={`/subjects/${subj.id}`}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                Study Modules & Notes
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
