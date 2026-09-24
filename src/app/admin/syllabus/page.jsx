"use client";

import { useState, useEffect } from 'react';
import { Lock, Check } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import SyllabusIntelligenceView from '@/components/admin/views/SyllabusIntelligenceView';

export default function AdminSyllabusPage() {
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const storedRole = localStorage.getItem('userRole') || 'student';
      setRole(storedRole);
    } catch (e) {
      setRole('student');
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/syllabus/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json);
      }
    } catch (e) {
      console.error('Error fetching admin syllabus stats:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3500);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading LowStudy Syllabus Intelligence Console...
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-serif-title text-white">Admin Verification Required</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official Syllabus Intelligence & Ingestion Center is restricted to authorized Legal Editors and Administrators.
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => {
                try {
                  localStorage.setItem('userRole', 'admin');
                } catch (e) {}
                setRole('admin');
                triggerAlert('Switched to Administrator session.');
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
            >
              Switch to Admin Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {alertMsg && (
        <div className="fixed bottom-6 right-6 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      <AdminSidebar
        activeTab="syllabus-intelligence"
        onSelectTab={() => {}}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        badgeCounts={{
          pendingReviews: stats?.stats?.pendingReviews || 0,
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          activeTabTitle="Syllabus Intelligence Command Center"
          activeTabSubtitle="Official Gujarat University source monitoring, AI extraction diffs, and verification"
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefresh={loadStats}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-3 xs-360:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-clip min-w-0">
          <SyllabusIntelligenceView onTriggerAlert={triggerAlert} />
        </main>
      </div>
    </div>
  );
}
