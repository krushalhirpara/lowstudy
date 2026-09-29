export async function generateMetadata({ params }) {
  const { id } = params;
  const title = `Academic Subject Modules & Unit Breakdown | LowStudy`;
  const description = `Detailed unit outlines, topics, statutory sections, and syllabus progress for subject ${id}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lowstudy.com/academic/subject/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/academic/subject/${id}`,
      siteName: 'LowStudy',
      type: 'article',
    },
  };
}

export default function AcademicSubjectDetailLayout({ children }) {
  return <>{children}</>;
}
