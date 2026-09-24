"use client";

import { Search, ChevronLeft, ChevronRight, Inbox, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function DataTable({
  columns = [],
  data = [],
  total = 0,
  page = 1,
  limit = 20,
  onPageChange,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterSlot,
  actionSlot,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptySubtitle = 'Get started by creating your first entry.',
}) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-950/80 border border-slate-800/80 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {filterSlot}
          {actionSlot}
        </div>
      </div>

      {/* Table Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    className={`py-3.5 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {/* Error State */}
              {error ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-red-400">{error}</p>
                      {onRetry && (
                        <button
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : isLoading ? (
                /* Loading Skeleton Rows */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={columns.length} className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto space-y-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-750 text-slate-500 flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-300 font-serif-title">{emptyTitle}</h4>
                      <p className="text-xs text-slate-500">{emptySubtitle}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                data.map((item, rowIdx) => (
                  <tr
                    key={item.id || rowIdx}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={col.key || cIdx}
                        className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                      >
                        {col.render ? col.render(item, rowIdx) : item[col.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-950/40 border-t border-slate-850 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{Math.min((page - 1) * limit + 1, total)}</span> to{' '}
              <span className="font-semibold text-slate-200">{Math.min(page * limit, total)}</span> of{' '}
              <span className="font-semibold text-slate-200">{total}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange && onPageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => onPageChange && onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
