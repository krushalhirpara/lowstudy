"use client";

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Eye,
  Users,
  Layers,
  ArrowUpDown,
  Laptop,
  Smartphone,
  Tablet,
  Calendar,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';

const RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
];

export default function CeoAdminAnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [sortBy, setSortBy] = useState('views');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range, sortBy });
      const res = await fetch(`/api/ceoadmin/analytics?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, sortBy]);

  const summary = data?.summary || {};
  const topPages = data?.topPages || [];
  const recentActivity = data?.recentActivity || [];
  const devices = data?.devices || { desktop: 0, mobile: 0, tablet: 0 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Page Views &amp; Traffic Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            First-party internal telemetry for student content navigation, syllabus engagement, and subject exploration.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                range === r.value
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Page Views</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{summary.totalViews ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Recorded in selected time window</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{summary.uniqueUsers ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Distinct authenticated & guest visitors</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sessions</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{summary.totalSessions ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Distinct browser sessions</div>
        </div>
      </div>

      {/* Section 13: Most Visited Pages Table */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>Most Visited Pages</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked breakdown of highest traffic curriculum, practice, and reference pages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortBy('views')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sortBy === 'views'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Views
            </button>
            <button
              onClick={() => setSortBy('uniqueUsers')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sortBy === 'uniqueUsers'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Unique Users
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 w-16">Rank</th>
                <th className="px-4 py-3">Page / Path</th>
                <th className="px-4 py-3 text-right">Views</th>
                <th className="px-4 py-3 text-right">Unique Users</th>
                <th className="px-4 py-3 text-right">Last Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Analyzing page telemetry...</span>
                  </td>
                </tr>
              ) : topPages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No page views recorded in the selected period.
                  </td>
                </tr>
              ) : (
                topPages.map(page => (
                  <tr key={page.path} className="hover:bg-slate-800/40 transition-colors">
                    {/* Rank */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">
                      #{page.rank}
                    </td>

                    {/* Page */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{page.pageTitle || page.path}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{page.path}</div>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-right font-bold text-amber-400">
                      {page.views.toLocaleString()}
                    </td>

                    {/* Unique Users */}
                    <td className="px-4 py-3 text-right font-medium text-slate-200">
                      {page.uniqueUsers.toLocaleString()}
                    </td>

                    {/* Last Visited */}
                    <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                      {page.lastVisited ? new Date(page.lastVisited).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Breakdown: Device Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Device Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-200">Desktop</span>
              </div>
              <span className="text-xs font-bold text-white">{devices.desktop}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-200">Mobile</span>
              </div>
              <span className="text-xs font-bold text-white">{devices.mobile}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Tablet className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-200">Tablet</span>
              </div>
              <span className="text-xs font-bold text-white">{devices.tablet}</span>
            </div>
          </div>
        </div>

        {/* Recent Page Navigation Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Recent Page Views</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No recent page navigation.</p>
            ) : (
              recentActivity.slice(0, 15).map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-slate-300 font-medium truncate">
                      {item.pageTitle || item.path}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      {item.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-slate-400">
                    <span>{item.user?.fullName || 'Guest'}</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
