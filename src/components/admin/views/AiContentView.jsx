"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Plus, Send, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import DataTable from '../DataTable';
import AdminModal from '../AdminModal';

export default function AiContentView({ onTriggerAlert, onNavigate }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate Draft Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    entityType: 'NOTES',
    prompt: '',
    generatedContent: '',
    language: 'EN',
    modelName: 'gemini-1.5-flash',
  });

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        entityType,
      });
      const res = await fetch(`/api/admin/ai-content?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load AI content logs');
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
  }, [page, entityType]);

  const handleOpenGenerate = () => {
    setFormData({
      entityType: 'NOTES',
      prompt: '',
      generatedContent: '',
      language: 'EN',
      modelName: 'gemini-1.5-flash',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSimulateAiGeneration = () => {
    if (!formData.prompt.trim()) {
      setFormError('Please input a legal prompt to simulate NyayaAI generation.');
      return;
    }

    setFormData({
      ...formData,
      generatedContent: `[NyayaAI Legal Synthesis]\nAnalysis for query: "${formData.prompt}"\n\nStatutory Foundation: BNS 2023 / Indian Legal Precedents.\nCore Rule: In accordance with statutory provisions, liability requires both mens rea and actus reus unless strict liability is statutorily mandated.\nRatio Reference: State of Maharashtra v. M.H. George (1965).`,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.prompt.trim() || !formData.generatedContent.trim()) {
      setFormError('Prompt and Generated Content are required.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/ai-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to stage AI draft');

      setIsModalOpen(false);
      onTriggerAlert && onTriggerAlert('AI Draft created and staged safely into Review Queue!');
      loadData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const columns = [
    {
      header: 'Type & Model',
      render: (item) => (
        <div className="space-y-1">
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] block text-center">
            {item.entityType}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block text-center">
            {item.modelName}
          </span>
        </div>
      ),
    },
    {
      header: 'Prompt & Synthesis Preview',
      render: (item) => (
        <div className="space-y-1 max-w-md">
          <p className="font-semibold text-white text-xs">{item.prompt}</p>
          <p className="text-slate-400 text-[11px] line-clamp-2 italic font-mono">
            {item.generatedContent}
          </p>
        </div>
      ),
    },
    {
      header: 'Workflow Stage',
      render: (item) => (
        <div className="space-y-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800 block text-center">
            {item.workflowStage}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block text-center">
            Verif: {item.verificationStatus}
          </span>
        </div>
      ),
    },
    {
      header: 'Date Created',
      render: (item) => (
        <span className="text-[11px] text-slate-400 font-mono">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
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
        isLoading={isLoading}
        error={error}
        onRetry={loadData}
        emptyTitle="No AI Generations Logged"
        emptySubtitle="NyayaAI study assistant generation logs and drafts appear here."
        filterSlot={
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Content Types</option>
            <option value="NOTES">Notes</option>
            <option value="MCQ">MCQs</option>
            <option value="MODEL_ANSWER">Model Answer</option>
            <option value="SUMMARY">Summary</option>
          </select>
        }
        actionSlot={
          <button
            onClick={handleOpenGenerate}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Draft</span>
          </button>
        }
      />

      {/* Generate Draft Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="NyayaAI Content Ingestion & Drafting Studio"
        maxWidth="max-w-2xl"
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
              <label className="text-slate-400 font-mono font-semibold">Entity Type</label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="NOTES">Revision Notes</option>
                <option value="MCQ">Practice MCQ</option>
                <option value="MODEL_ANSWER">Model Answer</option>
                <option value="SUMMARY">Statutory Summary</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-mono font-semibold">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                <option value="EN">English</option>
                <option value="GU">Gujarati</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Study Prompt / Syllabus Query *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. Explain Difference between Austin and Hart concepts of law..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleSimulateAiGeneration}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700 text-xs font-mono font-bold shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate</span>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 font-mono font-semibold">Generated Content (Staged as DRAFT) *</label>
            <textarea
              rows={5}
              required
              placeholder="Generated legal text (will be placed into review queue with safe DRAFT default)..."
              value={formData.generatedContent}
              onChange={(e) => setFormData({ ...formData, generatedContent: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono text-[11px]"
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
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
            >
              {isGenerating ? 'Staging...' : 'Submit to Review Queue'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
