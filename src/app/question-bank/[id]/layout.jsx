export async function generateMetadata({ params }) {
  const { id } = params;
  const title = `Legal Exam Question & Model Answer Practice | LowStudy`;
  const description = `Practice answering descriptive law exam questions with IRAC structure, statutory references, and judicial precedents.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://lowstudy.com/question-bank/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lowstudy.com/question-bank/${id}`,
      siteName: 'LowStudy',
      type: 'article',
    },
  };
}

export default function QuestionDetailLayout({ children }) {
  return <>{children}</>;
}
