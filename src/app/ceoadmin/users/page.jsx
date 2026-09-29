"use client";

import { useState, useEffect, useCallback } from 'react';
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
  Building2,
  MapPin,
  Download,
  Sparkles,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
} from 'lucide-react';
import { GUJARAT_CITIES } from '@/data/gujaratData';

export default function CeoAdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [universitiesList, setUniversitiesList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters State
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [profileStatusFilter, setProfileStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // User Journey Modal State
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [journeyData, setJourneyData] = useState(null);
  const [journeyLoading, setJourneyLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        provider: providerFilter,
        status: statusFilter,
        city: cityFilter,
        universityId: universityFilter,
        profileStatus: profileStatusFilter,
        dateRange: dateFilter,
      });

      const res = await fetch(`/api/ceoadmin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
          setPagination(data.pagination);
          if (data.stats) setStats(data.stats);
          if (data.universitiesList) setUniversitiesList(data.universitiesList);
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, providerFilter, statusFilter, cityFilter, universityFilter, profileStatusFilter, dateFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchUsers();
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        search,
        provider: providerFilter,
        status: statusFilter,
        city: cityFilter,
        universityId: universityFilter,
        profileStatus: profileStatusFilter,
      });

      const res = await fetch(`/api/ceoadmin/users/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to generate export file.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const todayStr = new Date().toISOString().split('T')[0];
      a.download = `lowstudy-students-${todayStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      alert(err.message || 'Error downloading CSV export');
    } finally {
      setExporting(false);
    }
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

  // Compile available city options from stats and presets
  const availableCities = Array.from(
    new Set([
      ...(stats?.topCities?.map((c) => c.city) || []),
      ...GUJARAT_CITIES,
    ])
  ).sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-poppins">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Private CEO Admin &bull; Restricted Access</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Student User Management &amp; City-University Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time student registry with City, Gujarat Law University affiliations, authentication audit, and user journeys.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Export CSV</span>
          </button>

          <div className="text-xs text-slate-400 font-semibold px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
            Total Students: <span className="text-amber-400 font-bold">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* 1. Summary Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Students */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Students</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              {stats.totalStudents || stats.totalUsers || 0}
            </div>
            <div className="text-[10px] text-slate-500">Registered on LowStudy</div>
          </div>

          {/* Added Today */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added Today</span>
            </div>
            <div className="text-xl font-bold text-emerald-400 tracking-tight">
              +{stats.addedToday || 0}
            </div>
            <div className="text-[10px] text-slate-500">New signups today</div>
          </div>

          {/* Added This Month */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>This Month</span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">
              +{stats.addedThisMonth || 0}
            </div>
            <div className="text-[10px] text-slate-500">Current calendar month</div>
          </div>

          {/* Google Sign-Ins */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Chrome className="w-3.5 h-3.5 text-red-400" />
              <span>Google Sign-In</span>
            </div>
            <div className="text-xl font-bold text-red-400 tracking-tight">
              {stats.googleUsers || 0}
            </div>
            <div className="text-[10px] text-slate-500">Firebase OAuth users</div>
          </div>

          {/* Email Sign-Ins */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Sign-In</span>
            </div>
            <div className="text-xl font-bold text-amber-400 tracking-tight">
              {stats.emailUsers || 0}
            </div>
            <div className="text-[10px] text-slate-500">Credentials accounts</div>
          </div>

          {/* Profile Completion */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Complete Profiles</span>
            </div>
            <div className="text-xl font-bold text-indigo-400 tracking-tight">
              {stats.completeProfiles || 0}
            </div>
            <div className="text-[10px] text-slate-500">
              {stats.incompleteProfiles || 0} incomplete
            </div>
          </div>
        </div>
      )}

      {/* 2. City and University Aggregation Breakdown Panels */}
      {stats && (stats.topCities?.length > 0 || stats.universityCounts?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Cities */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Top Cities (Student Distribution)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.topCities?.length || 0} Cities Recorded
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
              {stats.topCities?.map((c) => (
                <div
                  key={c.city}
                  onClick={() => {
                    setCityFilter(c.city);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    cityFilter === c.city
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="truncate pr-1">{c.city}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold shrink-0">
                    {c.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* University Distribution */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>University-wise Student Count</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.universityCounts?.length || 0} Universities
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {stats.universityCounts?.map((u) => (
                <div
                  key={u.universityId}
                  onClick={() => {
                    setUniversityFilter(u.universityId);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                    universityFilter === u.universityId
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="truncate pr-1">{u.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono text-[10px] font-bold shrink-0">
                    {u.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
          {/* Top Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, city, or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700/70 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {/* University Filter */}
            <select
              value={universityFilter}
              onChange={(e) => {
                setUniversityFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by University"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
            >
              <option value="all">All Universities</option>
              {universitiesList.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.code})
                </option>
              ))}
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by City"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
            >
              <option value="all">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Profile Status Filter */}
            <select
              value={profileStatusFilter}
              onChange={(e) => {
                setProfileStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Profile Status"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Profiles</option>
              <option value="complete">Complete Profile</option>
              <option value="incomplete">Incomplete Profile</option>
            </select>

            {/* Provider Filter */}
            <select
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Auth Provider"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Status"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              aria-label="Filter by Registration Date"
              className="bg-slate-950/70 border border-slate-700/70 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Registered Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
            </select>
          </div>

          {/* Search Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {(cityFilter !== 'all' || universityFilter !== 'all' || profileStatusFilter !== 'all' || providerFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setCityFilter('all');
                    setUniversityFilter('all');
                    setProfileStatusFilter('all');
                    setProviderFilter('all');
                    setStatusFilter('all');
                    setDateFilter('all');
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Apply Search &amp; Filters
            </button>
          </div>
        </form>
      </div>

      {/* 4. Users Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">City</th>
                <th className="px-4 py-3.5">College / University</th>
                <th className="px-4 py-3.5">Signup Date</th>
                <th className="px-4 py-3.5">Last Login</th>
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
                users.map((u) => {
                  const universityDisplay = u.university?.name || u.universityId;
                  const isProfileComplete = Boolean(u.city && universityDisplay);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                            {u.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {u.fullName || 'Student'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email + Provider */}
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-200">{u.email}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {u.provider === 'google' ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <Chrome className="w-2.5 h-2.5" /> Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Mail className="w-2.5 h-2.5" /> Email
                            </span>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3.5">
                        {u.city ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {u.city}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" /> Profile incomplete
                          </span>
                        )}
                      </td>

                      {/* College / University */}
                      <td className="px-4 py-3.5">
                        {u.university ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate max-w-xs">{u.university.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono pl-5">
                              {u.university.code} &bull; {u.university.city}
                            </div>
                          </div>
                        ) : u.universityId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {u.universityId.toUpperCase()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" /> Profile incomplete
                          </span>
                        )}
                      </td>

                      {/* Signup Date */}
                      <td className="px-4 py-3.5 text-slate-400 text-[11px] font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 text-slate-400 text-[11px] font-mono">
                        {u.lastLoginAt ? (
                          new Date(u.lastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        ) : (
                          <span className="text-slate-600">Never</span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <span className="text-white font-bold">{pagination.page}</span> of{' '}
            <span className="text-white font-bold">{pagination.totalPages}</span> (
            <span className="text-amber-400 font-bold">{pagination.total}</span> total matching users)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Journey Chronological Timeline Modal */}
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
                    {journeyData.user.fullName} ({journeyData.user.email}) &bull; {journeyData.user.city || 'City Not Set'} &bull; {journeyData.user.university?.name || journeyData.user.universityId || 'University Not Set'}
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
