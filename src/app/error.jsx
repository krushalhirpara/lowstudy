"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Compass } from 'lucide-react';

export default function GlobalErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('Global application error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Application Notification
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Unexpected Page Issue
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            We encountered a temporary issue while loading this legal study module. You can reload the page or navigate to any syllabus section.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reload Page</span>
          </button>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
