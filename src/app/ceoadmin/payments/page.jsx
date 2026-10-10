"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Calendar,
  Eye,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [revokeReason, setRevokeReason] = useState('');

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/ceoadmin/payments?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch admin payments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleGrantEntitlement = async (userId) => {
    if (!confirm('Are you sure you want to manually grant an active Exam Prep Pass entitlement to this user?')) return;
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
        setActionMessage({ type: 'success', text: 'Entitlement granted successfully.' });
        fetchPayments();
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
        setActionMessage({ type: 'success', text: 'Entitlement revoked successfully.' });
        setRevokeReason('');
        fetchPayments();
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
    if (!confirm(`Are you sure you want to process a full refund for Order ${orderId}? This will revoke access immediately.`)) return;

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
        setActionMessage({ type: 'success', text: 'Refund processed successfully.' });
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
    window.open('/api/ceoadmin/payments/export', '_blank');
  };

  const kpis = data?.kpis || {};
  const orders = data?.orders || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-8">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-amber-400" />
            <span>Payments & Financial Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Razorpay order management, transaction status, revenue audit, and entitlement governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPayments}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
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

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Revenue */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Net Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
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

        {/* Captured Orders */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Captured Orders</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {kpis.capturedOrders || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Active Entitlements: <strong className="text-emerald-400">{kpis.activeEntitlements || 0}</strong>
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Today's Sales</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ₹{kpis.revenueTodayInr?.toLocaleString() || '0'}
          </div>
          <div className="text-[11px] text-slate-400">
            Orders Today: <strong className="text-slate-300">{kpis.ordersToday || 0}</strong>
          </div>
        </div>

        {/* Pending & Refunds */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Pending & Refunds</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-200">
            {kpis.pendingOrders || 0}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Refunds: <strong className="text-red-400">{kpis.refundedOrders || 0}</strong></span>
            <span>•</span>
            <span>Failed: <strong className="text-red-400">{kpis.failedOrders || 0}</strong></span>
          </div>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, name, order ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'CAPTURED', 'PENDING', 'FAILED', 'REFUNDED'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Student</th>
                <th className="p-4">Product</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Entitlement</th>
                <th className="p-4">Razorpay ID</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{o.user?.fullName || 'Anonymous Student'}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">{o.user?.email}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">
                      Exam Prep Pass
                    </td>
                    <td className="p-4 font-bold text-amber-400">
                      ₹{o.amountInr}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'CAPTURED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : o.status === 'REFUNDED'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          o.entitlementStatus === 'ACTIVE'
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/60'
                            : 'text-slate-500 bg-slate-950'
                        }`}
                      >
                        {o.entitlementStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
                      {o.razorpayPaymentId || o.razorpayOrderId || '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} total orders)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Audit Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Order Inspection</span>
                <h3 className="text-base font-bold text-white">Order Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Details Grid */}
            <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-mono text-white text-[11px]">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User Email:</span>
                <span className="font-mono text-white text-[11px]">{selectedOrder.user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono text-slate-300 text-[11px]">{selectedOrder.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-amber-400">₹{selectedOrder.amountInr}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Order ID:</span>
                <span className="font-mono text-slate-300 text-[11px]">{selectedOrder.razorpayOrderId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Payment ID:</span>
                <span className="font-mono text-slate-300 text-[11px]">{selectedOrder.razorpayPaymentId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedOrder.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entitlement Status:</span>
                <span className="font-bold text-white">{selectedOrder.entitlementStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-slate-300">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              {selectedOrder.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified:</span>
                  <span className="text-slate-300">{new Date(selectedOrder.verifiedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Governance Actions */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Administrative Actions (Audited)
              </div>

              {/* 1. Grant / Revoke Entitlement */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300">Access Entitlement Control:</div>
                
                {selectedOrder.entitlementStatus === 'ACTIVE' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Reason for revoking entitlement..."
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleRevokeEntitlement(selectedOrder.userId)}
                      className="w-full py-2.5 px-4 rounded-xl bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Revoke Entitlement
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleGrantEntitlement(selectedOrder.userId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Grant Active Entitlement
                  </button>
                )}
              </div>

              {/* 2. Refund Action (Only if CAPTURED) */}
              {selectedOrder.status === 'CAPTURED' && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Initiate Gateway Refund:</div>
                  <input
                    type="text"
                    placeholder="Reason for refund..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() => handleProcessRefund(selectedOrder.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Process Razorpay Refund (₹{selectedOrder.amountInr})
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
