import React from 'react';
import Link from 'next/link';
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
  Clock,
  Flame,
  FileCheck2,
  Brain
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getSemesterData, generateSemesterSchema, SITE_URL } from '@/lib/services/seoDataService';

export const revalidate = 3600;

export async function generateMetadata() {
  const sem = await getSemesterData(3);
  const title = 'Saurashtra University LL.B. Semester 3 — Complete Syllabus, Notes & Subjects';
  const description = 'Official Saurashtra University LL.B. Semester 3 curriculum hub. Study Labour Law I & II, Taxation Laws, Banking Laws, and Cyber Crimes. Complete bare act notes, model answers & MCQs.';
  const canonicalUrl = `${SITE_URL}/saurashtra-university/llb/semester-3/`;

  return {
    title,
    description,
    keywords: [
      'Saurashtra University LLB Semester 3',
      'Labour and Industrial Law 1 Saurashtra University',
      'Labour Law 2 SU notes',
      'Principles of Taxation Laws LLB sem 3',
      'Principal of Banking Laws Saurashtra University',
      'Information Technology Laws and Cyber Crimes LLB notes',
      'SU LLB 3rd semester syllabus Rajkot'
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
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SaurashtraUniversitySemester3Page() {
  const sem = await getSemesterData(3);
  const schema = generateSemesterSchema(sem);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
    { name: 'LL.B.', url: '/saurashtra-university/llb/' },
    { name: 'Semester 3', url: '/saurashtra-university/llb/semester-3/' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Section */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/70 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold mb-4 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              Saurashtra University • LL.B. (3-Year Program)
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              LL.B. Semester 3 Curriculum & Study Portal
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
              Complete, verified legal education portal for Saurashtra University LL.B. Semester 3. Comprehensive bare act provisions, conceptual notes, landmark judicial precedents, model 14-mark and 7-mark answers, and verified MCQs across all 5 prescribed subjects.
            </p>

            {/* Semester 3 Metric Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Total Subjects</div>
                <div className="text-white font-bold mt-0.5">5 Core Papers</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Total Units</div>
                <div className="text-white font-bold mt-0.5">20 Prescribed Units</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Academic Credits</div>
                <div className="text-white font-bold mt-0.5">20 Credits (4 / paper)</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Exam Weightage</div>
                <div className="text-white font-bold mt-0.5">500 Total Marks</div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Exam Preparation Tools Hub */}
        <section aria-labelledby="prep-tools-heading" className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/exam-mode"
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-start gap-3 group"
            >
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Focused Exam Mode
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  High-yield countdown revision & weak topic prioritization
                </p>
              </div>
            </Link>

            <Link
              href="/study-plan"
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-start gap-3 group"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Adaptive AI Study Plan
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Personalized 3, 7, and 15-day learning schedules
                </p>
              </div>
            </Link>

            <Link
              href="/question-bank"
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all flex items-start gap-3 group"
            >
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Question Bank & Answers
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Complete 9-part model answers with legal precedents
                </p>
              </div>
            </Link>

            <Link
              href="/previous-papers"
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-all flex items-start gap-3 group"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  Previous Year Papers
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  2021–2024 university papers with PDF viewers
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* 5 Prescribed Semester 3 Subjects */}
        <section aria-labelledby="subjects-heading" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="subjects-heading" className="text-2xl font-bold text-white tracking-tight">
                Semester 3 Core Subjects
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Select a subject to view detailed unit breakdown, statutory provisions, and verified study notes
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {sem.subjects.map((sub, index) => {
              const subjectUrl = `/saurashtra-university/llb/semester-3/${sub.canonicalSlug}/`;
              return (
                <article
                  key={sub.id}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold text-sm border border-indigo-500/20 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400">Paper Code: {sub.shortCode}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-indigo-400 font-medium">{sub.credits} Credits</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-0.5">
                          <Link href={subjectUrl} className="hover:text-indigo-400 transition-colors">
                            {sub.title}
                          </Link>
                        </h3>
                      </div>
                    </div>

                    <Link
                      href={subjectUrl}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex-shrink-0 shadow"
                    >
                      <span>Explore Subject</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Units Mini-Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {sub.units.map((unit) => (
                      <Link
                        key={unit.id}
                        href={`/saurashtra-university/llb/semester-3/${sub.canonicalSlug}/unit/unit-${unit.unitNumber}/`}
                        className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="text-slate-400 font-mono text-[11px] mb-1">
                            Unit {unit.unitNumber}
                          </div>
                          <div className="font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {unit.title}
                          </div>
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{unit.topics.length} Topics</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Semester 3 Academic Advisory & Syllabus Weightage */}
        <section aria-labelledby="syllabus-weightage-heading" className="mb-12">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
            <h2 id="syllabus-weightage-heading" className="text-2xl font-bold text-white mb-4">
              Saurashtra University Semester 3 Curricular Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Statutory Focus & Bare Act Competence
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Semester 3 transitions law students into heavy statutory interpretation and procedural compliance. The five papers test the direct application of major parliamentary enactments including The Industrial Disputes Act 1947, Income Tax Act 1961, Banking Regulation Act 1949, and Information Technology Act 2000.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Examiners at Saurashtra University look for accurate section numbers, sub-section clauses, and the ratio decidendi of landmark Supreme Court and Gujarat High Court rulings.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Answer Structuring Recommendations
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  For 14-mark long questions, adopt the verified 9-part answer framework: Introduction, Statutory Provision, Key Definitions, Essential Ingredients, Comprehensive Legal Discussion, Landmark Precedents, Factual Illustration, Practical Exceptions, and Logical Conclusion.
                </p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Allocate approximately 28–30 minutes per 14-mark question and 12–15 minutes for 7-mark short notes to complete the 70-mark university question paper within the 3-hour limit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <p>
            Saurashtra University • LL.B. 3-Year Degree • Semester 3 Comprehensive Study Hub
          </p>
          <div className="flex items-center gap-4">
            <Link href="/saurashtra-university/llb/" className="hover:text-emerald-400 transition-colors">
              LL.B. Overview
            </Link>
            <Link href="/mock-test" className="hover:text-emerald-400 transition-colors">
              Mock Tests
            </Link>
            <Link href="/revision" className="hover:text-emerald-400 transition-colors">
              Revision Book
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
