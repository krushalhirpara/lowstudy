export const metadata = {
  title: 'Legal Dictionary — Latin Maxims, Legal Terms & Definitions for Law Students | LowStudy',
  description: 'Search hundreds of essential Latin legal maxims, statutory definitions, and judicial phrases with plain-English and Gujarati explanations for Indian law exams.',
  keywords: [
    'Legal dictionary India',
    'Latin legal maxims with meaning',
    'Legal terms for law students',
    'Law maxims Gujarati',
    'Actus reus mens rea meaning',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/dictionary',
  },
  openGraph: {
    title: 'Legal Dictionary & Latin Maxims Repository | LowStudy',
    description: 'Explore comprehensive legal definitions, Latin maxims, and statutory terms.',
    url: 'https://lowstudy.com/dictionary',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function DictionaryLayout({ children }) {
  return <>{children}</>;
}
