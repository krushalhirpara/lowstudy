"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale, Lock, Mail, User, ArrowRight, AlertCircle, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  // Check if student already has an active session
  useEffect(() => {
    setMounted(true);
    let isCancelled = false;

    async function checkExistingSession() {
      try {
        const res = await fetch('/api/student/session');
        const data = await res.json();
        if (!isCancelled && data?.authenticated && data?.user) {
          router.replace('/dashboard');
        }
      } catch (err) {
        // Ignore session prefetch errors
      }
    }

    checkExistingSession();
    return () => {
      isCancelled = true;
    };
  }, [router]);

  // Handle Firebase Google Sign-Up / Sign-In
  const handleGoogleSignUp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!isFirebaseConfigured()) {
      setErrorMsg(
        'Google Sign-In requires NEXT_PUBLIC_FIREBASE_API_KEY to be configured in your environment variables.'
      );
      return;
    }

    try {
      setIsGoogleLoading(true);
      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();

      // Trigger Firebase popup authentication
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No email found in Google account profile.');
      }

      // Send authenticated Firebase profile to backend session route
      const response = await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google',
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email.trim().toLowerCase(),
          fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to authenticate Google session with LowStudy.');
      }

      setSuccessMsg('Successfully connected with Google! Setting up your student portal...');
      
      router.refresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);

    } catch (err) {
      console.warn('Google Sign-Up caught error:', err.code || err.message);

      const code = err.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google sign-in was cancelled.');
      } else if (code === 'auth/cancelled-popup-request') {
        setErrorMsg('Google sign-in request was cancelled.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Popup was blocked by your browser. Please allow popups for LowStudy and try again.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Network connection issue. Please check your internet connection.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        setErrorMsg(
          'An account already exists with this email using a different sign-in method. Please sign in with your email and password.'
        );
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMsg('Google provider is not enabled in Firebase Console. Please enable Google in Firebase Authentication.');
      } else if (code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not authorized in Firebase Console. Please add lowstudy.com to Authorized Domains.');
      } else {
        setErrorMsg(err.message || 'Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Standard Email/Password Registration
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsEmailLoading(true);

      const res = await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          fullName: fullName.trim() || undefined,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setSuccessMsg('Account created successfully! Redirecting to your dashboard...');
      router.refresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);

    } catch (err) {
      setErrorMsg(err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-950 flex items-center justify-center p-4 font-poppins">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl animate-fade-in space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-0.5 mx-auto shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Scale className="w-7 h-7 text-amber-400" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Join LowStudy Legal EdTech OS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Student Account</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Get personalized Gujarat Law syllabus tracking, BNS statutory notes, and AI mock tests.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Email & Password Registration Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              id="signup-name-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="signup-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arjun.sharma@law.in"
              required
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password (min. 6 chars)</span>
              </label>
            </div>
            <input
              type="password"
              id="signup-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            id="signup-submit-button"
            disabled={isEmailLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isEmailLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Free Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Already have an account link */}
        <div className="text-center pt-0.5">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition underline decoration-amber-400/40 underline-offset-2">
              Sign In
            </Link>
          </p>
        </div>

        {/* ──────── OR ──────── Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            OR
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Continue with Google Button */}
        <div>
          <button
            type="button"
            id="google-signup-button"
            onClick={handleGoogleSignUp}
            disabled={isEmailLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-semibold text-xs border border-slate-300 shadow-sm transition flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
            aria-label="Continue with Google"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>Connecting with Google...</span>
              </>
            ) : (
              <>
                {/* Official Google 'G' SVG Logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/* Benefits Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Included Free with LowStudy:</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 pl-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>Gujarat & Saurashtra University Verified Syllabi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>BNS 2023, BNSS & BSA Comparative Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span>5,200+ MCQs & Landmark Case Law Database</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
