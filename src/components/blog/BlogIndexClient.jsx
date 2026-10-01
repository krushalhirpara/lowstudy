"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  ArrowRight, 
  Clock, 
  User, 
  Tag, 
  Sparkles, 
  Scale, 
  FileText, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import BlogFeaturedImage from '@/components/blog/BlogFeaturedImage';
import { BLOG_CATEGORIES } from '@/data/blogData';

export default function BlogIndexClient({ articles = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter articles based on active category and search query
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchCategory =
        selectedCategory === 'All' || article.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        (article.cluster && article.cluster.toLowerCase().includes(q)) ||
        (article.primaryKeyword && article.primaryKeyword.toLowerCase().includes(q)) ||
        (article.targetUniversity && article.targetUniversity.toLowerCase().includes(q)) ||
        (article.secondaryKeywords &&
          article.secondaryKeywords.some((k) => k.toLowerCase().includes(q)));

      return matchCategory && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  return (
    <div className="space-y-12">
      {/* 1. Interactive Search & Category Filter Bar */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 30 guides by topic, university, BNS section, case law, or exam strategy..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Featured Article Banner (Only on "All" without active search) */}
      {selectedCategory === 'All' && !searchQuery && featuredArticle && (
        <section aria-label="Featured Law Study Guide" className="relative group">
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3 h-3" /> Featured Masterclass
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-medium">
                {featuredArticle.category}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}
              </span>
            </div>

            <div className="space-y-3 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-400 transition-colors font-serif-title">
                <Link href={`/blog/${featuredArticle.slug}`}>
                  {featuredArticle.title}
                </Link>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                {featuredArticle.excerpt}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {featuredArticle.author?.name?.charAt(0) || 'L'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{featuredArticle.author?.name}</div>
                  <div className="text-[11px] text-slate-400">{featuredArticle.author?.role}</div>
                </div>
              </div>

              <Link
                href={`/blog/${featuredArticle.slug}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. Articles Grid (30 High-Yield Articles) */}
      <section aria-label="Legal Blog Articles" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>
              {selectedCategory === 'All' ? '30 High-Yield Law Study Guides & Notes' : `${selectedCategory} Articles`}
            </span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {filteredArticles.length} of {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-600 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">No matching articles found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for general terms like &ldquo;Syllabus&rdquo;, &ldquo;BNS&rdquo;, &ldquo;IRAC&rdquo;, or reset category filters.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.slug}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500/50 hover:shadow-xl hover:shadow-slate-900/5 transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Thumbnail Header */}
                <Link href={`/blog/${article.slug}`} className="block relative aspect-[1200/630] overflow-hidden bg-slate-950">
                  <BlogFeaturedImage
                    src={article.featuredImage || `/images/blog/${article.slug}.webp`}
                    alt={article.imageAlt || article.title}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-white font-bold text-[10px] border border-white/10">
                      {article.category}
                    </span>
                  </div>
                </Link>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-amber-700">
                        {article.cluster || article.category}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" /> {article.readTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-snug font-serif-title">
                      <Link href={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(article.publishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <Link
                      href={`/blog/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 4. Core LowStudy Resource Clusters */}
      <section aria-label="Explore LowStudy Resources" className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Layers className="w-3 h-3" />
            <span>Interactive Learning Hubs</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-white">
            Connect Articles with Real LowStudy Tools
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every study guide on LowStudy is directly linked to interactive question banks, statutory section comparison tables, and AI-powered evaluation labs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Link
            href="/bns-vs-ipc"
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              ⚖️
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center justify-between">
              <span>BNS ↔ IPC Converter</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Compare 358 BNS sections directly with old IPC provisions.
            </p>
          </Link>

          <Link
            href="/quiz"
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              📝
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
              <span>4,690+ MCQ Quizzes</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Daily syllabus drills and mock examinations for Gujarat universities.
            </p>
          </Link>

          <Link
            href="/case-laws"
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              🏛️
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center justify-between">
              <span>Case Law Repository</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Landmark Supreme Court & High Court judgments with ratios.
            </p>
          </Link>

          <Link
            href="/practice/drafting"
            className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition group space-y-2"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              ✍️
            </div>
            <h3 className="text-xs font-bold text-white group-hover:text-purple-400 flex items-center justify-between">
              <span>AI Legal Drafting Lab</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">
              Draft civil plaints, bail applications, and legal notices.
            </p>
          </Link>
        </div>
      </section>

      {/* 5. Free Signup Conversion Banner */}
      <section aria-label="Student Registration CTA" className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-xl space-y-4">
        <div className="max-w-2xl space-y-2">
          <span className="px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider">
            Free Student Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif-title">
            Unlock Interactive MCQ Practice & AI Legal Tutor
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-900/90 leading-relaxed">
            While our blog study guides remain 100% free and open to everyone, create your free LowStudy account to solve 4,690+ MCQs, track revision weaknesses, and query NyayaAI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs shadow-lg transition-all"
          >
            Create Free Student Account
          </Link>
          <Link
            href="/curriculum"
            className="px-5 py-3 rounded-xl bg-white/30 hover:bg-white/40 text-slate-950 font-bold text-xs transition-all"
          >
            Explore 2026-27 Syllabus →
          </Link>
        </div>
      </section>
    </div>
  );
}
