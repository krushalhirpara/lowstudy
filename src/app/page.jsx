"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  BookOpen, 
  Bot, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  FileText, 
  Search, 
  BrainCircuit, 
  Zap, 
  ChevronRight,
  Bookmark,
  GraduationCap,
  Gavel,
  Check
} from 'lucide-react';
import { SUBJECTS_DATA, IPC_VS_BNS_MAP, LANDMARK_CASES } from '@/data/legalData';
import { MockDB } from '@/data/db';

export default function HomePage() {
  const [universityId, setUniversityId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [syllabusVersion, setSyllabusVersion] = useState('new');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mounted, setMounted] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchBns, setSearchBns] = useState('');

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setUniversities(MockDB.getUniversities());
    setSemesters(MockDB.getSemesters());
    setSyllabusVersion(MockDB.getSelectedSyllabusVersion());

    const uni = MockDB.getSelectedUni();
    const sem = MockDB.getSelectedSem();
    if (uni) {
      setUniversityId(uni.id);
    }
    if (sem) {
      setSemesterId(sem.id);
      setIsOnboarded(true);
    }
  }, []);

  useEffect(() => {
    if (isOnboarded) {
      setSubjects(MockDB.getSubjects(universityId, semesterId, syllabusVersion));
    } else {
      setSubjects(MockDB.getSubjects(null, null, syllabusVersion));
    }
  }, [isOnboarded, universityId, semesterId, syllabusVersion]);

  const categories = ['All', 'Core Law', 'Criminal Law', 'Civil Law', 'Corporate Law', 'Specialized Law'];

  const filteredSubjects = subjects.filter(subject => {
    if (selectedCategory === 'All') return true;
    return subject.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const filteredBns = IPC_VS_BNS_MAP.filter(item => 
    item.ipc.toLowerCase().includes(searchBns.toLowerCase()) || 
    item.bns.toLowerCase().includes(searchBns.toLowerCase()) ||
    item.ipcTitle.toLowerCase().includes(searchBns.toLowerCase())
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Setting up learning workspace...
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Next-Gen Legal Learning Engine for India</span>
              <span className="px-1.5 py-0.2 bg-amber-500/20 rounded text-[10px] uppercase tracking-wider font-bold">2026 Edition</span>
            </div>

            {/* Main Headline */}
            <h1 className="fluid-h1 font-extrabold tracking-tight font-serif-title text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-tight select-none">
              Master Indian Law with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 drop-shadow-[0_0_30px_rgba(245,158,11,0.35)] font-black">AI Precision</span>
            </h1>

            {/* Sanskrit legal slogans in Devnagari calligraphic font */}
            <div className="py-2 inline-block font-devanagari-calligraphy fluid-slogan text-amber-500 tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              सत्यमेव जयते • यतो धर्मस्ततो जयः
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
              Structured Subject Notes, Bare Acts (BNS, BNSS, BSA), Landmark Judgments, Daily Quizzes, and <span className="text-emerald-400 font-semibold">NyayaAI 24/7 Legal Doubt Solving</span> for LLB, CLAT, AIBE & Judiciary.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link 
                href="/subjects" 
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-4 h-4" />
                Explore 15 Subjects
              </Link>

              <Link 
                href="/ai-tutor" 
                className="px-6 py-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Bot className="w-4 h-4 text-emerald-400" />
                Ask NyayaAI Tutor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Key Ticker Metrics */}
            <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto border-t border-slate-800/80">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xl sm:text-2xl font-bold text-amber-400 font-serif-title">15+</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Core Legal Subjects</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-serif-title">358</p>
                <p className="text-[10px] sm:text-xs text-slate-400">BNS 2023 Sections</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xl sm:text-2xl font-bold text-blue-400 font-serif-title">500+</p>
                <p className="text-[10px] sm:text-xs text-slate-400">Landmark Judgments</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <p className="text-xl sm:text-2xl font-bold text-purple-400 font-serif-title">24/7</p>
                <p className="text-[10px] sm:text-xs text-slate-400">AI Legal Doubt Tutor</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* UNIVERSITY & SEMESTER SYLLABUS INDEX SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4 font-anek">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500 font-mono">Select Your Curriculum Mappings</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Choose University & Semester</h2>
        </div>

        {/* University Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {universities.map(u => {
            const isSelected = universityId === u.id;
            return (
              <button
                key={u.id}
                onClick={() => {
                  setUniversityId(u.id);
                  setSemesterId('');
                  MockDB.setSelectedUniAndSem(u.id, '');
                }}
                className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 group hover:scale-102 btn-mobile-touch ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-750'
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{u.logo}</span>
                <span className="text-xs font-semibold">{u.name}</span>
                <span className="text-[9px] font-semibold text-slate-500 font-mono uppercase">{u.code}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Semester Selector Row */}
        {universityId && (
          <div className="space-y-3 max-w-2xl mx-auto text-center pt-2 animate-fade-in">
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500 font-mono">Select Current Semester</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {semesters.map(s => {
                const isSelected = semesterId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSemesterId(s.id);
                      MockDB.setSelectedUniAndSem(universityId, s.id);
                      setIsOnboarded(true);
                      window.location.reload();
                    }}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all btn-mobile-touch ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:border-slate-750 hover:text-white'
                    }`}
                  >
                    Sem {s.num}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* NEW CRIMINAL CODES CONVERTER SECTION (BNS, BNSS, BSA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 relative overflow-hidden shadow-2xl">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wide">
                  New Criminal Codes 2023
                </span>
                <span className="text-xs text-slate-400">IPC ↔ BNS Rapid Lookup</span>
              </div>
              <h2 className="text-2xl font-bold text-white font-serif-title">Bharatiya Nyaya Sanhita (BNS) Instant Mapping</h2>
              <p className="text-xs text-slate-300">Quickly search old IPC section numbers to find their corresponding BNS section, updated punishments, and legal title.</p>
            </div>

            {/* Quick Search Input */}
            <div className="w-full lg:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search IPC 302, Murder, BNS..." 
                value={searchBns}
                onChange={(e) => setSearchBns(e.target.value)}
                className="w-full bg-slate-950 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Mapping Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredBns.slice(0, 6).map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 line-through decoration-red-500">{item.ipc}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">{item.bns}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium truncate max-w-[200px]">{item.ipcTitle}</p>
                </div>
                <Link href="/bare-acts" className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <Link href="/bare-acts" className="text-xs text-amber-400 hover:underline font-semibold inline-flex items-center gap-1">
              View All 358 BNS Sections & BNSS/BSA Comparative Tables →
            </Link>
          </div>

        </div>
      </section>

      {/* 15 SUBJECTS DIRECTORY GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-white">Syllabus Explorer</h2>
            <p className="text-xs sm:text-sm text-slate-400">Complete curriculum mapping for LLB semester exams and competitive law entrances.</p>
            
            {/* Syllabus Version Toggle */}
            <div className="inline-flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
              <button
                onClick={() => {
                  setSyllabusVersion('new');
                  MockDB.setSelectedSyllabusVersion('new');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  syllabusVersion === 'new'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                New Syllabus (BNS 2023)
              </button>
              <button
                onClick={() => {
                  setSyllabusVersion('old');
                  MockDB.setSelectedSyllabusVersion('old');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  syllabusVersion === 'old'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Old Syllabus (IPC 1860)
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-1.5 md:pb-0 flex shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((subj) => {
            const uniNames = { gu: "Gujarat Uni", su: "Saurashtra Uni", vnsgu: "VNSGU" };
            return (
              <Link 
                key={subj.id} 
                href={`/subjects/${subj.id}`}
                className="group p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-5 shadow-lg hover:shadow-amber-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider font-mono bg-slate-800 text-amber-400 border border-slate-700">
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
                    <h3 className="text-lg font-bold text-white font-serif-title group-hover:text-amber-400 transition-colors leading-snug">
                      {subj.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 mt-2 text-[10.5px] text-slate-400">
                      <span className="text-slate-300 font-semibold">{subj.category}</span>
                      <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-450">
                        {uniNames[subj.universityId] || subj.universityId.toUpperCase()} • {subj.semesterId === 'sem1' ? 'Sem 1' : subj.semesterId === 'sem2' ? 'Sem 2' : subj.semesterId === 'sem3' ? 'Sem 3' : subj.semesterId === 'sem4' ? 'Sem 4' : subj.semesterId === 'sem5' ? 'Sem 5' : 'Sem 6'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium flex items-center justify-between group-hover:text-white transition-colors">
                  <span>View Full Syllabus & Notes</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* NYAYAAI TUTOR PROMO & DEMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>NyayaAI Tutor Assistant</span>
            </div>
            <h2 className="text-3xl font-bold font-serif-title text-white">Instant Answers to Complex Legal Doubts</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Stuck on Article 21's expansive scope? Confused between IPC Section 302 and BNS Section 103? Ask NyayaAI for simple explanations, case summaries, illustration breakdowns, and custom flashcards.
            </p>
            
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Explain any section with real-world Indian examples</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Summarize 50-page judgments into Facts & Ratio Decidendi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Generate exam-oriented MCQs and revision flashcards</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link 
                href="/ai-tutor" 
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                Launch NyayaAI Assistant
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive AI Widget Mock */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-white">NyayaAI Legal Engine</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Model: Law-Gemma-2026</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
                <p className="font-semibold text-amber-400 text-[11px]">User Question:</p>
                <p>"What is the key difference between IPC 420 and BNS Section 318?"</p>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20 text-slate-200 space-y-1.5">
                <p className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> NyayaAI Response:
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Both sections penalize **Cheating and dishonestly inducing delivery of property**. Under the new criminal code, IPC Section 420 has been renumbered to **BNS Section 318**. BNS 318 retains the maximum imprisonment of 7 years plus fine, but updates the procedural language to encompass electronic fraud.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <input 
                type="text" 
                readOnly 
                value="Try asking: 'Explain Basic Structure Doctrine in 3 bullet points...'"
                className="w-full bg-slate-900 border border-slate-800 text-slate-500 text-xs px-3 py-2 rounded-lg cursor-not-allowed"
              />
            </div>
          </div>

        </div>
      </section>

      {/* FREEMIUM PRICING TIERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-white">Simple, Accessible Pricing</h2>
          <p className="text-xs sm:text-sm text-slate-400">Free forever for basic study notes. Upgrade for unlimited AI doubt resolution and full judiciary mock tests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* Free Plan */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-semibold">Free Forever</span>
              <h3 className="text-2xl font-bold text-white font-serif-title mt-2">₹0 / month</h3>
              <p className="text-xs text-slate-400">Ideal for daily LLB college revision</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 15 Core Subject Notes Access</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> BNS / BNSS / BSA Bare Acts Explorer</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Daily 10 Practice MCQs</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5 NyayaAI Doubts / day</li>
            </ul>

            <Link href="/subjects" className="block text-center w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs">
              Start Free Learning
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/50 space-y-5 relative shadow-xl">
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">LowStudy Pro</span>
              <h3 className="text-2xl font-bold text-white font-serif-title mt-2">₹199 / month</h3>
              <p className="text-xs text-amber-300">For CLAT, AIBE & Judiciary Aspirants</p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Unlimited NyayaAI Doubt Solver</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Full-length Timed Mock Tests with Rank</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> AI Case Judgment Summarizer</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Custom Flashcards & Weak Area Analytics</li>
            </ul>

            <Link href="/quiz" className="block text-center w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-md">
              Upgrade to Pro
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
