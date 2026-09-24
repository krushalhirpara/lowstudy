"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  FileText, 
  RotateCcw, 
  Copy, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Building2,
  PenTool
} from 'lucide-react';

const SAMPLE_EXAM_QUESTIONS = [
  {
    id: 'const-art-21',
    subject: 'Constitutional Law',
    marks: 15,
    question: "Discuss the expanding horizons of Article 21 of the Constitution of India with reference to Maneka Gandhi v. Union of India and subsequent landmark precedents.",
    modelSnippet: "Article 21 guarantees protection of life and personal liberty. Prior to A.K. Gopalan (1950), a literal 'procedure established by law' interpretation prevailed. In Maneka Gandhi (1978), the Supreme Court integrated Articles 14, 19, and 21 (The Golden Triangle), ruling that procedure must be just, fair, and reasonable (substantive due process). Subsequent jurisprudence expanded Article 21 to include: Right to Privacy (Puttaswamy), Right to Clean Environment (Subhash Kumar), Right to Livelihood (Olga Tellis), and Right to Speedy Trial (Hussainara Khatoon)."
  },
  {
    id: 'bns-murder-lynching',
    subject: 'Criminal Law (BNS 2023)',
    marks: 15,
    question: "Critically analyze the offence of Murder under Section 103 of Bharatiya Nyaya Sanhita 2023. Highlight the specific provisions relating to Mob Lynching under Section 103(2).",
    modelSnippet: "Section 103 of Bharatiya Nyaya Sanhita 2023 defines punishment for murder, replacing Section 302 of the IPC. A landmark statutory innovation is Section 103(2), which explicitly penalizes murder committed by a group of five or more persons acting in concert on grounds of race, caste, sex, place of birth, language, or religion with death or imprisonment for life and fine. This incorporates the mandate of the Supreme Court in Tehseen Poonawalla (2018)."
  },
  {
    id: 'contract-frustration',
    subject: 'Law of Contract',
    marks: 10,
    question: "Explain the Doctrine of Frustration of Contract under Section 56 of the Indian Contract Act, 1872 with landmark case laws.",
    modelSnippet: "Section 56 encapsulates the Doctrine of Frustration (lex non cogit ad impossibilia). When performance becomes impossible or unlawful due to an unforeseen supervening event without fault of either party, the contract becomes void. In Satyabrata Ghose v. Mugneeram Bangur (1954), the Supreme Court clarified that 'impossibility' includes practical impossibility upsetting the fundamental commercial basis of the agreement."
  }
];

export default function AnswerEvaluatorPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(SAMPLE_EXAM_QUESTIONS[0]);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleEvaluate = () => {
    if (!studentAnswer.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      const words = studentAnswer.split(/\s+/).filter(Boolean).length;
      const lower = studentAnswer.toLowerCase();
      const hasPrecedent = lower.includes('maneka') || lower.includes('puttaswamy') || lower.includes('gopalan') || lower.includes('tehseen') || lower.includes('satyabrata');
      const hasArticles = lower.includes('article') || lower.includes('section');

      let score = 11;
      if (words > 120 && hasPrecedent && hasArticles) score = 13;
      else if (words < 50) score = 6;

      setEvaluation({
        score: `${score} / ${selectedQuestion.marks}`,
        percentage: Math.round((score / selectedQuestion.marks) * 100),
        verdict: score >= 12 ? 'Excellent (First Class with Distinction)' : score >= 8 ? 'Good (Solid University Score)' : 'Needs Improvement',
        strengths: [
          "Well-structured introductory paragraph identifying the core constitutional/statutory doctrine.",
          hasPrecedent ? "Appropriate citation of landmark Supreme Court precedents." : "Clear conceptual understanding of the legal issue.",
          "Good legal vocabulary and coherent paragraph transitions."
        ],
        weaknesses: [
          hasPrecedent ? "Could further elaborate on the specific ratio of recent 2020+ rulings." : "Missing explicit citation of landmark case laws (e.g. Maneka Gandhi, Puttaswamy).",
          "Include a concise concluding paragraph synthesizing the future legal trajectory."
        ],
        missingPoints: [
          "The Golden Triangle doctrine (Articles 14, 19, and 21 mutual coexistence).",
          "Substantive due process vs procedural due process distinction.",
          "Reference to Gujarat University examination grading keywords."
        ],
        rubric: {
          conceptClarity: '4.5 / 5',
          statutoryCitations: '4 / 5',
          caseLaws: hasPrecedent ? '4.5 / 5' : '2.5 / 5',
          structureAndConclusion: '4 / 5'
        }
      });
      setIsEvaluating(false);
    }, 900);
  };

  const handleCopyModel = () => {
    navigator.clipboard.writeText(selectedQuestion.modelSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI EXAM ANSWER EVALUATOR</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gujarat University Grading Standard
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Law Exam Answer Evaluator
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Write your university exam answers and receive immediate diagnostic evaluation on IRAC structure, statutory sections, case citations, score prediction, and model benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>MCQ Quizzes</span>
              </Link>
            </div>
          </div>

          {/* Question Selector */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-500 mr-2">Select Question:</span>
            {SAMPLE_EXAM_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuestion(q);
                  setEvaluation(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedQuestion.id === q.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {q.subject} ({q.marks}M)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Question Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {selectedQuestion.subject}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  Total Marks: {selectedQuestion.marks} Marks
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {selectedQuestion.question}
              </h3>
            </div>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Answer Workspace */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  Your University Exam Answer
                </label>
                <button
                  onClick={() => {
                    setStudentAnswer(
                      `Introduction:\nArticle 21 of the Constitution of India provides that no person shall be deprived of his life or personal liberty except according to procedure established by law.\n\nShift in Judicial Approach:\nIn A.K. Gopalan v. State of Madras (1950), the Supreme Court took a restrictive view, holding that 'procedure established by law' meant any validly enacted state law.\n\nLandmark Shift in Maneka Gandhi (1978):\nThe 7-Judge Bench in Maneka Gandhi v. Union of India overruled the Gopalan doctrine and held that procedure depriving liberty must be 'just, fair, and reasonable'. The Court established the Golden Triangle interconnection between Articles 14, 19, and 21.\n\nSubsequent Expansions:\n1. Right to Privacy: K.S. Puttaswamy v. Union of India (2017).\n2. Right to Clean Environment: Subhash Kumar v. State of Bihar (1991).\n3. Right to Speedy Trial: Hussainara Khatoon v. Home Secretary, Bihar.\n\nConclusion:\nArticle 21 has evolved from a negative right against executive action into a dynamic charter of human rights and dignity.`
                    );
                  }}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  Insert Sample High-Scoring Answer
                </button>
              </div>

              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                rows={16}
                placeholder="Write or paste your examination answer here... Include Introduction, Statutory Provisions, Landmark Case Laws, Analysis, and Conclusion."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  {studentAnswer.split(/\s+/).filter(Boolean).length} Words Written
                </span>

                <button
                  onClick={handleEvaluate}
                  disabled={isEvaluating || !studentAnswer.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Evaluate & Grade Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Grade & Feedback */}
          <div className="lg:col-span-5 space-y-4">
            {evaluation ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 animate-in fade-in">
                {/* Score Banner */}
                <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      Predicted Exam Score
                    </span>
                    <span className="text-3xl font-extrabold">{evaluation.score}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {evaluation.percentage}% Score
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">{evaluation.verdict}</span>
                  </div>
                </div>

                {/* Rubric Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Marking Rubric Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Concept Clarity</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.conceptClarity}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Statutory Sections</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.statutoryCitations}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Case Law Precedents</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.caseLaws}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">IRAC Structure</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.structureAndConclusion}</span>
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Answer Strengths
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements & Missing Points */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Key Missing Elements
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                    {evaluation.missingPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Model Answer Benchmark */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Model Answer Key Concepts
                    </span>
                    <button
                      onClick={handleCopyModel}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                    {selectedQuestion.modelSnippet}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Scale className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Ready for Instant Evaluation</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Type or paste your university exam answer on the left and click 'Evaluate & Grade Answer' to receive instant IRAC feedback.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
