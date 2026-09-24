"use client";

import { useState, useEffect, useRef } from 'react';
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
  HelpCircle,
  Timer,
  LayoutDashboard,
  Bot,
  CalendarDays,
  PenTool,
  Flame,
  ChevronDown
} from 'lucide-react';
import { MockDB } from '@/data/db';
import SyllabusSelectorModal from '@/components/syllabus/SyllabusSelectorModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [practiceDropdownOpen, setPracticeDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedSem(MockDB.getSelectedSem());

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPracticeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/subjects?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // 1. Primary visible desktop navigation items
  const primaryDesktopLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Exam Mode', href: '/exam-mode', icon: Flame, badge: 'Focus' },
    { name: 'AI Tutor', href: '/ai-tutor', icon: Bot, badge: 'Smart' },
    { name: 'SU Sem 3', href: '/saurashtra-university/llb/semester-3/', icon: Layers, badge: 'Official' },
  ];

  // 2. Dropdown modules for desktop navigation
  const dropdownLinks = [
    { name: 'MCQ Practice', href: '/quiz', icon: Award, badge: 'New', desc: 'Syllabus-aligned MCQs' },
    { name: 'Question Bank', href: '/question-bank', icon: HelpCircle, desc: 'Curated university questions' },
    { name: 'Answer Writing', href: '/practice-writing', icon: PenTool, badge: 'AI', desc: 'AI practice evaluation against model answers' },
    { name: 'Mock Tests', href: '/mock-test', icon: Timer, badge: 'Official', desc: 'Timed simulated exam papers' },
    { name: 'Previous Papers', href: '/previous-papers', icon: FileText, badge: 'PYQs', desc: 'Official Saurashtra University papers' },
    { name: 'Revision & Mistakes', href: '/revision', icon: BookMarked, badge: 'Active', desc: 'Spaced repetition & mistake tracking' },
    { name: 'Study Plan', href: '/study-plan', icon: CalendarDays, badge: 'Adaptive', desc: 'Personalized syllabus preparation plan' },
    { name: 'Bare Acts', href: '/bare-acts', icon: FileText, badge: 'BNS 2023', desc: 'Updated Bharatiya Nyaya Sanhita acts' },
  ];

  // All navigation items for mobile drawer
  const coreLinks = [
    ...primaryDesktopLinks,
    ...dropdownLinks,
  ];

  const isDropdownActive = dropdownLinks.some(l => pathname === l.href);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md font-poppins border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-5">
            
            {/* 1. Brand Logo & GJ Law Badge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <Link href="/" className="flex items-center gap-2 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-blue-600 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                    <Scale className="w-4.5 h-4.5 text-amber-600 group-hover:rotate-12 transition-transform duration-200" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 flex items-center leading-none whitespace-nowrap">
                    Low<span className="text-amber-600">Study</span>
                    <span className="hidden xs-360:inline-flex text-[8.5px] font-sans px-1.5 py-0.5 ml-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase tracking-wider whitespace-nowrap">
                      GJ Law
                    </span>
                  </span>
                  <span className="hidden xs-375:block text-[9.5px] text-slate-500 font-semibold tracking-wider pt-0.5 font-gujarati truncate whitespace-nowrap">
                    ગુજરાત Law Education
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Core Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
              {primaryDesktopLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`whitespace-nowrap shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isActive 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{link.name}</span>
                    {link.badge && (
                      <span className="whitespace-nowrap shrink-0 text-[8.5px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold font-mono">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Dropdown for Practice Modules */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setPracticeDropdownOpen(!practiceDropdownOpen)}
                  className={`whitespace-nowrap shrink-0 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDropdownActive || practiceDropdownOpen
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="whitespace-nowrap">Practice & PYQs</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${practiceDropdownOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>

                {practiceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Learning & Practice Hub
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {dropdownLinks.map((subLink) => {
                        const SubIcon = subLink.icon;
                        const isSubActive = pathname === subLink.href;
                        return (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            onClick={() => setPracticeDropdownOpen(false)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                              isSubActive 
                                ? 'bg-amber-50 text-amber-900 font-bold' 
                                : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                              <SubIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold whitespace-nowrap">{subLink.name}</span>
                                {subLink.badge && (
                                  <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold font-mono whitespace-nowrap">
                                    {subLink.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">{subLink.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* 3. Search Bar with Embedded Search Button */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <form onSubmit={handleSearchSubmit} className="relative w-48 xl:w-60 focus-within:w-64 transition-all duration-300">
                <input 
                  type="text"
                  placeholder="Search syllabus, BNS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500/60 focus:bg-white focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-600 transition-colors"
                  title="Search LowStudy"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* 4. Mobile & Tablet Drawer Trigger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* 5. Mobile & Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Search Input inside drawer */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text"
                placeholder="Search Subjects, BNS Sections, Case Laws..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500/60 font-medium"
              />
              <button
                type="submit"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-600"
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
                        ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap truncate">{link.name}</span>
                    {link.badge && (
                      <span className="text-[8px] px-1.5 py-0.2 ml-auto rounded bg-amber-100 text-amber-800 border border-amber-200 font-bold font-mono whitespace-nowrap shrink-0">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Context Actions */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
              <span className="text-slate-500 text-xs whitespace-nowrap">Syllabus Context:</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="text-emerald-600 font-bold hover:underline min-h-[40px] flex items-center gap-1 whitespace-nowrap"
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
