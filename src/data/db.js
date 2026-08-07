// LowStudy Relational Mock Database Engine
// Persists schema states to localStorage. Future-ready architecture.

const BASE_UNIVERSITIES = [
  { id: "gu", name: "Gujarat University", code: "GU", logo: "🏛️" },
  { id: "su", name: "Saurashtra University", code: "SU", logo: "📜" },
  { id: "vnsgu", name: "Veer Narmad South Gujarat University", code: "VNSGU", logo: "🦁" }
];

const BASE_COURSES = [
  { id: "llb", name: "Bachelor of Laws (LLB)", durationYears: 3 }
];

const BASE_SEMESTERS = [
  { id: "sem1", name: "Semester 1", num: 1 },
  { id: "sem2", name: "Semester 2", num: 2 },
  { id: "sem3", name: "Semester 3", num: 3 },
  { id: "sem4", name: "Semester 4", num: 4 },
  { id: "sem5", name: "Semester 5", num: 5 },
  { id: "sem6", name: "Semester 6", num: 6 }
];

const BASE_SUBJECTS = [
  // Semester 1
  { id: "constitutional-law-1", title: "Constitutional Law - I", shortCode: "CONST-1", semesterId: "sem1", category: "Core Law", color: "from-blue-600 to-indigo-900" },
  { id: "contract-law-1", title: "Law of Contract - I", shortCode: "CONTRACT-1", semesterId: "sem1", category: "Civil Law", color: "from-sky-600 to-blue-950" },
  { id: "tort-law", title: "Law of Torts & Consumer Protection", shortCode: "TORTS", semesterId: "sem1", category: "Civil Law", color: "from-violet-600 to-purple-900" },
  
  // Semester 2
  { id: "constitutional-law-2", title: "Constitutional Law - II", shortCode: "CONST-2", semesterId: "sem2", category: "Core Law", color: "from-indigo-600 to-indigo-950" },
  { id: "contract-law-2", title: "Law of Contract - II (Special Contracts)", shortCode: "CONTRACT-2", semesterId: "sem2", category: "Civil Law", color: "from-cyan-600 to-blue-900" },
  { id: "bns", title: "Bharatiya Nyaya Sanhita (BNS, 2023)", shortCode: "BNS", semesterId: "sem2", category: "Criminal Law", color: "from-amber-600 to-red-900" },
  
  // Semester 3
  { id: "family-law-1", title: "Family Law - I (Hindu Law)", shortCode: "FAMILY-1", semesterId: "sem3", category: "Personal Law", color: "from-rose-600 to-pink-900" },
  { id: "bnss", title: "Bharatiya Nagarik Suraksha Sanhita (BNSS)", shortCode: "BNSS", semesterId: "sem3", category: "Criminal Procedure", color: "from-emerald-600 to-teal-900" },
  
  // Semester 4
  { id: "family-law-2", title: "Family Law - II (Muslim Law & Succession)", shortCode: "FAMILY-2", semesterId: "sem4", category: "Personal Law", color: "from-pink-700 to-red-950" },
  { id: "bsa", title: "Bharatiya Sakshya Adhiniyam (BSA, 2023)", shortCode: "BSA", semesterId: "sem4", category: "Evidence Law", color: "from-purple-600 to-indigo-950" },
  { id: "environmental-law", title: "Environmental Law & NGT Act", shortCode: "ENV", semesterId: "sem4", category: "Public Law", color: "from-green-600 to-emerald-900" },
  
  // Semester 5
  { id: "cpc", title: "Code of Civil Procedure (CPC, 1908)", shortCode: "CPC", semesterId: "sem5", category: "Civil Procedure", color: "from-blue-700 to-slate-900" },
  { id: "company-law", title: "Companies Act, 2013", shortCode: "COMPANY", semesterId: "sem5", category: "Corporate Law", color: "from-cyan-600 to-slate-900" },
  { id: "ipr", title: "Intellectual Property Rights (IPR)", shortCode: "IPR", semesterId: "sem5", category: "Specialized Law", color: "from-fuchsia-600 to-purple-950" },
  
  // Semester 6
  { id: "taxation", title: "Taxation Laws (Direct & GST)", shortCode: "TAX", semesterId: "sem6", category: "Commercial Law", color: "from-yellow-600 to-amber-950" },
  { id: "arbitration", title: "Arbitration & Conciliation Act", shortCode: "ADR", semesterId: "sem6", category: "Commercial Law", color: "from-indigo-600 to-blue-900" },
  { id: "cyber-law", title: "Cyber Law & IT Act, 2000", shortCode: "CYBER", semesterId: "sem6", category: "Specialized Law", color: "from-teal-600 to-emerald-950" }
];

// Baseline syllabus content (Units & Topics mapping)
const BASE_UNITS = [
  // Semester 1
  { id: "const1-u1", subjectId: "constitutional-law-1", unitNumber: 1, title: "Historical Background & Preamble", description: "Evolution of the Constitution and the fundamental philosophy of the Preamble." },
  { id: "const1-u2", subjectId: "constitutional-law-1", unitNumber: 2, title: "Part III - Fundamental Rights (Articles 12-18)", description: "Concept of State, Judicial Review, and Rights to Equality." },
  { id: "const1-u3", subjectId: "constitutional-law-1", unitNumber: 3, title: "Part III - Freedoms & Article 21", description: "Fundamental freedoms under Article 19 and the right to life under Article 21." },
  { id: "const1-u4", subjectId: "constitutional-law-1", unitNumber: 4, title: "Constitutional Remedies", description: "Article 32 and Article 226 writ jurisdictions." },
  
  { id: "contract1-u1", subjectId: "contract-law-1", unitNumber: 1, title: "Agreement & Essentials", description: "Proposal, acceptance, intent, and formation of a valid contract." },
  { id: "contract1-u2", subjectId: "contract-law-1", unitNumber: 2, title: "Consideration & Consent", description: "Lawful consideration, capacity, and the elements of free consent." },
  
  { id: "tort-u1", subjectId: "tort-law", unitNumber: 1, title: "General Principles of Torts", description: "Definition, damnum sine injuria, injuria sine damno, and general defenses." },
  { id: "tort-u2", subjectId: "tort-law", unitNumber: 2, title: "Strict & Absolute Liability", description: "Strict liability from Rylands v. Fletcher and absolute liability under Indian law." },

  // Semester 2
  { id: "const2-u1", subjectId: "constitutional-law-2", unitNumber: 1, title: "Union Executive & Parliament", description: "Powers of the President, Prime Minister, and legislative procedures." },
  { id: "const2-u2", subjectId: "constitutional-law-2", unitNumber: 2, title: "Emergency Provisions", description: "National, State (President's Rule), and Financial emergencies." },

  { id: "contract2-u1", subjectId: "contract-law-2", unitNumber: 1, title: "Indemnity & Guarantee", description: "Definitions, differences, and liabilities of parties." },
  { id: "contract2-u2", subjectId: "contract-law-2", unitNumber: 2, title: "Bailment & Pledge", description: "Rights and duties of bailor/bailee and pledge mechanics." },

  { id: "bns-u1", subjectId: "bns", unitNumber: 1, title: "General Principles & Punishments", description: "Preliminary sections, definitions, and types of punishments under BNS 2023." },
  { id: "bns-u2", subjectId: "bns", unitNumber: 2, title: "Offences Affecting Human Body", description: "Culpable homicide, murder, mob lynching, and causing hurt." },
  { id: "bns-u3", subjectId: "bns", unitNumber: 3, title: "Offences Against Property & Women", description: "Theft, cheating, criminal trespass, and crimes against women." },

  // Semester 3
  { id: "family1-u1", subjectId: "family-law-1", unitNumber: 1, title: "Hindu Marriage Act, 1955", description: "Conditions, solemnization, and registration of Hindu marriages." },
  { id: "family1-u2", subjectId: "family-law-1", unitNumber: 2, title: "Matrimonial Remedies & Divorce", description: "Restitution of conjugal rights, judicial separation, and grounds for divorce." },

  { id: "bnss-u1", subjectId: "bnss", unitNumber: 1, title: "Investigation & Arrest", description: "Filing FIR, e-FIR, arrest procedures, and rights of arrested persons." },
  { id: "bnss-u2", subjectId: "bnss", unitNumber: 2, title: "Bail & Trials", description: "Regular bail, anticipatory bail, and the different types of trial procedures." },

  // Semester 4
  { id: "family2-u1", subjectId: "family-law-2", unitNumber: 1, title: "Muslim Law & Nikah", description: "Nature of Nikah, dower (mahr), and classification of marriages." },
  { id: "family2-u2", subjectId: "family-law-2", unitNumber: 2, title: "Talaq & Succession", description: "Talaq classifications and inheritance rules under Muslim Law." },

  { id: "bsa-u1", subjectId: "bsa", unitNumber: 1, title: "Relevancy of Facts", description: "Facts in issue, relevant facts, admissions, and confessions." },
  { id: "bsa-u2", subjectId: "bsa", unitNumber: 2, title: "Electronic Evidence", description: "Electronic and digital records as primary and secondary evidence." },

  { id: "env-u1", subjectId: "environmental-law", unitNumber: 1, title: "Constitutional Safeguards", description: "Articles 21, 48A, and 51A(g) in environmental jurisprudence." },
  { id: "env-u2", subjectId: "environmental-law", unitNumber: 2, title: "NGT Act & Principles", description: "National Green Tribunal, Sustainable Development, and Polluter Pays." },

  // Semester 5
  { id: "cpc-u1", subjectId: "cpc", unitNumber: 1, title: "Res Judicata & Jurisdiction", description: "Civil courts jurisdiction, Res Judicata (Sec 11), and Res Sub-Judice." },
  { id: "cpc-u2", subjectId: "cpc", unitNumber: 2, title: "Pleadings & Injunctions", description: "Plaint, written statement, and temporary injunctions (Order 39)." },

  { id: "company-u1", subjectId: "company-law", unitNumber: 1, title: "Corporate Personality", description: "Lifting the corporate veil and Salomon v. Salomon doctrine." },
  { id: "company-u2", subjectId: "company-law", unitNumber: 2, title: "Directors & Duties", description: "Appointment, role, and fiduciary duties of company directors." },

  { id: "ipr-u1", subjectId: "ipr", unitNumber: 1, title: "Patents & Inventions", description: "Patentability criteria, non-patentable inventions, and Section 3(d)." },
  { id: "ipr-u2", subjectId: "ipr", unitNumber: 2, title: "Copyrights & Trademarks", description: "Fair use doctrine, infringement, and registration of trademarks." },

  // Semester 6
  { id: "tax-u1", subjectId: "taxation", unitNumber: 1, title: "Direct Taxation", description: "Income Tax Act 1961, heads of income, and residential status." },
  { id: "tax-u2", subjectId: "taxation", unitNumber: 2, title: "Indirect Taxation & GST", description: "CGST/SGST framework, taxable events, and input tax credit." },

  { id: "adr-u1", subjectId: "arbitration", unitNumber: 1, title: "Arbitration Agreements", description: "ADR methods, domestic arbitration, and essential clauses." },
  { id: "adr-u2", subjectId: "arbitration", unitNumber: 2, title: "Arbitral Awards & Challenge", description: "Setting aside arbitral awards under Section 34 of the Act." },

  { id: "cyber-u1", subjectId: "cyber-law", unitNumber: 1, title: "Cyber Crimes & IT Act 2000", description: "Hacking, data theft, and free speech under Section 66A." },
  { id: "cyber-u2", subjectId: "cyber-law", unitNumber: 2, title: "Data Protection Act 2023", description: "Digital Personal Data Protection Act (DPDPA) principles and penalties." }
];

const BASE_TOPICS = [
  // Semester 1
  { id: "const1-u1-t1", unitId: "const1-u1", title: "Preamble and Basic Structure Doctrine", description: "Analysis of the Preamble as part of the Constitution and the limits of amending powers." },
  { id: "const1-u2-t1", unitId: "const1-u2", title: "Concept of State under Article 12", description: "Definition of 'State' and extension to public/private utility bodies." },
  { id: "const1-u2-t2", unitId: "const1-u2", title: "Article 14: Equality Before Law", description: "Rule of Law, reasonable classification, and non-arbitrariness doctrine." },
  { id: "const1-u3-t1", unitId: "const1-u3", title: "Article 21: Right to Life and Liberty", description: "Due process of law, expanding horizons of Article 21, and key precedents." },
  
  { id: "contract1-u1-t1", unitId: "contract1-u1", title: "Offer and Acceptance", description: "Statutory rules regarding valid proposal, communication, and revocation." },
  { id: "contract1-u2-t1", unitId: "contract1-u2", title: "Free Consent and Coercion", description: "Vitiating factors in contracts under Sections 13 to 22." },

  { id: "tort-u1-t1", unitId: "tort-u1", title: "Damnum Sine Injuria & General Defenses", description: "Understanding civil wrongs without legal injury and defenses like Volenti non fit Injuria." },
  { id: "tort-u2-t1", unitId: "tort-u2", title: "Strict and Absolute Liability", description: "Comparing strict liability in Rylands v. Fletcher and absolute liability in M.C. Mehta." },

  // Semester 2
  { id: "const2-u1-t1", unitId: "const2-u1", title: "Executive Powers of the President", description: "Constitutional position, pardoning powers, and relation with Council of Ministers." },
  { id: "const2-u2-t1", unitId: "const2-u2", title: "Article 356: Failure of State Machinery", description: "President's Rule, S.R. Bommai guidelines, and judicial review scope." },

  { id: "contract2-u1-t1", unitId: "contract2-u1", title: "Contract of Indemnity & Guarantee", description: "Section 124/126 definitions, difference, and surety's liability." },
  { id: "contract2-u2-t1", unitId: "contract2-u2", title: "Bailment & Pledge Essentials", description: "Rights and duties of parties, distinction, and pawnee rights." },

  { id: "bns-u1-t1", unitId: "bns-u1", title: "IPC to BNS Transition Overview", description: "Main changes, section renumberings, and community service introduction." },
  { id: "bns-u2-t1", unitId: "bns-u2", title: "BNS Section 103: Murder", description: "Elements of murder, comparison with IPC 302, and mob lynching provisions." },
  { id: "bns-u3-t1", unitId: "bns-u3", title: "BNS Section 318: Cheating", description: "renamed IPC 420, digital fraud inclusions, and punishment frameworks." },

  // Semester 3
  { id: "family1-u1-t1", unitId: "family1-u1", title: "Conditions for Hindu Marriage", description: "Section 5 requirements including monogamy, age limits, and sapinda relations." },
  { id: "family1-u2-t1", unitId: "family1-u2", title: "Grounds for Divorce (Section 13)", description: "Fault grounds like cruelty, desertion, and mutual consent under Sec 13B." },

  { id: "bnss-u1-t1", unitId: "bnss-u1", title: "FIR and Zero FIR (Section 173)", description: "Statutory updates, digital registration, and investigation timelines." },
  { id: "bnss-u2-t1", unitId: "bnss-u2", title: "Anticipatory Bail under Section 482", description: "Conditions for grant, comparison with old CrPC 438, and court guidelines." },

  // Semester 4
  { id: "family2-u1-t1", unitId: "family2-u1", title: "Nature and Essentials of Nikah", description: "Nikah as a civil contract, proposal/acceptance, capacity, and mahr." },
  { id: "family2-u2-t1", unitId: "family2-u2", title: "Talaq & Triple Talaq (Shayara Bano)", description: "Forms of Talaq, judicial reforms, and the Protection of Rights on Marriage Act." },

  { id: "bsa-u1-t1", unitId: "bsa-u1", title: "Confessions before Police Officers", description: "Admissibility, Section 23/24 BSA rules, and constitutional safeguards." },
  { id: "bsa-u2-t1", unitId: "bsa-u2", title: "Electronic Records (Section 61/63)", description: "Legal status of digital prints, files, chats, and certification criteria." },

  { id: "env-u1-t1", unitId: "env-u1", title: "Article 21 and Right to Clean Environment", description: "Expansion of personal liberty to environmental rights by judiciary." },
  { id: "env-u2-t1", unitId: "env-u2", title: "Principles of Environmental Protection", description: "Sustainable Development, Precautionary Principle, and Polluter Pays." },

  // Semester 5
  { id: "cpc-u1-t1", unitId: "cpc-u1", title: "Res Judicata (Section 11)", description: "Doctrine of finality of judgments, direct and constructive res judicata." },
  { id: "cpc-u2-t1", unitId: "cpc-u2", title: "Temporary Injunctions (Order 39 Rules 1-2)", description: "Prima facie case, balance of convenience, and irreparable loss guidelines." },

  { id: "company-u1-t1", unitId: "company-u1", title: "Lifting the Corporate Veil", description: "Salomon's case rules, statutory and judicial veil lifting exceptions." },
  { id: "company-u2-t1", unitId: "company-u2", title: "Directors' Fiduciary Duties", description: "Duty of care, interest disclosure, and liability for corporate wrongs." },

  { id: "ipr-u1-t1", unitId: "ipr-u1", title: "Section 3(d) of Patents Act", description: "Evergreening prevention, efficacy tests, and Novartis landmark case." },
  { id: "ipr-u2-t1", unitId: "ipr-u2", title: "Fair Dealing in Copyright Law", description: "Statutory exceptions to infringement for research, teaching, and criticism." },

  // Semester 6
  { id: "tax-u1-t1", unitId: "tax-u1", title: "Residential Status of Individual", description: "Criteria under Section 6 of Income Tax Act and tax liability incidence." },
  { id: "tax-u2-t1", unitId: "tax-u2", title: "GST Framework & Supply", description: "Dual GST, CGST/SGST/IGST, taxable event 'Supply' under Section 7." },

  { id: "adr-u1-t1", unitId: "adr-u1", title: "Arbitration Agreement Essentials", description: "Section 7 requirements, writing form, signature, and referral under Section 8." },
  { id: "adr-u2-t1", unitId: "adr-u2", title: "Section 34: Recourse against Award", description: "Grounds for setting aside arbitral awards, public policy, and patent illegality." },

  { id: "cyber-u1-t1", unitId: "cyber-u1", title: "Section 66A IT Act and Free Speech", description: "Shreya Singhal v. Union of India and strike-down of vague criminal offenses." },
  { id: "cyber-u2-t1", unitId: "cyber-u2", title: "DPDP Act 2023 Principles", description: "Data Principal rights, Fiduciary obligations, consent frameworks, and penalties." }
];

const BASE_NOTES = [
  {
    id: "note-const1-u1-t1",
    topicId: "const1-u1-t1",
    simpleNotes: "The Preamble is the introductory statement of the Constitution which sets out its goals, values, and principles. The Basic Structure Doctrine limits Parliament's amending powers under Article 368. It prevents Parliament from changing fundamental features like Democracy, Secularism, and Judicial Review.",
    detailedNotes: "The Preamble represents the soul of the Indian Constitution, as outlined in the landmark Berubari Union Case (1960) and later redefined in Kesavananda Bharati v. State of Kerala (1973). The Kesavananda case established by a 7:6 majority that while Article 368 gives Parliament broad power to amend the constitution, this power cannot be used to damage, alter or destroy its 'Basic Structure' (fundamental pillars such as Democracy, Rule of Law, Separation of Powers, and Federalism).",
    examples: [
      "If Parliament passes a law making India a monarchy instead of a republic, this law would violate the Basic Structure and be declared void by the judiciary.",
      "Amending Article 368 to completely remove Judicial Review violates the Basic Structure."
    ],
    flowcharts: [
      "Parliament Power (Art 368) ➔ Subject to Judicial Review ➔ Cannot destroy Basic Structure (Secularism, Rule of Law, Republic)"
    ],
    importantPoints: [
      "The Preamble is part of the Indian Constitution.",
      "The Preamble cannot be used to override clear provisions of the constitution, but helps resolve ambiguity.",
      "Basic Structure list is not exhaustive and is defined case-by-case by the SC."
    ],
    examTips: [
      "Always start basic structure questions by citing Kesavananda Bharati (1973) 4 SCC 225.",
      "Mention the 13-judge bench size (largest in Indian history) and the 7:6 ratio."
    ],
    faqs: [
      { q: "Is the Preamble enforceable in a court of law?", a: "No, the Preamble is non-justiciable. It cannot be directly enforced, but is used to interpret constitutional provisions." },
      { q: "Has the Preamble ever been amended?", a: "Yes, once. By the 42nd Amendment Act (1976), adding the words 'Socialist', 'Secular', and 'Integrity'." }
    ]
  },
  {
    id: "note-contract1-u1-t1",
    topicId: "contract1-u1-t1",
    simpleNotes: "An offer (proposal) is made when one person shows willingness to do or not do something to get another's approval. Acceptance happens when that other person says yes. Communication of both is vital.",
    detailedNotes: "Section 2(a) Indian Contract Act: A person makes a proposal when they signify to another their willingness to do or abstain from doing anything, with a view to obtaining the assent of that other. Section 2(b) defines acceptance. The communication of a proposal is complete when it comes to the knowledge of the person to whom it is made (Section 4).",
    examples: [
      "A offers to sell his watch to B. The contract is formed when B communicates acceptance.",
      "Carlill v. Carbolic Smoke Ball Co: Advertisement offering reward is a general offer."
    ],
    flowcharts: [
      "Proposal (Sec 2a) ➔ Communicated ➔ Accepted (Sec 2b) = Agreement ➔ Enforceable (Sec 2h) = Contract"
    ],
    importantPoints: [
      "An invitation to offer (e.g., catalog) is not an offer.",
      "Acceptance must be absolute and unqualified (Sec 7)."
    ],
    examTips: [
      "Cite Lalman Shukla v. Gauri Datt for the rule that proposal must be known to offeree before acceptance."
    ],
    faqs: [
      { q: "Is a display of goods in a shop window an offer?", a: "No, it is an invitation to treat/offer. Customer makes the offer at the counter." }
    ]
  },
  {
    id: "note-tort-u1-t1",
    topicId: "tort-u1-t1",
    simpleNotes: "Torts are civil wrongs. 'Damnum Sine Injuria' means damage without legal injury (not actionable). 'Injuria Sine Damno' means legal injury without actual damage (actionable).",
    detailedNotes: "Torts is uncodified civil wrong. Ashby v. White established Injuria sine damno (refusal of vote is actionable even if candidate won). Gloucester Grammar School established Damnum sine injuria (setting up competing school reduces profits but doesn't violate legal rights).",
    examples: [
      "Gloucester Grammar case: Financial loss from competitor is not actionable.",
      "Ashby v. White: Denial of voting right is actionable."
    ],
    flowcharts: [
      "Wrongful Act ➔ Legal Injury? (Yes ➔ Injuria Sine Damno ➔ Actionable) (No ➔ Damnum Sine Injuria ➔ Not Actionable)"
    ],
    importantPoints: [
      "Damnum means physical/monetary loss.",
      "Injuria means violation of legal right."
    ],
    examTips: [
      "Always quote Gloucester Grammar case and Ashby v. White."
    ],
    faqs: [
      { q: "What are general defenses in torts?", a: "Volenti non fit injuria, Act of God, Private Defense, Statutory Authority." }
    ]
  },
  {
    id: "note-const2-u1-t1",
    topicId: "const2-u1-t1",
    simpleNotes: "The President is the constitutional head of executive. Emergency powers are under Article 352, 356, and 360.",
    detailedNotes: "Article 356 deals with President's Rule in case of failure of constitutional machinery in states. In S.R. Bommai v. Union of India (1994), the SC ruled that the proclamation under Art 356 is subject to judicial review to prevent political abuse.",
    examples: [
      "Proclamation under Art 356 dissolved state assembly. Supreme Court can declare it invalid if based on mala fide reasons."
    ],
    flowcharts: [
      "State Machinery Fails ➔ Governor Report / Presidential Satisfaction ➔ Art 356 Proclamation ➔ Judicial Review"
    ],
    importantPoints: [
      "Emergency must be approved by Parliament.",
      "Secularism was declared a basic structure in Bommai's case."
    ],
    examTips: [
      "Explain S.R. Bommai guidelines on the floor test requirement."
    ],
    faqs: [
      { q: "Can fundamental rights be suspended during emergency?", a: "Article 20 and 21 cannot be suspended even during a National Emergency under Article 352." }
    ]
  },
  {
    id: "note-contract2-u1-t1",
    topicId: "contract2-u1-t1",
    simpleNotes: "Indemnity (Sec 124) is saving a person from loss. Guarantee (Sec 126) is promising to perform if a third party defaults.",
    detailedNotes: "Contract of Indemnity has 2 parties (Indemnifier, Indemnified). Contract of Guarantee has 3 parties (Surety, Principal Debtor, Creditor). Surety's liability is co-extensive with principal debtor (Section 128) unless otherwise provided.",
    examples: [
      "A promises to pay B if B's house is damaged by fire (Indemnity).",
      "A guarantees bank that if B doesn't repay loan, A will pay (Guarantee)."
    ],
    flowcharts: [
      "Guarantee: Creditor ➔ Principal Debtor (Primary Liability) ➔ Surety (Secondary Liability)"
    ],
    importantPoints: [
      "Indemnity requires a loss; Guarantee requires a default.",
      "Surety's liability is joint and several."
    ],
    examTips: [
      "Outline the three-party relationship in Guarantee with a small triangle diagram."
    ],
    faqs: [
      { q: "Is consideration necessary for a contract of guarantee?", a: "Yes, under Section 127, anything done or promise made for the benefit of principal debtor is sufficient consideration for surety." }
    ]
  },
  {
    id: "note-bns-u2-t1",
    topicId: "bns-u2-t1",
    simpleNotes: "BNS Section 103 defines the offence and punishment of Murder, which was previously IPC Section 302. Punishment is death penalty or life imprisonment and a fine. It also includes explicit punishments for Mob Lynching.",
    detailedNotes: "Section 103 of Bharatiya Nyaya Sanhita (BNS) 2023 replaces the historical Section 302 of IPC 1860. Section 103(1) states that whoever commits murder shall be punished with death or life imprisonment, and fine. Crucially, Section 103(2) introduces a new provision targeting Mob Lynching: when a group of 5 or more persons commits murder on grounds of race, caste, community, sex, place of birth, language or personal belief, each member is punished with death or life imprisonment.",
    examples: [
      "A poisons B's food with the intent to cause B's death. B dies. A has committed murder under BNS 103(1).",
      "A mob of 6 people attacks and kills a person over their religious beliefs. All participants are liable to death/life imprisonment under BNS 103(2)."
    ],
    flowcharts: [
      "Culpable Homicide (Sec 100 BNS) ➔ Escalates to Murder (Sec 103 BNS) if elements of intentional death are met ➔ Punished under Sec 103(1) or 103(2)"
    ],
    importantPoints: [
      "Replaces IPC Section 302.",
      "Death penalty application is governed by the 'Rarest of Rare Cases' doctrine.",
      "Explicitly codifies group mob violence / lynching."
    ],
    examTips: [
      "Cite Bachan Singh v. State of Punjab (1980) for the 'Rarest of Rare Cases' guidelines which still apply under BNS 103."
    ],
    faqs: [
      { q: "What is the difference between Section 103(1) and 103(2)?", a: "Section 103(1) applies to individual murder, while Section 103(2) applies specifically to mob lynching by 5 or more persons based on discriminatory factors." }
    ]
  },
  {
    id: "note-family1-u1-t1",
    topicId: "family1-u1-t1",
    simpleNotes: "Conditions of a valid marriage under Hindu Law are in Section 5 HMA. Grounds for divorce are in Section 13 HMA.",
    detailedNotes: "Section 5 of the Hindu Marriage Act, 1955 outlines conditions: Monogamy, sound mind, age (21 for groom, 18 for bride), not within degrees of sapinda/prohibited relationship. Section 13 outlines grounds for divorce such as Cruelty, Desertion (2 years), and Mutual Consent (Section 13B).",
    examples: [
      "A marries B when his first wife C is still alive. The marriage is void under Section 11 as it violates Section 5(i)."
    ],
    flowcharts: [
      "HMA Section 5 conditions met? (Yes ➔ Valid Marriage) (No ➔ Void under Sec 11 or Voidable under Sec 12)"
    ],
    importantPoints: [
      "Sapinda marriage is void unless custom allows.",
      "Desertion requires animus deserendi."
    ],
    examTips: [
      "State that Dastane v. Dastane is the landmark case establishing the definition of mental cruelty."
    ],
    faqs: [
      { q: "What is the cooling period in mutual consent divorce?", a: "6 months under Section 13B(2), which can be waived in exceptional cases by the court." }
    ]
  },
  {
    id: "note-bnss-u1-t1",
    topicId: "bnss-u1-t1",
    simpleNotes: "BNSS 2023 replaces CrPC. Section 173 deals with FIR registration, and codifies Zero FIR and electronic FIR.",
    detailedNotes: "Section 173 of BNSS 2023 replaces Section 154 of CrPC. It formally codifies the concept of 'Zero FIR' (filing FIR anywhere irrespective of jurisdiction) and allows information to be sent electronically (e-FIR), which must be signed by the informant within 3 days.",
    examples: [
      "A theft happens in Ahmedabad, but the victim files an FIR in Surat. Police register a Zero FIR and transfer the case to Ahmedabad."
    ],
    flowcharts: [
      "Cognizable Offence ➔ Informant files info at any station ➔ Zero FIR registered (assigned '0') ➔ Transferred to jurisdiction"
    ],
    importantPoints: [
      "Zero FIR was recommended by Justice Verma Committee.",
      "Investigation timelines are strictly codified under BNSS."
    ],
    examTips: [
      "Always start BNSS questions by pointing out its transition from CrPC."
    ],
    faqs: [
      { q: "Does electronic FIR need signature?", a: "Yes, it must be signed by the informant within 3 days for it to be treated as an official FIR." }
    ]
  },
  {
    id: "note-family2-u1-t1",
    topicId: "family2-u1-t1",
    simpleNotes: "Nikah is a civil contract under Muslim Law. It requires offer (ijab) and acceptance (qabul) in a single meeting.",
    detailedNotes: "Unlike Hindu marriage which is a sacrament, Muslim marriage (Nikah) is a civil contract. Essentials: Capacity (puberty/sanity), consent, offer/acceptance in one sitting (ijab-o-qabul), presence of witnesses (Suni requires 2, Shia requires none at contract but at divorce), and payment of dower (mahr).",
    examples: [
      "A proposes to B in a meeting, B accepts in the same meeting with witnesses present. This forms a valid Nikah."
    ],
    flowcharts: [
      "Proposal (Ijab) + Acceptance (Qabul) in one sitting + Dower (Mahr) + Witnesses = Valid Nikah"
    ],
    importantPoints: [
      "Mahr is not a bride price, but a mark of respect and security.",
      "Mut'ah is a temporary marriage allowed only in Shia law."
    ],
    examTips: [
      "Highlight the contract characteristics of Muslim marriage (e.g., possibility of dissolution, prenuptial terms)."
    ],
    faqs: [
      { q: "What is Mahr?", a: "Mahr is sum of money or property that the bride is entitled to receive from the groom in consideration of marriage." }
    ]
  },
  {
    id: "note-bsa-u1-t1",
    topicId: "bsa-u1-t1",
    simpleNotes: "BSA 2023 replaces Indian Evidence Act. Confessions to police are generally inadmissible unless leading to a discovery.",
    detailedNotes: "Section 23 of BSA 2023 (replacing Section 25 of IEA) states confessions to police are not admissible. However, under Section 24 BSA (replacing Section 27 IEA), if a fact is discovered in consequence of information received from an accused, that part of the information is admissible.",
    examples: [
      "Accused tells police 'I killed B and hid the knife under the bridge.' If police find the knife there, only the discovery part is admissible."
    ],
    flowcharts: [
      "Accused Confession to Police ➔ Inadmissible ➔ Leads to Discovery? ➔ Yes (Discovery and source info admissible)"
    ],
    importantPoints: [
      "Confession must be voluntary.",
      "Exclusionary rules prevent custodial torture."
    ],
    examTips: [
      "Cite Pulukuri Kottaya v. Emperor for the scope of Section 27 IEA (now Section 24 BSA)."
    ],
    faqs: [
      { q: "Why are police confessions excluded?", a: "To safeguard accused rights against coercion, threat, or promise by police authorities." }
    ]
  },
  {
    id: "note-env-u1-t1",
    topicId: "env-u1-t1",
    simpleNotes: "Article 21 (Right to life) has been expanded by judiciary to include the right to a clean and healthy environment.",
    detailedNotes: "Under Indian Constitution, Article 48A directs state to protect environment, and Art 51A(g) mandates citizens to protect nature. The Supreme Court in Subhash Kumar v. State of Bihar (1991) declared that Right to Clean Environment is part of the Fundamental Right to Life under Article 21.",
    examples: [
      "Discharge of toxic fumes near residential areas violates the residents' Right to Life under Article 21."
    ],
    flowcharts: [
      "Article 21 ➔ Expanded by Judiciary ➔ Right to Pollution-free Water & Air ➔ Enforceable via Writ petitions"
    ],
    importantPoints: [
      "Public interest litigation (PIL) is the main vehicle for environmental justice.",
      "NGT has power of civil courts to adjudicate environmental disputes."
    ],
    examTips: [
      "Cite Subhash Kumar (1991) and M.C. Mehta v. Union of India (Ganga Pollution Case) in your answer."
    ],
    faqs: [
      { q: "What is the Polluter Pays Principle?", a: "It dictates that the cost of pollution prevention, control and cleanup should be borne by the polluter." }
    ]
  },
  {
    id: "note-cpc-u1-t1",
    topicId: "cpc-u1-t1",
    simpleNotes: "Res Judicata (Section 11 CPC) stops a court from trying a case that has already been decided between the same parties.",
    detailedNotes: "Section 11 of the Civil Procedure Code, 1908 incorporates the doctrine of Res Judicata. It prevents multiple suits on the same matter to ensure finality of litigation and prevent harassment of parties. It applies when the matter was directly and substantially in issue in a former suit between the same parties.",
    examples: [
      "A sues B for rent. Suit is dismissed. A cannot file another suit against B claiming the same rent for the same period."
    ],
    flowcharts: [
      "Suit Filed ➔ Same Parties & Matter? ➔ Already decided by competent court? ➔ Yes (Res Judicata applies, suit dismissed)"
    ],
    importantPoints: [
      "Based on: Nemo debet bis vexari (no one should be vexed twice for the same cause).",
      "Constructive Res Judicata (Explanation IV) applies to pleas that might and ought to have been raised."
    ],
    examTips: [
      "Explain the distinction between Res Judicata (Section 11) and Res Sub-Judice (Section 10)."
    ],
    faqs: [
      { q: "Does Res Judicata apply to writ petitions?", a: "Yes, Daryao v. State of UP established that Res Judicata applies to writ petitions on public policy grounds." }
    ]
  },
  {
    id: "note-company-u1-t1",
    topicId: "company-u1-t1",
    simpleNotes: "A company has a separate legal identity from its owners. In cases of fraud, courts can 'lift the corporate veil' to hold individuals liable.",
    detailedNotes: "The corporate entity is a separate person in law, established in Salomon v. Salomon (1897). However, when the corporate structure is used for fraudulent purposes, tax evasion, or to evade legal obligations, the courts can disregard this separate personality ('lifting the corporate veil') as seen in Daimler Co. Ltd v. Continental Tyre Co.",
    examples: [
      "Sole director transfers assets to a new company to avoid a court injunction. The court will lift the veil and block the new company."
    ],
    flowcharts: [
      "Company Entity ➔ Separate Legal Person (Salomon Rule) ➔ Fraud/Tax Evasion? ➔ Yes (Lift Veil, hold individuals liable)"
    ],
    importantPoints: [
      "VEIL is a protection for honest businesses.",
      "Veil can be lifted statutorily (Companies Act) or judicially (courts)."
    ],
    examTips: [
      "Always quote Salomon v. Salomon and describe the facts of the boot-making business."
    ],
    faqs: [
      { q: "What is the corporate veil?", a: "The legal barrier that separates a corporation's actions, rights and liabilities from those of its shareholders and directors." }
    ]
  },
  {
    id: "note-ipr-u1-t1",
    topicId: "ipr-u1-t1",
    simpleNotes: "Section 3(d) of Patents Act prevents patenting incremental changes of known substances unless they show enhanced efficacy.",
    detailedNotes: "Section 3 of the Patents Act, 1970 lists non-patentable inventions. Section 3(d) prevents the 'evergreening' of patents (extending monopoly by making minor modifications). In Novartis v. Union of India (2013), the Supreme Court rejected the patent for Glivec because the beta-crystalline form was just a new form of a known substance without increased therapeutic efficacy.",
    examples: [
      "A pharmaceutical company changes a drug formula to a salt form without showing it cures patients better. Section 3(d) bars patenting."
    ],
    flowcharts: [
      "New Form of Known Substance ➔ Significant Increase in Efficacy? ➔ Yes (Patentable) ➔ No (Section 3(d) bars patent)"
    ],
    importantPoints: [
      "Prevents evergreening of drug patents.",
      "Ensures affordable access to life-saving generic medicines in India."
    ],
    examTips: [
      "State the full ratio of Novartis v. Union of India (2013) on 'therapeutic efficacy'."
    ],
    faqs: [
      { q: "What is patent evergreening?", a: "The practice of obtaining multiple patents on minor modifications of a single drug to maintain monopoly beyond 20 years." }
    ]
  },
  {
    id: "note-tax-u1-t1",
    topicId: "tax-u1-t1",
    simpleNotes: "Tax liability depends on residential status, not citizenship. An individual is Resident if present for 182+ days in a year.",
    detailedNotes: "Section 6 of the Income Tax Act, 1961 defines residential status. An individual is a 'Resident' in India in any previous year if they: (a) reside for 182 days or more in that year, or (b) reside for 60 days or more in that year and 365 days or more in the 4 preceding years. Residents are taxed on global income.",
    examples: [
      "A US citizen stays in India for 190 days in 2025. They are a Resident in India and liable to tax under Indian Income Tax Act."
    ],
    flowcharts: [
      "Days in India >= 182? (Yes ➔ Resident) (No ➔ Check 60 days + 365 days in 4 years rule ➔ Yes = Resident, No = Non-Resident)"
    ],
    importantPoints: [
      "Residential status is determined for each financial year.",
      "Citizenship is irrelevant for tax incidence."
    ],
    examTips: [
      "Remember the modifications to the 60-day rule for Indian citizens leaving for employment abroad (changed to 182 days)."
    ],
    faqs: [
      { q: "What is global income tax liability?", a: "Tax liability on income earned anywhere in the world, applicable to Resident and Ordinarily Resident (ROR) taxpayers in India." }
    ]
  },
  {
    id: "note-adr-u1-t1",
    topicId: "adr-u1-t1",
    simpleNotes: "An arbitration agreement (Section 7) must be in writing. It records the parties' agreement to submit disputes to arbitration.",
    detailedNotes: "Section 7 of the Arbitration and Conciliation Act, 1996 defines an arbitration agreement as an agreement by parties to submit to arbitration all or certain disputes. It must be in writing, which includes exchange of letters, telex, telegrams, or electronic communications.",
    examples: [
      "A contract clause stating 'Any dispute arising out of this contract shall be referred to arbitration in Mumbai' is a valid agreement."
    ],
    flowcharts: [
      "Written Clause in Contract / Letter exchange ➔ Consent to refer disputes ➔ Valid Arbitration Agreement (Sec 7)"
    ],
    importantPoints: [
      "Must be in writing (oral agreement is invalid).",
      "Separability doctrine: Arbitration clause survives termination of the main contract."
    ],
    examTips: [
      "Cite Section 8 CPC/Arbitration Act which mandates civil courts to refer parties to arbitration if a valid agreement exists."
    ],
    faqs: [
      { q: "Can an exchange of emails constitute an arbitration agreement?", a: "Yes, electronic communication is explicitly recognized as a written agreement under Section 7(4)(b)." }
    ]
  },
  {
    id: "note-cyber-u1-t1",
    topicId: "cyber-u1-t1",
    simpleNotes: "Section 66A of the IT Act criminalized sending offensive messages. The Supreme Court struck it down as it violated Freedom of Speech.",
    detailedNotes: "Section 66A of the Information Technology Act, 2000 prescribed punishment for sending offensive messages through communication services. Due to vague terms and misuse, the SC in Shreya Singhal v. Union of India (2015) struck it down as unconstitutional, holding it violates Article 19(1)(a) and is not saved by Article 19(2).",
    examples: [
      "An individual posts criticism of a politician on Facebook. Under the struck-down Sec 66A, police arrested such users, which is now illegal."
    ],
    flowcharts: [
      "Section 66A IT Act (Offensive posts criminalized) ➔ Struck down in Shreya Singhal (2015) ➔ Protected under Art 19(1)(a)"
    ],
    importantPoints: [
      "Struck down completely in 2015.",
      "Establishes limits on state censorship of the internet."
    ],
    examTips: [
      "Understand the doctrines of Vagueness and Overbreadth cited in Shreya Singhal."
    ],
    faqs: [
      { q: "Is Section 66A still in use?", a: "Legally no, it was declared void ab initio. However, police sometimes mistakenly cite it, which the SC has strongly condemned." }
    ]
  }
];

const BASE_MCQS = [
  { id: 1, topicId: "const1-u1-t1", question: "Which landmark case established the 'Basic Structure Doctrine' in India?", options: ["Golaknath Case", "Kesavananda Bharati Case", "Minerva Mills Case", "Maneka Gandhi Case"], correctIndex: 1, difficulty: "easy", explanation: "Kesavananda Bharati v. State of Kerala (1973) is the seminal case that propounded the Basic Structure Doctrine." },
  { id: 2, topicId: "const1-u1-t1", question: "How many judges sat on the bench of the Kesavananda Bharati case?", options: ["9", "11", "13", "7"], correctIndex: 2, difficulty: "medium", explanation: "A historic 13-judge constitutional bench heard the Kesavananda case, deciding the matter with a 7:6 majority." },
  { id: 3, topicId: "const1-u1-t1", question: "Which of the following is NOT part of the Basic Structure list as defined by the Supreme Court?", options: ["Judicial Review", "Secularism", "Absolute Right to Private Property", "Rule of Law"], correctIndex: 2, difficulty: "hard", explanation: "The absolute right to private property was explicitly removed from the Fundamental Rights and is NOT part of the Basic Structure." },
  
  { id: 4, topicId: "bns-u2-t1", question: "Which section of the BNS 2023 prescribes punishment for Murder?", options: ["Section 302", "Section 103", "Section 101", "Section 318"], correctIndex: 1, difficulty: "easy", explanation: "Section 103 of BNS 2023 replaces IPC Section 302 for the punishment of murder." },
  { id: 5, topicId: "bns-u2-t1", question: "Under BNS Section 103(2), mob lynching requires a group of how many persons?", options: ["2 or more", "3 or more", "5 or more", "10 or more"], correctIndex: 2, difficulty: "medium", explanation: "BNS Section 103(2) specifies that mob lynching provisions are triggered when a group of 5 or more persons act in concert." },

  { id: 6, topicId: "contract1-u1-t1", question: "Which section of the Indian Contract Act defines proposal/offer?", options: ["Section 2(a)", "Section 2(b)", "Section 2(h)", "Section 4"], correctIndex: 0, difficulty: "easy", explanation: "Section 2(a) states that when one person signifies willingness to another, it is a proposal." },
  { id: 7, topicId: "contract1-u1-t1", question: "In which case was it held that a general offer can be accepted by anyone fulfilling the conditions?", options: ["Lalman Shukla", "Carlill v. Carbolic Smoke Ball", "Balfour v. Balfour", "Felthouse v. Bindley"], correctIndex: 1, difficulty: "medium", explanation: "Carlill v. Carbolic Smoke Ball Co. established that general offers can be accepted by performance of terms." },

  { id: 8, topicId: "tort-u1-t1", question: "Which doctrine means 'legal injury without actual damage'?", options: ["Damnum Sine Injuria", "Injuria Sine Damno", "Volenti Non Fit Injuria", "Res Ipsa Loquitur"], correctIndex: 1, difficulty: "easy", explanation: "Injuria Sine Damno is legal injury without actual damage, which is actionable." },
  { id: 9, topicId: "tort-u2-t1", question: "Which landmark Indian case established the doctrine of Absolute Liability?", options: ["Rylands v. Fletcher", "M.C. Mehta v. Union of India", "Ashby v. White", "Donoghue v. Stevenson"], correctIndex: 1, difficulty: "medium", explanation: "M.C. Mehta v. Union of India (1987) established absolute liability for hazardous enterprises, with no exceptions." },

  { id: 10, topicId: "const2-u1-t1", question: "Which article deals with the President's power to grant pardons?", options: ["Article 72", "Article 52", "Article 123", "Article 356"], correctIndex: 0, difficulty: "easy", explanation: "Article 72 empowers the President to grant pardons, reprieves, respites or remissions of punishment." },
  { id: 11, topicId: "const2-u2-t1", question: "In which case did the Supreme Court hold that state government dismissal is subject to judicial review?", options: ["Kesavananda Bharati", "S.R. Bommai v. Union of India", "Minerva Mills", "Sajjan Singh"], correctIndex: 1, difficulty: "medium", explanation: "S.R. Bommai v. Union of India (1994) is the authority on restrictions of Article 356." },

  { id: 12, topicId: "contract2-u1-t1", question: "In a contract of guarantee, the liability of a surety is:", options: ["Primary", "Co-extensive with principal debtor", "Voidable", "None of the above"], correctIndex: 1, difficulty: "easy", explanation: "Section 128 states that the liability of the surety is co-extensive with that of the principal debtor." },

  { id: 13, topicId: "family1-u1-t1", question: "Monogamy is mandated for a valid Hindu marriage under which section of HMA?", options: ["Section 5(i)", "Section 5(ii)", "Section 9", "Section 13"], correctIndex: 0, difficulty: "easy", explanation: "Section 5(i) states that neither party should have a spouse living at the time of marriage." },

  { id: 14, topicId: "bnss-u1-t1", question: "Which section of BNSS 2023 allows registering an electronic FIR (e-FIR)?", options: ["Section 154", "Section 173", "Section 41", "Section 35"], correctIndex: 1, difficulty: "easy", explanation: "Section 173 of BNSS 2023 replaces CrPC 154 and formally introduces electronic registration." },

  { id: 15, topicId: "family2-u1-t1", question: "Nature of Muslim marriage (Nikah) is best described as:", options: ["Sacrament", "Civil Contract", "Co-ownership", "Indissoluble bond"], correctIndex: 1, difficulty: "easy", explanation: "Muslim marriage is a civil contract entered into for the legalization of sexual intercourse and procreation." },

  { id: 16, topicId: "bsa-u2-t1", question: "Which section of BSA 2023 outlines admissibility of electronic records?", options: ["Section 65B", "Section 61", "Section 63", "Section 3"], correctIndex: 1, difficulty: "medium", explanation: "Section 61 of BSA 2023 defines the admissibility of electronic evidence." },

  { id: 17, topicId: "env-u1-t1", question: "Which Supreme Court judgment declared the right to a clean environment under Article 21?", options: ["Subhash Kumar v. State of Bihar", "Bachan Singh", "Lalita Kumari", "Dastane v. Dastane"], correctIndex: 0, difficulty: "easy", explanation: "Subhash Kumar v. State of Bihar (1991) explicitly recognized this right." },

  { id: 18, topicId: "cpc-u1-t1", question: "Which section of CPC deals with Res Judicata?", options: ["Section 9", "Section 10", "Section 11", "Section 12"], correctIndex: 2, difficulty: "easy", explanation: "Section 11 of CPC incorporates the doctrine of Res Judicata." },

  { id: 19, topicId: "company-u1-t1", question: "Which case established the separate legal personality of a company?", options: ["Salomon v. Salomon", "Daimler Co.", "Lee v. Lee's Air Farming", "M.C. Mehta"], correctIndex: 0, difficulty: "easy", explanation: "Salomon v. Salomon & Co. Ltd. is the foundational case on corporate personality." },

  { id: 20, topicId: "ipr-u1-t1", question: "Which section of the Patents Act prevents patent 'evergreening'?", options: ["Section 3(d)", "Section 2(1)(j)", "Section 25", "Section 48"], correctIndex: 0, difficulty: "medium", explanation: "Section 3(d) denies patents for incremental changes without enhanced therapeutic efficacy." },

  { id: 21, topicId: "tax-u1-t1", question: "To be a Resident of India, an individual must stay for at least how many days in the previous year?", options: ["182 days", "60 days", "365 days", "120 days"], correctIndex: 0, difficulty: "easy", explanation: "Under Section 6(1), staying for 182 days or more makes an individual a Resident." },

  { id: 22, topicId: "adr-u2-t1", question: "Which section of the Arbitration Act allows recourse against an arbitral award?", options: ["Section 9", "Section 11", "Section 34", "Section 37"], correctIndex: 2, difficulty: "easy", explanation: "Section 34 provides grounds and procedure for setting aside an arbitral award." },

  { id: 23, topicId: "cyber-u1-t1", question: "Which case struck down Section 66A of the IT Act, 2000?", options: ["Shreya Singhal v. Union of India", "Vishaka v. State of Rajasthan", "Maneka Gandhi", "Navtej Johar"], correctIndex: 0, difficulty: "easy", explanation: "Shreya Singhal v. Union of India (2015) struck down Section 66A as unconstitutional." }
];

const BASE_CASE_LAWS = [
  {
    id: "kesavananda",
    topicId: "const1-u1-t1",
    title: "Kesavananda Bharati v. State of Kerala (1973)",
    citation: "(1973) 4 SCC 225",
    bench: "13 Judges (7:6 Majority)",
    subject: "Constitutional Law",
    keyPrinciple: "Basic Structure Doctrine",
    facts: "The head of a Hindu matha challenged land reform acts in Kerala which limited the matha's property rights under Articles 25, 26, 14, 19(1)(f), and 31.",
    issues: "Whether the power of Parliament to amend the Constitution under Article 368 is absolute or limited.",
    arguments: [
      "Petitioners argued that amending power does not allow destroying the fundamental identity of the constitution.",
      "The State argued that the power of parliament under Article 368 is unlimited and supreme."
    ],
    judgment: "The Supreme Court held that while Parliament can amend any part of the Constitution including Fundamental Rights, it cannot amend or destroy the Basic Structure of the Constitution.",
    ratio: "Amending power does not include power to destroy the essential identity and core principles of the constitution.",
    importance: "Widely regarded as the savior of constitutional democracy in India."
  },
  {
    id: "c-lalman",
    topicId: "contract1-u1-t1",
    title: "Lalman Shukla v. Gauri Datt (1913)",
    citation: "(1913) 11 ALJ 489",
    bench: "Allahabad High Court",
    subject: "Law of Contract",
    keyPrinciple: "Knowledge of Offer is Essential for Acceptance",
    facts: "Gauri Datt's nephew went missing. Gauri Datt sent Lalman to search. Later, Gauri Datt announced Rs 501 reward. Lalman found the boy without knowing the reward. He later claimed it.",
    issues: "Can a person claim a reward without knowing it was offered?",
    arguments: [
      "Plaintiff argued that since he performed the service, he is entitled to the reward.",
      "Defendant argued there was no contract as there was no offer communicated to plaintiff."
    ],
    judgment: "No contract was created. You cannot accept an offer you do not know exists.",
    ratio: "Meeting of minds and communication of proposal is an absolute prerequisite for a valid agreement.",
    importance: "Classic case on formation of contract and consensus ad idem."
  },
  {
    id: "c-mcmehta",
    topicId: "tort-u2-t1",
    title: "M.C. Mehta v. Union of India (1987)",
    citation: "AIR 1987 SC 1086",
    bench: "5 Judges (CJI P.N. Bhagwati)",
    subject: "Law of Torts",
    keyPrinciple: "Absolute Liability Doctrine",
    facts: "Oleum gas leak from Shriram Food and Fertilizers factory in Delhi killed one advocate and injured thousands.",
    issues: "Is the rule in Rylands v. Fletcher with its exceptions applicable in modern industrial India?",
    arguments: [
      "Enterprise argued that it took all reasonable care and the leak was an accident.",
      "Petitioners argued that hazardous enterprises must be strictly liable without exceptions."
    ],
    judgment: "Court rejected Rylands v. Fletcher exceptions, establishing Absolute Liability under Article 21.",
    ratio: "An enterprise engaged in hazardous/dangerous industry has an absolute, non-delegable duty to ensure safety.",
    importance: "First time absolute liability was officially formulated in environmental torts."
  },
  {
    id: "c-bommai",
    topicId: "const2-u2-t1",
    title: "S.R. Bommai v. Union of India (1994)",
    citation: "(1994) 3 SCC 1",
    bench: "9 Judges",
    subject: "Constitutional Law",
    keyPrinciple: "Floor Test & Judicial Review of Article 356",
    facts: "President dismissed the Bommai government in Karnataka under Article 356 based on the Governor's assessment.",
    issues: "Is the President's proclamation under Article 356 subject to judicial review?",
    arguments: [
      "Union argued that President's political satisfaction is non-justiciable.",
      "Petitioners argued that dismissing democratically elected state assemblies arbitrarily is unconstitutional."
    ],
    judgment: "Proclamation under Article 356 is subject to judicial review. The majority of a government must be tested on the floor of the house (Floor Test).",
    ratio: "State governments cannot be dismissed at the whim of the party in power at the Centre.",
    importance: "Severely curtailed the misuse of Article 356 by central governments."
  },
  {
    id: "c-dastane",
    topicId: "family1-u1-t1",
    title: "Dastane v. Dastane (1975)",
    citation: "AIR 1975 SC 1534",
    bench: "3 Judges",
    subject: "Family Law",
    keyPrinciple: "Cruelty and Standard of Proof in Matrimonial Cases",
    facts: "Husband sought divorce claiming wife's temper and behaviors constituted cruelty. Wife claimed husband condoned it.",
    issues: "What is the definition of cruelty and the standard of proof in HMA proceedings?",
    arguments: [
      "Husband argued wife's behavior created reasonable apprehension that it is harmful to live with her.",
      "Wife argued that marital relations continued, implying condonation of any alleged cruelty."
    ],
    judgment: "Wife's behavior did amount to cruelty, but husband condoned it by resuming marital cohabitation.",
    ratio: "Cruelty can be physical or mental. The standard of proof is preponderance of probabilities, not proof beyond reasonable doubt.",
    importance: "Foundation of matrimonial cruelty jurisprudence in India."
  },
  {
    id: "c-shreya",
    topicId: "cyber-u1-t1",
    title: "Shreya Singhal v. Union of India (2015)",
    citation: "(2015) 5 SCC 1",
    bench: "2 Judges",
    subject: "Cyber Law & Constitution",
    keyPrinciple: "Unconstitutionality of Section 66A IT Act",
    facts: "Two girls were arrested under Section 66A IT Act for posting comments on Facebook questioning the bandh in Mumbai after a politician's death.",
    issues: "Does Section 66A violate the fundamental right to free speech under Article 19(1)(a)?",
    arguments: [
      "Petitioners argued Section 66A was vague, overbroad, and chilled free speech.",
      "State argued that internet requires regulation of offensive content to maintain public order."
    ],
    judgment: "Section 66A struck down completely. It was held to be vague, overbroad, and not saved by Article 19(2).",
    ratio: "Clear distinction between discussion, advocacy, and incitement. Offensive speech is protected unless it incites violence.",
    importance: "Landmark shield for online free speech and civil liberties."
  }
];

const BASE_BARE_ACTS = [
  { id: "act-bns-103", topicId: "bns-u2-t1", actName: "BNS 2023", sectionNumber: "Section 103", title: "Punishment for Murder", content: "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. (2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other ground, each member of such group shall be punished with death or with imprisonment for life or imprisonment for a term which shall not be less than seven years, and shall also be liable to fine.", relatedSections: ["Section 100 (Culpable Homicide)", "Section 101 (Murder definition)"] },
  { id: "act-contract-2h", topicId: "contract1-u1-t1", actName: "Indian Contract Act, 1872", sectionNumber: "Section 2(h)", title: "Definition of Contract", content: "An agreement enforceable by law is a contract.", relatedSections: ["Section 2(e) (Agreement)", "Section 10 (What agreements are contracts)"] },
  { id: "act-cpc-11", topicId: "cpc-u1-t1", actName: "Civil Procedure Code, 1908", sectionNumber: "Section 11", title: "Res Judicata", content: "No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties, or between parties under whom they or any of them claim, litigating under the same title, in a Court competent to try such subsequent suit or the suit in which such issue has been subsequently raised, and has been heard and finally decided by such Court.", relatedSections: ["Section 10 (Stay of Suit)"] },
  { id: "act-bnss-173", topicId: "bnss-u1-t1", actName: "BNSS 2023", sectionNumber: "Section 173", title: "Information in Cognizable Cases (FIR)", content: "(1) Every information relating to the commission of a cognizable offence, if given orally to an officer in charge of a police station, shall be reduced to writing by him or under his direction... Provided that if the information is given by a woman against whom an offence under section 64, 65, 66... is alleged to have been committed, such information shall be recorded by a woman police officer.", relatedSections: ["Section 176 (Investigation procedure)"] },
  { id: "act-bsa-61", topicId: "bsa-u2-t1", actName: "BSA 2023", sectionNumber: "Section 61", title: "Admissibility of Electronic Records", content: "Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic or digital record in evidence on the ground that it is an electronic or digital record, and such record shall, subject to section 63, have the same legal effect, validity and enforceability as other document.", relatedSections: ["Section 63 (Certificate for electronic evidence)"] },
  { id: "act-ipr-3d", topicId: "ipr-u1-t1", actName: "Patents Act, 1970", sectionNumber: "Section 3(d)", title: "Non-Patentable Inventions", content: "The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance or the mere discovery of any new property or new use for a known substance or of the mere use of a known process, machine or apparatus unless such known process results in a new product or employs at least one new reactant.", relatedSections: ["Section 3 (What are not inventions)"] }
];

const BASE_FLASHCARDS = [
  { id: "fc-1", topicId: "const1-u1-t1", front: "Who propounded the Basic Structure Doctrine?", back: "The Supreme Court of India in Kesavananda Bharati v. State of Kerala (1973)." },
  { id: "fc-2", topicId: "const1-u1-t1", front: "Is the right to property a basic structure?", back: "No. It is a constitutional right under Article 300A, but NOT a fundamental right or basic structure." },
  { id: "fc-3", topicId: "bns-u2-t1", front: "What is the BNS section for murder?", back: "Section 103 of BNS 2023 (formerly IPC Section 302)." },
  { id: "fc-4", topicId: "contract1-u1-t1", front: "What are the essentials of a contract?", back: "Offer, Acceptance, Consideration, Free Consent, Competent Parties, and Lawful Object (Sec 10)." },
  { id: "fc-5", topicId: "tort-u1-t1", front: "What is Damnum Sine Injuria?", back: "Damage or financial loss caused without violation of a legal right. It is not actionable in court." },
  { id: "fc-6", topicId: "bnss-u1-t1", front: "What is a Zero FIR?", back: "An FIR registered at any police station regardless of jurisdiction, later transferred to the correct station." },
  { id: "fc-7", topicId: "cyber-u1-t1", front: "Why was Section 66A IT Act struck down?", back: "It violated Article 19(1)(a) because its definitions of offensive speech were vague and overbroad." }
];

const BASE_MOCK_TESTS = [
  {
    id: "mt-gu-sem1",
    universityId: "gu",
    semesterId: "sem1",
    subjectId: "constitutional-law-1",
    title: "Gujarat University Constitutional Law - I Mock Exam",
    timeLimit: 15,
    totalQuestions: 4,
    questions: [
      { question: "The Preamble was amended by which constitutional amendment?", options: ["42nd Amendment", "44th Amendment", "24th Amendment", "86th Amendment"], correctIndex: 0, explanation: "The 42nd Amendment Act of 1976 added the words Secular, Socialist, and Integrity." },
      { question: "Writ of Habeas Corpus is filed for what reason?", options: ["To prevent unlawful detention", "To direct performance of public duty", "To quash judicial orders", "To check eligibility for public office"], correctIndex: 0, explanation: "Habeas Corpus literally means 'produce the body' and safeguards personal liberty against unlawful detention." },
      { question: "Under Article 12, 'State' includes which of the following?", options: ["Government and Parliament of India", "Government and Legislature of States", "All local or other authorities within India", "All of the above"], correctIndex: 3, explanation: "Article 12 defines State broadly to include Government, Parliament, legislatures, and all local/other authorities." },
      { question: "Which article is referred to as the heart and soul of the Constitution by Dr. B.R. Ambedkar?", options: ["Article 19", "Article 21", "Article 32", "Article 14"], correctIndex: 2, explanation: "Dr. B.R. Ambedkar called Article 32 (Right to Constitutional Remedies) the heart and soul of the Constitution." }
    ],
    negativeMarking: true
  }
];

const BASE_LEADERBOARD = [
  { name: "Neha Patel", uni: "VNSGU", xp: 2850, rank: 1, badge: "⚖️ Senior Counsel" },
  { name: "Rajesh Vaghela", uni: "GU", xp: 2400, rank: 2, badge: "📜 Scholar" },
  { name: "Jignesh Mewada", uni: "SU", xp: 1950, rank: 3, badge: "📜 Scholar" },
  { name: "Arjun Sharma", uni: "GU", xp: 1450, rank: 4, badge: "🎯 Quiz Master" }
];

const DEFAULT_PROFILE = {
  name: "Arjun Sharma",
  role: "LLB Student",
  targetExam: "Judiciary Services & AIBE XIX",
  streakDays: 7,
  xp: 1450,
  coins: 320,
  level: "Advocate Apprentice",
  badges: [
    { title: "Consti Scholar", icon: "⚖️", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { title: "BNS Explorer", icon: "📜", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { title: "Quiz Master", icon: "🎯", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { title: "7-Day Streak", icon: "🔥", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" }
  ],
  strongTopics: ["Preamble and Basic Structure Doctrine"],
  weakTopics: ["BNS Section 318: Cheating"],
  bookmarks: ["note-const1-u1-t1"],
  completedTopics: []
};

class MockDBClass {
  constructor() {
    this.isLoaded = false;
    this.state = {};
  }

  init() {
    if (typeof window === "undefined") return;
    if (this.isLoaded) return;

    try {
      const data = localStorage.getItem("lowstudy_db");
      if (data) {
        this.state = JSON.parse(data);
      } else {
        this.state = this.getSeedData();
        this.save();
      }
      this.isLoaded = true;
    } catch (e) {
      this.state = this.getSeedData();
    }
  }

  getSeedData() {
    return {
      universities: BASE_UNIVERSITIES,
      courses: BASE_COURSES,
      semesters: BASE_SEMESTERS,
      subjects: BASE_SUBJECTS,
      units: BASE_UNITS,
      topics: BASE_TOPICS,
      notes: BASE_NOTES,
      mcqs: BASE_MCQS,
      caseLaws: BASE_CASE_LAWS,
      bareActs: BASE_BARE_ACTS,
      flashcards: BASE_FLASHCARDS,
      mockTests: BASE_MOCK_TESTS,
      leaderboard: BASE_LEADERBOARD,
      profile: DEFAULT_PROFILE,
      adsEnabled: true,
      seoTitleTemplate: "%s | LowStudy Law Learning Platform",
      selectedUniId: "",
      selectedSemId: ""
    };
  }

  save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("lowstudy_db", JSON.stringify(this.state));
    } catch (e) {}
  }

  // --- QUERY APIS ---

  getUniversities() {
    this.init();
    return this.state.universities || [];
  }

  getSemesters() {
    this.init();
    return this.state.semesters || [];
  }

  getSelectedUni() {
    this.init();
    return this.state.universities?.find(u => u.id === this.state.selectedUniId) || null;
  }

  getSelectedSem() {
    this.init();
    return this.state.semesters?.find(s => s.id === this.state.selectedSemId) || null;
  }

  setSelectedUniAndSem(uniId, semId) {
    this.init();
    this.state.selectedUniId = uniId;
    this.state.selectedSemId = semId;
    this.save();
  }

  getSubjects(uniId = null, semId = null) {
    this.init();
    let list = this.state.subjects || [];
    // If semester filter is active
    const targetSemId = semId || this.state.selectedSemId;
    if (targetSemId) {
      list = list.filter(s => s.semesterId === targetSemId);
    }
    return list;
  }

  getSubjectById(id) {
    this.init();
    return this.state.subjects?.find(s => s.id === id) || null;
  }

  getUnits(subjectId) {
    this.init();
    return this.state.units?.filter(u => u.subjectId === subjectId) || [];
  }

  getTopics(unitId) {
    this.init();
    return this.state.topics?.filter(t => t.unitId === unitId) || [];
  }

  getNotes(topicId) {
    this.init();
    return this.state.notes?.find(n => n.topicId === topicId) || null;
  }

  getMCQs(topicId) {
    this.init();
    return this.state.mcqs?.filter(m => m.topicId === topicId) || [];
  }

  getCaseLaws(topicId) {
    this.init();
    return this.state.caseLaws?.filter(c => c.topicId === topicId) || [];
  }

  getBareActs(topicId) {
    this.init();
    return this.state.bareActs?.filter(b => b.topicId === topicId) || [];
  }

  getFlashcards(topicId) {
    this.init();
    return this.state.flashcards?.filter(f => f.topicId === topicId) || [];
  }

  getMockTests() {
    this.init();
    const uniId = this.state.selectedUniId;
    const semId = this.state.selectedSemId;
    let list = this.state.mockTests || [];
    if (uniId) {
      list = list.filter(t => t.universityId === uniId);
    }
    if (semId) {
      list = list.filter(t => t.semesterId === semId);
    }
    return list;
  }

  getMockTestById(id) {
    this.init();
    return this.state.mockTests?.find(t => t.id === id) || null;
  }

  getLeaderboard() {
    this.init();
    return this.state.leaderboard || [];
  }

  getProfile() {
    this.init();
    return this.state.profile || DEFAULT_PROFILE;
  }

  updateProfile(profileData) {
    this.init();
    this.state.profile = { ...this.state.profile, ...profileData };
    this.save();
    return this.state.profile;
  }

  getAdsSetting() {
    this.init();
    return this.state.adsEnabled;
  }

  setAdsSetting(val) {
    this.init();
    this.state.adsEnabled = val;
    this.save();
  }

  // --- ADMIN CRUD APIS ---

  addSubject(subj) {
    this.init();
    this.state.subjects.push(subj);
    this.save();
  }

  addUnit(unit) {
    this.init();
    this.state.units.push(unit);
    this.save();
  }

  addTopic(topic) {
    this.init();
    this.state.topics.push(topic);
    this.save();
  }

  addNote(note) {
    this.init();
    this.state.notes.push(note);
    this.save();
  }

  addMCQ(mcq) {
    this.init();
    this.state.mcqs.push(mcq);
    this.save();
  }

  addCaseLaw(c) {
    this.init();
    this.state.caseLaws.push(c);
    this.save();
  }

  addBareAct(act) {
    this.init();
    this.state.bareActs.push(act);
    this.save();
  }

  deleteSubject(id) {
    this.init();
    this.state.subjects = this.state.subjects.filter(s => s.id !== id);
    this.save();
  }
}

export const MockDB = new MockDBClass();
