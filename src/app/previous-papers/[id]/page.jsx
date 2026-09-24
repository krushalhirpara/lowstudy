"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  Play, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight,
  Download, 
  Lock, 
  Calendar, 
  Clock, 
  Award, 
  Building2, 
  Layers, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Eye
} from 'lucide-react';
import ResponsivePdfViewer from '@/components/papers/ResponsivePdfViewer';

export default function PreviousPaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('PDF'); // 'PDF' or 'STRUCTURED'

  useEffect(() => {
    if (id) {
      fetchPaperDetails();
    }
  }, [id]);

  const fetchPaperDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/previous-papers/${id}`);
      const json = await res.json();
      if (json.success) {
        setPaper(json.data);
      }
    } catch (err) {
      console.error('Error loading paper details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-poppins">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-400">Loading university examination paper...</div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center font-poppins">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-white">Examination Paper Not Found</h2>
          <p className="text-xs text-slate-400">The requested previous paper does not exist or has not been published.</p>
          <Link href="/previous-papers" className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl inline-block">
            Back to All Papers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Top Header & Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                <Link href="/dashboard" className="hover:text-amber-400 transition-colors">Dashboard</Link>
                <span>/</span>
                <Link href="/previous-papers" className="hover:text-amber-400 transition-colors">Previous Papers</Link>
                <span>/</span>
                <span className="text-amber-400">{paper.paperCode || paper.subject?.shortCode}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <FileText className="w-7 h-7 text-amber-400" />
                {paper.displayTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span>{paper.university?.name}</span>
                <span>•</span>
                <span>{paper.course?.name} ({paper.semester?.title})</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{paper.examSession} {paper.examYear}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/previous-papers/${paper.id}/practice`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-sky-400" />
                Practice Questions
              </Link>
              <Link
                href={`/mock-test?paperId=${paper.id}&type=PREVIOUS_PAPER_PRACTICE&subjectId=${paper.subjectId}`}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Attempt as Mock Test
              </Link>
            </div>
          </div>

          {/* View Mode Toggle: PDF View vs Structured Syllabus View */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800/60 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('PDF')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  viewMode === 'PDF'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF Document Viewer
              </button>
              <button
                onClick={() => setViewMode('STRUCTURED')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  viewMode === 'STRUCTURED'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                Structured Question Hierarchy ({paper.totalQuestions})
              </button>
            </div>

            {/* Paper Specs Pills */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {paper.durationMinutes} Minutes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {paper.totalMarks} Total Marks
              </span>
              <span>•</span>
              {paper.allowDownload ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Download Allowed
                </span>
              ) : (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  View Only
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* MODE 1: RESPONSIVE PDF VIEWER */}
        {viewMode === 'PDF' && (
          <div className="space-y-4">
            <ResponsivePdfViewer
              fileUrl={paper.fileUrl}
              paperTitle={paper.displayTitle}
              allowDownload={paper.allowDownload}
              fallbackStructuredData={paper}
            />

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Official Saurashtra University Examination Archival Record</span>
              <button
                onClick={() => setViewMode('STRUCTURED')}
                className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
              >
                Switch to Structured Syllabus Hierarchy
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: STRUCTURED SYLLABUS HIERARCHY */}
        {/* Previous Paper -> Question -> Subject -> Unit -> Topic -> Year */}
        {viewMode === 'STRUCTURED' && (
          <div className="space-y-8">
            
            {/* Instructions Banner */}
            {paper.instructions && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-1 text-xs">
                <strong className="text-amber-400 uppercase tracking-wider block">Paper Instructions:</strong>
                <p className="text-slate-300 leading-relaxed">{paper.instructions}</p>
              </div>
            )}

            {/* Questions by Sections */}
            <div className="space-y-6">
              {paper.sections?.map((section, sIdx) => (
                <div key={sIdx} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      {section.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-semibold">
                      {section.questions.length} Questions
                    </span>
                  </div>

                  <div className="space-y-4">
                    {section.questions.map((q) => (
                      <div
                        key={q.mappingId}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-3 hover:border-slate-700 transition-colors"
                      >
                        {/* Header: Hierarchy breadcrumbs */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap font-semibold text-slate-400">
                            <span className="font-bold text-amber-400">{q.questionNumber}</span>
                            <span>•</span>
                            <span className="text-slate-300">{q.hierarchy.subjectCode}</span>
                            {q.hierarchy.unitNumber && (
                              <>
                                <span>/</span>
                                <span className="text-slate-300">Unit {q.hierarchy.unitNumber}</span>
                              </>
                            )}
                            {q.hierarchy.topicTitle && (
                              <>
                                <span>/</span>
                                <span className="text-sky-300">{q.hierarchy.topicTitle}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[11px]">
                              {q.marks} Marks
                            </span>
                            {q.isCompulsory && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                                Compulsory
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Question Text */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                            {q.questionText}
                          </h4>
                          {q.questionTextGu && (
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-gujarati">
                              {q.questionTextGu}
                            </p>
                          )}
                        </div>

                        {/* Evidence-Based Rationale */}
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/60 text-xs text-slate-400 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Why this is important:</strong> {q.whyImportant}
                          </span>
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
                          <div className="text-slate-500 text-[11px]">
                            Hierarchy: Paper ({q.hierarchy.examYear}) → {q.hierarchy.subjectCode} → Unit {q.hierarchy.unitNumber || 'Core'} → Topic
                          </div>

                          {q.hierarchy.topicId && (
                            <Link
                              href={`/academic/saurashtra-university/llb/semester-3/subjects/${q.hierarchy.subjectCode.toLowerCase()}/units/${q.hierarchy.unitNumber}/topics/${q.hierarchy.topicId}`}
                              className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              Revise Topic
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
