"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Scale, 
  BookOpen, 
  FileText, 
  Layers, 
  BookMarked,
  Award, 
  Flame, 
  Timer, 
  HelpCircle, 
  Sparkles, 
  PenTool, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  Radio, 
  History, 
  Briefcase, 
  Calculator, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight,
  Command,
  User,
  ExternalLink,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { NAV_ITEMS } from '@/data/navConfig';
import GlobalSearchModal from '@/components/navigation/GlobalSearchModal';

// Icon resolver map for dynamic config rendering
const ICON_MAP = {
  BookOpen,
  FileText,
  Layers,
  BookMarked,
  Award,
  Flame,
  Timer,
  HelpCircle,
  Sparkles,
  PenTool,
  RotateCcw,
  ShieldCheck,
  Building2,
  GraduationCap,
  Radio,
  History,
  Briefcase,
  Calculator,
  Scale
};

function getIcon(name) {
  const Component = ICON_MAP[name] || BookOpen;
  return Component;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [activeDropdown, setActiveDropdown] = useState(null); // 'learn' | 'practice' | 'syllabus' | 'career' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState({}); // { [id]: boolean }
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  // Check active student session
  useEffect(() => {
    let isCancelled = false;

    async function checkSession() {
      try {
        const res = await fetch('/api/student/session');
        const data = await res.json();
        if (!isCancelled) {
          if (data?.authenticated && data?.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        }
      } catch {
        if (!isCancelled) setCurrentUser(null);
      }
    }

    checkSession();
    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      setCurrentUser(null);
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Global Ctrl+K / Cmd+K keyboard shortcut for Search & Click Outside handling
  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setUserMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDropdown = (id) => {
    setActiveDropdown(prev => (prev === id ? null : id));
  };

  const toggleMobileAccordion = (id) => {
    setMobileAccordion(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to determine if a dropdown category is active based on current path
  const isCategoryActive = (category) => {
    if (category.type === 'link') {
      return pathname === category.href;
    }
    if (category.items) {
      return category.items.some(item => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)));
    }
    if (category.groups) {
      return category.groups.some(group => 
        group.items.some(item => pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)))
      );
    }
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md font-poppins border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 lg:gap-6" ref={navContainerRef}>
            
            {/* 1. BRAND / LOGO (LEFT) */}
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                href="/" 
                className="flex items-center gap-2.5 group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
                aria-label="LowStudy Home"
              >
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
                  <span className="hidden sm:block text-[9px] text-slate-500 font-semibold tracking-wider pt-0.5 font-gujarati">
                    ગુજરાત Law Education
                  </span>
                </div>
              </Link>
            </div>

            {/* 2. DESKTOP NAVIGATION (CENTER) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
              {NAV_ITEMS.map((item) => {
                if (item.type === 'link') {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                const isOpen = activeDropdown === item.id;
                const isActive = isCategoryActive(item);

                return (
                  <div key={item.id} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown' && !isOpen) {
                          e.preventDefault();
                          setActiveDropdown(item.id);
                        }
                      }}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                        isOpen
                          ? 'bg-slate-900 text-white font-bold shadow-xs'
                          : isActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'
                      }`} />
                    </button>

                    {/* DROPDOWN FLYOUT MENU */}
                    {isOpen && (
                      <div 
                        className={`absolute top-full mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
                          item.id === 'practice' || item.id === 'career' 
                            ? 'w-[560px] -left-20 xl:left-0' 
                            : 'w-[440px] left-0'
                        }`}
                        role="menu"
                        aria-label={`${item.label} Menu`}
                      >
                        {/* Structure 1: Grouped Subsections (Practice, Career & Tools) */}
                        {item.groups ? (
                          <div className="grid grid-cols-2 gap-3 divide-x divide-slate-100">
                            {item.groups.map((grp, gIdx) => (
                              <div key={grp.title} className={`space-y-1 ${gIdx > 0 ? 'pl-3' : ''}`}>
                                <div className="px-2 py-1 mb-1">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                                    {grp.title}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {grp.items.map((subItem) => {
                                    const Icon = getIcon(subItem.iconName);
                                    const isCurrent = pathname === subItem.href;
                                    return (
                                      <Link
                                        key={subItem.name}
                                        href={subItem.href}
                                        onClick={() => setActiveDropdown(null)}
                                        role="menuitem"
                                        className={`flex items-start gap-2.5 p-2 rounded-xl transition group ${
                                          isCurrent 
                                            ? 'bg-amber-50 text-amber-900 font-semibold' 
                                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                        }`}
                                      >
                                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition ${
                                          isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700'
                                        }`}>
                                          <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                                              {subItem.name}
                                            </span>
                                            {subItem.badge && (
                                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800 border border-slate-200/60">
                                                {subItem.badge}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                            {subItem.desc}
                                          </p>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Structure 2: 2-Column Flat List (Learn, Syllabus) */
                          <div className="grid grid-cols-2 gap-1.5">
                            {item.items.map((subItem) => {
                              const Icon = getIcon(subItem.iconName);
                              const isCurrent = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => setActiveDropdown(null)}
                                  role="menuitem"
                                  className={`flex items-start gap-2.5 p-2 rounded-xl transition group ${
                                    isCurrent 
                                      ? 'bg-amber-50 text-amber-900 font-semibold' 
                                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition ${
                                    isCurrent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 group-hover:bg-amber-50 group-hover:text-amber-700'
                                  }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition">
                                        {subItem.name}
                                      </span>
                                      {subItem.badge && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-800 border border-slate-200/60">
                                          {subItem.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                                      {subItem.desc}
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 3. RIGHT ACTIONS (SEARCH, LOGIN, GET STARTED) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Global Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-2xs"
                title="Search LowStudy (Ctrl+K)"
                aria-label="Search LowStudy"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[9.5px] text-slate-400 font-bold shadow-2xs">
                  ⌘K
                </kbd>
              </button>

              {/* Authentication-dependent actions */}
              {mounted && currentUser ? (
                <>
                  {/* Dashboard Quick Link */}
                  <Link
                    href="/dashboard"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl transition flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dashboard</span>
                  </Link>

                  {/* User Profile Menu Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label="User Account Menu"
                      aria-expanded={userMenuOpen}
                    >
                      {currentUser.avatar ? (
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.fullName || 'User'}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                          {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="hidden sm:inline max-w-[100px] truncate text-slate-800">
                        {currentUser.fullName || currentUser.email?.split('@')[0]}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform ${
                          userMenuOpen ? 'rotate-180 text-amber-600' : ''
                        }`}
                      />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {currentUser.fullName || 'Law Student'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {currentUser.email}
                          </p>
                          <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-bold uppercase tracking-wider">
                            {currentUser.role || 'STUDENT'}
                          </div>
                        </div>

                        <div className="p-1 space-y-0.5">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                            <span>Student Dashboard</span>
                          </Link>

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Logged-out: Login Link */}
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    Login
                  </Link>

                  {/* Logged-out: Get Started Primary CTA */}
                  <Link
                    href="/curriculum"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                </>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ml-1"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* 4. RESPONSIVE MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-8 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
            
            {/* Mobile Search Input Trigger */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Search subjects, BNS, case laws...</span>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
                Search
              </span>
            </button>

            {/* Categories Accordion */}
            <div className="space-y-2 pt-1">
              {NAV_ITEMS.map((item) => {
                if (item.type === 'link') {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition border ${
                        isActive
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-100 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  );
                }

                const isExpanded = mobileAccordion[item.id];
                const isActive = isCategoryActive(item);

                // Collect all items (flatten groups if present)
                const allItems = item.groups 
                  ? item.groups.flatMap(g => g.items) 
                  : item.items;

                return (
                  <div key={item.id} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => toggleMobileAccordion(item.id)}
                      className={`w-full p-3.5 text-left flex items-center justify-between text-xs font-bold transition ${
                        isActive ? 'text-amber-800 bg-amber-50/50' : 'text-slate-800 hover:bg-slate-100/70'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-amber-600' : ''
                      }`} />
                    </button>

                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                        {allItems.map((subItem) => {
                          const Icon = getIcon(subItem.iconName);
                          const isCurrent = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition ${
                                isCurrent ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="flex-1 truncate">{subItem.name}</span>
                              {subItem.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {subItem.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Actions Footer */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {mounted && currentUser ? (
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.fullName || 'User'}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shrink-0">
                        {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.fullName || 'Law Student'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="py-2.5 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-semibold text-xs border border-red-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/curriculum"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </Link>

                  <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Verified Gujarat Syllabus
                    </span>
                    <Link 
                      href="/login" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="font-bold text-slate-800 hover:text-amber-600"
                    >
                      Login →
                    </Link>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </header>

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}
