import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const [syncJobs, auditLogs] = await Promise.all([
      prisma.syllabusSyncJob.findMany({
        take: limit,
        orderBy: { startedAt: 'desc' },
        include: {
          source: {
            include: { university: { select: { name: true, code: true } } }
          }
        }
      }),
      prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, role: true } }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      syncJobs,
      auditLogs
    });
  } catch (error) {
    console.error('Error fetching admin syllabus logs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
