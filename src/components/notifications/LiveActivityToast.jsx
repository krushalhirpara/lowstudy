"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LogIn,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  Trophy,
  Sparkles,
  BookOpen,
  Scale,
  BookMarked,
  PenTool,
  Building,
  X,
  Radio,
} from 'lucide-react';

const ICON_MAP = {
  login: LogIn,
  signup: GraduationCap,
  quiz: FileCheck,
  mcq: CheckCircle2,
  mock: Trophy,
  ai: Sparkles,
  subject: BookOpen,
  case: Scale,
  bareact: BookMarked,
  drafting: PenTool,
  moot: Building,
  default: Sparkles,
};

const COLOR_MAP = {
  login: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  signup: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  quiz: 'bg-amber-50 text-amber-600 border-amber-200',
  mcq: 'bg-blue-50 text-blue-600 border-blue-200',
  mock: 'bg-purple-50 text-purple-600 border-purple-200',
  ai: 'bg-teal-50 text-teal-600 border-teal-200',
  subject: 'bg-rose-50 text-rose-600 border-rose-200',
  case: 'bg-amber-50 text-amber-600 border-amber-200',
  bareact: 'bg-sky-50 text-sky-600 border-sky-200',
  drafting: 'bg-violet-50 text-violet-600 border-violet-200',
  moot: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  default: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

function getDismissedSet() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.sessionStorage.getItem('ls_dismissed_activities');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedId(id) {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getDismissedSet();
    set.add(id);
    window.sessionStorage.setItem('ls_dismissed_activities', JSON.stringify(Array.from(set)));
  } catch {}
}

export default function LiveActivityToast() {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();

  const [currentEvent, setCurrentEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const queueRef = useRef([]);
  const isDisplayingRef = useRef(false);
  const timerRef = useRef(null);

  // Exclude rendering on admin console
  const isCeoAdmin = pathname?.startsWith('/ceoadmin');

  // Process next event in queue
  const displayNext = useCallback(() => {
    if (isDisplayingRef.current || queueRef.current.length === 0) return;

    const nextEvent = queueRef.current.shift();
    if (!nextEvent) return;

    isDisplayingRef.current = true;
    setCurrentEvent(nextEvent);
    setIsVisible(true);

    // Visible duration: 5.2 seconds
    timerRef.current = setTimeout(() => {
      setIsVisible(false);

      // Wait for exit animation (350ms) then pause 14s before next toast
      setTimeout(() => {
        setCurrentEvent(null);
        isDisplayingRef.current = false;

        timerRef.current = setTimeout(() => {
          displayNext();
        }, 14000);
      }, 350);
    }, 5200);
  }, []);

  const handleDismiss = useCallback((e) => {
    e?.stopPropagation();
    if (!currentEvent) return;

    saveDismissedId(currentEvent.id);
    setIsVisible(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    setTimeout(() => {
      setCurrentEvent(null);
      isDisplayingRef.current = false;

      timerRef.current = setTimeout(() => {
        displayNext();
      }, 16000);
    }, 350);
  }, [currentEvent, displayNext]);

  // Fetch recent public activity feed
  const fetchFeed = useCallback(async () => {
    if (isCeoAdmin) return;

    try {
      const res = await fetch('/api/activity/public', {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data?.success || !Array.isArray(data.events) || data.events.length === 0) {
        return;
      }

      const dismissed = getDismissedSet();

      // Filter out already dismissed items
      const newItems = data.events.filter(item => !dismissed.has(item.id));

      if (newItems.length > 0) {
        // Enqueue unique items not already in queue
        const existingIds = new Set(queueRef.current.map(e => e.id));
        if (currentEvent) existingIds.add(currentEvent.id);

        for (const item of newItems) {
          if (!existingIds.has(item.id)) {
            queueRef.current.push(item);
          }
        }

        if (!isDisplayingRef.current) {
          displayNext();
        }
      }
    } catch {
      // Non-blocking catch
    }
  }, [isCeoAdmin, currentEvent, displayNext]);

  useEffect(() => {
    if (isCeoAdmin) return;

    // Initial delayed fetch to avoid competing with main page resource hydration
    const initialTimer = setTimeout(() => {
      fetchFeed();
    }, 4000);

    // Periodic polling every 45s
    const interval = setInterval(() => {
      fetchFeed();
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchFeed, isCeoAdmin]);

  if (isCeoAdmin || !currentEvent) {
    return null;
  }

  const IconComponent = ICON_MAP[currentEvent.icon] || Sparkles;
  const colorClass = COLOR_MAP[currentEvent.icon] || COLOR_MAP.default;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-6 z-40 max-w-sm pointer-events-none transition-all duration-300 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
      aria-live="polite"
      role="status"
    >
      <div className="pointer-events-auto bg-white/95 text-slate-900 border border-slate-200/90 shadow-xl shadow-slate-900/5 backdrop-blur-md rounded-2xl p-3.5 flex items-start gap-3 relative group">
        {/* Event Icon Badge */}
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${colorClass}`}>
          <IconComponent className="w-4.5 h-4.5" />
        </div>

        {/* Content Body */}
        <div className="min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight line-clamp-1">
              {currentEvent.title}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
            <span className="truncate">{currentEvent.subtitle}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {currentEvent.timeAgo || 'Just now'}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          title="Dismiss"
          aria-label="Dismiss notification"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
