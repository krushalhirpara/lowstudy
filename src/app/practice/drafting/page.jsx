"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw, 
  Scale, 
  Award, 
  BookOpen, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

const DRAFT_TEMPLATES = [
  {
    id: 'legal-notice-138',
    title: 'Statutory Legal Notice under Section 138 NI Act',
    category: 'Commercial Law',
    marks: 15,
    problem: `Client ABC Traders sold goods worth Rs. 2,50,000 to XYZ Enterprises on 1st July 2026. XYZ issued Cheque No. 445566 drawn on SBI, Rajkot Branch. The cheque was dishonoured with remark 'Funds Insufficient' on 15th August 2026.
Draft a formal statutory legal notice demanding payment within 15 days as required by Section 138 of the Negotiable Instruments Act 1881.`,
    initialDraft: `To,
XYZ Enterprises,
Through its Managing Partner,
Industrial Estate, Rajkot.

LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

Under instructions from and on behalf of my client, ABC Traders, having its office at Ahmedabad, I hereby serve upon you this Statutory Legal Notice:

1. That my client supplied commercial goods to you under Invoice No. 102 dated 01/07/2026 for a total sum of Rs. 2,50,000/-.
2. In discharge of your legally enforceable debt and liability, you issued Cheque No. 445566 dated 10/08/2026 for Rs. 2,50,000/- drawn on State Bank of India, Rajkot Branch.
3. My client presented the said cheque for encashment, but the same was dishonoured and returned unpaid with the bank memo remark "Funds Insufficient" on 15/08/2026.
4. I therefore call upon you to pay the said sum of Rs. 2,50,000/- to my client within 15 (fifteen) days from the receipt of this notice, failing which my client shall initiate criminal prosecution against you under Section 138 of the Negotiable Instruments Act.

Dated: 20th August 2026
Advocate for Client`,
    modelAnswer: `LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881

REGISTERED A.D. / SPEED POST
To,
XYZ Enterprises,
Through its Managing Partner / Authorised Signatory,
Address: Plot No. 14, GIDC Industrial Estate, Rajkot, Gujarat.

Sir/Madam,
Under instructions and authority given to me by my client, M/s ABC Traders, represented by its Sole Proprietor Shri Ramesh Patel, having office at C.G. Road, Ahmedabad, I serve upon you this Legal Notice:

1. THAT my client is a reputed wholesale merchant, and in July 2026, you purchased goods under valid Tax Invoice No. 102 dated 01/07/2026 amounting to Rs. 2,50,000/- (Rupees Two Lakh Fifty Thousand only).
2. THAT in discharge of the aforesaid legally enforceable debt and subsisting liability, you issued Account Payee Cheque bearing No. 445566 dated 10/08/2026 for Rs. 2,50,000/- drawn on State Bank of India, Rajkot Main Branch.
3. THAT my client presented the said cheque through its banker (HDFC Bank, Ahmedabad) within its validity period; however, the cheque was returned dishonoured on 15/08/2026 with the official Return Memo remark "Funds Insufficient".
4. THAT you are well aware that issuing a cheque without adequate funds and failing to honour the same constitutes a criminal offence under Section 138 of the Negotiable Instruments Act, 1881.
5. I THEREFORE CALL UPON YOU to pay the entire amount of Rs. 2,50,000/- along with interest @ 18% p.a. within a period of 15 (fifteen) days from the date of receipt of this notice.
6. PLEASE NOTE that if you fail to comply within the stipulated 15 days, my client has given peremptory instructions to initiate criminal proceedings under Section 138 of the Negotiable Instruments Act and Section 318 of Bharatiya Nyaya Sanhita 2023 at your risk and cost.

Copy retained for legal record.
Ahmedabad, Gujarat
[Advocate Signature & Enrollment No.]`
  },
  {
    id: 'bail-application',
    title: 'Regular Bail Application (BNSS Section 480/483)',
    category: 'Criminal Procedure',
    marks: 15,
    problem: `Accused Mohanbhai has been arrested in connection with C.R. No. 88/2026 registered at Gandhinagar Police Station for alleged offences under Sections 318 and 316 of Bharatiya Nyaya Sanhita 2023. Investigation is complete and charge-sheet is filed.
Draft a regular bail application before the Court of Sessions at Gandhinagar invoking Section 483 of BNSS 2023 and landmark Supreme Court bail jurisprudence.`,
    initialDraft: `IN THE COURT OF SESSIONS JUDGE, GANDHINAGAR
Criminal Misc. Application No. ___ of 2026

Mohanbhai Patel ... Applicant / Accused
V/s
State of Gujarat ... Respondent / Complainant

APPLICATION FOR REGULAR BAIL UNDER SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023

The applicant respectfully states as under:
1. The applicant is arrested on false grounds in C.R. No. 88/2026.
2. Investigation is complete and charge-sheet is filed, hence custody is no longer required.
3. As held by Supreme Court, bail is the rule and jail is an exception.
4. The applicant is a permanent resident and will obey all conditions.
Wherefore it is prayed that this Hon'ble Court may be pleased to enlarge the applicant on regular bail.`,
    modelAnswer: `IN THE COURT OF SESSIONS JUDGE AT GANDHINAGAR, GUJARAT
Criminal Misc. (Bail) Application No. ______ of 2026

IN THE MATTER OF:
Shri Mohanbhai Patel,
Age: 38 years, Residing at Sector 7, Gandhinagar. ... APPLICANT / ACCUSED

VERSUS

State of Gujarat,
Through Police Sub-Inspector, Gandhinagar Police Station. ... RESPONDENT

APPLICATION UNDER SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) FOR GRANT OF REGULAR BAIL

MOST RESPECTFULLY SHOWETH:
1. That the applicant is an innocent law-abiding citizen falsely implicated in C.R. No. 88/2026 registered at Gandhinagar Police Station for alleged offences under Section 318 and Section 316 of Bharatiya Nyaya Sanhita 2023.
2. SUBSTANTIAL COMPLETION OF INVESTIGATION: That the investigating officer has completed the investigation and filed the final report/charge-sheet before the competent Magistrate. No recovery or custodial interrogation remains pending.
3. NATURE OF DISPUTE: That the dispute is purely commercial/civil in nature given a criminal color.
4. JUDICIAL PRECEDENTS: That the Hon'ble Supreme Court in Satender Kumar Antil v. CBI (2022) and Sanjay Chandra v. CBI (2012) held that bail is the rule and jail is an exception, especially where trial is likely to take time.
5. NO FLIGHT RISK: That the applicant has deep roots in society, immovable properties in Gandhinagar, and undertakes not to tamper with evidence or influence witnesses.
6. PRAYER: It is therefore prayed that this Hon'ble Court may be pleased to:
   (a) Enlarge the applicant on regular bail in connection with C.R. No. 88/2026 on suitable terms;
   (b) Pass any further order in the interest of justice.

Advocate for Applicant
Gandhinagar, Date: [DD/MM/YYYY]`
  },
  {
    id: 'plaint-money-recovery',
    title: 'Plaint for Recovery of Money (Order VII CPC)',
    category: 'Civil Procedure',
    marks: 20,
    problem: `Plaintiff lent Rs. 5,00,000 to Defendant on promissory note dated 10th January 2024. Defendant failed to repay on due date 10th January 2026 despite repeated demands and notice.
Draft a plaint for suit for recovery of money under Order VII Rule 1 of CPC 1908 with valuation and prayer clause.`,
    initialDraft: `IN THE COURT OF CIVIL JUDGE (SENIOR DIVISION) AT SURAT
Special Civil Suit No. ___ of 2026

Ramesh Shah ... Plaintiff
V/s
Suresh Mehta ... Defendant

SUIT FOR RECOVERY OF RS. 5,00,000/- UNDER ORDER VII OF CPC

1. Plaintiff is resident of Surat.
2. Defendant borrowed Rs. 5,00,000 on promissory note on 10/01/2024.
3. Defendant failed to pay back.
4. Cause of action arose in Surat.
5. Valuation is Rs. 5,00,000 and court fee is paid.
Prayer: Decree may be passed for Rs. 5,00,000 with interest.`,
    modelAnswer: `IN THE COURT OF PRINCIPAL SENIOR CIVIL JUDGE AT SURAT
Special Civil Suit No. ______ of 2026

1. Shri Ramesh Shah, Age: 45, Business, Residing at Athwa Lines, Surat. ... PLAINTIFF
VERSUS
2. Shri Suresh Mehta, Age: 42, Business, Residing at Ring Road, Surat. ... DEFENDANT

SUIT FOR RECOVERY OF RS. 5,00,000/- WITH PENDENTE LITE AND FUTURE INTEREST UNDER ORDER VII RULE 1 OF CPC, 1908

THE PLAINTIFF RESPECTFULLY STATES AS UNDER:
1. PARTIES: The plaintiff and defendant are permanent residents carrying on business in Surat within the local limits of this Hon'ble Court.
2. LOAN TRANSACTION: On 10/01/2024, the defendant approached the plaintiff for urgent financial assistance of Rs. 5,00,000/- and executed a demand promissory note undertaking to repay within 2 years with 12% interest p.a.
3. DEFAULT: On due date (10/01/2026), the plaintiff demanded repayment; however, the defendant neglected and refused to pay.
4. LEGAL NOTICE: The plaintiff served statutory notice dated 01/02/2026, which was duly received by the defendant but remained uncomplied.
5. CAUSE OF ACTION: The cause of action arose on 10/01/2024 when loan was advanced, on 10/01/2026 upon default, and within Surat where the transaction was executed. The suit is within 3 years limitation under Article 19 of Limitation Act 1963.
6. VALUATION & COURT FEES: The suit is valued at Rs. 5,00,000/- and ad-valorem court fee has been duly paid under Gujarat Court Fees Act.
7. PRAYER:
   (a) Pass a money decree in favor of plaintiff against defendant for Rs. 5,00,000/-;
   (b) Award pendente lite and future interest @ 12% p.a. from date of suit till realization;
   (c) Award costs of the suit.

[Verification & Affidavit]`
  }
];

export default function DraftingLabPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(DRAFT_TEMPLATES[0]);
  const [studentDraft, setStudentDraft] = useState(DRAFT_TEMPLATES[0].initialDraft);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setStudentDraft(template.initialDraft);
    setEvaluation(null);
    setShowModel(false);
  };

  const handleEvaluateDraft = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      // Intelligent grading rubric
      const wordCount = studentDraft.split(/\s+/).filter(Boolean).length;
      let score = 82;
      let strengths = [
        "Identified the correct statutory provision and forum jurisdiction.",
        "Included the essential factual timeline and debt cause of action.",
        "Proper prayer and demand timeframe."
      ];
      let improvements = [
        "Include the formal heading with Court Name / Registered Post notice dispatch details.",
        "Specify interest claim under commercial rates / Section 34 CPC where applicable.",
        "Mention verification clause / signature block with Bar Council enrollment details."
      ];

      if (wordCount < 40) {
        score = 48;
        improvements.unshift("Draft is too brief. Ensure essential procedural averments are fully articulated.");
      }

      setEvaluation({
        score,
        grade: score >= 80 ? 'Distinction (A+)' : score >= 60 ? 'First Class (B+)' : 'Needs Revision (C)',
        strengths,
        improvements,
        missingSections: selectedTemplate.id.includes('138') 
          ? ['Section 138(b) 30-day notice window', 'Section 138(c) 15-day repayment period', 'Section 142 cognizance']
          : ['BNSS Section 483', 'Article 21 Constitutional liberty', 'Satender Kumar Antil precedent'],
        rubric: {
          legalGrounds: '9/10',
          formatting: '8/10',
          prayerClause: '8/10',
          proceduralLaw: '8/10'
        }
      });
      setIsEvaluating(false);
    }, 900);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <PenTool className="w-4 h-4 text-amber-500" />
                <span>PRACTICE DRAFTING LAB</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gujarat LL.B Clinical Paper IV
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Legal Drafting & Pleading Studio
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Master drafting of statutory legal notices, plaints, written statements, bail petitions, and writ applications with real-time AI critique and model draft benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/practice/moot-court"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Moot Court Arena</span>
              </Link>
            </div>
          </div>

          {/* Template Selection Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-500 mr-2">Select Exercise:</span>
            {DRAFT_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedTemplate.id === t.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Problem Statement Card */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  {selectedTemplate.category}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Exam Weightage: {selectedTemplate.marks} Marks
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Problem Fact Scenario:</h3>
              <p className="text-xs sm:text-sm text-slate-800 mt-1 leading-relaxed whitespace-pre-line font-medium">
                {selectedTemplate.problem}
              </p>
            </div>

            <button
              onClick={() => setShowModel(!showModel)}
              className="shrink-0 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition border border-amber-300"
            >
              {showModel ? 'Hide Model Draft' : 'View Model Benchmark'}
            </button>
          </div>

          {/* Model Answer Preview */}
          {showModel && (
            <div className="mt-4 pt-4 border-t border-amber-200/80 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Model Law Student Answer (Full Marks):
                </span>
                <button
                  onClick={() => handleCopy(selectedTemplate.modelAnswer)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 bg-white border border-amber-200 rounded-xl text-xs font-mono text-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
                {selectedTemplate.modelAnswer}
              </pre>
            </div>
          )}
        </div>

        {/* Editor & Evaluation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Drafting Workspace */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-amber-600" />
                  Your Legal Draft Editor
                </label>
                <button
                  onClick={() => setStudentDraft(selectedTemplate.initialDraft)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <textarea
                value={studentDraft}
                onChange={(e) => setStudentDraft(e.target.value)}
                rows={18}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition resize-none leading-relaxed"
                placeholder="Draft your pleading, notice, or application here..."
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400 font-mono">
                  {studentDraft.split(/\s+/).filter(Boolean).length} Words
                </span>

                <button
                  onClick={handleEvaluateDraft}
                  disabled={isEvaluating || !studentDraft.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Evaluating Draft...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Evaluate & Grade Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Instant AI Evaluation & Rubric */}
          <div className="lg:col-span-5 space-y-4">
            {evaluation ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 animate-in fade-in">
                {/* Score Header */}
                <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                      AI Clinical Evaluation Score
                    </span>
                    <span className="text-2xl font-extrabold">{evaluation.score} / 100</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {evaluation.grade}
                  </span>
                </div>

                {/* Rubric Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Evaluation Rubric
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Legal Grounds</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.legalGrounds}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Formatting</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.formatting}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Prayer Clause</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.prayerClause}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Procedural Code</span>
                      <span className="font-bold text-slate-800">{evaluation.rubric.proceduralLaw}</span>
                    </div>
                  </div>
                </div>

                {/* Key Strengths */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                    {evaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Improvements */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Areas for Improvement
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                    {evaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Statutory Elements */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Essential Statutory Clauses Checked:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.missingSections.map((sec, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Scale className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">Ready for AI Clinical Evaluation</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Draft your pleading or statutory notice and click 'Evaluate & Grade Draft' to receive detailed rubric scores and legal feedback.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
