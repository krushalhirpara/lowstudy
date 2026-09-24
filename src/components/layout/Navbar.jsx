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
  ChevronDown,
  Sparkles,
  Briefcase,
  Calculator,
  ShieldCheck,
  History,
  GraduationCap,
  ArrowRight,
  User
} from 'lucide-react';
import { MockDB } from '@/data/db';
import SyllabusSelectorModal from '@/components/syllabus/SyllabusSelectorModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'learn' | 'practice' | 'ai' | 'syllabus' | 'career'
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const dropdownContainerRef = useRef(null);
  
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setSelectedUni(MockDB.getSelectedUni());
    setSelectedSem(MockDB.getSelectedSem());

    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/research?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navCategories = [
    {
      id: 'learn',
      label: 'Learn',
      links: [
        { name: 'Semester Subjects', href: '/subjects', icon: BookOpen, desc: 'All semester syllabus notes & unit breakdown', badge: 'Core' },
        { name: 'Bare Acts (BNS 2023)', href: '/bare-acts', icon: FileText, desc: 'Bharatiya Nyaya Sanhita, BNSS, BSA & CPC', badge: 'Updated' },
        { name: 'Landmark Case Laws', href: '/case-laws', icon: Scale, desc: 'Supreme Court precedents & ratio decidendi', badge: 'Precedents' },
        { name: 'Legal Dictionary', href: '/dictionary', icon: BookMarked, desc: 'Gujarati-English definitions & Latin maxims' },
        { name: 'Saurashtra Univ Sem 3', href: '/saurashtra-university/llb/semester-3/', icon: Layers, desc: 'Labour Law, Taxation, Banking & Cyber notes', badge: 'Official' }
      ]
    },
    {
      id: 'practice',
      label: 'Practice',
      links: [
        { name: 'MCQ Practice & Quiz', href: '/quiz', icon: Award, desc: 'Syllabus-aligned multiple choice question banks', badge: 'Quiz' },
        { name: 'AI Legal Drafting Lab', href: '/practice/drafting', icon: PenTool, desc: 'Draft notices, plaints, bail petitions with AI critique', badge: 'New' },
        { name: 'Virtual Moot Court', href: '/practice/moot-court', icon: Scale, desc: 'Memorial builder & AI Judicial bench simulation', badge: 'Advocacy' },
        { name: 'AI Exam Answer Grader', href: '/practice/answer-evaluator', icon: Sparkles, desc: 'Instant IRAC evaluation & score prediction', badge: 'AI' },
        { name: 'Timed Mock Tests', href: '/mock-test', icon: Timer, desc: 'Simulated 3-hour university exam papers', badge: 'Official' },
        { name: 'Previous Year Papers', href: '/previous-papers', icon: FileText, desc: 'Saurashtra & Gujarat University PYQs', badge: 'PYQs' },
        { name: 'Spaced Revision & Mistakes', href: '/revision', icon: BookMarked, desc: 'Automated weak topic memory retention', badge: 'Active' },
        { name: 'Exam Focus Mode', href: '/exam-mode', icon: Flame, desc: 'Distraction-free high-intensity revision', badge: 'Focus' }
      ]
    },
    {
      id: 'ai',
      label: 'NyayaAI',
      links: [
        { name: 'Ask NyayaAI Tutor', href: '/ai-tutor', icon: Bot, desc: 'Multilingual legal AI grounded in Gujarat syllabus', badge: '24/7' },
        { name: 'Legal Research & Ratio Search', href: '/research', icon: Search, desc: 'Search precedents, doctrines, and citations', badge: 'Smart' },
        { name: 'AI Document Analyzer', href: '/ai/document-analyzer', icon: FileText, desc: 'Analyze pleadings, FIRs & judgments instantly', badge: 'Instant' },
        { name: 'Exam Answer Evaluator', href: '/practice/answer-evaluator', icon: Award, desc: 'Submit written answers for AI grading rubric' }
      ]
    },
    {
      id: 'syllabus',
      label: 'Syllabus Intelligence',
      links: [
        { name: 'Current Verified Syllabus', href: '/curriculum', icon: ShieldCheck, desc: 'Official 2026-27 Gujarat university syllabus', badge: 'Verified' },
        { name: 'Syllabus Version History', href: '/syllabus/history', icon: History, desc: 'Track university syllabus changes & diffs' },
        { name: 'Gujarat Law Universities', href: '/universities', icon: Building2, desc: 'GU, SU, VNSGU, MSU, HNGU, GNLU portals' },
        { name: 'Law Colleges Directory', href: '/gujarat-law-colleges', icon: GraduationCap, desc: 'Affiliated colleges across Gujarat' }
      ]
    },
    {
      id: 'career',
      label: 'Career & Tools',
      links: [
        { name: 'Court & Chamber Internships', href: '/career', icon: Briefcase, desc: 'Gujarat High Court clerkships & advocate chamber guidelines', badge: 'Careers' },
        { name: 'Judicial Services Roadmap', href: '/career', icon: Scale, desc: 'Gujarat Civil Judge (JMFC) syllabus & preparation' },
        { name: 'Legal Academic Calculators', href: '/tools', icon: Calculator, desc: 'Limitation Act, Sec 34 CPC interest & court fee calculators', badge: 'Tools' },
        { name: 'BNS ↔ IPC Comparison Map', href: '/bns-vs-ipc', icon: Layers, desc: 'Quick reference converter between old and new penal laws' },
        { name: 'Adaptive Study Planner', href: '/study-plan', icon: CalendarDays, desc: 'Personalized daily study schedules' }
      ]
    }
  ];

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const uniLabel = typeof selectedUni === 'object' && selectedUni !== null
    ? (selectedUni.code || selectedUni.shortName || selectedUni.id || '').toUpperCase()
    : typeof selectedUni === 'string'
    ? selectedUni.toUpperCase()
    : '';

  const semLabel = typeof selectedSem === 'object' && selectedSem !== null
    ? (selectedSem.num || selectedSem.number || selectedSem.id?.replace('sem', '') || 1)
    : selectedSem || 1;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md font-poppins border-b border-slate-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-5" ref={dropdownContainerRef}>
            
            {/* 1. Brand Logo */}
            <div className="flex items-center gap-3 shrink-0 min-w-0">
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md group-hover:bg-amber-600 transition-colors shrink-0">
                  <Scale className="w-5 h-5 text-amber-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center leading-none">
                    Low<span className="text-amber-600">Study</span>
                    <span className="hidden sm:inline-flex text-[8px] font-sans px-1.5 py-0.5 ml-1.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase tracking-wider">
                      Legal EdTech OS
                    </span>
                  </span>
                  <span className="hidden sm:block text-[9.5px] text-slate-500 font-semibold tracking-wider pt-0.5 font-gujarati">
                    ગુજરાત Law Education
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. Desktop Mega Dropdowns */}
            <nav className="hidden xl:flex items-center gap-1 shrink-0">
              {navCategories.map((cat) => {
                const isOpen = activeDropdown === cat.id;
                const isCatActive = cat.links.some(l => pathname === l.href);

                return (
                  <div key={cat.id} className="relative">
                    <button
                      onClick={() => toggleDropdown(cat.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isOpen || isCatActive
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-600' : 'text-slate-400'}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-1">
                          {cat.links.map((link) => {
                            const Icon = link.icon;
                            const isCurrent = pathname === link.href;
                            return (
                              <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                                  isCurrent ? 'bg-amber-50/80 text-amber-900' : 'hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold text-slate-900">{link.name}</span>
                                    {link.badge && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                        {link.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                    {link.desc}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Direct Dashboard Link */}
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/dashboard'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-600" />
                <span>Dashboard</span>
              </Link>
            </nav>

            {/* 3. Search Bar Shortcut (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-[220px] lg:max-w-[260px] w-full">
              <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case, BNS section..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </form>

            {/* 4. Action CTAs */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* University Selector Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                title="Change Gujarat University / Semester"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline font-bold">
                  {uniLabel ? `${uniLabel} Sem ${semLabel}` : 'Select University'}
                </span>
                <span className="sm:hidden font-bold">
                  {uniLabel ? uniLabel : 'Univ'}
                </span>
              </button>

              {/* Start Learning Free Primary CTA */}
              <Link
                href="/curriculum"
                className="hidden xs-430:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>Start Learning</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>

              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* 5. Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases, BNS sections, topics..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </form>

            {/* Mobile Categories Accordion */}
            <div className="space-y-3 pt-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs font-bold text-amber-900"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  <span>Student Dashboard</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </Link>

              {navCategories.map((cat) => (
                <div key={cat.id} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block mb-2">
                    {cat.label}
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {cat.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium text-slate-800 hover:bg-white transition"
                        >
                          <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="flex-1 truncate">{link.name}</span>
                          {link.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Gujarat Syllabus
              </span>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="font-bold text-slate-800 hover:text-amber-600">
                Admin Sign In →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Syllabus Selector Modal */}
      <SyllabusSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectComplete={() => {
          MockDB.init();
          setSelectedUni(MockDB.getSelectedUni());
          setSelectedSem(MockDB.getSelectedSem());
        }}
      />
    </>
  );
}
