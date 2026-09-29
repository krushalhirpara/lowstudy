export const metadata = {
  title: 'Online Timed Mock Tests for Gujarat Law Students & LL.B. Exams | LowStudy',
  description: 'Simulate official university exam conditions with full-length timed mock tests, negative marking, instant scorecards, and topic-level weak area analysis for Gujarat law students.',
  keywords: [
    'LLB Mock Tests',
    'Gujarat University law mock exam',
    'Timed legal test series',
    'BNS 2023 mock examination',
    'Law test series India',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/mock-test',
  },
  openGraph: {
    title: 'Timed Law Mock Tests & Examination Simulator | LowStudy',
    description: 'Prepare with full-length timed mock exams and instant performance analytics.',
    url: 'https://lowstudy.com/mock-test',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Timed Mock Tests for LL.B. Exams | LowStudy',
    description: 'Simulated examination environments with instant scorecards and analysis.',
  },
};

export default function MockTestLayout({ children }) {
  return <>{children}</>;
}
