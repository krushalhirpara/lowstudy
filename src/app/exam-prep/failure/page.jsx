"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';

function FailureContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('error') || 'Payment processing was cancelled or unsuccessful.';

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Payment Unsuccessful</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          {errorMessage}
        </p>
        <p className="text-[11px] text-slate-500">
          No amount was deducted. You can safely retry whenever you are ready.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/exam-prep/checkout"
          className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Payment (₹299)</span>
        </Link>

        <Link
          href="/exam-prep"
          className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center transition-colors"
        >
          <span>Back to Details</span>
        </Link>
      </div>

      <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
        Need assistance? Contact <span className="text-amber-400 font-mono">support@lowstudy.com</span>
      </div>
    </div>
  );
}

export default function ExamPrepFailurePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading failure details...</div>}>
        <FailureContent />
      </Suspense>
    </div>
  );
}
