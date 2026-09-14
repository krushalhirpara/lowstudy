import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUJARAT_COLLEGES, GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationJsonLd } from '@/utils/seo';
import { GraduationCap, MapPin, Building2, BookOpen, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }) {
  const college = GUJARAT_COLLEGES.find((c) => c.id === params.slug);
  if (!college) return { title: 'College Not Found' };

  const uni = GUJARAT_UNIVERSITIES.find((u) => u.id === college.universityId);
  const title = `${college.name}, ${college.city} — Syllabus, Notes & Exam Prep | LowStudy`;
  const description = `Official syllabus, LL.B. notes, subjects, semester guides, and study materials for law students at ${college.name}, affiliated with ${uni?.name || 'Gujarat Law University'}.`;

  return {
    title,
    description,
    keywords: [
      `${college.name} syllabus`,
      `${college.name} notes`,
      `${college.city} law college`,
      `${uni?.code || 'Gujarat'} law syllabus`,
    ],
    alternates: {
      canonical: `https://lowstudy.com/colleges/${college.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/colleges/${college.id}`,
      siteName: 'LowStudy',
      locale: 'en_IN',
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return GUJARAT_COLLEGES.map((c) => ({
    slug: c.id,
  }));
}

export default function CollegeSeoPage({ params }) {
  const college = GUJARAT_COLLEGES.find((c) => c.id === params.slug);
  if (!college) notFound();

  const uni = GUJARAT_UNIVERSITIES.find((u) => u.id === college.universityId);

  const orgJsonLd = getOrganizationJsonLd();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={orgJsonLd} />

      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs
          items={[
            { name: 'Gujarat Law Colleges', url: '/gujarat-law-colleges' },
            { name: college.name, url: `/colleges/${college.id}` },
          ]}
        />

        <header className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
              Affiliated Law College
            </span>
            {college.established && (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs">
                Est. {college.established}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {college.name}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> Location: {college.city}, Gujarat
            </span>
            {uni && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-teal-400" /> Affiliated to:{' '}
                <Link href={`/universities/${uni.id}`} className="text-teal-400 hover:underline font-semibold">
                  {uni.name}
                </Link>
              </span>
            )}
          </div>
        </header>

        <section className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Syllabus & Exam Resources for {college.name}</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            As an affiliated institution under {uni?.name || 'Gujarat University'}, students of {college.name} follow the officially prescribed LL.B. and LL.M. syllabus framework. LowStudy provides exact unit-wise notes, Bare Act updates (BNS 2023), mock quizzes, and Ask NyayaAI assistance.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href={uni ? `/universities/${uni.id}` : '/subjects'}
              className="px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
            >
              <span>View Applicable Syllabus</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai-tutor"
              className="px-5 py-2.5 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Ask NyayaAI Tutor
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
