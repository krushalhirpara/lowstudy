import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Layers, 
  FileText, 
  Award, 
  BookmarkCheck,
  GraduationCap,
  HelpCircle
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { 
  getUnitData, 
  generateUnitSchema, 
  SU_SEM3_SUBJECT_MAP, 
  SITE_URL 
} from '@/lib/services/seoDataService';

export const revalidate = 3600;

export async function generateStaticParams() {
  const params = [];
  for (const subjectSlug of Object.keys(SU_SEM3_SUBJECT_MAP)) {
    for (let u = 1; u <= 4; u++) {
      params.push({
        subject: subjectSlug,
        unit: `unit-${u}`,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const { subject: subjectParam, unit: unitParam } = resolvedParams || {};
  const unit = await getUnitData(subjectParam, unitParam);

  if (!unit) {
    return {
      title: 'Unit Not Found | LowStudy',
    };
  }

  const title = `Unit ${unit.unitNumber}: ${unit.title} — ${unit.subject?.title || 'Subject'} Notes (SU LL.B. Sem 3)`;
  const description = unit.metaDescription || `Study notes, bare act sections, case laws, and exam questions for Unit ${unit.unitNumber}: ${unit.title} in ${unit.subject?.title || 'Subject'} for Saurashtra University LL.B. Semester 3.`;
  const canonicalUrl = unit.canonicalUrl;

  return {
    title,
    description,
    keywords: [
      `Unit ${unit.unitNumber} ${unit.subject?.title || 'Law'}`,
      `${unit.title} notes`,
      `${unit.subject?.title || 'Law'} Saurashtra University`,
      `${unit.subject?.shortCode || 'LLB'} Unit ${unit.unitNumber} syllabus`,
      `${unit.title} case laws LLB`,
      `${unit.title} previous year questions`
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SaurashtraUniversityUnitPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? await params : params;
  const { subject: subjectParam, unit: unitParam } = resolvedParams || {};
  const unit = await getUnitData(subjectParam, unitParam);

  if (!unit) {
    notFound();
  }

  const schema = generateUnitSchema(unit);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
    { name: 'LL.B.', url: '/saurashtra-university/llb/' },
    { name: 'Semester 3', url: '/saurashtra-university/llb/semester-3/' },
    { name: unit.subject.title, url: unit.subject.canonicalUrl },
    { name: `Unit ${unit.unitNumber}`, url: unit.canonicalUrl },
  ];

  // Previous & Next Unit Navigation
  const prevUnitNum = unit.unitNumber > 1 ? unit.unitNumber - 1 : null;
  const nextUnitNum = unit.unitNumber < 4 ? unit.unitNumber + 1 : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Unit Hero Banner */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                Unit {unit.unitNumber} of 4
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {unit.subject.title} ({unit.subject.shortCode})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
              Unit {unit.unitNumber}: {unit.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed mb-6">
              {unit.metaDescription}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Unit Topics</div>
                <div className="text-white font-bold mt-0.5">{unit.topics.length} Study Modules</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">University Exam Weight</div>
                <div className="text-white font-bold mt-0.5">~14-18 Marks (Long & Short)</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Preparation Focus</div>
                <div className="text-white font-bold mt-0.5">Statutory & Judicial Precedents</div>
              </div>
            </div>
          </div>
        </header>

        {/* Topics List Section */}
        <section aria-labelledby="unit-topics-heading" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="unit-topics-heading" className="text-2xl font-bold text-white tracking-tight">
                Topics Prescribed for Unit {unit.unitNumber}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Click on any topic to study verified legal notes, essential ingredients, case laws, and exam Q&A
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {unit.topics.map((topic, index) => {
              const topicUrl = `/saurashtra-university/llb/semester-3/${unit.subject.canonicalSlug}/topic/${topic.slug}/`;
              return (
                <article
                  key={topic.id}
                  className="group rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        <Link href={topicUrl}>
                          {topic.title}
                        </Link>
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                        Comprehensive statutory analysis, key legal ingredients, judicial precedents, and model answers for Saurashtra University exams.
                      </p>
                    </div>
                  </div>

                  <Link
                    href={topicUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex-shrink-0 shadow"
                  >
                    <span>Read Topic Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Unit Exam Strategy & Weightage */}
        <section aria-labelledby="unit-strategy-heading" className="mb-12">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
            <h2 id="unit-strategy-heading" className="text-xl font-bold text-white mb-3">
              Unit {unit.unitNumber} Examination Guidelines & Strategy
            </h2>
            <div className="text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3">
              <p>
                In Saurashtra University LL.B. Semester 3 external examinations (70 Marks), each paper consists of 5 questions corresponding directly to the units of the syllabus. Typically, Question 1 to 4 draw their major 14-mark essay problems directly from Units 1 to 4 respectively.
              </p>
              <p>
                Mastering all topics under Unit {unit.unitNumber} provides strong assurance for scoring full marks on the corresponding 14-mark question, as well as any short conceptual notes (7 marks each) featured in Question 5.
              </p>
            </div>
          </div>
        </section>

        {/* Adjacent Units Navigation */}
        <nav aria-label="Adjacent Units" className="flex flex-wrap items-center justify-between gap-4 mb-12 pt-4 border-t border-slate-800">
          {prevUnitNum ? (
            <Link
              href={`/saurashtra-university/llb/semester-3/${unit.subject.canonicalSlug}/unit/unit-${prevUnitNum}/`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous: Unit {prevUnitNum}</span>
            </Link>
          ) : <div />}

          <Link
            href={unit.subject.canonicalUrl}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
          >
            Back to {unit.subject.title} Overview
          </Link>

          {nextUnitNum ? (
            <Link
              href={`/saurashtra-university/llb/semester-3/${unit.subject.canonicalSlug}/unit/unit-${nextUnitNum}/`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              <span>Next: Unit {nextUnitNum}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : <div />}
        </nav>

        {/* Footer Navigation */}
        <footer className="border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <p>
            Saurashtra University • LL.B. Semester 3 • {unit.subject.title} • Unit {unit.unitNumber}
          </p>
          <div className="flex items-center gap-4">
            <Link href={unit.subject.canonicalUrl} className="hover:text-emerald-400 transition-colors">
              Subject Hub
            </Link>
            <Link href="/saurashtra-university/llb/semester-3/" className="hover:text-emerald-400 transition-colors">
              Semester 3
            </Link>
            <Link href="/quiz" className="hover:text-emerald-400 transition-colors">
              MCQ Practice
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
