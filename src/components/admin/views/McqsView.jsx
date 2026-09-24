"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, AlertCircle, Check } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function McqsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [topicsList, setTopicsList] = useState([]);
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
    topicId: '',
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctKey: 'A',
    difficulty: 'MEDIUM',
    explanation: '',
    status: 'PUBLISHED',
  });

  useEffect(() => {
    fetch('/api/admin/subjects?limit=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSubjectsList(json.items || []);
      })
      .catch((e) => console.error(e));

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
        subjectId,
        difficulty,
      });
      const res = await fetch(`/api/admin/mcqs?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load MCQs');
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
  }, [page, search, topicId, subjectId, difficulty]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      subjectId: subjectId || (subjectsList[0]?.id || ''),
      topicId: topicId || (topicsList[0]?.id || ''),
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctKey: 'A',
      difficulty: 'MEDIUM',
      explanation: '',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const opts = item.options || [];
    const optA = opts.find((o) => o.optionKey === 'A')?.optionText || '';
    const optB = opts.find((o) => o.optionKey === 'B')?.optionText || '';
    const optC = opts.find((o) => o.optionKey === 'C')?.optionText || '';
    const optD = opts.find((o) => o.optionKey === 'D')?.optionText || '';
    const correctOpt = opts.find((o) => o.isCorrect)?.optionKey || 'A';

    setFormData({
      subjectId: item.subjectId || '',
      topicId: item.topicId || '',
      questionText: item.questionText || '',
      optA,
      optB,
      optC,
      optD,
      correctKey: correctOpt,
      difficulty: item.difficulty || 'MEDIUM',
      explanation: item.explanation || '',
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.questionText.trim() || !formData.optA.trim() || !formData.optB.trim() || !formData.explanation.trim()) {
      setFormError('Question text, Options A & B, and Explanation are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem ? `/api/admin/mcqs/${editingItem.id}` : '/api/admin/mcqs';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'MCQ updated!' : 'MCQ created!');
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
      const res = await fetch(`/api/admin/mcqs/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete MCQ');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('MCQ deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Question & Options',
      render: (item) => {
        const correctOpt = item.options?.find((o) => o.isCorrect);
        return (
          <div className="space-y-1.5 max-w-lg">
            <span className="font-semibold text-white block">{item.questionText}</span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
              {item.options?.map((opt) => (
                <span
                  key={opt.id || opt.optionKey}
                  className={`px-2 py-0.5 rounded border truncate ${
                    opt.isCorrect
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {opt.optionKey}: {opt.optionText}
                </span>
              ))}
            </div>
            {item.explanation && (
              <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                💡 {item.explanation}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Scope',
      render: (item) => (
        <div className="text-[11px] font-mono text-slate-400">
          <span className="text-slate-200 font-semibold block">{item.subject?.shortCode || 'Law'}</span>
          <span>{item.topic?.title || 'General'}</span>
        </div>
      ),
    },
    {
      header: 'Difficulty',
      key: 'difficulty',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          item.difficulty === 'HARD'
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : item.difficulty === 'MEDIUM'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          {item.difficulty}
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
            title="Edit MCQ"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete MCQ"
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
        searchPlaceholder="Search MCQs by question or explanation..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No MCQs Found"
        emptySubtitle="Register 4-option practice multiple choice questions."
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
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add MCQ</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Multiple Choice Question' : 'Create Practice MCQ'}
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
              <label className="text-slate-400 font-mono font-semibold">Subject</label>
              <select
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

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Topic</label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="">Select Topic</option>
                {topicsList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Question Stem / Prompt *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Which landmark judgment laid down the Triple Test for preventive detention?"
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-400 font-mono font-semibold block">Four Answer Options & Correct Key *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'A', field: 'optA' },
                { key: 'B', field: 'optB' },
                { key: 'C', field: 'optC' },
                { key: 'D', field: 'optD' },
              ].map((opt) => (
                <div key={opt.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctKey: opt.key })}
                    className={`w-8 h-8 rounded-xl font-mono font-bold text-xs shrink-0 flex items-center justify-center border transition-all ${
                      formData.correctKey === opt.key
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                    title={`Click to mark ${opt.key} as correct answer`}
                  >
                    {formData.correctKey === opt.key ? <Check className="w-4 h-4" /> : opt.key}
                  </button>
                  <input
                    type="text"
                    required={opt.key === 'A' || opt.key === 'B'}
                    placeholder={`Option ${opt.key}...`}
                    value={formData[opt.field]}
                    onChange={(e) => setFormData({ ...formData, [opt.field]: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Difficulty Rating</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Correct Option Selected</label>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Option {formData.correctKey} will be marked as Correct</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Detailed Legal Explanation *</label>
            <textarea
              rows={3}
              required
              placeholder="Why the correct option is right with statutory citations and precedents..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update MCQ' : 'Publish MCQ'}
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
        title="Delete Practice MCQ"
        message="Are you sure you want to delete this multiple choice question and its four options?"
      />
    </div>
  );
}
