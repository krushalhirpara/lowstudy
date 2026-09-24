"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function UnitsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectsList, setSubjectsList] = useState([]);
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
    subjectId: '',
    unitNumber: 1,
    title: '',
    description: '',
  });

  useEffect(() => {
    fetch('/api/admin/subjects?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSubjectsList(json.items || []);
      })
      .catch((e) => console.error(e));
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        search,
        subjectId,
      });
      const res = await fetch(`/api/admin/units?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load units');
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
  }, [page, search, subjectId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      subjectId: subjectId || (subjectsList[0]?.id || ''),
      unitNumber: 1,
      title: '',
      description: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      subjectId: item.subjectId || '',
      unitNumber: item.unitNumber || 1,
      title: item.title || '',
      description: item.description || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.subjectId || !formData.title.trim() || formData.unitNumber === undefined) {
      setFormError('Subject, Unit Title, and Unit Number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/units/${editingItem.id}`
        : '/api/admin/units';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Unit updated successfully!' : 'Unit created successfully!');
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
      const res = await fetch(`/api/admin/units/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete unit');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Unit deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Unit / Order',
      key: 'unitNumber',
      className: 'w-24',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          Unit {item.unitNumber}
        </span>
      ),
    },
    {
      header: 'Official Unit Name',
      key: 'title',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.title}</span>
          {item.description && (
            <span className="text-[11px] text-slate-400 line-clamp-1">
              {item.description}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Subject',
      render: (item) => (
        <div>
          <span className="text-xs text-slate-200 font-medium block">
            {item.subject?.title || item.subjectId}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.subject?.shortCode} • {item.subject?.semester?.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Topics',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-300">
          {item._count?.topics || 0} Topics
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
            title="Edit Unit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Unit"
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
        limit={20}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search syllabus units..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Units Found"
        emptySubtitle="Create syllabus units (modules) within subjects."
        filterSlot={
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none max-w-xs truncate"
          >
            <option value="">All Subjects</option>
            {subjectsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shortCode} - {s.title}
              </option>
            ))}
          </select>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Unit</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Unit ${editingItem.unitNumber}: ${editingItem.title}` : 'Create Syllabus Unit'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Assign Subject *</label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
            >
              <option value="">Select Subject</option>
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortCode} - {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Unit / Order *</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Official Unit Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. General Exceptions & Justifications"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Unit Scope / Description</label>
            <textarea
              rows={2}
              placeholder="Topics covered in this syllabus module..."
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Unit' : 'Create Unit'}
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
        title="Delete Unit"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All linked topics and notes will be deleted.`}
      />
    </div>
  );
}
