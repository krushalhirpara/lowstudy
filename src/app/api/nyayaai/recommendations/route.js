import { NextResponse } from 'next/server';
import { ALL_SYLLABUS_SUBJECTS } from '@/data/syllabusData';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universityId = searchParams.get('universityId') || 'gu';
    const semesterId = searchParams.get('semesterId') || 'sem1';

    const recommendations = [
      {
        id: 'rec-1',
        title: 'Spaced Revision: BNS Section 318 (Digital Cheating)',
        reason: 'Weak area detected from previous quiz attempts (52% accuracy)',
        actionText: 'Revise 5 MCQs',
        subjectId: 'gu-sem1-new-bns-1'
      },
      {
        id: 'rec-2',
        title: 'Exam High-Yield Case Law: Kesavananda Bharati v. State of Kerala',
        reason: 'Frequently asked in Gujarat University Semester 1 Exams (15 Marks)',
        actionText: 'Read Case Brief',
        subjectId: 'gu-sem1-new-const-1'
      }
    ];

    return NextResponse.json({
      success: true,
      recommendations
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
