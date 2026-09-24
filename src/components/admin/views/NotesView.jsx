"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, AlertCircle, Languages } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function NotesView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState('');
  const [language, setLanguage] = useState('');
  const [topicsList, setTopicsList] = useState([]);
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
    topicId: '',
    language: 'EN',
    simpleNotes: '',
    detailedNotes: '',
    keyPointsText: '',
    mnemonicsText: '',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetch('/api/admin/topics?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setTopicsList(json.items || []);
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
        topicId,
        language,
      });
      const res = await fetch(`/api/admin/notes?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load notes');
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
  }, [page, search, topicId, language]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      topicId: topicId || (topicsList[0]?.id || ''),
      language: 'EN',
      simpleNotes: '',
      detailedNotes: '',
      keyPointsText: '',
      mnemonicsText: '',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    let kp = '';
    let mn = '';
    try {
      if (item.keyPoints) {
        const parsed = JSON.parse(item.keyPoints);
        kp = Array.isArray(parsed) ? parsed.join('\n') : String(item.keyPoints);
      }
      if (item.mnemonics) {
        const parsed = JSON.parse(item.mnemonics);
        mn = Array.isArray(parsed) ? parsed.join('\n') : String(item.mnemonics);
      }
    } catch (e) {
      kp = item.keyPoints || '';
      mn = item.mnemonics || '';
    }

    setFormData({
      topicId: item.topicId || '',
      language: item.language || 'EN',
      simpleNotes: item.simpleNotes || '',
      detailedNotes: item.detailedNotes || '',
      keyPointsText: kp,
      mnemonicsText: mn,
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.topicId || !formData.simpleNotes.trim() || !formData.detailedNotes.trim()) {
      setFormError('Topic assignment, Quick Revision notes, and Detailed Notes are required.');
      return;
    }

    const payload = {
      ...formData,
      keyPoints: formData.keyPointsText.split('\n').map((s) => s.trim()).filter(Boolean),
      mnemonics: formData.mnemonicsText.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/notes/${editingItem.id}`
        : '/api/admin/notes';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Note updated successfully!' : 'Note created successfully!');
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
      const res = await fetch(`/api/admin/notes/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete note');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Note deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Language',
      key: 'language',
      className: 'w-20',
      render: (item) => (
        <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${
          item.language === 'GU'
            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          {item.language === 'GU' ? 'Gujarati' : 'English'}
        </span>
      ),
    },
    {
      header: 'Topic & Subject',
      render: (item) => (
        <div>
          <span className="font-semibold text-white block">{item.topic?.title || item.topicId}</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {item.topic?.unit?.subject?.title || ''} • {item.topic?.unit?.title || ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Quick Revision Snippet',
      render: (item) => (
        <p className="text-xs text-slate-300 line-clamp-2 max-w-md">
          {item.simpleNotes}
        </p>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
          item.status === 'PUBLISHED'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {item.status}
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
            title="Edit Note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Note"
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
        searchPlaceholder="Search notes content, revision points..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Exam Notes Found"
        emptySubtitle="Create bilingual revision notes, detailed notes, and memory aids."
        filterSlot={
          <>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none max-w-xs truncate"
            >
              <option value="">All Topics</option>
              {topicsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Languages</option>
              <option value="EN">English (EN)</option>
              <option value="GU">Gujarati (GU)</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam Note</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Exam Note' : 'Create Bilingual Exam Note'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Assign Topic *</label>
              <select
                required
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
              >
                <option value="">Select Topic</option>
                {topicsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Language *</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="EN">English (EN)</option>
                <option value="GU">Gujarati (GU)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Quick Revision Notes (Summary / Highlights) *</label>
            <textarea
              rows={3}
              required
              placeholder="Bullet points and high-yield concepts for fast revision..."
              value={formData.simpleNotes}
              onChange={(e) => setFormData({ ...formData, simpleNotes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Detailed Exam Answer / Comprehensive Notes *</label>
            <textarea
              rows={5}
              required
              placeholder="Full scholarly commentary, jurisprudence analysis, and statutory interpretation..."
              value={formData.detailedNotes}
              onChange={(e) => setFormData({ ...formData, detailedNotes: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Key Points (One per line)</label>
              <textarea
                rows={3}
                placeholder="Point 1&#10;Point 2&#10;Point 3"
                value={formData.keyPointsText}
                onChange={(e) => setFormData({ ...formData, keyPointsText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Mnemonics & Memory Aids (One per line)</label>
              <textarea
                rows={3}
                placeholder="Acronym / Formula&#10;Memory hook"
                value={formData.mnemonicsText}
                onChange={(e) => setFormData({ ...formData, mnemonicsText: e.target.value })}
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Note' : 'Create Note'}
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
        title="Delete Note"
        message="Are you sure you want to delete this study note? This cannot be undone."
      />
    </div>
  );
}
