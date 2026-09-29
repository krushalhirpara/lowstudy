import { SUBJECTS_DATA } from '@/data/legalData';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';
import JsonLd from '@/components/seo/JsonLd';
import { getCourseJsonLd } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { id } = params;
  
  // Look up subject title in dataset
  const found = 
    SUBJECTS_DATA.find(s => s.id === id) || 
    ALL_SYLLABUS_SUBJECTS.find(s => s.id === id);

  const subjectTitle = found?.title || found?.name || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const subjectCode = found?.code || found?.shortCode || '';
  const codeText = subjectCode ? ` (${subjectCode})` : '';

  const title = `${subjectTitle}${codeText} — Notes, MCQs, Syllabus & Case Laws | LowStudy`;
  const description = `Complete official syllabus notes, unit topics, BNS 2023 provisions, landmark case laws, and exam practice MCQs for ${subjectTitle} in Gujarat Law Universities.`;

  return {
    title,
    description,
    keywords: [
      `${subjectTitle} notes`,
      `${subjectTitle} syllabus Gujarat`,
      `${subjectTitle} case laws`,
      `${subjectTitle} MCQs`,
      `${subjectTitle} LLB exam preparation`,
    ],
    alternates: {
      canonical: `https://lowstudy.com/subjects/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/subjects/${id}`,
      siteName: 'LowStudy',
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function SubjectDetailLayout({ children, params }) {
  const { id } = params;
  const found = 
    SUBJECTS_DATA.find(s => s.id === id) || 
    ALL_SYLLABUS_SUBJECTS.find(s => s.id === id);
  const subjectTitle = found?.title || found?.name || id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const courseJsonLd = getCourseJsonLd({
    name: `${subjectTitle} — Law Syllabus & Examination Course`,
    description: `Comprehensive syllabus modules, notes, case laws, and practice questions for ${subjectTitle}.`,
  });

  return (
    <>
      <JsonLd data={courseJsonLd} />
      {children}
    </>
  );
}
