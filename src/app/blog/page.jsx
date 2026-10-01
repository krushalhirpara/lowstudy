import React from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import BlogIndexClient from '@/components/blog/BlogIndexClient';
import { getPublishedBlogArticles } from '@/data/blogData';
import { BookOpen, Sparkles, GraduationCap } from 'lucide-react';

export const metadata = {
  title: 'Gujarat Law Student Blog & Exam Notes | LL.B. Study Hub | LowStudy',
  description: 'Verified law study guides, university syllabus breakdowns (GU, Saurashtra, VNSGU), BNS 2023 revision notes, and exam answer writing strategies for Gujarat law students.',
  keywords: [
    'Gujarat University LLB syllabus',
    'Saurashtra University LLB notes',
    'BNS 2023 vs IPC differences',
    'How to write law exam answer',
    'IRAC method law exam',
    'Gujarat law student study guides',
    'LL.B. semester 3 syllabus',
    'LowStudy blog'
  ],
  alternates: {
    canonical: 'https://lowstudy.com/blog',
  },
  openGraph: {
    title: 'Gujarat Law Student Blog & Exam Notes | LowStudy',
    description: 'Verified study guides, semester syllabus breakdowns, BNS 2023 comparative tables, and high-scoring exam writing techniques.',
    url: 'https://lowstudy.com/blog',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat Law Student Blog & Exam Notes | LowStudy',
    description: 'Verified study guides, semester syllabus breakdowns, BNS 2023 comparative tables, and high-scoring exam writing techniques.',
  },
};

export default function BlogPage() {
  const articles = getPublishedBlogArticles();

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Gujarat Law Student Blog & Exam Preparation Hub',
    description: 'Verified study guides, university syllabus breakdowns, BNS 2023 revision notes, and exam answer writing strategies for law students.',
    url: 'https://lowstudy.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'LowStudy',
      url: 'https://lowstudy.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lowstudy.com/logo.png',
      },
    },
    hasPart: articles.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      description: a.excerpt,
      url: `https://lowstudy.com/blog/${a.slug}`,
      datePublished: a.publishedDate,
      author: {
        '@type': 'Person',
        name: a.author?.name || 'LowStudy Legal Team',
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-poppins py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={blogJsonLd} />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Visible Breadcrumbs */}
        <Breadcrumbs items={[{ name: 'Legal Blog & Content Hub', url: '/blog' }]} />

        {/* Hero Header */}
        <header className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Gujarat Legal Education &amp; Exam Content Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 font-serif-title tracking-tight leading-tight">
            Law Student Study Guides &amp; Exam Notes
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed">
            Verified study guides, university exam strategies, BNS 2023 revision notes, and landmark judgment summaries tailored for Gujarat University, Saurashtra University, and VNSGU law students.
          </p>
        </header>

        {/* Client Interactive Hub */}
        <BlogIndexClient articles={articles} />
      </div>
    </div>
  );
}
