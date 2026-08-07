// LowStudy Reusable Syllabus Data Repository
// Contains University-wise, Semester-wise, and Version-wise LLB Syllabus data.
// Structured to easily allow adding future universities.

export const UNIVERSITIES = [
  { id: "gu", name: "Gujarat University", code: "GU", logo: "🏛️" },
  { id: "su", name: "Saurashtra University", code: "SU", logo: "📜" },
  { id: "vnsgu", name: "Veer Narmad South Gujarat University", code: "VNSGU", logo: "🦁" }
];

export const SEMESTERS = [
  { id: "sem1", name: "Semester 1", num: 1 },
  { id: "sem2", name: "Semester 2", num: 2 },
  { id: "sem3", name: "Semester 3", num: 3 },
  { id: "sem4", name: "Semester 4", num: 4 },
  { id: "sem5", name: "Semester 5", num: 5 },
  { id: "sem6", name: "Semester 6", num: 6 }
];

// Configuration maps to generate proper subjects for each university, semester, and syllabus type
const SYLLABUS_CONFIGS = {
  gu: {
    new: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 4 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 4 },
        { title: "Law of Torts & Consumer Protection", code: "TORTS", category: "Civil Law", credits: 4 },
        { title: "Bharatiya Nyaya Sanhita (BNS, 2023)", code: "BNS", category: "Criminal Law", credits: 4 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 4 },
        { title: "Law of Contract - II (Special Contracts)", code: "CONTRACT-2", category: "Civil Law", credits: 4 },
        { title: "Bharatiya Nagarik Suraksha Sanhita (BNSS)", code: "BNSS", category: "Criminal Procedure", credits: 4 },
        { title: "Bharatiya Sakshya Adhiniyam (BSA, 2023)", code: "BSA", category: "Evidence Law", credits: 4 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 4 },
        { title: "Environmental Law & NGT Act", code: "ENV", category: "Public Law", credits: 4 },
        { title: "Property Law (TPA)", code: "TPA", category: "Civil Law", credits: 4 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law & Succession)", code: "FAMILY-2", category: "Personal Law", credits: 4 },
        { title: "Jurisprudence (Legal Theory)", code: "JURIS", category: "Core Law", credits: 4 },
        { title: "Administrative Law", code: "ADMIN", category: "Public Law", credits: 4 }
      ],
      sem5: [
        { title: "Code of Civil Procedure (CPC, 1908)", code: "CPC", category: "Civil Procedure", credits: 4 },
        { title: "Companies Act, 2013", code: "COMPANY", category: "Corporate Law", credits: 4 },
        { title: "Public International Law", code: "PIL", category: "Public Law", credits: 4 }
      ],
      sem6: [
        { title: "Taxation Laws (Direct & GST)", code: "TAX", category: "Commercial Law", credits: 4 },
        { title: "Arbitration & Conciliation Act", code: "ADR", category: "Commercial Law", credits: 4 },
        { title: "Cyber Law & IT Act, 2000", code: "CYBER", category: "Specialized Law", credits: 4 }
      ]
    },
    old: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 4 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 4 },
        { title: "Law of Torts & Consumer Protection", code: "TORTS", category: "Civil Law", credits: 4 },
        { title: "Indian Penal Code (IPC, 1860)", code: "IPC", category: "Criminal Law", credits: 4 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 4 },
        { title: "Law of Contract - II (Special Contracts)", code: "CONTRACT-2", category: "Civil Law", credits: 4 },
        { title: "Code of Criminal Procedure (CrPC, 1973)", code: "CrPC", category: "Criminal Procedure", credits: 4 },
        { title: "Indian Evidence Act, 1872", code: "IEA", category: "Evidence Law", credits: 4 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 4 },
        { title: "Environmental Law & NGT Act", code: "ENV", category: "Public Law", credits: 4 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law)", code: "FAMILY-2", category: "Personal Law", credits: 4 },
        { title: "Jurisprudence", code: "JURIS", category: "Core Law", credits: 4 }
      ],
      sem5: [
        { title: "Code of Civil Procedure", code: "CPC", category: "Civil Procedure", credits: 4 },
        { title: "Company Law", code: "COMPANY", category: "Corporate Law", credits: 4 }
      ],
      sem6: [
        { title: "Taxation Laws", code: "TAX", category: "Commercial Law", credits: 4 },
        { title: "Arbitration & Conciliation Act", code: "ADR", category: "Commercial Law", credits: 4 }
      ]
    }
  },
  su: {
    new: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 5 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 5 },
        { title: "Law of Torts & CPA", code: "TORTS", category: "Civil Law", credits: 5 },
        { title: "Bharatiya Nyaya Sanhita (BNS, 2023)", code: "BNS", category: "Criminal Law", credits: 5 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 5 },
        { title: "Law of Contract - II (Special Contracts)", code: "CONTRACT-2", category: "Civil Law", credits: 5 },
        { title: "Bharatiya Nagarik Suraksha Sanhita (BNSS)", code: "BNSS", category: "Criminal Procedure", credits: 5 },
        { title: "Bharatiya Sakshya Adhiniyam (BSA)", code: "BSA", category: "Evidence Law", credits: 5 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 5 },
        { title: "Labour & Industrial Law - I", code: "LABOUR-1", category: "Corporate Law", credits: 5 },
        { title: "Property Law (TPA)", code: "TPA", category: "Civil Law", credits: 5 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law)", code: "FAMILY-2", category: "Personal Law", credits: 5 },
        { title: "Jurisprudence", code: "JURIS", category: "Core Law", credits: 5 },
        { title: "Administrative Law", code: "ADMIN", category: "Public Law", credits: 5 }
      ],
      sem5: [
        { title: "Code of Civil Procedure", code: "CPC", category: "Civil Procedure", credits: 5 },
        { title: "Companies Act, 2013", code: "COMPANY", category: "Corporate Law", credits: 5 },
        { title: "Public International Law", code: "PIL", category: "Public Law", credits: 5 }
      ],
      sem6: [
        { title: "Taxation Laws", code: "TAX", category: "Commercial Law", credits: 5 },
        { title: "Arbitration & ADR", code: "ADR", category: "Commercial Law", credits: 5 },
        { title: "Cyber Law & IT Act", code: "CYBER", category: "Specialized Law", credits: 5 }
      ]
    },
    old: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 5 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 5 },
        { title: "Law of Torts & CPA", code: "TORTS", category: "Civil Law", credits: 5 },
        { title: "Indian Penal Code (IPC)", code: "IPC", category: "Criminal Law", credits: 5 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 5 },
        { title: "Law of Contract - II", code: "CONTRACT-2", category: "Civil Law", credits: 5 },
        { title: "Code of Criminal Procedure (CrPC)", code: "CrPC", category: "Criminal Procedure", credits: 5 },
        { title: "Indian Evidence Act, 1872", code: "IEA", category: "Evidence Law", credits: 5 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 5 },
        { title: "Labour & Industrial Law - I", code: "LABOUR-1", category: "Corporate Law", credits: 5 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law)", code: "FAMILY-2", category: "Personal Law", credits: 5 },
        { title: "Jurisprudence", code: "JURIS", category: "Core Law", credits: 5 }
      ],
      sem5: [
        { title: "Code of Civil Procedure", code: "CPC", category: "Civil Procedure", credits: 5 },
        { title: "Company Law", code: "COMPANY", category: "Corporate Law", credits: 5 }
      ],
      sem6: [
        { title: "Taxation Laws", code: "TAX", category: "Commercial Law", credits: 5 },
        { title: "Arbitration & ADR", code: "ADR", category: "Commercial Law", credits: 5 }
      ]
    }
  },
  vnsgu: {
    new: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 6 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 6 },
        { title: "Law of Torts & Consumer Protection", code: "TORTS", category: "Civil Law", credits: 6 },
        { title: "Bharatiya Nyaya Sanhita (BNS)", code: "BNS", category: "Criminal Law", credits: 6 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 6 },
        { title: "Law of Contract - II (Special Contracts)", code: "CONTRACT-2", category: "Civil Law", credits: 6 },
        { title: "Bharatiya Nagarik Suraksha Sanhita (BNSS)", code: "BNSS", category: "Criminal Procedure", credits: 6 },
        { title: "Bharatiya Sakshya Adhiniyam (BSA)", code: "BSA", category: "Evidence Law", credits: 6 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 6 },
        { title: "Environmental Law & NGT Act", code: "ENV", category: "Public Law", credits: 6 },
        { title: "Labour & Industrial Law - I", code: "LABOUR-1", category: "Corporate Law", credits: 6 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law)", code: "FAMILY-2", category: "Personal Law", credits: 6 },
        { title: "Jurisprudence (Legal Theory)", code: "JURIS", category: "Core Law", credits: 6 },
        { title: "Administrative Law", code: "ADMIN", category: "Public Law", credits: 6 }
      ],
      sem5: [
        { title: "Code of Civil Procedure", code: "CPC", category: "Civil Procedure", credits: 6 },
        { title: "Companies Act, 2013", code: "COMPANY", category: "Corporate Law", credits: 6 },
        { title: "Public International Law", code: "PIL", category: "Public Law", credits: 6 }
      ],
      sem6: [
        { title: "Taxation Laws", code: "TAX", category: "Commercial Law", credits: 6 },
        { title: "Arbitration & ADR Mechanisms", code: "ADR", category: "Commercial Law", credits: 6 },
        { title: "Cyber Law & IT Act", code: "CYBER", category: "Specialized Law", credits: 6 }
      ]
    },
    old: {
      sem1: [
        { title: "Constitutional Law - I", code: "CONST-1", category: "Core Law", credits: 6 },
        { title: "Law of Contract - I", code: "CONTRACT-1", category: "Civil Law", credits: 6 },
        { title: "Law of Torts & Consumer Protection", code: "TORTS", category: "Civil Law", credits: 6 },
        { title: "Indian Penal Code (IPC)", code: "IPC", category: "Criminal Law", credits: 6 }
      ],
      sem2: [
        { title: "Constitutional Law - II", code: "CONST-2", category: "Core Law", credits: 6 },
        { title: "Law of Contract - II", code: "CONTRACT-2", category: "Civil Law", credits: 6 },
        { title: "Code of Criminal Procedure (CrPC)", code: "CrPC", category: "Criminal Procedure", credits: 6 },
        { title: "Indian Evidence Act, 1872", code: "IEA", category: "Evidence Law", credits: 6 }
      ],
      sem3: [
        { title: "Family Law - I (Hindu Law)", code: "FAMILY-1", category: "Personal Law", credits: 6 },
        { title: "Environmental Law", code: "ENV", category: "Public Law", credits: 6 }
      ],
      sem4: [
        { title: "Family Law - II (Muslim Law)", code: "FAMILY-2", category: "Personal Law", credits: 6 },
        { title: "Jurisprudence", code: "JURIS", category: "Core Law", credits: 6 }
      ],
      sem5: [
        { title: "Code of Civil Procedure", code: "CPC", category: "Civil Procedure", credits: 6 },
        { title: "Company Law", code: "COMPANY", category: "Corporate Law", credits: 6 }
      ],
      sem6: [
        { title: "Taxation Laws", code: "TAX", category: "Commercial Law", credits: 6 },
        { title: "Arbitration & ADR", code: "ADR", category: "Commercial Law", credits: 6 }
      ]
    }
  }
};

// Generates realistic mock content for any given subject based on its metadata.
// This allows full syllabus details for every single university/semester/version.
function generateSyllabusForSubject(uniId, semId, version, subjectMeta) {
  const isNew = version === "new";
  const { title, code, category, credits } = subjectMeta;
  const lowercaseTitle = title.toLowerCase();

  // Basic structure
  const unitsCount = 4;
  const units = [];

  // Determine standard units based on subject title keywords
  let unitTemplates = [];

  if (lowercaseTitle.includes("constitutional") || lowercaseTitle.includes("const")) {
    unitTemplates = [
      {
        title: "Historical Background & Preamble",
        desc: "Evolution of the Constitution, constituent assembly, and Preamble philosophy.",
        topics: [
          { title: "Preamble and Basic Structure", desc: "Amendment powers under Article 368 and Kesavananda Bharati ratio." },
          { title: "Salient Features of Constitution", desc: "Federalism, parliamentary system, and written nature." }
        ]
      },
      {
        title: "Fundamental Rights (Articles 12-18)",
        desc: "Definition of State, Judicial Review, and equality provisions.",
        topics: [
          { title: "State under Article 12", desc: "Judicial interpretations and expansion to statutory bodies." },
          { title: "Right to Equality (Article 14)", desc: "Reasonable classification and doctrine of non-arbitrariness." }
        ]
      },
      {
        title: "Fundamental Freedoms (Articles 19-21)",
        desc: "Fundamental freedoms under Article 19 and life/liberty under Article 21.",
        topics: [
          { title: "Article 21: Right to Life", desc: "Maneka Gandhi v. Union of India and expansion of personal liberty." },
          { title: "Freedom of Speech (Article 19)", desc: "Rights, limits, and reasonable restrictions." }
        ]
      },
      {
        title: "Constitutional Remedies & Duties",
        desc: "Writ jurisdiction under Articles 32 & 226, and fundamental duties.",
        topics: [
          { title: "Writ Jurisdictions", desc: "Habeas Corpus, Mandamus, Certiorari, Prohibition, Quo Warranto." },
          { title: "Directive Principles (DPSP)", desc: "Relationship with Fundamental Rights and state obligations." }
        ]
      }
    ];
  } else if (lowercaseTitle.includes("contract")) {
    unitTemplates = [
      {
        title: "Formation of Contract & Proposal",
        desc: "Agreement essentials: proposal, communication, and acceptance.",
        topics: [
          { title: "Proposal and Acceptance", desc: "Statutory rules and communication of proposal under Sec 2-4." },
          { title: "General Offer", desc: "General offers to public at large (Carlill v. Carbolic)." }
        ]
      },
      {
        title: "Consideration & Competency",
        desc: "Lawful consideration and capacity to enter into agreements.",
        topics: [
          { title: "Consideration (Section 2(d))", desc: "Quid pro quo, essentials, and privity of contract exceptions." },
          { title: "Minor's Agreement", desc: "Mohori Bibee case rules and absolute nullity." }
        ]
      },
      {
        title: "Free Consent & Vitiating Factors",
        desc: "Factors affecting free consent: Coercion, Fraud, Undue Influence.",
        topics: [
          { title: "Free Consent (Section 14)", desc: "Definitions of Coercion (Sec 15) and Undue Influence (Sec 16)." },
          { title: "Fraud and Misrepresentation", desc: "Vitiation of contract and rights of parties." }
        ]
      },
      {
        title: "Void Agreements & Breach",
        desc: "Legality of object, void contracts, and breach remedies.",
        topics: [
          { title: "Void Agreements", desc: "Agreement in restraint of marriage, trade, or legal proceedings." },
          { title: "Remedies for Breach", desc: "Liquidated and unliquidated damages under Section 73-74." }
        ]
      }
    ];
  } else if (lowercaseTitle.includes("torts") || lowercaseTitle.includes("tort")) {
    unitTemplates = [
      {
        title: "Introduction & Liability Elements",
        desc: "Definition, nature of civil wrongs, and comparison with contracts/crimes.",
        topics: [
          { title: "Damnum Sine Injuria & vice versa", desc: "Ashby v. White and Gloucester Grammar case ratios." },
          { title: "General Defenses in Torts", desc: "Volenti non fit injuria, Act of God, and Private Defense." }
        ]
      },
      {
        title: "Strict & Absolute Liability",
        desc: "Liability without faults, exceptions, and hazardous industry rules.",
        topics: [
          { title: "Strict Liability", desc: "Rule in Rylands v. Fletcher and its five defenses." },
          { title: "Absolute Liability", desc: "M.C. Mehta v. Union of India and Oleum Gas Leak precedents." }
        ]
      },
      {
        title: "Negligence & Defamation",
        desc: "Civil negligence, duty of care, and defamation standards.",
        topics: [
          { title: "Negligence Elements", desc: "Duty of care, breach of duty, and consequential damages." },
          { title: "Vicarious Liability", desc: "Employer-employee liability, master-servant rules." }
        ]
      },
      {
        title: "Consumer Protection Act",
        desc: "Consumer rights, councils, and redressal commissions.",
        topics: [
          { title: "CPA Definitions", desc: "Who is a Consumer, what is Deficiency of Service." },
          { title: "Consumer Commissions", desc: "District, State, and National commissions jurisdiction." }
        ]
      }
    ];
  } else if (lowercaseTitle.includes("bns") || lowercaseTitle.includes("penal") || lowercaseTitle.includes("crimes") || lowercaseTitle.includes("ipc")) {
    unitTemplates = [
      {
        title: "General Principles & Mental Elements",
        desc: "Definition of crime, Actus Reus, Mens Rea, and punishments.",
        topics: [
          { title: "IPC to BNS Transition", desc: "Renumbering comparison and community service introduction." },
          { title: "Mens Rea and Statutory Offences", desc: "Mental intent, strict liability crimes." }
        ]
      },
      {
        title: "Offences Affecting Human Body",
        desc: "Homicide, murder, mob lynching, and causing hurt.",
        topics: [
          { title: "BNS Sec 103: Murder", desc: "Elements, difference from culpable homicide, and mob lynching." },
          { title: "Kidnapping & Abduction", desc: "Statutory elements and punishments." }
        ]
      },
      {
        title: "Offences Against Women & Children",
        desc: "Rape, outraging modesty, and cruelty laws.",
        topics: [
          { title: "Rape Provisions (BNS Sec 63)", desc: "Definitions, age boundaries, and enhanced penalties." },
          { title: "Domestic Cruelty", desc: "BNS Sec 85/86 (former IPC 498A) provisions." }
        ]
      },
      {
        title: "Offences Against Property & State",
        desc: "Theft, cheating, criminal breach of trust, and sedition revisions.",
        topics: [
          { title: "BNS Sec 318: Cheating", desc: "Former IPC 420, digital cheating elements." },
          { title: "Sovereignty Offences (Sec 152)", desc: "Removal of 'sedition' word, scope of national integrity." }
        ]
      }
    ];
  } else {
    // Default fallback unit template
    unitTemplates = [
      {
        title: `Introduction to ${title}`,
        desc: `Basic concepts, historical development, and legislative objectives of ${title}.`,
        topics: [
          { title: `Core Concepts of ${title}`, desc: `Definitions, statutory interpretations, and main doctrines.` },
          { title: "Key Jurisprudential Elements", desc: "Analytical and social perspectives of the act." }
        ]
      },
      {
        title: "Statutory Framework & Rules",
        desc: "Detailed study of sections, schedules, and administrative bodies.",
        topics: [
          { title: "Primary Statutory Sections", desc: "Key sections, compliance requirements, and penalties." },
          { title: "Regulatory Authorities", desc: "Role of tribunals, boards, and regulatory oversight." }
        ]
      },
      {
        title: "Judicial Interpretations & Precedents",
        desc: "Analysis of landmark judgments and ratio decidendi.",
        topics: [
          { title: "Landmark Decisions", desc: "Supreme Court guidelines and constitutional validity cases." },
          { title: "Recent Trends", desc: "Emerging case laws and amendments." }
        ]
      },
      {
        title: "Procedural Compliance & Enforcement",
        desc: "Efficacy, dispute resolution, and future directions.",
        topics: [
          { title: "Dispute Resolution Methods", desc: "ADR, judicial forums, and appellate routes." },
          { title: "Global & Domestic Trends", desc: "Comparative study and policy suggestions." }
        ]
      }
    ];
  }

  // Iterate to generate full details
  for (let uIdx = 0; uIdx < unitsCount; uIdx++) {
    const unitTpl = unitTemplates[uIdx] || { title: `Unit ${uIdx + 1}`, desc: "Syllabus details.", topics: [] };
    const unitId = `${uniId}-${semId}-${version}-${code.toLowerCase()}-u${uIdx + 1}`;
    
    const unitTopics = [];
    const tCount = unitTpl.topics.length;
    for (let tIdx = 0; tIdx < tCount; tIdx++) {
      const topicTpl = unitTpl.topics[tIdx];
      const topicId = `${unitId}-t${tIdx + 1}`;
      
      // Generate realistic MCQ
      const mcqs = [
        {
          question: `Which is the primary authority or case law regarding ${topicTpl.title}?`,
          options: ["Kesavananda Bharati Case", "M.C. Mehta Case", "Novartis v. Union of India", "Shreya Singhal Case"],
          correctIndex: lowercaseTitle.includes("constitutional") ? 0 : lowercaseTitle.includes("torts") ? 1 : 2,
          difficulty: "easy",
          explanation: `The case deals directly with the principles of ${topicTpl.title}.`
        },
        {
          question: `What is the statutory objective of ${topicTpl.title}?`,
          options: ["To ensure public safety", "To enforce civil compliance", "To safeguard constitutional rights", "All of the above"],
          correctIndex: 3,
          difficulty: "medium",
          explanation: `All options represent different facets of ${topicTpl.title}'s statutory objectives.`
        }
      ];

      // Case law
      const caseLaws = [
        {
          title: `State of Gujarat v. Landmark Authority regarding ${topicTpl.title}`,
          citation: "(2024) 4 SCC 109",
          bench: "2 Judges Bench",
          keyPrinciple: `Guidelines for implementing ${topicTpl.title}`,
          facts: `A writ petition was filed challenging the administrative interpretation of ${topicTpl.title} rules.`,
          issues: "Whether the rules violate natural justice.",
          arguments: ["Petitioners claimed no hearing was given.", "State claimed it was a public emergency."],
          judgment: "The Court held that natural justice must be read into the act, directing a mandatory hearing.",
          ratio: "Administrative decisions affecting civil rights must be just, fair and reasonable."
        }
      ];

      // Bare Act
      const bareActs = [
        {
          actName: `${title} Act`,
          sectionNumber: "Section 15",
          title: `Statutory definitions of ${topicTpl.title}`,
          content: `Every person acting under this section shall do so in good faith, and shall be protected from any civil liability for acts done in pursuance of statutory powers.`,
          relatedSections: ["Section 14", "Section 16"]
        }
      ];

      // Flashcards
      const flashcards = [
        { front: `What is the core rule in ${topicTpl.title}?`, back: "It establishes the legal standard for compliance and rights." },
        { front: `Which case is primary for ${topicTpl.title}?`, back: `Novartis/Kesavananda/M.C. Mehta depending on the legal domain.` }
      ];

      unitTopics.push({
        id: topicId,
        title: topicTpl.title,
        description: topicTpl.desc,
        subTopics: ["General Introduction", "Essential Ingredients", "Judicial Outlook", "Practical Utility"],
        notes: {
          simpleNotes: `${topicTpl.title} is an essential part of the syllabus. It sets the baseline for legal study in this course. It ensures all students understand the statutory objectives, definitions, and applications of this legal concept.`,
          detailedNotes: `${topicTpl.title} covers the legislative history, primary provisions, and judicial extensions of ${title}.\n\n1. Legislative Intent: The lawmakers wanted to resolve historical ambiguities.\n2. Key Doctrines: Focuses on regulatory checks and balancing individual rights.\n3. Judiciary Guidelines: Supreme Court rulings dictate how this section is executed on the ground.`,
          examples: [`Practical example of ${topicTpl.title} application in local courts or daily corporate operations.`],
          flowcharts: [`Initial Request ➔ Administrative Verification ➔ Judicial Audit ➔ Final Enforcement`],
          importantPoints: [
            "This is a highly tested topic in LLB exams.",
            "Must memorize the corresponding section numbers.",
            "Understand the difference between procedural rules and substantive rights."
          ],
          examTips: [
            `In exams, always write a neat diagram or flowchart showing the elements of ${topicTpl.title}.`
          ],
          faqs: [
            { q: "Is this section mandatory?", a: "Yes, it is a mandatory provision and cannot be waived by private contract." }
          ]
        },
        mcqs,
        flashcards,
        caseLaws,
        bareActs,
        importantQuestions: [
          `Explain the concepts and essentials of ${topicTpl.title} with landmark cases.`,
          `Discuss the recent judicial developments regarding ${topicTpl.title}.`
        ],
        pyqs: [
          "Gujarat University Exam (2022) - 15 Marks Question",
          "Saurashtra University Exam (2023) - Short Note Question"
        ],
        books: [
          "Avatar Singh - Law of Contract & Specific Relief",
          "Dr. M.P. Singh - V.N. Shukla's Constitution of India"
        ],
        videos: [
          { title: `Video: Complete lecture on ${topicTpl.title}`, url: "https://www.youtube.com/watch?v=mock" }
        ],
        mindMaps: [
          `${topicTpl.title} ➔ Core Section ➔ Exceptions ➔ Landmark Precedent ➔ Enforcement`
        ]
      });
    }

    units.push({
      id: unitId,
      unitNumber: uIdx + 1,
      title: unitTpl.title,
      description: unitTpl.desc,
      topics: unitTopics
    });
  }

  return {
    id: `${uniId}-${semId}-${version}-${code.toLowerCase()}`,
    title,
    shortCode: code,
    category,
    credits,
    semesterId: semId,
    universityId: uniId,
    syllabusVersion: version,
    color: getSubjectColor(code),
    units
  };
}

function getSubjectColor(code) {
  const map = {
    CONST: "from-blue-600 to-indigo-900",
    CONTRACT: "from-sky-600 to-blue-950",
    TORTS: "from-violet-600 to-purple-900",
    BNS: "from-amber-600 to-red-900",
    IPC: "from-red-600 to-red-950",
    BNSS: "from-emerald-600 to-teal-900",
    CrPC: "from-emerald-700 to-teal-950",
    BSA: "from-purple-600 to-indigo-950",
    IEA: "from-purple-700 to-indigo-900",
    FAMILY: "from-rose-600 to-pink-900",
    ENV: "from-green-600 to-emerald-900",
    CPC: "from-blue-700 to-slate-900",
    COMPANY: "from-cyan-600 to-slate-900",
    IPR: "from-fuchsia-600 to-purple-950",
    TAX: "from-yellow-600 to-amber-950",
    ADR: "from-indigo-600 to-blue-900",
    CYBER: "from-teal-600 to-emerald-950"
  };
  return map[code.split("-")[0]] || "from-slate-700 to-slate-900";
}

// Generate the global, complete dataset
const generatedSyllabusList = [];

for (const uni of UNIVERSITIES) {
  const uniId = uni.id;
  const config = SYLLABUS_CONFIGS[uniId];
  if (!config) continue;

  for (const version of ["new", "old"]) {
    const verConfig = config[version];
    if (!verConfig) continue;

    for (const sem of SEMESTERS) {
      const semId = sem.id;
      const subjectsMeta = verConfig[semId] || [];

      for (const subjMeta of subjectsMeta) {
        const fullSubject = generateSyllabusForSubject(uniId, semId, version, subjMeta);
        generatedSyllabusList.push(fullSubject);
      }
    }
  }
}

export const ALL_SYLLABUS_SUBJECTS = generatedSyllabusList;
