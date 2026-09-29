export const metadata = {
  title: 'Gujarat Law University Curriculum & Syllabus Explorer (3-Yr & 5-Yr LL.B.) | LowStudy',
  description: 'Interactive curriculum explorer for Gujarat University, Saurashtra University, VNSGU, and MSU Baroda. View degree structures, semester subject distributions, credits, and syllabus versions.',
  keywords: [
    'Gujarat law curriculum',
    '3 year LLB syllabus structure',
    '5 year integrated law curriculum Gujarat',
    'Saurashtra university syllabus explorer',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/curriculum',
  },
  openGraph: {
    title: 'Gujarat Law University Curriculum & Syllabus Explorer | LowStudy',
    description: 'Explore full degree structures, semester outlines, and official syllabus distributions.',
    url: 'https://lowstudy.com/curriculum',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function CurriculumLayout({ children }) {
  return <>{children}</>;
}
