"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  BookOpen, 
  Sparkles, 
  Award, 
  FileText, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  Bot, 
  PenTool, 
  Timer, 
  BookMarked, 
  CalendarDays, 
  Layers, 
  Briefcase, 
  ChevronRight, 
  ChevronDown, 
  RotateCcw,
  Zap,
  HelpCircle,
  Clock,
  Compass,
  GraduationCap
} from 'lucide-react';
import { GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import { LANDMARK_CASES, IPC_VS_BNS_MAP } from '@/data/legalData';

export default function HomePage() {
  const [selectedUni, setSelectedUni] = useState('su');
  const [selectedSem, setSelectedSem] = useState(3);
  const [nyayaQuery, setNyayaQuery] = useState('What is Section 103(2) BNS on Mob Lynching?');
  const [nyayaResponse, setNyayaResponse] = useState(
    "Section 103(2) of Bharatiya Nyaya Sanhita (BNS 2023) specifically penalizes murder committed by a group of five or more persons acting in concert on grounds of race, caste, sex, place of birth, or religion. It prescribes death penalty or imprisonment for life, incorporating the Supreme Court's mandate in Tehseen Poonawalla (2018)."
  );
  const [isNyayaLoading, setIsNyayaLoading] = useState(false);
  const [bnsSearch, setBnsSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const handleSimulateNyaya = (query, resp) => {
    setNyayaQuery(query);
    setIsNyayaLoading(true);
    setTimeout(() => {
      setNyayaResponse(resp);
      setIsNyayaLoading(false);
    }, 400);
  };

  const filteredBns = IPC_VS_BNS_MAP.filter(m =>
    m.ipc.toLowerCase().includes(bnsSearch.toLowerCase()) ||
    m.bns.toLowerCase().includes(bnsSearch.toLowerCase()) ||
    m.offence.toLowerCase().includes(bnsSearch.toLowerCase())
  ).slice(0, 4);

  const faqs = [
    {
      q: "How does LowStudy ensure syllabus accuracy for Gujarat law universities?",
      a: "LowStudy uses an automated source monitoring engine that continuously audits official Gujarat university circulars, gazettes, and academic department portals. Unverified extractions are never published automatically—every update must pass admin SHA-256 fingerprint verification and receive a VERIFIED_CURRENT certification."
    },
    {
      q: "Are the new criminal laws (BNS, BNSS, BSA 2023) integrated into the syllabus?",
      a: "Yes! All relevant criminal law subjects, units, Bare Act references, MCQs, and model answers are updated to Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), and Bharatiya Sakshya Adhiniyam (BSA) with side-by-side IPC/CrPC comparisons."
    },
    {
      q: "Does NyayaAI support Gujarati language for law exam preparation?",
      a: "Absolutely. NyayaAI is trained on Gujarati legal terminology used in Gujarat University, Saurashtra University, and VNSGU examinations. You can ask questions and receive answers in English, Gujarati (ગુજરાતી), Hindi, or Hinglish."
    },
    {
      q: "How does the Spaced Repetition Revision system work?",
      a: "Whenever you solve MCQs or take mock tests, any missed questions automatically tag the corresponding syllabus topic as a 'Weak Topic'. LowStudy then schedules automated revision intervals at 1, 3, 7, 15, and 30 days to maximize memory retention for final university exams."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: SaaS Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Trust & Syllabus Verification Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-amber-600 font-bold">2026-27</span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Official Syllabus Intelligence
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Learn Law. Practice Daily. <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 bg-clip-text text-transparent">
                  Crack Every Exam.
                </span>
              </h1>

              {/* Supporting Subtext */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Your syllabus-aware AI learning platform for law school — from current Gujarat university syllabi and Bare Acts (BNS 2023) to case laws, quizzes, drafting lab, and personalized revision.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-md hover:shadow-lg"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>

                <Link
                  href="/universities"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold transition shadow-sm"
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Explore Gujarat Universities</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Official University Sync</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>BNS / BNSS / BSA 2023</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>English & ગુજરાતી Support</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive SaaS Learning OS Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-800 text-white space-y-5 relative">
                
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">LowStudy OS v2.4</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🟢 SU Sem 3 Verified
                  </span>
                </div>

                {/* Micro Preview 1: Current Curriculum Track */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Active Subject:</span>
                    <span className="text-amber-400 font-bold">Labour & Industrial Law - I</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full w-3/4" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Unit 3: Industrial Disputes Act</span>
                    <span className="text-emerald-400 font-bold">75% Complete</span>
                  </div>
                </div>

                {/* Micro Preview 2: Live NyayaAI Dialogue Snippet */}
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Bot className="w-4 h-4" />
                    <span>NyayaAI Legal Intelligence</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    "Under Section 103(2) BNS 2023, mob lynching carries capital punishment or life imprisonment. Precedent: Tehseen Poonawalla (2018)."
                  </p>
                </div>

                {/* Micro Preview 3: Quick MCQ Challenge Widget */}
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-semibold">Today's Spaced Practice:</span>
                    <span className="text-amber-400 font-mono font-bold">+10 XP</span>
                  </div>
                  <p className="text-slate-200 font-medium text-[11px]">
                    Which section of BNSS 2023 governs registration of Zero FIR?
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <span className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold text-center">
                      ✓ Sec 173(1) BNSS
                    </span>
                    <span className="p-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-400 text-[10px] text-center">
                      Sec 154 CrPC
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Daily Streak: 8 Days
                  </span>
                  <Link href="/dashboard" className="text-amber-400 font-bold hover:underline flex items-center gap-0.5">
                    Launch OS Dashboard <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. LIVE GUJARAT UNIVERSITY COVERAGE TICKER */}
      <section className="bg-slate-900 border-b border-slate-800 py-4 text-xs text-slate-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gujarat Universities Monitored:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
              {GUJARAT_UNIVERSITIES.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-white">{u.shortName}</span>
                  <span className="text-slate-400 font-mono">2026-27</span>
                </div>
              ))}
              <Link href="/curriculum" className="text-amber-400 font-bold hover:underline">
                View All Sources →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE UNIVERSITY & SEMESTER SELECTOR */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                  Quick Access Launcher
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Jump Straight to Your University & Semester
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select your university and semester to load the verified 2026-27 curriculum and practice materials.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedUni}
                  onChange={(e) => setSelectedUni(e.target.value)}
                  className="px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value="su">Saurashtra University (SU)</option>
                  <option value="gu">Gujarat University (GU)</option>
                  <option value="vnsgu">VNSGU Surat</option>
                  <option value="msu">MSU Baroda</option>
                  <option value="hngu">HNGU Patan</option>
                  <option value="gnlu">GNLU Gandhinagar</option>
                </select>

                <select
                  value={selectedSem}
                  onChange={(e) => setSelectedSem(Number(e.target.value))}
                  className="px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                </select>

                <Link
                  href={selectedUni === 'su' && selectedSem === 3 ? '/saurashtra-university/llb/semester-3/' : `/curriculum?university=${selectedUni}&semester=${selectedSem}`}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center gap-2"
                >
                  <span>Open Curriculum</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. THE LOWSTUDY LEARNING LOOP ("HOW IT WORKS") */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              The LowStudy Learning Loop
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Complete Legal EdTech OS Built Around You
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never waste time searching for fragmented notes or outdated circulars. LowStudy orchestrates the full law school lifecycle from official syllabus to career placement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: '01', title: 'Syllabus Sync', desc: 'Monitored official university sources keep units, topics & marks synchronized.', icon: ShieldCheck, href: '/curriculum' },
              { step: '02', title: 'Learn & Research', desc: 'Study notes, Bare Acts (BNS 2023) and landmark case law ratios.', icon: BookOpen, href: '/subjects' },
              { step: '03', title: 'NyayaAI Tutor', desc: 'Multilingual legal AI explains complex doctrines in English & Gujarati.', icon: Bot, href: '/ai-tutor' },
              { step: '04', title: 'Practice & Draft', desc: 'Solve university MCQs, draft pleadings, and argue in AI Moot Court.', icon: PenTool, href: '/practice/drafting' },
              { step: '05', title: 'Exam Evaluation', desc: 'Submit answers for immediate diagnostic IRAC feedback & score prediction.', icon: Award, href: '/practice/answer-evaluator' },
              { step: '06', title: 'Spaced Revision', desc: 'Mistake tracking schedules automated memory retention intervals.', icon: RotateCcw, href: '/revision' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md transition rounded-2xl p-5 space-y-3 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-900 transition">
                      {item.step}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-700 group-hover:bg-amber-50 group-hover:text-amber-600 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-snug">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. CORE PRODUCT MODULES SHOWCASE */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Product Pillars
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Everything Law Students Need to Excel
              </h2>
            </div>
            <Link href="/curriculum" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
              Explore All Modules <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: Bare Acts & BNS Hub */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Bare Acts & BNS 2023</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bharatiya Nyaya Sanhita, BNSS, BSA & CPC with simplified explanations, cross-references, and exam notes.
                </p>
              </div>
              <Link href="/bare-acts" className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1">
                Browse Bare Acts →
              </Link>
            </div>

            {/* Pillar 2: AI Drafting Lab */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <PenTool className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Legal Drafting Lab</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Draft Section 138 notices, bail applications, and plaints with instant AI scoring against model answers.
                </p>
              </div>
              <Link href="/practice/drafting" className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1">
                Open Drafting Lab →
              </Link>
            </div>

            {/* Pillar 3: Moot Court Arena */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Virtual Moot Court</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Build petitioner and respondent memorials, and face realistic oral cross-examination before an AI Judicial Bench.
                </p>
              </div>
              <Link href="/practice/moot-court" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
                Enter Moot Court →
              </Link>
            </div>

            {/* Pillar 4: Case Laws & Ratio Search */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Case Law Intelligence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supreme Court landmark judgments, ratio decidendi, facts, arguments, and exam citations.
                </p>
              </div>
              <Link href="/research" className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1">
                Search Case Laws →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE NYAYAAI SIMULATOR */}
      <section className="py-16 lg:py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>MULTILINGUAL LEGAL AI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ask NyayaAI Any Legal Concept
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Trained on Indian jurisprudence and Gujarat university syllabi. Ask complex statutory questions, get simple analogies, or generate university exam answers.
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Click to Test Sample Questions:
                </span>
                {[
                  {
                    q: "What is Section 103(2) BNS on Mob Lynching?",
                    r: "Section 103(2) of BNS 2023 provides death penalty or life imprisonment for murder committed by five or more persons acting in concert on grounds of race, caste, sex, or religion, adopting the Tehseen Poonawalla mandate."
                  },
                  {
                    q: "Explain ingredients of Cheating in Gujarati (છેતરપિંડી)",
                    r: "ભારતીય ન્યાય સંહિતા ૨૦૨૩ ની કલમ ૩૧૮ (જૂની IPC ૪૨૦) મુજબ છેતરપિંડીના મુખ્ય તત્વો: ૧. અપ્રમાણિક હેતુથી અન્ય વ્યક્તિને છેતરવી, ૨. ખોટી રજૂઆત કરી મિલકત આપવા પ્રેરિત કરવી, ૩. તેનાથી સામેની વ્યક્તિને નુકસાન પહોંચાડવું."
                  },
                  {
                    q: "How to draft a 138 NI Act statutory legal notice?",
                    r: "A 138 NI notice must state: (1) Valid debt under invoice, (2) Cheque details, (3) Dishonour date and memo reason ('Funds Insufficient'), and (4) Demand repayment within 15 days of notice receipt."
                  }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSimulateNyaya(item.q, item.r)}
                    className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium transition flex items-center justify-between"
                  >
                    <span>{item.q}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Live Interactive Terminal */}
            <div className="lg:col-span-7">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white">NyayaAI Legal Intelligence Terminal</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Online • Grounded
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-900 p-3.5 rounded-2xl text-xs text-amber-300 font-medium border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Student Question:</span>
                    {nyayaQuery}
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed border border-slate-800">
                    <span className="text-emerald-400 block text-[10px] uppercase font-bold mb-1">NyayaAI Verified Response:</span>
                    {isNyayaLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Synthesizing statutory ratio...</span>
                      </div>
                    ) : (
                      <p>{nyayaResponse}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Supported in English, Gujarati, Hindi & Hinglish
                  </span>
                  <Link
                    href={`/ai-tutor?prompt=${encodeURIComponent(nyayaQuery)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition"
                  >
                    <span>Open Full AI Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. QUICK BNS VS IPC CONVERSION WIDGET */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Statutory Reference
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quick IPC ↔ BNS 2023 Section Lookup
              </h2>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={bnsSearch}
                onChange={(e) => setBnsSearch(e.target.value)}
                placeholder="Search section or offence (e.g. 302, 420)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBns.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 hover:bg-white hover:border-amber-300 transition">
                <span className="text-xs font-bold text-slate-900 block truncate">{item.offence}</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-700 font-mono font-bold">{item.ipc}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{item.bns}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{item.change}</p>
              </div>
            ))}
          </div>

          <div className="text-right">
            <Link href="/bns-vs-ipc" className="text-xs font-bold text-amber-700 hover:underline">
              View Complete 358-Section Comparative Table →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. PRODUCT STATISTICS & AUTHENTIC METRICS */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-3xl font-extrabold text-slate-900 block">9</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Gujarat Universities Monitored</span>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-3xl font-extrabold text-amber-600 block">1,414+</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Verified Syllabus Topics</span>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-3xl font-extrabold text-emerald-600 block">5,200+</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Syllabus-Aligned MCQs</span>
            </div>
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <span className="text-3xl font-extrabold text-slate-900 block">100%</span>
              <span className="text-xs font-semibold text-slate-500 mt-1 block">Official Source Audited</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-4 sm:p-5 text-left bg-slate-50 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CONVERSION CTA STRIP */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Elevate Your Law School Journey?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of Gujarat law students studying with verified official syllabi, AI answer grading, drafting labs, and NyayaAI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs sm:text-sm font-extrabold transition shadow-lg"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <span>Open Student OS Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
