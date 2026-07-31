import Link from 'next/link';
import { Scale, BookOpen, Shield, Heart, Sparkles, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Col 1: Vision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-serif-title text-white">LowStudy.com</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              India's premiere AI-powered law learning ecosystem. Empowering LLB & LLM students, CLAT, AIBE, and Judiciary aspirants with notes, bare acts, case laws, and instant legal doubt solving.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono">
                BNS • BNSS • BSA Updated
              </span>
            </div>
          </div>

          {/* Col 2: Core Modules */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-serif-title">Learning Hub</h4>
            <ul className="space-y-2">
              <li><Link href="/subjects" className="hover:text-amber-400 transition-colors">15 Core Subjects</Link></li>
              <li><Link href="/bare-acts" className="hover:text-amber-400 transition-colors">Bare Acts & BNS Mapping</Link></li>
              <li><Link href="/case-laws" className="hover:text-amber-400 transition-colors">Landmark Case Laws</Link></li>
              <li><Link href="/quiz" className="hover:text-amber-400 transition-colors">Daily Practice & Mock Tests</Link></li>
              <li><Link href="/dictionary" className="hover:text-amber-400 transition-colors">Legal Maxims Dictionary</Link></li>
            </ul>
          </div>

          {/* Col 3: Exam Prep */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-serif-title">Target Exams</h4>
            <ul className="space-y-2">
              <li><span className="text-slate-300">AIBE XIX Preparation</span></li>
              <li><span className="text-slate-300">CLAT PG & UG Notes</span></li>
              <li><span className="text-slate-300">Judiciary Services Prelims</span></li>
              <li><span className="text-slate-300">3 & 5 Year LLB Curriculum</span></li>
              <li><span className="text-slate-300">LLM Constitutional Law</span></li>
            </ul>
          </div>

          {/* Col 4: AI Features */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase font-serif-title">AI Powered</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <Link href="/ai-tutor" className="hover:underline">NyayaAI Doubt Solver</Link>
              </li>
              <li><span className="text-slate-400">Judgment Summarizer</span></li>
              <li><span className="text-slate-400">Flashcard Generator</span></li>
              <li><span className="text-slate-400">IPC to BNS Converter</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LowStudy.com. All rights reserved. Built for Indian Law Aspirants.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
