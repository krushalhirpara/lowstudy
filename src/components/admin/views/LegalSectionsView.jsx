"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Scale, AlertCircle } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';
import ConfirmDialog from '../ConfirmDialog';

export default function LegalSectionsView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actName, setActName] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
    actName: 'BNS 2023',
    sectionNumber: '',
    title: '',
    titleGu: '',
    content: '',
    contentGu: '',
    oldLawSection: '',
    oldLawAct: '',
    punishment: '',
    punishmentGu: '',
    bailableStatus: 'Bailable',
    cognizableStatus: 'Cognizable',
    compoundableStatus: 'Non-Compoundable',
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
        actName,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/legal-sections?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load legal sections');
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
  }, [page, search, actName, statusFilter]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      actName: actName || 'BNS 2023',
      sectionNumber: '',
      title: '',
      titleGu: '',
      content: '',
      contentGu: '',
      oldLawSection: '',
      oldLawAct: '',
      punishment: '',
      punishmentGu: '',
      bailableStatus: 'Bailable',
      cognizableStatus: 'Cognizable',
      compoundableStatus: 'Non-Compoundable',
      status: 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      actName: item.actName || 'BNS 2023',
      sectionNumber: item.sectionNumber || '',
      title: item.title || '',
      titleGu: item.titleGu || '',
      content: item.content || '',
      contentGu: item.contentGu || '',
      oldLawSection: item.oldLawSection || '',
      oldLawAct: item.oldLawAct || '',
      punishment: item.punishment || '',
      punishmentGu: item.punishmentGu || '',
      bailableStatus: item.bailableStatus || 'Bailable',
      cognizableStatus: item.cognizableStatus || 'Cognizable',
      compoundableStatus: item.compoundableStatus || 'Non-Compoundable',
      status: item.status || 'PUBLISHED',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.actName.trim() || !formData.sectionNumber.trim() || !formData.title.trim() || !formData.content.trim()) {
      setFormError('Act Name, Section Number, Title, and Statutory Content are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/legal-sections/${editingItem.id}`
        : '/api/admin/legal-sections';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Operation failed');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert(editingItem ? 'Legal Section updated!' : 'Legal Section created!');
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
      const res = await fetch(`/api/admin/legal-sections/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to delete legal section');
      setDeleteTarget(null);
      onTriggerAlert && onTriggerAlert('Legal Section deleted successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Act / Section',
      key: 'sectionNumber',
      className: 'w-36',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] block text-center mb-1">
            Section {item.sectionNumber}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block text-center">
            {item.actName}
          </span>
        </div>
      ),
    },
    {
      header: 'Section Title & Content',
      render: (item) => (
        <div className="space-y-1">
          <span className="font-semibold text-white block">{item.title}</span>
          {item.titleGu && (
            <span className="text-[11px] text-purple-400 block font-serif">
              {item.titleGu}
            </span>
          )}
          <p className="text-xs text-slate-300 line-clamp-2 max-w-lg">
            {item.content}
          </p>
        </div>
      ),
    },
    {
      header: 'Old Law Mapping',
      render: (item) => (
        item.oldLawSection ? (
          <span className="text-[11px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
            {item.oldLawSection} ({item.oldLawAct || 'IPC'})
          </span>
        ) : (
          <span className="text-[11px] text-slate-500 font-mono">-</span>
        )
      ),
    },
    {
      header: 'Procedural Tags',
      render: (item) => (
        <div className="space-y-1 text-[10px] font-mono">
          {item.punishment && (
            <span className="text-red-400 block">⚡ {item.punishment}</span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">{item.bailableStatus || 'Bailable'}</span>
            <span>•</span>
            <span className="text-slate-400">{item.cognizableStatus || 'Cognizable'}</span>
          </div>
        </div>
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
            title="Edit Section"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Delete Section"
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
        searchPlaceholder="Search by section number, title, content, or IPC mapping..."
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No Legal Sections Found"
        emptySubtitle="Register statutory Bare Act sections (BNS, BNSS, BSA, IPC, Constitution)."
        filterSlot={
          <>
            <select
              value={actName}
              onChange={(e) => setActName(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Bare Acts</option>
              <option value="BNS 2023">BNS 2023</option>
              <option value="BNSS 2023">BNSS 2023</option>
              <option value="BSA 2023">BSA 2023</option>
              <option value="IPC 1860">IPC 1860</option>
              <option value="CrPC 1973">CrPC 1973</option>
              <option value="IEA 1872">IEA 1872</option>
              <option value="Constitution of India">Constitution of India</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </>
        }
        actionSlot={
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Legal Section</span>
          </button>
        }
      />

      {/* Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Section: ${editingItem.actName} Sec. ${editingItem.sectionNumber}` : 'Register Bare Act Section'}
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
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Bare Act *</label>
              <select
                value={formData.actName}
                onChange={(e) => setFormData({ ...formData, actName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-semibold"
              >
                <option value="BNS 2023">BNS 2023</option>
                <option value="BNSS 2023">BNSS 2023</option>
                <option value="BSA 2023">BSA 2023</option>
                <option value="IPC 1860">IPC 1860</option>
                <option value="CrPC 1973">CrPC 1973</option>
                <option value="IEA 1872">IEA 1872</option>
                <option value="Constitution of India">Constitution of India</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Section Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 103, 302, 14"
                value={formData.sectionNumber}
                onChange={(e) => setFormData({ ...formData, sectionNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Old Law Section Equivalent</label>
              <input
                type="text"
                placeholder="e.g. IPC Section 300"
                value={formData.oldLawSection}
                onChange={(e) => setFormData({ ...formData, oldLawSection: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Section Title (English) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Punishment for murder"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Section Title (Gujarati)</label>
              <input
                type="text"
                placeholder="e.g. હત્યા માટેની શિક્ષા"
                value={formData.titleGu}
                onChange={(e) => setFormData({ ...formData, titleGu: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 font-serif focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Statutory Bare Act Content (English) *</label>
            <textarea
              rows={4}
              required
              placeholder="Exact statutory text of the section..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Statutory Bare Act Content (Gujarati)</label>
            <textarea
              rows={3}
              placeholder="ધારાકીય જોગવાઈનો ગુજરાતી અનુવાદ..."
              value={formData.contentGu}
              onChange={(e) => setFormData({ ...formData, contentGu: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-serif text-[12px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Punishment Scope</label>
              <input
                type="text"
                placeholder="e.g. Death or Life Imprisonment"
                value={formData.punishment}
                onChange={(e) => setFormData({ ...formData, punishment: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Bailable Status</label>
              <select
                value={formData.bailableStatus}
                onChange={(e) => setFormData({ ...formData, bailableStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Bailable">Bailable</option>
                <option value="Non-Bailable">Non-Bailable</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Cognizable Status</label>
              <select
                value={formData.cognizableStatus}
                onChange={(e) => setFormData({ ...formData, cognizableStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="Cognizable">Cognizable</option>
                <option value="Non-Cognizable">Non-Cognizable</option>
              </select>
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
              {isSubmitting ? 'Saving...' : editingItem ? 'Update Section' : 'Create Section'}
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
        title="Delete Legal Section"
        message={`Are you sure you want to delete ${deleteTarget?.actName} Section ${deleteTarget?.sectionNumber}?`}
      />
    </div>
  );
}
