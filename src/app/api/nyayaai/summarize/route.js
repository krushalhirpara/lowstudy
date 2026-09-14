import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { messages = [] } = body;

    if (messages.length === 0) {
      return NextResponse.json({ success: true, summary: null });
    }

    const topicsDiscussed = [];
    messages.forEach(m => {
      const lower = (m.text || '').toLowerCase();
      if (lower.includes('murder') || lower.includes('bns 103') || lower.includes('302')) topicsDiscussed.push('BNS 103 Murder & Homicide');
      if (lower.includes('kesavananda') || lower.includes('basic structure')) topicsDiscussed.push('Basic Structure Doctrine');
      if (lower.includes('article 14') || lower.includes('equality')) topicsDiscussed.push('Article 14 Equality');
      if (lower.includes('consideration') || lower.includes('contract')) topicsDiscussed.push('Section 2(d) Consideration');
    });

    const uniqueTopics = [...new Set(topicsDiscussed)];

    return NextResponse.json({
      success: true,
      summary: {
        totalMessagesCount: messages.length,
        topicsDiscussed: uniqueTopics,
        lastTopic: uniqueTopics[uniqueTopics.length - 1] || 'General Legal Query',
        suggestedNextStep: uniqueTopics.length > 0 ? `Take a 5-question test on ${uniqueTopics[uniqueTopics.length - 1]}` : 'Ask your next legal question'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
