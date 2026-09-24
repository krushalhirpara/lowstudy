"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scale, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center p-4 font-poppins">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-6 shadow-xl animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-600 to-slate-900 p-0.5 mx-auto">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Scale className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Student Access</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome to LowStudy</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instant free access to Gujarat Law university syllabi, BNS 2023 Bare Acts, landmark judgments, and AI study tools.
          </p>
        </div>

        <div className="space-y-2.5 text-left text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official Gujarat University Verified Syllabi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>BNS, BNSS & BSA 2023 Statutory Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>5,200+ Syllabus-Aligned Practice MCQs</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/curriculum"
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Start Learning Now (Free)</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center justify-center"
          >
            Open Student Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
