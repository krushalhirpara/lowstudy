"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookmarkCheck, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function TopicsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [unitId, setUnitId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [unitsList, setUnitsList] = useState([]);
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
    unitId: '',
    topicNumber: 1,
    title: '',
    description: '',
    language: 'EN',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetch('/api/admin/units?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUnitsList(json.items || []);
      })
      .catch((e) => console.error(e));
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        unitId,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/topics?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load topics');
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
  }, [page, search, unitId, statusFilter]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      unitId: unitId || (unitsList[0]?.id || ''),
      topicNumber: 1,
      title: '',
      description: '',
      language: 'EN',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      unitId: item.unitId || '',
      topicNumber: item.topicNumber || 1,
      title: item.title || '',
      description: item.description || '',
      language: item.language || 'EN',
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.unitId || !formData.title.trim()) {
      setFormError('Unit assignment and Topic Name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/topics/${editingItem.id}`
        : '/api/admin/topics';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Topic updated successfully!' : 'Topic created successfully!');
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
      const res = await fetch(`/api/admin/topics/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete topic');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Topic deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Order',
      key: 'topicNumber',
      className: 'w-16',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          #{item.topicNumber}
        </span>
      ),
    },
    {
      header: 'Topic Name',
      key: 'title',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.title}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            Unit {item.unit?.unitNumber}: {item.unit?.title} • {item.unit?.subject?.shortCode}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => {
        const isPub = item.status === 'PUBLISHED';
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
            isPub
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {item.status}
          </span>
        );
      },
    },
    {
      header: 'Linked Content',
      render: (item) => (
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>{item._count?.notes || 0} Notes</span>
          <span>•</span>
          <span>{item._count?.questions || 0} Qs</span>
          <span>•</span>
          <span>{item._count?.mcqs || 0} MCQs</span>
        </div>
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
            title="Edit Topic"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Topic"
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
        searchPlaceholder="Search topics by title or description..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Topics Found"
        emptySubtitle="Create specific legal study topics inside curriculum units."
        filterSlot={
          <>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none max-w-xs truncate"
            >
              <option value="">All Units</option>
              {unitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.subject?.shortCode} • U{u.unitNumber}: {u.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Review</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Topic: ${editingItem.title}` : 'Create Study Topic'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Assign Syllabus Unit *</label>
            <select
              required
              value={formData.unitId}
              onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
            >
              <option value="">Select Unit</option>
              {unitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.subject?.shortCode} • Unit {u.unitNumber}: {u.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Display Order</label>
              <input
                type="number"
                min="1"
                value={formData.topicNumber}
                onChange={(e) => setFormData({ ...formData, topicNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Topic Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Right of Private Defence of Body & Property"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="REVIEW">Under Review</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Primary Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="EN">English (EN)</option>
                <option value="GU">Gujarati (GU)</option>
                <option value="HI">Hindi (HI)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Topic Description</label>
            <textarea
              rows={2}
              placeholder="Summary of legal doctrines, statutory sections, and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Topic' : 'Create Topic'}
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
        title="Delete Topic"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All associated notes, questions, and practice items will be permanently removed.`}
      />
    </div>
  );
}
