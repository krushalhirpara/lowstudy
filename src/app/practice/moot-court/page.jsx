"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Scale, 
  Sparkles, 
  FileText, 
  Send, 
  UserCheck, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Building2,
  HelpCircle
} from 'lucide-react';

const MOOT_PROBLEMS = [
  {
    id: 'moot-privacy-ai',
    title: 'Constitutional Moot: AI Surveillance & Right to Privacy',
    court: 'Supreme Court of India (Special Leave Petition / Art 32)',
    category: 'Constitutional Law & Tech',
    facts: `The Union Government enacted the National Autonomous Facial Recognition & Predictive Policing Act, 2025. The statute empowers law enforcement to deploy automated CCTV facial matching in public spaces without prior judicial warrant.
Citizens' Privacy Collective filed a Writ Petition under Article 32 challenging the constitutional validity of the Act as violative of Article 14, Article 19(1)(a), and Article 21 (Puttaswamy 9-Judge Bench standard of proportionality).`,
    issues: [
      "Whether the deployment of automated facial recognition violates the fundamental Right to Privacy under Article 21?",
      "Whether the statutory scheme satisfies the four-pronged proportionality test laid down in K.S. Puttaswamy (2017)?",
      "Whether lack of independent judicial oversight renders the surveillance arbitrary under Article 14?"
    ],
    petitionerGrounds: [
      "Infringes informational self-determination without legitimate aim or minimal impairment.",
      "Creates an unconstitutional chilling effect on peaceful assembly under Article 19(1)(b).",
      "Violates the strict necessity principle affirmed in Anuradha Bhasin v. Union of India (2020)."
    ],
    respondentGrounds: [
      "State has a compelling interest in crime prevention and national security under Article 21 (Right to Security).",
      "Statute contains statutory procedural safeguards, data encryption, and authorized access logs.",
      "Proportionality is maintained as facial scanning only triggers verification upon database match."
    ],
    suggestedAuthorities: [
      "K.S. Puttaswamy v. Union of India (2017) 10 SCC 1",
      "Anuradha Bhasin v. Union of India (2020) 3 SCC 637",
      "Maneka Gandhi v. Union of India (1978) 1 SCC 248"
    ]
  },
  {
    id: 'moot-bns-mob-lynching',
    title: 'Criminal Appeal: Mob Lynching & Bail Jurisprudence under BNS 2023',
    court: 'High Court of Gujarat (Criminal Appeal under BNSS 415)',
    category: 'Criminal Law (BNS & BNSS)',
    facts: `The Appellant was convicted under Section 103(2) of Bharatiya Nyaya Sanhita 2023 for alleged participation in a mob altercation on suspicion of cattle trafficking. The trial court convicted the appellant on uncorroborated CCTV footage without mandatory forensic certification under Section 63 of Bharatiya Sakshya Adhiniyam 2023.
Appellant approaches the High Court challenging the conviction and seeking suspension of sentence during appeal pendency.`,
    issues: [
      "Whether electronic CCTV evidence is admissible without certificate under Section 63 of Bharatiya Sakshya Adhiniyam 2023?",
      "Whether individual culpability and common intention under Section 103(2) BNS was established beyond reasonable doubt?"
    ],
    petitionerGrounds: [
      "Strict compliance with Section 63 BSA (Old Sec 65B Evidence Act) is mandatory as held in Arjun Panditrao Khotkar (2020).",
      "Mere presence in a crowd does not satisfy common intention without active overt acts."
    ],
    respondentGrounds: [
      "Section 103(2) BNS specifically targets joint action in mob violence to deter heinous lynching crimes.",
      "Eyewitness testimonies corroborate the digital footage."
    ],
    suggestedAuthorities: [
      "Arjun Panditrao Khotkar v. Kailash Kushanrao (2020) 7 SCC 1",
      "Tehseen S. Poonawalla v. Union of India (2018) 9 SCC 501",
      "Satender Kumar Antil v. CBI (2022) 10 SCC 51"
    ]
  }
];

export default function MootCourtPage() {
  const [selectedProblem, setSelectedProblem] = useState(MOOT_PROBLEMS[0]);
  const [selectedSide, setSelectedSide] = useState('Petitioner');
  const [oralArgument, setOralArgument] = useState('');
  const [isSimulatingJudge, setIsSimulatingJudge] = useState(false);
  const [judgeFeedback, setJudgeFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('problem'); // problem, memorial, judge

  const handleSelectProblem = (prob) => {
    setSelectedProblem(prob);
    setOralArgument('');
    setJudgeFeedback(null);
  };

  const handleSimulateOralArguments = () => {
    if (!oralArgument.trim()) return;
    setIsSimulatingJudge(true);
    setTimeout(() => {
      const citedPuttaswamy = oralArgument.toLowerCase().includes('puttaswamy') || oralArgument.toLowerCase().includes('arjun');
      const score = citedPuttaswamy ? 88 : 72;
      
      setJudgeFeedback({
        score,
        benchQuestion: selectedSide === 'Petitioner'
          ? "Counsel, while Article 21 protects privacy, how do you balance this with the State's constitutional duty to protect public order and investigate cyber offenses? Can you point us to the specific paragraph in Puttaswamy addressing legitimate state aim?"
          : "Counsel for the State, does the impugned legislation provide any judicial warrant requirement before biometric data is retained? If not, how does it pass the 'minimal impairment' test of proportionality?",
        judgeRemarks: [
          `Strong articulation of the ${selectedSide}'s primary legal stance.`,
          citedPuttaswamy ? "Excellent inclusion of landmark constitutional precedents." : "Counsel is advised to cite the specific 9-Judge bench ratio in Puttaswamy (2017).",
          "Court decorum and structured IRAC argumentation style followed."
        ],
        courtDecorumRating: '9/10',
        authoritiesRating: citedPuttaswamy ? '9.5/10' : '7/10',
        rebuttalTip: "Keep your response focused strictly on the proportionality standard: Legitimate Goal, Rational Nexus, Least Intrusive Means, and Balance of Interests."
      });
      setIsSimulatingJudge(false);
      setActiveTab('judge');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-poppins pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-2">
                <Scale className="w-4 h-4 text-amber-500" />
                <span>VIRTUAL MOOT COURT ARENA</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Clinical Advocacy Training
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Moot Court & Memorial Practice
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Prepare written memorials, argue live before an AI Judicial Bench, tackle follow-up cross-examination questions, and hone legal advocacy skills.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/practice/drafting"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Drafting Lab</span>
              </Link>
            </div>
          </div>

          {/* Problem Selector */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-xs font-bold text-slate-500 mr-2">Moot Problem:</span>
            {MOOT_PROBLEMS.map((prob) => (
              <button
                key={prob.id}
                onClick={() => handleSelectProblem(prob)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedProblem.id === prob.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {prob.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
          {[
            { id: 'problem', label: '1. Moot Fact Problem', icon: BookOpen },
            { id: 'memorial', label: '2. Memorial & Arguments', icon: FileText },
            { id: 'judge', label: '3. AI Judicial Bench Simulation', icon: Scale }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Moot Problem Details */}
        {activeTab === 'problem' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  {selectedProblem.court}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedProblem.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">Statement of Facts</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-xl p-4">
                  {selectedProblem.facts}
                </p>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2">Issues for Determination</h3>
                <div className="space-y-2">
                  {selectedProblem.issues.map((iss, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 bg-amber-50/50 border border-amber-200/70 p-3 rounded-xl">
                      <span className="font-bold text-amber-700">Issue {idx + 1}:</span>
                      <span>{iss}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setActiveTab('memorial')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Proceed to Memorial & Arguments</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Side Column: Suggested Authorities */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Key Statutory & Case Authorities
                </h4>
                <div className="space-y-2">
                  {selectedProblem.suggestedAuthorities.map((auth, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800">
                      <span className="font-mono text-amber-700 font-bold block mb-0.5">Authority {idx + 1}:</span>
                      {auth}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Memorial & Oral Prep */}
        {activeTab === 'memorial' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Left: Choose Side & Prepare Oral Submission */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Representation:
                </span>
                <div className="flex items-center gap-2">
                  {['Petitioner', 'Respondent'].map(side => (
                    <button
                      key={side}
                      onClick={() => setSelectedSide(side)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedSide === side
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                  Your Oral Argument Submission (IRAC Method):
                </label>
                <textarea
                  value={oralArgument}
                  onChange={(e) => setOralArgument(e.target.value)}
                  rows={12}
                  placeholder={`May it please the Court, I represent the ${selectedSide}. My first submission is that...\n(State Issue, Legal Rule/Precedents, Application to Facts, and Conclusion)`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setOralArgument(
                      selectedSide === 'Petitioner'
                        ? `May it please the Hon'ble Bench, I represent the Petitioners. We challenge the facial recognition regime on the touchstone of K.S. Puttaswamy (2017). The impugned law fails the 4-prong proportionality standard because mass algorithmic surveillance without judicial warrant is neither minimal impairment nor strictly necessary in a democratic society.`
                        : `May it please your Lordships, I represent the Respondent Union. The impugned enactment serves a vital State interest in safeguarding citizens from organized criminal enterprises. As recognized in Puttaswamy, the right to privacy is subject to just, fair, and reasonable procedures, which are fully embedded in the statutory audit trails and oversight committees.`
                    );
                  }}
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
                >
                  Load Sample {selectedSide} Submission
                </button>

                <button
                  onClick={handleSimulateOralArguments}
                  disabled={isSimulatingJudge || !oralArgument.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {isSimulatingJudge ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Judge is Deliberating...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="w-4 h-4 text-amber-400" />
                      <span>Submit to AI Judicial Bench</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Key Legal Grounds for selected side */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Arguments for {selectedSide}
                </h4>
                <div className="space-y-2">
                  {(selectedSide === 'Petitioner' ? selectedProblem.petitionerGrounds : selectedProblem.respondentGrounds).map((g, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-start gap-2">
                      <span className="font-bold text-amber-600 font-mono">Plead {idx + 1}:</span>
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Judicial Bench Feedback */}
        {activeTab === 'judge' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            {judgeFeedback ? (
              <div className="space-y-6">
                {/* Score Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl">
                  <div>
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Scale className="w-4 h-4" />
                      <span>AI Judicial Bench Score</span>
                    </div>
                    <span className="text-3xl font-extrabold">{judgeFeedback.score} / 100</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Court Decorum</span>
                      <span className="text-xs font-bold text-emerald-400">{judgeFeedback.courtDecorumRating}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Authorities Cited</span>
                      <span className="text-xs font-bold text-emerald-400">{judgeFeedback.authoritiesRating}</span>
                    </div>
                  </div>
                </div>

                {/* Follow-up Cross Examination Question from the Bench */}
                <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Question from the Bench (Hon'ble Presiding Judge):
                  </div>
                  <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed italic bg-white p-3.5 rounded-xl border border-amber-200">
                    "{judgeFeedback.benchQuestion}"
                  </p>
                </div>

                {/* Judicial Assessment Remarks */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Oral Advocacy Evaluation Remarks
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-800">
                    {judgeFeedback.judgeRemarks.map((rem, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rebuttal Tip */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider block">
                    Advocacy Mastery Tip:
                  </span>
                  <p className="text-emerald-800">{judgeFeedback.rebuttalTip}</p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setActiveTab('memorial')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Modify Oral Submission
                  </button>

                  <Link
                    href="/ai-tutor?prompt=Act as a Senior Advocate guiding me on how to argue the Constitutional Moot on AI Surveillance"
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                  >
                    Deep Dive with NyayaAI <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No Oral Submissions Evaluated Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Navigate to Tab 2 to submit your oral argument to the AI Bench.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
