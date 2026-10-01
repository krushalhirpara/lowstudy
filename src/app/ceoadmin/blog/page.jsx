"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Tag,
  Building2,
  FileText,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function CeoAdminBlogPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBlogArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        category: categoryFilter,
        status: statusFilter,
      });
      const res = await fetch(`/api/ceoadmin/blog?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setArticles(data.articles || []);
          setCategories(data.categories || []);
          setStats(data.stats || null);
        }
      }
    } catch (err) {
      console.error('Error fetching blog articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogArticles();
  }, [categoryFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogArticles();
  };

  const handleToggleStatus = async (slug, currentStatus) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch('/api/ceoadmin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_status', slug, status: nextStatus }),
      });
      if (res.ok) {
        setArticles(prev => prev.map(a => a.slug === slug ? { ...a, status: nextStatus } : a));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <span>Blog &amp; SEO Content Hub Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish, edit, and organize public legal study guides, university syllabus breakdowns, and exam notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>View Public Blog Hub</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            onClick={fetchBlogArticles}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh Articles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-500" /> Total Articles
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-[10px] text-slate-500">All Content Items</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Published (Indexable)
            </div>
            <div className="text-2xl font-bold text-emerald-400">{stats.publishedCount}</div>
            <div className="text-[10px] text-slate-500">Included in XML Sitemap</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Drafts (Non-Indexable)
            </div>
            <div className="text-2xl font-bold text-amber-400">{stats.draftCount}</div>
            <div className="text-[10px] text-slate-500">Excluded from Search</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-indigo-400" /> Active Categories
            </div>
            <div className="text-2xl font-bold text-indigo-400">{stats.categoriesCount}</div>
            <div className="text-[10px] text-slate-500">Topical Clusters</div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, primary keyword, or excerpt..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Articles Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Article Title &amp; Slug</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Author</th>
                <th className="px-4 py-3.5">Target Focus</th>
                <th className="px-4 py-3.5">Published Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading blog articles...</span>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No articles found matching the selected filters.
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.slug} className="hover:bg-slate-800/40 transition-colors">
                    {/* Title & Slug */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="font-bold text-white text-xs leading-snug">
                        {article.title}
                      </div>
                      <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                        /blog/{article.slug}
                      </div>
                      {article.featured && (
                        <span className="inline-block mt-1 px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                          ★ Featured
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-semibold border border-slate-700 text-[11px]">
                        {article.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-4">
                      <div className="text-slate-200 font-medium">{article.author?.name}</div>
                      <div className="text-[10px] text-slate-500">{article.readTime}</div>
                    </td>

                    {/* Target Focus */}
                    <td className="px-4 py-4">
                      {article.targetUniversity ? (
                        <div className="text-emerald-400 font-medium flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {article.targetUniversity}
                        </div>
                      ) : (
                        <div className="text-slate-400 font-mono text-[11px]">
                          {article.primaryKeyword || 'General'}
                        </div>
                      )}
                    </td>

                    {/* Published Date */}
                    <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                      <div>{article.publishedDate}</div>
                      {article.updatedDate && (
                        <div className="text-emerald-500 text-[10px]">Upd: {article.updatedDate}</div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleStatus(article.slug, article.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition ${
                          article.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {article.status === 'PUBLISHED' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PUBLISHED</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>DRAFT</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Preview</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
