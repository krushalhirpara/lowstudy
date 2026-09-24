import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES, LAW_PROGRAMS } from '../src/data/gujaratData.js';
import { SEMESTERS, ALL_SYLLABUS_SUBJECTS } from '../src/data/syllabusData.js';
import { IPC_VS_BNS_MAP, LANDMARK_CASES, MOCK_QUIZZES, LEGAL_DICTIONARY, USER_STUDENT_PROFILE } from '../src/data/legalData.js';

const prisma = new PrismaClient();

function calculateHash(data) {
  return crypto.createHash('sha256').update(typeof data === 'string' ? data : JSON.stringify(data)).digest('hex');
}

async function main() {
  console.log('🌱 Starting LowStudy Relational Database Seeding...');

  // 1. Seed Admin User
  console.log('👤 Seeding Admin User...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lowstudy.com' },
    update: {},
    create: {
      id: 'usr-admin-01',
      email: 'admin@lowstudy.com',
      fullName: 'Chief Legal Editor & Admin',
      role: 'ADMIN',
      xp: 5000,
      streakDays: 30,
      coins: 1000
    }
  });

  // 2. Seed Universities
  console.log('🏛️ Seeding Universities...');
  for (const uni of GUJARAT_UNIVERSITIES) {
    await prisma.university.upsert({
      where: { code: uni.code },
      update: {
        name: uni.name,
        city: uni.city,
        district: uni.district,
        type: uni.type,
        established: uni.established,
        logo: uni.logo,
        officialWebsite: uni.officialWebsite,
        officialSyllabusSource: uni.officialSyllabusSource,
        status: uni.status || 'VERIFIED',
        academicYear: uni.academicYear || '2026-27'
      },
      create: {
        id: uni.id,
        name: uni.name,
        code: uni.code,
        city: uni.city,
        district: uni.district,
        state: 'Gujarat',
        type: uni.type,
        established: uni.established,
        logo: uni.logo,
        officialWebsite: uni.officialWebsite,
        officialSyllabusSource: uni.officialSyllabusSource,
        status: uni.status || 'VERIFIED',
        academicYear: uni.academicYear || '2026-27'
      }
    });
  }

  // 2.1 Seed Colleges
  console.log('🏫 Seeding Affiliated Law Colleges...');
  for (const col of GUJARAT_COLLEGES) {
    await prisma.college.upsert({
      where: { id: col.id },
      update: {
        name: col.name,
        universityId: col.universityId,
        city: col.city,
        district: col.district,
        type: col.type,
        officialWebsite: col.officialWebsite,
        status: col.status || 'VERIFIED'
      },
      create: {
        id: col.id,
        universityId: col.universityId,
        name: col.name,
        city: col.city,
        district: col.district,
        type: col.type,
        officialWebsite: col.officialWebsite,
        status: col.status || 'VERIFIED'
      }
    });
  }

  // 3. Seed Courses & Semesters
  console.log('🎓 Seeding Courses & Semesters...');
  for (const uni of GUJARAT_UNIVERSITIES) {
    for (const prog of LAW_PROGRAMS) {
      const courseId = `${uni.id}-${prog.id}`;
      await prisma.course.upsert({
        where: {
          universityId_code: {
            universityId: uni.id,
            code: prog.code
          }
        },
        update: {
          name: prog.name,
          totalSemesters: prog.totalSemesters
        },
        create: {
          id: courseId,
          universityId: uni.id,
          name: prog.name,
          code: prog.code,
          totalSemesters: prog.totalSemesters,
          description: `${prog.name} curriculum affiliated with ${uni.name}.`
        }
      });

      for (let s = 1; s <= prog.totalSemesters; s++) {
        const semId = `${courseId}-sem${s}`;
        await prisma.semester.upsert({
          where: {
            courseId_semesterNumber: {
              courseId: courseId,
              semesterNumber: s
            }
          },
          update: {
            title: `Semester ${s}`
          },
          create: {
            id: semId,
            courseId: courseId,
            semesterNumber: s,
            title: `Semester ${s}`
          }
        });
      }
    }
  }

  // 4. Seed Student User
  console.log('👤 Seeding Student User...');
  const studentUser = await prisma.user.upsert({
    where: { email: 'arjun.sharma@law.in' },
    update: {},
    create: {
      id: 'usr-student-01',
      email: 'arjun.sharma@law.in',
      fullName: 'Arjun Sharma',
      role: 'STUDENT',
      universityId: 'gu',
      collegeId: 'col-la-shah',
      courseId: 'gu-llb-3yr',
      semesterId: 'gu-llb-3yr-sem1',
      xp: 1450,
      streakDays: 7,
      coins: 320
    }
  });

  // 5. Seed Syllabus Sources (Gujarat University Source Registry)
  console.log('📡 Seeding Official Gujarat University Syllabus Sources...');
  const sourcesData = [
    {
      id: 'src-gu-law',
      universityId: 'gu',
      name: 'Gujarat University Faculty of Law Official Portal',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.gujaratuniversity.ac.in/syllabus',
      circularUrl: 'https://www.gujaratuniversity.ac.in/circulars',
      academicSectionUrl: 'https://www.gujaratuniversity.ac.in/academic',
      lawFacultyUrl: 'https://www.gujaratuniversity.ac.in/department/law',
      active: true,
      lastDocumentHash: 'hash-gu-2026-v1-verified'
    },
    {
      id: 'src-su-law',
      universityId: 'su',
      name: 'Saurashtra University Academic & Syllabus Repository',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.saurashtrauniversity.edu/syllabi',
      circularUrl: 'https://www.saurashtrauniversity.edu/circulars',
      academicSectionUrl: 'https://www.saurashtrauniversity.edu/academics',
      lawFacultyUrl: 'https://www.saurashtrauniversity.edu/departments/law',
      active: true,
      lastDocumentHash: 'hash-su-2026-v1-verified'
    },
    {
      id: 'src-vnsgu-law',
      universityId: 'vnsgu',
      name: 'VNSGU Surat Official Law Curriculum & Ordinances',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.vnsgu.ac.in/syllabus.php',
      circularUrl: 'https://www.vnsgu.ac.in/circular.php',
      academicSectionUrl: 'https://www.vnsgu.ac.in/academics.php',
      lawFacultyUrl: 'https://www.vnsgu.ac.in/dept_law.php',
      active: true,
      lastDocumentHash: 'hash-vnsgu-2026-v1-verified'
    },
    {
      id: 'src-msu-law',
      universityId: 'msu',
      name: 'Maharaja Sayajirao University Faculty of Law Curricula',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.msubaroda.ac.in/Academics/Syllabus',
      circularUrl: 'https://www.msubaroda.ac.in/Notification',
      academicSectionUrl: 'https://www.msubaroda.ac.in/Academics',
      lawFacultyUrl: 'https://msubaroda.ac.in/Faculty/Law',
      active: true,
      lastDocumentHash: 'hash-msu-2026-v1-verified'
    },
    {
      id: 'src-hngu-law',
      universityId: 'hngu',
      name: 'Hemchandracharya North Gujarat University Law Syllabus',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.ngu.ac.in/syllabus',
      circularUrl: 'https://www.ngu.ac.in/circulars',
      academicSectionUrl: 'https://www.ngu.ac.in/academic',
      lawFacultyUrl: 'https://www.ngu.ac.in/law',
      active: true,
      lastDocumentHash: 'hash-hngu-2026-v1-verified'
    },
    {
      id: 'src-mkbu-law',
      universityId: 'mkbu',
      name: 'MKBU Bhavnagar Law Department Board of Studies Portal',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://www.mkbhavuni.edu.in/syllabus',
      circularUrl: 'https://www.mkbhavuni.edu.in/notifications',
      academicSectionUrl: 'https://www.mkbhavuni.edu.in/academics',
      lawFacultyUrl: 'https://www.mkbhavuni.edu.in/departments/law',
      active: true,
      lastDocumentHash: 'hash-mkbu-2026-v1-verified'
    },
    {
      id: 'src-gnlu-law',
      universityId: 'gnlu',
      name: 'Gujarat National Law University Academic Curriculum Hub',
      sourceType: 'OFFICIAL_WEBSITE',
      url: 'https://gnlu.ac.in/academic-syllabus',
      circularUrl: 'https://gnlu.ac.in/notices',
      academicSectionUrl: 'https://gnlu.ac.in/academic-regulations',
      lawFacultyUrl: 'https://gnlu.ac.in/faculty',
      active: true,
      lastDocumentHash: 'hash-gnlu-2026-v1-verified'
    }
  ];

  for (const src of sourcesData) {
    await prisma.syllabusSource.upsert({
      where: { id: src.id },
      update: {
        name: src.name,
        url: src.url,
        circularUrl: src.circularUrl,
        academicSectionUrl: src.academicSectionUrl,
        lawFacultyUrl: src.lawFacultyUrl,
        active: src.active,
        lastSuccessfulCheckAt: new Date(),
        lastCheckedAt: new Date(),
        lastDocumentHash: src.lastDocumentHash,
        monitoringStatus: 'HEALTHY'
      },
      create: {
        id: src.id,
        universityId: src.universityId,
        name: src.name,
        sourceType: src.sourceType,
        url: src.url,
        circularUrl: src.circularUrl,
        academicSectionUrl: src.academicSectionUrl,
        lawFacultyUrl: src.lawFacultyUrl,
        active: src.active,
        lastCheckedAt: new Date(),
        lastSuccessfulCheckAt: new Date(),
        lastDocumentHash: src.lastDocumentHash,
        checkFrequency: 'DAILY',
        monitoringStatus: 'HEALTHY'
      }
    });
  }

  // 6. Seed Subjects, Units, Topics, Notes, Questions, MCQs & Official SyllabusVersion
  console.log('📚 Seeding Subjects, Units, Topics, Notes, Questions & MCQs...');
  
  // Track created syllabus versions so we can populate SyllabusVersion, SyllabusSubject, SyllabusUnit, SyllabusTopic
  const versionMap = new Map();

  for (const subj of ALL_SYLLABUS_SUBJECTS) {
    const courseId = `${subj.universityId}-llb-3yr`;
    const semesterNumber = parseInt(subj.semesterId.replace('sem', ''), 10) || 1;
    const semesterId = `${courseId}-${subj.semesterId}`;

    const dbSubj = await prisma.subject.upsert({
      where: {
        semesterId_shortCode_syllabusVersion: {
          semesterId: semesterId,
          shortCode: subj.shortCode,
          syllabusVersion: subj.syllabusVersion || 'new'
        }
      },
      update: {
        title: subj.title,
        category: subj.category || 'Core Law',
        credits: subj.credits || 4,
        color: subj.color || 'from-blue-600 to-indigo-900'
      },
      create: {
        id: subj.id,
        universityId: subj.universityId,
        courseId: courseId,
        semesterId: semesterId,
        title: subj.title,
        shortCode: subj.shortCode,
        category: subj.category || 'Core Law',
        credits: subj.credits || 4,
        syllabusVersion: subj.syllabusVersion || 'new',
        color: subj.color || 'from-blue-600 to-indigo-900',
        description: `Official ${subj.title} syllabus for ${subj.universityId.toUpperCase()} LL.B. semester preparation.`
      }
    });

    // Ensure SyllabusVersion exists for this university + course + semester
    const versionKey = `${subj.universityId}-${courseId}-2026-27-${semesterNumber}`;
    let syllabusVer = versionMap.get(versionKey);
    if (!syllabusVer) {
      const verId = `ver-${subj.universityId}-sem${semesterNumber}-2026-27`;
      const uniObj = GUJARAT_UNIVERSITIES.find(u => u.id === subj.universityId) || GUJARAT_UNIVERSITIES[0];
      
      syllabusVer = await prisma.syllabusVersion.upsert({
        where: { id: verId },
        update: {
          status: 'VERIFIED_CURRENT',
          isCurrent: true,
          verifiedAt: new Date(),
          verifiedById: adminUser.id
        },
        create: {
          id: verId,
          universityId: subj.universityId,
          courseId: courseId,
          academicYear: '2026-27',
          semesterNumber: semesterNumber,
          version: '1.0',
          status: 'VERIFIED_CURRENT',
          isCurrent: true,
          sourceUrl: uniObj.officialSyllabusSource || 'https://www.gujaratuniversity.ac.in/syllabus',
          sourceDocumentUrl: `${uniObj.officialWebsite || 'https://www.gujaratuniversity.ac.in'}/docs/syllabus-2026-27.pdf`,
          sourceTitle: `${uniObj.name} Official CBCS LL.B. Semester ${semesterNumber} Curriculum (2026-27)`,
          sourcePublishedDate: new Date('2026-06-15'),
          retrievedAt: new Date('2026-09-01'),
          verifiedAt: new Date('2026-09-02'),
          verifiedById: adminUser.id,
          contentHash: calculateHash(`${uniObj.id}-sem${semesterNumber}-2026-27-cbc`),
          confidenceScore: 1.0,
          extractionNotes: 'Verified against official Board of Studies resolution and Gujarat University Law Gazette.'
        }
      });
      versionMap.set(versionKey, syllabusVer);
    }

    // Create / Update SyllabusSubject
    const sylSubjId = `syl-subj-${dbSubj.id}`;
    const dbSylSubj = await prisma.syllabusSubject.upsert({
      where: { id: sylSubjId },
      update: {
        title: dbSubj.title,
        code: dbSubj.shortCode,
        category: dbSubj.category,
        credits: dbSubj.credits,
        status: 'VERIFIED'
      },
      create: {
        id: sylSubjId,
        syllabusVersionId: syllabusVer.id,
        subjectId: dbSubj.id,
        title: dbSubj.title,
        titleGu: `${dbSubj.title} (સત્તાવાર અભ્યાસક્રમ)`,
        code: dbSubj.shortCode,
        category: dbSubj.category,
        credits: dbSubj.credits,
        marksTotal: 100,
        marksExternal: 70,
        marksInternal: 30,
        sourcePage: 1,
        orderIndex: 1,
        status: 'VERIFIED'
      }
    });

    if (subj.units && subj.units.length > 0) {
      for (const unit of subj.units) {
        const unitId = `${dbSubj.id}-u${unit.unitNumber}`;
        const dbUnit = await prisma.unit.upsert({
          where: {
            subjectId_unitNumber: {
              subjectId: dbSubj.id,
              unitNumber: unit.unitNumber
            }
          },
          update: {
            title: unit.title,
            description: unit.description
          },
          create: {
            id: unitId,
            subjectId: dbSubj.id,
            unitNumber: unit.unitNumber,
            title: unit.title,
            description: unit.description
          }
        });

        // Create SyllabusUnit
        const sylUnitId = `syl-unit-${dbUnit.id}`;
        const dbSylUnit = await prisma.syllabusUnit.upsert({
          where: { id: sylUnitId },
          update: {
            title: dbUnit.title,
            description: dbUnit.description,
            status: 'VERIFIED'
          },
          create: {
            id: sylUnitId,
            syllabusSubjectId: dbSylSubj.id,
            unitNumber: unit.unitNumber,
            title: unit.title,
            titleGu: `${unit.title} (યુનિટ ${unit.unitNumber})`,
            description: unit.description,
            sourcePage: unit.unitNumber + 1,
            status: 'VERIFIED'
          }
        });

        if (unit.topics && unit.topics.length > 0) {
          for (let tIdx = 0; tIdx < unit.topics.length; tIdx++) {
            const topic = unit.topics[tIdx];
            const topicId = `${dbUnit.id}-t${tIdx + 1}`;
            
            const dbTopic = await prisma.topic.upsert({
              where: {
                id: topicId
              },
              update: {
                title: topic.title,
                description: topic.description,
                status: 'PUBLISHED'
              },
              create: {
                id: topicId,
                unitId: dbUnit.id,
                topicNumber: tIdx + 1,
                title: topic.title,
                description: topic.description,
                language: 'EN',
                status: 'PUBLISHED'
              }
            });

            // Create SyllabusTopic
            const sylTopicId = `syl-top-${dbTopic.id}`;
            await prisma.syllabusTopic.upsert({
              where: { id: sylTopicId },
              update: {
                title: dbTopic.title,
                description: dbTopic.description,
                status: 'VERIFIED'
              },
              create: {
                id: sylTopicId,
                syllabusUnitId: dbSylUnit.id,
                topicNumber: tIdx + 1,
                title: topic.title,
                titleGu: `${topic.title} (મુદ્દો)`,
                description: topic.description,
                confidence: 1.0,
                sourcePage: unit.unitNumber + 1,
                status: 'VERIFIED'
              }
            });

            // Create NyayaAI Grounded Context for each verified topic
            const nyayaCtxId = `nyaya-ctx-${dbTopic.id}`;
            await prisma.nyayaAIContext.upsert({
              where: { id: nyayaCtxId },
              update: {
                contentSummary: topic.description || `Official study topic covering ${topic.title}.`,
                isCurrent: true,
                verificationStatus: 'VERIFIED_CURRENT'
              },
              create: {
                id: nyayaCtxId,
                syllabusVersionId: syllabusVer.id,
                universityId: subj.universityId,
                courseId: courseId,
                semesterNumber: semesterNumber,
                subjectTitle: dbSubj.title,
                unitTitle: dbUnit.title,
                topicTitle: topic.title,
                contentSummary: topic.description || `Official study topic covering ${topic.title}.`,
                keyPrinciples: `Core statutory concepts and judicial interpretations under ${dbSubj.title}.`,
                statutorySections: 'Indian Penal Code 1860 / Bharatiya Nyaya Sanhita 2023 / Constitution of India',
                sourceCitation: `${syllabusVer.sourceTitle}, Page ${unit.unitNumber + 1}`,
                sourcePage: unit.unitNumber + 1,
                isCurrent: true,
                verificationStatus: 'VERIFIED_CURRENT'
              }
            });

            // Clean previous subTopics to avoid duplicate insertion
            await prisma.subTopic.deleteMany({ where: { topicId: dbTopic.id } });

            // SubTopics
            if (topic.subTopics && topic.subTopics.length > 0) {
              for (let i = 0; i < topic.subTopics.length; i++) {
                await prisma.subTopic.create({
                  data: {
                    topicId: dbTopic.id,
                    orderIndex: i + 1,
                    title: topic.subTopics[i],
                    content: `Comprehensive examination notes and legal analysis for ${topic.subTopics[i]}.`
                  }
                });
              }
            }

            // Notes
            let simpleNoteText = `${topic.title} is an essential concept under ${subj.title}.`;
            let detailedNoteText = `${simpleNoteText}\n\nKey Statutory Framework:\n1. Statutory basis under applicable legislation.\n2. Essential elements required for legal compliance.\n3. Landmark Supreme Court precedents and ratio decidendi.`;
            let keyPointsArr = ['Core Definition', 'Essential Ingredients', 'Exceptions & Provisos', 'Judicial Interpretation'];

            if (topic.notes) {
              if (typeof topic.notes === 'string') {
                simpleNoteText = topic.notes;
                detailedNoteText = `${topic.notes}\n\nKey Statutory Framework:\n1. Statutory basis.\n2. Essential elements.\n3. Landmark precedents.`;
              } else if (typeof topic.notes === 'object') {
                simpleNoteText = topic.notes.simple || simpleNoteText;
                detailedNoteText = topic.notes.detailed || detailedNoteText;
                if (topic.notes.keyPoints) keyPointsArr = topic.notes.keyPoints;
              }
            }

            const noteId = `note-${dbTopic.id}`;
            await prisma.note.upsert({
              where: { id: noteId },
              update: {
                simpleNotes: simpleNoteText,
                detailedNotes: detailedNoteText,
                keyPoints: JSON.stringify(keyPointsArr),
                mnemonics: JSON.stringify(['Mnemonic: 4-Step Analysis (IRAC: Issue, Rule, Application, Conclusion)']),
                status: 'PUBLISHED',
                verifiedById: adminUser.id
              },
              create: {
                id: noteId,
                topicId: dbTopic.id,
                language: 'EN',
                simpleNotes: simpleNoteText,
                detailedNotes: detailedNoteText,
                keyPoints: JSON.stringify(keyPointsArr),
                mnemonics: JSON.stringify(['Mnemonic: 4-Step Analysis (IRAC: Issue, Rule, Application, Conclusion)']),
                status: 'PUBLISHED',
                verifiedById: adminUser.id
              }
            });

            // Descriptive Question
            const questionText = `Explain the essential principles, statutory provisions, and judicial precedents governing "${topic.title}".`;
            const qCount = await prisma.question.count({ where: { topicId: dbTopic.id } });
            if (qCount === 0) {
              const q = await prisma.question.create({
                data: {
                  topicId: dbTopic.id,
                  questionText: questionText,
                  questionTextGu: `"${topic.title}" ને લગતી કાનૂની જોગવાઈઓ અને ચુકાદાઓ વિગતવાર સમજાવો.`,
                  marks: 14,
                  difficulty: 'MEDIUM',
                  preparationPriority: 'HIGH',
                  pyqFrequency: 3,
                  questionType: 'DESCRIPTIVE',
                  status: 'PUBLISHED',
                  priority_score: 85.0,
                  priority_label: 'High Priority',
                  why_important: `Core syllabus question frequently asked in ${subj.universityId.toUpperCase()} LLB semester exams.`,
                  syllabusVersionId: syllabusVer.id,
                  syllabusStatus: 'CURRENT'
                }
              });

              await prisma.questionAnswer.create({
                data: {
                  questionId: q.id,
                  language: 'EN',
                  answerText: `Model IRAC Answer for ${topic.title}:\n\n1. Issue & Introduction:\nDefine the legal scope.\n\n2. Statutory Rule:\nCite relevant sections.\n\n3. Landmark Ratio:\nApply precedent.\n\n4. Conclusion:\nSynthesize legal consequence.`,
                  keyPoints: JSON.stringify(['Definition', 'Statutory Section', 'Landmark Precedent', 'Application']),
                  judicialCitations: JSON.stringify(['Supreme Court of India Landmark Rulings']),
                  modelStructure: JSON.stringify(['Introduction', 'Statutory Framework', 'Case Law Analysis', 'Conclusion']),
                  isVerified: true,
                  verifiedById: adminUser.id
                }
              });
            }

            // MCQ
            const mcqCount = await prisma.mcq.count({ where: { topicId: dbTopic.id } });
            if (mcqCount === 0) {
              const mcq = await prisma.mcq.create({
                data: {
                  topicId: dbTopic.id,
                  subjectId: dbSubj.id,
                  questionText: `Which of the following is an essential legal requirement regarding "${topic.title}"?`,
                  questionTextGu: `"${topic.title}" બાબતે નીચેનામાંથી કઈ બાબત કાનૂની રીતે આવશ્યક છે?`,
                  difficulty: 'MEDIUM',
                  preparationPriority: 'HIGH',
                  explanation: `In the context of ${topic.title}, statutory compliance requires adherence to essential elements prescribed by law.`,
                  explanationGu: `કાયદા અનુસાર ${topic.title} માટે જરૂરી શરતોનું પાલન કરવું ફરજિયાત છે.`,
                  status: 'PUBLISHED',
                  syllabusVersionId: syllabusVer.id,
                  syllabusStatus: 'CURRENT'
                }
              });

              const optionsData = [
                { key: 'A', text: 'Fulfilment of statutory conditions and valid legal procedure', correct: true },
                { key: 'B', text: 'Arbitrary administrative discretion without justification', correct: false },
                { key: 'C', text: 'Retrospective application without legislative sanction', correct: false },
                { key: 'D', text: 'Total absence of judicial review mechanism', correct: false }
              ];

              for (const opt of optionsData) {
                await prisma.mcqOption.create({
                  data: {
                    mcqId: mcq.id,
                    optionKey: opt.key,
                    optionText: opt.text,
                    optionTextGu: `${opt.text} (ગુજરાતી વિકલ્પ)`,
                    isCorrect: opt.correct
                  }
                });
              }
            }
          }
        }
      }
    }
  }

  // 6.1 Seed a Sample PENDING_REVIEW Syllabus Version & Detected Changes (for Admin Diff Testing)
  console.log('🔍 Seeding Pending Review Syllabus Version & Change Detection Diffs...');
  const pendingVerId = 'ver-gu-sem1-2027-28-pending';
  const pendingVer = await prisma.syllabusVersion.upsert({
    where: { id: pendingVerId },
    update: {
      status: 'PENDING_REVIEW',
      isCurrent: false
    },
    create: {
      id: pendingVerId,
      universityId: 'gu',
      courseId: 'gu-llb-3yr',
      academicYear: '2027-28',
      semesterNumber: 1,
      version: '2.0-DRAFT',
      status: 'PENDING_REVIEW',
      isCurrent: false,
      sourceUrl: 'https://www.gujaratuniversity.ac.in/circulars/syllabus-revision-2027-28.pdf',
      sourceDocumentUrl: 'https://www.gujaratuniversity.ac.in/circulars/syllabus-revision-2027-28.pdf',
      sourceTitle: 'Gujarat University LL.B. Revised Criminal Law & Digital Evidence Gazette Notification (2027-28)',
      sourcePublishedDate: new Date('2026-09-18'),
      retrievedAt: new Date(),
      contentHash: calculateHash('gu-sem1-2027-28-pending-revision-payload'),
      confidenceScore: 0.96,
      extractionNotes: 'Automatically detected new circular notification from Gujarat University academic board. Awaiting admin review.'
    }
  });

  // Seed sample change records
  const sampleChanges = [
    {
      syllabusVersionId: pendingVer.id,
      changeType: 'ADDED',
      entityType: 'TOPIC',
      fieldName: 'Digital Evidence in Criminal Trials',
      oldValue: null,
      newValue: 'Bharatiya Sakshya Adhiniyam (BSA 2023) Electronic Record Certificate Sec 63',
      summary: 'Added new topic on Digital and Electronic Records admissibility under BSA Section 63.',
      summaryGu: 'BSA સેક્શન 63 હેઠળ ડિજિટલ પુરાવાની ગ્રાહ્યતા અંગે નવો મુદ્દો ઉમેરાયો.',
      confidence: 0.98,
      status: 'PENDING_REVIEW'
    },
    {
      syllabusVersionId: pendingVer.id,
      changeType: 'MODIFIED',
      entityType: 'UNIT',
      fieldName: 'Cheating & Financial Fraud Unit',
      oldValue: 'IPC Section 420 Conventional Cheating',
      newValue: 'BNS Section 318 & Cyber Identity Fraud with Mandatory Restitution',
      summary: 'Modified Unit 3 curriculum to incorporate cyber fraud and organized economic offences.',
      summaryGu: 'યુનિટ 3 માં સાયબર ફ્રોડ અને સંગઠિત આર્થિક ગુનાઓનો સુધારો કરવામાં આવ્યો.',
      confidence: 0.95,
      status: 'PENDING_REVIEW'
    },
    {
      syllabusVersionId: pendingVer.id,
      changeType: 'REMOVED',
      entityType: 'TOPIC',
      fieldName: 'Repealed Criminal Procedure Provisions',
      oldValue: 'CrPC 1973 Section 438 Transit Bail Obsolete Procedures',
      newValue: null,
      summary: 'Removed outdated procedural concepts superseded by BNSS Section 482.',
      summaryGu: 'જૂની CrPC ની રદ થયેલી જોગવાઈઓ દૂર કરવામાં આવી.',
      confidence: 0.94,
      status: 'PENDING_REVIEW'
    }
  ];

  for (const chg of sampleChanges) {
    await prisma.syllabusChange.create({
      data: chg
    });
  }

  // 6.2 Seed Initial Sync Job Log
  await prisma.syllabusSyncJob.create({
    data: {
      sourceId: 'src-gu-law',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
      status: 'SUCCESS',
      documentsFound: 3,
      documentsChanged: 1,
      changesDetected: 3,
      documentUrl: 'https://www.gujaratuniversity.ac.in/circulars/syllabus-revision-2027-28.pdf',
      documentHash: calculateHash('gu-sem1-2027-28-pending-revision-payload'),
      syllabusVersionId: pendingVer.id,
      rawPayload: JSON.stringify({ university: 'Gujarat University', program: 'LL.B', academicYear: '2027-28' })
    }
  });

  // 7. Seed Legal Sections (Bare Acts)
  console.log('⚖️ Seeding Legal Bare Act Sections...');
  for (const item of IPC_VS_BNS_MAP) {
    const cleanNum = item.bns.replace(/[^0-9]/g, '');
    if (!cleanNum) continue;

    const punText = item.bnsPunishment || 'Imprisonment and Fine';

    await prisma.legalSection.upsert({
      where: {
        actName_sectionNumber: {
          actName: 'BNS 2023',
          sectionNumber: cleanNum
        }
      },
      update: {
        title: item.bnsTitle,
        titleGu: `${item.bnsTitle} (BNS જોગવાઈ)`,
        content: `Bharatiya Nyaya Sanhita (BNS 2023) provision for ${item.bnsTitle}. Replaces old ${item.ipc} (${item.ipcTitle}).`,
        contentGu: `ભારતીય ન્યાય સંહિતા ૨૦૨૩ અંતર્ગત ${item.bnsTitle} ની કાનૂની જોગવાઈ. જૂની કલમ: ${item.ipc}.`,
        oldLawSection: item.ipc,
        oldLawAct: 'IPC 1860',
        punishment: punText,
        punishmentGu: punText
      },
      create: {
        id: `sec-bns-${cleanNum}`,
        actName: 'BNS 2023',
        sectionNumber: cleanNum,
        title: item.bnsTitle,
        titleGu: `${item.bnsTitle} (BNS જોગવાઈ)`,
        content: `Bharatiya Nyaya Sanhita (BNS 2023) provision for ${item.bnsTitle}. Replaces old ${item.ipc} (${item.ipcTitle}).`,
        contentGu: `ભારતીય ન્યાય સંહિતા ૨૦૨૩ અંતર્ગત ${item.bnsTitle} ની કાનૂની જોગવાઈ. જૂની કલમ: ${item.ipc}.`,
        oldLawSection: item.ipc,
        oldLawAct: 'IPC 1860',
        punishment: punText,
        punishmentGu: punText,
        bailableStatus: punText.toLowerCase().includes('death') || punText.toLowerCase().includes('life') ? 'Non-Bailable' : 'Bailable',
        cognizableStatus: 'Cognizable',
        compoundableStatus: 'Non-Compoundable'
      }
    });
  }

  // 8. Seed Landmark Case Laws
  console.log('⚖️ Seeding Landmark Case Laws...');
  for (const c of LANDMARK_CASES) {
    await prisma.caseLaw.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        citation: c.citation,
        year: c.year,
        bench: c.bench,
        subjectName: c.subject,
        keyPrinciple: c.keyPrinciple,
        ratioDecidendi: c.ratio,
        importance: c.importance || 'LANDMARK',
        status: 'PUBLISHED'
      },
      create: {
        id: c.id,
        title: c.title,
        citation: c.citation,
        year: c.year,
        bench: c.bench,
        subjectName: c.subject,
        keyPrinciple: c.keyPrinciple,
        keyPrincipleGu: `${c.keyPrinciple} (મહત્વનો કાનૂની સિદ્ધાંત)`,
        facts: c.facts || 'Key factual matrix establishing constitutional and statutory questions of law.',
        issues: c.issues || 'Whether the constitutional amendment or statutory action is ultra vires.',
        judgment: c.judgment || 'Supreme Court bench delivered the authoritative ruling establishing precedent.',
        ratioDecidendi: c.ratio,
        ratioDecidendiGu: `${c.ratio} (ચુકાદાનો મુખ્ય આધાર)`,
        importance: c.importance || 'LANDMARK',
        status: 'PUBLISHED'
      }
    });
  }

  // 9. Seed Audit Logs
  console.log('📝 Seeding Platform Audit Trail...');
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'APPROVED',
      entityType: 'SYLLABUS_VERSION',
      entityId: 'ver-gu-sem1-2026-27',
      oldValue: 'PENDING_REVIEW',
      newValue: 'VERIFIED_CURRENT',
      details: 'Chief Legal Editor verified Gujarat University LL.B. Semester 1 curriculum against official Gazette.'
    }
  });

  console.log('✅ LowStudy Relational Database Seeding Completed Successfully! All models and Syllabus Intelligence entities populated.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
