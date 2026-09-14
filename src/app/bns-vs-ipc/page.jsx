import React from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getArticleJsonLd, getFaqJsonLd } from '@/utils/seo';
import { Scale, ArrowRight, BookOpen, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'BNS vs IPC Section Comparison & Revision Guide (2023 New Criminal Laws) | LowStudy',
  description: 'Complete student comparative guide between Bharatiya Nyaya Sanhita (BNS 2023) and Indian Penal Code (IPC 1860), BNSS vs CrPC, and BSA vs Evidence Act with section mappings and exam notes.',
  keywords: [
    'BNS vs IPC',
    'BNS Section 103 murder',
    'IPC to BNS section conversion chart',
    'BNSS vs CrPC comparison',
    'BSA vs Indian Evidence Act',
    'Bharatiya Nyaya Sanhita 2023 notes',
    'Gujarat Law University BNS syllabus',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/bns-vs-ipc',
  },
  openGraph: {
    title: 'BNS vs IPC Comparative Guide — New Criminal Laws 2023 | LowStudy',
    description: 'Master the conversion from IPC to BNS, CrPC to BNSS, and Evidence Act to BSA for LL.B. university examinations.',
    url: 'https://lowstudy.com/bns-vs-ipc',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'article',
  },
};

export default function BnsVsIpcPage() {
  const mappings = [
    {
      offence: 'Murder',
      oldLaw: 'IPC Section 302 / 300',
      newLaw: 'BNS Section 103 / 101',
      changes: 'New provisions added for mob lynching and organized crime.',
      slug: 'murder',
    },
    {
      offence: 'Cheating',
      oldLaw: 'IPC Section 420 / 415',
      newLaw: 'BNS Section 318',
      changes: 'Enhanced penalties for cyber cheating and financial fraud.',
      slug: 'cheating',
    },
    {
      offence: 'Criminal Conspiracy',
      oldLaw: 'IPC Section 120B',
      newLaw: 'BNS Section 61',
      changes: 'Restructured under General Exceptions & Inchoate Offences.',
      slug: 'criminal-conspiracy',
    },
    {
      offence: 'Sedition vs Acts Endangering Sovereignty',
      oldLaw: 'IPC Section 124A (Sedition)',
      newLaw: 'BNS Section 152 (Sovereignty/Integrity)',
      changes: 'Sedition term omitted; focuses on secessionist activities & subversive acts.',
      slug: 'sedition',
    },
    {
      offence: 'Theft & Snatching',
      oldLaw: 'IPC Section 378 / 379',
      newLaw: 'BNS Section 303 / 304',
      changes: 'Explicit statutory recognition of Snatching as an offence (BNS 304).',
      slug: 'theft',
    },
    {
      offence: 'Organized Crime',
      oldLaw: 'Special State Acts (MCOCA/GCTOC)',
      newLaw: 'BNS Section 111',
      changes: 'First time introduced in central penal code.',
      slug: 'organized-crime',
    },
  ];

  const faqs = [
    {
      question: 'Which law applies to crimes committed before July 1, 2024?',
      answer: 'Crimes committed on or before June 30, 2024 are investigated and tried under the old Indian Penal Code (IPC 1860) and CrPC 1973 as per Article 20(1) of the Indian Constitution.',
    },
    {
      question: 'Why must Gujarat law students study both IPC and BNS?',
      answer: 'University examinations test both historical precedents under IPC/CrPC and contemporary provisions under BNS 2023/BNSS 2023. LowStudy provides side-by-side legal notes for both.',
    },
    {
      question: 'Is Murder defined under Section 103 of BNS?',
      answer: 'BNS Section 101 defines Culpable Homicide and Murder, while Section 103 prescribes Punishment for Murder (equivalent to IPC Section 302).',
    },
  ];

  const articleJsonLd = getArticleJsonLd({
    title: 'BNS 2023 vs IPC 1860 Section Comparison Guide for Law Students',
    description: 'Comprehensive section mapping and comparative analysis between old and new Indian criminal laws.',
    url: 'https://lowstudy.com/bns-vs-ipc',
  });

  const faqJsonLd = getFaqJsonLd(faqs);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />

      <div className="max-w-6xl mx-auto space-y-8">
        <Breadcrumbs
          items={[
            { name: 'Legal Knowledge', url: '/bare-acts' },
            { name: 'BNS vs IPC Comparison Guide', url: '/bns-vs-ipc' },
          ]}
        />

        <header className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">
            <Scale className="w-4 h-4" /> 2023 Criminal Law Reform Transition
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            BNS vs IPC: Bharatiya Nyaya Sanhita Comparison & Section Mapping
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            Essential exam revision guide contrasting the <strong className="text-amber-400">Bharatiya Nyaya Sanhita (BNS 2023)</strong> against the <strong className="text-slate-300">Indian Penal Code (IPC 1860)</strong>, BNSS vs CrPC, and BSA vs Indian Evidence Act for Gujarat LL.B. & LL.M. students.
          </p>
        </header>

        {/* Section 1: Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase">Substantive Penal Code</span>
            <h2 className="text-lg font-bold text-white">BNS 2023 vs IPC 1860</h2>
            <p className="text-xs text-slate-400">Replaced 511 IPC Sections with 358 BNS Sections, introducing new offences like Mob Lynching & Snatching.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-teal-400 uppercase">Procedural Code</span>
            <h2 className="text-lg font-bold text-white">BNSS 2023 vs CrPC 1973</h2>
            <p className="text-xs text-slate-400">Replaced 484 CrPC Sections with 531 BNSS Sections, mandating electronic evidence & forensic investigation.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase">Law of Evidence</span>
            <h2 className="text-lg font-bold text-white">BSA 2023 vs Evidence Act 1872</h2>
            <p className="text-xs text-slate-400">Replaced 167 IEA Sections with 170 BSA Sections, standardizing digital record admissibility under Section 61.</p>
          </div>
        </div>

        {/* Section 2: Section Mapping Table */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>Key Offences: IPC Section vs BNS Section Conversion Table</span>
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-200 text-xs font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Offence Name</th>
                  <th className="p-4 text-slate-400">Old Law (IPC 1860)</th>
                  <th className="p-4 text-amber-400">Current Law (BNS 2023)</th>
                  <th className="p-4">Key Changes / Student Note</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                {mappings.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-bold text-white">{m.offence}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{m.oldLaw}</td>
                    <td className="p-4 font-mono font-bold text-amber-400 text-xs">{m.newLaw}</td>
                    <td className="p-4 text-xs text-slate-300">{m.changes}</td>
                    <td className="p-4">
                      <Link
                        href={`/bns/${m.slug}`}
                        className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        Read Note <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: NyayaAI Tutor CTA */}
        <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Need a specific IPC to BNS section lookup?</h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Ask NyayaAI to map any section, explain essential ingredients, or generate exam answer frameworks comparing IPC vs BNS.
            </p>
          </div>
          <Link
            href="/ai-tutor"
            className="px-6 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex-shrink-0 text-sm"
          >
            Ask NyayaAI Tutor
          </Link>
        </section>

        {/* Section 4: FAQs */}
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-base">{faq.question}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
