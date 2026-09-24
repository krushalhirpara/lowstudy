import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { verifyAuth, validateUrlSafe, sanitizeInput } from '@/lib/security';
import { checkRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

const MAX_PDF_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // '%PDF-'

/**
 * POST /api/upload/pdf
 * Secure endpoint for uploading examination PDF files or validating external paper URLs.
 * 
 * Restrictions enforced:
 * - Admin / Faculty authentication required
 * - Rate limiting (10 uploads / minute per IP)
 * - Maximum size: 15MB
 * - Strict MIME type: 'application/pdf'
 * - True magic byte verification (%PDF-)
 * - Filename sanitization & path traversal protection
 * - SSRF protection for remote URLs
 */
export async function POST(request) {
  try {
    // 1. Rate Limiting Protection (10 uploads / minute)
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'client-pdf-upload';
    const rateCheck = checkRateLimit(`pdf-upload-${clientIp}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Upload rate limit exceeded. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 2. Authentication & Admin Role Guard
    const auth = verifyAuth(request, ['ADMIN', 'FACULTY']);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized: Only administrators can upload examination papers.' },
        { status: auth.status || 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';

    // CASE A: Multipart FormData File Upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { success: false, error: 'No PDF file attached in form data.' },
          { status: 400 }
        );
      }

      // 1. Size Restriction
      if (file.size > MAX_PDF_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `File size exceeds 15MB limit. Provided size: ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
          { status: 413 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, error: 'Uploaded file is empty (0 bytes).' },
          { status: 400 }
        );
      }

      // 2. MIME Type Validation
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { success: false, error: `Invalid MIME type: ${file.type}. Only 'application/pdf' is permitted.` },
          { status: 415 }
        );
      }

      // 3. Read Buffer & Verify Magic Bytes (%PDF-)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 5 || !buffer.subarray(0, 5).equals(PDF_MAGIC_BYTES)) {
        return NextResponse.json(
          { success: false, error: 'File integrity check failed: Not a valid PDF document (missing %PDF- header signature).' },
          { status: 400 }
        );
      }

      // 4. Filename Sanitization & Path Traversal Defense
      const originalName = sanitizeInput(file.name || 'paper.pdf', { maxLength: 100 });
      const safeBasename = originalName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.{2,}/g, '.'); // Remove directory traversal dots

      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const safeFileName = `paper_${Date.now()}_${uniqueSuffix}.pdf`;

      // 5. Store File Safely
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'papers');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const destinationPath = path.join(uploadDir, safeFileName);
      fs.writeFileSync(destinationPath, buffer);

      const publicUrl = `/uploads/papers/${safeFileName}`;

      return NextResponse.json({
        success: true,
        message: 'PDF examination paper uploaded and validated successfully.',
        fileUrl: publicUrl,
        fileName: safeFileName,
        fileSize: file.size,
        uploadedBy: auth.user.fullName || auth.user.email,
      });
    }

    // CASE B: JSON Payload with Remote PDF URL
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Either multipart file or JSON with "url" must be provided.' },
        { status: 400 }
      );
    }

    // SSRF & Protocol Validation
    const urlCheck = validateUrlSafe(url);
    if (!urlCheck.valid) {
      return NextResponse.json(
        { success: false, error: `Invalid or unsafe PDF URL: ${urlCheck.error}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Remote PDF URL validated against SSRF and verified.',
      fileUrl: url,
      verifiedBy: auth.user.fullName || auth.user.email,
    });
  } catch (error) {
    console.error('Error in POST /api/upload/pdf:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'PDF upload processing failed.' },
      { status: 500 }
    );
  }
}
