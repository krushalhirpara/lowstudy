"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { MockDB } from '@/data/db';

export default function SubjectsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [syllabusVersion, setSyllabusVersion] = useState('new');
  
  const [subjects, setSubjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('');
  const [selectedSemId, setSelectedSemId] = useState('');
  const [activeUni, setActiveUni] = useState(null);
  const [activeSem, setActiveSem] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setUniversities(MockDB.getUniversities());
    setSemesters(MockDB.getSemesters());

    const uni = MockDB.getSelectedUni();
    const sem = MockDB.getSelectedSem();
    setActiveUni(uni);
    setActiveSem(sem);
    setSelectedUniId(uni ? uni.id : '');
    setSelectedSemId(sem ? sem.id : '');

    const ver = MockDB.getSelectedSyllabusVersion();
    setSyllabusVersion(ver);
    setSubjects(MockDB.getSubjects(uni ? uni.id : null, sem ? sem.id : null, ver));
  }, []);

  const handleVersionChange = (version) => {
    setSyllabusVersion(version);
    MockDB.setSelectedSyllabusVersion(version);
    setSubjects(MockDB.getSubjects(selectedUniId ? selectedUniId : null, selectedSemId ? selectedSemId : null, version));
  };

  const handleUniChange = (uniId) => {
    setSelectedUniId(uniId);
    MockDB.setSelectedUniAndSem(uniId, selectedSemId);
    const uni = MockDB.getUniversities().find(u => u.id === uniId) || null;
    setActiveUni(uni);
    setSubjects(MockDB.getSubjects(uniId ? uniId : null, selectedSemId ? selectedSemId : null, syllabusVersion));
  };

  const handleSemChange = (semId) => {
    setSelectedSemId(semId);
    MockDB.setSelectedUniAndSem(selectedUniId, semId);
    const sem = MockDB.getSemesters().find(s => s.id === semId) || null;
    setActiveSem(sem);
    setSubjects(MockDB.getSubjects(selectedUniId ? selectedUniId : null, semId ? semId : null, syllabusVersion));
  };

  const categories = ['All', 'Core Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Personal Law', 'Specialized Law', 'Commercial Law'];

  const filtered = subjects.filter(item => {
    // 1. Search across Subject Code/Title
    const matchesSubject = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.shortCode.toLowerCase().includes(search.toLowerCase());

    // 2. Search across Unit Titles/Descriptions
    const subjectUnits = MockDB.getUnits(item.id);
    const matchesUnit = subjectUnits.some(unit => 
      unit.title.toLowerCase().includes(search.toLowerCase()) || 
      (unit.description && unit.description.toLowerCase().includes(search.toLowerCase()))
    );

    // 3. Search across Topic Titles/Descriptions/Notes
    const matchesTopicOrNotes = subjectUnits.some(unit => {
      const unitTopics = MockDB.getTopics(unit.id);
      return unitTopics.some(topic => {
        const matchesTopic = topic.title.toLowerCase().includes(search.toLowerCase()) ||
                             (topic.description && topic.description.toLowerCase().includes(search.toLowerCase()));
        
        const topicNotes = MockDB.getNotes(topic.id);
        const matchesNotes = topicNotes && (
          (topicNotes.simpleNotes && topicNotes.simpleNotes.toLowerCase().includes(search.toLowerCase())) ||
          (topicNotes.detailedNotes && topicNotes.detailedNotes.toLowerCase().includes(search.toLowerCase()))
        );

        return matchesTopic || matchesNotes;
      });
    });

    const matchesSearch = matchesSubject || matchesUnit || matchesTopicOrNotes;

    // 4. Category Filter
    const matchesCat = categoryFilter === 'All' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCat;
  });

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading subjects...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Gujarat Verified Syllabus Explorer</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
              Academic Year 2026-27
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white leading-tight">
            {activeUni ? activeUni.name : "Gujarat University"} Syllabus
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {activeSem ? activeSem.name : "Semester 1"} Verified Curriculum — Unit-wise notes, landmark case ratios, BNS Bare Acts, and practice MCQs.
          </p>

          {activeUni && activeUni.officialSyllabusSource && (
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Official Source:</span>
              <a 
                href={activeUni.officialSyllabusSource} 
                target="_blank" 
                rel="noreferrer"
                className="text-amber-400 font-mono hover:underline truncate max-w-xs"
              >
                {activeUni.officialSyllabusSource}
              </a>
              <span className="text-[10px] text-slate-500">(Verified 2026-09-01)</span>
            </div>
          )}
        </div>

        {/* Syllabus Version Toggle */}
        <div className="inline-flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-auto shrink-0 shadow-lg">
          <button
            onClick={() => handleVersionChange('new')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              syllabusVersion === 'new'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Syllabus
          </button>
          <button
            onClick={() => handleVersionChange('old')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              syllabusVersion === 'old'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Old Syllabus
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl w-full">
        
        {/* Left Side: Search Bar & Selectors */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search keyword in subject, unit, topic, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* University Dropdown */}
          <select
            value={selectedUniId}
            onChange={(e) => handleUniChange(e.target.value)}
            className="bg-slate-950 text-xs text-slate-350 px-3 py-2.5 rounded-xl border border-slate-750 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-48 cursor-pointer"
          >
            <option value="">All Universities</option>
            {universities.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Semester Dropdown */}
          <select
            value={selectedSemId}
            onChange={(e) => handleSemChange(e.target.value)}
            className="bg-slate-950 text-xs text-slate-350 px-3 py-2.5 rounded-xl border border-slate-750 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-40 cursor-pointer"
          >
            <option value="">All Semesters</option>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="w-full lg:w-auto overflow-x-auto scrollbar-none pb-1.5 lg:pb-0 flex">
          <div className="flex lg:flex-wrap items-center gap-1.5 w-max lg:w-auto min-w-full lg:min-w-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
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
      </div>

      {/* Subjects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filtered.map((subj) => {
            const uniNames = { gu: "Gujarat University", su: "Saurashtra University", vnsgu: "VNSGU" };
            return (
              <div 
                key={subj.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-5 shadow-lg group hover:shadow-amber-500/5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 text-[10px] font-bold font-mono border border-slate-700">
                      {subj.shortCode}
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        subj.syllabusVersion === 'new' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {subj.syllabusVersion === 'new' ? 'New Syllabus' : 'Old Syllabus'}
                      </span>
                      {subj.credits && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-semibold tracking-wide">
                          {subj.credits} Credits
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white font-serif-title leading-snug group-hover:text-amber-400 transition-colors">
                      {subj.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 mt-2 text-[11px] text-slate-400">
                      <span className="text-slate-300 font-semibold">{subj.category}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-450 mt-0.5">
                        {uniNames[subj.universityId] || subj.universityId.toUpperCase()} • {subj.semesterId === 'sem1' ? 'Semester 1' : subj.semesterId === 'sem2' ? 'Semester 2' : subj.semesterId === 'sem3' ? 'Semester 3' : subj.semesterId === 'sem4' ? 'Semester 4' : subj.semesterId === 'sem5' ? 'Semester 5' : 'Semester 6'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <Link 
                    href={`/subjects/${subj.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow"
                  >
                    Study Modules & Notes
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center space-y-2 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
          <BookOpen className="w-8 h-8 text-slate-650 mx-auto" />
          <p className="text-xs text-slate-400 font-mono">No subjects found matching filters.</p>
        </div>
      )}

    </div>
  );
}
