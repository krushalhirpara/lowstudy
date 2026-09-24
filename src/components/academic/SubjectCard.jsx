"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, Layers, CheckCircle2, ArrowRight, Award } from 'lucide-react';

export default function SubjectCard({ subject }) {
  if (!subject) return null;

  const {
    id,
    code,
    title,
    marks = 100,
    unitsCount = 4,
    topicsCount = 0,
    completedCount = 0,
    completionPercentage = 0,
    category = 'Core Law',
    credits = 5
  } = subject;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-sm">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
              {code}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {category}
            </span>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {marks} Marks &bull; {credits} Credits
          </span>
        </div>

        {/* Subject Name */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-amber-600 transition tracking-tight mb-3">
          <Link href={`/academic/subject/${id}`}>
            {title}
          </Link>
        </h3>

        {/* Units & Topics Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span><strong className="text-slate-800 font-semibold">{unitsCount}</strong> Units</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong className="text-slate-800 font-semibold">{topicsCount}</strong> Topics</span>
          </div>
        </div>
      </div>

      <div>
        {/* Student Progress Bar */}
        <div className="pt-3 border-t border-slate-200 mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Student Progress
            </span>
            <span className="font-bold text-slate-800">
              {completionPercentage}% <span className="text-slate-500 font-normal">({completedCount}/{topicsCount})</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/academic/subject/${id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs text-slate-800 flex items-center justify-center gap-2 transition duration-200 border border-slate-200 group-hover:bg-amber-500 group-hover:border-amber-400 group-hover:text-slate-950"
        >
          <span>{completionPercentage > 0 ? 'Continue Subject' : 'Start Subject'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
