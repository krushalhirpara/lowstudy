export const SUBJECTS_DATA = [
  {
    id: "constitutional-law",
    title: "Constitutional Law",
    shortCode: "CONST",
    description: "Fundamental Rights, Directive Principles, Union & State Executive, Judiciary, and Constitutional Amendments.",
    category: "Core Law",
    modulesCount: 18,
    articlesCount: "395+",
    casesCount: "120+",
    color: "from-blue-600 to-indigo-900",
    popular: true,
    progress: 75,
    chapters: [
      { id: "preamble", title: "Preamble & Salient Features", notes: "The Preamble is the key to open the mind of the makers of the Constitution (Berubari Union case). Kesavananda Bharati established that Preamble is part of the Constitution." },
      { id: "fr-part3", title: "Part III - Fundamental Rights (Articles 12-35)", notes: "Covers Right to Equality (Art 14-18), Right to Freedom (Art 19-22), Right against Exploitation (Art 23-24), Freedom of Religion (Art 25-28), Cultural & Educational Rights (Art 29-30), Constitutional Remedies (Art 32)." },
      { id: "art-21", title: "Article 21 - Right to Life & Personal Liberty", notes: "Expanded in Maneka Gandhi v. Union of India to include procedure established by law must be just, fair, and reasonable." },
      { id: "judiciary", title: "Supreme Court & High Courts (Articles 124-147, 214-231)", notes: "Advisory Jurisdiction (Art 143), Original Jurisdiction (Art 131), Appellate Jurisdiction (Art 132-134)." }
    ]
  },
  {
    id: "bns",
    title: "Bharatiya Nyaya Sanhita (BNS, 2023)",
    shortCode: "BNS",
    description: "The new penal code replacing IPC 1860. Covers offences against human body, property, state, and women.",
    category: "Criminal Law",
    modulesCount: 20,
    sectionsCount: "358",
    casesCount: "45+",
    color: "from-amber-600 to-red-900",
    popular: true,
    progress: 60,
    chapters: [
      { id: "bns-intro", title: "Introduction & Key Differences from IPC", notes: "Replaces IPC. 358 Sections compared to 511 in IPC. Introduces community service as punishment for minor offences." },
      { id: "bns-103", title: "Section 103 - Murder (Old IPC 302)", notes: "Defines punishment for murder. Special provisions for mob lynching (Section 103(2))." },
      { id: "bns-318", title: "Section 318 - Cheating (Old IPC 420)", notes: "Covers cheating and dishonestly inducing delivery of property." },
      { id: "bns-152", title: "Section 152 - Acts Endangering Sovereignty (Replaces Sedition 124A)", notes: "Explicitly removes the term 'sedition' and replaces it with acts endangering sovereignty, unity, and integrity of India." }
    ]
  },
  {
    id: "bnss",
    title: "Bharatiya Nagarik Suraksha Sanhita (BNSS, 2023)",
    shortCode: "BNSS",
    description: "Replaces Code of Criminal Procedure (CrPC 1973). Procedures for arrest, trial, bail, and investigation timelines.",
    category: "Criminal Procedure",
    modulesCount: 22,
    sectionsCount: "531",
    casesCount: "30+",
    color: "from-emerald-600 to-teal-900",
    popular: true,
    progress: 40,
    chapters: [
      { id: "bnss-fir", title: "Zero FIR & E-FIR Provisions", notes: "BNSS allows filing Zero FIR at any police station regardless of jurisdiction, and electronic FIR." },
      { id: "bnss-arrest", title: "Section 35 - Arrest of Persons (Old CrPC 41)", notes: "Mandatory permission from DySP for arresting senior citizens or persons for offences punishable under 3 years." }
    ]
  },
  {
    id: "bsa",
    title: "Bharatiya Sakshya Adhiniyam (BSA, 2023)",
    shortCode: "BSA",
    description: "Replaces Indian Evidence Act 1872. Recognition of electronic records as primary evidence.",
    category: "Evidence Law",
    modulesCount: 15,
    sectionsCount: "170",
    casesCount: "25+",
    color: "from-purple-600 to-indigo-950",
    popular: true,
    progress: 50,
    chapters: [
      { id: "bsa-electronic", title: "Section 61 - Electronic & Digital Records", notes: "Gives digital evidence equal legal standing to paper documents without mandatory physical certificate in all basic cases." }
    ]
  },
  {
    id: "contract-law",
    title: "Indian Contract Act, 1872",
    shortCode: "CONTRACT",
    description: "Offer, Acceptance, Consideration, Void Agreements, Contingent Contracts, Breach, and Damages.",
    category: "Civil Law",
    modulesCount: 16,
    sectionsCount: "238",
    casesCount: "80+",
    color: "from-sky-600 to-blue-950",
    popular: true,
    progress: 90,
    chapters: [
      { id: "offer-acceptance", title: "Essentials of a Valid Contract", notes: "Section 2(h): An agreement enforceable by law is a contract. Essential elements: Consensus ad idem, consideration, capacity, free consent." },
      { id: "consideration", title: "Section 2(d) & Section 25 - Consideration", notes: "Quid Pro Quo. Chinnaya v. Ramayya (Privy Council): Consideration may move from promisee or any other person." }
    ]
  },
  {
    id: "tort-law",
    title: "Law of Torts & Consumer Protection",
    shortCode: "TORTS",
    description: "Negligence, Defamation, Strict Liability, Vicarious Liability, Nuisance, and Consumer Protection Act 2019.",
    category: "Civil Law",
    modulesCount: 12,
    sectionsCount: "Uncodified",
    casesCount: "65+",
    color: "from-violet-600 to-purple-900",
    popular: false,
    progress: 80,
    chapters: [
      { id: "strict-absolute", title: "Rylands v. Fletcher vs M.C. Mehta", notes: "Absolute Liability created by Justice P.N. Bhagwati in M.C. Mehta (Oleum Gas Leak case) removing exceptions of Rylands v. Fletcher." }
    ]
  },
  {
    id: "family-law",
    title: "Family Law & Personal Laws",
    shortCode: "FAMILY",
    description: "Hindu Marriage Act, Special Marriage Act, Muslim Personal Law, Succession, Adoption & Guardianship.",
    category: "Personal Law",
    modulesCount: 14,
    sectionsCount: "Codified & Customary",
    casesCount: "50+",
    color: "from-rose-600 to-pink-900",
    popular: false,
    progress: 45,
    chapters: [
      { id: "hma-divorce", title: "Hindu Marriage Act 1955 - Grounds for Divorce", notes: "Section 13 (Fault grounds), Section 13B (Mutual consent). Cruelty defined in Naveen Kohli v. Neelu Kohli." }
    ]
  },
  {
    id: "company-law",
    title: "Companies Act, 2013",
    shortCode: "COMPANY",
    description: "Incorporation, Corporate Veil, Directors, Board Meetings, Share Capital, Winding Up, and NCLT.",
    category: "Corporate Law",
    modulesCount: 18,
    sectionsCount: "470",
    casesCount: "40+",
    color: "from-cyan-600 to-slate-900",
    popular: true,
    progress: 30,
    chapters: [
      { id: "corporate-veil", title: "Salomon v. Salomon & Lifting Corporate Veil", notes: "Company is a distinct legal person separate from its shareholders. Veil lifted in cases of fraud, tax evasion, and enemy character." }
    ]
  },
  {
    id: "cyber-law",
    title: "Cyber Law & IT Act, 2000",
    shortCode: "CYBER",
    description: "Information Technology Act, Cyber Crimes, Data Protection Act 2023, Digital Signatures, Section 66A strikes.",
    category: "Specialized Law",
    modulesCount: 10,
    sectionsCount: "90+",
    casesCount: "20+",
    color: "from-teal-600 to-emerald-950",
    popular: false,
    progress: 55,
    chapters: [
      { id: "shreya-singhal", title: "Shreya Singhal v. Union of India (Section 66A)", notes: "Supreme Court struck down Section 66A of IT Act as unconstitutional for violating Freedom of Speech (Art 19(1)(a))." }
    ]
  },
  {
    id: "labour-law",
    title: "Labour Codes & Industrial Relations",
    shortCode: "LABOUR",
    description: "Industrial Disputes Act, Code on Wages 2019, Social Security, Factories Act, and Workmen Compensation.",
    category: "Corporate Law",
    modulesCount: 12,
    sectionsCount: "Codified",
    casesCount: "35+",
    color: "from-orange-600 to-stone-900",
    popular: false,
    progress: 20,
    chapters: [
      { id: "industrial-dispute", title: "Bangalore Water Supply Case", notes: "Seven-judge bench defined 'Industry' broadly to include municipal boards, hospitals, and educational institutions." }
    ]
  },
  {
    id: "environmental-law",
    title: "Environmental Law & NGT Act",
    shortCode: "ENV",
    description: "Environment Protection Act 1986, Public Trust Doctrine, Polluter Pays Principle, and NGT powers.",
    category: "Public Law",
    modulesCount: 10,
    sectionsCount: "40+",
    casesCount: "45+",
    color: "from-green-600 to-emerald-900",
    popular: false,
    progress: 65,
    chapters: [
      { id: "polluter-pays", title: "Vellore Citizens Welfare Forum Case", notes: "Sustainable development, Precautionary Principle, and Polluter Pays Principle recognized as part of Article 21." }
    ]
  },
  {
    id: "ipr",
    title: "Intellectual Property Rights (IPR)",
    shortCode: "IPR",
    description: "Patents Act 1970, Copyright Act 1957, Trademarks Act 1999, Geographical Indications, and Trade Secrets.",
    category: "Specialized Law",
    modulesCount: 14,
    sectionsCount: "200+",
    casesCount: "30+",
    color: "from-fuchsia-600 to-purple-950",
    popular: true,
    progress: 50,
    chapters: [
      { id: "patent-novartis", title: "Novartis v. Union of India (Section 3(d))", notes: "SC rejected patent for Glivec, holding that incremental changes without enhanced efficacy are non-patentable." }
    ]
  },
  {
    id: "cpc",
    title: "Code of Civil Procedure (CPC, 1908)",
    shortCode: "CPC",
    description: "Pleadings, Res Judicata, Res Sub-Judice, Injunctions, Summary Suits, Execution, and Order 39 Rules 1-2.",
    category: "Civil Procedure",
    modulesCount: 20,
    sectionsCount: "158 + 51 Orders",
    casesCount: "75+",
    color: "from-blue-700 to-slate-900",
    popular: true,
    progress: 70,
    chapters: [
      { id: "res-judicata", title: "Section 11 - Res Judicata", notes: "No court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit." }
    ]
  },
  {
    id: "taxation",
    title: "Taxation Laws (Direct & GST)",
    shortCode: "TAX",
    description: "Income Tax Act 1961, Capital Gains, Assessment Procedures, CGST/SGST Act, and Appellate Tribunals.",
    category: "Commercial Law",
    modulesCount: 15,
    sectionsCount: "298",
    casesCount: "25+",
    color: "from-yellow-600 to-amber-950",
    popular: false,
    progress: 15,
    chapters: [
      { id: "income-tax-intro", title: "Heads of Income & Assessment Year vs Previous Year", notes: "5 Heads: Salaries, House Property, PGBP, Capital Gains, Other Sources." }
    ]
  },
  {
    id: "arbitration",
    title: "Arbitration & Conciliation Act, 1996",
    shortCode: "ADR",
    description: "Arbitral Agreements, Section 9 Interim Relief, Section 11 Appointment, Section 34 Setting Aside Award.",
    category: "Commercial Law",
    modulesCount: 11,
    sectionsCount: "86",
    casesCount: "35+",
    color: "from-indigo-600 to-blue-900",
    popular: true,
    progress: 85,
    chapters: [
      { id: "sec-34", title: "Section 34 - Setting Aside Arbitral Award", notes: "Limited grounds: Incapacity of party, invalid agreement, public policy violation, patent illegality." }
    ]
  }
];

export const IPC_VS_BNS_MAP = [
  { ipc: "IPC 302", ipcTitle: "Murder", bns: "BNS 103", bnsTitle: "Punishment for Murder (Includes mob lynching sub-clause)", status: "Changed Section Number" },
  { ipc: "IPC 420", ipcTitle: "Cheating and dishonestly inducing delivery of property", bns: "BNS 318", bnsTitle: "Cheating", status: "Renumbered" },
  { ipc: "IPC 124A", ipcTitle: "Sedition", bns: "BNS 152", bnsTitle: "Act endangering sovereignty, unity and integrity of India", status: "Substantially Revised" },
  { ipc: "IPC 375 / 376", ipcTitle: "Rape & Punishment", bns: "BNS 63 / 64", bnsTitle: "Rape & Punishment for Rape", status: "Renumbered & Enhanced" },
  { ipc: "IPC 304A", ipcTitle: "Causing death by negligence", bns: "BNS 106", bnsTitle: "Causing death by negligence (Strict hit-and-run penalty)", status: "Enhanced Penalty" },
  { ipc: "IPC 141 / 143", ipcTitle: "Unlawful Assembly", bns: "BNS 189", bnsTitle: "Unlawful Assembly", status: "Renumbered" },
  { ipc: "IPC 498A", ipcTitle: "Cruelty by husband or relatives", bns: "BNS 85 / 86", bnsTitle: "Cruelty against woman by husband or relative", status: "Renumbered" },
  { ipc: "IPC 307", ipcTitle: "Attempt to Murder", bns: "BNS 109", bnsTitle: "Attempt to Murder", status: "Renumbered" },
  { ipc: "IPC 378 / 379", ipcTitle: "Theft & Punishment", bns: "BNS 303", bnsTitle: "Theft", status: "Renumbered" },
  { ipc: "IPC 506", ipcTitle: "Criminal Intimidation", bns: "BNS 351", bnsTitle: "Criminal Intimidation", status: "Renumbered" }
];

export const LANDMARK_CASES = [
  {
    id: "kesavananda-bharati",
    title: "Kesavananda Bharati v. State of Kerala (1973)",
    citation: "(1973) 4 SCC 225",
    bench: "13 Judges (7:6 Majority)",
    subject: "Constitutional Law",
    keyPrinciple: "Basic Structure Doctrine",
    facts: "Petitioner challenged Kerala Land Reforms Act restricting property rights of religious matha.",
    ratio: "Parliament has wide powers to amend the Constitution under Article 368, but cannot alter or destroy its Basic Structure (Judicial review, Secularism, Federalism, Rule of Law).",
    importance: "Most celebrated judgment in Indian Constitutional history."
  },
  {
    id: "maneka-gandhi",
    title: "Maneka Gandhi v. Union of India (1978)",
    citation: "AIR 1978 SC 597",
    bench: "7 Judges",
    subject: "Constitutional Law",
    keyPrinciple: "Due Process of Law & Golden Triangle (Art 14, 19, 21)",
    facts: "Passport impounded under Passport Act without providing reasons or hearing.",
    ratio: "Procedure established by law under Art 21 must not be arbitrary, unfair or unreasonable. Articles 14, 19, and 21 are inter-connected.",
    importance: "Transformed Article 21 into an expanding horizon of human rights."
  },
  {
    id: "navtej-singh-johar",
    title: "Navtej Singh Johar v. Union of India (2018)",
    citation: "(2018) 10 SCC 1",
    bench: "5 Judges",
    subject: "Constitutional Law & Criminal Law",
    keyPrinciple: "Decriminalization of Homosexuality (Section 377)",
    facts: "Challenge to Section 377 IPC criminalizing consensual adult sexual relationships.",
    ratio: "Section 377 in so far as it penalizes consensual sexual acts between adults in private violates Art 14, 15, 19, and 21.",
    importance: "Monumental victory for LGBTQIA+ rights and constitutional morality."
  },
  {
    id: "vishaka",
    title: "Vishaka v. State of Rajasthan (1997)",
    citation: "AIR 1997 SC 3011",
    bench: "3 Judges",
    subject: "Labour & Constitutional Law",
    keyPrinciple: "Prevention of Sexual Harassment at Workplace",
    facts: "Bhanwari Devi gang rape incident exposed lack of workplace safety for women.",
    ratio: "Supreme Court laid down binding guidelines (Vishaka Guidelines) under Art 141 using CEDAW convention until Parliament enacted PoSH Act 2013.",
    importance: "Judicial law-making for gender equality at workplace."
  }
];

export const MOCK_QUIZZES = [
  {
    id: "daily-quiz-1",
    title: "Daily Practice: Constitutional Law & BNS 2023",
    timeLimit: 10, // minutes
    xpReward: 100,
    questions: [
      {
        id: 1,
        question: "Which landmark case propounded the 'Basic Structure Doctrine' in Indian Constitutional Law?",
        options: [
          "Golaknath v. State of Punjab",
          "Kesavananda Bharati v. State of Kerala",
          "Minerva Mills v. Union of India",
          "A.K. Gopalan v. State of Madras"
        ],
        correct: 1,
        explanation: "Kesavananda Bharati (1973) established by a 7:6 majority that Parliament cannot amend the basic features of the Constitution under Art 368."
      },
      {
        id: 2,
        question: "Under Bharatiya Nyaya Sanhita (BNS, 2023), which section corresponds to Murder (formerly IPC 302)?",
        options: [
          "Section 101",
          "Section 103",
          "Section 318",
          "Section 109"
        ],
        correct: 1,
        explanation: "Section 103 of BNS 2023 defines punishment for murder, replacing IPC Section 302."
      },
      {
        id: 3,
        question: "Under Article 32, who can move the Supreme Court for enforcement of Fundamental Rights?",
        options: [
          "Only Indian Citizens",
          "Any aggrieved person or public-spirited person through PIL",
          "Only Advocate Generals",
          "Only High Court Judges"
        ],
        correct: 1,
        explanation: "Article 32 is the 'Heart and Soul of the Constitution' (Dr. Ambedkar) and locus standi has been relaxed to allow PILs."
      },
      {
        id: 4,
        question: "What new form of punishment was officially introduced in Bharatiya Nyaya Sanhita (BNS) for minor offences?",
        options: [
          "Solitary Confinement",
          "Community Service",
          "Hard Labor in Mines",
          "Exile"
        ],
        correct: 1,
        explanation: "BNS introduced Community Service as a reformative punishment option for minor offences for the first time in Indian statutory penal code."
      }
    ]
  }
];

export const LEGAL_DICTIONARY = [
  { term: "Ratio Decidendi", phrase: "The reason or rationale for the decision", devanagari: "विनिश्चय आधार", definition: "The core legal principle or rule upon which a court's judgment is founded. It creates binding precedent under Article 141." },
  { term: "Obiter Dicta", phrase: "Things said by the way", devanagari: "इतरोक्ति / प्रसंगोक्ति", definition: "Remarks or observations made by a judge that are not essential to the decision and do not establish binding precedent, though persuasive." },
  { term: "Audi Alteram Partem", phrase: "Hear the other side", devanagari: "दूसरे पक्ष को भी सुनो", definition: "A fundamental principle of Natural Justice ensuring that no person shall be condemned unheard." },
  { term: "Res Judicata", phrase: "A matter already judged", devanagari: "प्राङ्न्याय", definition: "Section 11 CPC principle preventing the re-litigation of a cause of action that has already been finally decided by a competent court." },
  { term: "Amicus Curiae", phrase: "Friend of the court", devanagari: "न्यायालय मित्र", definition: "A neutral lawyer or expert appointed by the court to provide assistance on complex legal questions." },
  { term: "Habeas Corpus", phrase: "Produce the body", devanagari: "बंदी प्रत्यक्षीकरण", definition: "A constitutional writ under Art 32 / 226 issued to release a person illegally detained by state or private individuals." },
  { term: "Mens Rea", phrase: "Guilty mind", devanagari: "दुराशय", definition: "The mental element or criminal intent required to constitute a crime alongside the physical act (Actus Reus)." }
];

export const USER_STUDENT_PROFILE = {
  name: "Arjun Sharma",
  role: "LLB Student (3rd Year, NLSIU)",
  targetExam: "Judiciary Services & AIBE XIX",
  streakDays: 7,
  xp: 1450,
  level: "Senior Advocate Trainee",
  badges: [
    { title: "Consti Scholar", icon: "⚖️", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { title: "BNS Explorer", icon: "📜", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { title: "Quiz Master", icon: "🎯", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { title: "7-Day Streak", icon: "🔥", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
  ],
  strongTopics: ["Constitutional Law", "Indian Contract Act", "Law of Torts"],
  weakTopics: ["Taxation Law", "BNSS Procedures", "Companies Act 2013"],
  bookmarks: ["Article 21 Extended Horizons", "BNS Section 103 vs IPC 302", "Kesavananda Bharati Ratio Summary"]
};
