"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Award, 
  BookOpen, 
  Scale, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  ArrowRight, 
  Download, 
  Copy, 
  Check, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const INTERNSHIP_GUIDES = [
  {
    id: 'ghc-internship',
    title: 'Gujarat High Court Judicial Clerkship & Internship',
    body: 'High Court of Gujarat, Sola, Ahmedabad',
    eligibility: '3rd/4th/5th year of 5-Year LL.B or 2nd/3rd year of 3-Year LL.B with min 55% aggregate.',
    duration: '4 to 8 Weeks',
    stipend: 'As per High Court of Gujarat Registry Rules',
    keyRequirements: ['Bonafide Certificate from College', 'Statement of Purpose (SOP)', 'Curriculum Vitae', '2 Faculty Recommendations'],
    procedure: 'Applications must be addressed to the Registrar General, High Court of Gujarat along with college recommendation before session commencement.'
  },
  {
    id: 'chamber-internship',
    title: 'Senior Advocate Chamber Practice (Civil & Criminal Litigation)',
    body: 'City Civil & Sessions Court, Ahmedabad / District Courts',
    eligibility: 'All Law Students with keen interest in court proceedings and drafting.',
    duration: '6 to 12 Weeks',
    stipend: 'Honorarium / Mentorship based',
    keyRequirements: ['Sound knowledge of BNS, BNSS, CPC', 'Pleading drafting skills', 'Gujarati & English fluency'],
    procedure: 'Direct application with verified LowStudy Drafting & Research Portfolio.'
  }
];

const JUDICIAL_SERVICES_ROADMAP = [
  {
    phase: 'Phase 1: Preliminary Exam (Objective MCQ)',
    syllabus: 'Civil Law (CPC, Contract, Specific Relief, Limitation), Criminal Law (BNS, BNSS, BSA), Constitution of India, General Knowledge & Gujarati Language Test.',
    strategy: 'Practice daily MCQs filtered by Gujarat University & Judicial Services syllabus.'
  },
  {
    phase: 'Phase 2: Main Written Examination (Descriptive)',
    syllabus: 'Paper 1 (Civil Law - 100 Marks), Paper 2 (Criminal Law - 100 Marks), Paper 3 (Gujarati Language - 50 Marks). Focus on Judgment Writing and Framing of Issues/Charges.',
    strategy: 'Practice regular drafting in LowStudy Drafting Lab and Answer Evaluator.'
  },
  {
    phase: 'Phase 3: Viva Voce (Personal Interview - 50 Marks)',
    syllabus: 'Testing practical legal aptitude, demeanor, legal ethics, and current legal affairs.',
    strategy: 'Engage with AI Moot Court and Judicial Interview Simulator.'
  }
];

const INTERVIEW_QUESTIONS = [
  {
    q: "How does Section 103(2) of Bharatiya Nyaya Sanhita 2023 differ from conventional joint liability under Old IPC 34?",
    ans: "Section 103(2) BNS specifically penalizes murder committed by a mob of five or more persons on grounds of race, caste, sex, or religion with death or life imprisonment, codifying the Supreme Court mandate in Tehseen Poonawalla (2018)."
  },
  {
    q: "Under what circumstances can an appellate court grant bail during pendency of criminal appeal under BNSS?",
    ans: "Under Section 430 of BNSS 2023 (Old CrPC 389), the appellate court may suspend execution of sentence and release the convict on bail if there are substantial grounds to believe conviction may not sustain or sentence is of short duration."
  },
  {
    q: "Explain the doctrine of res judicata under Section 11 CPC and how it differs from Order II Rule 2.",
    ans: "Section 11 bars the re-litigation of a matter directly and substantially in issue in a former suit between the same parties. Order II Rule 2 bars a second suit if the plaintiff intentionally omits to sue for a part of the claim arising from the same cause of action without court leave."
  }
];

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState('internships'); // internships, judiciary, resume, interview
  const [copied, setCopied] = useState(false);

  // Resume builder state
  const [resumeData, setResumeData] = useState({
    name: 'Ramesh Patel',
    email: 'ramesh.law@example.com',
    phone: '+91 98765 43210',
    university: 'Gujarat University, Ahmedabad',
    degree: 'LL.B. (3-Year Program) — 2024-2027',
    aggregate: '68.5% (Rank 4 in Semester 2)',
    interests: 'Constitutional Litigation, Criminal Law (BNS/BNSS), Commercial Arbitration',
    moots: 'Quarter-finalist in Gujarat State Moot Court Competition 2025; Best Memorial Award.',
    publications: 'Co-authored "Impact of Bharatiya Nagarik Suraksha Sanhita on Pre-trial Arrests" in College Law Review.'
  });

  const handleCopyResume = () => {
    const text = `CURRICULUM VITAE

${resumeData.name}
Email: ${resumeData.email} | Phone: ${resumeData.phone}

EDUCATION & ACADEMIC CREDENTIALS
• ${resumeData.degree}
  ${resumeData.university} — Aggregate: ${resumeData.aggregate}

AREAS OF INTEREST & PRACTICE
• ${resumeData.interests}

MOOT COURT & ADVOCACY ACHIEVEMENTS
• ${resumeData.moots}

PUBLICATIONS & LEGAL RESEARCH
• ${resumeData.publications}

CLINICAL & DRAFTING PROFICIENCY
• Certified in Statutory Notice (Sec 138 NI Act), Regular Bail (BNSS 483), and Plaint Drafting via LowStudy Platform.`;

    navigator.clipboard.writeText(text);
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
                <Briefcase className="w-4 h-4 text-amber-500" />
                <span>LEGAL CAREER & PRACTICE ACCELERATOR</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Gujarat Law Student Roadmap
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Legal Internships, Judiciary & Career Hub
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
                Official internship guidelines for Gujarat High Court & District Courts, Gujarat Judicial Services (Civil Judge) syllabus roadmap, student resume builder, and legal interview preparation.
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

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {[
              { id: 'internships', label: 'Court & Chamber Internships', icon: Building2 },
              { id: 'judiciary', label: 'Judicial Services Roadmap (Civil Judge)', icon: Scale },
              { id: 'resume', label: 'Legal CV & Resume Builder', icon: FileText },
              { id: 'interview', label: 'Advocacy Interview Q&A', icon: UserCheck }
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Tab 1: Internships */}
        {activeTab === 'internships' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {INTERNSHIP_GUIDES.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Official Procedure
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-2">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium">{item.body}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 font-semibold block mb-0.5">Eligibility:</span>
                      <span className="text-slate-800 font-medium">{item.eligibility}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 font-semibold block mb-0.5">Duration:</span>
                        <span className="text-slate-800 font-bold">{item.duration}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-slate-400 font-semibold block mb-0.5">Honorarium:</span>
                        <span className="text-slate-800 font-bold">{item.stipend}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-slate-400 font-semibold block">Mandatory Application Documents:</span>
                      <ul className="text-slate-700 space-y-1 list-disc list-inside">
                        {item.keyRequirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900">Application Route: </span>
                    {item.procedure}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Judicial Services Roadmap */}
        {activeTab === 'judiciary' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Gujarat Judicial Services (Civil Judge / JMFC) Preparation Blueprint
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Conducted by High Court of Gujarat for recruitment of Civil Judges.
              </p>
            </div>

            <div className="space-y-4">
              {JUDICIAL_SERVICES_ROADMAP.map((step, idx) => (
                <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-600" />
                      {step.phase}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Step {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <span className="font-bold text-slate-900">Curriculum Coverage: </span>
                    {step.syllabus}
                  </p>
                  <p className="text-xs text-amber-800 font-semibold bg-white p-2.5 rounded-lg border border-slate-200">
                    💡 LowStudy Strategy: {step.strategy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Resume Builder */}
        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
            {/* Form */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Law Student Resume Generator</h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={resumeData.name}
                  onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone:</label>
                  <input
                    type="text"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Degree & University:</label>
                <input
                  type="text"
                  value={resumeData.degree}
                  onChange={(e) => setResumeData({...resumeData, degree: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 mb-2"
                />
                <input
                  type="text"
                  value={resumeData.university}
                  onChange={(e) => setResumeData({...resumeData, university: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Moot Court Achievements:</label>
                <textarea
                  rows={2}
                  value={resumeData.moots}
                  onChange={(e) => setResumeData({...resumeData, moots: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Preview & Copy */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Formatted Resume Preview
                  </span>
                  <button
                    onClick={handleCopyResume}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Formatted Text'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {`CURRICULUM VITAE\n\n${resumeData.name}\n${resumeData.email} | ${resumeData.phone}\n\nEDUCATION & ACADEMICS\n• ${resumeData.degree}\n  ${resumeData.university} (Aggregate: ${resumeData.aggregate})\n\nAREAS OF INTEREST\n• ${resumeData.interests}\n\nMOOT COURT EXPERIENCE\n• ${resumeData.moots}\n\nPUBLICATIONS & WRITING\n• ${resumeData.publications}\n\nCLINICAL SKILLS\n• Verified LowStudy Drafting (Pleadings, Notices & BNS Statutes)`}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Ready for High Court Clerkship Submissions
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Interview Prep */}
        {activeTab === 'interview' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Chamber Practice & Judicial Viva Questions
              </h3>
              <p className="text-xs text-slate-500">High-frequency questions asked in advocate chamber interviews and viva voce examinations.</p>
            </div>

            <div className="space-y-4">
              {INTERVIEW_QUESTIONS.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-800 block">
                    Q{idx + 1}: {q.q}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900">Model Response: </span>
                    {q.ans}
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
