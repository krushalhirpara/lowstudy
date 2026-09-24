import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  FileText, 
  Award, 
  Sparkles,
  HelpCircle,
  FileCheck2,
  BookmarkCheck,
  Library,
  GraduationCap
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { 
  getSubjectData, 
  generateSubjectSchema, 
  SU_SEM3_SUBJECT_MAP, 
  SITE_URL 
} from '@/lib/services/seoDataService';

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(SU_SEM3_SUBJECT_MAP).map((subjectSlug) => ({
    subject: subjectSlug,
  }));
}

export async function generateMetadata({ params }) {
  const { subject: subjectParam } = await params;
  const subject = await getSubjectData(subjectParam);

  if (!subject) {
    return {
      title: 'Subject Not Found | LowStudy',
    };
  }

  const title = `${subject.title} (Paper ${subject.shortCode}) — Saurashtra University LL.B. Semester 3 Notes`;
  const description = subject.metaDescription || `Complete syllabus, bare acts, study notes, case laws, and exam questions for ${subject.title} (Code: ${subject.shortCode}) at Saurashtra University LL.B. Semester 3.`;
  const canonicalUrl = subject.canonicalUrl;

  return {
    title,
    description,
    keywords: [
      `${subject.title} Saurashtra University`,
      `${subject.shortCode} syllabus notes`,
      `${subject.title} LLB Semester 3`,
      `${subject.title} bare act notes Rajkot`,
      `${subject.title} landmark case laws`,
      `${subject.title} previous year questions`
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

export default async function SaurashtraUniversitySubjectPage({ params }) {
  const { subject: subjectParam } = await params;
  const subject = await getSubjectData(subjectParam);

  if (!subject) {
    notFound();
  }

  const schema = generateSubjectSchema(subject);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
    { name: 'LL.B.', url: '/saurashtra-university/llb/' },
    { name: 'Semester 3', url: '/saurashtra-university/llb/semester-3/' },
    { name: subject.title, url: subject.canonicalUrl },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Subject Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                Paper Code: {subject.shortCode}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                {subject.credits} Credits • Choice Based Credit System
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                Saurashtra University LL.B. Sem 3
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {subject.title}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
              {subject.metaDescription}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Total Units</div>
                <div className="text-white font-bold mt-0.5">{subject.units.length} Prescribed Units</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Total Topics</div>
                <div className="text-white font-bold mt-0.5">
                  {subject.units.reduce((acc, u) => acc + u.topics.length, 0)} Study Modules
                </div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">External Exam</div>
                <div className="text-white font-bold mt-0.5">70 Marks (3 Hours)</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Internal Marks</div>
                <div className="text-white font-bold mt-0.5">30 Continuous Assessment</div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Action Navigation Bar */}
        <section aria-label="Quick Actions" className="mb-10 flex flex-wrap gap-3">
          <Link
            href={`/quiz?subject=${subject.id}`}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice Subject MCQs</span>
          </Link>
          <Link
            href={`/mock-test`}
            className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow flex items-center gap-2"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Attempt Subject Mock Test</span>
          </Link>
          <Link
            href={`/previous-papers`}
            className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Saurashtra University Papers</span>
          </Link>
        </section>

        {/* 4 Prescribed Units Breakdown */}
        <section aria-labelledby="units-breakdown-heading" className="mb-12 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="units-breakdown-heading" className="text-2xl font-bold text-white tracking-tight">
                Syllabus Units & Topics
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Explore each unit and click on any topic to access complete educational notes, statutory sections, and model answers
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {subject.units.map((unit) => {
              const unitUrl = `/saurashtra-university/llb/semester-3/${subject.canonicalSlug}/unit/unit-${unit.unitNumber}/`;
              return (
                <article
                  key={unit.id}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                        Unit {unit.unitNumber}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        <Link href={unitUrl} className="hover:text-indigo-300 transition-colors">
                          {unit.title}
                        </Link>
                      </h3>
                    </div>

                    <Link
                      href={unitUrl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700 flex-shrink-0"
                    >
                      <span>View Unit Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Topics List with Rich Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {unit.topics.map((t, tIdx) => {
                      const topicUrl = `/saurashtra-university/llb/semester-3/${subject.canonicalSlug}/topic/${t.slug}/`;
                      return (
                        <Link
                          key={t.id}
                          href={topicUrl}
                          className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex items-start gap-3 group"
                        >
                          <span className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                            {tIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                              {t.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <BookmarkCheck className="w-3 h-3 text-emerald-400" />
                                Comprehensive Notes
                              </span>
                              <span className="flex items-center gap-1">
                                <Scale className="w-3 h-3 text-amber-400" />
                                Precedents
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0 mt-1" />
                        </Link>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Prescribed References & Textbooks */}
        <section aria-labelledby="references-heading" className="mb-12">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Library className="w-5 h-5 text-indigo-400" />
              <h2 id="references-heading" className="text-xl font-bold text-white">
                Prescribed Statutory Bare Acts & Standard Authorities
              </h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Examinations at Saurashtra University prioritize direct citation of authoritative commentaries and official Bare Acts published by the Government of India.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-300 font-semibold block mb-1">Authoritative Statutory Texts:</span>
                Official Bare Acts with latest parliamentary amendments and Central/Gujarat State notifications.
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-300 font-semibold block mb-1">Standard Textbooks & References:</span>
                Eastern Book Company (EBC), LexisNexis Butterworths, and Universal Law Publishing textbook editions.
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <p>
            Saurashtra University • LL.B. Semester 3 • {subject.title}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/saurashtra-university/llb/semester-3/" className="hover:text-emerald-400 transition-colors">
              Semester 3 Hub
            </Link>
            <Link href="/saurashtra-university/llb/" className="hover:text-emerald-400 transition-colors">
              LL.B. Overview
            </Link>
            <Link href="/question-bank" className="hover:text-emerald-400 transition-colors">
              Question Bank
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
