"use client";

import { useState, useEffect } from 'react';
import {
  Activity,
  Eye,
  LogIn,
  RefreshCw,
  Clock,
  Compass,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function CeoAdminActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/ceoadmin/activity');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setActivity(json.activity);
        }
      }
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchActivity();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredActivity = activity.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'views') return item.type === 'PAGE_VIEW';
    if (filter === 'logins') return item.type === 'LOGIN';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-amber-400" />
            <span>Live Student Activity Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time feed of student logins, course navigation, and legal topic exploration across LowStudy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
            />
            <span>Auto-refresh (10s)</span>
          </label>

          <button
            onClick={() => fetchActivity()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Events ({activity.length})
        </button>
        <button
          onClick={() => setFilter('views')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'views'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Page Views
        </button>
        <button
          onClick={() => setFilter('logins')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'logins'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Logins
        </button>
      </div>

      {/* Stream List */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl p-6">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
            <p className="text-xs">Connecting to live activity telemetry...</p>
          </div>
        ) : filteredActivity.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-16">No events matching the filter.</p>
        ) : (
          <div className="space-y-3">
            {filteredActivity.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.type === 'PAGE_VIEW'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : item.success
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {item.type === 'PAGE_VIEW' ? (
                      <Compass className="w-4 h-4" />
                    ) : item.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-white">{item.title}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-amber-400 font-medium">{item.user}</span>
                      {item.path && <span className="font-mono text-slate-500">{item.path}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-500 text-[11px] font-mono sm:self-center">
                  {item.deviceType && (
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {item.deviceType}
                    </span>
                  )}
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
