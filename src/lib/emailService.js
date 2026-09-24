import nodemailer from 'nodemailer';

/**
 * LowStudy Production Transactional Email Service
 * Handles server-side delivery of institutional enquiries to support@lowstudy.com
 */

const DEFAULT_SUPPORT_EMAIL = 'support@lowstudy.com';

/**
 * Formats the plain text email body as specified by LowStudy requirements
 */
export function formatEnquiryPlainText(data) {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return `New LowStudy College & Institutional Plan Enquiry

Plan:
College & Institutional

Price:
₹499/month

--------------------------------

Student / Contact Information

Full Name: ${data.fullName}
Email: ${data.email}
Mobile: ${data.mobile}
College / Institution: ${data.collegeName}
Designation / Role: ${data.designation}
University: ${data.university || 'Not Specified'}
City / State: ${data.cityState || 'Not Specified'}
Number of Students: ${data.studentCount}
Preferred Contact Method: ${data.preferredContactMethod || 'Email'}

--------------------------------

Requirements / Description:

${data.description}

--------------------------------

Submitted At:
${timestamp}

Source:
LowStudy Pricing Page

Page:
https://lowstudy.com/pricing`;
}

/**
 * Formats a clean, readable HTML email version
 */
export function formatEnquiryHtml(data) {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'long',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; }
    .header h2 { margin: 0 0 6px 0; font-size: 20px; color: #ffffff; }
    .badge { display: inline-block; background: #f59e0b; color: #0f172a; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; }
    .content { padding: 24px; }
    .section-title { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table td { padding: 8px 4px; font-size: 14px; }
    .info-table td.label { width: 38%; color: #64748b; font-weight: 600; }
    .info-table td.val { width: 62%; color: #0f172a; font-weight: 500; }
    .desc-box { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 14px; font-size: 14px; border-radius: 0 8px 8px 0; margin-bottom: 20px; white-space: pre-wrap; }
    .footer { background: #f1f5f9; padding: 16px 24px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Institutional Lead</span>
      <h2 style="margin-top: 8px;">New College & Institutional Plan Enquiry</h2>
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">Plan: College & Institutional &bull; Price: ₹499/month</p>
    </div>
    <div class="content">
      <div class="section-title">Contact & Institution Details</div>
      <table class="info-table">
        <tr><td class="label">Full Name</td><td class="val">${escapeHtml(data.fullName)}</td></tr>
        <tr><td class="label">Email Address</td><td class="val"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        <tr><td class="label">Mobile Number</td><td class="val"><a href="tel:${escapeHtml(data.mobile)}">${escapeHtml(data.mobile)}</a></td></tr>
        <tr><td class="label">College / Institution</td><td class="val"><strong>${escapeHtml(data.collegeName)}</strong></td></tr>
        <tr><td class="label">Designation / Role</td><td class="val">${escapeHtml(data.designation)}</td></tr>
        <tr><td class="label">University</td><td class="val">${escapeHtml(data.university || 'Not Specified')}</td></tr>
        <tr><td class="label">City / State</td><td class="val">${escapeHtml(data.cityState || 'Not Specified')}</td></tr>
        <tr><td class="label">Number of Students</td><td class="val"><strong>${escapeHtml(String(data.studentCount))}</strong></td></tr>
        <tr><td class="label">Preferred Contact</td><td class="val">${escapeHtml(data.preferredContactMethod || 'Email')}</td></tr>
      </table>

      <div class="section-title">Requirements & Description</div>
      <div class="desc-box">${escapeHtml(data.description)}</div>
    </div>
    <div class="footer">
      <div><strong>Submitted At:</strong> ${timestamp}</div>
      <div><strong>Source:</strong> LowStudy Pricing Page (<a href="https://lowstudy.com/pricing">https://lowstudy.com/pricing</a>)</div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends enquiry email to support@lowstudy.com
 */
export async function sendInstitutionalEnquiryEmail(enquiryData) {
  const recipient = process.env.CONTACT_EMAIL || DEFAULT_SUPPORT_EMAIL;
  const subject = 'New College & Institutional Plan Enquiry - LowStudy';
  const textContent = formatEnquiryPlainText(enquiryData);
  const htmlContent = formatEnquiryHtml(enquiryData);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const mailFrom = process.env.MAIL_FROM || process.env.SMTP_FROM || `LowStudy Website <${DEFAULT_SUPPORT_EMAIL}>`;

  // If SMTP environment variables are configured, dispatch via SMTP transport
  if (smtpHost && smtpUser && smtpPassword) {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: mailFrom,
      to: recipient,
      replyTo: enquiryData.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Institutional enquiry email dispatched to ${recipient}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (error) {
      console.error('[EmailService] SMTP error sending institutional enquiry:', error);
      throw error;
    }
  }

  // If SMTP is not yet configured in the environment, log clearly server-side for dev/test
  console.log(`[EmailService] (Notice: SMTP credentials not set). Simulated email dispatch to ${recipient}:`);
  console.log('--- EMAIL SUBJECT ---');
  console.log(subject);
  console.log('--- EMAIL BODY ---');
  console.log(textContent);
  console.log('---------------------');

  return {
    success: true,
    mode: 'simulated',
    message: 'Email logged (SMTP credentials not configured in environment)',
  };
}
