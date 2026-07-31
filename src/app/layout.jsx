import '@/app/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Bot } from 'lucide-react';

export const metadata = {
  title: 'LowStudy.com - Law Learning Platform for Indian Students & Aspirants',
  description: 'AI-powered learning platform for Indian law students with notes, quizzes, mock tests, bare acts (BNS/BNSS/BSA), case law summaries, and AI doubt solving.',
  keywords: 'LowStudy, Indian Law, LLB notes, BNS 2023, BNSS 2023, BSA 2023, CLAT, AIBE, Judiciary, Law AI Tutor',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />

        {/* Floating AI Tutor Button */}
        <Link
          href="/ai-tutor"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center border border-emerald-400/30"
          title="Ask NyayaAI Tutor"
        >
          <Bot className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
          <span className="absolute right-full mr-3 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
            Ask NyayaAI Tutor
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border border-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
          </span>
        </Link>
      </body>
    </html>
  );
}
