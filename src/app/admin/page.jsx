"use client";

import { useState, useEffect } from 'react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

// Entity Views
import DashboardView from '@/components/admin/views/DashboardView';
import UniversitiesView from '@/components/admin/views/UniversitiesView';
import CoursesView from '@/components/admin/views/CoursesView';
import SemestersView from '@/components/admin/views/SemestersView';
import SubjectsView from '@/components/admin/views/SubjectsView';
import UnitsView from '@/components/admin/views/UnitsView';
import TopicsView from '@/components/admin/views/TopicsView';
import NotesView from '@/components/admin/views/NotesView';
import LegalSectionsView from '@/components/admin/views/LegalSectionsView';
import CaseLawsView from '@/components/admin/views/CaseLawsView';
import QuestionsView from '@/components/admin/views/QuestionsView';
import McqsView from '@/components/admin/views/McqsView';
import PreviousPapersView from '@/components/admin/views/PreviousPapersView';
import MockTestsView from '@/components/admin/views/MockTestsView';
import StudentsView from '@/components/admin/views/StudentsView';
import AiContentView from '@/components/admin/views/AiContentView';
import ContentReviewView from '@/components/admin/views/ContentReviewView';
import AnalyticsView from '@/components/admin/views/AnalyticsView';
import SettingsView from '@/components/admin/views/SettingsView';
import SyllabusIntelligenceView from '@/components/admin/views/SyllabusIntelligenceView';

const TAB_TITLES = {
  dashboard: { title: 'Platform Command Center', subtitle: 'Overview of Gujarat Law curriculums, student metrics, and ads monetization' },
  'syllabus-intelligence': { title: 'Syllabus Intelligence Command Center', subtitle: 'Automated monitoring of Gujarat universities, AI extraction, change diffs, and verification' },
  universities: { title: 'Universities Management', subtitle: 'Manage Gujarat state public and national law universities' },
  courses: { title: 'Degree Programs & Courses', subtitle: 'Manage 3-Yr LL.B., 5-Yr Integrated Law, and LL.M. courses' },
  semesters: { title: 'Semesters Structure', subtitle: 'Manage semester terms (1 through 10) assigned to law degrees' },
  subjects: { title: 'Curriculum Subjects', subtitle: 'Manage subject codes, credits, syllabus versions (BNS 2023 vs IPC 1860)' },
  units: { title: 'Syllabus Units & Modules', subtitle: 'Organize official curriculum units within law subjects' },
  topics: { title: 'Study Topics & Concepts', subtitle: 'Granular legal topics, doctrines, and syllabus sections' },
  notes: { title: 'Bilingual Exam Notes', subtitle: 'Dual English & Gujarati quick revision notes, detailed answers, and mnemonics' },
  'legal-sections': { title: 'Statutory Legal Sections', subtitle: 'Bare Acts (BNS, BNSS, BSA, IPC, CrPC, Constitution) with procedural tags' },
  'case-laws': { title: 'Landmark Case Laws', subtitle: 'Judicial precedents, constitutional bench rulings, and ratio decidendi' },
  questions: { title: 'Descriptive Exam Questions', subtitle: 'University past exam questions, marks distribution, and IRAC model answers' },
  mcqs: { title: 'Practice & Exam MCQs', subtitle: '4-Option multiple choice questions with detailed legal explanations' },
  'previous-papers': { title: 'Previous Examination Papers', subtitle: 'Archive official past university examination question papers and PDFs' },
  'mock-tests': { title: 'Timed Mock Examinations', subtitle: 'Simulated examination environments with negative marking and pass metrics' },
  students: { title: 'Student Management', subtitle: 'Manage student accounts, gamification progress, and active states' },
  'ai-content': { title: 'NyayaAI Content Ingestion', subtitle: 'AI-generated study materials, drafts, and prompt synthesis logs' },
  'content-review': { title: 'Faculty & Admin Content Review', subtitle: 'Enforce strict 5-stage verification before official curriculum publishing' },
  analytics: { title: 'Platform Analytics', subtitle: 'Curriculum coverage, difficulty distributions, and student test performance' },
  settings: { title: 'Platform & AdSense Settings', subtitle: 'Configure Google AdSense slots, premium content gating, and system flags' },
};

export default function AdminPage() {
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize and check role
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
      const res = await fetch('/api/admin/stats');
      const json = await res.json();
      if (json.success) {
        setStats(json);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
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
        Initializing LowStudy administrative console...
      </div>
    );
  }

  // Role Access Guard (Preserving existing user role guard)
  if (role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-lg">
            <Lock className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-serif-title text-white">Admin Access Restricted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student account detected. You must be authenticated with Administrator privileges to manage global Bare Act databases, curricula, and AdSense configurations.
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

  const activeConfig = TAB_TITLES[activeTab] || { title: 'Admin Workspace', subtitle: 'Platform Management' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Toast Alert Notification */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Navigation Sidebar (Collapsible & Mobile Drawer) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        badgeCounts={{
          pendingReviews: stats?.counts?.pendingReviews || 0,
        }}
      />

      {/* Main Administrative Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <AdminHeader
          activeTabTitle={activeConfig.title}
          activeTabSubtitle={activeConfig.subtitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefresh={loadStats}
          isRefreshing={isRefreshing}
        />

        {/* View Workspace */}
        <main className="flex-1 p-3 xs-360:p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-clip min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigate={setActiveTab}
              onTriggerAlert={triggerAlert}
            />
          )}

          {activeTab === 'syllabus-intelligence' && (
            <SyllabusIntelligenceView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'universities' && (
            <UniversitiesView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'courses' && (
            <CoursesView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'semesters' && (
            <SemestersView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'units' && (
            <UnitsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'topics' && (
            <TopicsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'notes' && (
            <NotesView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'legal-sections' && (
            <LegalSectionsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'case-laws' && (
            <CaseLawsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'questions' && (
            <QuestionsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'mcqs' && (
            <McqsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'previous-papers' && (
            <PreviousPapersView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'mock-tests' && (
            <MockTestsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'students' && (
            <StudentsView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'ai-content' && (
            <AiContentView
              onTriggerAlert={triggerAlert}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'content-review' && (
            <ContentReviewView onTriggerAlert={triggerAlert} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView onTriggerAlert={triggerAlert} />
          )}
        </main>
      </div>
    </div>
  );
}
