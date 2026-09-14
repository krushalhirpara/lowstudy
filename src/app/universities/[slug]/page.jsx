import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '@/data/gujaratData';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';
import { SUBJECTS_DATA } from '@/data/legalData';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getCourseJsonLd, getFaqJsonLd } from '@/utils/seo';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Scale,
  Award,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';

/**
 * Dynamic Metadata Generator for University SEO Page
 */
export async function generateMetadata({ params }) {
  const uni = GUJARAT_UNIVERSITIES.find((u) => u.id === params.slug);
  if (!uni) return { title: 'University Not Found' };

  const title = `${uni.name} Law Courses, Syllabus, Notes & Exam Prep | LowStudy`;
  const description = `Complete official syllabus, LL.B. notes, semester study guides, MCQs, case laws, and exam preparation resources for ${uni.name} (${uni.code}), ${uni.city}, Gujarat.`;

  return {
    title,
    description,
    keywords: [
      `${uni.name} law syllabus`,
      `${uni.name} LLB notes`,
      `${uni.code} law exam prep`,
      `${uni.city} law colleges`,
      `${uni.name} semester syllabus`,
    ],
    alternates: {
      canonical: `https://lowstudy.com/universities/${uni.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/universities/${uni.id}`,
      siteName: 'LowStudy',
      locale: 'en_IN',
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return GUJARAT_UNIVERSITIES.map((uni) => ({
    slug: uni.id,
  }));
}

export default function UniversitySeoPage({ params }) {
  const uni = GUJARAT_UNIVERSITIES.find((u) => u.id === params.slug);
  if (!uni) notFound();

  // Find affiliated colleges
  const affiliatedColleges = GUJARAT_COLLEGES.filter((c) => c.universityId === uni.id);

  // University subjects preview
  const uniSubjects = ALL_SYLLABUS_SUBJECTS.filter((s) => s.universityId === uni.id).slice(0, 6);
  const featuredSubjects = uniSubjects.length > 0 ? uniSubjects : ALL_SYLLABUS_SUBJECTS.slice(0, 6);

  const faqs = [
    {
      question: `What law programs are offered under ${uni.name}?`,
      answer: `${uni.name} offers 3-Year LL.B., 5-Year Integrated B.A. LL.B., and 2-Year LL.M. degree programs under its official faculty of law.`,
    },
    {
      question: `Where can I find the official ${uni.name} LL.B. syllabus?`,
      answer: `LowStudy provides verified, official syllabus breakdowns for ${uni.name} broken down by academic year, semester, subject, and unit topic along with BNS/IPC updates.`,
    },
    {
      question: `Are BNS 2023 criminal law subjects included in the ${uni.name} syllabus?`,
      answer: `Yes, LowStudy reflects the latest BNS 2023, BNSS 2023, and BSA 2023 updates alongside traditional IPC/CrPC provisions for ${uni.name} law examinations.`,
    },
  ];

  const courseJsonLd = getCourseJsonLd({
    name: `${uni.name} LL.B. Course & Syllabus`,
    description: `Official LL.B. syllabus, subjects, study notes, and MCQs for ${uni.name}.`,
    university: uni.name,
  });

  const faqJsonLd = getFaqJsonLd(faqs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={courseJsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: 'Gujarat Universities', url: '/gujarat-law-colleges' },
            { name: uni.name, url: `/universities/${uni.id}` },
          ]}
        />

        {/* Hero Section */}
        <header className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <GraduationCap className="w-48 h-48 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-3xl sm:text-4xl">{uni.logo}</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                {uni.type}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                Established {uni.established}
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold">
                Status: {uni.status}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {uni.name} Law Courses, Syllabus, Notes & Exam Preparation
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              Explore official {uni.name} ({uni.code}) law syllabi, degree programs, unit notes, landmark case laws, MCQs, and AI-assisted revision for Gujarat law students in {uni.city}.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Official Syllabus Source Verified
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Academic Year {uni.academicYear}
              </span>
              {uni.officialWebsite && (
                <a
                  href={uni.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-400 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Official Portal
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Section 1: Law Programs Offered */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <span>Academic Law Programs Offered</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">3-Year LL.B. Program</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                6 Semesters covering Constitutional Law, Criminal Law (BNS/IPC), Contracts, Torts, Family Law, and Jurisprudence.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-2"
              >
                Explore LL.B. Syllabus <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-teal-500/10 text-teal-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">5-Year Integrated B.A. LL.B.</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                10 Semesters combining undergraduate arts/humanities foundation with professional law subjects.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 pt-2"
              >
                Explore Integrated Syllabus <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="p-2.5 w-fit rounded-lg bg-amber-500/10 text-amber-400">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">2-Year LL.M. Master of Laws</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Postgraduate specialization in Constitutional Law, Corporate Law, Criminal Law, and Intellectual Property.
              </p>
              <Link
                href="/subjects"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 pt-2"
              >
                Explore LL.M. Subjects <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Verified Subjects & Syllabus Breakdown */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span>Featured {uni.code} LL.B. Semester Subjects</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featuredSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group block space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {sub.shortCode || sub.code || 'LAW'}
                  </span>
                  <span className="text-xs text-slate-500">Semester {sub.semesterId ? sub.semesterId.replace('sem', '') : '1'}</span>
                </div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 text-sm transition-colors">
                  {sub.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {sub.description}
                </p>
                <div className="text-xs text-slate-500 font-mono pt-1">
                  4 Units • Notes • BNS Revised
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Affiliated Law Colleges */}
        {affiliatedColleges.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <span>Affiliated Law Colleges ({affiliatedColleges.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {affiliatedColleges.map((college) => (
                <Link
                  key={college.id}
                  href={`/colleges/${college.id}`}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all group block space-y-2"
                >
                  <h3 className="font-bold text-white group-hover:text-emerald-400 text-sm">
                    {college.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Location: {college.city}, Gujarat
                  </p>
                  <span className="inline-block text-xs text-emerald-400 font-medium">
                    View College Details & Syllabus →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Ask NyayaAI Integration Callout */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" /> Ask NyayaAI — Syllabus Aware Legal Assistant
            </div>
            <h3 className="text-xl font-bold text-white">
              Have questions about {uni.name} exams or provisions?
            </h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Get instant, factual explanations, section citations, Gujarati notes, and exam answer frameworks tailored to the {uni.name} syllabus.
            </p>
          </div>
          <Link
            href="/ai-tutor"
            className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex-shrink-0 text-sm"
          >
            Ask NyayaAI Tutor
          </Link>
        </section>

        {/* Section 5: FAQs */}
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-base">{faq.question}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
