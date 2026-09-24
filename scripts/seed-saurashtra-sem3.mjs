import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verified Official Syllabus Data for Saurashtra University LL.B. 3-Year Semester 3
export const SAURASHTRA_SEM3_SYLLABUS = [
  {
    code: '220301',
    title: 'Labour and Industrial Law - I',
    marks: 100,
    credits: 5,
    category: 'Core Law',
    syllabusVersion: 'new',
    color: 'from-blue-600 to-indigo-900',
    description: 'Constitutional framework of labour protection, industrial dispute resolution under the Industrial Disputes Act, 1947, economic coercion mechanisms, statutory closure procedures, and Gujarat Industrial Relations Act.',
    units: [
      {
        unitNumber: 1,
        title: 'The Industrial Disputes Act, 1947 - Scope, Objects and Key Definitions',
        description: 'Evolution of labour jurisprudence, constitutional directives under Articles 39, 41, 42, and 43, foundational definitions, and adjudicatory machinery.',
        topics: [
          {
            topicNumber: 1,
            title: 'Historical Background and Constitutional Mandate of Labour Protection',
            description: 'Socio-economic background of industrial law in India, fundamental rights, and Directive Principles of State Policy on workers rights.',
            subtopics: [
              { title: 'Evolution of Trade Disputes Legislation from 1929 to 1947', content: 'Historical progression from colonial dispute control to democratic welfare industrial legislation.' },
              { title: 'Constitutional Directives on Living Wages and Decent Standard of Life', content: 'Application of Articles 21, 23, 24, 39, 41, 42, and 43A of the Constitution of India in labour welfare.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Concept of Industry under Section 2(j)',
            description: 'Statutory definition of Industry and Landmark judicial interpretations from Banerji to Bangalore Water Supply.',
            subtopics: [
              { title: 'Triple Test Formula in Bangalore Water Supply v. A. Rajappa', content: 'Systematic activity, organized cooperation between employer and employee, for the production/distribution of goods and services.' },
              { title: 'Excluded Categories and Sovereign Functions Doctrine', content: 'Clubs, educational institutions, hospitals, charitable trusts, and government departments exercising sovereign functions.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Industrial Dispute and Individual Dispute (Section 2(k) & Section 2A)',
            description: 'Elements of industrial disputes and transformation of individual disputes into industrial disputes with or without trade union espousal.',
            subtopics: [
              { title: 'Essential Ingredients of Industrial Dispute under Section 2(k)', content: 'Factum of dispute, parties to dispute, subject-matter of dispute (employment, non-employment, terms of employment).' },
              { title: 'Section 2A: Dismissal, Discharge, and Retrenchment of an Individual Workman', content: 'Deemed industrial dispute without trade union espousal inserted by 1965 amendment.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Definition of Workman under Section 2(s)',
            description: 'Criteria to determine workman status, inclusion and exclusion of managerial, administrative, and supervisory staff.',
            subtopics: [
              { title: 'Tests of Supervisory vs Clerical and Manual Work', content: 'Dominant nature of duties, powers of sanction, control test, and salary threshold for supervisors.' },
              { title: 'Exclusion of Part-Time, Professional, and Managerial Cadres', content: 'Judicial tests excluding managers, corporate directors, freelance professionals, and armed forces.' }
            ]
          },
          {
            topicNumber: 5,
            title: 'Dispute Settlement Authorities under the Industrial Disputes Act',
            description: 'Constitution, jurisdiction, powers, and duties of conciliation, inquiry, and adjudication authorities.',
            subtopics: [
              { title: 'Conciliation Machinery: Works Committee and Conciliation Officers', content: 'Internal shop-floor democracy, bi-partite committees, conciliation meetings, failure reports under Section 12(4).' },
              { title: 'Adjudication Bodies: Labour Courts, Industrial Tribunals & National Tribunals', content: 'Second and Third Schedules, references under Section 10, voluntary arbitration under Section 10A, and binding force of awards.' }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Instruments of Economic Coercion: Strikes and Lock-outs',
        description: 'Statutory framework governing collective cessation of work, employer countermeasures, prohibitions, and legal consequences.',
        topics: [
          {
            topicNumber: 1,
            title: 'Statutory Concept and Definition of Strike under Section 2(q)',
            description: 'Cessation of work by persons employed in an industry acting in combination or concerted refusal to work.',
            subtopics: [
              { title: 'Forms and Varieties of Strikes', content: 'Stay-in strike, sit-down strike, tool-down strike, pen-down strike, go-slow, work-to-rule, sympathetic strike, and hunger strike.' },
              { title: 'Constitutional Status of Strike: Fundamental Right vs Statutory Right', content: 'Kameshwar Prasad v. State of Bihar and T.K. Rangarajan v. Government of Tamil Nadu rulings.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Statutory Concept and Definition of Lock-out under Section 2(l)',
            description: 'Temporary closing of a place of employment or suspension of work or refusal by an employer to continue employing workers.',
            subtopics: [
              { title: 'Distinction between Lock-out and Closure', content: 'Lock-out as a weapon of coercion during dispute vs closure as permanent cessation of business.' },
              { title: 'Lock-out vs Lay-off and Retrenchment', content: 'Differences in intent, compensation liabilities, and procedural mandates.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'General and Specific Prohibitions of Strikes and Lock-outs (Sections 22 & 23)',
            description: 'Mandatory statutory notice requirements in public utility services and general prohibitions during pendency of proceedings.',
            subtopics: [
              { title: 'Section 22: Six Weeks Notice Rule in Public Utility Services', content: 'Notice of strike/lock-out within six weeks, prohibition within fourteen days, and during conciliation.' },
              { title: 'Section 23: General Prohibition during Pendency of Adjudication', content: 'Bar on strikes and lock-outs during proceedings before Labour Court, Tribunal, and National Tribunal.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Illegal Strikes, Illegal Lock-outs and Wage Consequences',
            description: 'Determination of legality and justification of strikes and lock-outs, and right to wages.',
            subtopics: [
              { title: 'Section 24: When Strikes and Lock-outs become Illegal', content: 'Violation of Section 22 and Section 23 rendering strikes or lock-outs illegal ab initio.' },
              { title: 'Doctrine of "No Work, No Pay" and Wages for Strike Period', content: 'Syndicate Bank v. K. Umesh Nayak: Legal and justified strikes qualifying for wage entitlement.' }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Lay-off, Retrenchment, Transfer and Closure of Undertakings',
        description: 'Statutory protections of employment continuity, compensation schemes, and special restrictions under Chapter V-A and Chapter V-B.',
        topics: [
          {
            topicNumber: 1,
            title: 'Concept and Definition of Lay-off under Section 2(kkk)',
            description: 'Failure, refusal, or inability of employer to give employment due to shortage of coal, power, raw materials, or breakdown of machinery.',
            subtopics: [
              { title: 'Conditions for Valid Lay-off and Right of Workmen to Compensation', content: 'Section 25C: 50% basic wages and dearness allowance for laid-off workmen having completed continuous service.' },
              { title: 'Muster Roll and Alternative Employment Obligations', content: 'Section 25E: Forfeiture of compensation on refusal of alternative employment within 5 miles.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Continuous Service under Section 25B and Retrenchment under Section 2(oo)',
            description: 'Statutory formula for 240 days continuous service and the comprehensive definition of retrenchment with exceptions.',
            subtopics: [
              { title: 'Calculation of Continuous Service for 240 Days', content: 'Preceding 12 calendar months computation including paid leaves, maternity leaves, and legal lock-outs.' },
              { title: 'Statutory Exceptions to Retrenchment (Sub-clauses a, b, bb, c)', content: 'Voluntary retirement, superannuation, non-renewal of contract on expiry, and termination on grounds of continued ill-health.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Conditions Precedent to Retrenchment and Principle of Last Come, First Go',
            description: 'Strict mandatory requirements under Section 25F and procedural mandates under Section 25G and 25H.',
            subtopics: [
              { title: 'Section 25F: One Month Notice, Notice Pay, and Compensation', content: 'Fifteen days average pay for every completed year of service as condition precedent; invalidity of retrenchment on default.' },
              { title: 'Section 25G & 25H: Rule of Seniority and Preference in Re-employment', content: 'Seniority category-wise retrenchment and mandatory notice of vacancy to retrenched workmen.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Special Provisions under Chapter V-B and Unfair Labour Practices',
            description: 'Stringent government permission mandates for establishments employing 100 or more workmen and the Fifth Schedule.',
            subtopics: [
              { title: 'Chapter V-B: Prior Government Permission for Lay-off, Retrenchment, and Closure', content: 'Sections 25K, 25M, 25N, and 25-O: Mandatory 90-day application and constitutional validity under Excel Wear.' },
              { title: 'Unfair Labour Practices under Section 25T & 25U and Fifth Schedule', content: 'Prohibited employer and trade union practices, victimisation, gherao, refusal to bargain, and criminal penalties.' }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Gujarat Industrial Relations Act & Collective Bargaining',
        description: 'State industrial framework under the Gujarat Industrial Relations Act (formerly Bombay Industrial Relations Act, 1946) and collective bargaining dynamics.',
        topics: [
          {
            topicNumber: 1,
            title: 'Historical Genesis, Scope and Important Definitions of Gujarat Industrial Relations Act',
            description: 'History of BIR Act in Gujarat, applicability to scheduled industries (Textile, Banking, Silk), and statutory definitions.',
            subtopics: [
              { title: 'Definitions of Industry, Employee, Employer, and Wage Board', content: 'Wide coverage of direct and contract labour in scheduled local areas of Gujarat state.' },
              { title: 'Registration of Unions: Primary Union, Qualified Union, and Representative Union', content: 'Membership percentage thresholds (minimum 25% for Representative Union in local area).' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Representative Union: Rights, Duties, and Exclusive Status',
            description: 'Sole collective bargaining agent status of Representative Union under GIR Act.',
            subtopics: [
              { title: 'Exclusive Right to Appear and Act in Industrial Proceedings', content: 'Section 27A, 32, and 33: Bar on individual employees where Representative Union exists.' },
              { title: 'Collection of Subscriptions, Meeting Premises, and Duty of Fair Representation', content: 'Statutory privileges on employer premises and check-off system rights.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Notice of Change Procedure under Sections 42 and 43',
            description: 'Mechanism governing alteration of service conditions in Schedule I, II, and III matters.',
            subtopics: [
              { title: 'Employer Notice of Change (Schedule II Matters)', content: 'Reduction in staff, rationalization, shift working, wages, and mandatory agreement or tribunal order.' },
              { title: 'Employee Notice of Change (Schedule I and III Matters)', content: 'Approach letter procedure under Section 42(4) before approaching Labour Court.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Principles, Stages and Enforceability of Collective Bargaining',
            description: 'Voluntary negotiations between management and representative trade unions, stages of bargaining, and legal status.',
            subtopics: [
              { title: 'Pre-requisites and Negotiation Stages in Collective Bargaining', content: 'Charter of demands, drafting committee, good faith negotiations, and impasse resolution.' },
              { title: 'Legal Sanctity and Enforcement of Collective Agreements', content: 'Section 18 of Industrial Disputes Act vs Sections 44 and 114 of Gujarat Industrial Relations Act.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '220302',
    title: 'Labour and Industrial Law - II',
    marks: 100,
    credits: 5,
    category: 'Core Law',
    syllabusVersion: 'new',
    color: 'from-cyan-600 to-blue-900',
    description: 'Workplace safety, health, and welfare under the Factories Act, 1948, minimum and fair wages statutes, and social security enactments (ESI, Gratuity, EPF, and Employees Compensation).',
    units: [
      {
        unitNumber: 1,
        title: 'The Factories Act, 1948 - Safety, Health and Welfare',
        description: 'Comprehensive occupational health, machine guarding, factory hygiene, working hours, and female employment regulations.',
        topics: [
          {
            topicNumber: 1,
            title: 'Objects, Scope and Key Definitions under Factories Act, 1948',
            description: 'Legislative intent to ensure humane conditions of labour in manufacturing premises.',
            subtopics: [
              { title: 'Definitions: Factory (Sec 2(m)), Manufacturing Process (Sec 2(k)), Worker (Sec 2(l))', content: '10 or more workers with power, 20 or more without power; direct/contract manufacturing nexus.' },
              { title: 'Definition and Liabilities of Occupier (Section 2(n))', content: 'Ultimate control test, mandatory designation of partner/director as occupier, and general duties under Section 7A.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Health and Cleanliness Provisions (Sections 11 to 20)',
            description: 'Mandatory environmental standards inside factory workrooms.',
            subtopics: [
              { title: 'Cleanliness, Disposal of Wastes, Ventilation and Temperature', content: 'Daily sweeping, white-washing every 14 months, effluent treatment, fresh air circulation.' },
              { title: 'Dust, Fumes, Overcrowding, Lighting, and Drinking Water', content: 'Exhaust appliances, 500 cubic feet per worker, wholesome drinking water (cool water if >250 workers).' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Safety Measures and Precautions against Machinery (Sections 21 to 41)',
            description: 'Stringent statutory safeguards against industrial hazards and hazardous processes.',
            subtopics: [
              { title: 'Fencing of Machinery, Work on Machinery in Motion, and Employment on Dangerous Machines', content: 'Secure fencing by substantial construction, ban on women and young persons cleaning moving machinery.' },
              { title: 'Hoists, Lifts, Pressure Plants, Explosive Gases, and Special Provisions for Hazardous Processes', content: 'Chapter IV-A: Site appraisal committee, compulsory disclosure of hazards, and emergency contingency plans.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Welfare Measures, Working Hours, and Employment of Women & Children',
            description: 'Welfare amenities, shift timings, overtime pay, and youth employment protection.',
            subtopics: [
              { title: 'Welfare Facilities (Sections 42-50): Washing, Canteens, Creches, and Welfare Officers', content: 'Canteens (>250 workers), rest shelters (>150 workers), creches (>30 women workers), Welfare Officers (>500 workers).' },
              { title: 'Working Hours of Adults, Overtime under Section 59, and Annual Leave with Wages', content: '48 hours weekly limit, 9 hours daily limit, double rate overtime pay, and 1 day leave for every 20 days work.' }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Wage Protection and Regulatory Legislations',
        description: 'Fixation, revision, and timely payment of statutory wages without unauthorized deductions.',
        topics: [
          {
            topicNumber: 1,
            title: 'Economic Concepts of Wages and the Minimum Wages Act, 1948',
            description: 'Living wage, fair wage, minimum wage concepts, and the constitutional validity of minimum wage fixation.',
            subtopics: [
              { title: 'Distinction between Living Wage, Fair Wage, and Minimum Wage', content: 'Committee on Fair Wages Report, Express Newspapers case, and Standard Vacuum Refining case.' },
              { title: 'Objects, Scope and Constitutional Validity of Minimum Wages Act, 1948', content: 'Bijay Cotton Mills v. State of Ajmer: Article 19(1)(g) reasonable restriction in public interest.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Procedure for Fixation and Revision of Minimum Rates of Wages (Section 5)',
            description: 'Committee method and notification method for scheduled employments.',
            subtopics: [
              { title: 'Committee Method vs Notification Method', content: 'Appointment of representative committees/sub-committees vs direct gazette draft notification and objections.' },
              { title: 'Advisory Boards, Central Advisory Board, and Components of Minimum Wage', content: 'Basic rate of wages, special allowance (Dearness Allowance/VDA linked to cost of living index).' }
            ]
          },
          {
            topicNumber: 3,
            title: 'The Payment of Wages Act, 1936: Scope and Time of Payment',
            description: 'Protection of employed persons against delayed and erratic wage disbursements.',
            subtopics: [
              { title: 'Scope, Application, and Fixation of Wage Periods (Sections 1 to 4)', content: 'Wage period not exceeding one month, responsibility of employer, manager, and contractor.' },
              { title: 'Time and Mode of Payment of Wages (Sections 5 & 6)', content: '7th day for <1000 workers, 10th day otherwise, payment in current legal tender/direct bank account.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Authorized Deductions, Claims and Penalties under Wage Enactments',
            description: 'Permissible deductions under Section 7 and adjudicatory machinery for wage claims.',
            subtopics: [
              { title: 'Permissible Deductions under Section 7 of Payment of Wages Act', content: 'Fines, absence from duty, damage to goods, house accommodation, advances, and income tax deductions.' },
              { title: 'Authority under Section 15 and Appeal under Section 17', content: 'Single application for multiple workmen, compensation up to ten times deducted amount, and penalty for non-compliance.' }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Social Security Framework: ESI Act and Gratuity Act',
        description: 'Comprehensive health insurance, sickness allowances, and lump-sum terminal retirement benefits.',
        topics: [
          {
            topicNumber: 1,
            title: 'The Employees State Insurance Act, 1948: Scope and Administrative Authorities',
            description: 'Socio-economic insurance coverage against sickness, maternity, and workplace accidents.',
            subtopics: [
              { title: 'Object, Scope, and Application to Factories and Notified Establishments', content: 'Non-seasonal factories using power with 10+ employees, wage ceiling applicability.' },
              { title: 'ESI Corporation, Standing Committee, and Medical Benefit Council', content: 'Constitution, tri-partite representation, and administration of Employees State Insurance Fund.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Contributions, Benefits and Employees Insurance Court (EI Court)',
            description: 'Statutory employer/employee contribution ratios and six vital medical/cash benefits.',
            subtopics: [
              { title: 'Six Statutory Benefits under ESI Act', content: 'Sickness benefit, maternity benefit, disablement benefit (temporary/permanent), dependants benefit, medical benefit, and funeral expenses.' },
              { title: 'Employees Insurance Court (EI Court): Jurisdiction, Powers, and Bar of Civil Courts', content: 'Exclusive jurisdiction over contribution and benefit disputes under Sections 74 and 75.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'The Payment of Gratuity Act, 1972: Scope and Entitlement',
            description: 'Statutory reward for long, continuous, and meritorious service.',
            subtopics: [
              { title: 'Object, Application, and Concept of Continuous Service (Section 2A)', content: 'Factories, mines, ports, shops, and establishments employing 10+ persons; continuous service calculation.' },
              { title: 'Eligibility Threshold: Five Years Continuous Service Requirement and Exceptions', content: 'Mandatory 5-year service except in cases of death or disablement due to accident/disease.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Calculation Formula, Forfeiture, and Recovery of Gratuity',
            description: 'Mathematical calculation rules, forfeiture grounds, and Controlling Authority powers.',
            subtopics: [
              { title: 'Calculation Formula for Monthly and Seasonal Employees (Section 4)', content: '15 days wages per year based on last drawn rate (15/26 x last drawn salary x completed years).' },
              { title: 'Forfeiture of Gratuity (Section 4(6)) and Controlling Authority Powers (Section 7)', content: 'Forfeiture only for riotous conduct, moral turpitude, or proven financial loss caused to employer.' }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Provident Funds, Employee Compensation & Special Welfare',
        description: 'Old age retirement funds, employers liability for workplace injuries, and maternal health protection.',
        topics: [
          {
            topicNumber: 1,
            title: 'The Employees Provident Funds and Miscellaneous Provisions Act, 1952',
            description: 'Compulsory thrift and retirement benefit mechanisms for industrial workers.',
            subtopics: [
              { title: 'Three Tripartite Schemes: EPF Scheme, Pension Scheme (EPS), and EDLI Scheme', content: '12% employer and 12% employee statutory contribution split across provident, pension, and insurance funds.' },
              { title: 'Determination and Recovery of Moneys due from Employers (Sections 7A to 7Q)', content: 'Quasi-judicial inquiries, assessment of escaped contributions, damages for delayed remittance under Section 14B.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'The Employees Compensation Act, 1923: Employers Liability for Compensation',
            description: 'Strict statutory liability of employers for injuries suffered during employment.',
            subtopics: [
              { title: 'Doctrine of "Arising out of and in the Course of Employment" (Section 3)', content: 'Causal connection between work hazard and personal injury; Doctrine of Notional Extension of time and place.' },
              { title: 'Defences of Employer and Occupational Diseases (Section 3(1) & Schedule III)', content: 'Wilful disobedience of safety guard rule, alcohol influence, and contracted occupational illnesses.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Calculation and Distribution of Compensation',
            description: 'Quantum assessment for death, permanent total/partial disablement, and temporary disablement.',
            subtopics: [
              { title: 'Computation under Section 4 for Death and Permanent Total Disablement', content: '50% of monthly wages multiplied by relevant factor for death; 60% multiplied by factor for permanent disablement.' },
              { title: 'Powers of Commissioner for Employees Compensation and Appeals (Section 30)', content: 'Mandatory deposit of compensation with Commissioner; appeal to High Court only on substantial questions of law.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Salient Welfare Features of the Maternity Benefit Act, 1961',
            description: 'Paid maternity leave, nursing breaks, creche facilities, and anti-dismissal protections for female employees.',
            subtopics: [
              { title: '26 Weeks Paid Maternity Benefit and Eligibility Requirements', content: 'Working for at least 80 days in preceding 12 months, leave duration for up to two surviving children.' },
              { title: 'Prohibition of Work during Certain Periods and Job Security Protections', content: 'Bar on discharge or dismissal during pregnancy absence under Section 12.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '220303',
    title: 'Principles of Taxation Laws',
    marks: 100,
    credits: 5,
    category: 'Core Law',
    syllabusVersion: 'new',
    color: 'from-amber-600 to-yellow-900',
    description: 'Constitutional basis of taxation, Income Tax Act, 1961 fundamentals, five heads of income, deductions, assessment procedures, and Goods and Services Tax (GST) architecture.',
    units: [
      {
        unitNumber: 1,
        title: 'Constitutional Foundations & General Principles of Taxation',
        description: 'Concept of sovereignty in tax levies, distribution of legislative powers between Union and States, and fundamental canons.',
        topics: [
          {
            topicNumber: 1,
            title: 'Nature, Concept, and Characteristics of Taxes',
            description: 'Sovereign imposition for common public benefit without quid pro quo.',
            subtopics: [
              { title: 'Distinction between Tax, Fee, and Cess', content: 'Absence of direct quid pro quo in tax vs special service benefit in fee vs dedicated earmarking in cess.' },
              { title: 'Direct Taxes vs Indirect Taxes', content: 'Incidence vs impact of tax, shiftability of tax burden, progressive vs regressive features.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Constitutional Framework of Taxation in India',
            description: 'Articles 265, 246, and the Seventh Schedule distribution of taxing powers.',
            subtopics: [
              { title: 'Article 265: Taxes Not to be Imposed Save by Authority of Law', content: 'Requirement of valid legislative enactment, bar on executive and administrative tax levies.' },
              { title: 'Seventh Schedule Entries (List I and List II) and Residuary Taxing Powers', content: 'Union List Entries 82-92C, State List Entries 45-63, and Entry 97 residuary powers under Article 248.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Constitutional Limitations and Immunities in Tax Levies',
            description: 'Restrictions on state and union taxing powers under Articles 285 to 289.',
            subtopics: [
              { title: 'Immunity of Union Property from State Taxation (Article 285)', content: 'Federal supremacy and exemption of central government property from local and state municipal taxes.' },
              { title: 'Immunity of State Property and Income from Union Taxation (Article 289)', content: 'Sovereign governmental immunity vs commercial/trade operations of state governments.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Canons of Taxation, Tax Planning, Avoidance, and Evasion',
            description: 'Principles of efficient taxation and judicial doctrines distinguishing legitimate tax minimization from unlawful evasion.',
            subtopics: [
              { title: 'Adam Smiths Canons of Taxation', content: 'Canons of Equality/Ability, Certainty, Convenience, and Economy in tax administration.' },
              { title: 'Tax Planning vs Tax Avoidance vs Tax Evasion', content: 'McDowell & Co. Ltd. v. CTO and Vodafone International Holdings: Colorable devices vs bona fide commercial transactions.' }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Fundamental Concepts of Income Tax Act, 1961',
        description: 'Key statutory definitions, basis of charge, residential status, and scope of total income.',
        topics: [
          {
            topicNumber: 1,
            title: 'Statutory Definitions under Section 2 of Income Tax Act, 1961',
            description: 'Core concepts forming the base of income tax assessment and liability.',
            subtopics: [
              { title: 'Definitions: Assessee (Sec 2(7)), Person (Sec 2(31)), Income (Sec 2(24))', content: 'Natural persons, HUF, firm, company, AOP/BOI, local authority, artificial juridical person; inclusive definition of income.' },
              { title: 'Previous Year (Sec 3) and Assessment Year (Sec 2(9))', content: 'Financial year in which income is earned vs immediately succeeding financial year in which tax is assessed.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Basis of Charge under Section 4 and Determination of Residential Status (Section 6)',
            description: 'Annual charge of tax and test of territorial connection for individuals and corporations.',
            subtopics: [
              { title: 'Residential Status of Individuals (Section 6(1) & 6(6))', content: 'Resident & Ordinarily Resident (ROR), Resident but Not Ordinarily Resident (RNOR), and Non-Resident (NR) criteria.' },
              { title: 'Residential Status of HUF, Firms, Companies, and Place of Effective Management (POEM)', content: 'Control and management location, POEM test for foreign companies.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Scope of Total Income (Section 5) and Incomes Deemed to Accrue or Arise in India (Section 9)',
            description: 'Taxability matrix based on residence and source of income.',
            subtopics: [
              { title: 'Incidence of Tax based on Residential Status under Section 5', content: 'Global income taxation for ROR vs Indian source and remittance income for RNOR and Non-Residents.' },
              { title: 'Section 9: Business Connection, Royalties, Fees for Technical Services, and Salary', content: 'Deemed accrual in India through business connection, assets, or property located in India.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Incomes Exempt from Tax and Capital vs Revenue Receipts',
            description: 'Total exclusions under Section 10 and criteria for distinguishing capital from revenue receipts.',
            subtopics: [
              { title: 'Agricultural Income Exemption under Section 10(1) and Partial Integration Scheme', content: 'Definition under Section 2(1A), state legislative competence, and rate integration formula for non-agricultural income.' },
              { title: 'Distinction between Capital Receipts vs Revenue Receipts & Capital vs Revenue Expenditure', content: 'Fixed capital vs circulating capital, enduring benefit test, and taxability principles.' }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Heads of Income & Computation of Total Income',
        description: 'Computation of income under the five statutory heads, clubbing, set-off, and deductions.',
        topics: [
          {
            topicNumber: 1,
            title: 'Income from Salaries (Sections 15 to 17)',
            description: 'Taxation of compensation received under employer-employee relationship.',
            subtopics: [
              { title: 'Basis of Charge, Allowances, and Valuations of Perquisites', content: 'Due or received basis, House Rent Allowance (HRA), rent-free accommodation, motor car perquisite.' },
              { title: 'Deductions from Salary under Section 16', content: 'Standard deduction, entertainment allowance, and tax on employment/professional tax.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Income from House Property (Sections 22 to 27)',
            description: 'Taxation on annual value of buildings and lands appurtenant thereto owned by assessee.',
            subtopics: [
              { title: 'Determination of Annual Value (Gross Annual Value, Municipal Value, Fair Rent, Standard Rent)', content: 'Calculation of net annual value, deduction of municipal taxes paid by owner.' },
              { title: 'Deductions under Section 24: Standard 30% Deduction and Interest on Borrowed Capital', content: 'Flat statutory 30% deduction, interest limit for self-occupied vs let-out properties.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Profits and Gains of Business or Profession (Sections 28 to 44DB)',
            description: 'Commercial income, permissible business expenses, and statutory disallowances.',
            subtopics: [
              { title: 'Allowable Business Expenses (Sections 30 to 37)', content: 'Rent, rates, repairs, depreciation under Section 32, and general commercial expediency deduction under Section 37(1).' },
              { title: 'Disallowable Expenses (Section 40) and Presumptive Taxation Schemes (Section 44AD/44ADA)', content: 'TDS default disallowance, cash payments exceeding threshold under Section 40A(3), turnover presumptive schemes.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Capital Gains, Other Sources, Clubbing, and Chapter VI-A Deductions',
            description: 'Transfer of capital assets, residual income head, aggregation, and statutory tax rebates.',
            subtopics: [
              { title: 'Capital Gains (Sections 45 to 55A) and Income from Other Sources (Sections 56 to 59)', content: 'Short-term vs long-term capital assets, indexation, exemptions under Section 54; dividends, gifts, winning from lotteries.' },
              { title: 'Clubbing of Income (Sections 60-64), Set-Off of Losses, and Chapter VI-A Deductions (80C to 80U)', content: 'Spouse and minor child income aggregation; inter-head set-off; deductions for savings, health insurance, and donations.' }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Tax Administration, Assessment & Overview of GST',
        description: 'Administrative hierarchy, return filing, assessment types, dispute resolution, and Goods and Services Tax (GST).',
        topics: [
          {
            topicNumber: 1,
            title: 'Income Tax Authorities and Powers of Search and Seizure',
            description: 'CBDT, Principal Chief Commissioners, Assessing Officers, and investigative powers.',
            subtopics: [
              { title: 'Hierarchy and Jurisdiction of Income Tax Authorities', content: 'Central Board of Direct Taxes (CBDT), Directorates of Investigation, and Assessing Officers.' },
              { title: 'Powers of Discovery, Production of Evidence, Search and Seizure (Section 132)', content: 'Requisite belief, search warrants, panchnama procedure, and retention of seized books/assets.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Filing of Returns and Types of Assessment',
            description: 'Statutory compliance under Section 139 and various assessment methodologies.',
            subtopics: [
              { title: 'Return of Income under Section 139: Due Dates, Belated and Revised Returns', content: 'Mandatory filing thresholds, Section 139(1) deadlines, updated returns under Section 139(8A).' },
              { title: 'Types of Assessment: Self-Assessment (140A), Summary (143(1)), Scrutiny (143(3)), and Best Judgment (144)', content: 'Computerized intimation vs detailed audit vs ex-parte assessment on assessee default.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Appellate Machinery, Revisions, Penalties, and Advance Tax/TDS',
            description: 'Statutory appellate ladder, reassessment of escaped income, and collection mechanisms.',
            subtopics: [
              { title: 'Appellate Hierarchy: CIT(Appeals), Income Tax Appellate Tribunal (ITAT), High Court, Supreme Court', content: 'Appeals on facts and law to ITAT (final fact-finding authority), substantial question of law to High Court.' },
              { title: 'Collection and Recovery: Advance Tax, Tax Deducted at Source (TDS), and Penalties', content: 'Pay as you earn concept, TDS obligations of payer, penalty for misreporting and underreporting of income.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Overview of Goods and Services Tax (GST) Architecture',
            description: 'Constitutional amendment, dual tax model, and input credit mechanism of indirect taxation.',
            subtopics: [
              { title: '101st Constitutional Amendment Act, 2016 and Article 246A', content: 'Simultaneous taxing powers of Parliament and State Legislatures, creation of GST Council under Article 279A.' },
              { title: 'Structure of Dual GST (CGST, SGST, IGST) and Input Tax Credit (ITC) Mechanism', content: 'Destination-based consumption tax, continuous chain of tax credits, and seamless removal of cascading effect.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '220304',
    title: 'Principal of Banking Laws',
    marks: 100,
    credits: 5,
    category: 'Core Law',
    syllabusVersion: 'new',
    color: 'from-emerald-600 to-teal-900',
    description: 'Evolution of banking institutions, Reserve Bank of India regulation, Banking Regulation Act, 1949, banker-customer relationship, negotiable instruments, debt recovery tribunals, and electronic banking.',
    units: [
      {
        unitNumber: 1,
        title: 'Evolution, Nature and Regulatory Structure of Banking in India',
        description: 'History of banking in India, classification of institutions, constitutional competence, and central bank functions.',
        topics: [
          {
            topicNumber: 1,
            title: 'Historical Evolution and Definition of Bank in India',
            description: 'Indigenous banking, Presidency banks, evolution of joint-stock banking, and origin of the term bank.',
            subtopics: [
              { title: 'Etymology and Historical Evolution of Banking Institutions', content: 'Italian and German origins (Banco/Banc), development of commercial banking in pre- and post-independence India.' },
              { title: 'Social Control and Bank Nationalization (1969 & 1980)', content: 'RC Cooper v. Union of India: Nationalization of 14 major commercial banks in 1969 and 6 banks in 1980 for credit democratization.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Classification of Banks and Institutional Structure',
            description: 'Diversity of banking institutions operating under Indian regulatory ecosystem.',
            subtopics: [
              { title: 'Commercial Banks, Scheduled Banks, and Co-operative Banks', content: 'Second Schedule to RBI Act criteria, differences in capital requirements, multi-state co-operative banking.' },
              { title: 'Regional Rural Banks (RRBs), Small Finance Banks, and Payments Banks', content: 'Priority sector lending, rural credit financial inclusion, micro-finance and payment service providers.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Constitutional Perspectives and Legislative Competence',
            description: 'Entries relating to banking in the Seventh Schedule of the Constitution of India.',
            subtopics: [
              { title: 'Union List Entry 45: Banking Legislative Competence', content: 'Exclusive authority of Parliament over core banking functions and institutions.' },
              { title: 'State List Entry 32: Regulation of Co-operative Societies and Dual Control Conflict', content: 'Apex court rulings on co-operative banking regulation under Banking Regulation Act vs State Co-operative Societies Acts.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'The Reserve Bank of India Act, 1934: Role as Central Bank',
            description: 'Constitution, regulatory mandate, monetary policy, and credit control functions of the RBI.',
            subtopics: [
              { title: 'Constitution, Management, and Functions of RBI', content: 'Banker to government, banker to banks, sole authority for currency notes issuance, lender of last resort.' },
              { title: 'Monetary Policy and Credit Control Tools: CRR, SLR, Repo and Reverse Repo Rates', content: 'Quantitative credit controls (Cash Reserve Ratio, Statutory Liquidity Ratio) and qualitative credit selective controls.' }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'The Banking Regulation Act, 1949 & Licensing of Banking Companies',
        description: 'Comprehensive regulatory charter governing licensing, management, capital, lending, and liquidation of banks.',
        topics: [
          {
            topicNumber: 1,
            title: 'Objects, Scope, and Key Definitions of Banking Regulation Act, 1949',
            description: 'Statutory parameters defining legal banking operations and business restrictions.',
            subtopics: [
              { title: 'Definition of Banking (Section 5(b)) and Banking Company (Section 5(c))', content: 'Acceptance of deposits repayable on demand or otherwise, withdrawal by cheque, draft, or order, for lending or investment.' },
              { title: 'Permitted Business Forms (Section 6) and Prohibition on Trading (Section 8)', content: 'Ancillary financial services allowed vs absolute statutory prohibition on buying and selling goods for trade.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Licensing of Banking Companies and Minimum Capital Adequacy',
            description: 'Prudential norms for establishment, operation, and branch expansion in India.',
            subtopics: [
              { title: 'Licensing Conditions under Section 22 and Branch Expansion under Section 23', content: 'Solvency test, capability to pay depositors in full, public interest assessment, branch licensing norms.' },
              { title: 'Requirements as to Minimum Paid-up Capital, Reserves, and Maintenance of Liquid Assets', content: 'Capital Adequacy Ratio (CAR/CRAR) under Basel Accords, Statutory Liquidity compliance under Section 24.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Governance, Control over Advances, and Restrictions on Loans to Directors',
            description: 'Supervisory oversight preventing insider lending and systemic mismanagement.',
            subtopics: [
              { title: 'Section 20: Restrictions on Loans and Advances to Directors and Connected Firms', content: 'Absolute bar on granting loans against security of own shares, restrictions on director-related advances.' },
              { title: 'Section 21 & Section 35: Power of RBI to Control Advances and Conduct Inspection', content: 'Power to fix margin requirements, maximum loan limits, compulsory compliance with inspection reports.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Suspension of Business, Reconstruction, and Winding Up of Banks',
            description: 'Procedures for moratorium, emergency amalgamation, and judicial liquidation.',
            subtopics: [
              { title: 'Moratorium and Scheme of Reconstruction under Section 45', content: 'RBI application to Central Government for moratorium and forced amalgamation with healthy banks.' },
              { title: 'Winding Up of Banking Companies by High Court (Part III)', content: 'Appointment of RBI or official liquidator, expeditious payment to depositors, priority of small depositors.' }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Banker-Customer Relationship, Operations & Negotiable Instruments',
        description: 'Contractual rights, duties, special privileges, and statutory protection under the Negotiable Instruments Act, 1881.',
        topics: [
          {
            topicNumber: 1,
            title: 'Legal Nature of Banker-Customer Relationship',
            description: 'Contractual, fiduciary, and agency facets of banking relationships.',
            subtopics: [
              { title: 'Primary Debtor-Creditor Relationship (Foley v. Hill)', content: 'Banker as debtor of customer deposits, not a trustee; obligation to repay on demand during banking hours.' },
              { title: 'Special Relationships: Trustee, Agent, Bailee, and Pawnee', content: 'Safe custody of valuables (bailee), collection of bills (agent), escrow and special purpose deposits (trustee).' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Special Rights, Privileges, and Duties of Bankers',
            description: 'Statutory lien, set-off, confidentiality, and compliance with court mandates.',
            subtopics: [
              { title: 'Bankers General Lien (Section 171 Contract Act) and Right of Set-Off (Combination of Accounts)', content: 'Lien on securities in ordinary course of business; right to combine debit and credit accounts of same customer.' },
              { title: 'Duty of Secrecy (Tournier v. National Provincial Bank) and Garnishee Orders', content: 'Exceptions: Lawful compulsion, duty to public, banker interest, consent; Order 21 Rule 46 CPC Garnishee Order Nisi and Absolute.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Negotiable Instruments: Cheques, Crossing, and Endorsements',
            description: 'Instruments facilitating credit transactions and safety features of bank cheques.',
            subtopics: [
              { title: 'Definition and Essentials of Cheque, Bill of Exchange, and Promissory Note', content: 'Unconditional order/promise in writing, signed by maker, certain sum of money, payable on demand/at sight.' },
              { title: 'Types of Crossing: General Crossing, Special Crossing, Account Payee, and Not Negotiable', content: 'Protection against fraudulent encashment, Section 123-131 of Negotiable Instruments Act, 1881.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Rights & Protections of Paying and Collecting Bankers & Dishonour under Section 138',
            description: 'Statutory protection for payment in due course and penal sanctions for bounced cheques.',
            subtopics: [
              { title: 'Protection to Paying Banker (Sec 85) and Collecting Banker (Sec 131)', content: 'Payment in due course without negligence; good faith collection for customer without defective title liability.' },
              { title: 'Dishonour of Cheques for Insufficiency of Funds (Section 138 NI Act)', content: 'Statutory notice within 30 days, 15 days payment window, criminal complaint within 1 month, punishment up to 2 years.' }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Debt Recovery Tribunals, Electronic Banking & Ombudsman',
        description: 'Expeditious loan recovery systems, electronic payment legalities, and consumer redressal.',
        topics: [
          {
            topicNumber: 1,
            title: 'Recovery of Debts Due to Banks and Financial Institutions Act, 1993 (RDB Act)',
            description: 'Specialized tribunals for recovery of non-performing commercial loans.',
            subtopics: [
              { title: 'Constitution, Jurisdiction, and Powers of Debt Recovery Tribunal (DRT) and DRAT', content: 'Claims exceeding Rs. 20 Lakhs, summary inquiry procedures, exclusion of civil court jurisdiction.' },
              { title: 'Modes of Recovery by Recovery Officers (Section 25 to 28)', content: 'Attachment and sale of movable/immovable property, arrest and detention in civil prison, appointment of receiver.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Overview of SARFAESI Act, 2002',
            description: 'Securitization, asset reconstruction, and enforcement of security interest without court intervention.',
            subtopics: [
              { title: 'Enforcement of Security Interest under Section 13 without Court Intervention', content: '60 days demand notice under Section 13(2), symbolic and physical possession under Section 13(4).' },
              { title: 'Role of Chief Metropolitan Magistrate/District Magistrate (Section 14) and Appeal to DRT (Section 17)', content: 'Administrative assistance for physical possession, right of borrower to challenge bank action before DRT.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Modern Electronic Banking, Cyber Operations and RBI Ombudsman',
            description: 'Digital payment architectures, consumer safety, and redressal mechanisms.',
            subtopics: [
              { title: 'Core Banking Solutions, ATM, RTGS, NEFT, IMPS, and Unified Payments Interface (UPI)', content: 'Legal framework for digital funds transfers, electronic clearing services, and customer liability for unauthorized transactions.' },
              { title: 'Reserve Bank - Integrated Ombudsman Scheme, 2021', content: 'Cost-free dispute resolution for deficiency in banking services, pecuniary jurisdiction, and appellate authority.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'The Bankers Books Evidence Act, 1891: Evidentiary Proof of Bank Records',
            description: 'Special rules of evidence for banking ledgers, printouts, and certified copies.',
            subtopics: [
              { title: 'Certified Copies of Bankers Books and Prima Facie Evidence Rule', content: 'Section 4: Admissibility of certified entries in bankers books as prima facie proof of transactions recorded therein.' },
              { title: 'Special Certificate for Computer Printouts and Digital Ledger Proof', content: 'Compliance with Section 2A and Section 65B of Evidence Act for electronic banking records.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: '220305',
    title: 'Information Technology Laws and Cyber Crimes',
    marks: 100,
    credits: 5,
    category: 'Core Law',
    syllabusVersion: 'new',
    color: 'from-purple-600 to-indigo-950',
    description: 'Cyber law architecture under the Information Technology Act, 2000, digital signatures, electronic governance, computer crimes, civil penalties, cyber forensics, and data protection jurisprudence.',
    units: [
      {
        unitNumber: 1,
        title: 'Genesis, Architecture & Governance under the Information Technology Act, 2000',
        description: 'Origins of electronic law, UNCITRAL foundation, digital authentication, and regulatory authorities.',
        topics: [
          {
            topicNumber: 1,
            title: 'Genesis, Need and Scope of Information Technology Law in India',
            description: 'Growth of internet commerce, UNCITRAL Model Law on E-Commerce (1996), and legislative purpose.',
            subtopics: [
              { title: 'Statement of Objects and Reasons and Extraterritorial Jurisdiction (Sections 1 & 75)', content: 'Applicability to offences committed outside India involving any computer or network located in India.' },
              { title: 'Key Definitions under Section 2: Access, Computer, Computer Network, Electronic Record, Intermediary', content: 'Comprehensive technical definitions encompassing hardware, virtual systems, and communication platforms.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Legal Recognition of Electronic Records and Digital Signatures (Sections 3 to 10A)',
            description: 'Functional equivalence doctrine validating paperless contracts and transactions.',
            subtopics: [
              { title: 'Section 3 & 3A: Asymmetric Crypto System, Hash Function, and Electronic Signatures', content: 'Public key, private key encryption pair, mathematical verification, and technology-neutral electronic signatures.' },
              { title: 'Sections 4, 5, & 10A: Legal Validity of Electronic Records, Signatures, and Electronic Contracts', content: 'Statutory satisfaction of writing requirement; enforceability of contracts formed through electronic communications.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Electronic Governance (Sections 6 to 10)',
            description: 'Digitization of public administration, e-filing, and electronic gazette publications.',
            subtopics: [
              { title: 'Use of Electronic Records and Signatures in Government Agencies', content: 'Acceptance of filings, grant of licenses, electronic receipt issuance, and statutory retention of records.' },
              { title: 'Service Provider Contracts and Central Government Rule-Making Powers', content: 'Framework for public delivery of digital services through authorized portals.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Regulation of Certifying Authorities and Digital Signature Certificates',
            description: 'Public key infrastructure oversight by Controller of Certifying Authorities (CCA).',
            subtopics: [
              { title: 'Controller of Certifying Authorities (CCA): Powers, Functions, and Licensing (Sections 17-34)', content: 'Monitoring certifying authorities, licensing standards, recognized foreign certifying authorities.' },
              { title: 'Digital Signature Certificates (DSC): Issuance, Suspension, and Revocation (Sections 35-39)', content: 'Application procedure, verification of applicant identity, grounds for suspension and revocation of certificate.' }
            ]
          }
        ]
      },
      {
        unitNumber: 2,
        title: 'Cyber Crimes, Offences & Civil Penalties',
        description: 'Contraventions, damages, hacking, data theft, cyber terrorism, and safe harbour for intermediaries.',
        topics: [
          {
            topicNumber: 1,
            title: 'Civil Contraventions and Penalties under Chapter IX',
            description: 'Compensatory framework for computer damages and failure to protect sensitive data.',
            subtopics: [
              { title: 'Section 43: Penalty and Compensation for Damage to Computer and Computer System', content: 'Unauthorized access, downloading, virus introduction, denial of service, denial of access, damage to source code.' },
              { title: 'Section 43A: Compensation for Failure to Protect Sensitive Personal Data or Information (SPDI)', content: 'Corporate body liability for negligence in implementing reasonable security practices causing wrongful loss.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Hacking, Source Code Tampering, and Identity Theft',
            description: 'Criminal offences targeting computer resources, source documents, and digital identity.',
            subtopics: [
              { title: 'Section 65: Tampering with Computer Source Documents', content: 'Intentional or knowing concealment, destruction, or alteration of computer source code required to be maintained.' },
              { title: 'Section 66, 66C, & 66D: Computer-Related Offences, Identity Theft, and Cheating by Impersonation', content: 'Dishonest or fraudulent commission of Section 43 acts; electronic signature theft, password fraud, phishing attacks.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Cyber Terrorism, Voyeurism, and Privacy Violations',
            description: 'Severe national security and bodily privacy offences in cyberspace.',
            subtopics: [
              { title: 'Section 66E: Violation of Privacy and Voyeurism', content: 'Capturing, publishing, or transmitting images of private area of any person without consent; imprisonment up to 3 years.' },
              { title: 'Section 66F: Cyber Terrorism against Critical Infrastructure and National Sovereignty', content: 'Denial of access to authorized personnel, penetrating restricted computer systems, punishable with life imprisonment.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Obscenity, CSAM, and Intermediary Liability (Section 79)',
            description: 'Digital content regulation, child protection, and the landmark Shreya Singhal ruling.',
            subtopics: [
              { title: 'Sections 67, 67A, & 67B: Publishing Obscene and Sexually Explicit Acts in Electronic Form', content: 'Lascivious material, sexually explicit acts, child sexual abuse material (CSAM) with mandatory imprisonment.' },
              { title: 'Section 79: Intermediary Liability and Safe Harbour Doctrine (Shreya Singhal v. Union of India)', content: 'Due diligence guidelines, exemption from liability for third-party content, strike-down of Section 66A.' }
            ]
          }
        ]
      },
      {
        unitNumber: 3,
        title: 'Cyber Space Jurisdiction, Adjudication & Evidence',
        description: 'Extraterritorial conflicts, adjudicating officer proceedings, digital evidence, and police powers.',
        topics: [
          {
            topicNumber: 1,
            title: 'Jurisdictional Complexities and Doctrines in Cyberspace',
            description: 'Borderless nature of internet vs sovereign territorial limits.',
            subtopics: [
              { title: 'Territorial vs Virtual Boundaries and Theories of Cyber Jurisdiction', content: 'Personal jurisdiction, subject-matter jurisdiction, nationality principle, and passive vs interactive websites.' },
              { title: 'Minimum Contacts Doctrine and Long-Arm Jurisdiction in Cyber Disputes', content: 'International Zippo test, purposeful availment test, and Calder effects test in cross-border infringement.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Adjudication and Cyber Appellate Tribunal / TDSAT',
            description: 'Quasi-judicial machinery for inquiry into contraventions and civil penalties.',
            subtopics: [
              { title: 'Adjudicating Officer: Appointment, Powers of Civil Court, and Summary Inquiries', content: 'Section 46: Secretary of IT/judicial officer evaluating damages up to statutory pecuniary limits.' },
              { title: 'Appellate Machinery: TDSAT Powers, Procedure, and Appeals to High Court', content: 'Sections 48 to 62: Merged functions under Telecom Disputes Settlement and Appellate Tribunal, 60 days appeal window.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Police Powers of Search, Arrest, and Website Blocking',
            description: 'Interception, monitoring, and emergency website blocking mechanisms.',
            subtopics: [
              { title: 'Section 80: Powers of Police Officers to Enter, Search, and Arrest without Warrant', content: 'Entry into public places, searches conducted by Inspector of Police and above.' },
              { title: 'Section 69 & Section 69A: Power to Issue Directions for Interception and Blocking for Public Access', content: 'National security, public order, sovereignty grounds; Shreya Singhal safeguards for reasoned blocking orders.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'Digital Evidence and Cyber Forensics',
            description: 'Evidentiary admissibility of electronic records and preservation of integrity.',
            subtopics: [
              { title: 'Admissibility of Electronic Records under Section 65B of Evidence Act / Section 63 BSA 2023', content: 'Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal: Mandatory requirement of certificate for secondary electronic evidence.' },
              { title: 'Cyber Forensics: Hash Value Integrity, Chain of Custody, and Volatile Memory Capture', content: 'Forensic duplication, prevention of digital evidence contamination, CERT-In guidelines.' }
            ]
          }
        ]
      },
      {
        unitNumber: 4,
        title: 'Data Privacy, Emerging Technologies & International Cyber Framework',
        description: 'Digital personal data protection, emerging AI legal liabilities, cyber warfare, and global treaties.',
        topics: [
          {
            topicNumber: 1,
            title: 'Right to Privacy in the Digital Era and the DPDP Act, 2023',
            description: 'Constitutional status of informational privacy and statutory data governance.',
            subtopics: [
              { title: 'Justice K.S. Puttaswamy (Retd.) v. Union of India: Informational Self-Determination', content: 'Nine-judge bench ruling establishing right to privacy as fundamental right under Article 21.' },
              { title: 'Digital Personal Data Protection Act, 2023: Key Pillars and Principles', content: 'Data Principal, Data Fiduciary, Consent Manager, Notice requirements, cross-border data transfer rules, and Data Protection Board of India.' }
            ]
          },
          {
            topicNumber: 2,
            title: 'Cyber Warfare, Espionage, and Critical Information Infrastructure',
            description: 'State cybersecurity defense and protection of vital digital assets.',
            subtopics: [
              { title: 'Section 70: Protected Systems and Critical Information Infrastructure (CII)', content: 'Designation of protected systems in banking, power, telecom, defense; 10 years imprisonment for unauthorized access.' },
              { title: 'National Critical Information Infrastructure Protection Centre (NCIIPC) & CERT-In Directives', content: 'Mandatory 6-hour incident reporting, log retention for 180 days, national cyber defense posture.' }
            ]
          },
          {
            topicNumber: 3,
            title: 'Emerging Technologies and Legal Challenges: AI, Crypto, and Deepfakes',
            description: 'Disruptive digital developments and evolution of legal liability frameworks.',
            subtopics: [
              { title: 'Artificial Intelligence Liability and Algorithmic Bias', content: 'Civil and criminal accountability for autonomous agent decisions, intellectual property in AI generations.' },
              { title: 'Cryptocurrency, Blockchain, Smart Contracts, and Deepfakes / Synthesized Media', content: 'Virtual digital assets taxation, decentralized smart contract enforceability, IT Rules 2021 mandates on synthesized content.' }
            ]
          },
          {
            topicNumber: 4,
            title: 'International Cyber Framework and Conventions',
            description: 'Global consensus on transnational cybercrime investigations and cross-border cooperation.',
            subtopics: [
              { title: 'Budapest Convention on Cybercrime (2001): Harmonization and Jurisdictional Protocols', content: 'Substantive criminal law harmonization, procedural investigative powers, international mutual legal assistance.' },
              { title: 'UN Group of Governmental Experts (UNGGE) Norms and Future Global Cyber Treaties', content: 'Responsible state behavior in cyberspace, international law application to state-sponsored cyber operations.' }
            ]
          }
        ]
      }
    ]
  }
];

async function seedSaurashtraSem3() {
  console.log('🏛️ Seeding Saurashtra University LL.B. 3-Year Semester 3 Official Structure...\n');

  // 1. Ensure Saurashtra University exists
  const uni = await prisma.university.upsert({
    where: { code: 'SU' },
    update: {
      name: 'Saurashtra University',
      city: 'Rajkot',
      district: 'Rajkot',
      state: 'Gujarat',
      type: 'State Public University',
      established: 1967,
      logo: '📜',
      officialWebsite: 'https://www.saurashtrauniversity.edu',
      officialSyllabusSource: 'https://saurashtrauniversity.ac.in',
      status: 'VERIFIED',
      academicYear: '2026-27'
    },
    create: {
      id: 'su',
      name: 'Saurashtra University',
      code: 'SU',
      city: 'Rajkot',
      district: 'Rajkot',
      state: 'Gujarat',
      type: 'State Public University',
      established: 1967,
      logo: '📜',
      officialWebsite: 'https://www.saurashtrauniversity.edu',
      officialSyllabusSource: 'https://saurashtrauniversity.ac.in',
      status: 'VERIFIED',
      academicYear: '2026-27'
    }
  });
  console.log(`✅ University verified: ${uni.name} (${uni.code}) - ID: ${uni.id}`);

  // 2. Ensure Course "3-Year LL.B." exists for SU
  const courseId = 'su-llb-3yr';
  const course = await prisma.course.upsert({
    where: {
      universityId_code: {
        universityId: uni.id,
        code: 'LLB-3Y'
      }
    },
    update: {
      name: '3-Year LL.B. (Bachelor of Laws)',
      totalSemesters: 6,
      description: 'Professional three-year Bachelor of Laws degree programme under the Bar Council of India and Saurashtra University CBCS curriculum.',
      isActive: true
    },
    create: {
      id: courseId,
      universityId: uni.id,
      name: '3-Year LL.B. (Bachelor of Laws)',
      code: 'LLB-3Y',
      totalSemesters: 6,
      description: 'Professional three-year Bachelor of Laws degree programme under the Bar Council of India and Saurashtra University CBCS curriculum.',
      isActive: true
    }
  });
  console.log(`✅ Course verified: ${course.name} (${course.code}) - ID: ${course.id}`);

  // 3. Ensure Semester 3 exists for Course
  const semesterId = 'su-llb-3yr-sem3';
  const semester = await prisma.semester.upsert({
    where: {
      courseId_semesterNumber: {
        courseId: course.id,
        semesterNumber: 3
      }
    },
    update: {
      title: 'Semester 3'
    },
    create: {
      id: semesterId,
      courseId: course.id,
      semesterNumber: 3,
      title: 'Semester 3'
    }
  });
  console.log(`✅ Semester verified: ${semester.title} (Sem ${semester.semesterNumber}) - ID: ${semester.id}\n`);

  // 4. Remove any existing placeholder or old subjects for this semester to prevent duplicates/conflicts
  const existingSubjects = await prisma.subject.findMany({
    where: {
      semesterId: semester.id
    }
  });

  console.log(`🧹 Cleaning up ${existingSubjects.length} legacy/placeholder subject(s) in Semester 3...`);
  for (const es of existingSubjects) {
    // Cascade deletes units, topics, subtopics due to onDelete: Cascade
    await prisma.subject.delete({
      where: { id: es.id }
    });
  }
  console.log('✅ Clean slate prepared for official syllabus insertion.\n');

  // 5. Insert Verified Official Subjects, Units, Topics, and Subtopics
  console.log('📥 Inserting official subjects, units, topics, and subtopics...');
  let totalUnitsCount = 0;
  let totalTopicsCount = 0;
  let totalSubtopicsCount = 0;

  for (const subjData of SAURASHTRA_SEM3_SYLLABUS) {
    const subjectRecordId = `su-sem3-${subjData.code}`;

    const subject = await prisma.subject.create({
      data: {
        id: subjectRecordId,
        universityId: uni.id,
        courseId: course.id,
        semesterId: semester.id,
        title: subjData.title,
        shortCode: subjData.code,
        category: subjData.category,
        credits: subjData.credits,
        syllabusVersion: subjData.syllabusVersion,
        color: subjData.color,
        description: `${subjData.description} Total Marks: ${subjData.marks}. Credits: ${subjData.credits}.`,
        isActive: true
      }
    });

    console.log(`  📘 Subject [${subjData.code}] "${subjData.title}" (Credits: ${subjData.credits}, Marks: ${subjData.marks})`);

    for (const unitData of subjData.units) {
      totalUnitsCount++;
      const unitRecordId = `${subjectRecordId}-u${unitData.unitNumber}`;

      const unit = await prisma.unit.create({
        data: {
          id: unitRecordId,
          subjectId: subject.id,
          unitNumber: unitData.unitNumber,
          title: unitData.title,
          description: unitData.description
        }
      });

      for (const topicData of unitData.topics) {
        totalTopicsCount++;
        const topicRecordId = `${unitRecordId}-t${topicData.topicNumber}`;

        const topic = await prisma.topic.create({
          data: {
            id: topicRecordId,
            unitId: unit.id,
            topicNumber: topicData.topicNumber,
            title: topicData.title,
            description: topicData.description,
            language: 'EN',
            status: 'PUBLISHED'
          }
        });

        let orderIdx = 1;
        for (const subtopicData of topicData.subtopics) {
          totalSubtopicsCount++;
          await prisma.subTopic.create({
            data: {
              topicId: topic.id,
              orderIndex: orderIdx++,
              title: subtopicData.title,
              content: subtopicData.content
            }
          });
        }
      }
    }
  }

  console.log(`\n🎉 Insertion Complete:`);
  console.log(`   - 5 Subjects created`);
  console.log(`   - ${totalUnitsCount} Units created`);
  console.log(`   - ${totalTopicsCount} Topics created`);
  console.log(`   - ${totalSubtopicsCount} Subtopics created\n`);

  // 6. Comprehensive Verification Phase
  console.log('🔍 Running 8 Comprehensive Database Validations...\n');

  // Check 1: Verify subject count
  const verifySubjects = await prisma.subject.findMany({
    where: { semesterId: semester.id },
    orderBy: { shortCode: 'asc' }
  });
  if (verifySubjects.length !== 5) {
    throw new Error(`❌ Subject count mismatch: Expected 5, found ${verifySubjects.length}`);
  }
  console.log(`✅ 1. Subject Count: Verified 5/5 subjects.`);

  // Check 2: Verify every subject code
  const expectedCodes = ['220301', '220302', '220303', '220304', '220305'];
  const actualCodes = verifySubjects.map(s => s.shortCode);
  for (const code of expectedCodes) {
    if (!actualCodes.includes(code)) {
      throw new Error(`❌ Missing expected subject code: ${code}`);
    }
  }
  console.log(`✅ 2. Subject Codes: Verified all official codes [${actualCodes.join(', ')}].`);

  // Check 3: Verify every subject name
  const expectedTitles = {
    '220301': 'Labour and Industrial Law - I',
    '220302': 'Labour and Industrial Law - II',
    '220303': 'Principles of Taxation Laws',
    '220304': 'Principal of Banking Laws',
    '220305': 'Information Technology Laws and Cyber Crimes'
  };
  for (const s of verifySubjects) {
    const expected = expectedTitles[s.shortCode];
    if (s.title !== expected) {
      throw new Error(`❌ Subject title mismatch for ${s.shortCode}: Expected "${expected}", found "${s.title}"`);
    }
  }
  console.log(`✅ 3. Subject Names: Verified all official subject titles.`);

  // Check 4: Verify every unit
  const verifyUnits = await prisma.unit.findMany({
    where: { subjectId: { in: verifySubjects.map(s => s.id) } },
    orderBy: [{ subjectId: 'asc' }, { unitNumber: 'asc' }]
  });
  if (verifyUnits.length !== 20) {
    throw new Error(`❌ Unit count mismatch: Expected 20 (4 per subject), found ${verifyUnits.length}`);
  }
  for (const s of verifySubjects) {
    const subUnits = verifyUnits.filter(u => u.subjectId === s.id);
    if (subUnits.length !== 4) {
      throw new Error(`❌ Subject ${s.shortCode} has ${subUnits.length} units instead of 4`);
    }
  }
  console.log(`✅ 4. Units: Verified 20/20 units (exactly 4 per subject).`);

  // Check 5: Verify every topic
  const verifyTopics = await prisma.topic.findMany({
    where: { unitId: { in: verifyUnits.map(u => u.id) } }
  });
  if (verifyTopics.length < 20) {
    throw new Error(`❌ Topics count insufficient: Found ${verifyTopics.length}`);
  }
  const unpubTopics = verifyTopics.filter(t => t.status !== 'PUBLISHED');
  if (unpubTopics.length > 0) {
    throw new Error(`❌ Found ${unpubTopics.length} unapproved/unpublished topics`);
  }
  console.log(`✅ 5. Topics: Verified ${verifyTopics.length} topics (100% PUBLISHED).`);

  // Check 6: Check duplicates
  const codeCounts = {};
  for (const c of actualCodes) {
    codeCounts[c] = (codeCounts[c] || 0) + 1;
    if (codeCounts[c] > 1) {
      throw new Error(`❌ Duplicate subject code found: ${c}`);
    }
  }
  const topicTitlesPerUnit = {};
  for (const t of verifyTopics) {
    const key = `${t.unitId}-${t.title}`;
    if (topicTitlesPerUnit[key]) {
      throw new Error(`❌ Duplicate topic title in unit ${t.unitId}: ${t.title}`);
    }
    topicTitlesPerUnit[key] = true;
  }
  console.log(`✅ 6. Duplicates Check: 0 duplicate codes, 0 duplicate titles within units.`);

  // Check 7: Check missing topics & subtopics
  const verifySubtopics = await prisma.subTopic.findMany({
    where: { topicId: { in: verifyTopics.map(t => t.id) } }
  });
  for (const t of verifyTopics) {
    const relatedSubs = verifySubtopics.filter(st => st.topicId === t.id);
    if (relatedSubs.length === 0) {
      throw new Error(`❌ Topic ${t.id} (${t.title}) has 0 subtopics!`);
    }
  }
  console.log(`✅ 7. Missing Topics & Subtopics Check: Verified ${verifySubtopics.length} subtopics attached.`);

  // Check 8: Check database relationships
  const fullTree = await prisma.university.findUnique({
    where: { code: 'SU' },
    include: {
      courses: {
        where: { code: 'LLB-3Y' },
        include: {
          semesters: {
            where: { semesterNumber: 3 },
            include: {
              subjects: {
                include: {
                  units: {
                    include: {
                      topics: {
                        include: {
                          subTopics: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const relCourse = fullTree?.courses?.[0];
  const relSem = relCourse?.semesters?.[0];
  const relSubjects = relSem?.subjects;

  if (!relCourse || !relSem || !relSubjects || relSubjects.length !== 5) {
    throw new Error('❌ Relational integrity check failed: Tree traversal broken!');
  }
  console.log(`✅ 8. Database Relationships: Full 6-level relational tree traversal confirmed:`);
  console.log(`      Saurashtra University (${fullTree.name})`);
  console.log(`      └── Course: ${relCourse.name}`);
  console.log(`          └── Semester: ${relSem.title}`);
  for (const s of relSubjects) {
    const unitCount = s.units.length;
    const topCount = s.units.reduce((acc, u) => acc + u.topics.length, 0);
    const subtopCount = s.units.reduce((acc, u) => acc + u.topics.reduce((tacc, t) => tacc + t.subTopics.length, 0), 0);
    console.log(`              ├── [${s.shortCode}] ${s.title} (${unitCount} Units, ${topCount} Topics, ${subtopCount} Subtopics)`);
  }

  console.log('\n🌟 All 8 Database Validations Passed with 100% Success!');
}

seedSaurashtraSem3()
  .catch((err) => {
    console.error('\n❌ Error executing seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
