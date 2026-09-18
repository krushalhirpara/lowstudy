import '@/app/globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Script from 'next/script';
import { Bot } from 'lucide-react';
import { Poppins, Hind_Vadodara } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const hindVadodara = Hind_Vadodara({
  subsets: ['latin', 'gujarati'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-hind-vadodara',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://lowstudy.com'),
  title: {
    default: 'LowStudy — Law Education & Gujarat University Syllabus Intelligence System',
    template: '%s | LowStudy',
  },
  description: 'Gujarat-focused legal education platform for law students. Study Gujarat University, Saurashtra University, VNSGU LL.B. & LL.M. syllabus, notes, BNS vs IPC, case laws, MCQs, and Ask NyayaAI.',
  keywords: [
    'LowStudy',
    'Gujarat University LLB syllabus',
    'Saurashtra University law notes',
    'VNSGU LLB syllabus',
    'BNS vs IPC',
    'BNSS vs CrPC',
    'BSA vs Indian Evidence Act',
    'Gujarat Law Colleges',
    'LL.B. notes Gujarat',
    'Ask NyayaAI',
  ],
  authors: [{ name: 'LowStudy Team', url: 'https://lowstudy.com' }],
  creator: 'LowStudy',
  publisher: 'LowStudy',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'LowStudy — Gujarat Law Education & Exam Preparation Platform',
    description: 'Gujarat-focused legal education platform for law students. Official syllabus notes, BNS vs IPC revisions, case laws, MCQs, and Ask NyayaAI.',
    url: 'https://lowstudy.com',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LowStudy — Gujarat Law Education Platform',
    description: 'Study Gujarat University, Saurashtra University, VNSGU LL.B. syllabus, notes, BNS vs IPC, case laws, and MCQs.',
  },
  verification: {
    google: 'oWQ09SAzdvNqLHxPmmVg6g_ZQzamWoXwT8_xPjP9pS0',
  },
  other: {
    'google-adsense-account': 'ca-pub-4372092895969608',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${hindVadodara.variable} dark`}>
      <body className={`${poppins.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased`}>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4372092895969608"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-37P31VWPP7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-37P31VWPP7');
          `}
        </Script>

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
