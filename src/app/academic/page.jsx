"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Layers,
  Search,
  CheckCircle2,
  Bookmark,
  Calendar,
  ShieldCheck,
  Building,
  ArrowRight,
  Sparkles,
  Filter,
  BarChart3
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';
import SubjectCard from '@/components/academic/SubjectCard';

export default function AcademicDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchAcademicData(selectedSemester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemester]);

  async function fetchAcademicData(semesterNum) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academic/hierarchy?university=SU&course=LLB-3Y&semester=${semesterNum}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load semester curriculum');
      }
      setData(json.hierarchy);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const subjects = data?.subjects || [];
  const progress = data?.progressSummary || {
    totalSubjects: 5,
    totalUnits: 20,
    totalTopics: 81,
    completedTopics: 0,
    completionPercentage: 0,
    bookmarkedCount: 0
  };

  const categories = ['All', 'Core Law'];

  const filteredSubjects = subjects.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = s.title.toLowerCase().includes(q) || 
                         s.code.toLowerCase().includes(q) ||
                         s.units.some(u => u.title.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <AcademicBreadcrumbs
          items={[
            { label: 'Saurashtra University', href: '/universities/su' },
            { label: '3-Year LL.B.', href: '/academic' },
            { label: `Semester ${selectedSemester} Dashboard` }
          ]}
        />

        {/* 1. Semester Dashboard Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Saurashtra University &bull; CBCS Verified Syllabus (2026-27)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                LL.B. Semester {selectedSemester} Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Explore the verified academic curriculum. Track your progress across official syllabus units, study topics, and exam preparation objectives.
              </p>
            </div>

            {/* Semester Progress Highlight Card */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/90 backdrop-blur shrink-0 min-w-[280px]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Semester Mastery
                </span>
                <span className="font-bold text-amber-400 text-sm">
                  {progress.completionPercentage}%
                </span>
              </div>
              
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress.completionPercentage))}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800/80">
                <div>
                  <span className="block font-bold text-slate-200">{progress.completedTopics} / {progress.totalTopics}</span>
                  <span className="text-[10px] text-slate-500">Completed</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-200">{progress.totalUnits}</span>
                  <span className="text-[10px] text-slate-500">Units</span>
                </div>
                <div>
                  <span className="block font-bold text-amber-400">{progress.bookmarkedCount}</span>
                  <span className="text-[10px] text-slate-500">Saved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Semester Selector Tabs */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 shrink-0 mr-1">Semester:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setSelectedSemester(num)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedSemester === num
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    Sem {num} {num === 3 && '★'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified Syllabus
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 mb-8">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject code, title, or statute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <div className="flex items-center gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Subject Listing */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Semester {selectedSemester} Subjects</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filteredSubjects.length} Core Papers
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Loading Semester {selectedSemester} curriculum and student progress...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-950/20 border border-red-800/40 rounded-3xl text-red-300">
            <p className="text-base font-semibold mb-2">Error loading academic curriculum</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-semibold text-slate-200 mb-1">No subjects match your query</p>
            <p className="text-sm text-slate-500">Try adjusting your search terms or clearing the filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
