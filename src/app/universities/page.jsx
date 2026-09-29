import React from 'react';
import Link from 'next/link';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES, LAW_PROGRAMS } from '@/data/gujaratData';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationJsonLd } from '@/utils/seo';
import {
  GraduationCap,
  Building2,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Scale,
  Award,
  Search,
  MapPin,
} from 'lucide-react';

export const metadata = {
  title: 'Gujarat Law Universities — Official LL.B. & LL.M. Syllabi, Colleges & Exam Prep | LowStudy',
  description: 'Explore verified Gujarat law universities including Gujarat University, Saurashtra University, VNSGU, MSU, GNLU, HNGU & MKBU. Access official 3-Year LL.B., 5-Year Integrated BA LL.B., and LL.M. syllabi, notes, BNS 2023 revisions, and mock tests.',
  keywords: [
    'Gujarat Law Universities',
    'Gujarat University LLB syllabus',
    'Saurashtra University law courses',
    'VNSGU LLB notes',
    'MSU Baroda law faculty',
    'GNLU Gandhinagar syllabus',
    'Gujarat LLB exams 2026-27',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/universities',
  },
  openGraph: {
    title: 'Gujarat Law Universities & LL.B. Syllabi | LowStudy',
    description: 'Complete official directory of Gujarat law universities, affiliated colleges, degree programs, BNS statutory notes, and exam prep resources.',
    url: 'https://lowstudy.com/universities',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function UniversitiesIndexPage() {
  const orgJsonLd = getOrganizationJsonLd();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <JsonLd data={orgJsonLd} />

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: 'Gujarat Universities', url: '/universities' },
          ]}
        />

        {/* Hero Section */}
        <header className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-slate-800 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Building2 className="w-56 h-56 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>Gujarat Legal Education Registry & Syllabus Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Gujarat Law Universities & Official Degree Syllabi
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore verified public state, autonomous, and national law universities across Gujarat. Access official unit-wise syllabus breakdowns for 3-Year LL.B., 5-Year Integrated B.A. LL.B., and LL.M. programs with BNS 2023 statutory notes and exam question banks.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xl font-extrabold text-emerald-400">{GUJARAT_UNIVERSITIES.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Universities</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xl font-extrabold text-teal-400">{GUJARAT_COLLEGES.length}+</div>
                <div className="text-[11px] text-slate-400 font-medium">Affiliated Colleges</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xl font-extrabold text-amber-400">{LAW_PROGRAMS.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Degree Programs</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xl font-extrabold text-blue-400">100%</div>
                <div className="text-[11px] text-slate-400 font-medium">Syllabus Verified</div>
              </div>
            </div>
          </div>
        </header>

        {/* Universities Grid Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <span>All Recognized Gujarat Law Universities</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your institution to explore semester subjects, statutory notes, bare act mapping, and past examination papers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUJARAT_UNIVERSITIES.map((uni) => {
              const collegesCount = GUJARAT_COLLEGES.filter((c) => c.universityId === uni.id).length;

              return (
                <div
                  key={uni.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all p-6 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header with Logo & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {uni.logo || '🏛️'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                          {uni.status || 'VERIFIED'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-medium">
                          {uni.code}
                        </span>
                      </div>
                    </div>

                    {/* University Name & City */}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{uni.city}, Gujarat • Est. {uni.established}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {uni.type} offering accredited legal curriculums, statutory revisions, and continuous evaluation for law students in {uni.city}.
                    </p>

                    {/* Programs & Colleges Info */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Programs: 3-Yr LLB, 5-Yr, LLM</span>
                      {collegesCount > 0 && (
                        <span className="text-teal-400 font-semibold">{collegesCount} Law Colleges</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/universities/${uni.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      <span>Explore Syllabus & Notes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {uni.officialWebsite && (
                      <a
                        href={uni.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs"
                        title="Official University Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Academic Law Programs Matrix */}
        <section className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span>Standard Law Degree Curriculums Covered</span>
            </h2>
            <p className="text-xs text-slate-400">
              LowStudy tracks official Bar Council of India (BCI) compliant syllabus frameworks across all semesters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">3-Year LL.B. Program</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                6 Semesters for graduate students covering Constitutional Law, Criminal Law (BNS/IPC), Civil Procedure, Law of Evidence, Contracts, and Torts.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Browse LL.B. Subjects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">5-Year Integrated B.A. LL.B.</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                10 Semesters combining undergraduate arts/social science foundations with full core legal disciplines and clinical legal education.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300"
              >
                Browse Integrated Subjects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2-Year LL.M. Master of Laws</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Postgraduate specialized curriculum focusing on Comparative Constitutional Law, Commercial & Corporate Law, Criminal Law, and Judicial Process.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                Browse LL.M. Specializations <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Ask NyayaAI Assistant Banner */}
        <section className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Gujarat Law AI Study Companion
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Need Instant Help with Your University Syllabus?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Ask NyayaAI provides university-specific syllabus navigation, section comparisons (BNS 2023 vs IPC 1860), landmark case law summaries, and exam model answers.
            </p>
          </div>
          <Link
            href="/ai-tutor"
            className="px-6 py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex-shrink-0 text-sm flex items-center gap-2"
          >
            <span>Ask NyayaAI Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
