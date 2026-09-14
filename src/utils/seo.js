// LowStudy — SEO & Structured Data Helper Utilities
// Generates schema.org compliant JSON-LD objects for Google Rich Results.

export const BASE_URL = 'https://lowstudy.com';

/**
 * Builds canonical URL for a given path
 */
export function getCanonicalUrl(path = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * WebSite Schema (Homepage / Site Search)
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LowStudy',
    alternateName: ['LowStudy Law', 'LowStudy Gujarat Law Platform'],
    url: BASE_URL,
    description: 'Gujarat Law Education & Exam Preparation Platform for Law Students (LL.B., LL.M., Judiciary).',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/subjects?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Educational Organization Schema
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'LowStudy',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://www.gujaratuniversity.ac.in',
    ],
    knowsAbout: [
      'Indian Legal System',
      'Bharatiya Nyaya Sanhita (BNS)',
      'Bharatiya Nagarik Suraksha Sanhita (BNSS)',
      'Bharatiya Sakshya Adhiniyam (BSA)',
      'Gujarat Law University Syllabus',
      'LL.B. Syllabus & Notes',
    ],
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Gujarat',
      addressCountry: 'IN',
    },
  };
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbJsonLd(items = []) {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url.startsWith('/') ? item.url : '/' + item.url}`,
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Course Schema
 */
export function getCourseJsonLd({ name, description, provider = 'LowStudy', university = 'Gujarat University' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
      sameAs: BASE_URL,
    },
    educationalCredentialAwarded: 'LL.B. Semester Preparation',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      location: 'Gujarat, India',
    },
  };
}

/**
 * FAQPage Schema
 */
export function getFaqJsonLd(faqs = []) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Article Schema (for Blog & Legal Guides)
 */
export function getArticleJsonLd({ title, description, url, datePublished, dateModified, author = 'LowStudy Legal Team' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url.startsWith('http') ? url : `${BASE_URL}${url}`,
    },
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LowStudy',
      url: BASE_URL,
    },
    datePublished: datePublished || '2026-09-01T00:00:00+05:30',
    dateModified: dateModified || new Date().toISOString(),
  };
}
