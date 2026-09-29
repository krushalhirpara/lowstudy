"use client";

import React, { useState } from 'react';
import { Scale, Sparkles, Building2, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import CitySelect from './CitySelect';
import UniversitySelect from './UniversitySelect';

export default function CompleteProfileModal({
  isOpen,
  initialCity = '',
  initialUniversityId = '',
  userEmail = '',
  onComplete,
}) {
  const [city, setCity] = useState(initialCity || '');
  const [universityId, setUniversityId] = useState(initialUniversityId || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedCity = (city || '').trim();
    if (!trimmedCity || trimmedCity.length < 2) {
      setErrorMsg('Please enter or select your City.');
      return;
    }

    if (!universityId) {
      setErrorMsg('Please select your College / University.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_profile',
          city: trimmedCity,
          universityId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete student profile.');
      }

      if (onComplete) {
        onComplete(data.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Unable to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-poppins">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-0.5 mx-auto shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Scale className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Complete Your Student Profile</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Select City &amp; University
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {userEmail ? `For ${userEmail}: ` : ''}
            Tailor your legal syllabus, question bank, and exam schedules to your university.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. City */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>City</span>
              <span className="text-[10px] text-amber-400/80 font-normal">*Required</span>
            </label>
            <CitySelect
              id="complete-profile-city"
              value={city}
              onChange={setCity}
              disabled={loading}
              placeholder="e.g. Ahmedabad, Surat, Rajkot..."
              required
            />
          </div>

          {/* 2. College / University */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>College / University</span>
              <span className="text-[10px] text-amber-400/80 font-normal">*Required</span>
            </label>
            <UniversitySelect
              id="complete-profile-university"
              value={universityId}
              onChange={setUniversityId}
              disabled={loading}
              placeholder="Search and select university..."
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer pt-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Save Profile &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
