"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, HelpCircle, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function QuestionsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [priority, setPriority] = useState('');
  const [topicsList, setTopicsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [error, setError] = useState(null);

  const handleRecalculatePriorities = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/admin/questions/recalculate-priorities', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        if (onTriggerAlert) onTriggerAlert(json.message);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecalculating(false);
    }
  };

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
    questionText: '',
    questionTextGu: '',
    marks: 14,
    difficulty: 'MEDIUM',
    preparationPriority: 'HIGH',
    pyqFrequency: 2,
    questionType: 'DESCRIPTIVE',
    answerText: '',
    keyPoints: '',
    judicialCitations: '',
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
        difficulty,
        priority,
      });
      const res = await fetch(`/api/admin/questions?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load questions');
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
  }, [page, search, topicId, difficulty, priority]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      topicId: topicId || (topicsList[0]?.id || ''),
      questionText: '',
      questionTextGu: '',
      marks: 14,
      difficulty: 'MEDIUM',
      preparationPriority: 'HIGH',
      priority_label: 'Practice',
      why_important: '',
      pyqFrequency: 2,
      questionType: 'DESCRIPTIVE',
      answerText: '',
      keyPoints: '',
      judicialCitations: '',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    const primaryAns = item.answers?.[0] || {};
    setFormData({
      topicId: item.topicId || '',
      questionText: item.questionText || '',
      questionTextGu: item.questionTextGu || '',
      marks: item.marks || 14,
      difficulty: item.difficulty || 'MEDIUM',
      preparationPriority: item.preparationPriority || 'HIGH',
      priority_label: item.priority_label || 'Practice',
      why_important: item.why_important || '',
      pyqFrequency: item.pyqFrequency || 1,
      questionType: item.questionType || 'DESCRIPTIVE',
      answerText: primaryAns.answerText || '',
      keyPoints: primaryAns.keyPoints || '',
      judicialCitations: primaryAns.judicialCitations || '',
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.topicId || !formData.questionText.trim()) {
      setFormError('Topic assignment and Question Text are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/questions/${editingItem.id}`
        : '/api/admin/questions';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Question updated successfully!' : 'Question & Answer created!');
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
      const res = await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete question');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Question deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Marks & PYQ',
      className: 'w-24',
      render: (item) => (
        <div className="space-y-1 text-center">
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] block">
            {item.marks} Marks
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            Asked {item.pyqFrequency}x in PYQs
          </span>
        </div>
      ),
    },
    {
      header: 'Exam Question',
      render: (item) => (
        <div className="space-y-1">
          <span className="font-semibold text-white block">{item.questionText}</span>
          {item.questionTextGu && (
            <span className="text-[11px] text-purple-400 font-serif block">
              {item.questionTextGu}
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-mono block">
            {item.topic?.unit?.subject?.title} • {item.topic?.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Evidence Priority',
      render: (item) => (
        <div className="space-y-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold block text-center border ${
            item.priority_label === 'Very High Priority'
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              : item.priority_label === 'High Priority'
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              : item.priority_label === 'Important'
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {item.priority_label || item.preparationPriority}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block text-center">
            {item.priority_score ? `Score: ${item.priority_score}/100` : item.difficulty}
          </span>
        </div>
      ),
    },
    {
      header: 'Model Answer',
      render: (item) => {
        const hasAns = item.answers?.length > 0;
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            hasAns ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
          }`}>
            {hasAns ? 'Model Answer Verified' : 'Answer Pending'}
          </span>
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
            title="Edit Question"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Question"
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
        searchPlaceholder="Search descriptive questions and model answers..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Exam Questions Found"
        emptySubtitle="Register university exam questions with marks and model answers."
        filterSlot={
          <>
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

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </>
        }
        actionSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculatePriorities}
              disabled={isRecalculating}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Batch recalculate evidence priorities based on past papers and syllabus weight"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>{isRecalculating ? 'Recalculating...' : 'Recalculate Priorities'}</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Exam Question' : 'Create Descriptive Question & Model Answer'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
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
            <label className="text-slate-400 font-mono font-semibold">Question Text (English) *</label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Discuss the essential ingredients of culpable homicide not amounting to murder..."
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Question Text (Gujarati Translation)</label>
            <textarea
              rows={2}
              placeholder="ગુજરાતી પ્રશ્ન..."
              value={formData.questionTextGu}
              onChange={(e) => setFormData({ ...formData, questionTextGu: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-serif focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Marks</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value, 10) || 14 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Difficulty</label>
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
              <label className="text-slate-400 font-mono font-semibold">Exam Priority</label>
              <select
                value={formData.preparationPriority}
                onChange={(e) => setFormData({ ...formData, preparationPriority: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="HIGH">High Priority (Frequent)</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">PYQ Frequency</label>
              <input
                type="number"
                min="1"
                value={formData.pyqFrequency}
                onChange={(e) => setFormData({ ...formData, pyqFrequency: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Evidence Priority Level (Admin Override) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <label className="text-amber-400 font-mono font-semibold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Evidence Priority Level
              </label>
              <select
                value={formData.priority_label || 'Practice'}
                onChange={(e) => setFormData({ ...formData, priority_label: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="Very High Priority">🔴 Very High Priority</option>
                <option value="High Priority">🟠 High Priority</option>
                <option value="Important">🔵 Important</option>
                <option value="Practice">⚪ Practice</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold text-xs">Why This Is Important (Reason)</label>
              <input
                type="text"
                value={formData.why_important || ''}
                onChange={(e) => setFormData({ ...formData, why_important: e.target.value })}
                placeholder="Appeared in multiple papers and covers core concept..."
                className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Model Answer (IRAC Structure / Full Response)</label>
            <textarea
              rows={4}
              placeholder="Model answer including Issue, Rule of Law, Application, and Conclusion..."
              value={formData.answerText}
              onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Related Sections</label>
              <input
                type="text"
                placeholder="e.g. BNS Sec. 101, IPC Sec. 299"
                value={formData.keyPoints}
                onChange={(e) => setFormData({ ...formData, keyPoints: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Related Case Laws / Citations</label>
              <input
                type="text"
                placeholder="e.g. Reg v. Govinda (1876)"
                value={formData.judicialCitations}
                onChange={(e) => setFormData({ ...formData, judicialCitations: e.target.value })}
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Question' : 'Create Question'}
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
        title="Delete Question"
        message="Are you sure you want to delete this descriptive exam question and its model answer?"
      />
    </div>
  );
}
