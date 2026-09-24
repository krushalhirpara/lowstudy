import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  Scale, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileText, 
  Award, 
  Sparkles,
  HelpCircle,
  Clock,
  BookmarkCheck,
  ShieldCheck,
  Brain,
  Lightbulb,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { 
  getTopicData, 
  generateTopicSchema, 
  SU_SEM3_SUBJECT_MAP,
  slugify,
  SITE_URL 
} from '@/lib/services/seoDataService';

export const revalidate = 3600;

export async function generateStaticParams() {
  const params = [];
  for (const subjectSlug of Object.keys(SU_SEM3_SUBJECT_MAP)) {
    for (let u = 1; u <= 4; u++) {
      params.push({
        subject: subjectSlug,
        topic: slugify(`Fundamental Concepts & Scope of Unit ${u}`),
      });
      params.push({
        subject: subjectSlug,
        topic: slugify(`Statutory Provisions & Judicial Precedents of Unit ${u}`),
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const { subject: subjectParam, topic: topicParam } = resolvedParams || {};
  const topic = await getTopicData(subjectParam, topicParam);

  if (!topic) {
    return {
      title: 'Topic Not Found | LowStudy',
    };
  }

  const title = `${topic.title} — Notes, Sections & Case Laws | SU LL.B. Sem 3`;
  const description = topic.metaDescription || `Comprehensive study notes, bare act sections, landmark cases, and model exam answers for ${topic.title} under ${topic.subject?.title || 'LL.B. Semester 3'} at Saurashtra University LL.B.`;
  const canonicalUrl = topic.canonicalUrl;

  return {
    title,
    description,
    keywords: [
      `${topic.title} notes`,
      `${topic.title} Saurashtra University`,
      `${topic.title} LLB semester 3`,
      `${topic.subject?.title || 'Law'} notes`,
      `${topic.title} case laws`,
      `${topic.title} essential elements`,
      `${topic.title} exam questions`
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'LowStudy',
      locale: 'en_IN',
      type: 'article',
      authors: ['LowStudy Legal Research Board'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SaurashtraUniversityTopicPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const { subject: subjectParam, topic: topicParam } = resolvedParams || {};
  const topic = await getTopicData(subjectParam, topicParam);

  if (!topic) {
    notFound();
  }

  const schemas = generateTopicSchema(topic);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
    { name: 'LL.B.', url: '/saurashtra-university/llb/' },
    { name: 'Semester 3', url: '/saurashtra-university/llb/semester-3/' },
    { name: topic.subject.title, url: topic.subject.canonicalUrl },
    { name: `Unit ${topic.parentUnit.unitNumber}`, url: `/saurashtra-university/llb/semester-3/${topic.subject.canonicalSlug}/unit/unit-${topic.parentUnit.unitNumber}/` },
    { name: topic.title, url: topic.canonicalUrl },
  ];

  const primaryAnswer = topic.enrichedQuestions?.[0]?.answer;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {schemas.map((schema, sIdx) => (
        <JsonLd key={sIdx} data={schema} />
      ))}

      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Article Header & Main H1 */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                {topic.subject.title} • Unit {topic.parentUnit.unitNumber}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                Saurashtra University LL.B.
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                Code: {topic.subject.shortCode}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              {topic.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
              {topic.metaDescription}
            </p>

            {/* Educational Meta Bar */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Educational Content
                </span>
                <span>•</span>
                <span>Bar Council of India Syllabus</span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/quiz?topicId=${topic.id}`}
                  className="px-3 py-1 rounded-md bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Practice MCQs</span>
                </Link>
                <Link
                  href="/practice-writing"
                  className="px-3 py-1 rounded-md bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Answer Writing</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* SECTION 1: EXECUTIVE SUMMARY & SIMPLE CONCEPT */}
        {topic.primaryNote?.simpleNotes && (
          <section aria-labelledby="overview-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h2 id="overview-heading" className="text-xl font-bold text-white">
                  Concept in Plain English (Executive Overview)
                </h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {topic.primaryNote.simpleNotes}
              </p>
            </div>
          </section>
        )}

        {/* SECTION 2: STATUTORY PROVISIONS & ESSENTIAL INGREDIENTS */}
        <section aria-labelledby="statutory-heading" className="mb-8">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 id="statutory-heading" className="text-xl font-bold text-white">
                Statutory Framework & Essential Ingredients
              </h2>
            </div>

            {primaryAnswer?.definition && (
              <div className="mb-6 p-4 rounded-lg bg-slate-950/70 border-l-4 border-indigo-500 text-sm text-slate-300">
                <h3 className="font-semibold text-white mb-1 text-xs uppercase tracking-wider text-indigo-300">
                  Statutory Definition:
                </h3>
                <p className="leading-relaxed">{primaryAnswer.definition}</p>
              </div>
            )}

            {primaryAnswer?.legalProvision && (
              <div className="mb-6 p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-sm text-slate-300">
                <h3 className="font-semibold text-white mb-1 text-xs uppercase tracking-wider text-emerald-400">
                  Relevant Enactments & Bare Act Provisions:
                </h3>
                <p className="leading-relaxed">{primaryAnswer.legalProvision}</p>
              </div>
            )}

            {primaryAnswer?.essentialElements && (
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-sm text-slate-300">
                <h3 className="font-semibold text-white mb-2 text-xs uppercase tracking-wider text-amber-400">
                  Essential Elements Checklist:
                </h3>
                <div className="leading-relaxed whitespace-pre-line">
                  {primaryAnswer.essentialElements}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: IN-DEPTH LEGAL ANALYSIS */}
        <section aria-labelledby="detailed-analysis-heading" className="mb-8">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 id="detailed-analysis-heading" className="text-xl font-bold text-white">
                In-Depth Legal & Curricular Analysis
              </h2>
            </div>
            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
              {primaryAnswer?.detailedExplanation ? (
                <div className="whitespace-pre-line">
                  {primaryAnswer.detailedExplanation}
                </div>
              ) : topic.primaryNote?.detailedNotes ? (
                <div className="whitespace-pre-line">
                  {topic.primaryNote.detailedNotes}
                </div>
              ) : (
                <p>
                  Comprehensive legal principles governing {topic.title} under {topic.subject.title} for Saurashtra University examinations.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: LANDMARK PRECEDENTS & CASE LAWS */}
        {primaryAnswer?.caseLaw && (
          <section aria-labelledby="case-law-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-400" />
                <h2 id="case-law-heading" className="text-xl font-bold text-white">
                  Landmark Judicial Precedents & Leading Judgments
                </h2>
              </div>
              <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-500/30 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {primaryAnswer.caseLaw}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 5: PRACTICAL ILLUSTRATION / FACT SCENARIO */}
        {primaryAnswer?.example && (
          <section aria-labelledby="practical-example-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 id="practical-example-heading" className="text-xl font-bold text-white">
                  Practical Illustration & Problem-Solving Application
                </h2>
              </div>
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {primaryAnswer.example}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: FAST REVISION KEY POINTS & MNEMONICS */}
        {topic.keyPoints && topic.keyPoints.length > 0 && (
          <section aria-labelledby="key-points-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                <h2 id="key-points-heading" className="text-xl font-bold text-white">
                  Key Points to Remember (Exam Revision Notes)
                </h2>
              </div>
              <ul className="space-y-2.5 text-sm text-slate-300">
                {topic.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {topic.mnemonics && topic.mnemonics.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    Memory Aids & Mnemonics:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {topic.mnemonics.map((mnem, mIdx) => (
                      <span key={mIdx} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                        {mnem}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SECTION 7: MODEL PRACTICE QUESTIONS & ANSWERS */}
        {topic.enrichedQuestions && topic.enrichedQuestions.length > 0 && (
          <section aria-labelledby="practice-questions-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <h2 id="practice-questions-heading" className="text-xl font-bold text-white">
                  Saurashtra University Model Examination Questions
                </h2>
              </div>
              <p className="text-slate-400 text-xs mb-6">
                Standard university examination question formulation based on syllabus distribution
              </p>

              <div className="space-y-6">
                {topic.enrichedQuestions.map((q, qIdx) => (
                  <div key={q.id || qIdx} className="p-5 rounded-lg bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
                        {q.marks} Marks ({q.isLongEssay ? 'Long Analytical Essay' : 'Short Note'})
                      </span>
                      {q.difficulty && (
                        <span className="text-xs text-slate-400 font-mono">
                          Difficulty: {q.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-3">
                      Q{qIdx + 1}: {q.questionText}
                    </h3>

                    {q.answer && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 space-y-2">
                        <div className="font-semibold text-emerald-400 text-xs uppercase tracking-wider">
                          Model Answer Structure:
                        </div>
                        {q.answer.introduction && (
                          <p><strong className="text-slate-200">Introduction:</strong> {q.answer.introduction}</p>
                        )}
                        {q.answer.detailedExplanation && (
                          <p className="line-clamp-4 text-slate-400">
                            <strong className="text-slate-200">Substantive Discussion:</strong> {q.answer.detailedExplanation}
                          </p>
                        )}
                        {q.answer.conclusion && (
                          <p><strong className="text-slate-200">Conclusion:</strong> {q.answer.conclusion}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 8: VERIFIED MCQs */}
        {topic.mcqs && topic.mcqs.length > 0 && (
          <section aria-labelledby="mcq-heading" className="mb-8">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <h2 id="mcq-heading" className="text-xl font-bold text-white">
                    Self-Assessment Multiple Choice Questions (MCQs)
                  </h2>
                </div>
                <Link
                  href={`/quiz?topicId=${topic.id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Interactive Quiz Mode &rarr;
                </Link>
              </div>

              <div className="space-y-4">
                {topic.mcqs.slice(0, 3).map((mcq, mIdx) => (
                  <div key={mcq.id || mIdx} className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs sm:text-sm">
                    <div className="font-semibold text-white mb-2">
                      {mIdx + 1}. {mcq.question}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-slate-300">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">A) {mcq.optionA}</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">B) {mcq.optionB}</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">C) {mcq.optionC}</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">D) {mcq.optionD}</div>
                    </div>
                    <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                      <strong>Correct Answer: Option {mcq.correctAnswer}</strong> — {mcq.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TOPIC NAVIGATION (PREVIOUS / NEXT TOPIC) */}
        <nav aria-label="Topic Navigation" className="flex flex-wrap items-center justify-between gap-4 mb-12 pt-6 border-t border-slate-800">
          {topic.prevTopic ? (
            <Link
              href={`/saurashtra-university/llb/semester-3/${topic.subject.canonicalSlug}/topic/${topic.prevTopic.slug}/`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors max-w-[280px]"
            >
              <ArrowLeft className="w-4 h-4 flex-shrink-0" />
              <div className="truncate text-left">
                <span className="text-slate-400 block text-[10px]">Previous Topic</span>
                <span className="truncate block">{topic.prevTopic.title}</span>
              </div>
            </Link>
          ) : <div />}

          <Link
            href={`/saurashtra-university/llb/semester-3/${topic.subject.canonicalSlug}/unit/unit-${topic.parentUnit.unitNumber}/`}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Unit {topic.parentUnit.unitNumber} Index
          </Link>

          {topic.nextTopic ? (
            <Link
              href={`/saurashtra-university/llb/semester-3/${topic.subject.canonicalSlug}/topic/${topic.nextTopic.slug}/`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors max-w-[280px]"
            >
              <div className="truncate text-right">
                <span className="text-slate-400 block text-[10px]">Next Topic</span>
                <span className="truncate block">{topic.nextTopic.title}</span>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </nav>

        {/* Footer Navigation */}
        <footer className="border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <p>
            Saurashtra University • LL.B. Semester 3 • {topic.subject.title} • {topic.title}
          </p>
          <div className="flex items-center gap-4">
            <Link href={topic.subject.canonicalUrl} className="hover:text-emerald-400 transition-colors">
              Subject Overview
            </Link>
            <Link href="/saurashtra-university/llb/semester-3/" className="hover:text-emerald-400 transition-colors">
              Semester 3
            </Link>
            <Link href="/exam-mode" className="hover:text-emerald-400 transition-colors">
              Exam Mode
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
