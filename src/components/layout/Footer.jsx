import Link from 'next/link';
import { Scale, BookOpen, Shield, Heart, Sparkles, Building2, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200 text-slate-600 text-xs pt-12 pb-8 font-poppins">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Vision */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900">LowStudy</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase">
                Gujarat Law Platform
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-sm text-xs">
              Gujarat's dedicated legal education platform for law students. Official university syllabi, notes, bare acts (BNS 2023), landmark case laws, MCQs, and Ask NyayaAI tutor.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-amber-700 font-mono font-medium shadow-sm">
                BNS • BNSS • BSA 2023 Updated
              </span>
            </div>
          </div>

          {/* Col 2: Gujarat Universities & Colleges */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase">Saurashtra University (SU)</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/saurashtra-university/" className="hover:text-amber-600 transition-colors font-medium">SU Law Faculty (Rajkot)</Link></li>
              <li><Link href="/saurashtra-university/llb/" className="hover:text-amber-600 transition-colors font-medium">LL.B. 3-Year Program</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/" className="hover:text-amber-600 transition-colors font-semibold text-emerald-700">LL.B. Semester 3 Hub →</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/labour-and-industrial-law-1/" className="hover:text-amber-600 transition-colors">Labour Law - I Notes</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/principles-of-taxation-laws/" className="hover:text-amber-600 transition-colors">Taxation Laws Notes</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/principal-of-banking-laws/" className="hover:text-amber-600 transition-colors">Banking Laws Notes</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/information-technology-laws-and-cyber-crimes/" className="hover:text-amber-600 transition-colors">IT & Cyber Crimes Notes</Link></li>
            </ul>
          </div>

          {/* Col 3: Core Learning Modules */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase">Learning Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/subjects" className="hover:text-amber-600 transition-colors">LL.B. Semester Subjects</Link></li>
              <li><Link href="/bns-vs-ipc" className="hover:text-amber-600 transition-colors">BNS 2023 vs IPC 1860 Guide</Link></li>
              <li><Link href="/bare-acts" className="hover:text-amber-600 transition-colors">Bare Acts (BNS / BNSS / BSA)</Link></li>
              <li><Link href="/case-laws" className="hover:text-amber-600 transition-colors">Landmark Case Laws</Link></li>
              <li><Link href="/quiz" className="hover:text-amber-600 transition-colors">Mock Practice Quizzes</Link></li>
              <li><Link href="/blog" className="hover:text-amber-600 transition-colors">Exam Answer Writing Guides</Link></li>
            </ul>
          </div>

          {/* Col 4: AI Tutor */}
          <div className="space-y-3">
            <h4 className="text-slate-900 font-bold text-xs tracking-wider uppercase">Ask NyayaAI</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <Link href="/ai-tutor" className="hover:underline">Ask NyayaAI Tutor</Link>
              </li>
              <li><span className="text-slate-600">Gujarat Syllabus Intelligence</span></li>
              <li><span className="text-slate-600">Section & Case Citation Lookup</span></li>
              <li><span className="text-slate-600">Gujarati & English Notes</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LowStudy.com. All rights reserved. Gujarat Law Student Platform.</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-700 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-700 cursor-pointer">Legal Education Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
