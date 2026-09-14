"use client";

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Award, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Settings, 
  Check, 
  ToggleLeft, 
  ToggleRight,
  Search,
  Bell,
  Lock,
  ChevronRight,
  Gavel,
  FileText,
  Sparkles
} from 'lucide-react';
import { MockDB } from '@/data/db';

export default function AdminPage() {
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);
  
  // Toggles
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [premiumGating, setPremiumGating] = useState(true);

  // Active workspace tab
  const [adminTab, setAdminTab] = useState('overview'); // overview, subject-crud, mcq-crud, case-crud

  // CRUD State - Add Subject
  const [subjectsList, setSubjectsList] = useState([]);
  const [newSubj, setNewSubj] = useState({ id: '', title: '', shortCode: '', semesterId: 'sem1', category: 'Core Law', color: 'from-blue-600 to-indigo-900' });

  // CRUD State - Add Unit
  const [newUnit, setNewUnit] = useState({ id: '', subjectId: '', unitNumber: 1, title: '', description: '' });

  // CRUD State - Add Topic
  const [unitsList, setUnitsList] = useState([]);
  const [newTopic, setNewTopic] = useState({ id: '', unitId: '', title: '', description: '' });

  // CRUD State - Add MCQ
  const [topicsList, setTopicsList] = useState([]);
  const [newMcq, setNewMcq] = useState({
    id: '',
    topicId: '',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctIndex: 0,
    difficulty: 'easy',
    explanation: ''
  });

  // CRUD State - Add Case Law
  const [newCase, setNewCase] = useState({
    id: '',
    topicId: '',
    title: '',
    citation: '',
    bench: '',
    subjectName: '',
    keyPrinciple: '',
    facts: '',
    issues: '',
    argumentsText: '',
    judgment: '',
    ratio: '',
    importance: ''
  });

  // CRUD State - Add Bare Act
  const [newAct, setNewAct] = useState({
    id: '',
    topicId: '',
    actName: 'BNS 2023',
    sectionNumber: '',
    title: '',
    content: '',
    relatedText: ''
  });

  // Feedback flags
  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    MockDB.init();
    setSubjectsList(MockDB.state.subjects || []);
    setAdsEnabled(MockDB.getAdsSetting());
    
    try {
      setRole(localStorage.getItem('userRole') || 'student');
    } catch (e) {
      setRole('student');
    }
  }, []);

  // Update dynamic dropdown options
  useEffect(() => {
    if (newUnit.subjectId) {
      setUnitsList(MockDB.getUnits(newUnit.subjectId));
    }
  }, [newUnit.subjectId]);

  useEffect(() => {
    if (newMcq.topicId || newCase.topicId || newAct.topicId) {
      // Default lists if needed
    }
  }, [newMcq.topicId, newCase.topicId, newAct.topicId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading admin console...
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-lg">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif-title text-white">Admin Access Restricted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Student account detected. You do not have permissions to view financial metrics, manage user roles, or edit global Bare Act databases.
          </p>
        </div>
        <div className="pt-2">
          <button 
            onClick={() => {
              try {
                localStorage.setItem('userRole', 'admin');
              } catch (e) {}
              window.location.reload();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 animate-pulse"
          >
            Switch to Admin Role
          </button>
        </div>
      </div>
    );
  }

  // --- CRUD ACTIONS ---

  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!newSubj.id || !newSubj.title) return;
    MockDB.addSubject(newSubj);
    setSubjectsList(MockDB.getSubjects(null, null));
    setNewSubj({ id: '', title: '', shortCode: '', semesterId: 'sem1', category: 'Core Law', color: 'from-blue-600 to-indigo-900' });
    triggerAlert('Subject registered successfully!');
  };

  const handleCreateUnit = (e) => {
    e.preventDefault();
    if (!newUnit.id || !newUnit.subjectId || !newUnit.title) return;
    MockDB.addUnit(newUnit);
    setNewUnit({ id: '', subjectId: '', unitNumber: 1, title: '', description: '' });
    triggerAlert('Syllabus Unit added successfully!');
  };

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopic.id || !newTopic.unitId || !newTopic.title) return;
    MockDB.addTopic(newTopic);
    setNewTopic({ id: '', unitId: '', title: '', description: '' });
    triggerAlert('Syllabus Topic added successfully!');
  };

  const handleCreateMCQ = (e) => {
    e.preventDefault();
    if (!newMcq.topicId || !newMcq.question || !newMcq.optA || !newMcq.optB) return;
    
    const formatted = {
      id: Math.floor(Math.random() * 10000) + 100,
      topicId: newMcq.topicId,
      question: newMcq.question,
      options: [newMcq.optA, newMcq.optB, newMcq.optC, newMcq.optD].filter(Boolean),
      correctIndex: Number(newMcq.correctIndex),
      difficulty: newMcq.difficulty,
      explanation: newMcq.explanation
    };

    MockDB.addMCQ(formatted);
    setNewMcq({
      id: '',
      topicId: '',
      question: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctIndex: 0,
      difficulty: 'easy',
      explanation: ''
    });
    triggerAlert('Practice MCQ published successfully!');
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    if (!newCase.topicId || !newCase.title || !newCase.facts) return;

    const formatted = {
      id: newCase.title.toLowerCase().replace(/ /g, '-'),
      topicId: newCase.topicId,
      title: newCase.title,
      citation: newCase.citation,
      bench: newCase.bench,
      subject: newCase.subjectName,
      keyPrinciple: newCase.keyPrinciple,
      facts: newCase.facts,
      issues: newCase.issues,
      arguments: newCase.argumentsText.split('\n').filter(Boolean),
      judgment: newCase.judgment,
      ratio: newCase.ratio,
      importance: newCase.importance
    };

    MockDB.addCaseLaw(formatted);
    setNewCase({
      id: '',
      topicId: '',
      title: '',
      citation: '',
      bench: '',
      subjectName: '',
      keyPrinciple: '',
      facts: '',
      issues: '',
      argumentsText: '',
      judgment: '',
      ratio: '',
      importance: ''
    });
    triggerAlert('Landmark Case Brief published successfully!');
  };

  const handleCreateAct = (e) => {
    e.preventDefault();
    if (!newAct.topicId || !newAct.sectionNumber || !newAct.content) return;

    const formatted = {
      id: `act-${Math.floor(Math.random() * 10000)}`,
      topicId: newAct.topicId,
      actName: newAct.actName,
      sectionNumber: newAct.sectionNumber,
      title: newAct.title,
      content: newAct.content,
      relatedSections: newAct.relatedText.split(',').map(s => s.trim()).filter(Boolean)
    };

    MockDB.addBareAct(formatted);
    setNewAct({
      id: '',
      topicId: '',
      actName: 'BNS 2023',
      sectionNumber: '',
      title: '',
      content: '',
      relatedText: ''
    });
    triggerAlert('Bare Act statutory section mapped successfully!');
  };

  const triggerAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  const mockUsers = [
    { name: "Priya Sundaram", email: "priya@vnsgu.ac.in", role: "LLB Student", status: "Pro Plan", joined: "12 May 2026" },
    { name: "Rahul Verma", email: "rahul.v@gmail.com", role: "Judiciary Aspirant", status: "Pro Plan", joined: "01 Jun 2026" },
    { name: "Ananya Roy", email: "ananya.roy@gujaratuni.ac.in", role: "CLAT Aspirant", status: "Free Tier", joined: "18 Jul 2026" },
    { name: "Karan Mehta", email: "karan@advocate.in", role: "Advocate", status: "Pro Plan", joined: "25 Jul 2026" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Feedback Alert */}
      {alertMsg && (
        <div className="fixed bottom-5 right-5 p-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
              SUPER ADMIN PLATFORM CONTROL PANEL
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif-title text-white">LowStudy.com Core CMS & Ads</h1>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Platform Stats' },
            { id: 'seo-dashboard', label: 'SEO Health & Ranking' },
            { id: 'gujarat-institutions', label: 'Gujarat Institutions' },
            { id: 'syllabus-updates', label: 'Syllabus Updates' },
            { id: 'ai-intelligence', label: 'NyayaAI Intelligence' },
            { id: 'subject-crud', label: 'Syllabus Builder' },
            { id: 'mcq-crud', label: 'MCQs & Acts' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-mobile-touch ${
                adminTab === t.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950 text-slate-400 border border-slate-850 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. OVERVIEW & ADVERTISING WORKSPACE */}
      {adminTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Total Students</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white font-serif-title">12,450</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18% this month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Notes & Articles</span>
                <BookOpen className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white font-serif-title">485</p>
              <p className="text-[11px] text-slate-400">15 Core Subjects covered</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Quizzes Taken</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white font-serif-title">89,200</p>
              <p className="text-[11px] text-emerald-400 font-semibold">Avg accuracy: 74%</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Est. Monthly Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white font-serif-title">₹42,500</p>
              <p className="text-[11px] text-purple-400">AdSense + Pro Subscriptions</p>
            </div>

          </div>

          {/* Settings & Feature Toggles */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-lg font-bold text-white font-serif-title">Monetization & Ads Placements</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Google AdSense Auto-Ads</p>
                  <p className="text-[11px] text-slate-400">Inject ad units on Bare Acts & Blog pages</p>
                </div>
                <button 
                  onClick={() => {
                    const nextVal = !adsEnabled;
                    setAdsEnabled(nextVal);
                    MockDB.setAdsSetting(nextVal);
                  }} 
                  className="text-amber-400 btn-mobile-touch"
                >
                  {adsEnabled ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-slate-650" />}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">NyayaAI Premium Gating</p>
                  <p className="text-[11px] text-slate-400">Limit free users to 5 doubts / day</p>
                </div>
                <button onClick={() => setPremiumGating(!premiumGating)} className="text-emerald-400 btn-mobile-touch">
                  {premiumGating ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-655" />}
                </button>
              </div>
            </div>
          </div>

          {/* User Management table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-serif-title">Registered Students & Advocates</h3>
              <span className="text-xs text-slate-450 font-mono">Showing recent 4</span>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-450 uppercase font-mono tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">User Details</th>
                    <th className="py-3.5 px-4 font-semibold">Subscription Status</th>
                    <th className="py-3.5 px-4 font-semibold">Date Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {mockUsers.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.email} • {item.role}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Pro Plan' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-slate-950 text-slate-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{item.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SEO HEALTH & RANKING DASHBOARD TAB */}
      {adminTab === 'seo-dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* SEO Health Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Technical SEO Score</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">Passing</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400 font-serif-title">96%</p>
              <p className="text-[10px] text-slate-400 font-mono">Canonical URLs, Robots.txt & Dynamic Sitemap Active</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Indexed URLs</span>
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-xs font-bold">Dynamic</span>
              </div>
              <p className="text-3xl font-bold text-teal-400 font-serif-title">28 Pages</p>
              <p className="text-[10px] text-slate-400 font-mono">Universities, Colleges, Subjects & Bare Acts</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Structured Data (JSON-LD)</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-bold">Valid</span>
              </div>
              <p className="text-3xl font-bold text-amber-400 font-serif-title">100% Valid</p>
              <p className="text-[10px] text-slate-400 font-mono">WebSite, Course, Breadcrumb, FAQ & Article Schemas</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs uppercase font-mono font-semibold">Private Protection</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono text-xs font-bold">Secure</span>
              </div>
              <p className="text-3xl font-bold text-purple-400 font-serif-title">Noindex Enabled</p>
              <p className="text-[10px] text-slate-400 font-mono">/admin, /api & user chats blocked in robots.txt</p>
            </div>
          </div>

          {/* Striking Distance Opportunities (Positions 5-20) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-title">Search Console "Striking Distance" Opportunities</h3>
                <p className="text-xs text-slate-400">Pages ranking in positions 5–20 with high impression volume recommended for content enhancement.</p>
              </div>
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                3 Actionable Opportunities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-450 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Target Keyword</th>
                    <th className="py-3 px-4">URL Path</th>
                    <th className="py-3 px-4">Avg Position</th>
                    <th className="py-3 px-4">Impressions</th>
                    <th className="py-3 px-4">CTR</th>
                    <th className="py-3 px-4">Suggested SEO Optimization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4 font-bold text-white">Gujarat University LLB Semester 3 Syllabus</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">/universities/gu</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">6.2</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">4,800</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">4.5%</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">Add detailed unit breakdown & syllabus FAQ schema.</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4 font-bold text-white">BNS vs IPC Section Comparison Chart</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">/bns-vs-ipc</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">8.1</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">6,200</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">3.8%</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">Expand Section 103 (Murder) & Section 318 (Cheating) side-by-side notes.</td>
                  </tr>
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4 font-bold text-white">VNSGU Law College Syllabus & Notes</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">/universities/vnsgu</td>
                    <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">12.4</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">2,100</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">2.1%</td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">Link affiliated Surat law colleges (Sir L.A. Shah Law College) to VNSGU pillar page.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Missing Metadata & Canonical Audit */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-serif-title">Live Metadata & Indexability Audit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white">Homepage (https://lowstudy.com/)</p>
                <p className="text-emerald-400 font-mono">Title & Description: OK • H1: OK • Canonical: OK</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white">University Pages (/universities/*)</p>
                <p className="text-emerald-400 font-mono">Dynamic Titles: OK • Course Schema: OK</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="font-bold text-white">BNS vs IPC Hub (/bns-vs-ipc)</p>
                <p className="text-emerald-400 font-mono">Article Schema: OK • FAQ Schema: OK</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GUJARAT INSTITUTIONS MANAGER TAB */}
      {adminTab === 'gujarat-institutions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-title">Gujarat Universities & Law Colleges Registry</h3>
                <p className="text-xs text-slate-400">Manage official sources, verification status, and affiliation mappings.</p>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                {MockDB.getUniversities().length} Universities • {MockDB.getColleges().length} Colleges
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-450 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Institution Name</th>
                    <th className="py-3 px-4">City / District</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Official Syllabus Source</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {MockDB.getUniversities().map(u => (
                    <tr key={u.id} className="hover:bg-slate-850/40">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <span>{u.logo}</span>
                          <span>{u.name}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{u.code}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{u.city}, {u.district}</td>
                      <td className="py-3.5 px-4 text-slate-400">{u.type}</td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <a href={u.officialSyllabusSource} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline truncate max-w-[200px] block">
                          {u.officialSyllabusSource}
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SYLLABUS UPDATE CENTER TAB */}
      {adminTab === 'syllabus-updates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-title">Automated Syllabus Intelligence — Pending Updates</h3>
                <p className="text-xs text-slate-400">Review detected changes from official Gujarat University portals before publishing.</p>
              </div>
              <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                {MockDB.getPendingUpdates().filter(u => u.status === 'PENDING_REVIEW').length} Pending Reviews
              </span>
            </div>

            <div className="space-y-4">
              {MockDB.getPendingUpdates().map(upd => (
                <div key={upd.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 font-serif-title">{upd.sourceTitle}</span>
                    <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                      upd.status === 'APPROVED_PUBLISHED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {upd.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                    <span>Source: {upd.sourceUrl}</span>
                    <span>•</span>
                    <span>Detected: {upd.detectedDate}</span>
                  </div>

                  {/* Diff View */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Detected Change Differences (Diff View):</p>
                    {upd.changes.map((c, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <span className="text-slate-400 font-semibold">{c.field}</span>
                        <span className="text-red-400 line-through">Old: {c.oldVal}</span>
                        <span className="text-emerald-400 font-bold">New: {c.newVal}</span>
                      </div>
                    ))}
                  </div>

                  {upd.status === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          MockDB.approvePendingUpdate(upd.id);
                          triggerAlert("Syllabus update approved and published!");
                          setAdminTab('syllabus-updates');
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow hover:bg-emerald-600"
                      >
                        Approve & Publish Update
                      </button>
                      <button
                        onClick={() => {
                          MockDB.rejectPendingUpdate(upd.id);
                          triggerAlert("Syllabus update rejected.");
                          setAdminTab('syllabus-updates');
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. NYAYAAI INTELLIGENCE & ERROR REPORTS TAB */}
      {adminTab === 'ai-intelligence' && (
        <div className="space-y-6 animate-fade-in">
          {/* AI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Total AI Doubts Solved</span>
              <p className="text-2xl font-bold text-white font-serif-title">4,890</p>
              <p className="text-[11px] text-emerald-400">96.4% Accuracy Rating</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Quiz Trigger Rate</span>
              <p className="text-2xl font-bold text-amber-400 font-serif-title">78.2%</p>
              <p className="text-[11px] text-slate-400">3,820 Personalized Quizzes</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">RAG Sources Cited</span>
              <p className="text-2xl font-bold text-blue-400 font-serif-title">100%</p>
              <p className="text-[11px] text-slate-400">India Code + Supreme Court</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Error Reports Flagged</span>
              <p className="text-2xl font-bold text-purple-400 font-serif-title">2</p>
              <p className="text-[11px] text-purple-400">Requires Admin Review</p>
            </div>
          </div>

          {/* User Error Reports Table */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-serif-title">Recent User Error Reports & Audits</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850 text-slate-450 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Query / Subject</th>
                    <th className="py-3 px-4">Reported Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-850/40">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">"Difference between IPC 302 and BNS 103"</p>
                      <p className="text-[10px] text-slate-400 font-mono">Student: GU LL.B. Sem 3</p>
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-semibold">Explanation Unclear</td>
                    <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">PENDING</span></td>
                    <td className="py-3.5 px-4">
                      <button onClick={() => triggerAlert("Report resolved and verified!")} className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[11px]">
                        Mark Resolved
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYLLABUS BUILDER CRUD TAB */}
      {adminTab === 'subject-crud' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          
          {/* Add Subject form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              Register New Subject
            </h3>
            
            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold font-mono">Unique ID (slug)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. administrative-law"
                    value={newSubj.id}
                    onChange={(e) => setNewSubj({ ...newSubj, id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold font-mono">Short Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADMIN-LAW"
                    value={newSubj.shortCode}
                    onChange={(e) => setNewSubj({ ...newSubj, shortCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Administrative Law & Regulatory Intent"
                  value={newSubj.title}
                  onChange={(e) => setNewSubj({ ...newSubj, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold font-mono">Curriculum Category</label>
                  <select
                    value={newSubj.category}
                    onChange={(e) => setNewSubj({ ...newSubj, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-300"
                  >
                    <option value="Core Law">Core Law</option>
                    <option value="Criminal Law">Criminal Law</option>
                    <option value="Civil Law">Civil Law</option>
                    <option value="Corporate Law">Corporate Law</option>
                    <option value="Personal Law">Personal Law</option>
                    <option value="Specialized Law">Specialized Law</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold font-mono">Target Semester</label>
                  <select
                    value={newSubj.semesterId}
                    onChange={(e) => setNewSubj({ ...newSubj, semesterId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-300"
                  >
                    <option value="sem1">Semester 1</option>
                    <option value="sem2">Semester 2</option>
                    <option value="sem3">Semester 3</option>
                    <option value="sem4">Semester 4</option>
                    <option value="sem5">Semester 5</option>
                    <option value="sem6">Semester 6</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow hover:bg-amber-600"
              >
                Register Subject
              </button>
            </form>
          </div>

          {/* Add Syllabus Unit & Topic forms */}
          <div className="space-y-6">
            
            {/* Add Unit card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add Syllabus Unit
              </h3>
              <form onSubmit={handleCreateUnit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold font-mono">Select Subject</label>
                    <select
                      required
                      value={newUnit.subjectId}
                      onChange={(e) => setNewUnit({ ...newUnit, subjectId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none"
                    >
                      <option value="">Select Subject</option>
                      {subjectsList.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold font-mono">Unit ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. u5"
                        value={newUnit.id}
                        onChange={(e) => setNewUnit({ ...newUnit, id: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold font-mono">No.</label>
                      <input
                        type="number"
                        required
                        value={newUnit.unitNumber}
                        onChange={(e) => setNewUnit({ ...newUnit, unitNumber: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Unit Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 5: Judicial Activism vs Restraint"
                    value={newUnit.title}
                    onChange={(e) => setNewUnit({ ...newUnit, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Add Unit Mappings
                </button>
              </form>
            </div>

            {/* Add Topic card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-400" />
                Add Syllabus Topic
              </h3>
              <form onSubmit={handleCreateTopic} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold font-mono">Subject Scope</label>
                    <select
                      required
                      value={newUnit.subjectId}
                      onChange={(e) => setNewUnit({ ...newUnit, subjectId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none"
                    >
                      <option value="">Select Subject</option>
                      {subjectsList.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold font-mono">Active Unit</label>
                    <select
                      required
                      value={newTopic.unitId}
                      onChange={(e) => setNewTopic({ ...newTopic, unitId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none"
                    >
                      <option value="">Select Unit</option>
                      {unitsList.map(u => (
                        <option key={u.id} value={u.id}>Unit {u.unitNumber}: {u.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold font-mono">Topic Slug ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. judicial-review-doctrine"
                      value={newTopic.id}
                      onChange={(e) => setNewTopic({ ...newTopic, id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold font-mono">Topic Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scope of Judicial Review"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-500 text-slate-950 font-bold text-xs"
                >
                  Register Syllabus Topic
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

      {/* 3. PRACTICE RESOURCE BUILDER (MCQS & ACTS) */}
      {adminTab === 'mcq-crud' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          
          {/* MCQ builder card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-amber-400" />
              MCQ Builder
            </h3>
            
            <form onSubmit={handleCreateMCQ} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Subject Scope</label>
                  <select
                    required
                    value={newUnit.subjectId}
                    onChange={(e) => {
                      setNewUnit({ ...newUnit, subjectId: e.target.value });
                    }}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-300 focus:outline-none"
                  >
                    <option value="">Select Subject</option>
                    {subjectsList.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Target Topic</label>
                  <select
                    required
                    value={newMcq.topicId}
                    onChange={(e) => setNewMcq({ ...newMcq, topicId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-300 focus:outline-none"
                  >
                    <option value="">Select Topic</option>
                    {/* Combine topics across units for selection */}
                    {MockDB.state.topics?.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Question Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Which of the following defines the rule against self-incrimination?"
                  value={newMcq.question}
                  onChange={(e) => setNewMcq({ ...newMcq, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Option A</label>
                  <input
                    type="text"
                    required
                    value={newMcq.optA}
                    onChange={(e) => setNewMcq({ ...newMcq, optA: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Option B</label>
                  <input
                    type="text"
                    required
                    value={newMcq.optB}
                    onChange={(e) => setNewMcq({ ...newMcq, optB: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Option C</label>
                  <input
                    type="text"
                    value={newMcq.optC}
                    onChange={(e) => setNewMcq({ ...newMcq, optC: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Option D</label>
                  <input
                    type="text"
                    value={newMcq.optD}
                    onChange={(e) => setNewMcq({ ...newMcq, optD: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Correct Option Index</label>
                  <select
                    value={newMcq.correctIndex}
                    onChange={(e) => setNewMcq({ ...newMcq, correctIndex: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none font-bold"
                  >
                    <option value={0}>Option A (0)</option>
                    <option value={1}>Option B (1)</option>
                    <option value={2}>Option C (2)</option>
                    <option value={3}>Option D (3)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-mono font-semibold">Difficulty</label>
                  <select
                    value={newMcq.difficulty}
                    onChange={(e) => setNewMcq({ ...newMcq, difficulty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none font-bold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Statutory Explanation & Act References</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Rule of self-incrimination is enshrined under Article 20(3) of the Indian Constitution."
                  value={newMcq.explanation}
                  onChange={(e) => setNewMcq({ ...newMcq, explanation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Publish Practice Question
              </button>
            </form>
          </div>

          {/* Bare Act mapper form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Bare Act Section Publisher
            </h3>
            
            <form onSubmit={handleCreateAct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Act Codification</label>
                  <select
                    value={newAct.actName}
                    onChange={(e) => setNewAct({ ...newAct, actName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none"
                  >
                    <option value="BNS 2023">BNS 2023</option>
                    <option value="BNSS 2023">BNSS 2023</option>
                    <option value="BSA 2023">BSA 2023</option>
                    <option value="Constitution of India">Constitution of India</option>
                    <option value="CPC 1908">CPC 1908</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Map to Topic</label>
                  <select
                    required
                    value={newAct.topicId}
                    onChange={(e) => setNewAct({ ...newAct, topicId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-300 focus:outline-none"
                  >
                    <option value="">Select Topic</option>
                    {MockDB.state.topics?.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Section / Article No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Section 103(2)"
                    value={newAct.sectionNumber}
                    onChange={(e) => setNewAct({ ...newAct, sectionNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold font-mono">Section Heading</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Punishment for mob lynching"
                    value={newAct.title}
                    onChange={(e) => setNewAct({ ...newAct, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Statutory Provision Content</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Insert the exact statutory words..."
                  value={newAct.content}
                  onChange={(e) => setNewAct({ ...newAct, content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Related Sections (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Section 101, Section 100"
                  value={newAct.relatedText}
                  onChange={(e) => setNewAct({ ...newAct, relatedText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Publish Statutory Section
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 4. LANDMARK JUDGMENT BUILDER CRUD TAB */}
      {adminTab === 'case-crud' && (
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white font-serif-title flex items-center gap-1.5">
            <Gavel className="w-4.5 h-4.5 text-amber-400" />
            Landmark Judgments Brief Publisher
          </h3>

          <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Scope of Topic</label>
                <select
                  required
                  value={newCase.topicId}
                  onChange={(e) => setNewCase({ ...newCase, topicId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-350 focus:outline-none"
                >
                  <option value="">Select Topic</option>
                  {MockDB.state.topics?.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Subject Name Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Constitutional Law"
                  value={newCase.subjectName}
                  onChange={(e) => setNewCase({ ...newCase, subjectName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold font-mono">Case Name / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Kesavananda Bharati v. State of Kerala"
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Citation</label>
                <input
                  type="text"
                  placeholder="e.g. (1973) 4 SCC 225"
                  value={newCase.citation}
                  onChange={(e) => setNewCase({ ...newCase, citation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold font-mono">Bench Size & Majority</label>
                <input
                  type="text"
                  placeholder="e.g. 13 Judges (7:6 Ratio)"
                  value={newCase.bench}
                  onChange={(e) => setNewCase({ ...newCase, bench: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-2.5 rounded-xl text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold font-mono">Key Principle Established</label>
              <input
                type="text"
                placeholder="e.g. Basic Structure Doctrine limits Parliament Amending power"
                value={newCase.keyPrinciple}
                onChange={(e) => setNewCase({ ...newCase, keyPrinciple: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Facts of the Case</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summarize the core facts..."
                  value={newCase.facts}
                  onChange={(e) => setNewCase({ ...newCase, facts: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Core Issues</label>
                <textarea
                  rows={2}
                  placeholder="State the questions before the bench..."
                  value={newCase.issues}
                  onChange={(e) => setNewCase({ ...newCase, issues: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold font-mono">Arguments Addressed (One per line)</label>
              <textarea
                rows={2}
                placeholder="Add arguments..."
                value={newCase.argumentsText}
                onChange={(e) => setNewCase({ ...newCase, argumentsText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Ratio Decidendi</label>
                <textarea
                  rows={2}
                  placeholder="Rule of law established..."
                  value={newCase.ratio}
                  onChange={(e) => setNewCase({ ...newCase, ratio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold font-mono">Constitutional Importance</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Set standard checks on legislative amendments..."
                  value={newCase.importance}
                  onChange={(e) => setNewCase({ ...newCase, importance: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 p-3 rounded-xl focus:outline-none text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Publish Judgment Brief
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
