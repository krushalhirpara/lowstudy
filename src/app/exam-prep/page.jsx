"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Scale,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Lock,
  Unlock,
  GraduationCap,
  Building2,
  FileText,
  Clock,
  HelpCircle,
  AlertCircle,
  Eye,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExamPrepLandingPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // Academic Selector State
  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('gu');
  const [selectedUniversityData, setSelectedUniversityData] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // Sample Previews State
  const [previewSamples, setPreviewSamples] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openFaq, setOpenFaq] = useState(0);
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(true);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  // 1. Load Initial Universities List
  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch('/api/exam-prep/hierarchy');
        if (res.ok) {
          const data = await res.json();
          if (data.universities && data.universities.length > 0) {
            setUniversities(data.universities);
            if (!selectedUniId) {
              setSelectedUniId(data.universities[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load universities:', err);
      } finally {
        setIsLoadingHierarchy(false);
      }
    }
    loadUniversities();
  }, []);

  // 2. Load Selected University Details (Courses, Semesters, Subjects)
  useEffect(() => {
    if (!selectedUniId) return;

    async function loadUniversityDetails() {
      setIsLoadingHierarchy(true);
      try {
        const res = await fetch(`/api/exam-prep/hierarchy?universityId=${selectedUniId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.university) {
            setSelectedUniversityData(data.university);

            // Auto-select first course
            const firstCourse = data.university.courses?.[0];
            if (firstCourse) {
              setSelectedCourseId(firstCourse.id);

              // Auto-select first semester
              const firstSem = firstCourse.semesters?.[0];
              if (firstSem) {
                setSelectedSemesterId(firstSem.id);

                // Auto-select first subject
                const firstSubj = firstSem.subjects?.[0];
                if (firstSubj) {
                  setSelectedSubjectId(firstSubj.id);
                } else {
                  setSelectedSubjectId('');
                }
              } else {
                setSelectedSemesterId('');
                setSelectedSubjectId('');
              }
            } else {
              setSelectedCourseId('');
              setSelectedSemesterId('');
              setSelectedSubjectId('');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load university details:', err);
      } finally {
        setIsLoadingHierarchy(false);
      }
    }

    loadUniversityDetails();
  }, [selectedUniId]);

  // Derived lists for dropdowns
  const availableCourses = useMemo(() => {
    return selectedUniversityData?.courses || [];
  }, [selectedUniversityData]);

  const availableSemesters = useMemo(() => {
    const course = availableCourses.find(c => c.id === selectedCourseId);
    return course?.semesters || [];
  }, [availableCourses, selectedCourseId]);

  const availableSubjects = useMemo(() => {
    const sem = availableSemesters.find(s => s.id === selectedSemesterId);
    return sem?.subjects || [];
  }, [availableSemesters, selectedSemesterId]);

  // 3. Load Sample Previews for selected subject / university
  useEffect(() => {
    async function loadPreviews() {
      setIsLoadingPreviews(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedUniId) queryParams.set('universityId', selectedUniId);
        if (selectedSubjectId) queryParams.set('subjectId', selectedSubjectId);

        const res = await fetch(`/api/exam-prep/preview?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.samples) {
            setPreviewSamples(data.samples);
          }
        }
      } catch (err) {
        console.warn('Failed to load sample previews:', err);
      } finally {
        setIsLoadingPreviews(false);
      }
    }
    loadPreviews();
  }, [selectedUniId, selectedSubjectId]);

  // Handle dependent selector changes
  const handleUniversityChange = (newUniId) => {
    setSelectedUniId(newUniId);
  };

  const handleCourseChange = (newCourseId) => {
    setSelectedCourseId(newCourseId);
    const course = availableCourses.find(c => c.id === newCourseId);
    const firstSem = course?.semesters?.[0];
    if (firstSem) {
      setSelectedSemesterId(firstSem.id);
      setSelectedSubjectId(firstSem.subjects?.[0]?.id || '');
    } else {
      setSelectedSemesterId('');
      setSelectedSubjectId('');
    }
  };

  const handleSemesterChange = (newSemId) => {
    setSelectedSemesterId(newSemId);
    const sem = availableSemesters.find(s => s.id === newSemId);
    setSelectedSubjectId(sem?.subjects?.[0]?.id || '');
  };

  const handleSubjectChange = (newSubjId) => {
    setSelectedSubjectId(newSubjId);
  };

  // Filter sample previews by category pill
  const filteredSamples = useMemo(() => {
    if (selectedCategory === 'ALL') return previewSamples;
    return previewSamples.filter(s => s.marksCategory === selectedCategory);
  }, [previewSamples, selectedCategory]);

  const getCheckoutLink = () => {
    return '/exam-prep/checkout';
  };

  const faqs = [
    {
      q: "What is the LowStudy Exam Prep Pass?",
      a: "The LowStudy Exam Prep Pass is a comprehensive exam preparation product for law students. For a single one-time payment of ₹299, you get unrestricted access to university-specific important practice questions, structured marks-wise model answers (2, 5, 10, 14/15, and 20 marks), statutory bare act provisions (BNS 2023, BNSS, BSA, Constitution), landmark case law citations, and high-yield revision summaries across all supported semesters."
    },
    {
      q: "Does the ₹299 pass cover only one semester or all semesters?",
      a: "The pass is a global, non-expiring entitlement covering ALL supported universities (Gujarat University, Saurashtra University, VNSGU, MSU, HNGU, etc.), all law degree programs (3-Year LL.B., 5-Year Integrated B.A. LL.B., etc.), and all semesters. You can switch universities and semesters anytime."
    },
    {
      q: "Are the questions guaranteed to appear in upcoming university exams?",
      a: "No. LowStudy questions are high-yield practice materials structured according to official university syllabus topics and past examination patterns. They are designed for educational practice, legal understanding, and structured answer writing, not as an official exam leak or guaranteed prediction."
    },
    {
      q: "How are the model answers structured for different marks categories?",
      a: "Each model answer follows university grading standards: 2-mark answers provide crisp statutory definitions; 5-mark answers deliver concise notes and distinctions; 10-mark answers follow a detailed analytical structure; and 14/15-mark answers use the rigorous IRAC framework (Issue, Rule, Application, Conclusion) with Supreme Court case law ratios."
    },
    {
      q: "Are the new criminal laws (BNS 2023, BNSS 2023, BSA 2023) included?",
      a: "Yes! All penal law and evidence questions feature updated provisions from Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam, alongside legacy IPC, CrPC, and IEA cross-references."
    },
    {
      q: "Is there any recurring subscription fee or automatic renewal?",
      a: "No. The LowStudy Exam Prep Pass is strictly a ₹299 one-time payment with non-expiring access. There are no hidden fees, recurring charges, or automatic card renewals."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Price Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>LowStudy Exam Prep Pass — ₹299 One-Time Access</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            LLB Exam Preparation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Questions & Structured Model Answers
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Prepare Smarter. Write Better. Be Exam Ready. Get university-specific, semester-wise and subject-wise exam preparation with important practice questions, marks-wise model answers and structured revision material.
          </p>

          {/* Value Highlights Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All Universities & Semesters</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>2, 5, 10, 14 & 20 Mark Formats</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>BNS 2023 & Apex Court Ratios</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>No Recurring Subscriptions</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={getCheckoutLink()}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Get Exam Prep Pass — ₹299</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <a
              href="#catalog-preview"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>Preview Sample Answers</span>
            </a>
          </div>

          {/* Honest Disclaimer */}
          <div className="pt-2">
            <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed italic">
              * Questions are prepared for educational practice using available syllabus information, examination patterns and verified sources. They are not guaranteed questions from any upcoming examination.
            </p>
          </div>

        </div>
      </section>

      {/* 2. DYNAMIC CATALOG & MARKS-WISE PREVIEW WORKBENCH */}
      <section id="catalog-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Interactive Subject Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Explore University Questions & Model Answers
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Select your university, program, semester, and subject below to inspect verified exam questions and real structured answer previews.
          </p>
        </div>

        {/* Dynamic Dependent Filter Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. University Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>1. University</span>
              </label>
              <select
                value={selectedUniId}
                onChange={(e) => handleUniversityChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {universities.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Course Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>2. Degree Program</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                disabled={availableCourses.length === 0}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
              >
                {availableCourses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Semester Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>3. Semester</span>
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => handleSemesterChange(e.target.value)}
                disabled={availableSemesters.length === 0}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
              >
                {availableSemesters.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>4. Subject</span>
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={availableSubjects.length === 0}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-amber-500 disabled:opacity-50 transition-colors"
              >
                {availableSubjects.map(subj => (
                  <option key={subj.id} value={subj.id}>
                    {subj.title} ({subj.shortCode})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Selected Context Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">Current Scope:</span>
              <span>{selectedUniversityData?.name || 'Selected University'}</span>
              <span className="text-slate-600">•</span>
              <span>{availableSemesters.find(s => s.id === selectedSemesterId)?.title || 'Semester'}</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold text-white">{availableSubjects.find(s => s.id === selectedSubjectId)?.title || 'All Subjects'}</span>
            </div>

            <div className="text-[11px] text-emerald-400 font-medium">
              ✓ Global pass unlocks all universities and semesters upon purchase
            </div>
          </div>
        </div>

        {/* Category Pills (Marks Tabs) */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: 'ALL', label: 'All Marks Formats' },
            { id: '2_MARKS', label: '2 Marks (Definitions)' },
            { id: '5_MARKS', label: '5 Marks (Short Notes)' },
            { id: '10_MARKS', label: '10 Marks (Descriptive)' },
            { id: '14_15_MARKS', label: '14/15 Marks (Full Essay)' },
            { id: 'PROBLEM_BASED', label: 'Problem Cases (IRAC)' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions & Model Answers Preview Grid */}
        <div className="space-y-6">
          {isLoadingPreviews ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
              Loading verified model answers...
            </div>
          ) : filteredSamples.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
              <p className="font-semibold text-slate-200">No public sample preview found for this filter combination.</p>
              <p>Full question bank is active and available inside the Premium Library.</p>
            </div>
          ) : (
            filteredSamples.map((sample, idx) => (
              <div
                key={sample.id || idx}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all hover:border-slate-700"
              >
                {/* Header Tag */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
                      {sample.marks} MARKS
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                      {sample.marksCategory?.replace('_', ' ') || 'EXAM FORMAT'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      Verified Model Preview
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-medium">
                    {sample.expectedAnswerLength && (
                      <span>Expected Length: <strong className="text-slate-200">{sample.expectedAnswerLength}</strong></span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Important Practice Question</div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {sample.questionText}
                  </h3>
                </div>

                {/* Structured Answer Content */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Exam Model Answer Breakdown</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      IRAC & Statutory Alignment
                    </span>
                  </div>

                  {/* Subheadings Structure Pills */}
                  {sample.answerStructure && sample.answerStructure.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400">Answer Architecture:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sample.answerStructure.map((step, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                          >
                            {sIdx + 1}. {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Answer Body */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                    {sample.modelAnswer}
                  </div>

                  {/* Legal Provisions & Case Law Citations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    {sample.legalProvisions && sample.legalProvisions.length > 0 && (
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                          Key Statutory Provisions:
                        </div>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 text-[11px]">
                          {sample.legalProvisions.map((p, pIdx) => (
                            <li key={pIdx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {sample.caseLawReferences && sample.caseLawReferences.length > 0 && (
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
                          Landmark Precedents & Ratios:
                        </div>
                        <ul className="space-y-1 text-[11px]">
                          {sample.caseLawReferences.map((c, cIdx) => (
                            <li key={cIdx} className="text-slate-300">
                              <strong className="text-white">{c.title}</strong> {c.citation && <span className="text-slate-400">({c.citation})</span>}
                              {c.ratio && <div className="text-[10px] text-slate-400 pl-2">↳ {c.ratio}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>

                {/* Bottom Card CTA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                  <span className="text-slate-400">
                    Unlock all 500+ structured model answers across subjects with the Pass.
                  </span>
                  <Link
                    href={getCheckoutLink()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 font-bold transition-colors cursor-pointer"
                  >
                    <span>Get Full Access for ₹299</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </section>

      {/* 3. WHAT IS INCLUDED IN EXAM PREP PASS (₹299) */}
      <section className="bg-slate-900/50 border-y border-slate-800/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Comprehensive Access Value</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Everything Included in the ₹299 Exam Prep Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              One transparent, non-expiring payment gives you complete preparation materials across all supported law subjects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">University & Semester Specific</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coverage tailored to Gujarat University, Saurashtra University, VNSGU, MSU, HNGU and other supported institutions across all LLB semesters.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Marks-Wise Model Answers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                2, 5, 10, 14/15, and 20-mark structured answers written to maximize examination marks with clean subheadings and points.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">BNS 2023 & Verified Citations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accurate penal provisions (BNS, BNSS, BSA) and verified landmark Supreme Court case laws with exact ratio decidendi.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-white">Problem-Based IRAC Solutions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Practical case questions broken down using the legal standard IRAC method (Issue, Rule, Application, Reasoned Conclusion).
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                5
              </div>
              <h3 className="text-base font-bold text-white">Spaced Revision Summaries</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bullet-point rapid revision summaries and bookmarking to quickly review core statutory elements on the morning of your exam.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                6
              </div>
              <h3 className="text-base font-bold text-white">Future Material Updates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your one-time pass includes access to all new Exam Prep questions and model answers continuously added to the supported catalog.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. COMPARISON MATRIX: FREE VS EXAM PREP PASS */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comparison: Free Access vs Exam Prep Pass
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Transparent breakdown of what is open access versus premium preparation.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
              <tr>
                <th className="p-4 sm:p-5">Feature / Study Resource</th>
                <th className="p-4 sm:p-5 text-center">Free Access</th>
                <th className="p-4 sm:p-5 text-center bg-amber-500/10 text-amber-400 border-x border-amber-500/20">
                  Exam Prep Pass (₹299)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Verified University Syllabi & Units</td>
                <td className="p-4 sm:p-5 text-center text-emerald-400">✓ 100% Free</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400">✓ Included</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Bare Acts (BNS 2023 vs IPC 1860)</td>
                <td className="p-4 sm:p-5 text-center text-emerald-400">✓ 100% Free</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400">✓ Included</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Important Practice Questions Catalog</td>
                <td className="p-4 sm:p-5 text-center text-slate-400">Public Teasers</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400 font-bold">
                  ✓ Full 500+ Catalog
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Marks-Wise Model Answers (2, 5, 10, 14, 20)</td>
                <td className="p-4 sm:p-5 text-center text-slate-500">Locked</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400 font-bold">
                  ✓ Full Structured Answers
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">IRAC Problem-Based Case Solutions</td>
                <td className="p-4 sm:p-5 text-center text-slate-500">Locked</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400 font-bold">
                  ✓ Full Reasoning & Ratio
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Rapid Last-Minute Revision Points</td>
                <td className="p-4 sm:p-5 text-center text-slate-500">Locked</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-emerald-400 font-bold">
                  ✓ Included
                </td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold">Cost & Billing Model</td>
                <td className="p-4 sm:p-5 text-center font-bold">₹0 Forever</td>
                <td className="p-4 sm:p-5 text-center bg-amber-500/5 border-x border-amber-500/20 text-amber-400 font-black">
                  ₹299 One-Time (No Subscriptions)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Exam Prep FAQs</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 shadow-md">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-slate-950/80 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. BOTTOM PURCHASE CTA BAR */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-amber-500/20">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-[11px] font-black uppercase tracking-wider">
              One-Time ₹299 Access
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              Start Your LLB Exam Preparation Today
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-xl">
              Gain immediate access to all university subjects, marks-wise model answers, and structured statutory revision materials.
            </p>
          </div>

          <Link
            href={getCheckoutLink()}
            className="px-8 py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-xl shrink-0 cursor-pointer active:scale-[0.98] transition-all"
          >
            <span>Get Exam Prep Pass — ₹299</span>
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </Link>
        </div>
      </section>

    </div>
  );
}
