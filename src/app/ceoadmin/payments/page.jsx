"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Building2,
  BookOpen,
  User,
  Phone,
  Mail,
  Receipt
} from 'lucide-react';
import { GUJARAT_UNIVERSITIES } from '@/data/gujaratData';

export default function ExamPrepPaymentsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [universityFilter, setUniversityFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modal & action state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '25');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      if (universityFilter !== 'ALL') params.set('universityId', universityFilter);
      if (semesterFilter !== 'ALL') params.set('semesterId', semesterFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const res = await fetch(`/api/ceoadmin/payments?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch admin exam prep payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search, universityFilter, semesterFilter, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCopy = (text, id) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setUniversityFilter('ALL');
    setSemesterFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleGrantEntitlement = async (userId) => {
    if (!confirm('Are you sure you want to manually grant an active Exam Prep Pass entitlement to this student?')) return;
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/ceoadmin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_entitlement',
          userId,
          reason: 'Manual grant by CEO Admin',
        })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: 'Active Exam Prep Pass entitlement granted successfully.' });
        fetchPayments();
        if (selectedOrder) setSelectedOrder(null);
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Failed to grant entitlement.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRevokeEntitlement = async (userId) => {
    if (!revokeReason) {
      alert('Please enter a reason for revocation.');
      return;
    }
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/ceoadmin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_entitlement',
          userId,
          reason: revokeReason,
        })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: 'Exam Prep Pass access revoked successfully.' });
        setRevokeReason('');
        fetchPayments();
        if (selectedOrder) setSelectedOrder(null);
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Failed to revoke entitlement.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleProcessRefund = async (orderId) => {
    if (!refundReason) {
      alert('Please enter a reason for initiating this refund.');
      return;
    }
    if (!confirm(`Are you sure you want to process a full refund for Order ${orderId}? This will automatically revoke student Exam Prep access immediately.`)) return;

    setIsActionLoading(true);
    try {
      const res = await fetch('/api/ceoadmin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          orderId,
          reason: refundReason,
        })
      });
      const json = await res.json();
      if (json.success) {
        setActionMessage({ type: 'success', text: 'Refund recorded and access revoked successfully.' });
        setRefundReason('');
        setSelectedOrder(null);
        fetchPayments();
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Refund failed.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());
    if (universityFilter !== 'ALL') params.set('universityId', universityFilter);
    if (semesterFilter !== 'ALL') params.set('semesterId', semesterFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    window.open(`/api/ceoadmin/payments/export?${params.toString()}`, '_blank');
  };

  const kpis = data?.kpis || {};
  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>LowStudy Financial Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>Exam Prep Payments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time Razorpay ₹299 order transactions, verified student contact details, payment status, and entitlement access audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPayments}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/40 border border-red-800 text-red-300'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* 1. Total Successful Payments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Successful Payments</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {kpis.capturedOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Active Entitlements: <strong className="text-emerald-300">{kpis.activeEntitlements ?? 0}</strong>
          </div>
        </div>

        {/* 2. Total Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{kpis.netRevenueInr?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-400">
            Gross: <strong className="text-slate-300">₹{kpis.grossRevenueInr?.toLocaleString() || '0'}</strong>
          </div>
        </div>

        {/* 3. Pending Payments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Pending Payments</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {kpis.pendingOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Awaiting verification or checkout
          </div>
        </div>

        {/* 4. Failed Payments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Failed Payments</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-400">
            {kpis.failedOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Signature mismatch or bank drop
          </div>
        </div>

        {/* 5. Refunded Payments */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Refunded Payments</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {kpis.refundedOrders ?? 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Refunded: <strong className="text-purple-300">₹{kpis.refundedRevenueInr?.toLocaleString() || '0'}</strong>
          </div>
        </div>

      </div>

      {/* Multi-Parameter Filter & Search Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name, contact number, email, Razorpay ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {[
              { id: 'ALL', label: 'All Statuses' },
              { id: 'SUCCESS', label: 'Success' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'FAILED', label: 'Failed' },
              { id: 'REFUNDED', label: 'Refunded' },
            ].map(st => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatusFilter(st.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

        </div>

        {/* Secondary Filters: University, Semester, Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* University Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">University</label>
            <select
              value={universityFilter}
              onChange={(e) => {
                setUniversityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Gujarat Universities</option>
              {GUJARAT_UNIVERSITIES.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Semester</label>
            <select
              value={semesterFilter}
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Semesters</option>
              <option value="sem1">Semester 1</option>
              <option value="sem2">Semester 2</option>
              <option value="sem3">Semester 3</option>
              <option value="sem4">Semester 4</option>
              <option value="sem5">Semester 5</option>
              <option value="sem6">Semester 6</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* End Date & Reset */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-400">End Date</label>
              {(search || statusFilter !== 'ALL' || universityFilter !== 'ALL' || semesterFilter !== 'ALL' || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

        </div>
      </div>

      {/* Main Exam Prep Payments Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Contact Number</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">University / College</th>
                <th className="p-4">Course</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Payment Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Razorpay Payment ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Payment Date & Time</th>
                <th className="p-4">Access Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                      <span>Loading Exam Prep payments...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-slate-500">
                    No payment records match your search or filter parameters.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* 1. Student Name */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                          {o.studentName ? o.studentName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="font-bold text-white leading-snug">{o.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">UID: {o.userId?.slice(-6)}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Contact Number */}
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      {o.contactNumber !== 'N/A' ? (
                        <a href={`tel:${o.contactNumber}`} className="hover:text-amber-400 transition">
                          {o.contactNumber}
                        </a>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>

                    {/* 3. Email Address */}
                    <td className="p-4 font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                      {o.email}
                    </td>

                    {/* 4. University / College */}
                    <td className="p-4 max-w-[200px]">
                      <div className="font-semibold text-slate-200 truncate" title={o.university}>
                        {o.university}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" title={o.college}>
                        {o.college}
                      </div>
                    </td>

                    {/* 5. Course */}
                    <td className="p-4 font-medium text-slate-300">
                      {o.course}
                    </td>

                    {/* 6. Semester */}
                    <td className="p-4 font-mono text-[11px] text-slate-300">
                      {o.semester}
                    </td>

                    {/* 7. Payment Amount */}
                    <td className="p-4 font-extrabold text-amber-400 text-sm font-mono">
                      ₹{o.amountInr}
                    </td>

                    {/* 8. Payment Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.displayStatus === 'Success'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : o.displayStatus === 'Pending'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : o.displayStatus === 'Refunded'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {o.displayStatus === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                        {o.displayStatus === 'Pending' && <Clock className="w-3 h-3" />}
                        {o.displayStatus === 'Refunded' && <RotateCcw className="w-3 h-3" />}
                        {o.displayStatus === 'Failed' && <AlertTriangle className="w-3 h-3" />}
                        <span>{o.displayStatus}</span>
                      </span>
                    </td>

                    {/* 9. Razorpay Payment ID */}
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {o.razorpayPaymentId !== 'N/A' ? (
                        <div className="flex items-center gap-1.5">
                          <span>{o.razorpayPaymentId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(o.razorpayPaymentId, o.id + '_pay')}
                            className="p-1 hover:text-white transition"
                            title="Copy Payment ID"
                          >
                            {copiedId === o.id + '_pay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* 10. Order ID */}
                    <td className="p-4 font-mono text-[11px] text-slate-400 truncate max-w-[140px]">
                      <div className="flex items-center gap-1.5">
                        <span title={o.orderId}>{o.orderId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(o.orderId, o.id + '_ord')}
                          className="p-1 hover:text-white transition"
                          title="Copy Order ID"
                        >
                          {copiedId === o.id + '_ord' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* 11. Payment Date & Time */}
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {o.paymentDate ? new Date(o.paymentDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </td>

                    {/* 12. Exam Prep Pass Access Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          o.accessStatus === 'Active'
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                            : 'text-red-400 bg-red-950/40 border border-red-800/60'
                        }`}
                      >
                        {o.accessStatus === 'Active' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        <span>{o.accessStatus}</span>
                      </span>
                    </td>

                    {/* 13. Actions */}
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
                      >
                        Inspect
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} matching records)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Previous
              </button>
              <span className="font-mono px-2">Page {page}</span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Inspection & Administrative Action Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <span>Exam Prep Payment Audit: {selectedOrder.orderId}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Detailed transaction metadata and verified entitlement governance.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student & Academic Profile */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Student Identity & Academic Enrollment</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Full Name:</span>
                  <span className="font-bold text-white">{selectedOrder.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone:</span>
                  <span className="font-mono text-white">{selectedOrder.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email Address:</span>
                  <span className="font-mono text-white">{selectedOrder.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">User Account ID:</span>
                  <span className="font-mono text-slate-400">{selectedOrder.userId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">University:</span>
                  <span className="text-slate-200 font-medium">{selectedOrder.university}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">College:</span>
                  <span className="text-slate-200 font-medium">{selectedOrder.college}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Course:</span>
                  <span className="text-slate-200">{selectedOrder.course}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Semester:</span>
                  <span className="text-slate-200">{selectedOrder.semester}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Razorpay Financial Data</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Payment Amount:</span>
                  <span className="font-bold text-amber-400 text-sm">₹{selectedOrder.amountInr} {selectedOrder.currency}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Status:</span>
                  <span className="font-bold uppercase text-white">{selectedOrder.displayStatus} ({selectedOrder.status})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Razorpay Payment ID:</span>
                  <span className="font-mono text-white">{selectedOrder.razorpayPaymentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Razorpay Order ID:</span>
                  <span className="font-mono text-white">{selectedOrder.razorpayOrderId || selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Created Timestamp:</span>
                  <span className="font-mono text-slate-400">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Verified Timestamp:</span>
                  <span className="font-mono text-emerald-400">{selectedOrder.verifiedAt ? new Date(selectedOrder.verifiedAt).toLocaleString('en-IN') : 'Not Verified'}</span>
                </div>
                {selectedOrder.failureReason && (
                  <div className="sm:col-span-2">
                    <span className="text-red-400 font-semibold block">Failure Reason:</span>
                    <span className="text-red-300 font-mono">{selectedOrder.failureReason}</span>
                  </div>
                )}
                {selectedOrder.refundedAt && (
                  <div className="sm:col-span-2">
                    <span className="text-purple-400 font-semibold block">Refund Details:</span>
                    <span className="text-purple-300">Refunded ₹{selectedOrder.refundAmount || selectedOrder.amountInr} on {new Date(selectedOrder.refundedAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Access & Entitlement Governance */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exam Prep Pass Entitlement Status: {selectedOrder.accessStatus}</span>
              </div>

              {selectedOrder.displayStatus === 'Success' && selectedOrder.accessStatus === 'Active' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Process Full Refund & Revoke Access:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter refund reason..."
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleProcessRefund(selectedOrder.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        Refund ₹{selectedOrder.amountInr}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-900">
                    <label className="block text-[11px] text-slate-400 mb-1">Administrative Access Revocation:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter revocation reason..."
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500"
                      />
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleRevokeEntitlement(selectedOrder.userId)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                      >
                        Revoke Pass
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current access state is not active.</span>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleGrantEntitlement(selectedOrder.userId)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    Manually Grant Active Pass
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
