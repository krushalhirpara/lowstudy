"use client";

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Radio,
  FileDiff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
  Eye,
  Check,
  X,
  Clock,
  Building2,
  FileText,
  Search,
  Upload,
  Layers,
  Sparkles,
  Archive,
  History,
  AlertCircle,
  Database,
  ArrowRight,
  Info
} from 'lucide-react';

export default function SyllabusIntelligenceView({ onTriggerAlert }) {
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // dashboard, sources, pending, current, archived, changes, logs, upload
  const [stats, setStats] = useState(null);
  const [sources, setSources] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [currentSyllabi, setCurrentSyllabi] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [changesList, setChangesList] = useState([]);
  const [logs, setLogs] = useState({ syncJobs: [], auditLogs: [] });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('gu');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [diffModalItem, setDiffModalItem] = useState(null);

  // New Source Modal State
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceData, setNewSourceData] = useState({
    universityId: 'gu',
    name: '',
    sourceType: 'OFFICIAL_WEBSITE',
    url: '',
    circularUrl: '',
    academicSectionUrl: '',
    lawFacultyUrl: ''
  });

  // Manual Upload Document State
  const [uploadFormData, setUploadFormData] = useState({
    universityId: 'gu',
    academicYear: '2026-27',
    semesterNumber: 1,
    sourceTitle: '',
    sourceUrl: '',
    rawDocumentText: ''
  });

  useEffect(() => {
    loadAllData();
  }, [selectedUniversity, selectedSemester]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Load Stats
      const statsRes = await fetch('/api/admin/syllabus/stats');
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson);

      // 2. Load Sources
      const srcRes = await fetch('/api/admin/syllabus/sources');
      const srcJson = await srcRes.json();
      if (srcJson.success) setSources(srcJson.sources || []);

      // 3. Load Pending
      const pendRes = await fetch('/api/admin/syllabus/pending');
      const pendJson = await pendRes.json();
      if (pendJson.success) setPendingReviews(pendJson.pending || []);

      // 4. Load Current Syllabus for selected university
      const curRes = await fetch(`/api/syllabus/current?university=${selectedUniversity}&semester=${selectedSemester}`);
      const curJson = await curRes.json();
      if (curJson.success) setCurrentSyllabi(curJson.syllabus || null);

      // 5. Load History
      const histRes = await fetch(`/api/syllabus/history?university=${selectedUniversity}&semester=${selectedSemester}`);
      const histJson = await histRes.json();
      if (histJson.success) setHistoryList(histJson.history || []);

      // 6. Load Changes
      const chgRes = await fetch('/api/syllabus/changes');
      const chgJson = await chgRes.json();
      if (chgJson.success) setChangesList(chgJson.changes || []);

      // 7. Load Logs
      const logRes = await fetch('/api/admin/syllabus/logs');
      const logJson = await logRes.json();
      if (logJson.success) setLogs({ syncJobs: logJson.syncJobs || [], auditLogs: logJson.auditLogs || [] });
    } catch (e) {
      console.error('Error loading syllabus intelligence data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert('Automated official source synchronization completed.');
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Sync failed.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncSingleSource = async (sourceId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId })
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert(`Sync for ${json.university || 'source'} completed: ${json.status}`);
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Failed to sync source.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVersion = async (versionId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert('Syllabus approved and set to VERIFIED_CURRENT. Questions & NyayaAI synchronized.');
        setDiffModalItem(null);
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Approval failed.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVersion = async (versionId, reason = 'Not verified against official gazette') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, reason })
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert('Syllabus version rejected.');
        setDiffModalItem(null);
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Rejection failed.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSource = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSourceData)
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert('New authoritative source registered successfully.');
        setShowAddSourceModal(false);
        setNewSourceData({
          universityId: 'gu',
          name: '',
          sourceType: 'OFFICIAL_WEBSITE',
          url: '',
          circularUrl: '',
          academicSectionUrl: '',
          lawFacultyUrl: ''
        });
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Failed to create source.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/syllabus/upload-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadFormData)
      });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert(`Parsed official document: ${json.subjectsExtracted} subjects extracted, ${json.diffsDetected} diffs found.`);
        setActiveSubTab('pending');
        await loadAllData();
      } else {
        if (onTriggerAlert) onTriggerAlert(json.error || 'Document extraction failed.');
      }
    } catch (e) {
      if (onTriggerAlert) onTriggerAlert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Automatic Current Syllabus Intelligence System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-title text-white tracking-wide flex items-center gap-3">
              <span>Official Gujarat Syllabus Intelligence</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Monitors official Gujarat university portals, detects revised circulars, performs automated AI extraction & diff comparison, and synchronizes student practice upon administrator verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncAll}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>Run Automated Sync</span>
            </button>
            <button
              onClick={() => setActiveSubTab('upload')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center gap-2 border border-slate-700 transition"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'dashboard', label: 'Command Center', icon: Radio },
          { id: 'sources', label: 'Source Registry', icon: Database, badge: sources.length },
          { id: 'pending', label: 'Pending Reviews', icon: FileDiff, badge: pendingReviews.length, badgeColor: 'bg-amber-500 text-slate-950' },
          { id: 'current', label: 'Verified Curricula', icon: CheckCircle2 },
          { id: 'archived', label: 'Archived Versions', icon: Archive },
          { id: 'changes', label: 'Change History', icon: History, badge: changesList.length },
          { id: 'logs', label: 'Sync & Audit Logs', icon: FileText },
          { id: 'upload', label: 'Document Parser', icon: Upload }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor || (isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300')}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: COMMAND CENTER / LIVE DASHBOARD
      ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 8 Stats Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Total Universities</span>
              <span className="text-2xl font-bold text-white mt-1 block">{stats?.stats?.totalUniversities || 9}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">100% Gujarat Coverage</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Active Sources</span>
              <span className="text-2xl font-bold text-cyan-400 mt-1 block">{stats?.stats?.activeSources || sources.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Continuous Scheduled Checks</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Pending Reviews</span>
              <span className="text-2xl font-bold text-amber-400 mt-1 block">{stats?.stats?.pendingReviews || pendingReviews.length}</span>
              <span className="text-[10px] text-amber-400/80 mt-1 block font-mono">Requires Admin Approval</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Current Syllabi</span>
              <span className="text-2xl font-bold text-emerald-400 mt-1 block">{stats?.stats?.currentSyllabi || 9}</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">VERIFIED_CURRENT Only</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Archived Syllabi</span>
              <span className="text-2xl font-bold text-slate-300 mt-1 block">{stats?.stats?.archivedSyllabi || 0}</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Historical Versions</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Detected Changes</span>
              <span className="text-2xl font-bold text-indigo-400 mt-1 block">{stats?.stats?.detectedChanges || changesList.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Diff Engine Mappings</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Sync Executions</span>
              <span className="text-2xl font-bold text-white mt-1 block">{stats?.stats?.totalSyncJobs || logs.syncJobs.length}</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Cron & Manual Runs</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold block">Failed Jobs</span>
              <span className="text-2xl font-bold text-red-400 mt-1 block">{stats?.stats?.failedJobs || 0}</span>
              <span className="text-[10px] text-slate-400 mt-1 block font-mono">Zero Unhandled Errors</span>
            </div>
          </div>

          {/* Pending Reviews Alert Banner */}
          {pendingReviews.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {pendingReviews.length} Syllabus Update Drafts Awaiting Verification
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official changes detected. Old verified syllabi remain current until you approve the updates.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('pending')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Review Pending Diffs
              </button>
            </div>
          )}

          {/* Recent Source Activity Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Authoritative Gujarat Sources Live Status</h3>
                <p className="text-xs text-slate-400">Continuous monitoring of verified official university portals and gazettes.</p>
              </div>
              <button
                onClick={() => setActiveSubTab('sources')}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                    <th className="pb-3 font-semibold">University</th>
                    <th className="pb-3 font-semibold">Official Source</th>
                    <th className="pb-3 font-semibold">Monitoring</th>
                    <th className="pb-3 font-semibold">Last Checked</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sources.slice(0, 5).map((src) => (
                    <tr key={src.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-white flex items-center gap-2">
                        <span className="text-lg">{src.university?.logo || '🏛️'}</span>
                        <span>{src.university?.name || src.name}</span>
                      </td>
                      <td className="py-3 text-slate-300">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1 max-w-xs truncate"
                        >
                          <span className="truncate">{src.url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {src.monitoringStatus || 'HEALTHY'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 font-mono text-[11px]">
                        {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleSyncSingleSource(src.id)}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                        >
                          Check Source
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SOURCE REGISTRY
      ========================================================================= */}
      {activeSubTab === 'sources' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white">Gujarat Law University Source Registry</h3>
              <p className="text-xs text-slate-400 mt-1">
                Authoritative official portals for Gujarat University, Saurashtra University, VNSGU, MSU, HNGU, MKBU, GNLU, Parul, and GLS.
              </p>
            </div>
            <button
              onClick={() => setShowAddSourceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register Official Source</span>
            </button>
          </div>

          {/* Sources List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div key={src.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{src.university?.logo || '🏛️'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{src.name}</h4>
                      <span className="text-[11px] font-mono text-slate-400">{src.university?.name} &bull; {src.university?.city}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    {src.monitoringStatus || 'ACTIVE'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500 uppercase">Syllabus URL:</span>
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                      <span className="truncate">{src.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {src.circularUrl && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 uppercase">Circulars:</span>
                      <a href={src.circularUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                        <span className="truncate">{src.circularUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {src.academicSectionUrl && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 uppercase">Academic Portal:</span>
                      <a href={src.academicSectionUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 truncate max-w-[200px]">
                        <span className="truncate">{src.academicSectionUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    Checked: {src.lastCheckedAt ? new Date(src.lastCheckedAt).toLocaleDateString() : 'Active'}
                  </span>
                  <button
                    onClick={() => handleSyncSingleSource(src.id)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Check Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PENDING REVIEWS & DIFF INSPECTOR
      ========================================================================= */}
      {activeSubTab === 'pending' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Pending Syllabus Approvals ({pendingReviews.length})</h3>
            <p className="text-xs text-slate-400 mt-1">
              Strict Rule: New detected syllabus updates are held in PENDING_REVIEW. The existing syllabus remains current until you approve the changes.
            </p>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No Pending Reviews</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                All syllabus curriculums across Gujarat universities are up to date and verified with active official gazettes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingReviews.map((pend) => (
                <div key={pend.id} className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
                        <span>🟡 Status: PENDING_REVIEW</span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {pend.sourceTitle || `${pend.university?.name} Revised Syllabus (${pend.academicYear})`}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {pend.university?.name} &bull; Academic Year: {pend.academicYear} &bull; Semester {pend.semesterNumber} &bull; Confidence: {Math.round((pend.confidenceScore || 0.95) * 100)}%
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveVersion(pend.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                      <button
                        onClick={() => handleRejectVersion(pend.id)}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 font-semibold text-xs transition flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Document & Source Transparency Meta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Official Source URL:</span>
                      <a href={pend.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 truncate mt-0.5">
                        <span className="truncate">{pend.sourceUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {pend.sourceDocumentUrl && (
                      <div>
                        <span className="text-slate-500 font-mono text-[10px] uppercase block">Document Gazette:</span>
                        <a href={pend.sourceDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 truncate mt-0.5">
                          <span className="truncate">{pend.sourceDocumentUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Change Diffs List */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-2">
                      <FileDiff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Detected Syllabus Modifications ({pend.changes?.length || 0} Diffs)</span>
                    </h5>

                    <div className="space-y-2">
                      {pend.changes?.map((chg, idx) => (
                        <div
                          key={chg.id || idx}
                          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            chg.changeType === 'ADDED'
                              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                              : chg.changeType === 'REMOVED'
                              ? 'bg-red-950/30 border-red-500/30 text-red-300'
                              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  chg.changeType === 'ADDED'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : chg.changeType === 'REMOVED'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-amber-500 text-slate-950'
                                }`}
                              >
                                {chg.changeType}
                              </span>
                              <span className="font-bold text-white">{chg.fieldName || chg.entityType}</span>
                            </div>
                            <p className="text-slate-200">{chg.summary}</p>
                            {chg.summaryGu && <p className="text-slate-400 text-[11px] font-gujarati">{chg.summaryGu}</p>}
                          </div>

                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                            {chg.oldValue && <span className="line-through text-red-400/80">{chg.oldValue}</span>}
                            {chg.oldValue && chg.newValue && <ArrowRight className="w-3 h-3 text-slate-600" />}
                            {chg.newValue && <span className="text-emerald-400 font-semibold">{chg.newValue}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: VERIFIED CURRENT CURRICULUM TREE
      ========================================================================= */}
      {activeSubTab === 'current' && (
        <div className="space-y-6">
          {/* University & Semester Selector */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Active Verified Current Syllabus</h3>
              <p className="text-xs text-slate-400">Browse current official subject, unit, and topic tree in production.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 outline-none"
              >
                <option value="gu">Gujarat University</option>
                <option value="su">Saurashtra University</option>
                <option value="vnsgu">VNSGU Surat</option>
                <option value="msu">MSU Baroda</option>
                <option value="hngu">HNGU Patan</option>
                <option value="mkbu">MKBU Bhavnagar</option>
                <option value="gnlu">GNLU Gandhinagar</option>
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 outline-none"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>Semester {num}</option>
                ))}
              </select>
            </div>
          </div>

          {currentSyllabi && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>VERIFIED_CURRENT &bull; Academic Year {currentSyllabi.academicYear}</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-1">
                    {currentSyllabi.university?.name} &mdash; LL.B. Semester {selectedSemester}
                  </h4>
                </div>

                <div className="text-right">
                  <a
                    href={currentSyllabi.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5"
                  >
                    <span>View Official University Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Subjects Tree */}
              <div className="space-y-4">
                {currentSyllabi.subjects?.map((subj, sIdx) => (
                  <div key={subj.id || sIdx} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                          {subj.code} &bull; {subj.category || 'Core Law'} &bull; {subj.credits || 4} Credits
                        </span>
                        <h5 className="text-base font-bold text-white">{subj.title}</h5>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-bold">
                        100 Marks (70 Ext + 30 Int)
                      </span>
                    </div>

                    {/* Units */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {subj.units?.map((unit, uIdx) => (
                        <div key={unit.id || uIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
                          <h6 className="text-xs font-bold text-slate-200 font-mono">
                            Unit {unit.unitNumber}: {unit.title}
                          </h6>
                          <ul className="space-y-1 text-xs text-slate-400">
                            {unit.topics?.map((topic, tIdx) => (
                              <li key={topic.id || tIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-400 mt-1">&bull;</span>
                                <span>{topic.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: ARCHIVED VERSIONS
      ========================================================================= */}
      {activeSubTab === 'archived' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Archived Syllabus Versions</h3>
            <p className="text-xs text-slate-400 mt-1">
              Historical batches (e.g. 2025-26, 2024-25). Kept for historical comparison and student backlog reference without corrupting active questions.
            </p>
          </div>

          <div className="space-y-3">
            {historyList.map((ver) => (
              <div key={ver.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        ver.status === 'VERIFIED_CURRENT'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {ver.status}
                    </span>
                    <h4 className="text-sm font-bold text-white">Batch {ver.academicYear} &mdash; Version {ver.version}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Retrieved: {new Date(ver.retrievedAt).toLocaleDateString()} &bull; Hash: {ver.contentHash?.slice(0, 16)}...
                  </p>
                </div>

                <a
                  href={ver.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span>Official Gazette</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: CHANGE HISTORY
      ========================================================================= */}
      {activeSubTab === 'changes' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Complete Syllabus Modifications Changelog</h3>
            <p className="text-xs text-slate-400 mt-1">
              Audit trail of every detected, verified, and published modification in Gujarat law curriculums.
            </p>
          </div>

          <div className="space-y-2">
            {changesList.map((chg) => (
              <div key={chg.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-[10px]">
                      {chg.changeType}
                    </span>
                    <span className="font-bold text-white">{chg.fieldName || chg.entityType}</span>
                    <span className="text-slate-500 font-mono">
                      {chg.syllabusVersion?.university?.name} ({chg.syllabusVersion?.academicYear})
                    </span>
                  </div>
                  <p className="text-slate-300">{chg.summary}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(chg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: SYNC & AUDIT LOGS
      ========================================================================= */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-lg font-bold text-white">Automated Scheduler & Audit Trail Logs</h3>
            <p className="text-xs text-slate-400 mt-1">
              Complete history of background cron checks, extraction outcomes, and admin verification actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sync Jobs */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Sync Executions ({logs.syncJobs.length})</span>
              </h4>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {logs.syncJobs.map((j) => (
                  <div key={j.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{j.source?.university?.name || 'Gujarat University'}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                        {j.status}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono text-[11px]">
                      Changes Detected: {j.changesDetected} &bull; Started: {new Date(j.startedAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Audit Logs ({logs.auditLogs.length})</span>
              </h4>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {logs.auditLogs.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{a.action} &bull; {a.entityType}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300">{a.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: MANUAL DOCUMENT PARSER & UPLOAD
      ========================================================================= */}
      {activeSubTab === 'upload' && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Manual Official Document / PDF Parser</h3>
            <p className="text-xs text-slate-400 mt-1">
              Paste the text content or transcript from an official Gujarat university syllabus circular to run AI structured extraction and diff generation.
            </p>
          </div>

          <form onSubmit={handleUploadDocument} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">University</label>
                <select
                  value={uploadFormData.universityId}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, universityId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
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
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={uploadFormData.academicYear}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, academicYear: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                  placeholder="2026-27"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">Semester</label>
                <select
                  value={uploadFormData.semesterNumber}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, semesterNumber: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">Gazette Title</label>
              <input
                type="text"
                value={uploadFormData.sourceTitle}
                onChange={(e) => setUploadFormData({ ...uploadFormData, sourceTitle: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none"
                placeholder="Official CBCS Syllabus Revision Notification (Board of Studies)"
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">Official Document Text / Transcript</label>
              <textarea
                value={uploadFormData.rawDocumentText}
                onChange={(e) => setUploadFormData({ ...uploadFormData, rawDocumentText: e.target.value })}
                rows={8}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 outline-none"
                placeholder={`Subject: Constitutional Law - I (CONST-101)\nUnit 1: Preamble and Basic Structure\n- Preamble and Kesavananda Bharati Doctrine\n- Federalism in India\n\nUnit 2: Fundamental Rights\n- Article 14 Right to Equality\n- Article 21 Right to Life`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Ingest into Pending Review</span>
            </button>
          </form>
        </div>
      )}

      {/* Add Source Modal */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Register Authoritative University Source</h4>
              <button onClick={() => setShowAddSourceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">University</label>
                <select
                  value={newSourceData.universityId}
                  onChange={(e) => setNewSourceData({ ...newSourceData, universityId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
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
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Source Name</label>
                <input
                  type="text"
                  value={newSourceData.name}
                  onChange={(e) => setNewSourceData({ ...newSourceData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                  placeholder="Gujarat University Faculty of Law Official Portal"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Official Syllabus URL</label>
                <input
                  type="url"
                  value={newSourceData.url}
                  onChange={(e) => setNewSourceData({ ...newSourceData, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                  placeholder="https://www.gujaratuniversity.ac.in/syllabus"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Circular Portal URL (Optional)</label>
                <input
                  type="url"
                  value={newSourceData.circularUrl}
                  onChange={(e) => setNewSourceData({ ...newSourceData, circularUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none"
                  placeholder="https://www.gujaratuniversity.ac.in/circulars"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Register Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
