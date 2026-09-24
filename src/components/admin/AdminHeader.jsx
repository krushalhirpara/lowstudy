"use client";

import { Menu, ShieldCheck, Database, RefreshCw } from 'lucide-react';

export default function AdminHeader({
  activeTabTitle = 'Dashboard',
  activeTabSubtitle = 'Overview and platform management',
  onOpenMobileMenu,
  onRefresh,
  isRefreshing = false,
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      {/* Left: Mobile Toggle & View Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white lg:hidden"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif-title text-white tracking-wide">
            {activeTabTitle}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {activeTabSubtitle}
          </p>
        </div>
      </div>

      {/* Right: DB Status & Refresh */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* DB Connection Status */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span>Prisma DB Active</span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-750 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        )}

        {/* Admin Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Admin Mode</span>
        </div>
      </div>
    </header>
  );
}
