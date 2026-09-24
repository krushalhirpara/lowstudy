"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Languages, 
  Scale, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const SAMPLE_DOCUMENTS = [
  {
    id: 'fir-complaint',
    title: 'Sample Criminal FIR & Complaint (Cyber Fraud)',
    text: `To The Police Station Officer, Cyber Crime Police Station, Ahmedabad.
Subject: Complaint regarding cyber financial fraud under Bharatiya Nyaya Sanhita 2023 and Information Technology Act 2000.
Sir,
I, Rajesh Kumar, resident of Maninagar, Ahmedabad, submit that on 12th August 2026, I received a fraudulent call posing as bank verification. The caller dishonestly induced me to share OTP credentials, resulting in unauthorized debit of Rs. 85,000 from my savings account.
This act constitutes an offence punishable under Section 318 (Cheating) and Section 316 (Criminal Breach of Trust) of Bharatiya Nyaya Sanhita 2023 along with Section 66D of Information Technology Act 2000.
I request registration of Zero FIR under Section 173(1) of Bharatiya Nagarik Suraksha Sanhita 2023 and urgent investigation.`
  },
  {
    id: 'bail-petition',
    title: 'Sample Regular Bail Application (BNS 103/318)',
    text: `IN THE COURT OF SESSIONS JUDGE AT RAJKOT
Criminal Misc. Application No. 442 of 2026
In the matter of: Ramesh Patel ... Applicant / Accused
Versus
State of Gujarat ... Respondent
APPLICATION FOR REGULAR BAIL UNDER SECTION 480 OF BHARATIYA NAGARIK SURAKSHA SANHITA 2023
The applicant respectfully states:
1. The applicant is innocent and falsely implicated in C.R. No. 112/2026 registered at Rajkot Police Station.
2. The entire investigation is completed and charge-sheet is filed. No recovery remains pending from the applicant.
3. The Supreme Court in Sanjay Chandra v. CBI (2012) and Satender Kumar Antil v. CBI (2022) established that bail is the rule and jail is the exception.
4. The applicant has roots in society and undertakes to abide by all conditions.`
  }
];

export default function DocumentAnalyzerPage() {
  const [inputText, setInputText] = useState(SAMPLE_DOCUMENTS[0].text);
  const [activeTab, setActiveTab] = useState('summary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    summary: "The document is a formal cyber financial fraud complaint filed under Section 318 (Cheating) and Section 316 (Criminal Breach of Trust) of BNS 2023, coupled with Section 66D of the IT Act 2000. The complainant requests registration of a Zero FIR under BNSS Section 173(1).",
    keySections: [
      { code: "BNS Section 318", title: "Cheating and dishonestly inducing delivery of property (Old IPC 420)" },
      { code: "BNS Section 316", title: "Criminal Breach of Trust (Old IPC 405/406)" },
      { code: "BNSS Section 173(1)", title: "Information in cognizable cases & registration of Zero FIR" },
      { code: "IT Act Section 66D", title: "Punishment for cheating by personation using computer resource" }
    ],
    caseLaws: [
      { name: "Lalita Kumari v. Govt. of U.P. (2014)", principle: "Mandatory registration of FIR in cognizable offences." },
      { name: "S.N. Sharma v. Bipen Kumar Tiwari (1970)", principle: "Police statutory power of investigation cannot be interfered with arbitrarily." }
    ],
    examQuestions: [
      { marks: 5, question: "Explain the procedure of Zero FIR under BNSS Section 173 and its significance for cyber crimes." },
      { marks: 15, question: "Critically examine the ingredients of Cheating under Section 318 of BNS 2023 and distinguish it from Criminal Breach of Trust." }
    ],
    mcqs: [
      { q: "Under which section of BNSS 2023 can an FIR be registered electronically or irrespective of territorial jurisdiction?", ans: "Section 173(1)", options: ["Section 154", "Section 173(1)", "Section 190", "Section 200"] },
      { q: "What is the equivalent section in BNS 2023 for cheating (previously Section 420 IPC)?", ans: "Section 318", options: ["Section 302", "Section 318", "Section 304", "Section 115"] }
    ],
    gujaratiTranslation: "આ દસ્તાવેજ ભારતીય ન્યાય સંહિતા ૨૦૨૩ ની કલમ ૩૧૮ (છેતરપિંડી) અને ૩૧૬ (વિશ્વાસઘાત) તેમજ આઇટી એક્ટ હેઠળ નોંધાયેલ સાયબર છેતરપિંડીની ફરિયાદ છે. અરજદાર ભારતીય નાગરિક સુરક્ષા સંહિતા ૨૦૨૩ ની કલમ ૧૭૩(૧) હેઠળ ઝીરો એફઆઈઆર નોંધવા વિનંતી કરે છે."
  });

  const handleRunAnalysis = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      // Intelligent extraction simulation
      const containsBail = inputText.toLowerCase().includes('bail');
      if (containsBail) {
        setAnalysisResult({
          summary: "The document is a formal Criminal Regular Bail Application under Section 480 of Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), pleading fundamental liberties, completion of investigation, and absence of flight risk.",
          keySections: [
            { code: "BNSS Section 480", title: "When bail may be taken in case of non-bailable offence (Old CrPC 437)" },
            { code: "BNSS Section 483", title: "Special powers of High Court or Court of Session regarding bail (Old CrPC 439)" },
            { code: "Article 21", title: "Protection of life and personal liberty" }
          ],
          caseLaws: [
            { name: "Satender Kumar Antil v. CBI (2022)", principle: "Guidelines on arrest and bail; bail is the rule and jail is the exception." },
            { name: "Sanjay Chandra v. CBI (2012)", principle: "Deprivation of liberty before conviction is a substantial loss to the accused." }
          ],
          examQuestions: [
            { marks: 15, question: "Discuss the statutory guidelines governing regular and anticipatory bail under BNSS 2023 with relevant judicial precedents." },
            { marks: 5, question: "What factors must a Sessions Court consider while imposing bail conditions under BNSS 483?" }
          ],
          mcqs: [
            { q: "Which section of BNSS 2023 governs special powers of Sessions Court/High Court to grant bail?", ans: "Section 483", options: ["Section 439", "Section 483", "Section 480", "Section 482"] }
          ],
          gujaratiTranslation: "આ દસ્તાવેજ ભારતીય નાગરિક સુરક્ષા સંહિતા ૨૦૨૩ ની કલમ ૪૮૦ હેઠળ નિયમિત જામીન અરજી છે, જેમાં તપાસ પૂર્ણ થવા અને કાનૂની સિદ્ધાંતોના આધારે જામીન મુક્ત કરવા રજૂઆત કરવામાં આવી છે."
        });
      } else {
        setAnalysisResult({
          summary: "Analysis complete. Extracted relevant statutory provisions, ratio decidendi, and examination questions from the submitted text.",
          keySections: [
            { code: "BNS Section 318", title: "Cheating (Old IPC 420)" },
            { code: "BNSS Section 173", title: "First Information Report" }
          ],
          caseLaws: [
            { name: "Lalita Kumari v. Govt of UP", principle: "Mandatory FIR registration." }
          ],
          examQuestions: [
            { marks: 15, question: "Evaluate the legal procedure and constitutional safeguards associated with this document." }
          ],
          mcqs: [
            { q: "Identify the prime statute applicable to the document.", ans: "Bharatiya Nyaya Sanhita 2023", options: ["IPC 1860", "Bharatiya Nyaya Sanhita 2023", "CrPC 1973", "Contract Act"] }
          ],
          gujaratiTranslation: "સબમિટ કરેલા દસ્તાવેજનું સફળતાપૂર્વક કાનૂની વિશ્લેષણ કરવામાં આવ્યું છે."
        });
      }
      setIsAnalyzing(false);
    }, 800);
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI LEGAL DOCUMENT INTELLIGENCE</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  BNS / BNSS / BSA Aware
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Legal Document Analyzer
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Paste or select legal pleadings, judgments, FIRs, or contracts to instantly extract statutory provisions, case law precedents, exam questions, MCQs, and Gujarati translations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/ai-tutor"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ask NyayaAI</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Editor & Samples */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Legal Document / Text Input
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Sample:</span>
                  {SAMPLE_DOCUMENTS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setInputText(s.text)}
                      className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      {s.id === 'fir-complaint' ? 'Cyber FIR' : 'Bail Application'}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={14}
                placeholder="Paste legal text, plaint, judgment excerpt, section, or problem statement here..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Client-side secure analysis</span>
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !inputText.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Run AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Intelligent Output Tabs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 min-h-[520px]">
              
              {/* Output Tab Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { id: 'summary', label: 'Executive Summary', icon: FileText },
                    { id: 'sections', label: 'Statutes & Sections', icon: Scale },
                    { id: 'cases', label: 'Precedents', icon: BookOpen },
                    { id: 'questions', label: 'Exam Q&A / MCQs', icon: HelpCircle },
                    { id: 'gujarati', label: 'ગુજરાતી અનુવાદ', icon: Languages }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          activeTab === tab.id
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleCopy(analysisResult[activeTab] || analysisResult)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  title="Copy content"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Tab 1: Executive Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Legal Synthesis
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Core Legal Issues Identified
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                      <li>Jurisdictional validity under BNSS 2023 provisions.</li>
                      <li>Ingredients of dishonesty and fraudulent inducement under BNS 318.</li>
                      <li>Applicability of electronic evidence guidelines under BSA 2023.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Sections & Statutes */}
              {activeTab === 'sections' && (
                <div className="space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Applicable Statutory Provisions
                  </span>
                  {analysisResult.keySections.map((sec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
                          {sec.code}
                        </span>
                        <Link href="/bare-acts" className="text-[11px] text-slate-500 hover:text-amber-700 flex items-center gap-0.5">
                          View in Bare Acts <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-xs text-slate-800 font-medium mt-1.5">
                        {sec.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Landmark Precedents */}
              {activeTab === 'cases' && (
                <div className="space-y-3 animate-in fade-in">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Relevant Precedents for Pleadings & Exams
                  </span>
                  {analysisResult.caseLaws.map((cs, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{cs.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Supreme Court
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {cs.principle}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Questions & MCQs */}
              {activeTab === 'questions' && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Predicted University Exam Questions
                    </span>
                    <div className="space-y-2">
                      {analysisResult.examQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                          <span className="font-bold text-amber-700">[{q.marks} Marks Question]:</span>
                          <p className="text-slate-800 font-medium">{q.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Practice MCQs
                    </span>
                    <div className="space-y-2">
                      {analysisResult.mcqs.map((m, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
                          <p className="font-semibold text-slate-900">{idx + 1}. {m.q}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`px-2 py-1 rounded text-[11px] border ${
                                  opt === m.ans
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                    : 'bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Gujarati Translation */}
              {activeTab === 'gujarati' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 font-gujarati">
                      ગુજરાતી કાનૂની સારાંશ (Gujarati Legal Summary)
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-gujarati font-medium">
                      {analysisResult.gujaratiTranslation}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Certified legal terminology adapted for Gujarat University, Saurashtra University, and VNSGU examinations.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
