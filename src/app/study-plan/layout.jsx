export const metadata = {
  title: 'Law Exam Study Planner & Daily Revision Schedule | LowStudy',
  description: 'Structured 1-day, 3-day, and 7-day study plans customized for Gujarat university law examinations. Track syllabus completion and prioritize high-weightage legal topics.',
  keywords: [
    'Law study planner',
    'LLB exam study schedule',
    'Gujarat law university study plan',
    'Daily law revision timetable',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/study-plan',
  },
  openGraph: {
    title: 'Law Exam Study Planner & Intelligent Scheduler | LowStudy',
    description: 'Optimize your exam preparation with automated syllabus-aware study plans.',
    url: 'https://lowstudy.com/study-plan',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function StudyPlanLayout({ children }) {
  return <>{children}</>;
}
