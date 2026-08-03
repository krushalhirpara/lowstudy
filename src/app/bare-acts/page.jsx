"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  BookMarked, 
  Bot, 
  Copy, 
  Check 
} from 'lucide-react';
import { IPC_VS_BNS_MAP, SUBJECTS_DATA } from '@/data/legalData';
import { MockDB } from '@/data/db';

export default function BareActsPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('bns-ipc');
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    MockDB.init();
  }, []);

  const filteredMap = IPC_VS_BNS_MAP.filter(item => 
    item.ipc.toLowerCase().includes(search.toLowerCase()) || 
    item.bns.toLowerCase().includes(search.toLowerCase()) ||
    item.ipcTitle.toLowerCase().includes(search.toLowerCase())
  );

  const getActiveBareActs = () => {
    let actNameFilter = 'BNS';
    if (activeTab === 'bnss-full') actNameFilter = 'BNSS';
    if (activeTab === 'bsa-full') actNameFilter = 'BSA';
    
    const list = MockDB.state.bareActs || [];
    return list.filter(b => 
      b.actName.toLowerCase().includes(actNameFilter.toLowerCase()) && (
        b.sectionNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.content.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>Statutory Bare Acts Repository</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-title text-white">Bare Acts & BNS 2023 Converter</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Search sections of Bharatiya Nyaya Sanhita (BNS), BNSS, BSA, IPC, CrPC, and Indian Constitution with section-by-section comparative tables.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none flex-nowrap">
        <button 
          onClick={() => setActiveTab('bns-ipc')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center shrink-0 ${
            activeTab === 'bns-ipc' 
              ? 'bg-amber-500 text-slate-950 shadow-lg' 
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          IPC ↔ BNS Mapping
        </button>

        <button 
          onClick={() => setActiveTab('bns-full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center shrink-0 ${
            activeTab === 'bns-full' 
              ? 'bg-amber-500 text-slate-950 shadow-lg' 
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          BNS 2023 (358 Sections)
        </button>

        <button 
          onClick={() => setActiveTab('bnss-full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center shrink-0 ${
            activeTab === 'bnss-full' 
              ? 'bg-amber-500 text-slate-950 shadow-lg' 
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          BNSS 2023 (531 Sections)
        </button>

        <button 
          onClick={() => setActiveTab('bsa-full')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch flex items-center shrink-0 ${
            activeTab === 'bsa-full' 
              ? 'bg-amber-500 text-slate-950 shadow-lg' 
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          BSA 2023 (170 Sections)
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Filter by IPC number, BNS section, or keyword (e.g. Murder, Cheating, 302)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>      {/* Mapping Table / Card View Container */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {activeTab === 'bns-ipc' ? (
          <>
            {/* Desktop View (Standard Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">Old Code (IPC 1860)</th>
                    <th className="py-3.5 px-4 font-semibold">New Code (BNS 2023)</th>
                    <th className="py-3.5 px-4 font-semibold">Offence Title & Provisions</th>
                    <th className="py-3.5 px-4 font-semibold">Status / Change</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMap.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-red-400 line-through decoration-red-500 font-mono">
                        {item.ipc}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                          {item.bns}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">
                        <p className="font-semibold">{item.ipcTitle}</p>
                        <p className="text-[10px] text-slate-450">{item.bnsTitle}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button 
                          onClick={() => handleCopy(`${item.ipc} -> ${item.bns}: ${item.ipcTitle}`, idx)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-350 hover:text-white"
                          title="Copy Mapping"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <Link 
                          href={`/ai-tutor?prompt=${encodeURIComponent(`Explain ${item.bns} (${item.ipcTitle}) with case laws`)}`}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 inline-block"
                          title="Ask AI"
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Card List) */}
            <div className="block md:hidden divide-y divide-slate-800/80">
              {filteredMap.map((item, idx) => (
                <div key={idx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-red-400 line-through decoration-red-500 font-mono">
                        {item.ipc}
                      </span>
                      <span className="text-slate-500 text-[10px]">→</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
                        {item.bns}
                      </span>
                    </div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.ipcTitle}</h4>
                    {item.bnsTitle && <p className="text-[10px] text-slate-400 mt-0.5">{item.bnsTitle}</p>}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button 
                      onClick={() => handleCopy(`${item.ipc} -> ${item.bns}: ${item.ipcTitle}`, idx)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-350 hover:text-white flex items-center justify-center btn-mobile-touch gap-1"
                      title="Copy Mapping"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400 font-mono font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px] font-mono font-bold">Copy</span>
                        </>
                      )}
                    </button>
                    <Link 
                      href={`/ai-tutor?prompt=${encodeURIComponent(`Explain ${item.bns} (${item.ipcTitle}) with case laws`)}`}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center justify-center btn-mobile-touch gap-1"
                      title="Ask AI"
                    >
                      <Bot className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-mono">Ask AI</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Custom Full Code tabs */
          <div className="p-5 space-y-4">
            {getActiveBareActs().map((act) => (
              <div key={act.id} className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{act.sectionNumber}: {act.title}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500">{act.actName}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(`${act.sectionNumber} ${act.title}: ${act.content}`, act.id)}
                    className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                  >
                    {copiedIndex === act.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-line">{act.content}</p>
              </div>
            ))}
            {getActiveBareActs().length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-6 font-semibold">No matching sections found in Mock Database.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
