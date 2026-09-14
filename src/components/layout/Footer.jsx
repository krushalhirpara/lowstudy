import Link from 'next/link';
import { Scale, BookOpen, Shield, Heart, Sparkles, Building2, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs pt-12 pb-8 font-poppins">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Vision */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">LowStudy</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                Gujarat Law Platform
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Gujarat's dedicated legal education platform for law students. Official university syllabi, notes, bare acts (BNS 2023), landmark case laws, MCQs, and Ask NyayaAI tutor.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-mono">
                BNS • BNSS • BSA 2023 Updated
              </span>
            </div>
          </div>

          {/* Col 2: Gujarat Universities & Colleges */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Gujarat Institutions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/universities/gu" className="hover:text-amber-400 transition-colors">Gujarat University (GU)</Link></li>
              <li><Link href="/universities/su" className="hover:text-amber-400 transition-colors">Saurashtra University (SU)</Link></li>
              <li><Link href="/universities/vnsgu" className="hover:text-amber-400 transition-colors">Veer Narmad South GU (VNSGU)</Link></li>
              <li><Link href="/universities/msu" className="hover:text-amber-400 transition-colors">MS University Baroda (MSU)</Link></li>
              <li><Link href="/gujarat-law-colleges" className="hover:text-amber-400 transition-colors font-semibold text-emerald-400">30+ Gujarat Law Colleges →</Link></li>
            </ul>
          </div>

          {/* Col 3: Core Learning Modules */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Learning Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/subjects" className="hover:text-amber-400 transition-colors">LL.B. Semester Subjects</Link></li>
              <li><Link href="/bns-vs-ipc" className="hover:text-amber-400 transition-colors">BNS 2023 vs IPC 1860 Guide</Link></li>
              <li><Link href="/bare-acts" className="hover:text-amber-400 transition-colors">Bare Acts (BNS / BNSS / BSA)</Link></li>
              <li><Link href="/case-laws" className="hover:text-amber-400 transition-colors">Landmark Case Laws</Link></li>
              <li><Link href="/quiz" className="hover:text-amber-400 transition-colors">Mock Practice Quizzes</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Exam Answer Writing Guides</Link></li>
            </ul>
          </div>

          {/* Col 4: AI Tutor */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase">Ask NyayaAI</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <Link href="/ai-tutor" className="hover:underline">Ask NyayaAI Tutor</Link>
              </li>
              <li><span className="text-slate-400">Gujarat Syllabus Intelligence</span></li>
              <li><span className="text-slate-400">Section & Case Citation Lookup</span></li>
              <li><span className="text-slate-400">Gujarati & English Notes</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LowStudy.com. All rights reserved. Gujarat Law Student Platform.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Legal Education Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
