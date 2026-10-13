import { NextResponse } from 'next/server';
import { sendMobileOtp } from '@/lib/services/otpService.js';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const result = await sendMobileOtp(phoneNumber);

    return NextResponse.json({
      success: true,
      message: result.message,
      normalizedPhone: result.normalizedPhone,
      resendCooldownSeconds: result.resendCooldownSeconds,
    });
  } catch (err) {
    console.warn('[API /api/exam-prep/auth/otp/send] Error:', err?.message || err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to send verification code.' },
      { status: 400 }
    );
  }
}
