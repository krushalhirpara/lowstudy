import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/utils/seo';
import { BLOG_POSTS } from '../page';
import { BookOpen, Calendar, User, ArrowRight, Sparkles, Scale, CheckCircle2 } from 'lucide-react';

export async function generateMetadata({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: 'Article Not Found' };

  return {
    title: `${post.title} | LowStudy Law Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://lowstudy.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://lowstudy.com/blog/${post.slug}`,
      siteName: 'LowStudy',
      type: 'article',
    },
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogArticlePage({ params }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const articleJsonLd = getArticleJsonLd({
    title: post.title,
    description: post.excerpt,
    url: `https://lowstudy.com/blog/${post.slug}`,
    datePublished: post.date,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />

      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumbs
          items={[
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
        />

        <article className="space-y-6">
          <header className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> LowStudy Legal Team
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>

            <p className="text-slate-300 text-base leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-1 bg-slate-950/40 rounded-r-lg">
              {post.excerpt}
            </p>
          </header>

          {/* Body Content */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 text-slate-300 text-sm sm:text-base leading-relaxed">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Key Legal Principles & Exam Framework</span>
            </h2>
            <p>
              When preparing for LL.B. semester examinations under Gujarat universities like Gujarat University, Saurashtra University, or VNSGU, structuring your answers effectively can account for up to 30% higher scores.
            </p>

            <h3 className="text-lg font-bold text-white">1. Structure of a High-Scoring Legal Answer</h3>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-emerald-400">Introduction:</strong> Define the statutory provision and statutory act name clearly.</li>
              <li><strong className="text-emerald-400">Statutory Provisions:</strong> Cite the exact section (e.g., BNS Section 103 for Murder).</li>
              <li><strong className="text-emerald-400">Essential Ingredients:</strong> Bullet point every constituent element required by law.</li>
              <li><strong className="text-emerald-400">Landmark Precedents:</strong> Cite at least 1-2 Supreme Court judgments with short ratios.</li>
              <li><strong className="text-emerald-400">Exceptions:</strong> Detail statutory exceptions where applicable.</li>
            </ul>

            <h3 className="text-lg font-bold text-white">2. BNS 2023 Revision Strategy</h3>
            <p>
              Ensure you mention both the legacy IPC section and the updated BNS 2023 section in your university answers. Examiners award bonus marks for demonstrating awareness of the criminal law reforms.
            </p>
          </div>

          {/* Ask NyayaAI Widget */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Studying for exams right now?</h3>
              <p className="text-xs text-slate-400">Ask NyayaAI for instant syllabus clarifications or practice question feedback.</p>
            </div>
            <Link
              href="/ai-tutor"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors flex-shrink-0"
            >
              Ask NyayaAI
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
