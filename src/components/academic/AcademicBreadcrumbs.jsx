"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Building2, BookOpen, Layers, Bookmark } from 'lucide-react';

export default function AcademicBreadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto scrollbar-none py-1">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 whitespace-nowrap">
        <li>
          <Link
            href="/academic"
            className="flex items-center gap-1 hover:text-amber-400 transition font-medium text-slate-400"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Academic</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5 sm:gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-amber-400 transition font-medium truncate max-w-[140px] sm:max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-200 font-semibold truncate max-w-[160px] sm:max-w-[280px]">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
