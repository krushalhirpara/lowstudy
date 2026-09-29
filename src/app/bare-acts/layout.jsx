export const metadata = {
  title: 'Bare Acts (BNS 2023, BNSS, BSA, IPC, CrPC, Constitution) & Section Notes | LowStudy',
  description: 'Search and study statutory Bare Acts for Indian law students. Full text, section explanations, and comparative mappings for Bharatiya Nyaya Sanhita (BNS), BNSS, BSA, IPC, CrPC, and Constitution of India.',
  keywords: [
    'Bare Acts India',
    'Bharatiya Nyaya Sanhita 2023 bare act',
    'BNS Section lookup',
    'BNSS vs CrPC sections',
    'BSA 2023 sections',
    'Constitution of India articles',
    'IPC sections online',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/bare-acts',
  },
  openGraph: {
    title: 'Bare Acts & Statutory Legal Sections Repository | LowStudy',
    description: 'Comprehensive statutory library with quick section search, comparative tables, and legal notes for law exams.',
    url: 'https://lowstudy.com/bare-acts',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bare Acts & Statutory Section Notes | LowStudy',
    description: 'Search and study BNS, BNSS, BSA, IPC, CrPC, and Constitution sections.',
  },
};

export default function BareActsLayout({ children }) {
  return <>{children}</>;
}
