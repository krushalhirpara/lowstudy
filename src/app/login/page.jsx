"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scale, Lock, Mail, ArrowRight, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();

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

  // Handle Firebase Google Sign-In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!isFirebaseConfigured()) {
      setErrorMsg(
        'Firebase configuration is pending. Please configure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.'
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

      setSuccessMsg('Successfully signed in with Google! Redirecting to dashboard...');
      
      // Refresh router so header catches session cookie
      router.refresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);

    } catch (err) {
      console.warn('Google Sign-In caught error:', err.code || err.message);

      // Map Firebase error codes to friendly, non-technical messages
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

  // Handle Standard Email/Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setIsEmailLoading(true);

      const res = await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password. Please try again.');
      }

      setSuccessMsg('Signed in successfully! Redirecting...');
      router.refresh();
      setTimeout(() => {
        router.push('/dashboard');
      }, 400);

    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
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
            <span>LowStudy Student Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to LowStudy</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Access your university syllabus, BNS 2023 statutory notes, MCQs, and NyayaAI study companion.
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

        {/* Email & Password Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="login-email-input"
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
                <span>Password</span>
              </label>
            </div>
            <input
              type="password"
              id="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isEmailLoading || isGoogleLoading}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white text-xs outline-none transition disabled:opacity-50"
            />
          </div>

          {/* Email Login Button */}
          <button
            type="submit"
            id="login-submit-button"
            disabled={isEmailLoading || isGoogleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isEmailLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Login with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Don't have an account link */}
        <div className="text-center pt-0.5">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-amber-400 hover:text-amber-300 font-semibold transition underline decoration-amber-400/40 underline-offset-2">
              Create one
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
            id="google-signin-button"
            onClick={handleGoogleSignIn}
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

        {/* Open Curriculum / Alternative Access Footer */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            Want to explore syllabus materials first?
          </p>
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            <span>Browse All Subjects & Notes (Free)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
