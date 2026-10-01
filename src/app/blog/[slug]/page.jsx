import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { 
  BLOG_ARTICLES, 
  getBlogArticleBySlug, 
  getPublishedBlogArticles 
} from '@/data/blogData';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Scale, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Layers, 
  Share2,
  Bookmark,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export async function generateMetadata({ params }) {
  const article = getBlogArticleBySlug(params?.slug);
  if (!article) {
    return {
      title: 'Article Not Found | LowStudy Law Blog',
      description: 'The requested legal study guide could not be found.',
    };
  }

  const pageUrl = `https://lowstudy.com/blog/${article.slug}`;

  return {
    title: article.metaTitle || `${article.title} | LowStudy Law Blog`,
    description: article.metaDescription || article.excerpt,
    keywords: [article.primaryKeyword, ...(article.secondaryKeywords || [])],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: pageUrl,
      siteName: 'LowStudy',
      locale: 'en_IN',
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate || article.publishedDate,
      authors: [article.author?.name || 'LowStudy Legal Team'],
      section: article.category,
      tags: article.secondaryKeywords || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const published = getPublishedBlogArticles();
  return published.map((a) => ({
    slug: a.slug,
  }));
}

export default function BlogArticleDetailPage({ params }) {
  const article = getBlogArticleBySlug(params?.slug);
  if (!article) {
    notFound();
  }

  const pageUrl = `https://lowstudy.com/blog/${article.slug}`;

  // 1. Article Schema (JSON-LD)
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate || article.publishedDate,
    articleSection: article.category,
    keywords: [article.primaryKeyword, ...(article.secondaryKeywords || [])].join(', '),
    author: {
      '@type': 'Person',
      name: article.author?.name || 'LowStudy Legal Team',
      jobTitle: article.author?.role || 'Legal Educator',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LowStudy',
      url: 'https://lowstudy.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lowstudy.com/logo.png',
      },
    },
  };

  // 2. Breadcrumbs Schema
  const breadcrumbItems = [
    { name: 'Blog', url: '/blog' },
    { name: article.category, url: '/blog' },
    { name: article.title, url: `/blog/${article.slug}` },
  ];

  // Resolve related articles
  const relatedArticles = (article.relatedArticles || [])
    .map((slug) => getBlogArticleBySlug(slug))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-poppins py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Visible Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* Article Header Card */}
        <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-bold border border-amber-200/80">
              {article.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {article.readTime}
            </span>
            {article.targetUniversity && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px] flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-600" /> {article.targetUniversity}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 font-serif-title tracking-tight leading-snug">
            {article.title}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed italic border-l-3 border-amber-500 pl-4 py-1.5 bg-slate-50/80 rounded-r-xl">
            {article.excerpt}
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-bold text-sm">
                {article.author?.name?.charAt(0) || 'L'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{article.author?.name}</div>
                <div className="text-[11px] text-slate-500">{article.author?.role}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 sm:text-right space-y-0.5 font-mono">
              <div>Published: {new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              {article.updatedDate && (
                <div className="text-emerald-700 font-semibold">Updated: {new Date(article.updatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              )}
            </div>
          </div>
        </header>

        {/* Main Article Body */}
        <article className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-8 text-slate-800 text-sm sm:text-base leading-relaxed">
          {article.contentSections && article.contentSections.map((sec, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif-title border-b border-slate-100 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span>{sec.heading}</span>
              </h2>

              <div className="text-slate-700 leading-relaxed space-y-3 whitespace-pre-line prose prose-slate max-w-none prose-strong:text-slate-900 prose-headings:text-slate-950">
                {sec.content}
              </div>
            </section>
          ))}
        </article>

        {/* Related LowStudy Interactive Resources */}
        {article.relatedResources && article.relatedResources.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Direct Resource Integration
              </span>
              <h3 className="text-lg font-bold text-white font-serif-title flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Relevant LowStudy Academic Tools</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {article.relatedResources.map((res, i) => (
                <Link
                  key={i}
                  href={res.href}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition group flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                      {res.badge}
                    </span>
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {res.title}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section aria-label="Related Legal Guides" className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Related Law Student Guides</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500/40 hover:shadow-lg transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <span>Read Guide</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Card */}
        <section aria-label="Practice Exam MCQs" className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl space-y-4">
          <div className="max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
              Practice What You Read
            </span>
            <h3 className="text-2xl font-bold font-serif-title text-white">
              Ready to Practice Subject MCQs &amp; Mock Tests?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Create a free LowStudy student account to access 4,690+ syllabus-aligned multiple choice questions, timed mock tests, and AI answer evaluation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Create Free Account to Practice
            </Link>
            <Link
              href="/blog"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all"
            >
              ← Back to Blog Hub
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
