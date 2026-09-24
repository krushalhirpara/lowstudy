import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimiter';
import { sendInstitutionalEnquiryEmail } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_PHONE_REGEX = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/;

function cleanPhone(phone) {
  if (!phone) return '';
  return String(phone).trim().replace(/[\s-]/g, '');
}

export async function POST(request) {
  try {
    // 1. IP extraction & Rate Limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    const rateLimit = checkRateLimit(`enquiry_${clientIp}`, 5, 60000); // 5 submissions per minute per IP
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many enquiry requests. Please wait a minute before submitting again.',
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await request.json();

    // 3. Spam Honeypot Protection
    // If the hidden 'website' or 'company_url' field is filled, silently discard spam
    if (body.website || body.company_url || body._hp) {
      return NextResponse.json({
        success: true,
        message: 'Your College & Institutional Plan enquiry has been submitted successfully. Our team will contact you soon.',
      });
    }

    const {
      fullName,
      email,
      mobile,
      collegeName,
      designation,
      university,
      cityState,
      studentCount,
      preferredContactMethod,
      description,
    } = body;

    // 4. Server-Side Input Validation
    const errors = {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (at least 2 characters).';
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      errors.email = 'A valid email address is required.';
    }

    const cleanedMobile = cleanPhone(mobile);
    if (!cleanedMobile || !INDIAN_PHONE_REGEX.test(cleanedMobile)) {
      errors.mobile = 'A valid 10-digit Indian mobile number is required.';
    }

    if (!collegeName || typeof collegeName !== 'string' || collegeName.trim().length < 2) {
      errors.collegeName = 'College or Institution name is required.';
    }

    if (!designation || typeof designation !== 'string' || designation.trim().length < 2) {
      errors.designation = 'Designation or role is required.';
    }

    const parsedCount = parseInt(studentCount, 10);
    if (isNaN(parsedCount) || parsedCount <= 0) {
      errors.studentCount = 'Please provide a valid positive number of students.';
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.description = 'Please provide requirements or details (minimum 10 characters).';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted errors in the form.',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // 5. Hardcoded Server-Side Plan Metadata (Do NOT trust client values)
    const sanitizedData = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: cleanedMobile,
      collegeName: collegeName.trim(),
      designation: designation.trim(),
      university: university && typeof university === 'string' ? university.trim() : null,
      cityState: cityState && typeof cityState === 'string' ? cityState.trim() : null,
      studentCount: parsedCount,
      preferredContactMethod: ['Email', 'Phone', 'WhatsApp'].includes(preferredContactMethod)
        ? preferredContactMethod
        : 'Email',
      description: description.trim(),
      plan: 'college_institutional',
      planPrice: '499',
      billingCycle: 'monthly',
      status: 'NEW',
      ipAddress: clientIp,
    };

    // 6. Database Storage
    let savedEnquiry = null;
    try {
      savedEnquiry = await prisma.collegeInstitutionalEnquiry.create({
        data: sanitizedData,
      });
    } catch (dbError) {
      console.error('[EnquiryAPI] Database record creation error:', dbError);
      // Fallback: If DB write fails, still attempt email delivery and proceed gracefully
    }

    // 7. Send Email Notification to support@lowstudy.com
    try {
      await sendInstitutionalEnquiryEmail({
        ...sanitizedData,
        id: savedEnquiry?.id || 'pending',
      });
    } catch (emailError) {
      console.error('[EnquiryAPI] Email notification dispatch failed:', emailError);
      // We don't fail the user request if the DB record was saved, but we log the incident
    }

    return NextResponse.json({
      success: true,
      message: 'Your College & Institutional Plan enquiry has been submitted successfully. Our team will contact you soon.',
      enquiryId: savedEnquiry?.id,
    });
  } catch (error) {
    console.error('[EnquiryAPI] Unexpected error processing enquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong while submitting your enquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}
