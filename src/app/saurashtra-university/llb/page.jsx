import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Layers, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getCourseData, generateCourseSchema, SITE_URL } from '@/lib/services/seoDataService';

export const revalidate = 3600;

export async function generateMetadata() {
  const course = await getCourseData('llb');
  const title = 'Saurashtra University LL.B. 3-Year Degree — Full Syllabus & Semester Guide';
  const description = 'Complete curriculum and syllabus breakdown for Saurashtra University 3-Year Bachelor of Laws (LL.B.). Access Semester 1 to 6 subjects, Semester 3 study notes, exam marks pattern, and mock tests.';
  const canonicalUrl = `${SITE_URL}/saurashtra-university/llb/`;

  return {
    title,
    description,
    keywords: [
      'Saurashtra University LLB syllabus',
      'SU 3-year LLB curriculum',
      'Saurashtra University LLB subjects',
      'LLB Semester 3 Saurashtra University',
      'Rajkot Law College LLB notes',
      'Bar Council of India LLB syllabus Gujarat'
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

export default async function SaurashtraUniversityLlbPage() {
  const course = await getCourseData('llb');
  const schema = generateCourseSchema(course);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
    { name: 'LL.B.', url: '/saurashtra-university/llb/' },
  ];

  const semestersList = [
    {
      sem: 1,
      title: 'Semester 1',
      desc: 'Jurisprudence (Legal Theory), Law of Contract - I, Constitutional Law - I, Law of Torts & Consumer Protection, Family Law - I (Hindu Law).',
      active: false,
    },
    {
      sem: 2,
      title: 'Semester 2',
      desc: 'Special Contracts - II, Constitutional Law - II, Criminal Law - I (BNS / IPC), Law of Crimes, Family Law - II (Muslim Law & Special Marriages).',
      active: false,
    },
    {
      sem: 3,
      title: 'Semester 3',
      desc: 'Labour & Industrial Law - I, Labour & Industrial Law - II, Principles of Taxation Laws, Principal of Banking Laws, Information Technology Laws and Cyber Crimes.',
      active: true,
    },
    {
      sem: 4,
      title: 'Semester 4',
      desc: 'Company Law, Environmental Law, Property Law & Easements, Administrative Law, Professional Ethics & Bar-Bench Relations.',
      active: false,
    },
    {
      sem: 5,
      title: 'Semester 5',
      desc: 'Civil Procedure Code (CPC) & Limitation, Criminal Procedure Code (BNSS / CrPC), Law of Evidence (BSA / IEA), Public International Law & Human Rights.',
      active: false,
    },
    {
      sem: 6,
      title: 'Semester 6',
      desc: 'Interpretation of Statutes, Drafting, Pleading and Conveyance, Moot Court Exercise & Internship, Alternate Dispute Resolution (ADR).',
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Course Header Banner */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-4 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              Bar Council of India Recognized • Choice Based Credit System
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Saurashtra University LL.B. (3-Year Degree Program)
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
              Complete curriculum, syllabus outlines, and examination guides for the 3-Year Bachelor of Laws (LL.B.) program at Saurashtra University, Rajkot. Designed in strict conformity with BCI Legal Education Rules to prepare graduates for advocacy, corporate counsel, and judicial services.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Degree Duration</div>
                <div className="text-white font-bold mt-0.5">3 Years (6 Semesters)</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Total Papers</div>
                <div className="text-white font-bold mt-0.5">30 Core Law Papers</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Exam System</div>
                <div className="text-white font-bold mt-0.5">70 Ext. + 30 Int. Marks</div>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Eligibility</div>
                <div className="text-white font-bold mt-0.5">Graduation (Any Stream)</div>
              </div>
            </div>
          </div>
        </header>

        {/* Semester 3 Active Banner */}
        <section aria-labelledby="featured-sem3-heading" className="mb-12">
          <div className="rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/40 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs mb-2">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Complete Semester 3 Study Suite Available
              </div>
              <h2 id="featured-sem3-heading" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Explore LL.B. Semester 3 Syllabus & Study Notes
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Access verified notes, bare act analysis, case law citations, model 14-mark answers, 7-mark short notes, and practice MCQs for all 5 core Semester 3 subjects.
              </p>
            </div>
            <Link
              href="/saurashtra-university/llb/semester-3/"
              className="px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg flex-shrink-0 flex items-center gap-2 hover:translate-x-0.5"
            >
              <span>Go to Semester 3 Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* 6 Semesters Overview */}
        <section aria-labelledby="semesters-overview-heading" className="mb-12">
          <h2 id="semesters-overview-heading" className="text-2xl font-bold text-white tracking-tight mb-2">
            LL.B. Semester-Wise Course Breakdown
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Detailed overview of all six semesters prescribed under Saurashtra University CBCS guidelines
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {semestersList.map((item) => (
              <div
                key={item.sem}
                className={`rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  item.active
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-950/20 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                      Semester {item.sem}
                    </span>
                    {item.active && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Full Notes Ready
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    {item.desc}
                  </p>
                </div>

                {item.active ? (
                  <Link
                    href="/saurashtra-university/llb/semester-3/"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
                  >
                    <span>View Semester 3 Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <div className="w-full py-2.5 rounded-lg bg-slate-800/60 text-slate-500 text-xs font-medium text-center border border-slate-800">
                    Syllabus Outline Available
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Examination Pattern & Evaluation Criteria */}
        <section aria-labelledby="exam-pattern-heading" className="mb-12">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8">
            <h2 id="exam-pattern-heading" className="text-2xl font-bold text-white mb-4">
              Saurashtra University LL.B. Examination Pattern
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
              <div className="border-l-2 border-indigo-500 pl-4">
                <h3 className="text-white font-semibold text-base mb-1">External University Exam</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  70 marks per theory paper. 3 hours duration. Pattern consists of 5 compulsory questions with internal choices, comprising 14-mark long analytical essays and 7-mark short conceptual notes.
                </p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4">
                <h3 className="text-white font-semibold text-base mb-1">Continuous Internal Assessment</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  30 marks conducted by affiliated law colleges based on internal mid-term examinations, seminar presentation, legal research project, and attendance discipline.
                </p>
              </div>
              <div className="border-l-2 border-amber-500 pl-4">
                <h3 className="text-white font-semibold text-base mb-1">Passing Standards</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Students must secure minimum 40% marks in external theory (28 out of 70) and 40% in internal evaluation (12 out of 30), with an aggregate of 50% for degree award with Second Class.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <footer className="border-t border-slate-800/80 pt-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
          <p>
            Saurashtra University Faculty of Law • LL.B. 3-Year Curriculum Directory
          </p>
          <div className="flex items-center gap-4">
            <Link href="/saurashtra-university/" className="hover:text-emerald-400 transition-colors">
              University Overview
            </Link>
            <Link href="/saurashtra-university/llb/semester-3/" className="hover:text-emerald-400 transition-colors">
              Semester 3 Hub
            </Link>
            <Link href="/previous-papers" className="hover:text-emerald-400 transition-colors">
              Previous Papers
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
