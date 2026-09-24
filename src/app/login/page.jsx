"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Open access: No authentication required. Auto-redirect to dashboard
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-blue-600 p-0.5 mx-auto">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Scale className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Access Enabled</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">No Login Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            All LowStudy syllabus, notes, mock tests, previous year papers, and study materials are freely accessible without signing in.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <span>Continue to Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
