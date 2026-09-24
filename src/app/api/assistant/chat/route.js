import { NextResponse } from 'next/server';
import { processAssistantQuery, CAPABILITIES } from '@/lib/services/aiAssistantService';
import { checkRateLimit } from '@/lib/rateLimiter';
import { detectPromptInjection, sanitizeInput } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 1. Rate Limiting Protection
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'anonymous-client';
    const rateCheck = checkRateLimit(`ai-tutor-${clientIp}`, 30, 60000); // 30 requests per minute

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please slow down and try again in a few seconds.',
          retryAfterMs: rateCheck.resetMs
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString()
          }
        }
      );
    }

    // 2. Request Validation
    const body = await request.json().catch(() => ({}));
    const { query, capability = CAPABILITIES.EXPLAIN_SIMPLE, userId = 'usr-student-01', topicId, subjectId, mcqId } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'A non-empty query string is required.' },
        { status: 400 }
      );
    }

    // Prompt injection check
    const injectionCheck = detectPromptInjection(query);
    if (!injectionCheck.isSafe) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Query rejected: Instruction override or system prompt manipulation detected.',
          flag: injectionCheck.riskFlag 
        },
        { status: 400 }
      );
    }

    // Length limit & sanitize
    const cleanQuery = sanitizeInput(query.trim().slice(0, 1000), { maxLength: 1000, stripHtml: true });

    // 3. Process Query
    const result = await processAssistantQuery({
      query: cleanQuery,
      capability,
      userId,
      topicId,
      subjectId,
      mcqId
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error in POST /api/assistant/chat:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI Study Assistant encountered an error.' },
      { status: 500 }
    );
  }
}
