import '@/app/globals.css';
import '@/app/tailwind-built.css';
import '@/app/white-theme.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingAiTutor from '@/components/layout/FloatingAiTutor';
import AdSenseShield from '@/components/ads/AdSenseShield';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';
import Script from 'next/script';
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
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

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${hindVadodara.variable}`}>
      <head />
      <body className={`${poppins.className} bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased`}>
        <AuthProvider>
          {/* Defensive AdSense runtime exception shield */}
          <AdSenseShield />

          {/* Official Google AdSense Global Async Loader (Loaded afterInteractive to prevent React #419 hydration mismatch) */}
          <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4372092895969608"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />

          {/* First-Party User Activity Analytics Tracker */}
          <AnalyticsTracker />

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

          {/* Floating AI Tutor Button (Client rendered, hides on /ceoadmin) */}
          <FloatingAiTutor />
        </AuthProvider>
      </body>
    </html>
  );
}

