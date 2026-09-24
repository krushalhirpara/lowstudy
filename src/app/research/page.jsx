"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Scale, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Filter, 
  ChevronRight, 
  Bookmark, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { LANDMARK_CASES, IPC_VS_BNS_MAP } from '@/data/legalData';

export default function LegalResearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCourt, setSelectedCourt] = useState('all');
  const [activeCase, setActiveCase] = useState(LANDMARK_CASES[0] || null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [savedCases, setSavedCases] = useState([]);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const subjects = [
    { id: 'all', label: 'All Subjects' },
    { id: 'Constitutional Law', label: 'Constitutional Law' },
    { id: 'Criminal Law', label: 'Criminal Law (BNS/IPC)' },
    { id: 'Family Law', label: 'Family Law' },
    { id: 'Environmental Law', label: 'Environmental Law' },
    { id: 'Corporate Law', label: 'Corporate Law' }
  ];

  const courts = [
    { id: 'all', label: 'All Courts' },
    { id: 'Supreme Court of India', label: 'Supreme Court of India' },
    { id: 'Gujarat High Court', label: 'Gujarat High Court' }
  ];

  const filteredCases = LANDMARK_CASES.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.citation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.principle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || c.subject === selectedSubject;
    const matchesCourt = selectedCourt === 'all' || c.court === selectedCourt;
    return matchesSearch && matchesSubject && matchesCourt;
  });

  const handleCopyCitation = (citation) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  const toggleSaveCase = (caseId) => {
    if (savedCases.includes(caseId)) {
      setSavedCases(savedCases.filter(id => id !== caseId));
    } else {
      setSavedCases([...savedCases, caseId]);
    }
  };

  const handleGenerateAiSummary = (caseItem) => {
    setIsAiSummarizing(true);
    setTimeout(() => {
      setAiSummary({
        caseId: caseItem.id,
        ratio: caseItem.ratioDecidendi || caseItem.principle,
        keyTakeaway: `Crucial precedent for Gujarat University LL.B examinations. Establishes that ${caseItem.principle.slice(0, 100)}...`,
        statutoryProvisions: caseItem.subject === 'Constitutional Law' ? ['Article 21', 'Article 14', 'Article 19'] : ['BNS Section 103', 'BNSS Section 35'],
        examTip: "Frequently asked in 15-mark essay questions and 5-mark short notes. Always cite the Bench and core ratio in the introduction."
      });
      setIsAiSummarizing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <Scale className="w-4 h-4" />
                <span>AI-POWERED LEGAL RESEARCH</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Authoritative Precedents
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Case Law & Statutory Precedent Search
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Search verified Supreme Court and High Court judgments, ratio decidendi, legal doctrines, and statutory cross-references tailored for law students.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/bare-acts"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Bare Acts (BNS)</span>
              </Link>
              <Link
                href="/ai-tutor"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ask NyayaAI</span>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by case name, citation, legal principle, doctrine, or topic (e.g. Kesavananda, Article 21, Mob Lynching)..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedSubject === s.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Search Results List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>{filteredCases.length} Precedents Found</span>
              <span>Sorted by Syllabus Relevance</span>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No matching judgments found</h3>
                  <p className="text-xs text-slate-500 mt-1">Try refining your search terms or selecting 'All Subjects'.</p>
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = activeCase?.id === c.id;
                  const isSaved = savedCases.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveCase(c);
                        setAiSummary(null);
                      }}
                      className={`cursor-pointer p-4 rounded-2xl border transition text-left ${
                        isSelected 
                          ? 'bg-amber-50/70 border-amber-300 shadow-sm ring-1 ring-amber-400' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {c.subject}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{c.year}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">
                        {c.title}
                      </h3>
                      <p className="text-xs font-mono text-amber-700 mt-0.5">
                        {c.citation}
                      </p>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {c.principle}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {c.court}
                        </span>
                        <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                          Inspect <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Case Deep-Dive Reader */}
          <div className="lg:col-span-7">
            {activeCase ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-24">
                {/* Header */}
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {activeCase.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyCitation(activeCase.citation)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                      >
                        {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCitation ? 'Copied' : 'Copy Citation'}</span>
                      </button>
                      <button
                        onClick={() => toggleSaveCase(activeCase.id)}
                        className={`p-1.5 rounded-lg border transition ${
                          savedCases.includes(activeCase.id)
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                    {activeCase.title}
                  </h2>
                  <p className="text-xs font-mono text-amber-700 font-semibold mt-1">
                    {activeCase.citation} • {activeCase.court} ({activeCase.year})
                  </p>
                </div>

                {/* Core Legal Doctrine */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Ratio Decidendi & Legal Principle
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {activeCase.principle}
                  </p>
                </div>

                {/* Facts & Context */}
                {activeCase.facts && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Material Facts & Context
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-xl p-3.5">
                      {activeCase.facts}
                    </p>
                  </div>
                )}

                {/* Bench & Significance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                    <span className="text-slate-400 font-semibold block mb-1">Bench / Coram</span>
                    <span className="font-semibold text-slate-800">{activeCase.bench || 'Constitutional Bench'}</span>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                    <span className="text-slate-400 font-semibold block mb-1">Syllabus Importance</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> High Exam Priority
                    </span>
                  </div>
                </div>

                {/* AI Research Assistant Section */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-bold tracking-wider uppercase text-amber-300">
                        NyayaAI Case Analyst
                      </h4>
                    </div>
                    <button
                      onClick={() => handleGenerateAiSummary(activeCase)}
                      disabled={isAiSummarizing}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition disabled:opacity-50"
                    >
                      {isAiSummarizing ? 'Analyzing...' : aiSummary ? 'Re-Analyze' : 'Generate Exam Summary'}
                    </button>
                  </div>

                  {aiSummary ? (
                    <div className="space-y-3 pt-2 text-xs text-slate-200 border-t border-slate-700">
                      <div>
                        <span className="text-amber-400 font-bold block mb-0.5">Exam Application Tip:</span>
                        <p className="leading-relaxed">{aiSummary.examTip}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 font-bold block mb-0.5">Related Statutory Sections:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiSummary.statutoryProvisions.map((sec, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-mono text-emerald-300">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Click generate to receive an instant exam breakdown, model answer citations, and Gujarat University syllabus relevance notes.
                    </p>
                  )}
                </div>

                {/* Action Links */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    href={`/ai-tutor?prompt=Explain the full judgment and ratio of ${encodeURIComponent(activeCase.title)} with case facts and exam relevance`}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    Discuss in NyayaAI Tutor <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/practice-writing"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    Practice Answer on this Precedent <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Select a judgment from the list</h3>
                <p className="text-xs text-slate-500 mt-1">Click any case to inspect its ratio decidendi, facts, bench, and AI exam analysis.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
