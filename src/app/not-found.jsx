import Link from 'next/link';
import { BookOpen, GraduationCap, Scale, Home, Search, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Page Not Found (404) | LowStudy',
  description: 'The requested page could not be found. Explore Gujarat Law Universities, Subjects, Bare Acts, and Notes on LowStudy.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
      <div className="max-w-2xl w-full text-center space-y-6">
        <Breadcrumbs items={[{ name: '404 Page Not Found', url: '/404' }]} />

        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 mb-2">
          <Scale className="w-12 h-12" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          404 — Page Not Found
        </h1>

        <p className="text-slate-400 text-base sm:text-lg">
          The legal page or study resource you requested does not exist or has been moved. Explore our verified Gujarat law education resources below.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
          <Link
            href="/gujarat-law-colleges"
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group"
          >
            <GraduationCap className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white group-hover:text-emerald-400 text-sm">Gujarat Universities</h3>
            <p className="text-xs text-slate-400 mt-1">Official syllabus & colleges</p>
          </Link>

          <Link
            href="/subjects"
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group"
          >
            <BookOpen className="w-6 h-6 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white group-hover:text-emerald-400 text-sm">Syllabus & Subjects</h3>
            <p className="text-xs text-slate-400 mt-1">LL.B. notes & MCQs</p>
          </Link>

          <Link
            href="/bns-vs-ipc"
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all group"
          >
            <Scale className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white group-hover:text-emerald-400 text-sm">BNS vs IPC Hub</h3>
            <p className="text-xs text-slate-400 mt-1">New criminal laws comparison</p>
          </Link>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-5 h-5" />
            <span>Return to LowStudy Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
