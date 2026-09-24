"use client";

import React from 'react';
import Link from 'next/link';
import { Layers, ChevronRight, CheckCircle2, BookOpen } from 'lucide-react';

export default function UnitCard({ unit, subjectId }) {
  if (!unit) return null;

  const {
    id,
    unitNumber,
    title,
    description,
    topicsCount = 0,
    completedCount = 0,
    completionPercentage = 0
  } = unit;

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-amber-400 hover:bg-slate-50/50 transition-all duration-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Unit Number Badge */}
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-sm shrink-0">
            U{unitNumber}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Unit {unitNumber}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                {topicsCount} Topics
              </span>
            </div>

            {/* Official Unit Name */}
            <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition tracking-tight">
              <Link href={`/academic/unit/${id}`}>
                {title}
              </Link>
            </h4>

            {description && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Progress & Link Button */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-slate-800 block">
              {completionPercentage}% <span className="text-slate-500 font-normal">Completed</span>
            </span>
            <div className="w-24 sm:w-28 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
              />
            </div>
          </div>

          <Link
            href={`/academic/unit/${id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs text-slate-800 border border-slate-200 transition duration-150 shrink-0"
          >
            <span>Explore Unit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
