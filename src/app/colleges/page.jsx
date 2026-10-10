"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getOrganizationJsonLd } from '@/utils/seo';
import { GUJARAT_COLLEGES, GUJARAT_UNIVERSITIES } from '@/data/gujaratData';
import { 
  Building2, 
  Search, 
  MapPin, 
  ExternalLink, 
  BookOpen, 
  ShieldCheck, 
  GraduationCap,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function CollegesIndexPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [uniFilter, setUniFilter] = useState('All');

  const cities = ['All', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Patan', 'Anand', 'Jamnagar', 'Bhavnagar'];

  const filteredColleges = GUJARAT_COLLEGES.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      (c.district && c.district.toLowerCase().includes(search.toLowerCase()));
    const matchesCity = cityFilter === 'All' || c.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesUni = uniFilter === 'All' || c.universityId === uniFilter;
    return matchesSearch && matchesCity && matchesUni;
  });

  const orgJsonLd = getOrganizationJsonLd();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-poppins">
      <JsonLd data={orgJsonLd} />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: 'Colleges Directory', url: '/colleges' },
          ]}
        />

        {/* Hero Header */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Gujarat Law Colleges Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif-title text-white leading-tight">
            Affiliated Gujarat Law Colleges & Institution Syllabi
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Discover verified Bar Council of India (BCI) recognized law colleges affiliated with Gujarat University, Saurashtra University, and VNSGU. Access syllabus breakdowns, notes, and exam prep resources.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="md:col-span-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search college by name or city..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* City Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                aria-label="Filter by City"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'All' ? 'All Cities' : city}
                  </option>
                ))}
              </select>
            </div>

            {/* University Filter */}
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={uniFilter}
                onChange={(e) => setUniFilter(e.target.value)}
                aria-label="Filter by University"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="All">All Affiliating Universities</option>
                {GUJARAT_UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Colleges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredColleges.map((col) => {
            const affiliatingUni = GUJARAT_UNIVERSITIES.find((u) => u.id === col.universityId);

            return (
              <div
                key={col.id}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {col.city}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      BCI Recognized
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {col.name}
                  </h2>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    Affiliated: {affiliatingUni?.name || 'State University'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(col.programs || ['llb-3yr']).map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {p.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <Link
                    href={`/colleges/${col.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Syllabus & Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {col.officialWebsite && (
                    <a
                      href={col.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${col.name} official website`}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredColleges.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No law colleges matched your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
