"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Calendar,
  History,
  FileDiff,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  BookOpen,
  Archive
} from 'lucide-react';

export default function SyllabusHistoryPage() {
  const [universityId, setUniversityId] = useState('gu');
  const [semesterNumber, setSemesterNumber] = useState(1);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [universityId, semesterNumber]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/syllabus/history?university=${universityId}&semester=${semesterNumber}`);
      const json = await res.json();
      if (json.success) {
        setHistory(json.history || []);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  const currentVersion = history.find(v => v.status === 'VERIFIED_CURRENT' && v.isCurrent);
  const archivedVersions = history.filter(v => v.status === 'ARCHIVED' || (!v.isCurrent && v.status !== 'PENDING_REVIEW'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Link href="/" className="hover:text-amber-400 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link href="/curriculum" className="hover:text-amber-400 transition">Curriculum Explorer</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-amber-400">Syllabus History & Archives</span>
        </div>

        {/* Hero Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                <History className="w-3.5 h-3.5" />
                <span>Versioned Curriculum Archive & Diff Trail</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Syllabus Version History
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Compare official historical law syllabus revisions with the current verified curriculum. All versions are tied to official Board of Studies gazette documents.
              </p>
            </div>

            {/* University & Semester Selectors */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">University</label>
                <select
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700 outline-none"
                >
                  <option value="gu">Gujarat University</option>
                  <option value="su">Saurashtra University</option>
                  <option value="vnsgu">VNSGU Surat</option>
                  <option value="msu">MSU Baroda</option>
                  <option value="hngu">HNGU Patan</option>
                  <option value="mkbu">MKBU Bhavnagar</option>
                  <option value="gnlu">GNLU Gandhinagar</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Semester</label>
                <select
                  value={semesterNumber}
                  onChange={(e) => setSemesterNumber(parseInt(e.target.value, 10))}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Current Verified Version Highlight */}
        {currentVersion && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                    🟢 CURRENT ACTIVE SYLLABUS
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    Academic Year {currentVersion.academicYear} &mdash; Version {currentVersion.version}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Verified: {new Date(currentVersion.verifiedAt || currentVersion.retrievedAt).toLocaleDateString()} by {currentVersion.verifiedBy?.fullName || 'Chief Legal Editor'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentVersion.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>Official University Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Content SHA-256 Hash:</span>
                <span className="font-mono text-slate-300 text-[11px] truncate block">{currentVersion.contentHash}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Authority Gazette Title:</span>
                <span className="text-slate-200 truncate block">{currentVersion.sourceTitle || 'Official Board of Studies Resolution'}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Verification Status:</span>
                <span className="text-emerald-400 font-bold font-mono">Officially Certified & Verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Historical Versions Timeline */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
            <Archive className="w-4 h-4 text-slate-400" />
            <span>Archived Previous Batches ({archivedVersions.length})</span>
          </h3>

          {archivedVersions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              No previous archived versions recorded for this semester yet. The current {currentVersion?.academicYear || '2026-27'} edition is the baseline verified syllabus.
            </div>
          ) : (
            <div className="space-y-3">
              {archivedVersions.map((ver) => (
                <div key={ver.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-300">
                        ARCHIVED
                      </span>
                      <h4 className="text-sm font-bold text-white">Batch {ver.academicYear} &mdash; Version {ver.version}</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Archived: {new Date(ver.updatedAt).toLocaleDateString()} &bull; Hash: {ver.contentHash?.slice(0, 16)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={ver.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>Archived Gazette</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
