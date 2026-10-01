"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Activity,
  BarChart3,
  KeyRound,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Search,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/ceoadmin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/ceoadmin/users', icon: Users },
  { label: 'Blog & Content Hub', href: '/ceoadmin/blog', icon: BookOpen },
  { label: 'Live Activity', href: '/ceoadmin/activity', icon: Activity },
  { label: 'Page Analytics', href: '/ceoadmin/analytics', icon: BarChart3 },
  { label: 'Login Analytics', href: '/ceoadmin/logins', icon: KeyRound },
];

export default function AdminLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // If this is the login page (/ceoadmin), do not render the dashboard shell
  const isLoginPage = pathname === '/ceoadmin' || pathname === '/ceoadmin/';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/ceoadmin/auth')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, [isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/ceoadmin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {}
    router.push('/ceoadmin');
    router.refresh();
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
            LS
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">LowStudy CEO</div>
            <div className="text-[10px] text-slate-400">Executive Console</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center text-base shadow-lg shadow-amber-500/20">
              LS
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                LowStudy CEO
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                Private Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {adminUser?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {adminUser?.fullName || 'CEO Admin'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {adminUser?.email || 'ceoadmin@lowstudy.com'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors flex-shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-slate-300">
              Executive Dashboard
            </div>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Live Production
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-400">
              Environment: <span className="text-slate-200 font-mono font-medium">Production (Vercel)</span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
