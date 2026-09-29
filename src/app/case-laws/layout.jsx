export const metadata = {
  title: 'Landmark Case Laws & Supreme Court Judgments for Law Students | LowStudy',
  description: 'Explore landmark Indian Supreme Court and High Court judicial precedents with IRAC summaries, ratio decidendi, legal issues, and subject citations for LL.B. semester examinations.',
  keywords: [
    'Landmark Case Laws India',
    'Supreme Court judgment summaries',
    'Constitutional law case laws',
    'Criminal law landmark cases',
    'Kesavananda Bharati case summary',
    'BNS case laws',
    'Gujarat High Court judgments',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/case-laws',
  },
  openGraph: {
    title: 'Landmark Case Laws & Judicial Precedents Repository | LowStudy',
    description: 'Structured judgment briefs, legal principles, and examination citations curated for law students.',
    url: 'https://lowstudy.com/case-laws',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landmark Case Laws & Supreme Court Judgments | LowStudy',
    description: 'Concise judicial summaries and legal principles for law students.',
  },
};

export default function CaseLawsLayout({ children }) {
  return <>{children}</>;
}
