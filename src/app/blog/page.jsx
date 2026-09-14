import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/utils/seo';
import { BookOpen, Calendar, ArrowRight, GraduationCap, Scale, FileText } from 'lucide-react';

export const metadata = {
  title: 'Gujarat Law Education & Exam Preparation Blog | LowStudy',
  description: 'Guides, syllabus breakdowns, study tips, BNS 2023 revision notes, and exam answer writing strategies for Gujarat law students.',
  alternates: {
    canonical: 'https://lowstudy.com/blog',
  },
};

export const BLOG_POSTS = [
  {
    slug: 'gujarat-university-llb-exam-preparation-guide',
    title: 'Gujarat University LL.B. Exam Preparation & Answer Writing Guide',
    excerpt: 'Step-by-step framework to score high marks in Gujarat University 3-Year LL.B. semester examinations using structured case law citations.',
    category: 'Exam Strategy',
    date: '2026-09-10',
    readTime: '6 min read',
  },
  {
    slug: 'bns-vs-ipc-key-differences-for-law-students',
    title: 'BNS 2023 vs IPC 1860: Key Differences Law Students Must Know',
    excerpt: 'Comprehensive conversion chart comparing major penal offences under Bharatiya Nyaya Sanhita against traditional IPC provisions.',
    category: 'New Laws',
    date: '2026-09-08',
    readTime: '8 min read',
  },
  {
    slug: 'important-constitutional-law-articles-for-exams',
    title: 'Top 15 Constitutional Law Articles Frequently Asked in Gujarat LL.B. Exams',
    excerpt: 'Focus area analysis of Article 14, Article 19, Article 21, Article 32, and Article 226 with landmark Supreme Court precedents.',
    category: 'Syllabus Notes',
    date: '2026-09-05',
    readTime: '7 min read',
  },
  {
    slug: 'bnss-vs-crpc-procedural-law-changes-explained',
    title: 'BNSS 2023 vs CrPC 1973: Procedural Law Reforms Explained',
    excerpt: 'Breakdown of zero FIR, electronic summons, forensic evidence mandates, and timeline restrictions under BNSS 2023.',
    category: 'Procedural Law',
    date: '2026-09-01',
    readTime: '9 min read',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: 'Law Student Blog & Guides', url: '/blog' }]} />

        <header className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
            <BookOpen className="w-4 h-4" /> Gujarat Legal Education Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Law Student Study Guides & Exam Notes
          </h1>
          <p className="text-slate-300 text-base max-w-3xl">
            Verified study guides, university exam strategies, BNS 2023 revision notes, and landmark judgment summaries tailored for law students in Gujarat.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.slug}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {post.date} • {post.readTime}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">{post.excerpt}</p>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 pt-2"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
