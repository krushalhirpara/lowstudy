"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export default function TopicCard({ 
  topic, 
  onToggleComplete, 
  onToggleBookmark 
}) {
  const [isCompleted, setIsCompleted] = useState(topic?.isCompleted || false);
  const [isBookmarked, setIsBookmarked] = useState(topic?.isBookmarked || false);
  const [loadingAction, setLoadingAction] = useState(false);

  React.useEffect(() => {
    if (topic) {
      setIsCompleted(!!topic.isCompleted);
      setIsBookmarked(!!topic.isBookmarked);
    }
  }, [topic?.isCompleted, topic?.isBookmarked, topic]);

  if (!topic) return null;

  const {
    id,
    topicNumber,
    title,
    description,
    status = 'PUBLISHED',
    subtopicsCount = 0
  } = topic;

  const handleCompleteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    if (onToggleComplete) {
      onToggleComplete(id, nextState);
    } else {
      try {
        setLoadingAction(true);
        await fetch('/api/academic/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: id, isCompleted: nextState, action: 'toggleCompletion' })
        });
      } catch (err) {
        console.error('Error toggling completion:', err);
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);

    if (onToggleBookmark) {
      onToggleBookmark(id, nextState);
    } else {
      try {
        await fetch('/api/academic/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topicId: id, action: 'toggleBookmark' })
        });
      } catch (err) {
        console.error('Error toggling bookmark:', err);
      }
    }
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 p-4 sm:p-5 shadow-sm ${
        isCompleted
          ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400'
          : 'bg-white border-slate-200 hover:border-amber-400'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Left Side: Completion Toggle & Topic Name */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Completion Status Toggle Button */}
          <button
            type="button"
            onClick={handleCompleteClick}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
            className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-bold text-amber-700">
                Topic {topicNumber}
              </span>
              {subtopicsCount > 0 && (
                <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {subtopicsCount} Syllabus Sub-topics
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Completed
                </span>
              )}
            </div>

            {/* Official Topic Name */}
            <h5 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition tracking-tight">
              <Link href={`/academic/topic/${id}`}>
                {title}
              </Link>
            </h5>

            {description && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Bookmark & Start/Continue Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          {/* Bookmark Toggle Button */}
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
            className={`p-2 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* Start / Continue Button */}
          <Link
            href={`/academic/topic/${id}`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition duration-150 shadow-sm ${
              isCompleted
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            <span>{isCompleted ? 'Review Topic' : 'Start Topic'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
