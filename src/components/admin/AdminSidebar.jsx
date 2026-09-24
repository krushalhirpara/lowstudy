"use client";

import { 
  LayoutDashboard, 
  Building2, 
  GraduationCap, 
  CalendarRange, 
  BookOpen, 
  Layers, 
  BookmarkCheck, 
  FileText, 
  Scale, 
  Gavel, 
  HelpCircle, 
  CheckSquare, 
  FileSpreadsheet, 
  Timer, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Settings,
  Radio,
  FileDiff,
  Globe,
  CheckCircle2,
  X
} from 'lucide-react';

export const ADMIN_NAV_GROUPS = [
  {
    title: 'Platform Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    ]
  },
  {
    title: 'Syllabus Intelligence',
    items: [
      { id: 'syllabus-intelligence', label: 'Syllabus Command Center', icon: Radio, badgeKey: 'pendingReviews' },
    ]
  },
  {
    title: 'Curriculum Hierarchy',
    items: [
      { id: 'universities', label: 'Universities', icon: Building2 },
      { id: 'courses', label: 'Courses', icon: GraduationCap },
      { id: 'semesters', label: 'Semesters', icon: CalendarRange },
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'units', label: 'Units', icon: Layers },
      { id: 'topics', label: 'Topics', icon: BookmarkCheck },
    ]
  },
  {
    title: 'Legal Content & Study',
    items: [
      { id: 'notes', label: 'Notes', icon: FileText },
      { id: 'legal-sections', label: 'Legal Sections', icon: Scale },
      { id: 'case-laws', label: 'Case Laws', icon: Gavel },
    ]
  },
  {
    title: 'Examination & Practice',
    items: [
      { id: 'questions', label: 'Questions', icon: HelpCircle },
      { id: 'mcqs', label: 'MCQs', icon: CheckSquare },
      { id: 'previous-papers', label: 'Previous Papers', icon: FileSpreadsheet },
      { id: 'mock-tests', label: 'Mock Tests', icon: Timer },
    ]
  },
  {
    title: 'Governance & AI',
    items: [
      { id: 'students', label: 'Students', icon: Users },
      { id: 'ai-content', label: 'AI Content', icon: Sparkles },
      { id: 'content-review', label: 'Content Review', icon: ShieldCheck, badgeKey: 'pendingReviews' },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ]
  }
];

export default function AdminSidebar({ 
  activeTab, 
  onSelectTab, 
  isOpen, 
  onClose,
  badgeCounts = {} 
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              ⚖️
            </div>
            <div>
              <span className="font-serif-title font-bold text-white text-base tracking-wide block">LowStudy</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block font-semibold">Admin CMS</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const badge = item.badgeKey ? badgeCounts[item.badgeKey] : null;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onClose) onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Role Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 font-mono">Role: Super Admin</span>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.setItem('userRole', 'student');
                } catch (e) {}
                window.location.reload();
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono"
            >
              Exit
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
