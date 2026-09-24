"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Play, 
  BookOpen, 
  Award, 
  Calendar, 
  Building2, 
  ArrowRight, 
  BarChart3, 
  Lock, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function PreviousPapersPage() {
  const [activeTab, setActiveTab] = useState('PAPERS'); // 'PAPERS' or 'ANALYSIS'
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [universityId, setUniversityId] = useState('su');
  const [subjectId, setSubjectId] = useState('');
  const [examYear, setExamYear] = useState('');
  const [examSession, setExamSession] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Analysis State
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisSubjectId, setAnalysisSubjectId] = useState('su-sem3-220301');

  // Subjects list for filters
  const subjectsList = [
    { id: 'su-sem3-220301', name: 'Labour and Industrial Law - I', code: '220301' },
    { id: 'su-sem3-220302', name: 'Labour and Industrial Law - II', code: '220302' },
    { id: 'su-sem3-220303', name: 'Principles of Taxation Laws', code: '220303' },
    { id: 'su-sem3-220304', name: 'Principal of Banking Laws', code: '220304' },
    { id: 'su-sem3-220305', name: 'Information Technology Laws and Cyber Crimes', code: '220305' },
    { id: 'gu-sem1-new-const-1', name: 'Constitutional Law - I', code: 'CONST-1' }
  ];

  useEffect(() => {
    fetchPapers();
  }, [universityId, subjectId, examYear, examSession]);

  useEffect(() => {
    if (activeTab === 'ANALYSIS') {
      fetchAnalysis(analysisSubjectId);
    }
  }, [activeTab, analysisSubjectId]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (universityId) params.append('universityId', universityId);
      if (subjectId) params.append('subjectId', subjectId);
      if (examYear) params.append('examYear', examYear);
      if (examSession && examSession !== 'ALL') params.append('examSession', examSession);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/previous-papers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPapers(json.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (subId) => {
    try {
      setAnalysisLoading(true);
      const res = await fetch(`/api/previous-papers/analysis?subjectId=${subId}&universityId=${universityId}`);
      const json = await res.json();
      if (json.success) {
        setAnalysisData(json.data);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPapers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-amber-400">Previous Examination Papers</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <FileText className="w-8 h-8 text-amber-400" />
                University Exam Papers
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Official university question papers archived for LL.B. semester examinations with question hierarchy, practice mode, and mock tests.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/previous-papers"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                Admin Paper Upload
              </Link>
              <Link
                href="/mock-test"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Mock Test Engine
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/60 overflow-x-auto pb-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('PAPERS')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'PAPERS'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Question Papers Archive ({papers.length})
            </button>
            <button
              onClick={() => setActiveTab('ANALYSIS')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'ANALYSIS'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Evidence-Based Analysis
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                PYQ Insights
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: PAPERS LIST & FILTERS */}
        {activeTab === 'PAPERS' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-amber-400" />
                  Filter Examination Papers
                </span>

                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search paper code, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* University Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">University</label>
                  <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Universities</option>
                    <option value="su">Saurashtra University (SU)</option>
                    <option value="gu">Gujarat University (GU)</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Subjects</option>
                    {subjectsList.map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Year Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Examination Year</label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

                {/* Session Filter */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Session</label>
                  <select
                    value={examSession}
                    onChange={(e) => setExamSession(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Sessions</option>
                    <option value="WINTER">Winter Examination</option>
                    <option value="SUMMER">Summer Examination</option>
                    <option value="REGULAR">Regular</option>
                    <option value="REMEDIAL">Remedial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Papers Grid */}
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-sm font-semibold text-slate-400">Loading university examination papers...</div>
              </div>
            ) : papers.length === 0 ? (
              <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No question papers found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your search criteria or clear the subject/year filters to view available university archives.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => { setSubjectId(''); setExamYear(''); setExamSession('ALL'); setSearchQuery(''); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all group"
                  >
                    <div className="space-y-3">
                      {/* University & Year Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {paper.university?.name || 'Saurashtra University'}
                        </span>
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                          {paper.examSession} {paper.examYear}
                        </span>
                      </div>

                      {/* Title & Subject */}
                      <div>
                        <div className="text-xs font-semibold text-slate-400">
                          {paper.subject?.shortCode} • {paper.semester?.title || 'Semester 3'}
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-amber-400 transition-colors line-clamp-2">
                          {paper.subject?.title}
                        </h3>
                        {paper.paperCode && (
                          <div className="text-[11px] font-mono text-slate-500 mt-1">
                            Paper Code: {paper.paperCode}
                          </div>
                        )}
                      </div>

                      {/* Paper Specifications */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center text-xs">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Total Marks</span>
                          <span className="font-bold text-slate-200">{paper.totalMarks} Marks</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Duration</span>
                          <span className="font-bold text-slate-200">{paper.durationMinutes} Min</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Questions</span>
                          <span className="font-bold text-slate-200">{paper.questionCount || 0} Qs</span>
                        </div>
                      </div>

                      {/* Download Eligibility */}
                      <div className="flex items-center gap-2 text-[11px]">
                        {paper.allowDownload ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PDF Download Permitted
                          </span>
                        ) : (
                          <span className="text-amber-400/90 font-medium flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            Institutional View Only
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/previous-papers/${paper.id}`}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          View Paper
                        </Link>
                        <Link
                          href={`/previous-papers/${paper.id}/practice`}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                          Practice
                        </Link>
                      </div>

                      <Link
                        href={`/mock-test?paperId=${paper.id}&type=PREVIOUS_PAPER_PRACTICE&subjectId=${paper.subjectId}`}
                        className="w-full px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-400" />
                        Attempt as Mock Test
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: EVIDENCE-BASED ANALYSIS */}
        {activeTab === 'ANALYSIS' && (
          <div className="space-y-6">
            
            {/* Subject Selector for Analysis */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Target Subject</span>
                <h3 className="text-lg font-bold text-white mt-0.5">Historical Paper Distribution</h3>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={analysisSubjectId}
                  onChange={(e) => setAnalysisSubjectId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  {subjectsList.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => fetchAnalysis(analysisSubjectId)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
                  title="Refresh Analysis"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MANDATORY DISCLAIMER BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Evidence-Based Statistical Analysis
                </div>
                <div className="text-sm font-bold text-white">
                  "Based on available previous papers."
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  Historical question recurrence indicates key syllabus areas emphasized in past examinations. Frequency does NOT predict or guarantee future examination questions.
                </p>
              </div>
            </div>

            {analysisLoading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-sm font-semibold text-slate-400">Computing historical paper metrics...</div>
              </div>
            ) : analysisData && (
              <div className="space-y-8">
                
                {/* 1. Metric Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Archived Papers Analyzed</span>
                    <div className="text-3xl font-black text-white mt-1">{analysisData.meta?.totalAvailablePapers}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Years: {analysisData.meta?.availableYears?.join(', ') || 'N/A'}
                    </div>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Exam Questions Mapped</span>
                    <div className="text-3xl font-black text-amber-400 mt-1">{analysisData.meta?.totalQuestionsAnalyzed}</div>
                    <div className="text-xs text-slate-500 mt-1">Hierarchically mapped to syllabus</div>
                  </div>

                  <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Recurring Core Topics</span>
                    <div className="text-3xl font-black text-emerald-400 mt-1">
                      {analysisData.frequentlyAskedTopics?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Topics with past exam appearances</div>
                  </div>
                </div>

                {/* 2. Unit-Wise Distribution */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Curriculum Weight</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">Unit-wise Marks Distribution</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Based on available previous papers
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {analysisData.unitDistribution?.map((u) => (
                      <div key={u.unitId} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-200">
                            Unit {u.unitNumber}: {u.unitTitle}
                          </span>
                          <span className="text-slate-400 font-semibold">
                            {u.totalMarks} Marks ({u.percentageMarks}%) • {u.questionCount} Questions
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${u.percentageMarks}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Frequently Asked Topics */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Recurrence Evidence</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">Frequently Asked Topics</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Topics that have appeared in multiple available previous papers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisData.frequentlyAskedTopics?.map((t) => (
                      <div
                        key={t.topicId}
                        className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-400">
                            Unit {t.unitNumber}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Appeared {t.timesAsked}x
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {t.topicTitle}
                        </h4>

                        <div className="text-[11px] text-slate-400 font-semibold">
                          Years: <strong className="text-slate-200">{t.yearsAppeared.join(', ')}</strong> • Total Marks: <strong className="text-amber-400">{t.totalMarksAsked}M</strong>
                        </div>

                        <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80 leading-relaxed">
                          {t.evidenceRationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Repeated Concepts */}
                {analysisData.repeatedConcepts?.length > 0 && (
                  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Concept Continuity</span>
                    <h3 className="text-lg font-bold text-white">Repeated Core Concepts</h3>
                    
                    <div className="divide-y divide-slate-800/80">
                      {analysisData.repeatedConcepts.map((rc, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <div className="font-bold text-slate-200">{rc.topicTitle}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{rc.evidenceNote}</div>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20 shrink-0">
                            Unit {rc.unitNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
