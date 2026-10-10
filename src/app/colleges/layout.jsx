import React from 'react';

export const metadata = {
  title: 'Affiliated Gujarat Law Colleges Directory — LL.B. Syllabi & Notes | LowStudy',
  description: 'Complete directory of affiliated law colleges in Gujarat under Gujarat University, Saurashtra University, and VNSGU. Access syllabus notes, exam preparation materials, and course guides.',
  keywords: [
    'Gujarat Law Colleges',
    'Law colleges in Ahmedabad',
    'Law colleges in Rajkot',
    'Law colleges in Surat',
    'Gujarat University affiliated law colleges',
    'Saurashtra University law colleges',
    'LLB colleges Gujarat'
  ],
  alternates: {
    canonical: 'https://lowstudy.com/colleges',
  },
  openGraph: {
    title: 'Affiliated Gujarat Law Colleges Directory | LowStudy',
    description: 'Explore verified affiliated law colleges across Ahmedabad, Rajkot, Surat, Vadodara, and Gujarat districts with official syllabus and notes.',
    url: 'https://lowstudy.com/colleges',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gujarat Law Colleges Directory | LowStudy',
    description: 'Directory of verified Gujarat law colleges with syllabi and notes.',
  },
};

export default function CollegesLayout({ children }) {
  return children;
}
