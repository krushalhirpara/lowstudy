"use client";

import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import AdminModal from './AdminModal';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  isLoading = false,
  danger = true,
}) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${danger ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'} shrink-0`}>
            {danger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <p className="text-sm text-slate-300 leading-relaxed pt-1">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
              danger
                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/20'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
