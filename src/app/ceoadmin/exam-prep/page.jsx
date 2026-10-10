"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Layers,
  FileText,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Scale,
  X,
  ChevronDown,
  Check,
  BookOpen
} from 'lucide-react';

export default function AdminExamPrepPage() {
  const [activeTab, setActiveTab] = useState('coverage'); // 'coverage' | 'questions'

  // Coverage Matrix State
  const [coverageData, setCoverageData] = useState(null);
  const [isCoverageLoading, setIsCoverageLoading] = useState(true);

  // Questions Management State
  const [questionsData, setQuestionsData] = useState(null);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [marksFilter, setMarksFilter] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' | 'edit'

  // Form State
  const [formState, setFormState] = useState({
    id: '',
    universityId: 'gu',
    courseId: 'gu-llb-3yr',
    semesterId: 'gu-llb-3yr-sem1',
    subjectId: 'gu-sem1-new-const-1',
    questionText: '',
    questionTextGu: '',
    marks: 10,
    marksCategory: '10_MARKS',
    expectedAnswerLength: '350-450 words',
    suggestedTimeMinutes: 15,
    difficulty: 'MEDIUM',
    importanceLevel: 'HIGH',
    modelAnswer: '',
    modelAnswerGu: '',
    answerStructure: '',
    legalProvisions: '',
    caseLawReferences: '',
    keyRevisionPoints: '',
    sourceReferences: 'Official University Syllabus & Exam Pattern',
    publicationStatus: 'PUBLISHED',
    verificationStatus: 'VERIFIED',
  });

  const [formSaving, setFormSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // 1. Fetch Coverage Matrix
  const fetchCoverage = useCallback(async () => {
    setIsCoverageLoading(true);
    try {
      const res = await fetch('/api/ceoadmin/exam-prep/coverage');
      if (res.ok) {
        const data = await res.json();
        setCoverageData(data);
      }
    } catch (err) {
      console.error('Failed to load coverage report:', err);
    } finally {
      setIsCoverageLoading(false);
    }
  }, []);

  // 2. Fetch Questions List
  const fetchQuestions = useCallback(async () => {
    setIsQuestionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (marksFilter) params.set('marks', marksFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/ceoadmin/exam-prep/questions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuestionsData(data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsQuestionsLoading(false);
    }
  }, [statusFilter, marksFilter, search]);

  useEffect(() => {
    if (activeTab === 'coverage') {
      fetchCoverage();
    } else {
      fetchQuestions();
    }
  }, [activeTab, fetchCoverage, fetchQuestions]);

  const handleOpenCreate = () => {
    setEditorMode('create');
    setFormState({
      id: '',
      universityId: 'gu',
      courseId: 'gu-llb-3yr',
      semesterId: 'gu-llb-3yr-sem1',
      subjectId: 'gu-sem1-new-const-1',
      questionText: '',
      questionTextGu: '',
      marks: 10,
      marksCategory: '10_MARKS',
      expectedAnswerLength: '350-450 words',
      suggestedTimeMinutes: 15,
      difficulty: 'MEDIUM',
      importanceLevel: 'HIGH',
      modelAnswer: '',
      modelAnswerGu: '',
      answerStructure: '["Introduction", "Statutory Framework", "Essential Ingredients", "Landmark Precedents", "Conclusion"]',
      legalProvisions: '["BNS 2023 Sec ...", "Constitution of India Art ..."]',
      caseLawReferences: '[{"title": "Leading Supreme Court Case", "citation": "AIR 2024 SC", "ratio": "Legal principle"}]',
      keyRevisionPoints: '["Core statutory definition", "Essential elements", "Landmark ratio"]',
      sourceReferences: 'Official University Syllabus & Exam Pattern',
      publicationStatus: 'PUBLISHED',
      verificationStatus: 'VERIFIED',
    });
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditorMode('edit');
    setFormState({
      id: q.id,
      universityId: q.universityId,
      courseId: q.courseId,
      semesterId: q.semesterId,
      subjectId: q.subjectId,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu || '',
      marks: q.marks,
      marksCategory: q.marksCategory,
      expectedAnswerLength: q.expectedAnswerLength || '',
      suggestedTimeMinutes: q.suggestedTimeMinutes || 15,
      difficulty: q.difficulty || 'MEDIUM',
      importanceLevel: q.importanceLevel || 'HIGH',
      modelAnswer: q.modelAnswer,
      modelAnswerGu: q.modelAnswerGu || '',
      answerStructure: q.answerStructure || '',
      legalProvisions: q.legalProvisions || '',
      caseLawReferences: q.caseLawReferences || '',
      keyRevisionPoints: q.keyRevisionPoints || '',
      sourceReferences: q.sourceReferences || '',
      publicationStatus: q.publicationStatus || 'PUBLISHED',
      verificationStatus: q.verificationStatus || 'VERIFIED',
    });
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const method = editorMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch('/api/ceoadmin/exam-prep/questions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const json = await res.json();
      if (json.success) {
        setAlertMsg({ type: 'success', text: `Question ${editorMode === 'create' ? 'created' : 'updated'} successfully.` });
        setIsEditorOpen(false);
        fetchQuestions();
      } else {
        setAlertMsg({ type: 'error', text: json.error || 'Failed to save question.' });
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this exam prep question?')) return;
    try {
      const res = await fetch(`/api/ceoadmin/exam-prep/questions?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setAlertMsg({ type: 'success', text: 'Question deleted successfully.' });
        fetchQuestions();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const summary = coverageData?.summary || {};
  const coverageMatrix = coverageData?.coverageMatrix || [];
  const questionsList = questionsData?.questions || [];

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            <span>Exam Prep Content & Coverage Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit subject question coverage, review model answers, and publish marks-wise preparation material.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('coverage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coverage'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coverage Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Question Bank Manager
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/40 border border-red-800 text-red-300'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button onClick={() => setAlertMsg(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: COVERAGE MATRIX REPORT */}
      {activeTab === 'coverage' && (
        <div className="space-y-6">
          
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Universities</span>
              <div className="text-2xl sm:text-3xl font-black text-white">{summary.totalUniversities || 0}</div>
              <div className="text-[11px] text-slate-400">Across {summary.totalSubjectsReported || 0} subjects</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Published Questions</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{summary.totalPublishedQuestions || 0}</div>
              <div className="text-[11px] text-slate-400">Verified Model Answers Live</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Draft Content</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{summary.totalDraftQuestions || 0}</div>
              <div className="text-[11px] text-slate-400">In Draft Staging</div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Review Pending</span>
              <div className="text-2xl sm:text-3xl font-black text-purple-400">{summary.totalInReviewQuestions || 0}</div>
              <div className="text-[11px] text-slate-400">Awaiting Admin Verification</div>
            </div>
          </div>

          {/* Coverage Matrix Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">Subject-Wise Coverage Matrix</h3>
                <p className="text-[11px] text-slate-400">Complete curriculum catalog and verified question-answer readiness</p>
              </div>
              <button
                type="button"
                onClick={fetchCoverage}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCoverageLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">University</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Version</th>
                    <th className="p-4 text-center">Published Q&A</th>
                    <th className="p-4">Marks Categories</th>
                    <th className="p-4">Coverage Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {isCoverageLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Generating coverage matrix...
                      </td>
                    </tr>
                  ) : coverageMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No subject coverage records found.
                      </td>
                    </tr>
                  ) : (
                    coverageMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div>{item.universityName}</div>
                          <span className="text-[10px] text-slate-400 uppercase">{item.universityCode}</span>
                        </td>
                        <td className="p-4 text-slate-300">
                          {item.semesterTitle}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{item.subjectTitle}</div>
                          <span className="text-[10px] font-mono text-slate-400">{item.subjectCode}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {item.syllabusVersion === 'new' ? 'BNS 2023' : 'IPC 1860'}
                        </td>
                        <td className="p-4 text-center font-bold text-emerald-400">
                          {item.publishedQuestions}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {item.marksCategories.map((mc, mIdx) => (
                              <span key={mIdx} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                {mc}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.coverageStatus === 'COMPLETE'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : item.coverageStatus === 'PARTIAL'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : item.coverageStatus === 'IN_REVIEW'
                                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                : item.coverageStatus === 'DRAFT'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.coverageStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUESTION BANK MANAGER */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search question text or answer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Tabs & Add Button */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>

          </div>

          {/* Questions Grid / List */}
          <div className="space-y-3">
            {isQuestionsLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading question records...</div>
            ) : questionsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                No questions found.
              </div>
            ) : (
              questionsList.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-black text-xs">
                        {q.marks} MARKS
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold">
                        {q.marksCategory?.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                        {q.subject?.title || 'Subject'} ({q.semester?.title})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        q.publicationStatus === 'PUBLISHED'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {q.publicationStatus}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(q)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {q.questionText}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {q.modelAnswer}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* QUESTION EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{editorMode === 'create' ? 'Create Exam Prep Question' : 'Edit Exam Prep Question'}</span>
              </h3>
              <button onClick={() => setIsEditorOpen(false)} className="p-1.5 rounded-full text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase">Marks</label>
                  <input
                    type="number"
                    value={formState.marks}
                    onChange={(e) => setFormState({ ...formState, marks: parseInt(e.target.value, 10) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase">Marks Category</label>
                  <select
                    value={formState.marksCategory}
                    onChange={(e) => setFormState({ ...formState, marksCategory: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="2_MARKS">2 Marks (Definitions)</option>
                    <option value="5_MARKS">5 Marks (Short Notes)</option>
                    <option value="10_MARKS">10 Marks (Descriptive)</option>
                    <option value="14_15_MARKS">14/15 Marks (Full Essay)</option>
                    <option value="PROBLEM_BASED">Problem Cases (IRAC)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase">Publication Status</label>
                  <select
                    value={formState.publicationStatus}
                    onChange={(e) => setFormState({ ...formState, publicationStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PUBLISHED">PUBLISHED (Live)</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Question Text (English)</label>
                <textarea
                  rows={2}
                  value={formState.questionText}
                  onChange={(e) => setFormState({ ...formState, questionText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs"
                  placeholder="Enter exam question..."
                  required
                />
              </div>

              {/* Gujarati Translation */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Question Text (Gujarati Translation)</label>
                <input
                  type="text"
                  value={formState.questionTextGu}
                  onChange={(e) => setFormState({ ...formState, questionTextGu: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  placeholder="પ્રશ્નનું ગુજરાતી ભાષાંતર..."
                />
              </div>

              {/* Model Answer */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Structured Model Answer</label>
                <textarea
                  rows={6}
                  value={formState.modelAnswer}
                  onChange={(e) => setFormState({ ...formState, modelAnswer: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono"
                  placeholder="Complete structured model answer..."
                  required
                />
              </div>

              {/* JSON Fields (Subheadings, Legal Provisions, Case Laws) */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Answer Architecture Steps (JSON Array)</label>
                <input
                  type="text"
                  value={formState.answerStructure}
                  onChange={(e) => setFormState({ ...formState, answerStructure: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Relevant Legal Provisions (JSON Array)</label>
                <input
                  type="text"
                  value={formState.legalProvisions}
                  onChange={(e) => setFormState({ ...formState, legalProvisions: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Landmark Case Laws (JSON Array of Objects)</label>
                <textarea
                  rows={2}
                  value={formState.caseLawReferences}
                  onChange={(e) => setFormState({ ...formState, caseLawReferences: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase">Rapid Revision Bullet Points (JSON Array)</label>
                <input
                  type="text"
                  value={formState.keyRevisionPoints}
                  onChange={(e) => setFormState({ ...formState, keyRevisionPoints: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg cursor-pointer"
                >
                  {formSaving ? 'Saving...' : 'Save Question'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
