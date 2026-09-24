import { NextResponse } from 'next/server';
import { parseOfficialDocumentContent, compareSyllabi, calculateSHA256 } from '@/lib/services/syllabusIntelligenceService';
import { verifyAuth, sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-admin';
    const rateCheck = checkRateLimit(`upload-syllabus-doc-${clientIp}`, 20, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, error: 'Upload rate limit exceeded.' }, { status: 429 });
    }

    const auth = verifyAuth(request, ['ADMIN', 'FACULTY', 'REVIEWER']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      universityId = 'gu',
      collegeId,
      courseId = 'gu-llb-3yr',
      academicYear = '2026-27',
      semesterNumber = 1,
      sourceTitle,
      sourceUrl,
      rawDocumentText
    } = body;

    if (!rawDocumentText || typeof rawDocumentText !== 'string' || !rawDocumentText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Official document raw text or transcript is required for parsing.' },
        { status: 400 }
      );
    }

    const uni = await prisma.university.findUnique({ where: { id: universityId.toLowerCase() } });
    if (!uni) {
      return NextResponse.json({ success: false, error: `University '${universityId}' not found.` }, { status: 404 });
    }

    // Parse Document
    let parsedData;
    try {
      parsedData = parseOfficialDocumentContent(rawDocumentText, {
        universityName: uni.name,
        academicYear,
        semesterNumber: parseInt(semesterNumber, 10)
      });
    } catch (parseErr) {
      return NextResponse.json({
        success: false,
        status: 'EXTRACTION_FAILED',
        error: parseErr.message
      }, { status: 422 });
    }

    const contentHash = calculateSHA256(rawDocumentText);
    const newVersionId = `ver-${universityId}-sem${semesterNumber}-${academicYear}-${Date.now()}`;

    // Get current verified version for diff
    const currentVersion = await prisma.syllabusVersion.findFirst({
      where: {
        universityId: universityId.toLowerCase(),
        semesterNumber: parseInt(semesterNumber, 10),
        status: 'VERIFIED_CURRENT',
        isCurrent: true
      },
      include: {
        syllabusSubjects: {
          include: {
            units: {
              include: { topics: true }
            }
          }
        }
      }
    });

    // Create new PENDING_REVIEW version (never automatically replace verified current)
    const newVersion = await prisma.syllabusVersion.create({
      data: {
        id: newVersionId,
        universityId: universityId.toLowerCase(),
        collegeId: collegeId || null,
        courseId: courseId || `${universityId}-llb-3yr`,
        academicYear,
        semesterNumber: parseInt(semesterNumber, 10),
        version: '1.1-DRAFT',
        status: 'PENDING_REVIEW',
        isCurrent: false,
        sourceUrl: sourceUrl || uni.officialSyllabusSource || 'https://www.gujaratuniversity.ac.in/syllabus',
        sourceTitle: sourceTitle || `${uni.name} Official Law Curriculum Upload (${academicYear})`,
        sourcePublishedDate: new Date(),
        retrievedAt: new Date(),
        contentHash,
        confidenceScore: parsedData.confidence || 0.95,
        extractionNotes: `Manually uploaded by ${auth.user?.fullName || 'Admin'} on ${new Date().toISOString()}.`
      }
    });

    // Insert extracted subjects, units & topics
    for (const subj of parsedData.subjects) {
      const sSubj = await prisma.syllabusSubject.create({
        data: {
          syllabusVersionId: newVersion.id,
          title: subj.title,
          titleGu: `${subj.title} (અભ્યાસક્રમ)`,
          code: subj.code,
          category: subj.category || 'Core Law',
          credits: subj.credits || 4,
          status: 'ADDED'
        }
      });

      for (const u of subj.units) {
        const sUnit = await prisma.syllabusUnit.create({
          data: {
            syllabusSubjectId: sSubj.id,
            unitNumber: u.unitNumber,
            title: u.title,
            description: u.description,
            status: 'ADDED'
          }
        });

        for (let tIdx = 0; tIdx < u.topics.length; tIdx++) {
          const t = u.topics[tIdx];
          await prisma.syllabusTopic.create({
            data: {
              syllabusUnitId: sUnit.id,
              topicNumber: tIdx + 1,
              title: t.title,
              description: t.description,
              confidence: 0.95,
              status: 'ADDED'
            }
          });
        }
      }
    }

    // Run Diff Engine
    const diffs = compareSyllabi(currentVersion, parsedData);
    for (const d of diffs) {
      await prisma.syllabusChange.create({
        data: {
          syllabusVersionId: newVersion.id,
          changeType: d.changeType,
          entityType: d.entityType,
          entityId: d.entityId,
          fieldName: d.fieldName,
          oldValue: d.oldValue,
          newValue: d.newValue,
          summary: d.summary,
          summaryGu: d.summaryGu,
          confidence: d.confidence,
          status: 'PENDING_REVIEW'
        }
      });
    }

    // Log Audit
    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: 'AI_EXTRACTED',
        entityType: 'SYLLABUS_VERSION',
        entityId: newVersion.id,
        details: `Uploaded official document for ${uni.name}. Extracted ${parsedData.subjects.length} subjects with ${diffs.length} diffs detected.`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Official syllabus document parsed and submitted to Pending Review queue.',
      versionId: newVersion.id,
      subjectsExtracted: parsedData.subjects.length,
      diffsDetected: diffs.length,
      diffs
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading/processing syllabus document:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process document' },
      { status: 500 }
    );
  }
}
