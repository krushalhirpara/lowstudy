"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function SubjectsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [category, setCategory] = useState('');
  const [syllabusVersion, setSyllabusVersion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dropdowns
  const [universitiesList, setUniversitiesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [semestersList, setSemestersList] = useState([]);

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
    courseId: '',
    semesterId: '',
    title: '',
    shortCode: '',
    category: 'Core Law',
    credits: 4,
    syllabusVersion: 'new',
    description: '',
    isActive: true,
  });

  // Load Dropdowns
  useEffect(() => {
    fetch('/api/admin/universities?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setUniversitiesList(json.items || []);
      })
      .catch((e) => console.error(e));

    fetch('/api/admin/courses?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCoursesList(json.items || []);
      })
      .catch((e) => console.error(e));

    fetch('/api/admin/semesters?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSemestersList(json.items || []);
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
        semesterId,
        category,
        syllabusVersion,
      });
      const res = await fetch(`/api/admin/subjects?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load subjects');
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
  }, [page, search, universityId, semesterId, category, syllabusVersion]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const defUni = universitiesList[0]?.id || '';
    const defCourse = coursesList[0]?.id || '';
    const defSem = semestersList[0]?.id || '';
    setFormData({
      universityId: defUni,
      courseId: defCourse,
      semesterId: defSem,
      title: '',
      shortCode: '',
      category: 'Core Law',
      credits: 4,
      syllabusVersion: 'new',
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
      courseId: item.courseId || '',
      semesterId: item.semesterId || '',
      title: item.title || '',
      shortCode: item.shortCode || '',
      category: item.category || 'Core Law',
      credits: item.credits || 4,
      syllabusVersion: item.syllabusVersion || 'new',
      description: item.description || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.universityId || !formData.courseId || !formData.semesterId || !formData.title.trim() || !formData.shortCode.trim()) {
      setFormError('University, Course, Semester, Subject Name, and Subject Code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/subjects/${editingItem.id}`
        : '/api/admin/subjects';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Subject updated successfully!' : 'Subject created successfully!');
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
      const res = await fetch(`/api/admin/subjects/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete subject');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Subject deleted successfully!');
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
      key: 'shortCode',
      className: 'w-24',
      render: (item) => (
        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
          {item.shortCode}
        </span>
      ),
    },
    {
      header: 'Official Subject Name',
      key: 'title',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.title}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.category} • {item.credits} Credits • {item.semester?.title || item.semesterId}
          </span>
        </div>
      ),
    },
    {
      header: 'Version',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          item.syllabusVersion === 'new'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {item.syllabusVersion === 'new' ? 'BNS 2023 (New)' : 'IPC 1860 (Old)'}
        </span>
      ),
    },
    {
      header: 'Units',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-300">
          {item._count?.units || 0} Modules
        </span>
      ),
    },
    {
      header: 'University',
      render: (item) => (
        <span className="text-xs text-slate-300 font-mono">
          {item.university?.code || item.universityId}
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
            title="Edit Subject"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Subject"
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
        searchPlaceholder="Search subjects by name, code, or description..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Subjects Registered"
        emptySubtitle="Register law subjects with credits, marks, and syllabus versions."
        filterSlot={
          <>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="Core Law">Core Law</option>
              <option value="Criminal Law">Criminal Law</option>
              <option value="Civil Law">Civil Law</option>
              <option value="Constitutional Law">Constitutional Law</option>
              <option value="Corporate Law">Corporate Law</option>
            </select>

            <select
              value={syllabusVersion}
              onChange={(e) => setSyllabusVersion(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Versions</option>
              <option value="new">New (BNS 2023)</option>
              <option value="old">Old (IPC 1860)</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Subject: ${editingItem.title}` : 'Register New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">University *</label>
              <select
                required
                value={formData.universityId}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select University</option>
                {universitiesList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.code} - {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Course *</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select Course</option>
                {coursesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Semester *</label>
              <select
                required
                value={formData.semesterId}
                onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select Semester</option>
                {semestersList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.courseId})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Subject Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CONST-1, CRPC-2, BNS-1"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Official Subject Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Constitutional Law of India I"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Core Law">Core Law</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Civil Law">Civil Law</option>
                <option value="Constitutional Law">Constitutional Law</option>
                <option value="Corporate Law">Corporate Law</option>
                <option value="Procedural Law">Procedural Law</option>
                <option value="Jurisprudence">Jurisprudence</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Credits</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value, 10) || 4 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Syllabus Version</label>
              <select
                value={formData.syllabusVersion}
                onChange={(e) => setFormData({ ...formData, syllabusVersion: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="new">New (BNS 2023)</option>
                <option value="old">Old (IPC 1860)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Description & Learning Outcomes</label>
            <textarea
              rows={2}
              placeholder="Overview of syllabus scope, paper marks breakdown, and university syllabus notes..."
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Subject' : 'Create Subject'}
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
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteTarget?.title}" (${deleteTarget?.shortCode})? This will delete all units, topics, notes, questions, and MCQs linked to this subject.`}
      />
    </div>
  );
}
