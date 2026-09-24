"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Timer, AlertCircle, PlayCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function MockTestsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isPublished, setIsPublished] = useState('');
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
    title: '',
    subjectId: '',
    description: '',
    durationMinutes: 60,
    totalMarks: 50,
    passingMarks: 25,
    hasNegativeMarking: true,
    negativeMarkValue: 0.25,
    isPublished: true,
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
        limit: '15',
        search,
        subjectId,
        isPublished,
      });
      const res = await fetch(`/api/admin/mock-tests?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load mock tests');
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
  }, [page, search, subjectId, isPublished]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      subjectId: subjectId || (subjectsList[0]?.id || ''),
      description: '',
      durationMinutes: 60,
      totalMarks: 50,
      passingMarks: 25,
      hasNegativeMarking: true,
      negativeMarkValue: 0.25,
      isPublished: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      subjectId: item.subjectId || '',
      description: item.description || '',
      durationMinutes: item.durationMinutes || 60,
      totalMarks: item.totalMarks || 50,
      passingMarks: item.passingMarks || 25,
      hasNegativeMarking: item.hasNegativeMarking !== undefined ? item.hasNegativeMarking : true,
      negativeMarkValue: item.negativeMarkValue || 0.25,
      isPublished: item.isPublished !== undefined ? item.isPublished : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Mock Test Title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/mock-tests/${editingItem.id}`
        : '/api/admin/mock-tests';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Mock test updated!' : 'Mock test created!');
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
      const res = await fetch(`/api/admin/mock-tests/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete mock test');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Mock test deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Mock Test Title',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.title}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.subject?.title || 'General Law'} • {item.durationMinutes} Mins Duration
          </span>
        </div>
      ),
    },
    {
      header: 'Questions & Marks',
      render: (item) => (
        <span className="text-xs font-mono text-slate-300">
          {item._count?.questions || 0} Questions • Total {item.totalMarks} Marks (Pass: {item.passingMarks})
        </span>
      ),
    },
    {
      header: 'Negative Marking',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          item.hasNegativeMarking
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-slate-800 text-slate-400'
        }`}>
          {item.hasNegativeMarking ? `-${item.negativeMarkValue} Marks` : 'None'}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          item.isPublished
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-slate-800 text-slate-500'
        }`}>
          {item.isPublished ? 'Published' : 'Draft'}
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
            title="Edit Mock Test"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Mock Test"
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
        searchPlaceholder="Search mock examination tests..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Mock Tests Configured"
        emptySubtitle="Create timed simulation tests with negative marking and pass criteria."
        filterSlot={
          <>
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

            <select
              value={isPublished}
              onChange={(e) => setIsPublished(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mock Test</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Mock Test' : 'Create Examination Mock Test'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Mock Test Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Criminal Law Full-Length Semester Simulation 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Subject</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            >
              <option value="">General (Multi-Subject)</option>
              {subjectsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortCode} - {s.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Duration (Minutes)</label>
              <input
                type="number"
                min="10"
                max="240"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 60 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Total Marks</label>
              <input
                type="number"
                min="10"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value, 10) || 50 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Passing Marks</label>
              <input
                type="number"
                min="1"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value, 10) || 25 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Negative Marking Penalty</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="2"
                value={formData.negativeMarkValue}
                onChange={(e) => setFormData({ ...formData, negativeMarkValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="mockIsPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
              />
              <label htmlFor="mockIsPublished" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Publish Test to Student Exam Hub
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Instructions & Rules</label>
            <textarea
              rows={2}
              placeholder="Guidelines for students during the mock test..."
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Test' : 'Create Test'}
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
        title="Delete Mock Test"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
