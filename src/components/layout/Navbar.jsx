"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Scale, 
  BookOpen, 
  FileText, 
  Award, 
  Search, 
  Layers, 
  Menu, 
  X, 
  BookMarked,
  Building2,
} from 'lucide-react';
import { MockDB } from '@/data/db';
import SyllabusSelectorModal from '@/components/syllabus/SyllabusSelectorModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedSem(MockDB.getSelectedSem());
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/subjects?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Core navigation items
  const coreLinks = [
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Bare Acts', href: '/bare-acts', icon: FileText, badge: 'BNS 2023' },
    { name: 'Case Laws', href: '/case-laws', icon: BookMarked },
    { name: 'Mock Quiz', href: '/quiz', icon: Award },
    { name: 'Dictionary', href: '/dictionary', icon: Layers },
    { name: 'Colleges', href: '/gujarat-law-colleges', icon: Building2 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md font-poppins">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 lg:gap-4">
            
            {/* 1. Brand Logo & GJ Law Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-blue-600 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <Scale className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight text-white flex items-center leading-none">
                    Low<span className="text-amber-400">Study</span>
                    <span className="text-[9px] font-sans px-1.5 py-0.5 ml-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider">
                      GJ Law
                    </span>
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-semibold tracking-wider pt-0.5 font-gujarati">
                    ગુજરાત Law Education
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Core Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {coreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider font-mono">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Search Bar with Embedded Search Button */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative w-44 xl:w-56 focus-within:w-60 transition-all duration-300">
                <input 
                  type="text"
                  placeholder="Search syllabus, BNS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 text-slate-200 text-xs pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500 font-medium"
                />
                <button
                  type="submit"
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Search LowStudy"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* 4. Mobile & Tablet Drawer Trigger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* 5. Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-2xl">
            {/* Search Input inside drawer */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text"
                placeholder="Search Subjects, BNS Sections, Case Laws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60 font-medium"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Navigation Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {coreLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold' 
                        : 'bg-slate-900/60 border-slate-850 text-slate-200 hover:bg-amber-500/10 hover:text-amber-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="text-[8px] px-1.5 py-0.2 ml-auto rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold font-mono">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Context Actions */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Syllabus Context:</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="text-emerald-400 font-bold hover:underline min-h-[40px] flex items-center gap-1"
              >
                {selectedUni ? selectedUni.code : 'GU Law'} • {selectedSem ? `Sem ${selectedSem.num}` : 'Sem 1'} (Change)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Syllabus Selector Modal */}
      <SyllabusSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectComplete={() => window.location.reload()}
      />
    </>
  );
}
