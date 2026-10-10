"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Building2,
  Mail,
  User,
  Phone,
  Scale,
  CreditCard,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ExamPrepCheckoutPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  const [accessData, setAccessData] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // 1. Check Auth & Existing Entitlement
  useEffect(() => {
    if (isAuthLoading) return;

    if (!currentUser) {
      router.push(`/signup?redirect=${encodeURIComponent('/exam-prep/checkout')}`);
      return;
    }

    async function checkAccess() {
      try {
        const res = await fetch('/api/exam-prep/access');
        if (res.ok) {
          const data = await res.json();
          setAccessData(data);
        }
      } catch (err) {
        console.warn('Access check error:', err);
      } finally {
        setIsCheckingAccess(false);
      }
    }

    checkAccess();
  }, [currentUser, isAuthLoading, router]);

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 2. Handle Razorpay Checkout Initiation
  const handleInitiatePayment = async () => {
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the educational access terms before proceeding.');
      return;
    }

    setIsPaymentProcessing(true);
    setErrorMessage('');

    try {
      // Step A: Load script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage('Failed to load secure Razorpay gateway. Please check your internet connection.');
        setIsPaymentProcessing(false);
        return;
      }

      // Step B: Create Server-side Order
      const orderRes = await fetch('/api/exam-prep/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: {
            user_id: currentUser.id,
            email: currentUser.email,
          }
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to create payment order.');
      }

      const orderData = await orderRes.json();

      if (orderData.alreadyActive) {
        router.push('/exam-prep/library');
        return;
      }

      // Step C: Open Razorpay Web Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // in paise (29900)
        currency: orderData.currency || 'INR',
        name: 'LowStudy',
        description: 'Exam Prep Pass — All Universities & Subjects',
        image: 'https://lowstudy.com/favicon.ico',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: currentUser.fullName || currentUser.displayName || '',
          email: currentUser.email || '',
          contact: currentUser.phoneNumber || '',
        },
        theme: {
          color: '#f59e0b', // Amber 500
        },
        modal: {
          ondismiss: function () {
            setIsPaymentProcessing(false);
          },
        },
        handler: async function (response) {
          try {
            // Step D: Server-side Signature Verification
            const verifyRes = await fetch('/api/exam-prep/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyErr = await verifyRes.json();
              throw new Error(verifyErr.error || 'Payment signature verification failed.');
            }

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              router.push('/exam-prep/success');
            }
          } catch (vErr) {
            console.error('Verification error:', vErr);
            router.push(`/exam-prep/failure?error=${encodeURIComponent(vErr.message)}`);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setIsPaymentProcessing(false);
        setErrorMessage(`Payment failed: ${response.error.description || response.error.reason}`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment initiation failed. Please try again.');
      setIsPaymentProcessing(false);
    }
  };

  if (isAuthLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading secure checkout...
      </div>
    );
  }

  // If user already has active entitlement
  if (accessData?.hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white">Active Pass Detected</h2>
            <p className="text-xs text-slate-300">
              You already own an active LowStudy Exam Prep Pass ({accessData.product?.NAME}).
            </p>
          </div>

          <Link
            href="/exam-prep/library"
            className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Open Exam Prep Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/exam-prep" className="hover:text-amber-400 transition-colors">
            Exam Prep
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-semibold">Secure Checkout</span>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Razorpay 256-Bit Encrypted Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Complete Your Exam Prep Pass Purchase
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            One payment of ₹299 gives your LowStudy account non-expiring access across all supported law universities, semesters, and subjects.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-200">Payment Notice:</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Two Column Layout: Order Summary & Checkout Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Details & Legal terms (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Product Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Official Product Pass
                  </span>
                  <h3 className="text-lg font-bold text-white">LowStudy Exam Prep Pass</h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive Question Bank & Marks-Wise Model Answers
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">₹299</div>
                  <div className="text-[11px] text-slate-400">One-Time (INR)</div>
                </div>
              </div>

              {/* What is Included Checklist */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="font-semibold text-slate-200 text-xs mb-2">Included Access Rights:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All Gujarat Law Universities & Affiliated Colleges</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All 3-Year and 5-Year Integrated LLB Semesters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>2, 5, 10, 14/15, and 20-Mark Structured Model Answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bharatiya Nyaya Sanhita (BNS 2023) & Supreme Court Ratios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Spaced Repetition Summaries & Study Bookmarking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Non-expiring access, zero recurring fees or renewals</span>
                </div>
              </div>
            </div>

            {/* Legal Disclaimers & Support Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="font-bold text-slate-300 text-xs">Access Terms & Policy:</div>
              <p>
                • <strong>Educational Practice Scope:</strong> Questions and model answers are prepared for academic study and exam structure practice. They do not constitute official university question leaks or guaranteed examination papers.
              </p>
              <p>
                • <strong>Refund Policy:</strong> Due to immediate digital unlocking of the entire law library upon payment verification, verified access grants are non-refundable except in cases of accidental duplicate transactions verified via Razorpay payment records.
              </p>
              <p>
                • <strong>Support Contact:</strong> If you experience any technical or access issue, contact our academic support desk at <span className="text-amber-400 font-mono">support@lowstudy.com</span>.
              </p>
            </div>

          </div>

          {/* Right Column: Buyer Details & Payment Trigger (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Buyer Account Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Authenticated Student
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>{currentUser?.fullName || currentUser?.displayName || 'Law Student'}</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Account Email:</span>
                  <span className="font-mono text-white text-[11px] truncate max-w-[180px]">{currentUser?.email}</span>
                </div>
                {currentUser?.phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="text-white">{currentUser.phoneNumber}</span>
                  </div>
                )}
                {currentUser?.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">City:</span>
                    <span className="text-white">{currentUser.city}</span>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Exam Prep Pass (All Subjects)</span>
                  <span>₹299.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Taxes / Gateway Fees</span>
                  <span className="text-emerald-400 font-semibold">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-amber-400 text-lg">₹299.00</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 text-[11px] text-slate-400 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 shrink-0"
                />
                <span>
                  I understand this is a one-time non-recurring payment of ₹299 for educational practice material across supported LowStudy subjects.
                </span>
              </label>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={isPaymentProcessing || !agreedToTerms}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPaymentProcessing ? (
                  <span>Connecting to Razorpay...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹299 with Razorpay</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-500">
                UPI • Credit/Debit Cards • Net Banking • Wallets supported
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
