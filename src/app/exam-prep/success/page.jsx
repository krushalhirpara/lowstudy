"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, ShieldCheck, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExamPrepSuccessPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [accessData, setAccessData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const checkEntitlement = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/exam-prep/access');
      if (res.ok) {
        const data = await res.json();
        setAccessData(data);
      }
    } catch (err) {
      console.warn('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        router.push('/login');
        return;
      }

      async function verifyFromCallbackAndCheck() {
        setIsVerifying(true);
        try {
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const paymentId = urlParams.get('razorpay_payment_id');
            const orderId = urlParams.get('razorpay_order_id');
            const signature = urlParams.get('razorpay_signature');
            const linkRef = urlParams.get('razorpay_payment_link_reference_id');
            const linkId = urlParams.get('razorpay_payment_link_id');

            if (paymentId && (orderId || linkRef || linkId) && signature) {
              await fetch('/api/exam-prep/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: linkRef || orderId,
                  razorpayOrderId: orderId || linkId,
                  razorpayPaymentId: paymentId,
                  razorpaySignature: signature,
                }),
              });
            }
          }
        } catch (e) {
          console.warn('Callback payment verification notice:', e);
        }

        checkEntitlement();
      }

      verifyFromCallbackAndCheck();
    }
  }, [currentUser, isAuthLoading, router]);

  if (isAuthLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400">Verifying payment with server...</p>
      </div>
    );
  }

  // If server-side verification confirms active entitlement
  const hasAccess = accessData?.hasAccess;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {hasAccess ? (
          <>
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Payment Verified & Captured
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your <strong>LowStudy Exam Prep Pass</strong> is now active for all supported universities, courses, semesters, and subjects.
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Product:</span>
                <span className="font-semibold text-white">LowStudy Exam Prep Pass</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-amber-400">₹299.00 (One-Time)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-mono text-white text-[11px]">{currentUser?.email}</span>
              </div>
              {accessData?.entitlement?.order?.receipt && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Receipt Ref:</span>
                  <span className="font-mono text-slate-300 text-[11px]">{accessData.entitlement.order.receipt}</span>
                </div>
              )}
            </div>

            {/* Primary Action */}
            <Link
              href="/exam-prep/library"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start Exam Preparation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <>
            {/* Pending or Unverified State */}
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Payment Verification Pending
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                We have not received payment confirmation from the gateway yet. If your payment went through, it will activate automatically within a few moments.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={checkEntitlement}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Check Status</span>
              </button>

              <Link
                href="/exam-prep"
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center transition-colors"
              >
                Return to Exam Prep
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
