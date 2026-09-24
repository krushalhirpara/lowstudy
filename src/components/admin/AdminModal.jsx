"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function AdminModal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className={`relative w-full ${maxWidth} my-8 rounded-2xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 z-10 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-thin`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <h3 className="text-lg font-bold text-white font-serif-title flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-slate-200">
          {children}
        </div>
      </div>
    </div>
  );
}
