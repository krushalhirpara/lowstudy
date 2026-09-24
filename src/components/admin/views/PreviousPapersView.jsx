"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet, ExternalLink, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function PreviousPapersView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [examYear, setExamYear] = useState('');
  const [universitiesList, setUniversitiesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [semestersList, setSemestersList] = useState([]);
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
    universityId: '',
    courseId: '',
    semesterId: '',
    subjectId: '',
    examYear: 2025,
    examSession: 'WINTER',
    totalMarks: 70,
    durationMinutes: 180,
    paperCode: '',
    fileUrl: '',
  });

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
        universityId,
        examYear,
      });
      const res = await fetch(`/api/admin/previous-papers?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load papers');
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
  }, [page, search, universityId, examYear]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      universityId: universityId || (universitiesList[0]?.id || ''),
      courseId: coursesList[0]?.id || '',
      semesterId: semestersList[0]?.id || '',
      subjectId: subjectsList[0]?.id || '',
      examYear: 2025,
      examSession: 'WINTER',
      totalMarks: 70,
      durationMinutes: 180,
      paperCode: '',
      fileUrl: '',
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
      subjectId: item.subjectId || '',
      examYear: item.examYear || 2025,
      examSession: item.examSession || 'WINTER',
      totalMarks: item.totalMarks || 70,
      durationMinutes: item.durationMinutes || 180,
      paperCode: item.paperCode || '',
      fileUrl: item.fileUrl || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.universityId || !formData.courseId || !formData.semesterId || !formData.subjectId || !formData.examYear) {
      setFormError('University, Course, Semester, Subject, and Exam Year are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/previous-papers/${editingItem.id}`
        : '/api/admin/previous-papers';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Paper updated!' : 'Paper registered!');
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
      const res = await fetch(`/api/admin/previous-papers/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete paper');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Previous paper deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Exam Year & Session',
      className: 'w-36',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] block text-center mb-1">
            {item.examYear} • {item.examSession}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block text-center">
            {item.paperCode || 'Code Pending'}
          </span>
        </div>
      ),
    },
    {
      header: 'Subject & Academic Scope',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.subject?.title || item.subjectId}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.university?.name || item.universityId} • {item.semester?.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Marks & Duration',
      render: (item) => (
        <span className="text-xs text-slate-300 font-mono">
          {item.totalMarks} Marks • {item.durationMinutes} Mins
        </span>
      ),
    },
    {
      header: 'PDF Archive',
      render: (item) => (
        item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-mono"
          >
            <span>View PDF</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">No File URL</span>
        )
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
            title="Edit Paper"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Paper"
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
        searchPlaceholder="Search past examination papers..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Previous Papers Found"
        emptySubtitle="Archive official past examination question papers and PDF solutions."
        filterSlot={
          <>
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none max-w-xs truncate"
            >
              <option value="">All Universities</option>
              {universitiesList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>

            <select
              value={examYear}
              onChange={(e) => setExamYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Previous Paper</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Previous Paper' : 'Archive University Examination Paper'}
        maxWidth="max-w-3xl"
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
              <label className="text-slate-400 font-mono font-semibold">Course Program *</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Subject *</label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select Subject</option>
                {subjectsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortCode} - {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Exam Year *</label>
              <input
                type="number"
                min="2010"
                max="2030"
                required
                value={formData.examYear}
                onChange={(e) => setFormData({ ...formData, examYear: parseInt(e.target.value, 10) || 2025 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Exam Session</label>
              <select
                value={formData.examSession}
                onChange={(e) => setFormData({ ...formData, examSession: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="WINTER">Winter</option>
                <option value="SUMMER">Summer</option>
                <option value="REGULAR">Regular</option>
                <option value="REMEDIAL">Remedial / ATKT</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value, 10) || 70 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Duration (Mins)</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) || 180 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Official Paper Code</label>
              <input
                type="text"
                placeholder="e.g. LAW-2024-W-01"
                value={formData.paperCode}
                onChange={(e) => setFormData({ ...formData, paperCode: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Question Paper PDF File URL</label>
              <input
                type="url"
                placeholder="https://.../papers/2025-winter.pdf"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:border-amber-500/50"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Paper' : 'Archive Paper'}
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
        title="Delete Previous Paper"
        message="Are you sure you want to delete this previous examination paper record?"
      />
    </div>
  );
}
