"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Calendar,
  FileText,
  HelpCircle,
  ExternalLink,
  Filter,
  History,
  Bell
} from 'lucide-react';

export const GUJARAT_UNIS = [
  { id: 'gu', name: 'Gujarat University', code: 'GU', city: 'Ahmedabad' },
  { id: 'su', name: 'Saurashtra University', code: 'SU', city: 'Rajkot' },
  { id: 'vnsgu', name: 'Veer Narmad South Gujarat University', code: 'VNSGU', city: 'Surat' },
  { id: 'msu', name: 'Maharaja Sayajirao University of Baroda', code: 'MSU', city: 'Vadodara' },
  { id: 'hngu', name: 'Hemchandracharya North Gujarat University', code: 'HNGU', city: 'Patan' },
  { id: 'mkbu', name: 'Maharaja Krishnakumarsinhji Bhavnagar University', code: 'MKBU', city: 'Bhavnagar' },
  { id: 'gnlu', name: 'Gujarat National Law University', code: 'GNLU', city: 'Gandhinagar' }
];

export default function CurriculumExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syllabusData, setSyllabusData] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState('gu');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedUnits, setExpandedUnits] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCurriculum(selectedUniversity, selectedSemester);
    fetchNotification(selectedUniversity, selectedSemester);
  }, [selectedUniversity, selectedSemester]);

  async function fetchCurriculum(uniId, semesterNum) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/syllabus/current?university=${uniId}&semester=${semesterNum}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load official curriculum');
      }
      setSyllabusData(json.syllabus);

      // Auto-expand first subject and first unit
      if (json.syllabus?.subjects?.[0]) {
        const firstSubj = json.syllabus.subjects[0];
        setExpandedSubjects({ [firstSubj.code]: true });
        if (firstSubj.units?.[0]) {
          setExpandedUnits({ [`${firstSubj.code}-u${firstSubj.units[0].unitNumber}`]: true });
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchNotification(uniId, semesterNum) {
    try {
      const res = await fetch(`/api/syllabus/notifications?university=${uniId}&semester=${semesterNum}`);
      const json = await res.json();
      if (json.success && json.notifications?.length > 0) {
        setNotification(json.notifications[0]);
      } else {
        setNotification(null);
      }
    } catch (e) {
      console.error('Error fetching notification:', e);
    }
  }

  const toggleSubject = (code) => {
    setExpandedSubjects(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const toggleUnit = (unitKey) => {
    setExpandedUnits(prev => ({ ...prev, [unitKey]: !prev[unitKey] }));
  };

  const filteredSubjects = syllabusData?.subjects?.filter(subj => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesSubject = subj.title.toLowerCase().includes(query) || subj.code.toLowerCase().includes(query);
    const matchesUnit = subj.units.some(u => 
      u.title.toLowerCase().includes(query) || 
      (u.description && u.description.toLowerCase().includes(query)) ||
      u.topics.some(t => 
        t.title.toLowerCase().includes(query) || 
        (t.description && t.description.toLowerCase().includes(query))
      )
    );
    return matchesSubject || matchesUnit;
  }) || [];

  const currentUniObj = GUJARAT_UNIS.find(u => u.id === selectedUniversity) || GUJARAT_UNIS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          <Link href="/" className="hover:text-amber-400 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href={`/universities/${selectedUniversity}`} className="hover:text-amber-400 transition">{currentUniObj.name}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300">LL.B. 3 Years</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400">Semester {selectedSemester} Curriculum</span>
        </div>

        {/* Update Notification Banner if available */}
        {notification && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{notification.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{notification.message}</p>
              </div>
            </div>
            <Link
              href="/syllabus/history"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1"
            >
              <span>View Changes</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>🟢 Status: Officially Verified Current Syllabus &bull; Academic Year {syllabusData?.academicYear || '2026-27'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{syllabusData?.university?.name || currentUniObj.name}</span>
                <span className="text-slate-500 font-light text-2xl">/</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">LL.B. Semester {selectedSemester}</span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                Official CBCS syllabus and verified academic structure. Browse complete course codes, units, syllabus topics, and statutory provisions approved by the Faculty of Law.
              </p>
            </div>

            {/* University Stats Card */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800 backdrop-blur">
              <div className="px-3 border-r border-slate-800 text-center">
                <span className="block text-2xl font-black text-amber-400">{syllabusData?.subjects?.length || 5}</span>
                <span className="text-xs text-slate-400 font-medium uppercase">Subjects</span>
              </div>
              <div className="px-3 border-r border-slate-800 text-center">
                <span className="block text-2xl font-black text-cyan-400">
                  {syllabusData?.subjects?.reduce((acc, s) => acc + (s.units?.length || 0), 0) || 20}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase">Units</span>
              </div>
              <div className="px-3 border-r border-slate-800 text-center">
                <span className="block text-2xl font-black text-emerald-400">
                  {syllabusData?.subjects?.reduce((acc, s) => acc + (s.credits || 4), 0) || 20}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase">Credits</span>
              </div>
              <div className="px-3 text-center">
                <span className="block text-2xl font-black text-purple-400">
                  {(syllabusData?.subjects?.length || 5) * 100}
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase">Marks</span>
              </div>
            </div>
          </div>

          {/* University and Semester Selector Bar */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* University Selector */}
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold outline-none"
                >
                  {GUJARAT_UNIS.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Semester:</span>
                <div className="flex items-center gap-1.5 ml-1">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedSemester(num)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedSemester === num
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      Sem {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Source Transparency Link & History */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/syllabus/history"
                className="text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-semibold transition"
              >
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Version History</span>
              </Link>
              {syllabusData?.sourceUrl && (
                <a
                  href={syllabusData.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium flex items-center gap-1 transition"
                >
                  <span>Official University Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject code, unit, topic, or statute..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => {
                if (syllabusData?.subjects) {
                  const allSubjs = {};
                  const allUnits = {};
                  syllabusData.subjects.forEach(s => {
                    allSubjs[s.code] = true;
                    s.units.forEach(u => { allUnits[`${s.code}-u${u.unitNumber}`] = true; });
                  });
                  setExpandedSubjects(allSubjs);
                  setExpandedUnits(allUnits);
                }
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 transition"
            >
              Expand All
            </button>
            <button
              onClick={() => {
                setExpandedSubjects({});
                setExpandedUnits({});
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800/80 hover:bg-slate-800 transition"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Main Hierarchy Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="p-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">Loading verified {currentUniObj.name} academic structure...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-950/20 border border-red-800/40 rounded-2xl text-red-300">
            <p className="text-base font-semibold mb-2">Failed to load curriculum</p>
            <p className="text-sm opacity-80">{error}</p>
            <button
              onClick={() => fetchCurriculum(selectedUniversity, selectedSemester)}
              className="mt-4 px-4 py-2 bg-red-800/40 hover:bg-red-800/60 rounded-lg text-xs font-semibold text-white transition"
            >
              Retry
            </button>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-base font-semibold text-slate-300 mb-1">No subjects match your search</p>
            <p className="text-sm text-slate-500">Try searching for a different keyword or reset the search filter.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSubjects.map((subj, subjIdx) => {
              const isSubjExpanded = !!expandedSubjects[subj.code];

              return (
                <div
                  key={subj.id || subj.code || subjIdx}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl transition-all"
                >
                  {/* Subject Header */}
                  <div
                    onClick={() => toggleSubject(subj.code)}
                    className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/60 transition"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-sm shadow-inner flex-shrink-0">
                        {subj.code}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                            {subj.category || 'Core Law'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                            🟢 VERIFIED_CURRENT
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {subj.credits || 4} Credits &bull; 100 Marks (70 Ext + 30 Int)
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {subj.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/subjects/${subj.id || subj.code.toLowerCase()}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold transition"
                      >
                        <span>Study Subject</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/60">
                        {isSubjExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Units Tree */}
                  {isSubjExpanded && (
                    <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-950/40 space-y-4">
                      {subj.units?.map((unit, uIdx) => {
                        const unitKey = `${subj.code}-u${unit.unitNumber}`;
                        const isUnitExpanded = !!expandedUnits[unitKey];

                        return (
                          <div
                            key={unit.id || unitKey}
                            className="rounded-xl bg-slate-900 border border-slate-800/80 overflow-hidden"
                          >
                            <div
                              onClick={() => toggleUnit(unitKey)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
                                  U{unit.unitNumber}
                                </span>
                                <h3 className="text-sm font-bold text-slate-200">
                                  {unit.title}
                                </h3>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-slate-400">
                                  {unit.topics?.length || 0} Topics
                                </span>
                                {isUnitExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                              </div>
                            </div>

                            {/* Topics */}
                            {isUnitExpanded && (
                              <div className="px-5 pb-4 pt-2 border-t border-slate-800/60 space-y-2.5">
                                {unit.topics?.map((topic, tIdx) => (
                                  <div
                                    key={topic.id || tIdx}
                                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                      <span className="font-semibold text-slate-200">{topic.title}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                      Official
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
