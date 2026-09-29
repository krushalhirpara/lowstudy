export const metadata = {
  title: 'Academic Command Center — Semester Progression & Law Syllabus Modules | LowStudy',
  description: 'Academic syllabus command center for Gujarat law students: Track semester completion progress, view enrolled subject modules, and study unit-by-unit legal doctrines.',
  keywords: [
    'Academic law portal Gujarat',
    'Law semester progression',
    'Syllabus unit study modules',
    'Gujarat LLB academic dashboard',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/academic',
  },
  openGraph: {
    title: 'Academic Command Center & Syllabus Modules | LowStudy',
    description: 'Track your legal academic journey across semesters and subjects.',
    url: 'https://lowstudy.com/academic',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AcademicLayout({ children }) {
  return <>{children}</>;
}
