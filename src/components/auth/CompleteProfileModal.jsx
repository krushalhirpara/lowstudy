"use client";

import React, { useState, useEffect } from 'react';
import { Scale, Sparkles, Building2, MapPin, Phone, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import CitySelect from './CitySelect';
import UniversitySelect from './UniversitySelect';
import { isValidIndianPhoneNumber, normalizePhoneNumber } from '@/lib/phoneUtils';

export default function CompleteProfileModal({
  isOpen,
  initialFullName = '',
  initialCity = '',
  initialUniversityId = '',
  initialPhoneNumber = '',
  initialActivityOptIn = false,
  userEmail = '',
  firebaseUid = null,
  photoURL = null,
  onComplete,
}) {
  const [fullName, setFullName] = useState(initialFullName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [city, setCity] = useState(initialCity || '');
  const [universityId, setUniversityId] = useState(initialUniversityId || '');
  const [activityOptIn, setActivityOptIn] = useState(Boolean(initialActivityOptIn));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialFullName) setFullName(initialFullName);
    if (initialCity) setCity(initialCity);
    if (initialUniversityId) setUniversityId(initialUniversityId);
    if (initialPhoneNumber) setPhoneNumber(initialPhoneNumber);
    if (typeof initialActivityOptIn === 'boolean') setActivityOptIn(initialActivityOptIn);
  }, [initialFullName, initialCity, initialUniversityId, initialPhoneNumber, initialActivityOptIn]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = (fullName || '').trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }

    const normPhone = normalizePhoneNumber(phoneNumber);
    if (!normPhone || !isValidIndianPhoneNumber(normPhone)) {
      setErrorMsg('Please enter a valid 10-digit Indian contact number.');
      return;
    }

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
      const action = firebaseUid ? 'google_signup' : 'complete_profile';
      const res = await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          fullName: cleanName,
          email: userEmail,
          phoneNumber: normPhone,
          city: trimmedCity,
          universityId,
          activityNotificationOptIn: activityOptIn,
          firebaseUid: firebaseUid || undefined,
          photoURL: photoURL || undefined,
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
      setErrorMsg(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-poppins">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
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
            Complete Student Profile
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            {userEmail ? <span className="font-mono text-amber-400/90 block mb-0.5">{userEmail}</span> : null}
            Please complete your details to finish creating your LowStudy account.
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Name</span>
              <span className="text-[10px] text-amber-400/80 font-normal">*Required</span>
            </label>
            <input
              type="text"
              id="complete-profile-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arjun Patel"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          {/* 2. Contact Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Contact Number</span>
              <span className="text-[10px] text-amber-400/80 font-normal">*10-Digit Mobile</span>
            </label>
            <input
              type="tel"
              id="complete-profile-phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          {/* 3. City */}
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

          {/* 4. College / University */}
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
              selectedCity={city}
              onClearCity={() => setCity('')}
              disabled={loading}
              placeholder="Search and select university..."
              required
            />
          </div>

          {/* 5. Privacy: Activity Notifications Visibility */}
          <div className="pt-1 pb-1">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                id="complete-profile-activity-optin"
                checked={activityOptIn}
                onChange={(e) => setActivityOptIn(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 w-4 h-4 accent-amber-500"
              />
              <div className="text-[11px] leading-tight text-slate-300">
                <span className="font-semibold text-white block mb-0.5">Show my first name in community live activity notifications</span>
                <span className="text-slate-400">If unchecked, your activity will remain strictly anonymous (&ldquo;A student...&rdquo;). Never exposes contact details or private data.</span>
              </div>
            </label>
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
                <span>Completing Registration...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
