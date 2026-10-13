"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MapPin, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { GUJARAT_COLLEGES, GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import { MockDB } from '@/data/db';

export default function GujaratLawCollegesPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  // Initialize with static verified data for immediate server-rendering and instant Googlebot crawlability
  const [universities, setUniversities] = useState(GUJARAT_UNIVERSITIES);
  const [colleges, setColleges] = useState(GUJARAT_COLLEGES);

  useEffect(() => {
    try {
      MockDB.init();
      const dbUnis = MockDB.getUniversities();
      const dbCols = MockDB.getColleges();
      if (dbUnis?.length) setUniversities(dbUnis);
      if (dbCols?.length) setColleges(dbCols);
    } catch {
      // Fallback preserves initial static data
    }
  }, []);

  const cities = ['All', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Patan', 'Anand', 'Jamnagar', 'Bhavnagar'];

  const filteredColleges = colleges.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.city.toLowerCase().includes(search.toLowerCase()) ||
                          (c.district && c.district.toLowerCase().includes(search.toLowerCase()));
    const matchesCity = cityFilter === 'All' || c.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs
        items={[
          { name: 'Gujarat Law Colleges', url: '/gujarat-law-colleges' },
        ]}
      />

      {/* Hero Header */}
      <div className="space-y-4 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Gujarat State Legal Education Registry</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold font-serif-title text-white leading-tight">
          Gujarat Law Colleges & Universities Directory
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Explore officially affiliated law colleges across Gujarat. Select your institution to view the exact university syllabus, BNS subject notes, college-specific details, and semester exam preparation material.
        </p>

        {/* Cross-Link Pill */}
        <div className="pt-2">
          <Link
            href="/gujarat-law-universities"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-slate-850 hover:border-emerald-500/50 text-xs font-semibold transition"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Looking for Universities? Browse Gujarat Law Universities Hub ({universities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search college, city, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* City Filter Pills */}
        <div className="w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0 flex">
          <div className="flex items-center gap-1.5 w-max">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  cityFilter === city
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Universities Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            Gujarat Law Universities ({universities.length})
          </h2>
          <Link 
            href="/gujarat-law-universities" 
            className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>All Universities</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {universities.map(u => {
            const uniHref = u.id === 'su' ? '/saurashtra-university' : `/universities/${u.id}`;
            return (
              <div key={u.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3 flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{u.logo}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                      {u.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight font-serif-title">{u.name}</h3>
                  
                  <p className="text-xs text-slate-400 font-mono">
                    {u.city}, {u.district} • {u.type}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {u.officialWebsite && (
                    <a
                      href={u.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <Link
                    href={uniHref}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1 ml-auto"
                  >
                    <span>View University</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Affiliated Law Colleges Directory */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-serif-title text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          Affiliated Law Colleges ({filteredColleges.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredColleges.map(col => {
            const parentUni = universities.find(u => u.id === col.universityId);
            return (
              <div key={col.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg hover:border-emerald-500/30 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800 font-bold">
                      {col.type}
                    </span>
                    <span className="text-emerald-400 font-bold">VERIFIED</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight font-serif-title">
                    <Link href={`/colleges/${col.id}`} className="hover:text-emerald-400 transition">
                      {col.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{col.city}, {col.district}</span>
                  </p>

                  <p className="text-[11px] text-slate-450 font-sans">
                    Affiliated to <span className="text-slate-200 font-semibold">{parentUni?.name || "Gujarat University"}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  {col.officialWebsite && (
                    <a
                      href={col.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-mono text-[11px]"
                    >
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <Link
                    href={`/colleges/${col.id}`}
                    className="text-amber-400 font-bold hover:underline flex items-center gap-1 ml-auto"
                  >
                    <span>View College Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
