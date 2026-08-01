"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  ArrowLeft, 
  Bot, 
  CheckCircle2, 
  BookMarked, 
  Sparkles, 
  Share2, 
  Download,
  FileText,
  HelpCircle
} from 'lucide-react';
import { SUBJECTS_DATA } from '@/data/legalData';

export default function SubjectDetailPage({ params }) {
  const subjectId = params.id;
  
  const subject = SUBJECTS_DATA.find(s => s.id === subjectId) || SUBJECTS_DATA[0];
  const [activeChapter, setActiveChapter] = useState(subject.chapters?.[0] || null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <Link href="/subjects" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to 15 Subjects Directory
      </Link>

      {/* Subject Header */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                {subject.shortCode}
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                {subject.category}
              </span>
            </div>
            <h1 className="fluid-h2 font-bold font-serif-title text-white">{subject.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{subject.description}</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
              href="/ai-tutor"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Bot className="w-4 h-4" />
              Ask AI about {subject.shortCode}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area (Chapter List + Chapter Notes Reader) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Chapters Sidebar */}
        <div className="hidden lg:block space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
            Chapters & Modules ({subject.chapters?.length || 0})
          </h3>

          <div className="space-y-2">
            {subject.chapters?.map((chap, idx) => (
              <button
                key={chap.id}
                onClick={() => setActiveChapter(chap)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                  activeChapter?.id === chap.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <span>{idx + 1}. {chap.title}</span>
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Notes Reader */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mobile Chapter Selector */}
          <div className="lg:hidden space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Chapters & Modules ({subject.chapters?.length || 0})
            </label>
            <select
              value={activeChapter?.id || ''}
              onChange={(e) => {
                const selected = subject.chapters?.find(c => c.id === e.target.value);
                if (selected) setActiveChapter(selected);
              }}
              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-xs font-semibold p-3.5 rounded-xl focus:outline-none focus:border-amber-500"
            >
              {subject.chapters?.map((chap, idx) => (
                <option key={chap.id} value={chap.id} className="bg-slate-950 text-slate-200">
                  {idx + 1}. {chap.title}
                </option>
              ))}
            </select>
          </div>
          {activeChapter ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] text-amber-400 uppercase font-mono font-bold tracking-wider">
                    MODULE NOTE
                  </span>
                  <h2 className="text-2xl font-bold font-serif-title text-white mt-1">{activeChapter.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white" title="Bookmark">
                    <BookMarked className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notes Body */}
              <div className="prose prose-invert prose-slate max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-4">
                <p>{activeChapter.notes}</p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5 font-serif-title">
                    <Sparkles className="w-4 h-4" /> Exam Key Takeaway
                  </h4>
                  <p className="text-xs text-slate-300">
                    Always cite landmark precedents when answering main exam questions on this topic. Focus on the statutory ratio decidendi.
                  </p>
                </div>
              </div>

              {/* AI Deep Dive Prompt CTA */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Need a simpler breakdown?</span>
                <Link 
                  href={`/ai-tutor?prompt=${encodeURIComponent(`Explain ${activeChapter.title} in simple terms with examples`)}`}
                  className="text-xs text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Bot className="w-3.5 h-3.5" />
                  Ask NyayaAI to simplify this →
                </Link>
              </div>

            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-3xl border border-slate-800">
              Select a chapter to view study notes.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
