import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  MapPin, 
  Calendar, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  Building2,
  ExternalLink
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getUniversityData, generateUniversitySchema, SITE_URL } from '@/lib/services/seoDataService';

export const revalidate = 3600; // revalidate every hour

export async function generateMetadata() {
  const uni = await getUniversityData();
  const title = 'Saurashtra University Law Faculty — LL.B. Syllabus, Notes & Exam Preparation';
  const description = 'Official Saurashtra University Rajkot Law curriculum hub. Explore 3-Year LL.B. syllabus, Semester 3 study materials, bare act analysis, model answers, and mock tests.';
  const canonicalUrl = `${SITE_URL}/saurashtra-university/`;

  return {
    title,
    description,
    keywords: [
      'Saurashtra University Law',
      'Saurashtra University LLB syllabus',
      'Rajkot Law Faculty',
      'SU LLB notes',
      'Saurashtra University LLB Semester 3',
      'BCI recognized law colleges Rajkot',
      'Saurashtra University previous year papers'
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

export default async function SaurashtraUniversityPage() {
  const uni = await getUniversityData();
  const schema = generateUniversitySchema(uni);

  const breadcrumbs = [
    { name: 'Universities', url: '/universities' },
    { name: 'Saurashtra University', url: '/saurashtra-university/' },
  ];

  const affiliatedColleges = [
    { name: 'Smt. Diwaliben Mohanlal Mehta Law College', location: 'Rajkot', code: 'DMLC' },
    { name: 'Shri A. M. P. Law College', location: 'Rajkot', code: 'AMPLC' },
    { name: 'Harivandana College of Law', location: 'Rajkot', code: 'HCL' },
    { name: 'Shri M. P. Shah Law College', location: 'Surendranagar', code: 'MPSLC' },
    { name: 'Mahila Law College', location: 'Rajkot', code: 'MLC' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={schema} />

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Header Section */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 sm:p-10 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-4 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              State Public University • Rajkot, Gujarat
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              Saurashtra University — Faculty of Law
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
              Premier legal education institution established in 1967 in Rajkot, Gujarat. Accredited Grade &apos;A&apos; by NAAC and recognized by the Bar Council of India (BCI) and UGC. LowStudy delivers comprehensive syllabus notes, bare act analysis, case law briefs, and examination tools for Saurashtra University law students.
            </p>

            {/* University Key Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">Rajkot, Gujarat</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">Est. 1967</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">NAAC &apos;A&apos; Grade</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-slate-300 font-medium">BCI & UGC Approved</span>
              </div>
            </div>
          </div>
        </header>

        {/* Core Law Programs Section */}
        <section aria-labelledby="law-programs-heading" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="law-programs-heading" className="text-2xl font-bold text-white tracking-tight">
                Academic Law Programs
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Bar Council of India compliant curriculum and syllabus guides
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 3-Year LL.B. Program Card */}
            <div className="group relative rounded-xl bg-slate-900/90 border border-slate-800 p-6 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                    Most Popular Degree
                  </span>
                  <span className="text-xs text-slate-400 font-mono">CBCS Pattern</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                  Bachelor of Laws (LL.B. 3-Year)
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Comprehensive 6-semester professional undergraduate law degree. Fully updated with statutory notes, Semester 3 syllabus breakdown, previous year question papers, and AI-powered revision tools.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>6 Semesters • 30 Core & Practical Law Papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Semester 3 Focused Study: Labour, Taxation, Banking & Cyber Laws</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>70 External Exam + 30 Continuous Assessment Marks</span>
                  </div>
                </div>
              </div>

              <Link
                href="/saurashtra-university/llb/"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md group-hover:shadow-indigo-500/25"
              >
                <span>Explore LL.B. Syllabus & Study Materials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 2-Year LL.M. Post-Graduate Program Card */}
            <div className="group relative rounded-xl bg-slate-900/90 border border-slate-800 p-6 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 font-semibold text-xs border border-purple-500/20">
                    Post-Graduate Specialization
                  </span>
                  <span className="text-xs text-slate-400 font-mono">CBCS Master</span>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                  Master of Laws (LL.M. 2-Year)
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Advanced 4-semester master curriculum offering specializations in Constitutional and Administrative Law, Criminal Law, Business Law, and Intellectual Property Rights.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>4 Semesters • Research Dissertation & Seminar Papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Judicial Service & UGC-NET Law Oriented Preparation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Comparative Constitutional Law & Legal Research Methodology</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-slate-800 text-slate-300 font-medium text-sm border border-slate-700">
                <span>LL.M. Curricula Repository</span>
              </div>
            </div>
          </div>
        </section>

        {/* Direct Link to Semester 3 Hub */}
        <section aria-labelledby="featured-semester-heading" className="mb-12">
          <div className="rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2 block">
                Active Study Portal
              </span>
              <h2 id="featured-semester-heading" className="text-2xl sm:text-3xl font-bold text-white mb-2">
                LL.B. Semester 3 Curriculum Hub
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Access the verified study notes, bare act breakdowns, landmark case laws, and question banks for all 5 core Semester 3 subjects: Labour Law I, Labour Law II, Taxation Laws, Banking Laws, and IT & Cyber Crimes.
              </p>
            </div>
            <Link
              href="/saurashtra-university/llb/semester-3/"
              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg flex-shrink-0 flex items-center gap-2"
            >
              <span>View Semester 3 Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Affiliated Law Colleges Section */}
        <section aria-labelledby="colleges-heading" className="mb-12">
          <h2 id="colleges-heading" className="text-2xl font-bold text-white tracking-tight mb-2">
            Affiliated Law Colleges in Saurashtra Region
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Institutes conducting Saurashtra University LL.B. degree examinations in Rajkot and surrounding districts
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {affiliatedColleges.map((col) => (
              <div key={col.code} className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {col.code}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {col.location}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-200">
                  {col.name}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* University Contact & Information */}
        <footer className="border-t border-slate-800/80 pt-8 text-xs text-slate-400 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>
              Saurashtra University Campus, University Road, Rajkot - 360005, Gujarat, India.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/saurashtra-university/llb/" className="hover:text-emerald-400 transition-colors">
                LL.B. Syllabus
              </Link>
              <Link href="/saurashtra-university/llb/semester-3/" className="hover:text-emerald-400 transition-colors">
                Semester 3
              </Link>
              <Link href="/mock-test" className="hover:text-emerald-400 transition-colors">
                Mock Tests
              </Link>
              <Link href="/question-bank" className="hover:text-emerald-400 transition-colors">
                Question Bank
              </Link>
            </div>
          </div>
          <p className="text-slate-500">
            Educational resource portal maintained by LowStudy. Content compiled from publicly gazetted syllabi and statutory bare acts for student study assistance.
          </p>
        </footer>
      </div>
    </div>
  );
}
