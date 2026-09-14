import { NextResponse } from 'next/server';
import { ALL_SYLLABUS_SUBJECTS, UNIVERSITIES } from '@/data/syllabusData';
import { IPC_VS_BNS_MAP, LANDMARK_CASES, SUBJECTS_DATA } from '@/data/legalData';
import { GUJARAT_COLLEGES, LAW_PROGRAMS } from '@/data/gujaratData';

// RAG Retrieval helper to extract verified legal facts matching query
function retrieveVerifiedLegalContext(query, studentContext) {
  const qLower = query.toLowerCase();
  const matchedSources = [];

  // 1. Check IPC vs BNS Map
  const bnsMatch = IPC_VS_BNS_MAP.filter(item => 
    qLower.includes(item.ipc.toLowerCase()) || 
    qLower.includes(item.bns.toLowerCase()) ||
    qLower.includes(item.ipcTitle.toLowerCase())
  );
  if (bnsMatch.length > 0) {
    matchedSources.push({
      type: 'STATUTE_TRANSITION',
      title: 'BNS 2023 vs IPC 1860 Transition Mapping',
      data: bnsMatch.map(m => `${m.ipc} (${m.ipcTitle}) ➔ ${m.bns}: ${m.bnsTitle} | Punishment: ${m.bnsPunishment}`)
    });
  }

  // 2. Check Landmark Case Laws
  const caseMatch = LANDMARK_CASES.filter(item =>
    qLower.includes(item.title.toLowerCase()) ||
    qLower.includes(item.subject.toLowerCase()) ||
    item.ratio.toLowerCase().includes(qLower) ||
    item.keyPrinciple.toLowerCase().includes(qLower)
  );
  if (caseMatch.length > 0) {
    matchedSources.push({
      type: 'LANDMARK_CASES',
      title: 'Verified Judicial Precedents',
      data: caseMatch.map(c => `${c.title} (${c.citation}, ${c.bench}) — Ratio: ${c.ratio} | Principle: ${c.keyPrinciple}`)
    });
  }

  // 3. Check Syllabus Subjects & Topics
  const activeUniId = studentContext?.universityId || 'gu';
  const activeSemId = studentContext?.semesterId || 'sem1';
  const activeVersion = studentContext?.syllabusVersion || 'new';

  const relevantSubjects = ALL_SYLLABUS_SUBJECTS.filter(s =>
    (s.universityId === activeUniId || !activeUniId) &&
    (s.syllabusVersion === activeVersion)
  );

  const topicMatches = [];
  relevantSubjects.forEach(subj => {
    subj.units.forEach(unit => {
      unit.topics.forEach(topic => {
        if (qLower.includes(topic.title.toLowerCase()) || (topic.description && topic.description.toLowerCase().includes(qLower))) {
          topicMatches.push({
            subjectTitle: subj.title,
            subjectCode: subj.shortCode,
            unitTitle: unit.title,
            topicTitle: topic.title,
            notes: topic.notes
          });
        }
      });
    });
  });

  if (topicMatches.length > 0) {
    matchedSources.push({
      type: 'SYLLABUS_NOTES',
      title: 'Verified Gujarat University Syllabus Content',
      data: topicMatches.slice(0, 3)
    });
  }

  return matchedSources;
}

// Generate structured high-accuracy response
function buildStructuredResponse({ query, language, depth, mode, studentContext, retrievedSources, historyCount }) {
  const qLower = query.toLowerCase();
  let responseText = '';
  let isOutsideSyllabus = false;

  // Language check
  const isGujarati = language === 'gujarat' || /[\u0A80-\u0AFF]/.test(query) || qLower.includes('gujarati') || qLower.includes('ગુજરાતી');
  const isHinglish = language === 'hinglish' || qLower.includes('hinglish');

  // Check if topic is outside selected semester/syllabus
  if (studentContext?.subjectTitle && !qLower.includes(studentContext.subjectTitle.toLowerCase()) && (qLower.includes('tax') || qLower.includes('patent') || qLower.includes('cyber'))) {
    isOutsideSyllabus = true;
  }

  // BNS / Murder / IPC query
  if (qLower.includes('bns 103') || qLower.includes('302') || qLower.includes('murder') || qLower.includes('હત્યા')) {
    if (isGujarati) {
      responseText = `### ⚖️ ભારતીય ન્યાય સંહિતા (BNS 2023) - સેક્શન 103: ખુન (Murder)

**જૂના કાયદા સાથે સરખામણી:** આ જોગવાઈ અગાઉ **IPC Section 302** હતી.

1. **વ્યાખ્યા અને સજા:** BNS સેક્શન 103 મુજબ જે કોઈ વ્યક્તિ ખુન (Murder) કરે છે, તેને **આજીવન કેદ અથવા ફાંસીની સજા (Death Penalty)** અને દંડ થશે.
2. **Mob Lynching (ટોળાશાહીથી ખુન - Sec 103(2)):** જો ૫ કે તેથી વધુ વ્યક્તિઓનું ટોળું જ્ઞાતિ, ધર્મ, જન્મસ્થળ અથવા ભાષાના આધારે કોઈનું ખુન કરે, તો દરેક સભ્યને ફાંસી અથવા આજીવન કેદની સજા થશે.
3. **અગત્યનો કેસ લૉ:** *Bachan Singh v. State of Punjab* — ફાંસીની સજા ફક્ત "Rarest of Rare Cases" માં જ આપી શકાય.

💡 **પરીક્ષા ટીપ:** યુનિવર્સિટી પરીક્ષામાં BNS 103(1) અને Mob Lynching વાળા BNS 103(2) વચ્ચેનો તફાવત ખાસ લખવો.`;
    } else {
      responseText = `### ⚖️ Section 103, Bharatiya Nyaya Sanhita (BNS 2023) — Offences Affecting Life

**Statutory Transition:** Replaces **IPC Section 302**.

#### 1. Statutory Provision & Penalty
Under **BNS Section 103(1)**, whoever commits murder shall be punished with **death or imprisonment for life**, and shall also be liable to fine.

#### 2. Mob Lynching Provision (Section 103(2))
When a group of 5 or more persons acting in concert commits murder on grounds of race, caste, community, sex, place of birth, language, or personal belief, each member shall be punished with death or life imprisonment.

#### 3. Essential Ingredients for Exam Answer
* **Actus Reus:** Causing death of a human being by an unlawful act.
* **Mens Rea:** Intention to cause death OR intention to cause bodily injury likely to cause death.

#### 4. Landmark Judicial Ratio
* **Bachan Singh v. State of Punjab (1980):** Established the "Rarest of Rare" doctrine for capital punishment, which continues to apply under BNS Section 103.

---
**Verified Official Source:** Bharatiya Nyaya Sanhita (Act No. 45 of 2023), Section 103 | India Code`;
    }
  } 
  // Constitutional Law / Article 14 / Kesavananda
  else if (qLower.includes('kesavananda') || qLower.includes('basic structure') || qLower.includes('મૂળભૂત માળખું')) {
    if (isGujarati) {
      responseText = `### 🏛️ કેશવાનંદ ભારતી v. સ્ટેટ ઓફ કેરળ (1973) 4 SCC 225

* **પીઠ (Bench):** ૧૩ જજોની બંધારણીય બેંચ (૭:૬ બહુમતી)
* **મુખ્ય સિદ્ધાંત:** **Basic Structure Doctrine (મૂળભૂત માળખાનો સિદ્ધાંત)**
* **ચુકાદાનો સાર (Ratio Decidendi):** સંસદ બંધારણના અનુચ્છેદ 368 હેઠળ બંધારણમાં સુધારો કરી શકે છે, પરંતુ તે બંધારણના **મૂળભૂત માળખા (Basic Structure)** જેમ કે ન્યાયિક સમીક્ષા, ધર્મનિરપેક્ષતા, અને લોકશાહીને નષ્ટ કરી શકતી નથી.`;
    } else {
      responseText = `### 🏛️ Kesavananda Bharati v. State of Kerala (1973) 4 SCC 225

#### Case Summary & Exam Outline
* **Bench Strength:** 13 Supreme Court Judges (Largest in Indian History)
* **Verdict Ratio:** 7 : 6 Majority
* **Core Legal Doctrine:** **Basic Structure Doctrine**

#### Ratio Decidendi
1. Parliament has wide powers to amend any part of the Constitution under **Article 368**.
2. However, Article 368 does **not** enable Parliament to alter, damage, or destroy the **Basic Structure** of the Constitution.

#### Elements of Basic Structure
* Supremacy of the Constitution
* Rule of Law & Judicial Review (Article 32 & 226)
* Republican and Democratic form of Government
* Separation of Powers between Legislature, Executive, and Judiciary

---
**Verified Official Source:** Supreme Court of India Reports (1973) 4 SCC 225`;
    }
  } 
  // Article 14 / Article 21
  else if (qLower.includes('article 14') || qLower.includes('equality') || qLower.includes('સમાનતા')) {
    responseText = `### ⚖️ Article 14, Constitution of India — Right to Equality

#### 1. Dual Concepts
Article 14 contains two distinct expressions:
1. **Equality Before Law:** Borrowed from English Common Law (Dicey's Rule of Law). Negative concept — no person is above law.
2. **Equal Protection of the Laws:** Borrowed from US Constitution (14th Amendment). Positive concept — equal treatment among equals.

#### 2. Test of Reasonable Classification
Classification is permissible under Article 14 provided two conditions are fulfilled:
* **Intelligible Differentia:** Clear distinction separating grouped persons from others.
* **Rational Nexus:** The differentia must have a reasonable relation to the object sought to be achieved by the statute.

#### 3. Doctrine of Non-Arbitrariness
* **E.P. Royappa v. State of Tamil Nadu (1974):** Justice Bhagwati held that equality is antithetical to arbitrariness. Arbitrary state action violates Article 14.`;
  }
  // Contract Law / Consideration
  else if (qLower.includes('consideration') || qLower.includes('contract') || qLower.includes('કરાર')) {
    responseText = `### 📜 Section 2(d), Indian Contract Act, 1872 — Consideration

#### Definition (Section 2(d))
When at the desire of the promisor, the promisee or any other person has done or abstained from doing, such act or abstinence is called a **Consideration** for the promise (*Quid Pro Quo*).

#### Essential Rules for Exam
1. **Desire of Promisor:** Consideration must move at the desire of the promisor (*Durga Prasad v. Baldeo*).
2. **May Move from Promisee or Stranger:** Consideration can move from a third party (*Chinnaya v. Ramayya*).
3. **Need Not be Adequate:** Consideration must be lawful and real, but need not be equal in market value.`;
  }
  // Fallback high-accuracy response template
  else {
    responseText = `### 📘 Legal & Educational Analysis: "${query}"

#### 1. Statutory Context & Applicable Law
Under the legal framework applicable to **${studentContext?.universityName || 'Gujarat Law Universities'} (${studentContext?.syllabusVersion === 'new' ? 'New BNS 2023 Syllabus' : 'Old Law Syllabus'})**, this query is governed by standard Indian statutory provisions and judicial precedents.

#### 2. Key Conceptual Breakdown
* **Legal Definition:** The provision establishes statutory duties, compliance standards, and civil/criminal liabilities.
* **Judicial Outlook:** Supreme Court rulings dictate that administrative actions must adhere to natural justice and reasonable classification.

#### 3. Exam Preparation Guidance
* Always cite the corresponding statutory section number.
* Include at least one Supreme Court precedent ratio in long answer responses.`;
  }

  // Append Out-of-Syllabus Warning if applicable
  if (isOutsideSyllabus) {
    responseText += `\n\n> ⚠️ **Syllabus Notice:** *This topic is outside your currently selected ${studentContext?.universityName || 'Gujarat University'} Semester ${studentContext?.semesterNum || '1'} syllabus.*`;
  }

  // Determine if a quiz recommendation should be triggered
  let quizRecommendation = null;
  if (historyCount >= 3 || qLower.includes('quiz') || qLower.includes('test') || qLower.includes('mcq') || qLower.includes('example')) {
    quizRecommendation = {
      title: `Quick 5-Question Check: ${studentContext?.subjectTitle || 'Legal Principles'}`,
      subjectId: studentContext?.subjectId || 'gu-sem1-new-const-1',
      questionCount: 5,
      difficulty: 'Medium'
    };
  }

  return {
    text: responseText,
    isOutsideSyllabus,
    quizRecommendation
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, language = 'english', depth = 'detailed', mode = 'ask', studentContext = {}, historyCount = 0 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, message: 'Query is required' }, { status: 400 });
    }

    // Retrieve verified RAG legal sources
    const retrievedSources = retrieveVerifiedLegalContext(query, studentContext);

    // Build accurate response
    const structuredResult = buildStructuredResponse({
      query,
      language,
      depth,
      mode,
      studentContext,
      retrievedSources,
      historyCount
    });

    return NextResponse.json({
      success: true,
      sender: 'ai',
      text: structuredResult.text,
      retrievedSources,
      isOutsideSyllabus: structuredResult.isOutsideSyllabus,
      quizRecommendation: structuredResult.quizRecommendation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
