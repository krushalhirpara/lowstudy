import { NextResponse } from 'next/server';
import { getMockTestMetadata } from '@/lib/services/mockTestService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getMockTestMetadata();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching mock test metadata:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch mock test metadata' },
      { status: 500 }
    );
  }
}
