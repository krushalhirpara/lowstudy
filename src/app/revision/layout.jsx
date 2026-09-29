export const metadata = {
  title: 'Law Revision Hub & Flashcards — Spaced Repetition for LL.B. Exams | LowStudy',
  description: 'Boost memory retention with smart spaced-repetition flashcards, bookmark revision, and weak-concept review for Gujarat law semester subjects.',
  keywords: [
    'Law revision flashcards',
    'Spaced repetition law notes',
    'LLB exam quick revision',
    'Legal definitions memory cards',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/revision',
  },
  openGraph: {
    title: 'Law Revision Hub & Spaced Repetition Flashcards | LowStudy',
    description: 'Systematic legal revision system with automated spaced intervals and bookmark tracking.',
    url: 'https://lowstudy.com/revision',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RevisionLayout({ children }) {
  return <>{children}</>;
}
