export async function generateMetadata({ params }) {
  const { id } = params;
  const title = `University Exam Paper Analysis & Model Answers | LowStudy`;
  const description = `Detailed question-by-question analysis, marks distribution, and IRAC model answers for Gujarat Law University exam paper ${id}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lowstudy.com/previous-papers/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/previous-papers/${id}`,
      siteName: 'LowStudy',
      type: 'article',
    },
  };
}

export default function PreviousPaperDetailLayout({ children }) {
  return <>{children}</>;
}
