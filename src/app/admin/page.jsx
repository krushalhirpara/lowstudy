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
  Lock
} from 'lucide-react';

export default function AdminPage() {
  const [adsenseEnabled, setAdsenseEnabled] = useState(true);
  const [premiumGating, setPremiumGating] = useState(true);
  const [role, setRole] = useState('student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setRole(localStorage.getItem('userRole') || 'student');
    } catch (e) {
      setRole('student');
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading credentials...
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center shadow-lg">
          <Lock className="w-6 h-6" />
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
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25"
          >
            Switch to Admin Role
          </button>
        </div>
      </div>
    );
  }

  const mockUsers = [
    { name: "Priya Sundaram", email: "priya@nlsiu.ac.in", role: "LLB Student", status: "Pro Plan", joined: "12 May 2026" },
    { name: "Rahul Verma", email: "rahul.v@gmail.com", role: "Judiciary Aspirant", status: "Pro Plan", joined: "01 Jun 2026" },
    { name: "Ananya Roy", email: "ananya.roy@du.ac.in", role: "CLAT Aspirant", status: "Free Tier", joined: "18 Jul 2026" },
    { name: "Karan Mehta", email: "karan@advocate.in", role: "Advocate", status: "Pro Plan", joined: "25 Jul 2026" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold">
              SUPER ADMIN CONTROL PANEL
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif-title text-white">LowStudy.com Platform Admin</h1>
        </div>

        <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg btn-mobile-touch shrink-0">
          <Plus className="w-4 h-4" />
          <span>Publish New Subject Note</span>
        </button>
      </div>

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
          <p className="text-[11px] text-emerald-400">Avg accuracy: 74%</p>
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
        <h3 className="text-lg font-bold text-white font-serif-title">Monetization & SEO Control</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Google AdSense Auto-Ads</p>
              <p className="text-[11px] text-slate-400">Inject ad units on Bare Acts & Blog pages</p>
            </div>
            <button onClick={() => setAdsenseEnabled(!adsenseEnabled)} className="text-amber-400">
              {adsenseEnabled ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">NyayaAI Premium Gating</p>
              <p className="text-[11px] text-slate-400">Limit free users to 5 doubts / day</p>
            </div>
            <button onClick={() => setPremiumGating(!premiumGating)} className="text-emerald-400">
              {premiumGating ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* User Management Table / Card View Container */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-serif-title">Registered Students & Advocates</h3>
          <span className="text-xs text-slate-400 font-mono">Showing recent 4</span>
        </div>

        {/* Desktop View (Standard Table) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-3 px-4 font-semibold">User Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Target / Role</th>
                <th className="py-3 px-4 font-semibold">Subscription Status</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mockUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-slate-850">
                  <td className="py-3 px-4 font-bold text-white">{user.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{user.email}</td>
                  <td className="py-3 px-4 text-slate-300">{user.role}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      user.status === 'Pro Plan' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Card List) */}
        <div className="block md:hidden space-y-3">
          {mockUsers.map((user, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{user.name}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  user.status === 'Pro Plan' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {user.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 space-y-1">
                <p><span className="text-slate-500 font-semibold">Email:</span> <span className="font-mono">{user.email}</span></p>
                <p><span className="text-slate-500 font-semibold">Target / Role:</span> {user.role}</p>
                <p><span className="text-slate-500 font-semibold">Joined:</span> <span className="font-mono">{user.joined}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
