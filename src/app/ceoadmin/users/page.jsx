"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  ArrowUpDown,
  History,
  CheckCircle2,
  XCircle,
  Chrome,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Clock,
  Compass,
  FileText,
  ShieldAlert,
} from 'lucide-react';

export default function CeoAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // User Journey Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        provider: providerFilter,
        status: statusFilter,
        dateRange: dateFilter,
      });

      const res = await fetch(`/api/ceoadmin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setPagination(data.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, providerFilter, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchUsers();
  };

  const openUserJourney = async (userId) => {
    setSelectedUserId(userId);
    setJourneyLoading(true);
    setJourneyData(null);
    try {
      const res = await fetch(`/api/ceoadmin/users/${userId}/activity`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setJourneyData(data);
        }
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
    } finally {
      setJourneyLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            User Management &amp; Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of registered students and administrators with individual chronological activity tracking.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-semibold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
          Total Registered: <span className="text-amber-400 font-bold">{pagination.total}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or user ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Auth Provider"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Providers</option>
              <option value="google">Google Only</option>
              <option value="credentials">Email / Password</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Status"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Registration Date"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Time</option>
              <option value="today">Registered Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student / User</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Auth Provider</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No users matching the selected filters.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{u.fullName || 'Law Student'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 font-medium text-slate-300">
                      {u.email}
                    </td>

                    {/* Auth Provider */}
                    <td className="px-4 py-3.5">
                      {u.provider === 'google' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          <Chrome className="w-3 h-3" />
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Mail className="w-3 h-3" />
                          Email
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {u.lastActiveAt ? (
                        <span className="text-emerald-400">
                          {new Date(u.lastActiveAt).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openUserJourney(u.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-amber-400" />
                        <span>User Journey</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{pagination.page}</span> of{' '}
            <span className="text-white font-bold">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Journey Chronological Timeline Modal (Section 14) */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Student Activity &amp; Journey Timeline</span>
                </h3>
                {journeyData?.user && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {journeyData.user.fullName} ({journeyData.user.email})
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {journeyLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
                  <p className="text-xs">Reconstructing chronological student journey...</p>
                </div>
              ) : !journeyData?.timeline || journeyData.timeline.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-12">No activity recorded for this student yet.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                  {journeyData.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-amber-400 group-hover:scale-125 transition-transform" />

                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{event.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                            {event.badge || event.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
