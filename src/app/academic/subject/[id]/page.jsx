"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Award,
  Clock,
  Filter
} from 'lucide-react';
import AcademicBreadcrumbs from '@/components/academic/AcademicBreadcrumbs';
import UnitCard from '@/components/academic/UnitCard';

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!subjectId) return;
    fetchSubject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  async function fetchSubject() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/academic/subject/${subjectId}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load subject details');
      }
      setData(json.subject);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Loading official subject curriculum...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Subject Not Found</h2>
          <p className="text-sm text-slate-400">{error || 'Unable to retrieve subject details.'}</p>
          <Link
            href="/academic"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Semester Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const {
    id,
    code,
    title,
    category,
    credits,
    marks,
    description,
    university,
    course,
    semester,
    totalUnits,
    totalTopics,
    completedTopics,
    completionPercentage,
    units = [],
    navigation = {}
  } = data;

  // Filter units according to search term (searches unit title, description, or contained topics)
  const filteredUnits = units.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesUnit = u.title.toLowerCase().includes(q) || (u.description && u.description.toLowerCase().includes(q));
    const matchesTopic = u.topics && u.topics.some(t => t.title.toLowerCase().includes(q));
    return matchesUnit || matchesTopic;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Breadcrumb Navigation: University -> Course -> Semester -> Subject */}
        <AcademicBreadcrumbs
          items={[
            { label: university?.name || 'Saurashtra University', href: '/academic' },
            { label: course?.name || '3-Year LL.B.', href: '/academic' },
            { label: `Semester ${semester?.semesterNumber || 3}`, href: '/academic' },
            { label: `${code} - ${title}` }
          ]}
        />

        {/* 3. Subject Detail Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top metadata tags */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
                CODE: {code}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                {category || 'Core Law'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Saurashtra University Syllabus</span>
              </span>
            </div>

            {/* Title and stats */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {title}
              </h1>
              {description && (
                <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Subject Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Total Marks</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">{marks || 100}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">70 Ext + 30 Int</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Curriculum Units</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">{totalUnits}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{credits || 4} Academic Credits</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Syllabus Topics</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">{totalTopics}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Official CBCS Units</div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 sm:p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <span>Your Progress</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400">{completionPercentage}%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{completedTopics} of {totalTopics} completed</div>
              </div>
            </div>

            {/* Overall Subject Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Course Completion Status</span>
                <span className="text-amber-400">{completedTopics}/{totalTopics} Topics Finished</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Previous / Next Subject Navigation Bar */}
        <div className="flex items-center justify-between gap-4 py-2 border-y border-slate-800/80">
          {navigation?.prev ? (
            <Link
              href={`/academic/subject/${navigation.prev.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Previous Subject</div>
                <div className="truncate max-w-[140px] sm:max-w-xs">{navigation.prev.code} - {navigation.prev.title}</div>
              </div>
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">First subject in semester</div>
          )}

          <Link
            href="/academic"
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            All Subjects
          </Link>

          {navigation?.next ? (
            <Link
              href={`/academic/subject/${navigation.next.id}`}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-amber-400 transition text-right"
            >
              <div className="text-right">
                <div className="text-[10px] uppercase text-slate-400 font-bold">Next Subject</div>
                <div className="truncate max-w-[140px] sm:max-w-xs">{navigation.next.code} - {navigation.next.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </Link>
          ) : (
            <div className="text-xs text-slate-400 italic">Last subject in semester</div>
          )}
        </div>

        {/* Evidence-Based Subject Priority Questions */}
        {subject.priorityQuestions && subject.priorityQuestions.length > 0 && (
          <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  High-Yield Evidence Priority Questions &bull; {subject.code}
                </h2>
              </div>
              <Link
                href={`/question-bank?subject=${subject.id}`}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
              >
                <span>View Full Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subject.priorityQuestions.map(q => {
                const priorityClass =
                  q.priority_label === 'Very High Priority'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : q.priority_label === 'High Priority'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : q.priority_label === 'Important'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300';

                return (
                  <div key={q.id} className="bg-slate-850/90 border border-slate-750 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${priorityClass}`}>
                          {q.priority_label || 'Practice'}
                        </span>
                        {q.topic?.unit?.unitNumber && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                            Unit {q.topic.unit.unitNumber}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">
                        {q.marks} Marks &bull; Score: {q.priority_score}/100
                      </span>
                    </div>

                    <Link href={`/question-bank/${q.id}`} className="block group">
                      <p className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-400 transition line-clamp-2">
                        {q.questionText}
                      </p>
                    </Link>

                    {q.why_important && (
                      <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <strong className="text-amber-300 font-semibold">Why this is important: </strong>
                        {q.why_important}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 italic text-center pt-1">
              Evidence-based educational classification derived from syllabus weight and verified past exam papers. LowStudy does not predict or guarantee upcoming examination questions.
            </p>
          </section>
        )}

        {/* 4. Unit Listing Section Header with Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Curriculum Units ({filteredUnits.length})</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore official syllabus units and underlying examination topics.
              </p>
            </div>

            {/* Search within subject */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit or topic..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Unit Cards List */}
          {filteredUnits.length > 0 ? (
            <div className="space-y-3.5">
              {filteredUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  subjectId={id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <Search className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No units found matching &quot;{searchQuery}&quot;</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for keywords like &quot;Strike&quot;, &quot;Dispute&quot;, or clear the search filter.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-amber-400 text-xs font-semibold hover:bg-slate-750"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Bottom Subject Action / Quick Start */}
        {units.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/20 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="text-sm font-bold text-white">Ready to prepare this subject?</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Begin with Unit 1 &quot;{units[0]?.title}&quot; or continue where you left off.
              </div>
            </div>
            <Link
              href={`/academic/unit/${units[0]?.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition duration-150 shadow-lg shadow-amber-500/10 shrink-0"
            >
              <span>Start Unit 1</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
