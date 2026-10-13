"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Bookmark,
  Search,
  Building2,
  Scale,
  FileText,
  Clock,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ArrowRight,
  Check,
  RotateCcw,
  Layers,
  GraduationCap,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  HelpCircle,
  BookCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExamPrepLibraryPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  // Entitlement & Access State
  const [accessData, setAccessData] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Hierarchy Selector State
  const [universities, setUniversities] = useState([]);
  const [selectedUniId, setSelectedUniId] = useState('gu');
  const [selectedUniversityData, setSelectedUniversityData] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedMarksCategory, setSelectedMarksCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Questions Content State
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  // Expandable Answer Section toggles
  const [expandedSections, setExpandedSections] = useState({
    structure: true,
    provisions: true,
    caselaw: true,
    revision: true,
  });

  // Student Study Tools State (DB Persisted via /api/exam-prep/study-state)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [revisionsMap, setRevisionsMap] = useState({}); // { [questionId]: 'MASTERED' | 'NEED_REVISION' }

  // 1. Initial Access Check
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser) {
      router.push(`/signup?redirect=${encodeURIComponent('/exam-prep/library')}`);
      return;
    }

    async function checkAccess() {
      try {
        const res = await fetch('/api/exam-prep/access');
        if (res.ok) {
          const data = await res.json();
          setAccessData(data);
        }
      } catch (err) {
        console.warn('Access check error:', err);
      } finally {
        setIsCheckingAccess(false);
      }
    }

    checkAccess();
  }, [currentUser, isAuthLoading, router]);

  // 2. Load DB-persisted bookmarks & revisions
  useEffect(() => {
    async function loadStudyState() {
      try {
        const res = await fetch('/api/exam-prep/study-state');
        if (res.ok) {
          const data = await res.json();
          if (data.bookmarks) {
            setBookmarkedIds(new Set(data.bookmarks));
          }
          if (data.revisions) {
            setRevisionsMap(data.revisions);
          }
        }
      } catch (err) {
        console.warn('Failed to load study state:', err);
      }
    }

    if (currentUser) {
      loadStudyState();
    }
  }, [currentUser]);

  // DB-persisted Bookmark Toggle Handler
  const toggleBookmark = async (qId) => {
    // Optimistic UI update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });

    try {
      await fetch('/api/exam-prep/study-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_bookmark', questionId: qId }),
      });
    } catch (err) {
      console.warn('Error saving bookmark to DB:', err);
    }
  };

  // DB-persisted Revision Status Toggle Handler (Cycles: NONE -> NEED_REVISION -> MASTERED -> NONE)
  const cycleRevisionStatus = async (qId) => {
    const current = revisionsMap[qId] || 'NONE';
    let nextStatus = 'NEED_REVISION';
    if (current === 'NEED_REVISION') nextStatus = 'MASTERED';
    else if (current === 'MASTERED') nextStatus = 'NONE';

    // Optimistic UI update
    setRevisionsMap((prev) => {
      const updated = { ...prev };
      if (nextStatus === 'NONE') delete updated[qId];
      else updated[qId] = nextStatus;
      return updated;
    });

    try {
      await fetch('/api/exam-prep/study-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_revision',
          questionId: qId,
          status: nextStatus,
        }),
      });
    } catch (err) {
      console.warn('Error updating revision status in DB:', err);
    }
  };

  // 3. Load Universities & Academic Hierarchy
  useEffect(() => {
    async function loadUniversities() {
      try {
        const res = await fetch('/api/exam-prep/hierarchy');
        if (res.ok) {
          const data = await res.json();
          if (data.universities) {
            setUniversities(data.universities);
            const userUni = currentUser?.universityId;
            if (userUni && data.universities.some(u => u.id === userUni)) {
              setSelectedUniId(userUni);
            }
          }
        }
      } catch (err) {
        console.warn('Hierarchy error:', err);
      }
    }
    loadUniversities();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUniId) return;

    async function loadUniData() {
      try {
        const res = await fetch(`/api/exam-prep/hierarchy?universityId=${selectedUniId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.university) {
            setSelectedUniversityData(data.university);

            // Select course
            const validCourses = data.university.courses || [];
            const userCourse = currentUser?.courseId;
            const targetCourse = validCourses.find(c => c.id === userCourse) || validCourses[0];
            const courseId = targetCourse?.id || '';
            setSelectedCourseId(courseId);

            // Select semester
            const validSemesters = targetCourse?.semesters || [];
            const userSem = currentUser?.semesterId;
            const targetSem = validSemesters.find(s => s.id === userSem) || validSemesters[0];
            const semId = targetSem?.id || '';
            setSelectedSemesterId(semId);

            // Select subject
            const validSubjects = targetSem?.subjects || [];
            setSelectedSubjectId(validSubjects[0]?.id || '');
          }
        }
      } catch (err) {
        console.warn('Uni data error:', err);
      }
    }
    loadUniData();
  }, [selectedUniId, currentUser]);

  const availableCourses = useMemo(() => selectedUniversityData?.courses || [], [selectedUniversityData]);
  const availableSemesters = useMemo(() => {
    const course = availableCourses.find(c => c.id === selectedCourseId);
    return course?.semesters || [];
  }, [availableCourses, selectedCourseId]);
  const availableSubjects = useMemo(() => {
    const sem = availableSemesters.find(s => s.id === selectedSemesterId);
    return sem?.subjects || [];
  }, [availableSemesters, selectedSemesterId]);

  // Handle dependent selector changes
  const handleUniversityChange = (uniId) => {
    setSelectedUniId(uniId);
  };

  const handleCourseChange = (cId) => {
    setSelectedCourseId(cId);
    const course = availableCourses.find(c => c.id === cId);
    const firstSem = course?.semesters?.[0];
    setSelectedSemesterId(firstSem?.id || '');
    setSelectedSubjectId(firstSem?.subjects?.[0]?.id || '');
  };

  const handleSemesterChange = (semId) => {
    setSelectedSemesterId(semId);
    const sem = availableSemesters.find(s => s.id === semId);
    setSelectedSubjectId(sem?.subjects?.[0]?.id || '');
  };

  // 4. Fetch Questions & Answers for selected Subject & Filters
  useEffect(() => {
    async function fetchQuestions() {
      setIsLoadingQuestions(true);
      try {
        const params = new URLSearchParams();
        if (selectedUniId) params.set('universityId', selectedUniId);
        if (selectedSubjectId) params.set('subjectId', selectedSubjectId);
        if (selectedMarksCategory && selectedMarksCategory !== 'ALL') {
          params.set('marksCategory', selectedMarksCategory);
        }
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/exam-prep/content?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.questions) {
            setQuestions(data.questions);
            if (data.questions.length > 0) {
              setActiveQuestionId(data.questions[0].id);
            } else {
              setActiveQuestionId(null);
            }
          }
        }
      } catch (err) {
        console.warn('Fetch questions error:', err);
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    fetchQuestions();
  }, [selectedUniId, selectedSubjectId, selectedMarksCategory, searchQuery]);

  // Active question calculation & index navigation
  const currentIndex = useMemo(() => {
    return questions.findIndex(q => q.id === activeQuestionId);
  }, [questions, activeQuestionId]);

  const activeQuestion = useMemo(() => {
    if (currentIndex >= 0) return questions[currentIndex];
    return questions[0] || null;
  }, [questions, currentIndex]);

  const handlePrevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setActiveQuestionId(questions[currentIndex - 1].id);
    }
  }, [currentIndex, questions]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      setActiveQuestionId(questions[currentIndex + 1].id);
    }
  }, [currentIndex, questions]);

  // Accessible Keyboard Navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevQuestion();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevQuestion, handleNextQuestion]);

  // Print Formatter
  const handlePrintAnswer = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isAuthLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading Exam Prep Library...
      </div>
    );
  }

  const isEntitled = accessData?.hasAccess;
  const currentSubjectObj = availableSubjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 print:bg-white print:text-black">
      
      {/* Top Header Bar (Hidden in print) */}
      <header className="sticky top-0 z-30 bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/exam-prep" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Product Overview
          </Link>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-white">
              Exam Prep Workspace
            </span>
            {isEntitled ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>Pass Active</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Teaser Mode</span>
              </span>
            )}
          </div>
        </div>

        {/* User Account Info & Upgrade Link if Unpaid */}
        <div className="flex items-center gap-3">
          {!isEntitled ? (
            <Link
              href="/exam-prep/checkout"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
            >
              <span>Unlock All Answers (₹299)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="hidden sm:inline">Student:</span>
              <span className="font-semibold text-white">{currentUser?.fullName || currentUser?.phoneNumber || currentUser?.email}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Unpaid Locked Banner Notice (Hidden in print) */}
        {!isEntitled && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">Full Model Answers & Legal Citations Locked</h4>
                <p className="text-xs text-slate-300">
                  Upgrade to the ₹299 Exam Prep Pass to unlock all 500+ structured model answers, BNS 2023 provisions, Supreme Court case ratios, and persistent revision bookmarking.
                </p>
              </div>
            </div>

            <Link
              href="/exam-prep/checkout"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-lg transition-all"
            >
              <span>Get Pass — ₹299</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Global Context Selector Filter Bar (Hidden in print) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center print:hidden">
          
          {/* University */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">University</label>
            <select
              value={selectedUniId}
              onChange={(e) => handleUniversityChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {universities.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Program</label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {availableCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Semester</label>
            <select
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {availableSemesters.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {availableSubjects.map(subj => (
                <option key={subj.id} value={subj.id}>{subj.title} ({subj.shortCode})</option>
              ))}
            </select>
          </div>

          {/* Marks Format */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Marks Category</label>
            <select
              value={selectedMarksCategory}
              onChange={(e) => setSelectedMarksCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Marks Formats</option>
              <option value="2_MARKS">2 Marks (Definitions)</option>
              <option value="5_MARKS">5 Marks (Short Notes)</option>
              <option value="10_MARKS">10 Marks (Descriptive)</option>
              <option value="14_15_MARKS">14/15 Marks (Full Essay)</option>
              <option value="PROBLEM_BASED">Problem Cases (IRAC)</option>
            </select>
          </div>

        </div>

        {/* Content Coverage & Subject Header Bar */}
        {currentSubjectObj && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-400 print:hidden">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">{currentSubjectObj.title}</span>
              <span>•</span>
              <span>Syllabus: {currentSubjectObj.syllabusVersion || 'CBCS 2024-25'}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">{questions.length} Questions in View</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">
                Keyboard shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">←</kbd> Previous • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">→</kbd> Next
              </span>
            </div>
          </div>
        )}

        {/* Two-Column Question Browser & Answer Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Questions List Navigation (5 cols) (Hidden in print) */}
          <div className="lg:col-span-5 space-y-4 print:hidden">
            
            {/* Search within subject */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Questions List Container */}
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {isLoadingQuestions ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading questions...</div>
              ) : questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  No questions match your current filters.
                </div>
              ) : (
                questions.map((q, idx) => {
                  const isSelected = q.id === (activeQuestionId || activeQuestion?.id);
                  const isBookmarked = bookmarkedIds.has(q.id);
                  const revStatus = revisionsMap[q.id]; // 'MASTERED' | 'NEED_REVISION' | undefined

                  return (
                    <div
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-black">
                            {q.marks}M
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {q.marksCategory?.replace('_', ' ') || 'EXAM'}
                          </span>
                          {q.isLocked && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        {/* Quick Study Actions */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Revision Status Indicator */}
                          <button
                            type="button"
                            onClick={() => cycleRevisionStatus(q.id)}
                            title={
                              revStatus === 'MASTERED'
                                ? 'Status: Revised / Mastered'
                                : revStatus === 'NEED_REVISION'
                                ? 'Status: Needs Revision'
                                : 'Click to track revision progress'
                            }
                            className={`p-1 rounded-md transition-colors ${
                              revStatus === 'MASTERED'
                                ? 'text-emerald-400 bg-emerald-500/15'
                                : revStatus === 'NEED_REVISION'
                                ? 'text-amber-400 bg-amber-500/15'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Bookmark Action */}
                          <button
                            type="button"
                            onClick={() => toggleBookmark(q.id)}
                            title={isBookmarked ? 'Bookmarked' : 'Bookmark Question'}
                            className={`p-1 rounded-md transition-colors ${
                              isBookmarked ? 'text-amber-400 bg-amber-500/15' : 'text-slate-600 hover:text-slate-400'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
                        {idx + 1}. {q.questionText}
                      </h4>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/40">
                        <span>{q.unitName || q.subject?.shortCode || 'Law Topic'}</span>
                        {revStatus && (
                          <span className={`font-semibold ${revStatus === 'MASTERED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {revStatus === 'MASTERED' ? '✓ Revised' : '⚠ Need Revision'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Detailed Model Answer Viewer (7 cols or full width in print) */}
          <div className="lg:col-span-7 print:col-span-12 print:w-full">
            {activeQuestion ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md print:bg-white print:border-none print:shadow-none print:p-0">
                
                {/* Header Metadata & Study Actions (Hidden in print) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 print:hidden">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
                      {activeQuestion.marks} MARKS
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
                      {activeQuestion.marksCategory?.replace('_', ' ') || 'EXAM FORMAT'}
                    </span>
                    {activeQuestion.verificationStatus === 'LEGALLY_VERIFIED' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        ✓ Legally Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Revision Toggle Button */}
                    <button
                      type="button"
                      onClick={() => cycleRevisionStatus(activeQuestion.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        revisionsMap[activeQuestion.id] === 'MASTERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : revisionsMap[activeQuestion.id] === 'NEED_REVISION'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {revisionsMap[activeQuestion.id] === 'MASTERED'
                          ? 'Revised'
                          : revisionsMap[activeQuestion.id] === 'NEED_REVISION'
                          ? 'Needs Revision'
                          : 'Track Revision'}
                      </span>
                    </button>

                    {/* Bookmark Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleBookmark(activeQuestion.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        bookmarkedIds.has(activeQuestion.id)
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{bookmarkedIds.has(activeQuestion.id) ? 'Saved' : 'Bookmark'}</span>
                    </button>

                    {/* Print / Save PDF Button */}
                    <button
                      type="button"
                      onClick={handlePrintAnswer}
                      title="Print or Save PDF"
                      className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Print Title Header (Only visible when printing) */}
                <div className="hidden print:block border-b pb-4 mb-4">
                  <div className="text-xl font-bold">LowStudy — Exam Preparation Model Answer</div>
                  <div className="text-sm text-gray-600">
                    Subject: {currentSubjectObj?.title || 'Law'} • {activeQuestion.marks} Marks • {activeQuestion.marksCategory}
                  </div>
                </div>

                {/* Question Title */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 print:text-amber-800">
                    Important Practice Question • {activeQuestion.marks} Marks
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white print:text-black leading-snug">
                    {activeQuestion.questionText}
                  </h2>
                  {activeQuestion.sourceReferences && (
                    <div className="text-[11px] text-slate-400 print:text-gray-600">
                      Past Pattern Reference: {activeQuestion.sourceReferences}
                    </div>
                  )}
                </div>

                {/* Answer Architecture Breakdown (Expandable) */}
                {activeQuestion.answerStructure && activeQuestion.answerStructure.length > 0 && (
                  <div className="space-y-2 bg-slate-950/60 print:bg-gray-50 p-4 rounded-2xl border border-slate-800 print:border-gray-200">
                    <div
                      onClick={() => toggleSection('structure')}
                      className="text-[11px] font-bold uppercase tracking-wider text-slate-300 print:text-gray-700 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400 print:text-amber-700" />
                        <span>Recommended Answer Architecture ({activeQuestion.answerStructure.length} Steps)</span>
                      </div>
                      {expandedSections.structure ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>

                    {expandedSections.structure && (
                      <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in">
                        {activeQuestion.answerStructure.map((step, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-gray-300 text-slate-300 print:text-gray-800 text-xs">
                            {idx + 1}. {step}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Full Model Answer */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-gray-700 flex items-center justify-between">
                    <span>Structured Model Answer:</span>
                    {activeQuestion.isLocked && (
                      <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Teaser Preview</span>
                      </span>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950 print:bg-white border border-slate-800/80 print:border-gray-300 text-xs sm:text-sm text-slate-200 print:text-black leading-relaxed whitespace-pre-line font-normal">
                    {activeQuestion.modelAnswer}
                  </div>
                </div>

                {/* If Unpaid, Show Unlock CTA Card (Hidden in print) */}
                {activeQuestion.isLocked && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-center space-y-3 print:hidden">
                    <h4 className="text-sm font-bold text-white">
                      Unlock Complete Model Answer & Legal Citations
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Get unrestricted access to the complete model answer, BNS 2023 legal provisions, and landmark case ratios for ₹299.
                    </p>
                    <Link
                      href="/exam-prep/checkout"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                    >
                      <span>Unlock Pass — ₹299</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Statutory Provisions & Landmark Case Laws (If Entitled) */}
                {isEntitled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {activeQuestion.legalProvisions && activeQuestion.legalProvisions.length > 0 && (
                      <div className="bg-slate-950 print:bg-gray-50 p-4 rounded-2xl border border-slate-800 print:border-gray-200 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5" />
                          <span>Statutory Legal Provisions:</span>
                        </div>
                        <ul className="list-disc list-inside text-xs text-slate-300 print:text-gray-800 space-y-1">
                          {activeQuestion.legalProvisions.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeQuestion.caseLawReferences && activeQuestion.caseLawReferences.length > 0 && (
                      <div className="bg-slate-950 print:bg-gray-50 p-4 rounded-2xl border border-slate-800 print:border-gray-200 space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Landmark Case Laws:</span>
                        </div>
                        <ul className="space-y-1.5 text-xs">
                          {activeQuestion.caseLawReferences.map((c, idx) => (
                            <li key={idx} className="text-slate-300 print:text-gray-800">
                              <strong className="text-white print:text-black">{c.title}</strong> {c.citation && <span className="text-slate-400 print:text-gray-600">({c.citation})</span>}
                              {c.ratio && <div className="text-[11px] text-slate-400 print:text-gray-600 pl-2">↳ {c.ratio}</div>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Rapid Last-Minute Revision Points (If Entitled) */}
                {isEntitled && activeQuestion.keyRevisionPoints && activeQuestion.keyRevisionPoints.length > 0 && (
                  <div className="bg-emerald-950/20 print:bg-emerald-50 border border-emerald-500/20 print:border-emerald-200 p-4 rounded-2xl space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Last-Minute Revision Bullet Points:</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 print:text-gray-800">
                      {activeQuestion.keyRevisionPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bottom Navigation: Previous / Next Question (Hidden in print) */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-5 print:hidden">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentIndex <= 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Question</span>
                  </button>

                  <span className="text-xs text-slate-500">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={currentIndex >= questions.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-xs text-slate-500">
                Select a question from the list on the left to read its structured model answer.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
