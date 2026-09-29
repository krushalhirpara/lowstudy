export const metadata = {
  title: 'Ask NyayaAI — AI Legal Study Assistant & Case Law Explainer | LowStudy',
  description: 'Ask questions to NyayaAI, the specialized Indian law AI study tutor. Get clear explanations on BNS 2023 vs IPC, landmark Supreme Court rulings, syllabus concepts, and exam questions.',
  keywords: [
    'NyayaAI legal tutor',
    'AI law study assistant India',
    'Ask legal questions AI',
    'BNS 2023 AI explanation',
    'Gujarat law syllabus AI assistant',
  ],
  alternates: {
    canonical: 'https://lowstudy.com/ai-tutor',
  },
  openGraph: {
    title: 'Ask NyayaAI — AI Legal Study Assistant | LowStudy',
    description: 'Instant legal conceptual clarity and case law analysis powered by NyayaAI.',
    url: 'https://lowstudy.com/ai-tutor',
    siteName: 'LowStudy',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AiTutorLayout({ children }) {
  return <>{children}</>;
}
