"use client";

import { useState, useEffect } from 'react';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Chrome,
  Mail,
  ShieldCheck,
  Percent,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
];

export default function CeoAdminLoginsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogins = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ceoadmin/logins?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.error('Error fetching login analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogins();
  }, [range]);

  const metrics = data?.metrics || {};
  const recentEvents = data?.recentEvents || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Authentication &amp; Login Security Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit logging for student Google and Email authentications, failed attempts, and brute-force mitigation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
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

      {/* Metric Cards (Section 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Attempts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Attempts</div>
          <div className="text-2xl font-extrabold text-white mt-2">{metrics.totalAttempts ?? 0}</div>
        </div>

        {/* Successful Logins */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Successful</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">{metrics.successfulLogins ?? 0}</div>
        </div>

        {/* Failed Attempts */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Failed Attempts</div>
          <div className="text-2xl font-extrabold text-red-400 mt-2">{metrics.failedLogins ?? 0}</div>
        </div>

        {/* Success Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Success Rate</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-2">{metrics.successRate ?? 100}%</div>
        </div>

        {/* Google Logins */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Google Logins</div>
          <div className="text-2xl font-extrabold text-white mt-2">{metrics.googleLogins ?? 0}</div>
        </div>

        {/* Email Logins */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Logins</div>
          <div className="text-2xl font-extrabold text-white mt-2">{metrics.emailLogins ?? 0}</div>
        </div>
      </div>

      {/* Authentication Audit Event Log Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Login Event Audit Trail</span>
          </h2>
          <span className="text-xs text-slate-400">
            Showing latest <span className="text-white font-bold">{recentEvents.length}</span> events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-4 py-3.5">User / Email</th>
                <th className="px-4 py-3.5">Auth Method</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Failure Reason</th>
                <th className="px-5 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading authentication logs...</span>
                  </td>
                </tr>
              ) : recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No login events found in this period.
                  </td>
                </tr>
              ) : (
                recentEvents.map(event => (
                  <tr key={event.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {event.success ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          SUCCESS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle className="w-3 h-3" />
                          FAILED
                        </span>
                      )}
                    </td>

                    {/* User / Email */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white">
                        {event.user?.fullName || event.email}
                      </div>
                      <div className="text-[11px] text-slate-400">{event.email}</div>
                    </td>

                    {/* Auth Method */}
                    <td className="px-4 py-3.5">
                      {event.provider === 'google' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-400 font-medium">
                          <Chrome className="w-3 h-3" />
                          Google OAuth
                        </span>
                      ) : event.provider === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Admin Direct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                          <Mail className="w-3 h-3" />
                          Password Credentials
                        </span>
                      )}
                    </td>

                    {/* IP */}
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {event.ipAddress || 'Internal'}
                    </td>

                    {/* Failure Reason */}
                    <td className="px-4 py-3.5 text-[11px]">
                      {event.failureReason ? (
                        <span className="text-red-400 font-medium">{event.failureReason}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px] font-mono">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
