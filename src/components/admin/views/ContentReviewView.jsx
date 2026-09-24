"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ExternalLink, RefreshCw, Send, Loader2 } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';

export default function ContentReviewView({ onTriggerAlert }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stageFilter, setStageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [entityType, setEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        stage: stageFilter,
        status: statusFilter,
        entityType,
      });
      const res = await fetch(`/api/admin/content-review?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load review queue');
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
  }, [page, stageFilter, statusFilter, entityType]);

  const handleOpenReview = (item) => {
    setSelectedItem(item);
    setReviewStatus('APPROVED');
    setRemarks('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/admin/moderation/${selectedItem.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus,
          remarks: remarks || `Review decision: ${reviewStatus}`,
          reviewerId: 'usr-admin-01',
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Review submission failed');

      setSelectedItem(null);
      onTriggerAlert && onTriggerAlert(`Review recorded as ${reviewStatus}!`);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePromoteToLive = async (item) => {
    setIsPromoting(true);
    try {
      const res = await fetch(`/api/admin/moderation/${item.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorId: 'usr-admin-01' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Publishing failed');

      onTriggerAlert && onTriggerAlert('Content promoted and published to live official curriculum!');
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleTransition = async (item, targetStage) => {
    try {
      const res = await fetch(`/api/admin/moderation/${item.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStage, actorId: 'usr-admin-01' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Transition failed');

      onTriggerAlert && onTriggerAlert(`Moved to ${targetStage}`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    {
      header: 'Workflow Stage',
      render: (item) => {
        let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
        if (item.workflowStage === 'AI_GENERATED') badgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        if (item.workflowStage === 'DRAFT') badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        if (item.workflowStage === 'ADMIN_REVIEW') badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        if (item.workflowStage === 'VERIFIED') badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        if (item.workflowStage === 'PUBLISHED') badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        if (item.workflowStage === 'REJECTED') badgeColor = 'bg-red-500/10 text-red-400 border-red-500/30';

        return (
          <div className="space-y-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border block text-center ${badgeColor}`}>
              {item.workflowStage}
            </span>
            <span className="text-[10px] font-mono text-slate-500 block text-center">
              Status: {item.verificationStatus}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Type & Prompt',
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
            {item.entityType} • {item.language}
          </span>
          <p className="font-semibold text-white text-xs line-clamp-1">{item.prompt}</p>
          <p className="text-slate-400 text-[11px] line-clamp-2 italic">
            "{item.generatedContent}"
          </p>
        </div>
      ),
    },
    {
      header: 'Model & Verification',
      render: (item) => (
        <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
          <span className="text-slate-300 block font-semibold">{item.modelName}</span>
          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          {item.verifiedBy && (
            <span className="text-emerald-400 block font-bold">By {item.verifiedBy.fullName || 'Admin'}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Stage Actions',
      align: 'right',
      render: (item) => (
        <div className="flex flex-col items-end gap-1.5">
          {item.workflowStage === 'AI_GENERATED' && (
            <button
              onClick={() => handleTransition(item, 'DRAFT')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold"
            >
              Stage to Draft →
            </button>
          )}

          {item.workflowStage === 'DRAFT' && (
            <button
              onClick={() => handleTransition(item, 'ADMIN_REVIEW')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 text-[11px] font-mono font-bold"
            >
              Submit to Review →
            </button>
          )}

          {item.workflowStage === 'ADMIN_REVIEW' && (
            <button
              onClick={() => handleOpenReview(item)}
              className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold shadow-md shadow-amber-500/10"
            >
              Conduct Review
            </button>
          )}

          {item.workflowStage === 'VERIFIED' && item.status !== 'PUBLISHED' && (
            <button
              onClick={() => handlePromoteToLive(item)}
              disabled={isPromoting}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1"
            >
              <span>Publish to Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {item.status === 'PUBLISHED' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              Live on LowStudy
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Explanation Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Governance Pipeline:</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono whitespace-nowrap">
          <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">1. AI Generated</span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">2. Draft</span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">3. Admin Review</span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">4. Verified</span>
          <span className="text-slate-600">→</span>
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">5. Published</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        limit={15}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="Review Queue Clear"
        emptySubtitle="No items pending in the moderation workflow."
        filterSlot={
          <>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Stages</option>
              <option value="AI_GENERATED">AI Generated</option>
              <option value="DRAFT">Draft</option>
              <option value="ADMIN_REVIEW">Admin Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="NOTES">Notes</option>
              <option value="MCQ">MCQ</option>
              <option value="MODEL_ANSWER">Model Answer</option>
            </select>
          </>
        }
      />

      {/* Review Action Modal */}
      <AdminModal
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Faculty & Admin Legal Accuracy Audit"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Prompt Generated</span>
            <p className="text-xs text-white font-semibold">{selectedItem?.prompt}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">AI Generated Legal Text</span>
            <p className="text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {selectedItem?.generatedContent}
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Audit Decision *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'APPROVED', label: 'Approve & Verify', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
                { id: 'CHANGES_REQUESTED', label: 'Request Changes', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
                { id: 'REJECTED', label: 'Reject / Hallucinated', color: 'text-red-400 border-red-500/40 bg-red-500/10' },
              ].map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setReviewStatus(choice.id)}
                  className={`p-2.5 rounded-xl border text-center font-bold font-mono text-xs transition-all ${
                    reviewStatus === choice.id ? `${choice.color} shadow-lg ring-1 ring-amber-400/50` : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Review Remarks & Citations Check</label>
            <textarea
              rows={2}
              placeholder="State reasons for approval or highlight hallucinated sections..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
            >
              {isSubmittingReview ? 'Submitting...' : 'Record Audit Decision'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
