"use client";

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Users, AlertCircle, Shield, Award, Zap } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function StudentsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    xp: 0,
    streakDays: 0,
    coins: 0,
    isActive: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        isActive,
      });
      const res = await fetch(`/api/admin/students?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load students');
      setData(json.items || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, isActive]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      fullName: item.fullName || '',
      email: item.email || '',
      xp: item.xp || 0,
      streakDays: item.streakDays || 0,
      coins: item.coins || 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.email.trim()) {
      setFormError('Email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert('Student account updated successfully!');
      loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/students/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete student');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Student account removed!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Student Name & Email',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.fullName || 'Anonymous Student'}</span>
          <span className="text-[11px] text-slate-400 font-mono">{item.email}</span>
        </div>
      ),
    },
    {
      header: 'University / Course',
      render: (item) => (
        <div className="text-xs text-slate-300">
          <span className="block font-medium">{item.university?.code || 'Self Study'}</span>
          <span className="text-[11px] text-slate-400 font-mono">{item.course?.code || 'General Law'}</span>
        </div>
      ),
    },
    {
      header: 'Gamification Stats',
      render: (item) => (
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1 text-amber-400">
            <Award className="w-3.5 h-3.5" />
            {item.xp} XP
          </span>
          <span className="flex items-center gap-1 text-orange-400">
            <Zap className="w-3.5 h-3.5" />
            {item.streakDays}d streak
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          item.isActive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {item.isActive ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit Student"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        limit={15}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search students by name or email..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Students Found"
        emptySubtitle="Registered students will appear here."
        filterSlot={
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Suspended Only</option>
          </select>
        }
      />

      {/* Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Manage Student: ${editingItem?.email}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">XP</label>
              <input
                type="number"
                value={formData.xp}
                onChange={(e) => setFormData({ ...formData, xp: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Streak Days</label>
              <input
                type="number"
                value={formData.streakDays}
                onChange={(e) => setFormData({ ...formData, streakDays: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Coins</label>
              <input
                type="number"
                value={formData.coins}
                onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="studentActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
            />
            <label htmlFor="studentActive" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Account Active & Enabled
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? 'Saving...' : 'Update Account'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Student Account"
        message={`Are you sure you want to delete student "${deleteTarget?.email}"? All bookmarks and test attempts will be deleted.`}
      />
    </div>
  );
}
