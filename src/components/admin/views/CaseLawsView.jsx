"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gavel, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function CaseLawsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [court, setCourt] = useState('');
  const [importance, setImportance] = useState('');
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
    citation: '',
    year: 2024,
    court: 'Supreme Court of India',
    bench: '',
    subjectName: 'Constitutional Law',
    keyPrinciple: '',
    facts: '',
    issues: '',
    argumentsText: '',
    judgment: '',
    ratioDecidendi: '',
    importance: 'LANDMARK',
    status: 'PUBLISHED',
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        court,
        importance,
      });
      const res = await fetch(`/api/admin/case-laws?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load case laws');
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
  }, [page, search, court, importance]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      citation: '',
      year: 2024,
      court: 'Supreme Court of India',
      bench: '',
      subjectName: 'Constitutional Law',
      keyPrinciple: '',
      facts: '',
      issues: '',
      argumentsText: '',
      judgment: '',
      ratioDecidendi: '',
      importance: 'LANDMARK',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      citation: item.citation || '',
      year: item.year || 2024,
      court: item.court || 'Supreme Court of India',
      bench: item.bench || '',
      subjectName: item.subjectName || 'Constitutional Law',
      keyPrinciple: item.keyPrinciple || '',
      facts: item.facts || '',
      issues: item.issues || '',
      argumentsText: item.argumentsText || '',
      judgment: item.judgment || '',
      ratioDecidendi: item.ratioDecidendi || '',
      importance: item.importance || 'LANDMARK',
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.keyPrinciple.trim() || !formData.ratioDecidendi.trim()) {
      setFormError('Case Title, Key Legal Principle, and Ratio Decidendi are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/case-laws/${editingItem.id}`
        : '/api/admin/case-laws';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Case Law updated!' : 'Case Law created!');
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
      const res = await fetch(`/api/admin/case-laws/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete case law');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Case Law deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Case Title & Citation',
      render: (item) => (
        <div className="space-y-1">
          <span className="font-semibold text-white block">{item.title}</span>
          <span className="text-[11px] text-amber-400 font-mono">
            {item.citation || '(Year Citation Pending)'} • {item.court}
          </span>
        </div>
      ),
    },
    {
      header: 'Key Principle Established',
      render: (item) => (
        <p className="text-xs text-slate-300 line-clamp-2 max-w-md">
          {item.keyPrinciple}
        </p>
      ),
    },
    {
      header: 'Bench / Subject',
      render: (item) => (
        <div className="text-[11px] font-mono text-slate-400">
          <span>{item.bench || 'Standard Bench'}</span>
          <span className="block text-slate-500">{item.subjectName || 'Law'}</span>
        </div>
      ),
    },
    {
      header: 'Significance',
      key: 'importance',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          item.importance === 'LANDMARK'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {item.importance}
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
            title="Edit Case Law"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Case Law"
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
        searchPlaceholder="Search case laws by title, citation, or legal principle..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Case Laws Found"
        emptySubtitle="Register landmark judicial precedents with citations and ratio decidendi."
        filterSlot={
          <>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Significance</option>
              <option value="LANDMARK">Landmark</option>
              <option value="IMPORTANT">Important</option>
              <option value="REFERENCE">Reference</option>
            </select>

            <select
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Courts</option>
              <option value="Supreme Court of India">Supreme Court of India</option>
              <option value="Gujarat High Court">Gujarat High Court</option>
              <option value="Delhi High Court">Delhi High Court</option>
              <option value="Bombay High Court">Bombay High Court</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Case Brief</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Judgment Brief: ${editingItem.title}` : 'Publish Landmark Judgment Brief'}
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
            <label className="text-slate-400 font-mono font-semibold">Case Title / Parties *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kesavananda Bharati v. State of Kerala"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Citation</label>
              <input
                type="text"
                placeholder="e.g. (1973) 4 SCC 225"
                value={formData.citation}
                onChange={(e) => setFormData({ ...formData, citation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Decided Year</label>
              <input
                type="number"
                placeholder="1973"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || 2024 })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Court</label>
              <select
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Supreme Court of India">Supreme Court of India</option>
                <option value="Gujarat High Court">Gujarat High Court</option>
                <option value="Delhi High Court">Delhi High Court</option>
                <option value="Bombay High Court">Bombay High Court</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Bench Strength / Ratio</label>
              <input
                type="text"
                placeholder="e.g. 13 Judges (7:6 Majority)"
                value={formData.bench}
                onChange={(e) => setFormData({ ...formData, bench: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Subject Branch</label>
              <input
                type="text"
                placeholder="e.g. Constitutional Law"
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Key Principle Established *</label>
            <input
              type="text"
              required
              placeholder="e.g. Parliament cannot alter the Basic Structure of the Constitution under Article 368"
              value={formData.keyPrinciple}
              onChange={(e) => setFormData({ ...formData, keyPrinciple: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Ratio Decidendi (Binding Rule of Law) *</label>
            <textarea
              rows={3}
              required
              placeholder="The authoritative legal rule underpinning the verdict..."
              value={formData.ratioDecidendi}
              onChange={(e) => setFormData({ ...formData, ratioDecidendi: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Brief Facts of the Case</label>
              <textarea
                rows={3}
                placeholder="Core factual background..."
                value={formData.facts}
                onChange={(e) => setFormData({ ...formData, facts: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Core Legal Issues</label>
              <textarea
                rows={3}
                placeholder="Substantial questions of law raised..."
                value={formData.issues}
                onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Case Law' : 'Publish Case Law'}
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
        title="Delete Case Law"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
