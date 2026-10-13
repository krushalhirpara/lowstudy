import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Building2, 
  BookOpen, 
  MapPin, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  FileText, 
  Award,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '@/data/gujaratData';
import { getOrganizationJsonLd, getFaqJsonLd } from '@/utils/seo';

export const revalidate = 3600;

export const metadata = {
  title: 'Gujarat Law Universities — Official LL.B., B.A. LL.B. & LL.M. Syllabi & Notes | LowStudy',
  description: 'Verified directory of Bar Council of India-recognized law universities across Gujarat. Access official LL.B. syllabi, semester notes, BNS 2023 criminal law updates, and affiliated college registries for Gujarat University, Saurashtra University, VNSGU, MSU, GNLU, and more.',
  keywords: [
    'Gujarat Law Universities',
    'Law universities in Gujarat',
    'Gujarat University LLB syllabus',
    'Saurashtra University law courses',
    'VNSGU Surat LLB notes',
    'MSU Baroda Faculty of Law',
    'GNLU Gandhinagar',
    'Gujarat LLB admission syllabus',
    'Gujarat law colleges affiliation',
    'BNS 2023 syllabus Gujarat',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/gujarat-law-universities',
  },
  openGraph: {
    title: 'Gujarat Law Universities & LL.B. Syllabi Directory | LowStudy',
    description: 'Explore officially recognized Gujarat law universities, degree programs, semester breakdowns, BNS 2023 statutory notes, and exam prep resources.',
    url: 'https://lowstudy.com/gujarat-law-universities',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat Law Universities — Official Syllabi & Notes | LowStudy',
    description: 'Official directory of Gujarat law universities, degree programs, affiliated colleges, and semester exam preparation resources.',
  },
};

const FAQS = [
  {
    question: 'Which universities in Gujarat offer Bar Council of India (BCI) approved LL.B. programs?',
    answer: 'Major BCI-recognized state public universities in Gujarat include Gujarat University (Ahmedabad), Saurashtra University (Rajkot), Veer Narmad South Gujarat University (Surat), Maharaja Sayajirao University of Baroda (Vadodara), Hemchandracharya North Gujarat University (Patan), and Maharaja Krishnakumarsinhji Bhavnagar University (Bhavnagar). Gujarat National Law University (GNLU) is the premier National Law University in Gandhinagar.',
  },
  {
    question: 'How do 3-Year LL.B. and 5-Year Integrated law courses differ across Gujarat universities?',
    answer: 'The 3-Year LL.B. program is open to graduates of any recognized bachelor discipline (Arts, Commerce, Science) and spans 6 semesters. The 5-Year Integrated B.A. LL.B. or B.Com. LL.B. is open to students immediately after Class 12 and spans 10 semesters, combining undergraduate general subjects with professional law modules.',
  },
  {
    question: 'Are the new criminal laws (BNS, BNSS, BSA 2023) integrated into Gujarat law syllabi?',
    answer: 'Yes. Following university academic council notifications across Gujarat, the criminal law curriculum has transitioned to Bharatiya Nyaya Sanhita (BNS 2023), Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), and Bharatiya Sakshya Adhiniyam (BSA 2023) alongside historical comparisons to the IPC, CrPC, and Indian Evidence Act.',
  },
  {
    question: 'How can students access official university syllabi and study notes on LowStudy?',
    answer: 'LowStudy organizes legal curricula by university, degree program, academic year, semester, and unit. Students can select their university from this registry to browse verified course structures, unit notes, landmark case laws, and exam preparation materials.',
  },
];

export default function GujaratLawUniversitiesPage() {
  const orgJsonLd = getOrganizationJsonLd();
  const faqJsonLd = getFaqJsonLd(FAQS);

  // Schema.org ItemList of universities
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Gujarat Law Universities Directory',
    description: 'List of verified law universities offering LL.B. and LL.M. degree programs in Gujarat, India.',
    numberOfItems: GUJARAT_UNIVERSITIES.length,
    itemListElement: GUJARAT_UNIVERSITIES.map((uni, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CollegeOrUniversity',
        name: uni.name,
        alternateName: uni.code,
        url: uni.id === 'su' ? 'https://lowstudy.com/saurashtra-university' : `https://lowstudy.com/universities/${uni.id}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: uni.city,
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={orgJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={itemListJsonLd} />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: 'Gujarat Law Universities', url: '/gujarat-law-universities' },
          ]}
        />

        {/* Hero Header */}
        <header className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl space-y-5 overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <GraduationCap className="w-56 h-56 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Gujarat State Legal Education Registry</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Gujarat Law Universities Directory & LL.B. Syllabi
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore officially recognized universities offering 3-Year LL.B., 5-Year Integrated B.A. LL.B., and LL.M. degree programs across Gujarat. Select an institution to review academic structures, semester syllabi, Bharatiya Nyaya Sanhita (BNS 2023) curriculum updates, and examination notes.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 9 Verified Gujarat Universities
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bar Council of India Aligned
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Academic Year 2026-27
              </span>
            </div>
          </div>
        </header>

        {/* Quick Nav Pills */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Related Directories:</span>
          <Link
            href="/gujarat-law-colleges"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium transition"
          >
            Affiliated Colleges Registry ({GUJARAT_COLLEGES.length})
          </Link>
          <Link
            href="/bns-vs-ipc"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium transition"
          >
            BNS vs IPC Comparative Hub
          </Link>
          <Link
            href="/subjects"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            All LL.B. Subjects & Notes
          </Link>
          <Link
            href="/previous-papers"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
          >
            Previous Year Papers
          </Link>
        </div>

        {/* University Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
                <span>Accredited Universities in Gujarat</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verified public, autonomous, national, and state private law universities with syllabus portals.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
              {GUJARAT_UNIVERSITIES.length} Institutions Registered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUJARAT_UNIVERSITIES.map((uni) => {
              const colleges = GUJARAT_COLLEGES.filter((c) => c.universityId === uni.id);
              const destinationUrl = uni.id === 'su' 
                ? '/saurashtra-university' 
                : `/universities/${uni.id}`;

              return (
                <div
                  key={uni.id}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{uni.logo || '🏛️'}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                          {uni.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                          Est. {uni.established}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white leading-snug">
                        {uni.name}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{uni.city}, {uni.district || 'Gujarat'}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Institution Type:</span>
                        <span className="font-medium text-slate-200">{uni.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Affiliated Law Colleges:</span>
                        <span className="font-bold text-emerald-400">{colleges.length > 0 ? `${colleges.length} Verified` : 'Direct Department'}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Syllabus Status:</span>
                        <span className="text-teal-400 font-medium">BNS 2023 Updated</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    {uni.officialWebsite && (
                      <a
                        href={uni.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-mono transition"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <Link
                      href={destinationUrl}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold text-xs border border-emerald-500/30 transition-all ml-auto"
                    >
                      <span>Explore Syllabus & Notes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Academic Framework & BCI Standards Section */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-400" />
              <span>Gujarat Legal Education Architecture & Curriculum Framework</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Legal education in Gujarat is governed under the statutory guidelines of the Bar Council of India (BCI) and affiliated state university examination bodies. Each academic program adheres to structured semester outlines:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">3-Year LL.B. Degree</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                6 Semesters focused exclusively on core statutory laws including Constitutional Law, Law of Crimes (BNS 2023), Law of Contracts, Law of Torts, Family Law, Property Law, CPC, and Administrative Law.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline pt-1"
              >
                Browse Semester Subjects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-teal-500/10 text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">5-Year Integrated B.A. LL.B.</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                10 Semesters integrating social sciences (Political Science, Sociology, Economics) with foundational jurisprudence and specialized procedural enactments.
              </p>
              <Link
                href="/bns-vs-ipc"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:underline pt-1"
              >
                Explore Statutory Modules <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">2-Year LL.M. Postgraduate</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                4 Semesters with specialization branches in Criminal Law & Criminology, Constitutional Law, Commercial & Corporate Law, and Intellectual Property Rights.
              </p>
              <Link
                href="/academic"
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:underline pt-1"
              >
                Academic Programs Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
              <span>Frequently Asked Questions — Gujarat Law Universities</span>
            </h2>
            <p className="text-xs text-slate-400">
              Common questions answered for prospective and enrolled law students in Gujarat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
              >
                <h3 className="font-semibold text-sm text-white flex items-start gap-2">
                  <span className="text-emerald-400 font-mono font-bold">Q{idx + 1}.</span>
                  <span>{faq.question}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Preparing for Gujarat University or Saurashtra University Law Exams?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Access verified semester notes, bare act analysis, model answers, and unit-wise mock quizzes on LowStudy.
            </p>
          </div>
          <Link
            href="/exam-prep"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all whitespace-nowrap inline-flex items-center gap-2"
          >
            <span>Explore Exam Prep</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
