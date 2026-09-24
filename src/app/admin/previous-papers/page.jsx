"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  Save, 
  X, 
  Check,
  Search,
  ExternalLink,
  Lock,
  Download
} from 'lucide-react';

export default function AdminPreviousPapersPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [paperQuestions, setPaperQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // New Paper Upload Form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    universityId: 'su',
    courseId: 'su-llb-3yr',
    semesterId: 'su-llb-3yr-sem3',
    subjectId: 'su-sem3-220301',
    examYear: 2024,
    examSession: 'WINTER',
    title: '',
    paperCode: '',
    totalMarks: 70,
    durationMinutes: 180,
    fileUrl: '',
    allowDownload: true,
    status: 'PUBLISHED',
    instructions: '1. All questions are compulsory. 2. Figures to the right indicate full marks.'
  });

  // Editing Question Mapping state
  const [editingMapping, setEditingMapping] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/previous-papers?status=ALL&limit=50');
      const json = await res.json();
      if (json.success) {
        setPapers(json.data.items || []);
      }
    } catch (err) {
      console.error('Error fetching admin papers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openMappingReview = async (paper) => {
    setSelectedPaper(paper);
    setEditingMapping(null);
    try {
      setQuestionsLoading(true);
      const res = await fetch(`/api/previous-papers/${paper.id}`);
      const json = await res.json();
      if (json.success) {
        setPaperQuestions(json.data.structuredQuestions || []);
      }
    } catch (err) {
      console.error('Error fetching paper questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/previous-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        setShowUploadModal(false);
        fetchPapers();
      } else {
        alert(json.error || 'Failed to upload paper');
      }
    } catch (err) {
      alert('Error saving paper: ' + err.message);
    }
  };

  const handlePublishPaper = async (paperId) => {
    try {
      const res = await fetch(`/api/previous-papers/${paperId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });
      const json = await res.json();
      if (json.success) {
        fetchPapers();
        if (selectedPaper?.id === paperId) {
          setSelectedPaper(prev => ({ ...prev, status: 'PUBLISHED' }));
        }
      }
    } catch (err) {
      console.error('Error publishing paper:', err);
    }
  };

  const handleStartEditMapping = (q) => {
    setEditingMapping(q.mappingId);
    setEditFormData({
      mappingId: q.mappingId,
      sectionName: q.sectionName,
      questionNumber: q.questionNumber,
      marks: q.marks,
      isCompulsory: q.isCompulsory,
      questionText: q.questionText,
      topicId: q.hierarchy.topicId || '',
      mappingStatus: 'VERIFIED',
      mappingNotes: 'Verified and approved by Administrator.'
    });
  };

  const handleSaveMapping = async (e) => {
    e.preventDefault();
    if (!selectedPaper || !editFormData.mappingId) return;

    try {
      const res = await fetch(`/api/previous-papers/${selectedPaper.id}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const json = await res.json();
      if (json.success) {
        setEditingMapping(null);
        // Refresh questions list
        openMappingReview(selectedPaper);
      } else {
        alert(json.error || 'Failed to save mapping');
      }
    } catch (err) {
      alert('Error saving mapping: ' + err.message);
    }
  };

  const handleDeletePaper = async (id) => {
    if (!confirm('Are you sure you want to delete this previous paper?')) return;
    try {
      const res = await fetch(`/api/previous-papers/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        if (selectedPaper?.id === id) setSelectedPaper(null);
        fetchPapers();
      }
    } catch (err) {
      console.error('Error deleting paper:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <Link href="/admin" className="hover:text-amber-400 transition-colors">Admin Dashboard</Link>
              <span>/</span>
              <span className="text-amber-400">Previous Year Papers</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              University Papers & AI Mapping Moderation
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Upload university examination papers, configure PDF download permissions, and review or correct AI-generated syllabus mappings before publication.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/previous-papers"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Student View
            </Link>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              Upload New Paper
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Papers Overview Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Archived Examination Papers</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage papers and syllabus question associations</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
              {papers.length} Papers Archived
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Paper / Subject</th>
                  <th className="px-5 py-3">University & Term</th>
                  <th className="px-5 py-3">Year & Session</th>
                  <th className="px-5 py-3">Questions</th>
                  <th className="px-5 py-3">Download</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                {papers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{p.subject?.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Code: {p.paperCode || p.subject?.shortCode} • {p.totalMarks} Marks
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-300">{p.university?.name || 'Saurashtra University'}</div>
                      <div className="text-[11px] text-slate-500">{p.semester?.title}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-amber-400">{p.examSession} {p.examYear}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-300">
                      {p.questionCount || 0} Questions
                    </td>
                    <td className="px-5 py-4">
                      {p.allowDownload ? (
                        <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> View Only
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        p.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        p.status === 'AI_MAPPED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openMappingReview(p)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 transition-colors"
                      >
                        Correct Mappings
                      </button>
                      <button
                        onClick={() => handleDeletePaper(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete Paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI MAPPING REVIEW & CORRECTION DRAWER */}
        {selectedPaper && (
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Admin AI Mapping Moderation Panel
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedPaper.displayTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review extracted questions, re-assign topics, correct marks, and verify before publication.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedPaper.status !== 'PUBLISHED' && (
                  <button
                    onClick={() => handlePublishPaper(selectedPaper.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Publish Paper
                  </button>
                )}
                <button
                  onClick={() => setSelectedPaper(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Questions List with Inline Editor */}
            {questionsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading mapped questions...</div>
            ) : (
              <div className="space-y-4">
                {paperQuestions.map((q) => {
                  const isEditing = editingMapping === q.mappingId;

                  return (
                    <div
                      key={q.mappingId}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4"
                    >
                      {!isEditing ? (
                        /* Read-only Mapping View */
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-400 text-sm">{q.questionNumber}</span>
                              <span className="text-xs text-slate-400">({q.sectionName})</span>
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                                {q.marks} Marks
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                q.mappingStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' :
                                q.mappingStatus === 'MANUAL_OVERRIDE' ? 'bg-sky-500/20 text-sky-300' :
                                'bg-amber-500/20 text-amber-300'
                              }`}>
                                {q.mappingStatus}
                              </span>

                              <button
                                onClick={() => handleStartEditMapping(q)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                                Edit Mapping
                              </button>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-white leading-relaxed">{q.questionText}</p>

                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                            <span className="text-slate-500 font-bold">Mapped Syllabus:</span>
                            <span className="text-amber-300 font-semibold">
                              {q.hierarchy.subjectCode} • Unit {q.hierarchy.unitNumber}: {q.hierarchy.topicTitle}
                            </span>
                          </div>
                        </div>
                      ) : (
                        /* Inline Editor Form */
                        <form onSubmit={handleSaveMapping} className="space-y-4 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5" />
                              Edit Mapping & Content
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingMapping(null)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Section</label>
                              <input
                                type="text"
                                value={editFormData.sectionName}
                                onChange={(e) => setEditFormData({ ...editFormData, sectionName: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Question Number</label>
                              <input
                                type="text"
                                value={editFormData.questionNumber}
                                onChange={(e) => setEditFormData({ ...editFormData, questionNumber: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 block mb-1">Marks</label>
                              <input
                                type="number"
                                value={editFormData.marks}
                                onChange={(e) => setEditFormData({ ...editFormData, marks: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1">Question Text</label>
                            <textarea
                              rows={2}
                              value={editFormData.questionText}
                              onChange={(e) => setEditFormData({ ...editFormData, questionText: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingMapping(null)}
                              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save Mapping Changes
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* UPLOAD NEW PAPER MODAL */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  Upload University Examination Paper
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePaper} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-400 block mb-1">Subject</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="su-sem3-220301">Labour and Industrial Law - I (220301)</option>
                    <option value="su-sem3-220302">Labour and Industrial Law - II (220302)</option>
                    <option value="su-sem3-220303">Principles of Taxation Laws (220303)</option>
                    <option value="su-sem3-220304">Principal of Banking Laws (220304)</option>
                    <option value="su-sem3-220305">Information Technology Laws (220305)</option>
                    <option value="gu-sem1-new-const-1">Constitutional Law - I (CONST-1)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Exam Year</label>
                    <input
                      type="number"
                      value={formData.examYear}
                      onChange={(e) => setFormData({ ...formData, examYear: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Session</label>
                    <select
                      value={formData.examSession}
                      onChange={(e) => setFormData({ ...formData, examSession: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="WINTER">WINTER</option>
                      <option value="SUMMER">SUMMER</option>
                      <option value="REGULAR">REGULAR</option>
                      <option value="REMEDIAL">REMEDIAL</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Paper Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SU-LLB-SEM3-220301"
                      value={formData.paperCode}
                      onChange={(e) => setFormData({ ...formData, paperCode: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Paper PDF File URL</label>
                  <input
                    type="url"
                    placeholder="https://.../paper.pdf (optional, fallback structured view provided)"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowDownload"
                    checked={formData.allowDownload}
                    onChange={(e) => setFormData({ ...formData, allowDownload: e.target.checked })}
                    className="rounded border-slate-800 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="allowDownload" className="text-slate-300 font-semibold cursor-pointer">
                    Permit Students to Download Paper PDF
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                  >
                    Upload Paper
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
