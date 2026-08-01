"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Scale, 
  BookOpen, 
  FileText, 
  Bot, 
  Award, 
  Search, 
  Flame, 
  Layers, 
  Menu, 
  X, 
  User, 
  ShieldCheck,
  BookMarked,
  Sparkles,
  Lock
} from 'lucide-react';
import { USER_STUDENT_PROFILE } from '@/data/legalData';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Primary learning links
  const coreLinks = [
    { name: 'Subjects', href: '/subjects', icon: BookOpen },
    { name: 'Bare Acts', href: '/bare-acts', icon: FileText, badge: 'BNS 2023' },
    { name: 'Case Laws', href: '/case-laws', icon: BookMarked },
    { name: 'Mock Quiz', href: '/quiz', icon: Award },
    { name: 'Dictionary', href: '/dictionary', icon: Layers },
  ];

  // Secondary account/admin links (segregated based on role)
  const userLinks = mounted ? [
    { name: 'Dashboard', href: '/dashboard', icon: User, show: role === 'student' },
    { name: 'Admin Panel', href: '/admin', icon: ShieldCheck, show: role === 'admin' },
  ].filter(l => l.show) : [];

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-600 to-blue-600 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Scale className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-serif-title tracking-tight text-white flex items-center gap-0.5">
                Low<span className="text-amber-400">Study</span>
                <span className="text-[9px] font-sans px-1 py-0.2 ml-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">.com</span>
              </span>
              <span className="text-[10px] text-slate-400 font-devanagari-serif tracking-wider font-semibold">
                धर्मो रक्षति रक्षितः
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {coreLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : link.highlight
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.highlight ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold tracking-wider font-sans">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search bar & Secondary Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Elegant Search Input */}
            <div className="relative w-40 xl:w-44 focus-within:w-48 xl:focus-within:w-56 transition-all duration-300">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 text-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Role Switcher Widget */}
            <button 
              onClick={handleRoleToggle}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
              }`}
              title="Click to toggle user role"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${role === 'admin' ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`} />
              <span>Role: {role}</span>
            </button>

            {/* User Links */}
            {userLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`p-1.5 rounded-lg transition-all border ${
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

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Mobile Role Switcher */}
            <button 
              onClick={handleRoleToggle}
              className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                role === 'admin' ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              {role}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 backdrop-blur-lg border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          {/* Search bar inside drawer */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search Act, Section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500/60"
            />
          </div>
 
          {/* Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[...coreLinks, ...userLinks].map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold transition-all btn-mobile-touch ${
                    isActive 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                      : 'bg-slate-900/60 border-slate-850 text-slate-200 hover:bg-amber-500/10 hover:text-amber-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[8px] px-1 py-0.2 ml-auto rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold tracking-wider">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
 
          {/* Role Indicator / Switch Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-slate-900/40 border border-slate-850 text-xs text-slate-400 font-medium">
            <button 
              onClick={handleRoleToggle}
              className="text-amber-400 font-bold hover:underline text-left btn-mobile-touch flex items-center"
            >
              Switch Role ({role === 'student' ? 'Admin' : 'Student'})
            </button>
            <span className="sm:text-right">Target: {USER_STUDENT_PROFILE.targetExam}</span>
          </div>
        </div>
      )}
    </nav>
  );
}
