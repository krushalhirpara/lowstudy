"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  Building2,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('semester'); // 'semester' | 'annual'
  const [openFaq, setOpenFaq] = useState(0);

  const plans = [
    {
      name: "Free Student Access",
      badge: "Open Access Default",
      price: "₹0",
      period: "forever",
      desc: "Essential legal syllabus intelligence, Bare Acts and basic exam preparation for every law student in Gujarat.",
      ctaText: "Start Learning Free",
      ctaHref: "/curriculum",
      highlight: false,
      features: [
        "Complete 2026-27 Gujarat University Verified Syllabi",
        "Bharatiya Nyaya Sanhita (BNS 2023) vs IPC 1860 Comparison",
        "Supreme Court Landmark Judgments & Ratio Decidendi",
        "Basic MCQ Practice & Daily Quiz",
        "English & Gujarati Legal Dictionary & Latin Maxims",
        "Standard Study Notes & Unit Breakdowns"
      ]
    },
    {
      name: "Pro Law Scholar",
      badge: "Most Popular",
      price: billingCycle === 'semester' ? "₹199" : "₹349",
      period: billingCycle === 'semester' ? "per semester" : "per academic year",
      desc: "Comprehensive exam evaluation, unlimited AI legal drafting critique, timed 3-hour mock tests, and weak-topic revision.",
      ctaText: "Get Started Pro",
      ctaHref: "/dashboard",
      highlight: true,
      features: [
        "Everything in Free Access",
        "Unlimited AI Exam Answer Grader with IRAC Diagnostic Feedback",
        "AI Legal Drafting Lab (Notices, Plaints, Bail Applications)",
        "Virtual Moot Court Arena with AI Judicial Bench",
        "Full Timed 3-Hour Exam Simulator with Negative Marking",
        "Automated Mistake Notebook & Spaced Repetition Reminders",
        "Previous 5-Year Solved University Question Papers",
        "Priority 24/7 Access to NyayaAI Legal Tutor"
      ]
    },
    {
      name: "College & Institutional",
      badge: "For Law Faculties",
      price: "Custom",
      period: "per institution",
      desc: "For Gujarat law colleges, universities, and student bar associations requiring centralized curriculum governance.",
      ctaText: "Contact Institutional Desk",
      ctaHref: "mailto:support@lowstudy.com?subject=Institutional%20Plan%20Inquiry",
      highlight: false,
      features: [
        "Everything in Pro Law Scholar for all enrolled students",
        "Faculty Administration & Question Bank Management Console",
        "Automated University Syllabus Audit & Circular Change Diffs",
        "Institutional Mock Test Scheduling & Diagnostic Analytics",
        "Custom College Branding & Internal Subject Additions",
        "Dedicated Academic Coordinator & SLA Support"
      ]
    }
  ];

  const faqs = [
    {
      q: "Is LowStudy really free for Gujarat law students?",
      a: "Yes! All verified syllabi, Bare Acts (BNS 2023), landmark Supreme Court judgments, and standard MCQ practice are 100% free with open access. You do not even need a mandatory login to start reading notes."
    },
    {
      q: "What is included in the AI Answer Evaluator?",
      a: "The AI Answer Evaluator assesses your written legal answers against university marking rubrics, checking for Issue identification, Relevant Rule/Statute, Application to facts, and Conclusion (IRAC method) with score estimation."
    },
    {
      q: "Are the new criminal laws (BNS, BNSS, BSA 2023) included in all plans?",
      a: "Yes! Both Free and Pro tiers include side-by-side comparative references between old penal codes (IPC/CrPC/IEA) and the new 2023 criminal acts."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes, you can cancel anytime with zero cancellation fees. Your Pro access remains active until the end of your billing period."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-poppins text-slate-900 pb-20">
      
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-14 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Transparent & Affordable Law School Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Invest in Your Legal Mastery
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Free core syllabus intelligence for every law student. Upgrade to Pro for AI answer grading, virtual moot court, and timed exam simulators.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBillingCycle('semester')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'semester'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Per Semester
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual Batch</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                plan.highlight
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 text-white border-2 border-amber-500 shadow-2xl scale-100 lg:scale-105 z-10'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-md hover:shadow-lg'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  {!plan.highlight && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`text-xl font-bold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs leading-relaxed ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                    {plan.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/20">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${plan.highlight ? 'text-amber-400' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      / {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs leading-snug">
                      <div className={`p-0.5 rounded-full shrink-0 mt-0.5 ${
                        plan.highlight ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    plan.highlight
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Official Source Mappings</h4>
              <p className="text-xs text-slate-600 mt-1">
                Audited against official Gujarat university gazettes, department circulars, and Bar Council recommendations.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">BNS 2023 Fully Integrated</h4>
              <p className="text-xs text-slate-600 mt-1">
                All penal provisions, model answers, and MCQs are mapped to the new criminal law enactments.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Built for Gujarat Law Colleges</h4>
              <p className="text-xs text-slate-600 mt-1">
                Specific modules for Saurashtra University, Gujarat University, VNSGU Surat, MSU Baroda, HNGU and GNLU.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pricing FAQs</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
