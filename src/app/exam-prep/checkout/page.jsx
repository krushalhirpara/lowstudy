"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ExternalLink,
  MapPin,
  Loader2,
  KeyRound,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { trackExamPrepPurchase, trackStudentSignup, trackBeginCheckout } from '@/lib/analytics';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoading: isAuthLoading, refreshUser } = useAuth();

  // Entitlement & Page Loading
  const [accessData, setAccessData] = useState(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Step 1: Student Identity & Mobile OTP State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2: Academic Profile State
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [universityDetails, setUniversityDetails] = useState(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [hierarchyError, setHierarchyError] = useState('');

  // Step 2b: Location Permission & Helper State (Consent-based)
  const [locationStatus, setLocationStatus] = useState('idle'); // idle, requesting, success, denied, unavailable
  const [locationMessage, setLocationMessage] = useState('');

  // Step 3: Payment State
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // 1. Check existing entitlement
  useEffect(() => {
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
  }, [currentUser]);

  // 2. Prefill details if user is already logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.fullName && !fullName) {
        setFullName(currentUser.fullName);
      }
      if (currentUser.phoneNumber) {
        setMobileNumber(currentUser.phoneNumber);
        setIsMobileVerified(true);
      }
      if (currentUser.universityId && !selectedUniversityId) {
        setSelectedUniversityId(currentUser.universityId);
      }
      if (currentUser.collegeId && !selectedCollegeId) {
        setSelectedCollegeId(currentUser.collegeId);
      }
      if (currentUser.courseId && !selectedCourseId) {
        setSelectedCourseId(currentUser.courseId);
      }
      if (currentUser.semesterId && !selectedSemesterId) {
        setSelectedSemesterId(currentUser.semesterId);
      }
    }
  }, [currentUser]);

  // 3. Load Universities from DB
  useEffect(() => {
    async function fetchUniversities() {
      setIsLoadingUniversities(true);
      setHierarchyError('');
      try {
        const res = await fetch('/api/exam-prep/hierarchy');
        if (!res.ok) throw new Error('Failed to load universities.');
        const data = await res.json();
        if (data.universities && data.universities.length > 0) {
          setUniversities(data.universities);
          // If query param or currentUser has universityId, prioritize that
          const paramUni = searchParams?.get('universityId');
          const defaultUni = paramUni || currentUser?.universityId || data.universities[0].id;
          setSelectedUniversityId((prev) => prev || defaultUni);
        } else {
          setUniversities([]);
        }
      } catch (err) {
        setHierarchyError(err.message || 'Unable to connect to academic database.');
      } finally {
        setIsLoadingUniversities(false);
      }
    }
    fetchUniversities();
  }, [searchParams, currentUser]);

  // 4. Load Courses, Semesters and Colleges for selected University
  useEffect(() => {
    if (!selectedUniversityId) {
      setUniversityDetails(null);
      return;
    }

    async function fetchUniversityDetails() {
      setIsLoadingDetails(true);
      try {
        const res = await fetch(`/api/exam-prep/hierarchy?universityId=${selectedUniversityId}`);
        if (!res.ok) throw new Error('Failed to load university programs.');
        const data = await res.json();
        if (data.university) {
          setUniversityDetails(data.university);

          // Handle Course selection
          const paramCourse = searchParams?.get('courseId');
          const validCourses = data.university.courses || [];
          const matchedCourse = validCourses.find(c => c.id === (paramCourse || selectedCourseId));
          const targetCourseId = matchedCourse ? matchedCourse.id : (validCourses[0]?.id || '');
          setSelectedCourseId(targetCourseId);

          // Handle Semester selection
          const targetCourse = validCourses.find(c => c.id === targetCourseId);
          const validSemesters = targetCourse?.semesters || [];
          const paramSem = searchParams?.get('semesterId');
          const matchedSem = validSemesters.find(s => s.id === (paramSem || selectedSemesterId));
          setSelectedSemesterId(matchedSem ? matchedSem.id : (validSemesters[0]?.id || ''));

          // Handle College selection
          const validColleges = data.university.colleges || [];
          if (validColleges.length > 0 && selectedCollegeId) {
            const hasCollege = validColleges.some(c => c.id === selectedCollegeId);
            if (!hasCollege) setSelectedCollegeId('');
          }
        }
      } catch (err) {
        console.warn('Error fetching university details:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchUniversityDetails();
  }, [selectedUniversityId]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Dependent Selectors: Available Courses & Semesters
  const availableColleges = useMemo(() => {
    return universityDetails?.colleges || [];
  }, [universityDetails]);

  const availableCourses = useMemo(() => {
    return universityDetails?.courses || [];
  }, [universityDetails]);

  const availableSemesters = useMemo(() => {
    const course = availableCourses.find(c => c.id === selectedCourseId);
    return course?.semesters || [];
  }, [availableCourses, selectedCourseId]);

  // Handle University change -> Reset dependent course & semester
  const handleUniversityChange = (newUniId) => {
    setSelectedUniversityId(newUniId);
    setSelectedCollegeId('');
    setSelectedCourseId('');
    setSelectedSemesterId('');
  };

  // Handle Course change -> Reset dependent semester
  const handleCourseChange = (newCourseId) => {
    setSelectedCourseId(newCourseId);
    const course = availableCourses.find(c => c.id === newCourseId);
    setSelectedSemesterId(course?.semesters?.[0]?.id || '');
  };

  // OTP: Send Code Handler
  const handleSendOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    const cleaned = mobileNumber.trim();
    if (!cleaned) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/exam-prep/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleaned }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }

      setIsOtpSent(true);
      setMobileNumber(data.normalizedPhone || cleaned);
      setOtpMessage(data.message || 'Verification code sent to your mobile number.');
      setResendCooldown(data.resendCooldownSeconds || 30);
    } catch (err) {
      setOtpError(err.message || 'Could not send verification SMS.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // OTP: Verify Code Handler
  const handleVerifyOtp = async () => {
    setOtpError('');
    setOtpMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit code received on your mobile.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/exam-prep/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: mobileNumber,
          otp: otpCode.trim(),
          fullName: fullName.trim() || 'Law Student',
          universityId: selectedUniversityId,
          collegeId: selectedCollegeId,
          courseId: selectedCourseId,
          semesterId: selectedSemesterId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid or expired verification code.');
      }

      setIsMobileVerified(true);
      setOtpMessage('Mobile number verified successfully.');
      trackStudentSignup('phone_otp');
      if (refreshUser) refreshUser();
    } catch (err) {
      setOtpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Transparent Geolocation Recommendation Helper (Consent-based)
  const handleRequestLocationRecommendation = () => {
    setLocationStatus('requesting');
    setLocationMessage('Requesting browser permission to detect city...');

    if (!navigator?.geolocation) {
      setLocationStatus('unavailable');
      setLocationMessage('Location services are not supported by your browser. Please select your university manually.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('success');
        setLocationMessage('Location detected. Matching with nearest university...');

        // Gujarat coordinate bounds / city matching
        const { latitude, longitude } = position.coords;
        let matchedUni = null;

        // Approximate coordinates for Gujarat university regions
        if (latitude >= 22.8 && latitude <= 23.3 && longitude >= 72.4 && longitude <= 72.8) {
          // Ahmedabad area -> Gujarat University
          matchedUni = universities.find(u => u.code === 'GU' || u.id === 'gu' || u.city?.toLowerCase().includes('ahmedabad'));
        } else if (latitude >= 22.1 && latitude <= 22.5 && longitude >= 70.6 && longitude <= 71.1) {
          // Rajkot area -> Saurashtra University
          matchedUni = universities.find(u => u.code === 'SU' || u.id === 'su' || u.city?.toLowerCase().includes('rajkot'));
        } else if (latitude >= 21.0 && latitude <= 21.4 && longitude >= 72.6 && longitude <= 73.1) {
          // Surat area -> VNSGU
          matchedUni = universities.find(u => u.code === 'VNSGU' || u.id === 'vnsgu' || u.city?.toLowerCase().includes('surat'));
        } else if (latitude >= 22.2 && latitude <= 22.5 && longitude >= 73.1 && longitude <= 73.4) {
          // Vadodara area -> MSU Baroda
          matchedUni = universities.find(u => u.code === 'MSU' || u.id === 'msu' || u.city?.toLowerCase().includes('vadodara'));
        }

        if (matchedUni) {
          setSelectedUniversityId(matchedUni.id);
          setLocationMessage(`Recommended: ${matchedUni.name} based on your city.`);
        } else {
          setLocationMessage('Location received. Please pick your university from the list.');
        }
      },
      (error) => {
        setLocationStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage('Location permission was declined. You can select your university directly from the list.');
        } else {
          setLocationMessage('Could not retrieve location. Please choose your university manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

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

  // Step 3: Handle Razorpay Payment Initiation
  const handleInitiatePayment = async () => {
    if (!isMobileVerified) {
      setPaymentError('Please verify your mobile number with OTP in Step 1 before proceeding to payment.');
      return;
    }

    if (!selectedUniversityId || !selectedCourseId || !selectedSemesterId) {
      setPaymentError('Please select your University, Course and Semester in Step 2.');
      return;
    }

    if (!agreedToTerms) {
      setPaymentError('Please accept the access terms before completing payment.');
      return;
    }

    setIsPaymentProcessing(true);
    setPaymentError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load secure Razorpay gateway. Please check your internet connection.');
      }

      // 1. Create Server-Enforced Order (₹299 / 29900 paise)
      const orderRes = await fetch('/api/exam-prep/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || 'Law Student',
          phoneNumber: mobileNumber,
          universityId: selectedUniversityId,
          collegeId: selectedCollegeId,
          courseId: selectedCourseId,
          semesterId: selectedSemesterId,
          notes: {
            fullName: fullName.trim(),
            phoneNumber: mobileNumber,
            universityId: selectedUniversityId,
            collegeId: selectedCollegeId,
            courseId: selectedCourseId,
            semesterId: selectedSemesterId,
          }
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to initialize payment order.');
      }

      const orderData = await orderRes.json();

      if (orderData.alreadyActive) {
        router.push('/exam-prep/library');
        return;
      }

      // 2. Open Razorpay Standard Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // 29900 paise
        currency: orderData.currency || 'INR',
        name: 'LowStudy',
        description: 'Exam Prep Pass — All Universities & Subjects',
        image: 'https://lowstudy.com/favicon.ico',
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: fullName || currentUser?.fullName || '',
          email: currentUser?.email || `${mobileNumber}@student.lowstudy.com`,
          contact: mobileNumber,
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
            // 3. Server-side HMAC & Status Verification
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
              throw new Error(verifyErr.error || 'Signature verification failed.');
            }

            const verifyResult = await verifyRes.json();
            if (verifyResult.success) {
              trackExamPrepPurchase({
                transactionId: response.razorpay_payment_id || orderData.razorpayOrderId,
                value: 299,
              });
              router.push('/exam-prep/success');
            } else {
              throw new Error(verifyResult.message || 'Payment verification could not be completed.');
            }
          } catch (vErr) {
            console.error('Payment verification failed:', vErr);
            router.push(`/exam-prep/failure?error=${encodeURIComponent(vErr.message)}&orderId=${orderData.orderId}`);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        console.error('Payment failed event:', resp.error);
        setIsPaymentProcessing(false);
        setPaymentError(`Payment failed: ${resp.error?.description || resp.error?.reason || 'Transaction could not be completed.'}`);
      });

      trackBeginCheckout(299);
      razorpayInstance.open();
    } catch (err) {
      console.error('Initiate payment error:', err);
      setPaymentError(err.message || 'Payment initiation failed. Please try again.');
      setIsPaymentProcessing(false);
    }
  };

  // Loading State
  if (isCheckingAccess || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span>Loading secure LowStudy checkout...</span>
      </div>
    );
  }

  // Active Entitlement State
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
              Your account already holds an active LowStudy Exam Prep Pass ({accessData.product?.NAME}).
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins selection:bg-amber-500 selection:text-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/exam-prep" className="hover:text-amber-400 transition-colors">
            Exam Prep
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-200 font-semibold">Pass Registration & Checkout</span>
        </div>

        {/* Page Title Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>₹299 One-Time Access • Razorpay Encrypted</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Exam Prep Pass Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Verify your student mobile number, select your law program, and unlock complete question banks and structured model answers.
          </p>
        </div>

        {/* Payment Error Alert */}
        {paymentError && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-red-200">Payment Notice:</span>
              <p>{paymentError}</p>
            </div>
          </div>
        )}

        {/* Main Grid: Form Steps (7 cols) + Order Summary & Pay Action (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Guided 2-Step Registration & Academic Profile (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 1: Student Identity & Mobile OTP Verification */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Student Details & Mobile Verification
                  </h2>
                </div>
                {isMobileVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>

              {isMobileVerified ? (
                /* Verified Badge State */
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Student Name:</span>
                    <span className="font-bold text-white">{fullName || currentUser?.fullName || 'Law Student'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Verified Mobile:</span>
                    <span className="font-mono text-emerald-400 font-bold">{mobileNumber}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-400 italic">
                    Identity verified with OTP. Your Exam Prep Pass will be bound to this verified mobile number.
                  </div>
                </div>
              ) : (
                /* Unverified Form State */
                <div className="space-y-3.5 text-xs">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Krushal Hirpara"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">Mobile Number (Indian 10-Digit)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          disabled={isOtpSent}
                          placeholder="e.g. 9876543210"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs placeholder:text-slate-600 focus:outline-none disabled:opacity-60"
                        />
                      </div>
                      {!isOtpSent && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isSendingOtp ? 'Sending...' : 'Send OTP'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Input Field */}
                  {isOtpSent && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-slate-300 font-semibold">
                          <span>Enter 6-Digit Verification Code</span>
                          {resendCooldown > 0 ? (
                            <span className="text-[11px] text-slate-500 font-normal">
                              Resend in {resendCooldown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="text-[11px] text-amber-400 hover:underline font-normal cursor-pointer"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="6-digit OTP"
                            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded-xl py-2.5 pl-9 pr-3 text-white text-xs tracking-widest font-mono placeholder:text-slate-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify Mobile Number'}
                      </button>
                    </div>
                  )}

                  {/* OTP Feedback Messages */}
                  {otpMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-[11px]">
                      {otpMessage}
                    </div>
                  )}
                  {otpError && (
                    <div className="p-2.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-[11px]">
                      {otpError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: University, Course and Semester Selectors */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-white">
                    Select Academic Profile
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">
                  From LowStudy Database
                </span>
              </div>

              {/* Hierarchy Error State */}
              {hierarchyError && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-800 text-red-300 text-xs">
                  {hierarchyError}
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* University Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-semibold block">University</label>
                    {/* Optional Location Helper Button */}
                    <button
                      type="button"
                      onClick={handleRequestLocationRecommendation}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Optional: Use approximate city location to recommend your university"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Auto-detect by City (Optional)</span>
                    </button>
                  </div>

                  {locationMessage && (
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                      {locationMessage}
                    </div>
                  )}

                  {isLoadingUniversities ? (
                    <div className="h-10 rounded-xl bg-slate-950 border border-slate-800 animate-pulse flex items-center px-3 text-slate-500 text-xs">
                      Loading supported universities...
                    </div>
                  ) : (
                    <select
                      value={selectedUniversityId}
                      onChange={(e) => handleUniversityChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                    >
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name} ({uni.code}) — {uni.city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* College / Institution Selector (Optional) */}
                {availableColleges.length > 0 && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="text-slate-300 font-semibold block">
                      Affiliated College / Center (Optional)
                    </label>
                    <select
                      value={selectedCollegeId}
                      onChange={(e) => setSelectedCollegeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                    >
                      <option value="">University Department / Main Campus</option>
                      {availableColleges.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Course Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Law Program / Course</label>
                  {isLoadingDetails ? (
                    <div className="h-10 rounded-xl bg-slate-950 border border-slate-800 animate-pulse flex items-center px-3 text-slate-500 text-xs">
                      Loading available courses...
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                      No active courses listed for this university.
                    </div>
                  ) : (
                    <select
                      value={selectedCourseId}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                    >
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code || 'Law'}) — {c.totalSemesters} Semesters
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Semester Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Current Semester</label>
                  {isLoadingDetails ? (
                    <div className="h-10 rounded-xl bg-slate-950 border border-slate-800 animate-pulse flex items-center px-3 text-slate-500 text-xs">
                      Loading semesters...
                    </div>
                  ) : availableSemesters.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
                      Please select a course to view valid semesters.
                    </div>
                  ) : (
                    <select
                      value={selectedSemesterId}
                      onChange={(e) => setSelectedSemesterId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none"
                    >
                      {availableSemesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title || `Semester ${s.semesterNumber}`} ({s.subjects?.length || 0} Subjects Available)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  💡 Note: Your ₹299 pass includes <strong>all semesters and subjects</strong> across all supported universities. Selecting your current semester customizes your default starting view in the library.
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary, Terms, and ₹299 Razorpay Payment (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Official LowStudy Pass
                  </span>
                  <h3 className="text-lg font-bold text-white">Exam Prep Pass</h3>
                  <p className="text-xs text-slate-400">
                    Questions & Structured Model Answers
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">₹299</div>
                  <div className="text-[11px] text-slate-400">One-Time (INR)</div>
                </div>
              </div>

              {/* What is Included Checklist */}
              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-slate-200 text-xs mb-1">Included Benefits:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2, 5, 10, 14/15, & 20-Mark Answer Formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>All 9 Universities & Supported Semesters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>BNS 2023, BNSS, BSA & Landmark Case Ratios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Study Bookmarking & Revision Progress Tracker</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Non-expiring access, zero recurring fees</span>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Exam Prep Pass (All Semesters)</span>
                  <span>₹299.00</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Taxes & Gateway Fees</span>
                  <span className="text-emerald-400 font-semibold">Included</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-amber-400 text-lg">₹299.00</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2.5 text-[11px] text-slate-400 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 shrink-0"
                />
                <span>
                  I understand this is a one-time non-recurring payment of ₹299 for structured law revision materials across supported LowStudy curricula.
                </span>
              </label>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={isPaymentProcessing || !isMobileVerified || !agreedToTerms}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : !isMobileVerified ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Verify Mobile (Step 1) to Pay</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹299 with Razorpay</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-500">
                UPI • Credit/Debit Cards • Net Banking • Wallets
              </div>
            </div>

            {/* Privacy & Academic Scope Notice */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <div className="font-bold text-slate-300">Privacy & Access Policy:</div>
              <p>
                • Your verified mobile number is strictly used to bind your educational pass to your account.
              </p>
              <p>
                • Location access is optional and solely used for local university recommendations. No precise coordinates are retained.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ExamPrepCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Loading secure LowStudy checkout...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
