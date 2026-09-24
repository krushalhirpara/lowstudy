"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function CoursesView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [universitiesList, setUniversitiesList] = useState([]);
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
    universityId: '',
    name: '',
    code: '',
    totalSemesters: 6,
    description: '',
    isActive: true,
  });

  // Load universities dropdown options
  useEffect(() => {
    fetch('/api/admin/universities?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUniversitiesList(json.items || []);
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
        universityId,
      });
      const res = await fetch(`/api/admin/courses?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load courses');
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
  }, [page, search, universityId]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      universityId: universityId || (universitiesList[0]?.id || ''),
      name: '',
      code: '',
      totalSemesters: 6,
      description: '',
      isActive: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      universityId: item.universityId || '',
      name: item.name || '',
      code: item.code || '',
      totalSemesters: item.totalSemesters || 6,
      description: item.description || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.universityId || !formData.name.trim() || !formData.code.trim()) {
      setFormError('University assignment, Course Name, and Course Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/courses/${editingItem.id}`
        : '/api/admin/courses';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Course updated successfully!' : 'Course created successfully!');
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
      const res = await fetch(`/api/admin/courses/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete course');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Course deleted successfully!');
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
      className: 'w-28',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          {item.code}
        </span>
      ),
    },
    {
      header: 'Degree Program / Course',
      key: 'name',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.totalSemesters} Semesters • {item.university?.name || item.universityId}
          </span>
        </div>
      ),
    },
    {
      header: 'University',
      render: (item) => (
        <span className="text-xs text-slate-300 font-medium">
          {item.university?.name || item.universityId}
        </span>
      ),
    },
    {
      header: 'Semesters',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-300">
          {item._count?.semesters || item.totalSemesters} Sems
        </span>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          item.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'
        }`}>
          {item.isActive ? 'Active' : 'Inactive'}
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
            title="Edit Course"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Course"
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
        searchPlaceholder="Search courses by title or code..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Courses Found"
        emptySubtitle="Create degree programs (LL.B., B.A. LL.B., LL.M.) assigned to universities."
        filterSlot={
          <select
            value={universityId}
            onChange={(e) => setUniversityId(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Universities</option>
            {universitiesList.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code} - {u.name}
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
            <span>Add Course</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Course: ${editingItem.code}` : 'Create Degree Program / Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Assign University *</label>
            <select
              required
              value={formData.universityId}
              onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
            >
              <option value="">Select University</option>
              {universitiesList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. LLB-3Y, BALLB-5Y, LLM"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Total Semesters</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.totalSemesters}
                onChange={(e) => setFormData({ ...formData, totalSemesters: parseInt(e.target.value, 10) || 6 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Program Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. 3-Year Bachelor of Laws (LL.B.)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Description / Syllabus Scope</label>
            <textarea
              rows={2}
              placeholder="Optional course overview or eligibility..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="courseIsActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
            />
            <label htmlFor="courseIsActive" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Active Curriculum Offering
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Course' : 'Create Course'}
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
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Warning: All associated semesters, subjects, and topics under this course will be deleted.`}
      />
    </div>
  );
}
