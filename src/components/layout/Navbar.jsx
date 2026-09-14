"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Scale, 
  BookOpen, 
  FileText, 
  Award, 
  Search, 
  Layers, 
  Menu, 
  X, 
  User, 
  ShieldCheck,
  BookMarked,
  Building2,
  ChevronRight,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { MockDB } from '@/data/db';
import SyllabusSelectorModal from '@/components/syllabus/SyllabusSelectorModal';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedSem(MockDB.getSelectedSem());

    try {
      const savedRole = localStorage.getItem('userRole') || 'student';
      setRole(savedRole);
    } catch (e) {}
  }, []);

  const handleRoleToggle = () => {
    const nextRole = role === 'student' ? 'admin' : 'student';
    try {
      localStorage.setItem('userRole', nextRole);
    } catch (e) {}
    setRole(nextRole);
    window.location.reload();
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

  // Secondary account / admin links
  const userLinks = mounted ? [
    { name: 'Dashboard', href: '/dashboard', icon: User, show: role === 'student' },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheck, show: role === 'admin' },
  ].filter(l => l.show) : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md font-poppins">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px] gap-2 lg:gap-4">
            
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



            {/* 3. Core Desktop Navigation Links */}
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

            {/* 4. Right Controls: Search, Role Switcher & User Account */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
              {/* Responsive Search Input */}
              <div className="relative w-36 xl:w-44 focus-within:w-48 xl:focus-within:w-56 transition-all duration-300">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Role Switcher Badge */}
              <button 
                onClick={handleRoleToggle}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-wider transition-all flex items-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                    : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                }`}
                title="Click to switch role between Student and Admin"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>Role: {role}</span>
              </button>

              {/* User Account Links */}
              {userLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`p-2 rounded-lg transition-all border ${
                      isActive 
                        ? 'bg-slate-900 border-amber-500/30 text-amber-400' 
                        : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                    title={link.name}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            {/* 5. Mobile & Tablet Trigger Buttons */}
            <div className="flex items-center gap-2 lg:hidden">
              <button 
                onClick={handleRoleToggle}
                className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase border ${
                  role === 'admin' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {role}
              </button>

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

        {/* 6. Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950/98 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-2xl">
            {/* Search Input inside drawer */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search Subjects, BNS Sections, Case Laws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Mobile Navigation Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[...coreLinks, ...userLinks].map((link) => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <button 
                onClick={handleRoleToggle}
                className="text-amber-400 font-bold hover:underline text-left min-h-[40px] flex items-center"
              >
                Switch Role ({role === 'student' ? 'Admin' : 'Student'})
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="text-emerald-400 font-bold hover:underline text-left sm:text-right min-h-[40px] flex items-center"
              >
                Syllabus: {selectedUni ? selectedUni.code : 'GU Law'} • {selectedSem ? `Sem ${selectedSem.num}` : 'Sem 1'} (Change)
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
