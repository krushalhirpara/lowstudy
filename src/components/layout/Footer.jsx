import Link from 'next/link';
import { 
  Scale, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  Award, 
  PenTool, 
  FileText, 
  Briefcase, 
  Calculator,
  History,
  Bot
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs pt-16 pb-12 font-poppins border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          
          {/* Col 1: Brand & Mission */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Scale className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Low<span className="text-amber-500">Study</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                Legal EdTech OS
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The AI-Powered Legal Learning & Practice Platform for Gujarat law students. Synchronized with official university syllabi, Bare Acts (BNS 2023), landmark case laws, MCQs, and NyayaAI legal tutor.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono font-medium">
                BNS • BNSS • BSA 2023 Verified
              </span>
              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Official Source Audited
              </span>
            </div>
          </div>

          {/* Col 2: Learn */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Learn
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/subjects" className="hover:text-amber-400 transition">LL.B Semester Subjects</Link></li>
              <li><Link href="/bare-acts" className="hover:text-amber-400 transition">Bare Acts (BNS/BNSS/BSA)</Link></li>
              <li><Link href="/case-laws" className="hover:text-amber-400 transition">Landmark Case Laws</Link></li>
              <li><Link href="/dictionary" className="hover:text-amber-400 transition">Legal Dictionary & Maxims</Link></li>
              <li><Link href="/bns-vs-ipc" className="hover:text-amber-400 transition">BNS 2023 vs IPC 1860 Guide</Link></li>
              <li><Link href="/saurashtra-university/llb/semester-3/" className="hover:text-amber-400 transition text-emerald-400 font-semibold">SU Sem 3 Hub →</Link></li>
            </ul>
          </div>

          {/* Col 3: Practice & Skills */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Practice
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/quiz" className="hover:text-amber-400 transition">MCQ Practice & Quizzes</Link></li>
              <li><Link href="/practice/drafting" className="hover:text-amber-400 transition text-amber-400 font-medium">AI Drafting Lab</Link></li>
              <li><Link href="/practice/moot-court" className="hover:text-amber-400 transition">Virtual Moot Court</Link></li>
              <li><Link href="/practice/answer-evaluator" className="hover:text-amber-400 transition">AI Exam Answer Grader</Link></li>
              <li><Link href="/mock-test" className="hover:text-amber-400 transition">Timed Mock Tests</Link></li>
              <li><Link href="/previous-papers" className="hover:text-amber-400 transition">University Previous Papers</Link></li>
              <li><Link href="/revision" className="hover:text-amber-400 transition">Spaced Revision & Mistakes</Link></li>
            </ul>
          </div>

          {/* Col 4: AI & Research */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-500" /> AI & Research
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/ai-tutor" className="hover:text-amber-400 transition flex items-center gap-1 text-emerald-400 font-semibold"><Sparkles className="w-3 h-3" /> Ask NyayaAI Tutor</Link></li>
              <li><Link href="/research" className="hover:text-amber-400 transition">Precedent & Ratio Search</Link></li>
              <li><Link href="/ai/document-analyzer" className="hover:text-amber-400 transition">AI Document Analyzer</Link></li>
              <li><Link href="/tools" className="hover:text-amber-400 transition">Limitation & Interest Calculators</Link></li>
              <li><Link href="/study-plan" className="hover:text-amber-400 transition">Adaptive Study Planner</Link></li>
            </ul>
          </div>

          {/* Col 5: Syllabus & Universities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-500" /> Syllabus
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/curriculum" className="hover:text-amber-400 transition font-medium">Current Verified Syllabus</Link></li>
              <li><Link href="/syllabus/history" className="hover:text-amber-400 transition">Syllabus Version History</Link></li>
              <li><Link href="/universities" className="hover:text-amber-400 transition">Gujarat Universities</Link></li>
              <li><Link href="/gujarat-law-colleges" className="hover:text-amber-400 transition">Law Colleges Directory</Link></li>
              <li><Link href="/career" className="hover:text-amber-400 transition text-amber-400">Court Internships & Judiciary</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LowStudy.com. All rights reserved. Designed for Gujarat Law Students.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/curriculum" className="hover:text-slate-400">Syllabus Verification Protocol</Link>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Educational Legal Disclaimer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
