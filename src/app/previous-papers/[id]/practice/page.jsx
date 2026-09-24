"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Bookmark, 
  HelpCircle, 
  Sparkles, 
  Award, 
  Layers, 
  FileText,
  Clock,
  Languages,
  RotateCcw
} from 'lucide-react';

export default function PaperPracticePage() {
  const params = useParams();
  const { id } = params;

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showGujarati, setShowGujarati] = useState(false);
  const [practicedMap, setPracticedMap] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  useEffect(() => {
    if (id) {
      fetchPaper();
    }
  }, [id]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/previous-papers/${id}`);
      const json = await res.json();
      if (json.success) {
        setPaper(json.data);
      }
    } catch (err) {
      console.error('Error fetching paper practice:', err);
    } finally {
      setLoading(false);
    }
  };

  const questions = paper?.structuredQuestions || [];
  const currentQ = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setShowModelAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowModelAnswer(false);
    }
  };

  const togglePracticed = (qId) => {
    setPracticedMap(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleBookmark = async (qId) => {
    setBookmarkedMap(prev => ({ ...prev, [qId]: !prev[qId] }));
    try {
      await fetch('/api/revision/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'QUESTION', entityId: qId })
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-poppins">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-400">Loading practice session...</div>
        </div>
      </div>
    );
  }

  if (!paper || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center font-poppins">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-white">No Practice Questions Found</h2>
          <p className="text-xs text-slate-400">This examination paper has not yet been populated with practice questions.</p>
          <Link href={`/previous-papers/${id}`} className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl inline-block">
            Back to Paper
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 font-poppins selection:bg-amber-500/20 selection:text-amber-300">
      
      {/* Header */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-14 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/previous-papers/${paper.id}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="text-xs text-slate-400 font-semibold flex items-center gap-2">
                <span>Interactive Question Practice</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">{paper.examSession} {paper.examYear}</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white truncate max-w-sm sm:max-w-md">
                {paper.subject?.title}
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-400">
              Question <strong className="text-amber-400">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <div className="w-32 sm:w-44 h-2 bg-slate-800 rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Active Question Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          
          {/* Card Top: Section, Number, Marks, Breadcrumb */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                {currentQ.questionNumber} • {currentQ.sectionName}
              </span>
              <span className="text-slate-400 font-semibold">
                Unit {currentQ.hierarchy.unitNumber}: {currentQ.hierarchy.topicTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-bold text-xs">
                {currentQ.marks} Marks
              </span>
              {currentQ.questionTextGu && (
                <button
                  onClick={() => setShowGujarati(!showGujarati)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Languages className="w-3.5 h-3.5 text-amber-400" />
                  {showGujarati ? 'English' : 'ગુજરાતી'}
                </button>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Question</span>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {showGujarati && currentQ.questionTextGu ? currentQ.questionTextGu : currentQ.questionText}
            </h2>
          </div>

          {/* Evidence Rationale */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs text-slate-400">
            <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Evidence-Based Context
            </span>
            <p className="text-slate-300 leading-relaxed">
              {currentQ.whyImportant}
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              "Based on available previous papers." Frequency indicates historical coverage, not a future guarantee.
            </div>
          </div>

          {/* Model Exam Answer Toggle & Content */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setShowModelAnswer(!showModelAnswer)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 hover:border-amber-500/40 text-left flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  {showModelAnswer ? 'Hide Model Exam Answer Structure' : 'View Model Exam Answer & Statutory Blueprint'}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-400">
                {showModelAnswer ? 'Collapse' : 'Expand Structure'}
              </span>
            </button>

            {showModelAnswer && (
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5 text-xs sm:text-sm text-slate-300 animate-in fade-in-50 duration-200">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm mb-1 uppercase tracking-wider">
                    Model Exam Answer Blueprint ({currentQ.marks} Marks)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Structured in adherence with university evaluation guidelines.
                  </p>
                </div>

                <div className="space-y-3.5 divide-y divide-slate-800/80">
                  <div className="pt-2">
                    <strong className="text-slate-200 block mb-1">1. Introduction & Statutory Context:</strong>
                    State the legislative origin, primary objective of the Act, and jurisdictional purpose.
                  </div>
                  <div className="pt-3">
                    <strong className="text-slate-200 block mb-1">2. Statutory Definition / Provisions:</strong>
                    Cite the specific bare act section (e.g. Section 2(s), Section 2(q)), verbatim definitions, and statutory explanations.
                  </div>
                  <div className="pt-3">
                    <strong className="text-slate-200 block mb-1">3. Essential Legal Elements:</strong>
                    Break down the statutory ingredients in enumerated bullet points for full mark allocation.
                  </div>
                  <div className="pt-3">
                    <strong className="text-slate-200 block mb-1">4. Landmark Judicial Precedents:</strong>
                    Cite Supreme Court and High Court rulings establishing the ratio decidendi.
                  </div>
                  <div className="pt-3">
                    <strong className="text-slate-200 block mb-1">5. Practical Example & Conclusion:</strong>
                    Illustrate with practical application and summarize concluding legal ratio.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Actions Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePracticed(currentQ.questionId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  practicedMap[currentQ.questionId]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {practicedMap[currentQ.questionId] ? 'Practiced' : 'Mark as Practiced'}
              </button>

              <button
                onClick={() => toggleBookmark(currentQ.questionId)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                  bookmarkedMap[currentQ.questionId]
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Bookmark for Revision"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {currentQ.hierarchy.topicId && (
              <Link
                href={`/academic/saurashtra-university/llb/semester-3/subjects/${currentQ.hierarchy.subjectCode.toLowerCase()}/units/${currentQ.hierarchy.unitNumber}/topics/${currentQ.hierarchy.topicId}`}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                Revise Topic
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

        </div>

        {/* Previous / Next Navigation */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-semibold flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Question
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex + 1 >= questions.length}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs disabled:opacity-40 flex items-center gap-2 shadow-md shadow-amber-500/20"
          >
            Next Question
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
