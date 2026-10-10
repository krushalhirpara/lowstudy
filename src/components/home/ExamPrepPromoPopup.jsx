"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, X, ArrowRight, ShieldCheck, BookOpen, Check } from 'lucide-react';

const POPUP_STORAGE_KEY = 'lowstudy_exam_prep_promo_dismissed_at';
const FREQUENCY_CAP_DAYS = 7;

export default function ExamPrepPromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(POPUP_STORAGE_KEY);
      if (dismissedAt) {
        const lastDismissedTime = parseInt(dismissedAt, 10);
        const daysPassed = (Date.now() - lastDismissedTime) / (1000 * 60 * 60 * 24);
        if (daysPassed < FREQUENCY_CAP_DAYS) {
          return; // Frequency capped
        }
      }

      // Show popup after short 2.5 second delay so page finishes initial rendering
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);

      return () => clearTimeout(timer);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
    } catch {}
  };

  const handleExplore = () => {
    handleDismiss();
    router.push('/exam-prep');
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="LowStudy Exam Prep Pass Promotion"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-500/40 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Top Bar with Badge and Close Icon */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>EXAM PREP PASS — ₹299</span>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close promotional popup"
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-2 mb-4">
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
          Upcoming LLB Exams? Prepare Smarter with LowStudy
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Access university-wise, semester-wise and subject-wise exam preparation, including Important Questions and structured model answers for different mark categories.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-slate-200">
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>2, 5, 10, 14 Mark Answers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>All Gujarat Universities</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>BNS 2023 & Case Law Citations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>One-Time ₹299 Access</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        <button
          type="button"
          onClick={handleExplore}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Explore Exam Prep</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="py-2.5 px-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}
