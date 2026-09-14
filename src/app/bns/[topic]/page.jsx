import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getArticleJsonLd, getFaqJsonLd } from '@/utils/seo';
import { Scale, BookOpen, CheckCircle2, HelpCircle, ArrowRight, FileText, Sparkles } from 'lucide-react';

const TOPIC_DATA = {
  murder: {
    title: 'BNS Murder: Section 103 Meaning, Ingredients & IPC 302 Comparison',
    heading: 'Murder under Bharatiya Nyaya Sanhita (BNS 2023) Section 103',
    bnsSection: 'BNS Section 103 (Punishment) & Section 101 (Definition)',
    ipcCounterpart: 'IPC Section 302 & Section 300',
    description: 'Complete LL.B. exam study guide for Murder under BNS Section 103, essential elements, legal exceptions, landmark judgments, and BNS vs IPC differences.',
    explanation: 'Murder is defined under BNS Section 101 as culpable homicide committed with the intention of causing death or with knowledge that the act is so imminently dangerous that it must in all probability cause death. BNS Section 103 provides punishment of death or imprisonment for life.',
    ingredients: [
      'An act by which the death is caused.',
      'Intention of causing death (BNS Section 101(a)).',
      'Intention of causing bodily injury known to be likely to cause death (BNS Section 101(b)).',
      'Knowledge that the act is imminently dangerous.',
    ],
    exceptions: [
      'Grave and Sudden Provocation',
      'Right of Private Defence Exceeded',
      'Public Servant Exceeding Powers',
      'Sudden Fight in a Heat of Passion',
    ],
    caseLaws: [
      { name: 'KM Nanavati v. State of Maharashtra (1962)', principle: 'Test of grave and sudden provocation.' },
      { name: 'Bachan Singh v. State of Punjab (1980)', principle: 'Rarest of rare cases doctrine for death penalty.' },
    ],
    mcqs: [
      { q: 'Which section of BNS 2023 prescribes punishment for Murder?', options: ['Section 101', 'Section 103', 'Section 302', 'Section 105'], correct: 'Section 103' },
    ],
  },
  cheating: {
    title: 'BNS Cheating: Section 318 Meaning, Elements & IPC 420 Comparison',
    heading: 'Cheating under Bharatiya Nyaya Sanhita (BNS 2023) Section 318',
    bnsSection: 'BNS Section 318',
    ipcCounterpart: 'IPC Section 415 & Section 420',
    description: 'Exam study guide for Cheating under BNS Section 318, essential ingredients, fraudulent inducement, financial deception, and MCQs.',
    explanation: 'Cheating under BNS Section 318 covers deceiving any person, fraudulently or dishonestly inducing the person so deceived to deliver any property, or to consent that any person shall retain any property.',
    ingredients: [
      'Deception of any person.',
      'Fraudulently or dishonestly inducing that person to deliver property.',
      'Intentional inducement causing damage or harm in body, mind, reputation or property.',
    ],
    exceptions: ['Genuine breach of civil contract without initial fraudulent intent at inception.'],
    caseLaws: [
      { name: 'Hridaya Ranjan Prasad Verma v. State of Bihar (2000)', principle: 'Distinction between mere breach of contract and cheating.' },
    ],
    mcqs: [
      { q: 'What section of BNS 2023 corresponds to cheating under IPC 420?', options: ['BNS 318', 'BNS 303', 'BNS 111', 'BNS 61'], correct: 'BNS 318' },
    ],
  },
  'criminal-conspiracy': {
    title: 'BNS Criminal Conspiracy: Section 61 Meaning & IPC 120B Comparison',
    heading: 'Criminal Conspiracy under BNS 2023 Section 61',
    bnsSection: 'BNS Section 61',
    ipcCounterpart: 'IPC Section 120A & Section 120B',
    description: 'Detailed legal notes on Criminal Conspiracy under BNS Section 61, agreement requirement, overt act rule, and landmark precedents.',
    explanation: 'When two or more persons agree to do, or cause to be done, an illegal act or an act which is not illegal by illegal means, such an agreement is designated a criminal conspiracy under BNS Section 61.',
    ingredients: [
      'Agreement between two or more persons.',
      'Object of agreement is to commit an illegal act.',
      'An overt act in pursuance of agreement (for offences other than major crimes).',
    ],
    exceptions: ['Mere discussion or thought without mutual agreement or consensus ad idem.'],
    caseLaws: [
      { name: 'Topandas v. State of Bombay (1956)', principle: 'One person alone cannot be convicted of conspiracy.' },
    ],
    mcqs: [
      { q: 'What is the minimum number of persons required for Criminal Conspiracy under BNS 61?', options: ['1', '2', '5', '7'], correct: '2' },
    ],
  },
};

export async function generateMetadata({ params }) {
  const topic = TOPIC_DATA[params.topic];
  if (!topic) return { title: 'Topic Not Found' };

  return {
    title: `${topic.title} | LowStudy`,
    description: topic.description,
    keywords: [
      `${topic.bnsSection} notes`,
      `${topic.ipcCounterpart} comparison`,
      'BNS study guide Gujarat University',
    ],
    alternates: {
      canonical: `https://lowstudy.com/bns/${params.topic}`,
    },
  };
}

export async function generateStaticParams() {
  return Object.keys(TOPIC_DATA).map((topic) => ({ topic }));
}

export default function BnsTopicSeoPage({ params }) {
  const topic = TOPIC_DATA[params.topic];
  if (!topic) notFound();

  const articleJsonLd = getArticleJsonLd({
    title: topic.title,
    description: topic.description,
    url: `https://lowstudy.com/bns/${params.topic}`,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <JsonLd data={articleJsonLd} />

      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs
          items={[
            { name: 'BNS vs IPC', url: '/bns-vs-ipc' },
            { name: topic.heading, url: `/bns/${params.topic}` },
          ]}
        />

        <header className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
              {topic.bnsSection}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
              Old IPC: {topic.ipcCounterpart}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            {topic.heading}
          </h1>

          <p className="text-slate-300 text-base leading-relaxed">
            {topic.explanation}
          </p>
        </header>

        {/* Essential Ingredients */}
        <section className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Essential Ingredients for Exam Answers</span>
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            {topic.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Landmark Case Laws */}
        {topic.caseLaws && (
          <section className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-400" />
              <span>Verified Precedents & Landmark Judgments</span>
            </h2>
            <div className="space-y-3">
              {topic.caseLaws.map((c, i) => (
                <div key={i} className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-sm">
                  <h3 className="font-bold text-teal-400">{c.name}</h3>
                  <p className="text-slate-300 text-xs mt-1">Ratio: {c.principle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Practice MCQ */}
        {topic.mcqs && (
          <section className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Exam Practice MCQ</span>
            </h2>
            {topic.mcqs.map((mcq, i) => (
              <div key={i} className="space-y-3">
                <p className="text-sm font-semibold text-white">{mcq.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {mcq.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`p-3 rounded-lg border ${
                        opt === mcq.correct
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {opt} {opt === mcq.correct && '✓ Correct'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
