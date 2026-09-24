/**
 * LowStudy Centralized Global Navigation Configuration
 * Single source of truth for Desktop Header, Mobile Drawer, and Footer
 */

export const NAV_ITEMS = [
  {
    id: 'learn',
    label: 'Learn',
    type: 'dropdown',
    items: [
      {
        name: 'Subjects',
        href: '/subjects',
        iconName: 'BookOpen',
        desc: 'Explore law subjects by university, semester and syllabus.',
        badge: 'Core'
      },
      {
        name: 'Notes',
        href: '/subjects',
        iconName: 'FileText',
        desc: 'Topic-wise law notes and exam preparation material.',
        badge: 'Bilingual'
      },
      {
        name: 'Bare Acts',
        href: '/bare-acts',
        iconName: 'Layers',
        desc: 'Read important Bare Acts and statutory provisions (BNS 2023).',
        badge: 'Updated'
      },
      {
        name: 'Case Laws',
        href: '/case-laws',
        iconName: 'Scale',
        desc: 'Study important judgments and ratio decidendi.',
        badge: 'Precedents'
      },
      {
        name: 'Important Sections',
        href: '/bns-vs-ipc',
        iconName: 'BookMarked',
        desc: 'Quickly find important statutory sections & comparative table.'
      },
      {
        name: 'Legal Dictionary',
        href: '/dictionary',
        iconName: 'BookOpen',
        desc: 'Understand legal terminology in English & Gujarati.'
      },
      {
        name: 'Latin Maxims',
        href: '/dictionary',
        iconName: 'Scale',
        desc: 'Learn landmark legal maxims and statutory doctrines.'
      },
      {
        name: 'Study Materials',
        href: '/study-plan',
        iconName: 'FileText',
        desc: 'Organized study resources and adaptive daily study planner.'
      }
    ]
  },
  {
    id: 'practice',
    label: 'Practice',
    type: 'dropdown',
    groups: [
      {
        title: 'Practice Tests',
        items: [
          {
            name: 'MCQ Practice',
            href: '/quiz',
            iconName: 'Award',
            desc: 'Syllabus-aligned multiple choice question banks.',
            badge: '4,690+ MCQs'
          },
          {
            name: 'Daily Quiz',
            href: '/quiz',
            iconName: 'Flame',
            desc: 'Rapid daily drill to build exam speed and accuracy.'
          },
          {
            name: 'Mock Tests',
            href: '/mock-test',
            iconName: 'Timer',
            desc: 'Timed 3-hour simulated university examinations.',
            badge: 'Official'
          },
          {
            name: 'Previous Year Questions',
            href: '/previous-papers',
            iconName: 'FileText',
            desc: 'Past university question papers & archives.'
          },
          {
            name: 'Important Questions',
            href: '/question-bank',
            iconName: 'HelpCircle',
            desc: 'High-yield descriptive questions & IRAC model answers.'
          }
        ]
      },
      {
        title: 'Skill Practice',
        items: [
          {
            name: 'Answer Evaluator',
            href: '/practice/answer-evaluator',
            iconName: 'Sparkles',
            desc: 'Instant diagnostic IRAC scoring and score prediction.',
            badge: 'AI Grader'
          },
          {
            name: 'Drafting Lab',
            href: '/practice/drafting',
            iconName: 'PenTool',
            desc: 'Draft notices, plaints, and bail petitions with AI critique.',
            badge: 'Lab'
          },
          {
            name: 'Moot Court',
            href: '/practice/moot-court',
            iconName: 'Scale',
            desc: 'Memorial builder and AI judicial bench simulation.'
          },
          {
            name: 'Revision',
            href: '/revision',
            iconName: 'RotateCcw',
            desc: 'Automated weak topic tracking & spaced repetition.'
          }
        ]
      }
    ]
  },
  {
    id: 'syllabus',
    label: 'Syllabus',
    type: 'dropdown',
    items: [
      {
        name: 'Current Syllabus',
        href: '/curriculum',
        iconName: 'ShieldCheck',
        desc: 'Official 2026-27 Gujarat university verified syllabus.',
        badge: '2026-27'
      },
      {
        name: 'Universities',
        href: '/universities',
        iconName: 'Building2',
        desc: 'Gujarat University, Saurashtra University, VNSGU, MSU, HNGU portals.'
      },
      {
        name: 'Law Colleges',
        href: '/gujarat-law-colleges',
        iconName: 'GraduationCap',
        desc: 'Affiliated law colleges directory across Gujarat.'
      },
      {
        name: 'Semester Subjects',
        href: '/subjects',
        iconName: 'BookOpen',
        desc: 'Semester 1 through 6 verified academic curriculum trees.'
      },
      {
        name: 'Syllabus Intelligence',
        href: '/curriculum',
        iconName: 'Radio',
        desc: 'Automated source monitoring & circular verification engine.',
        badge: 'Audited'
      },
      {
        name: 'Syllabus Updates',
        href: '/syllabus/history',
        iconName: 'History',
        desc: 'Real-time notifications on university gazettes & circulars.'
      },
      {
        name: 'Syllabus History',
        href: '/syllabus/history',
        iconName: 'History',
        desc: 'Track curriculum version diffs (BNS 2023 vs IPC 1860).'
      }
    ]
  },
  {
    id: 'career',
    label: 'Career & Tools',
    type: 'dropdown',
    groups: [
      {
        title: 'Career',
        items: [
          {
            name: 'Internships',
            href: '/career',
            iconName: 'Briefcase',
            desc: 'Gujarat High Court clerkships & advocate chamber guidelines.',
            badge: 'Careers'
          },
          {
            name: 'Legal Jobs',
            href: '/career',
            iconName: 'Scale',
            desc: 'Law firm career pathways & corporate counsel openings.'
          },
          {
            name: 'Resume Builder',
            href: '/career',
            iconName: 'FileText',
            desc: 'Legal CV formatting & judicial clerkship templates.'
          },
          {
            name: 'Interview Preparation',
            href: '/career',
            iconName: 'GraduationCap',
            desc: 'Gujarat Civil Judge (JMFC) & AIBE preparation roadmaps.'
          }
        ]
      },
      {
        title: 'Tools',
        items: [
          {
            name: 'Legal Tools',
            href: '/bns-vs-ipc',
            iconName: 'Layers',
            desc: 'BNS ↔ IPC converter & statutory reference lookups.'
          },
          {
            name: 'Legal Calculators',
            href: '/tools',
            iconName: 'Calculator',
            desc: 'Limitation Act, Sec 34 CPC interest & court fee calculators.',
            badge: 'Tools'
          },
          {
            name: 'Certificates',
            href: '/dashboard',
            iconName: 'Award',
            desc: 'Exam completion certificates & verified skill badges.'
          }
        ]
      }
    ]
  },
  {
    id: 'pricing',
    label: 'Pricing',
    type: 'link',
    href: '/pricing'
  }
];
