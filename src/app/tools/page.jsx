"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  Scale, 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Percent, 
  Search,
  Building2,
  DollarSign
} from 'lucide-react';
import { IPC_VS_BNS_MAP } from '@/data/legalData';

const LATIN_MAXIMS = [
  { term: "Actus non facit reum nisi mens sit rea", meaning: "An act does not make a person guilty unless the mind is also guilty. (Essential for criminal liability).", subject: "Criminal Law" },
  { term: "Audi alteram partem", meaning: "Hear the other side. No person shall be condemned unheard. (Fundamental rule of natural justice).", subject: "Administrative & Constitutional Law" },
  { term: "Nemo judex in causa sua", meaning: "No one should be a judge in their own cause. (Rule against bias).", subject: "Administrative Law" },
  { term: "Damnum sine injuria", meaning: "Damage without legal injury. (Gloucester Grammar School Case).", subject: "Law of Torts" },
  { term: "Injuria sine damno", meaning: "Legal injury without actual physical or monetary damage. (Ashby v. White).", subject: "Law of Torts" },
  { term: "Ignorantia juris non excusat", meaning: "Ignorance of the law is no excuse.", subject: "Jurisprudence" },
  { term: "Res ipsa loquitur", meaning: "The thing speaks for itself. (Doctrine of negligence).", subject: "Law of Torts" },
  { term: "Ubi jus ibi remedium", meaning: "Where there is a right, there is a remedy.", subject: "Jurisprudence & Torts" },
  { term: "Lex non cogit ad impossibilia", meaning: "The law does not compel a person to do what is impossible. (Basis of frustration under Contract Act).", subject: "Law of Contract" },
  { term: "Salus populi suprema lex esto", meaning: "The welfare of the people is the supreme law.", subject: "Constitutional Law" }
];

const LIMITATION_PERIODS = [
  { suit: "Suit for Recovery of Money (Loan / Debt)", article: "Article 19", period: "3 Years", from: "When loan is made or repayment is due" },
  { suit: "Suit for Specific Performance of Contract", article: "Article 54", period: "3 Years", from: "Date fixed for performance or notice of refusal" },
  { suit: "Suit for Recovery of Immovable Property (Title)", article: "Article 65", period: "12 Years", from: "When possession becomes adverse to plaintiff" },
  { suit: "Suit for Compensation for Tortious Acts / Defamation", article: "Article 75", period: "1 Year", from: "When libel or slander is published" },
  { suit: "Appeal to High Court against a decree/order of District Court", article: "Article 116(a)", period: "90 Days", from: "Date of decree or order" },
  { suit: "Appeal to any other court from decree/order", article: "Article 116(b)", period: "30 Days", from: "Date of decree or order" },
  { suit: "Execution of a Civil Decree", article: "Article 136", period: "12 Years", from: "When decree becomes enforceable" }
];

export default function LegalToolsPage() {
  const [activeTab, setActiveTab] = useState('limitation'); // limitation, interest, courtfees, crossref, maxims

  // Limitation calculator states
  const [limitationStartDate, setLimitationStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSuitType, setSelectedSuitType] = useState(LIMITATION_PERIODS[0]);

  // Interest calculator states
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(6);
  const [durationMonths, setDurationMonths] = useState(24);

  // Cross ref search
  const [bnsSearch, setBnsSearch] = useState('');
  const [maximSearch, setMaximSearch] = useState('');

  // Calculations
  const calculatedSimpleInterest = Math.round((principalAmount * interestRate * (durationMonths / 12)) / 100);
  const calculatedTotalAmount = principalAmount + calculatedSimpleInterest;

  // Court fee estimation (Gujarat Standard Schedule)
  const calculateGujaratCourtFees = (amount) => {
    if (amount <= 10000) return Math.round(amount * 0.05);
    if (amount <= 50000) return 500 + Math.round((amount - 10000) * 0.06);
    if (amount <= 100000) return 2900 + Math.round((amount - 50000) * 0.07);
    return Math.min(75000, 6400 + Math.round((amount - 100000) * 0.04));
  };

  const getLimitationEndDate = () => {
    const start = new Date(limitationStartDate);
    if (selectedSuitType.period.includes('3 Years')) {
      start.setFullYear(start.getFullYear() + 3);
    } else if (selectedSuitType.period.includes('12 Years')) {
      start.setFullYear(start.getFullYear() + 12);
    } else if (selectedSuitType.period.includes('1 Year')) {
      start.setFullYear(start.getFullYear() + 1);
    } else if (selectedSuitType.period.includes('90 Days')) {
      start.setDate(start.getDate() + 90);
    } else if (selectedSuitType.period.includes('30 Days')) {
      start.setDate(start.getDate() + 30);
    }
    return start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredMaxims = LATIN_MAXIMS.filter(m => 
    m.term.toLowerCase().includes(maximSearch.toLowerCase()) || 
    m.meaning.toLowerCase().includes(maximSearch.toLowerCase()) ||
    m.subject.toLowerCase().includes(maximSearch.toLowerCase())
  );

  const filteredBns = IPC_VS_BNS_MAP.filter(m =>
    m.ipc.toLowerCase().includes(bnsSearch.toLowerCase()) ||
    m.bns.toLowerCase().includes(bnsSearch.toLowerCase()) ||
    m.offence.toLowerCase().includes(bnsSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>LEGAL ACADEMIC & PRACTICE SUITE</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified Statutory Computations
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Legal Academic Calculators & Tools
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Essential legal utilities for law students: Limitation Act period calculator, Section 34 CPC interest estimator, Gujarat court fee calculator, IPC-BNS mapping, and Latin maxims lookup.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/bare-acts"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>Bare Acts (BNS 2023)</span>
              </Link>
            </div>
          </div>

          {/* Tool Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {[
              { id: 'limitation', label: 'Limitation Act Calculator', icon: Calendar },
              { id: 'interest', label: 'Sec 34 CPC Interest Calculator', icon: Percent },
              { id: 'courtfees', label: 'Gujarat Court Fees Estimator', icon: DollarSign },
              { id: 'crossref', label: 'IPC ↔ BNS Section Finder', icon: Scale },
              { id: 'maxims', label: 'Latin Maxims Directory', icon: BookOpen }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Tool 1: Limitation Act Calculator */}
        {activeTab === 'limitation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Limitation Act 1963 Computation Engine
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Cause of Action / Suit Type:
                </label>
                <select
                  value={selectedSuitType.suit}
                  onChange={(e) => {
                    const found = LIMITATION_PERIODS.find(l => l.suit === e.target.value);
                    if (found) setSelectedSuitType(found);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {LIMITATION_PERIODS.map((l, i) => (
                    <option key={i} value={l.suit}>{l.suit} ({l.period})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Cause of Action Date (Event / Loan / Default Date):
                </label>
                <input
                  type="date"
                  value={limitationStartDate}
                  onChange={(e) => setLimitationStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicable Statutory Schedule:</span>
                  <span className="font-bold text-slate-800">{selectedSuitType.article}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prescribed Period:</span>
                  <span className="font-bold text-amber-700">{selectedSuitType.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Begins to Run:</span>
                  <span className="font-medium text-slate-800 text-right">{selectedSuitType.from}</span>
                </div>
              </div>
            </div>

            {/* Right: Limitation Result Card */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Computed Limitation Deadline
                </span>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-400 block uppercase">
                    Last Date for Filing Plaint / Appeal
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold block">
                    {getLimitationEndDate()}
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Subject to Section 4 (Court closed on last day) and Section 5 (Condonation of delay in appeals) of the Limitation Act 1963.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800">Essential Legal Principles:</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>Section 3: Mandatory duty of Court to dismiss suits instituted after limitation even if limitation not pleaded.</li>
                    <li>Section 14: Exclusion of time spent prosecuting in good faith before court without jurisdiction.</li>
                    <li>Section 18: Effect of written acknowledgement of debt in writing before expiration.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link href="/practice/drafting" className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                  Practice Drafting Money Suit Plaint <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tool 2: Sec 34 CPC Interest Calculator */}
        {activeTab === 'interest' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-600" />
                Section 34 CPC Money Claim Interest Calculator
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Principal Amount (Rs.):
                </label>
                <input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Interest Rate (% per annum) [Standard court rate: 6%, Commercial rate: 9-18%]:
                </label>
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Period / Duration (Months):
                </label>
                <input
                  type="number"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Right: Interest Result */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Computed Money Decree Valuation
                </span>

                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between border-b border-slate-700 pb-2 text-xs">
                    <span className="text-slate-400">Principal Claim:</span>
                    <span className="font-bold">Rs. {principalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2 text-xs">
                    <span className="text-slate-400">Pendente Lite & Pre-suit Interest:</span>
                    <span className="font-bold text-amber-400">+ Rs. {calculatedSimpleInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-bold">Total Suit Valuation:</span>
                    <span className="text-xl font-extrabold text-emerald-400">Rs. {calculatedTotalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Section 34 CPC Statutory Rule:</p>
                  <p>Court may award interest from date of suit to date of decree, and further future interest not exceeding 6% p.a. (unless commercial transaction where contractual rate applies).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tool 3: Gujarat Court Fees Estimator */}
        {activeTab === 'courtfees' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                Gujarat Court-Fees Act (Ad-Valorem Schedule)
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Subject Matter Claim Amount / Plaint Valuation (Rs.):
                </label>
                <input
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">Slab Structure (Gujarat Civil Courts):</span>
                <p className="text-slate-600">• Up to Rs. 10,000: 5% ad-valorem fee</p>
                <p className="text-slate-600">• Rs. 10,000 to Rs. 50,000: Rs. 500 + 6% of excess</p>
                <p className="text-slate-600">• Rs. 50,000 to Rs. 1,00,000: Rs. 2,900 + 7% of excess</p>
                <p className="text-slate-600">• Above Rs. 1,00,000: Rs. 6,400 + 4% of excess (Max Rs. 75,000)</p>
              </div>
            </div>

            {/* Right: Court Fee Output */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Estimated Ad-Valorem Court Fee
                </span>

                <div className="bg-emerald-950 text-white p-5 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block uppercase">
                    Mandatory Court Fee Stamp Payable
                  </span>
                  <span className="text-3xl font-extrabold text-white block">
                    Rs. {calculateGujaratCourtFees(principalAmount).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-emerald-200">
                    Payable via Gujarat e-Court fee stamp / Treasury Challan under Gujarat Court-Fees Act, 2004.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tool 4: IPC to BNS Section Cross-Referencer */}
        {activeTab === 'crossref' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                IPC 1860 ↔ Bharatiya Nyaya Sanhita (BNS 2023) Quick Reference
              </h3>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={bnsSearch}
                  onChange={(e) => setBnsSearch(e.target.value)}
                  placeholder="Search section or offence (e.g. 302, 420, Murder)..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Offence / Subject</th>
                    <th className="p-3">Old IPC 1860</th>
                    <th className="p-3">New BNS 2023</th>
                    <th className="p-3">Key Legal Innovation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBns.map((item, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40 transition">
                      <td className="p-3 font-semibold text-slate-900">{item.offence}</td>
                      <td className="p-3 font-mono text-rose-700 font-bold">{item.ipc}</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">{item.bns}</td>
                      <td className="p-3 text-slate-600">{item.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tool 5: Latin Maxims Directory */}
        {activeTab === 'maxims' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Latin Legal Maxims & Principles Directory</h3>
                <p className="text-xs text-slate-500">Crucial for University jurisprudence, torts, and constitutional law exams.</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={maximSearch}
                  onChange={(e) => setMaximSearch(e.target.value)}
                  placeholder="Search maxim or meaning..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaxims.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-800 font-serif italic">
                      "{m.term}"
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {m.subject}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {m.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
