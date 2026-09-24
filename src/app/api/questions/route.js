import { NextResponse } from 'next/server';
import { getQuestionsList, getQuestionBankFilters } from '@/lib/services/questionBankService';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // If requesting metadata/filters
    if (searchParams.get('meta') === 'true') {
      const filters = await getQuestionBankFilters();
      return NextResponse.json({ success: true, filters });
    }

    const subjectId = searchParams.get('subjectId');
    const unitId = searchParams.get('unitId');
    const topicId = searchParams.get('topicId');
    const marks = searchParams.get('marks');
    const questionType = searchParams.get('questionType');
    const difficulty = searchParams.get('difficulty');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source'); // 'ALL', 'PYQ', 'ORIGINAL_PRACTICE'
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const userId = searchParams.get('userId') || 'usr-student-01';

    const result = await getQuestionsList({
      subjectId,
      unitId,
      topicId,
      marks,
      questionType,
      difficulty,
      priority,
      source,
      search,
      page,
      limit,
      userId
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
