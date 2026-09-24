"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CalendarRange, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function SemestersView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [coursesList, setCoursesList] = useState([]);
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
    courseId: '',
    semesterNumber: 1,
    title: 'Semester 1',
  });

  useEffect(() => {
    fetch('/api/admin/courses?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCoursesList(json.items || []);
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
        courseId,
      });
      const res = await fetch(`/api/admin/semesters?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load semesters');
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
  }, [page, courseId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      courseId: courseId || (coursesList[0]?.id || ''),
      semesterNumber: 1,
      title: 'Semester 1',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      courseId: item.courseId || '',
      semesterNumber: item.semesterNumber || 1,
      title: item.title || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.courseId || formData.semesterNumber === undefined) {
      setFormError('Course assignment and Semester Number are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/semesters/${editingItem.id}`
        : '/api/admin/semesters';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Semester updated successfully!' : 'Semester created successfully!');
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
      const res = await fetch(`/api/admin/semesters/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete semester');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Semester deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Sem #',
      key: 'semesterNumber',
      className: 'w-20',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          Sem {item.semesterNumber}
        </span>
      ),
    },
    {
      header: 'Semester Title',
      key: 'title',
      render: (item) => (
        <span className="font-semibold text-white">{item.title}</span>
      ),
    },
    {
      header: 'Assigned Course',
      render: (item) => (
        <div>
          <span className="text-xs text-slate-200 font-medium block">
            {item.course?.name || item.courseId}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.course?.university?.name || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Subjects',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-300">
          {item._count?.subjects || 0} Subjects
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
            title="Edit Semester"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Semester"
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
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Semesters Found"
        emptySubtitle="Create semesters assigned to courses to hold syllabus subjects."
        filterSlot={
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Courses</option>
            {coursesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.university?.code} • {c.code} - {c.name}
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
            <span>Add Semester</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Semester ${editingItem.semesterNumber}` : 'Create Semester'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Assign Degree Program / Course *</label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
            >
              <option value="">Select Course</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.university?.code} • {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Semester Number *</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={formData.semesterNumber}
                onChange={(e) => {
                  const num = parseInt(e.target.value, 10) || 1;
                  setFormData({
                    ...formData,
                    semesterNumber: num,
                    title: `Semester ${num}`,
                  });
                }}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Official Semester Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Semester 1 (Autumn)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Semester' : 'Create Semester'}
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
        title="Delete Semester"
        message={`Are you sure you want to delete ${deleteTarget?.title}? All linked subjects and study units will be deleted.`}
      />
    </div>
  );
}
