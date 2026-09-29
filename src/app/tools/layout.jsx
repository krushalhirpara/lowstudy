export const metadata = {
  title: 'Legal Tools for Law Students — Limitation Calculator, BNS Converter & Maxims | LowStudy',
  description: 'Free interactive legal tools for law students and practitioners: Limitation Period Calculator under Limitation Act 1963, BNS to IPC Section Converter, Court Fee Estimator, and Latin Legal Maxims dictionary.',
  keywords: [
    'Legal tools India',
    'Limitation period calculator',
    'BNS to IPC converter tool',
    'Latin legal maxims search',
    'Court fee calculator Gujarat',
    'Law student productivity tools',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/tools',
  },
  openGraph: {
    title: 'Interactive Legal Tools for Law Students | LowStudy',
    description: 'Calculate limitation periods, convert BNS to IPC sections, and lookup Latin maxims instantly.',
    url: 'https://lowstudy.com/tools',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function ToolsLayout({ children }) {
  return <>{children}</>;
}
