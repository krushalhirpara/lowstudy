"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Globe, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function UniversitiesView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    name: '',
    code: '',
    city: '',
    district: '',
    state: 'Gujarat',
    type: 'State Public University',
    established: '1950',
    officialWebsite: '',
    officialSyllabusSource: '',
    status: 'VERIFIED',
    academicYear: '2026-27',
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/universities?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load universities');
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
  }, [page, search, statusFilter]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      city: '',
      district: '',
      state: 'Gujarat',
      type: 'State Public University',
      established: '1950',
      officialWebsite: '',
      officialSyllabusSource: '',
      status: 'VERIFIED',
      academicYear: '2026-27',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      code: item.code || '',
      city: item.city || '',
      district: item.district || '',
      state: item.state || 'Gujarat',
      type: item.type || 'State Public University',
      established: item.established ? String(item.established) : '',
      officialWebsite: item.officialWebsite || '',
      officialSyllabusSource: item.officialSyllabusSource || '',
      status: item.status || 'VERIFIED',
      academicYear: item.academicYear || '2026-27',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim() || !formData.code.trim() || !formData.city.trim()) {
      setFormError('University Name, Code, and City are required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/universities/${editingItem.id}`
        : '/api/admin/universities';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'University updated successfully!' : 'University created successfully!');
      loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      const res = await fetch(`/api/admin/universities/${item.id}`, { method: 'PATCH' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to toggle status');
      onTriggerAlert && onTriggerAlert(`University status updated to ${json.item.status}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/universities/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete university');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('University deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Code',
      key: 'code',
      className: 'w-24',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          {item.code}
        </span>
      ),
    },
    {
      header: 'University Name',
      key: 'name',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.city}, {item.state} • Est. {item.established || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Type',
      key: 'type',
      render: (item) => (
        <span className="text-[11px] text-slate-300 font-mono">
          {item.type}
        </span>
      ),
    },
    {
      header: 'Courses',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-300">
          {item._count?.courses || 0} Programs
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => {
        const isPub = item.status === 'VERIFIED';
        return (
          <button
            onClick={() => handleTogglePublish(item)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-colors ${
              isPub
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
            title="Click to toggle publish status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPub ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isPub ? 'Published' : 'Draft / Unpub'}</span>
          </button>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit University"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete University"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        limit={15}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search universities by name, code, or city..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Universities Registered"
        emptySubtitle="Register law universities to begin structuring curriculums."
        filterSlot={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Published / Verified</option>
            <option value="PENDING_REVIEW">Pending Review</option>
          </select>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add University</span>
          </button>
        }
      />

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit University: ${editingItem.code}` : 'Register New University'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">University Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. GU, VNSGU, GNLU"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={Boolean(editingItem)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">University City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmedabad, Surat"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Official University Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Gujarat University"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">University Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="State Public University">State Public University</option>
                <option value="National Law University">National Law University</option>
                <option value="Central University">Central University</option>
                <option value="Private University">Private University</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Year Established</label>
              <input
                type="number"
                placeholder="1950"
                value={formData.established}
                onChange={(e) => setFormData({ ...formData, established: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Official Website</label>
              <input
                type="url"
                placeholder="https://gujaratuniversity.ac.in"
                value={formData.officialWebsite}
                onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Syllabus Source URL</label>
              <input
                type="url"
                placeholder="https://gujaratuniversity.ac.in/syllabus/law"
                value={formData.officialSyllabusSource}
                onChange={(e) => setFormData({ ...formData, officialSyllabusSource: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update University' : 'Create University'}
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
        title="Delete University"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.code})? Warning: This will cascade delete all linked courses, subjects, units, topics, and question archives.`}
      />
    </div>
  );
}
