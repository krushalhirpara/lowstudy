import crypto from 'crypto';
import prisma from '../prisma.js';
import { GUJARAT_UNIVERSITIES, GUJARAT_COLLEGES } from '../../data/gujaratData.js';

export const EXAM_PREP_CONFIG = {
  PRODUCT_CODE: 'LOWSTUDY_EXAM_PREP_PASS',
  NAME: 'LowStudy Exam Prep Pass',
  PRICE_PAISE: 29900,
  PRICE_INR: 299,
  CURRENCY: 'INR',
  DESCRIPTION: 'All Universities, Courses, Semesters & Subjects Exam Prep Pass',
  BILLING_TYPE: 'one_time',
  DISCLAIMER: 'Questions are prepared for educational practice using available syllabus information, examination patterns and verified sources. They are not guaranteed questions from any upcoming examination.'
};

/**
 * Get Razorpay Credentials from environment
 */
export function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const isConfigured = Boolean(keyId && keySecret);
  const isTestMode = keyId.startsWith('rzp_test_');

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured,
    isTestMode,
  };
}

/**
 * Check if a user has an active LowStudy Exam Prep Pass entitlement
 * @param {string} userId 
 * @returns {Promise<boolean>}
 */
export async function hasActiveExamPrepEntitlement(userId) {
  if (!userId) return false;
  try {
    const entitlement = await prisma.examPrepEntitlement.findFirst({
      where: {
        userId,
        productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
        status: 'ACTIVE',
      },
    });
    return Boolean(entitlement);
  } catch (err) {
    console.error('[ExamPrepService] Error checking entitlement:', err?.message || err);
    return false;
  }
}

/**
 * Get detailed access status for a user
 * @param {string} userId 
 */
export async function getUserExamPrepAccess(userId) {
  if (!userId) {
    return {
      authenticated: false,
      hasAccess: false,
      entitlement: null,
      product: EXAM_PREP_CONFIG,
    };
  }

  try {
    const entitlement = await prisma.examPrepEntitlement.findFirst({
      where: {
        userId,
        productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
      },
      include: {
        order: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            verifiedAt: true,
            razorpayPaymentId: true,
            receipt: true,
          }
        }
      }
    });

    const hasAccess = entitlement?.status === 'ACTIVE';

    return {
      authenticated: true,
      hasAccess,
      entitlement: entitlement ? {
        id: entitlement.id,
        status: entitlement.status,
        productCode: entitlement.productCode,
        grantedAt: entitlement.grantedAt,
        revokedAt: entitlement.revokedAt,
        revocationReason: entitlement.revocationReason,
        order: entitlement.order,
      } : null,
      product: EXAM_PREP_CONFIG,
    };
  } catch (err) {
    console.error('[ExamPrepService] Error getting access details:', err?.message || err);
    return {
      authenticated: true,
      hasAccess: false,
      entitlement: null,
      product: EXAM_PREP_CONFIG,
    };
  }
}

/**
 * Server-side order creation for Razorpay checkout
 * Derives amount strictly from trusted server configuration
 */
export async function createExamPrepOrder({ userId, userEmail, userName, userPhone, notes = {} }) {
  if (!userId) {
    throw new Error('Authentication required to initiate checkout.');
  }

  // 1. Check if user already has active entitlement
  const alreadyActive = await hasActiveExamPrepEntitlement(userId);
  if (alreadyActive) {
    return {
      alreadyActive: true,
      message: 'You already have an active LowStudy Exam Prep Pass.',
      redirectUrl: '/exam-prep/library',
    };
  }

  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();

  if (!isConfigured && process.env.NODE_ENV === 'production') {
    throw new Error('Razorpay payment gateway credentials are not configured on the production server.');
  }

  const receipt = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const amount = EXAM_PREP_CONFIG.PRICE_PAISE; // 29900 paise = ₹299
  const currency = EXAM_PREP_CONFIG.CURRENCY;

  // 2. Create pending order in database
  const localOrder = await prisma.examPrepOrder.create({
    data: {
      userId,
      productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
      amount,
      currency,
      status: 'PENDING',
      receipt,
      notesJson: JSON.stringify({
        ...notes,
        email: userEmail,
        name: userName,
        phone: userPhone,
        initiatedAt: new Date().toISOString(),
      }),
    },
  });

  let razorpayOrderId = `order_${localOrder.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

  // 3. Contact Razorpay API if credentials are provided
  if (isConfigured) {
    try {
      const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt,
          notes: {
            lowstudy_order_id: localOrder.id,
            user_id: userId,
            product_code: EXAM_PREP_CONFIG.PRODUCT_CODE,
          },
        }),
      });

      if (res.ok) {
        const rzpData = await res.json();
        razorpayOrderId = rzpData.id;
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData?.error?.description || `Razorpay order creation failed (status ${res.status})`;
        console.error('[ExamPrepService] Razorpay API error:', errMsg);
        if (!isTestMode) {
          throw new Error(`Failed to initialize payment with Razorpay: ${errMsg}`);
        }
      }
    } catch (apiErr) {
      console.error('[ExamPrepService] Razorpay network/API error:', apiErr?.message || apiErr);
      if (!isTestMode) {
        throw apiErr;
      }
    }
  }

  // 4. Update local order with razorpayOrderId
  await prisma.examPrepOrder.update({
    where: { id: localOrder.id },
    data: { razorpayOrderId },
  });

  return {
    success: true,
    alreadyActive: false,
    orderId: localOrder.id,
    razorpayOrderId,
    keyId: keyId || 'rzp_test_LowStudyDevKey',
    amount,
    currency,
    productName: EXAM_PREP_CONFIG.NAME,
    description: EXAM_PREP_CONFIG.DESCRIPTION,
    prefill: {
      name: userName || '',
      email: userEmail || '',
      contact: userPhone || '',
    },
  };
}

/**
 * Generate a unique server-side Razorpay Payment Link per authenticated student/order
 */
export async function createExamPrepPaymentLink({ userId, userEmail, userName, userPhone, notes = {} }) {
  if (!userId) {
    throw new Error('Authentication required to generate payment link.');
  }

  const alreadyActive = await hasActiveExamPrepEntitlement(userId);
  if (alreadyActive) {
    return {
      alreadyActive: true,
      message: 'You already have an active LowStudy Exam Prep Pass.',
      redirectUrl: '/exam-prep/library',
    };
  }

  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();
  const receipt = `plink_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const amount = EXAM_PREP_CONFIG.PRICE_PAISE; // 29900 paise = ₹299
  const currency = EXAM_PREP_CONFIG.CURRENCY;

  // 1. Create local order record in database
  const localOrder = await prisma.examPrepOrder.create({
    data: {
      userId,
      productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
      amount,
      currency,
      status: 'PENDING',
      receipt,
      notesJson: JSON.stringify({
        ...notes,
        email: userEmail,
        name: userName,
        phone: userPhone,
        type: 'PAYMENT_LINK',
        initiatedAt: new Date().toISOString(),
      }),
    },
  });

  if (!isConfigured) {
    throw new Error('Razorpay API credentials are not configured on the server.');
  }

  // 2. Call Razorpay Payment Links API: POST https://api.razorpay.com/v1/payment_links
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/payment_links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      amount,
      currency,
      accept_partial: false,
      reference_id: localOrder.id,
      description: EXAM_PREP_CONFIG.DESCRIPTION,
      customer: {
        name: userName || 'Student',
        email: userEmail || '',
        contact: userPhone || '',
      },
      notify: {
        sms: Boolean(userPhone),
        email: Boolean(userEmail),
      },
      reminder_enable: false,
      notes: {
        lowstudy_order_id: localOrder.id,
        user_id: userId,
        product_code: EXAM_PREP_CONFIG.PRODUCT_CODE,
      },
      callback_url: 'https://lowstudy.com/exam-prep/success',
      callback_method: 'get',
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.description || 'Failed to create Razorpay Payment Link.');
  }

  const linkData = await res.json();
  const razorpayOrderId = linkData.order_id || linkData.id;

  await prisma.examPrepOrder.update({
    where: { id: localOrder.id },
    data: { razorpayOrderId },
  });

  return {
    success: true,
    orderId: localOrder.id,
    paymentLinkId: linkData.id,
    shortUrl: linkData.short_url,
    amount,
    currency,
  };
}

/**
 * Verify Razorpay payment signature & grant active entitlement transactionally
 */
export async function verifyAndCapturePayment({
  userId,
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (!userId) {
    throw new Error('Authentication required for payment verification.');
  }

  if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
    throw new Error('Missing payment verification details.');
  }

  // 1. Find local order and check ownership
  const localOrder = await prisma.examPrepOrder.findFirst({
    where: {
      userId,
      OR: [
        { id: orderId },
        { razorpayOrderId: razorpayOrderId },
        { razorpayOrderId: orderId },
      ],
    },
  });

  if (!localOrder) {
    throw new Error('Order not found or does not belong to the current user.');
  }

  // If already captured and active, return success idempotently
  if (localOrder.status === 'CAPTURED') {
    const existingEntitlement = await prisma.examPrepEntitlement.findFirst({
      where: { userId, productCode: EXAM_PREP_CONFIG.PRODUCT_CODE },
    });
    return {
      success: true,
      alreadyVerified: true,
      order: localOrder,
      entitlement: existingEntitlement,
      redirectUrl: '/exam-prep/library',
    };
  }

  // 2. Verify signature
  const { keyId, keySecret, isConfigured, isTestMode } = getRazorpayCredentials();

  if (isConfigured && keySecret) {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpaySignature || '', 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    const isValidSignature = (
      sigBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(sigBuf, expectedBuf)
    );

    if (!isValidSignature && !isTestMode) {
      // Mark local order failed if signature mismatch
      await prisma.examPrepOrder.update({
        where: { id: localOrder.id },
        data: {
          status: 'FAILED',
          failureReason: 'Invalid payment signature mismatch.',
        },
      });
      throw new Error('Payment signature verification failed. Untrusted callback.');
    }

    // 3. Direct server-side payment verification via Razorpay Payments API
    if (!isTestMode && keyId && keySecret) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const payRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
          },
        });

        if (payRes.ok) {
          const payData = await payRes.json();

          // Match order ID
          if (payData.order_id && payData.order_id !== razorpayOrderId && payData.order_id !== localOrder.razorpayOrderId) {
            throw new Error('Payment does not belong to this order.');
          }

          // Enforce exact price: ₹299 (29900 paise)
          if (payData.amount !== EXAM_PREP_CONFIG.PRICE_PAISE) {
            throw new Error(`Payment amount mismatch: expected ${EXAM_PREP_CONFIG.PRICE_PAISE} paise, got ${payData.amount} paise.`);
          }

          // Enforce currency: INR
          if (payData.currency !== EXAM_PREP_CONFIG.CURRENCY) {
            throw new Error(`Payment currency mismatch: expected ${EXAM_PREP_CONFIG.CURRENCY}, got ${payData.currency}.`);
          }

          // Verify status is captured
          if (payData.status !== 'captured') {
            if (payData.status === 'authorized') {
              // Auto-capture authorized payment for exact amount
              const captureRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpayPaymentId}/capture`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${basicAuth}`,
                },
                body: JSON.stringify({
                  amount: EXAM_PREP_CONFIG.PRICE_PAISE,
                  currency: EXAM_PREP_CONFIG.CURRENCY,
                }),
              });
              if (!captureRes.ok) {
                const capErr = await captureRes.json().catch(() => ({}));
                throw new Error(capErr?.error?.description || 'Failed to capture authorized payment.');
              }
            } else {
              throw new Error(`Payment is not successful (status: ${payData.status}).`);
            }
          }
        } else {
          const payErrText = await payRes.text();
          console.error('[ExamPrepService] Razorpay payment verification API error:', payErrText);
          throw new Error('Could not verify payment status with Razorpay.');
        }
      } catch (apiErr) {
        await prisma.examPrepOrder.update({
          where: { id: localOrder.id },
          data: {
            status: 'FAILED',
            failureReason: apiErr?.message || 'Payment API verification failed.',
          },
        });
        throw apiErr;
      }
    }
  }

  // 4. Database transaction: update order to CAPTURED and upsert Entitlement
  const verifiedAt = new Date();

  const [updatedOrder, entitlement] = await prisma.$transaction([
    prisma.examPrepOrder.update({
      where: { id: localOrder.id },
      data: {
        status: 'CAPTURED',
        razorpayPaymentId,
        razorpaySignature: razorpaySignature || 'verified',
        verifiedAt,
      },
    }),
    prisma.examPrepEntitlement.upsert({
      where: {
        userId_productCode: {
          userId,
          productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
        },
      },
      update: {
        status: 'ACTIVE',
        orderId: localOrder.id,
        grantedAt: verifiedAt,
        revokedAt: null,
        revocationReason: null,
      },
      create: {
        userId,
        productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
        orderId: localOrder.id,
        status: 'ACTIVE',
        grantedAt: verifiedAt,
      },
    }),
  ]);

  // Log activity
  try {
    await prisma.activityEvent.create({
      data: {
        type: 'SUBJECT_STUDY',
        userId,
        publicDisplayName: 'A law student',
        subjectTitle: 'Exam Prep Pass Activated (₹299)',
      }
    });
  } catch {}

  return {
    success: true,
    message: 'Payment verified successfully. Premium access unlocked.',
    order: updatedOrder,
    entitlement,
    redirectUrl: '/exam-prep/library',
  };
}

/**
 * Handle incoming Razorpay Webhook idempotently
 */
export async function handleRazorpayWebhook({ rawBody, signature, eventData }) {
  const { webhookSecret, keySecret } = getRazorpayCredentials();
  const secret = webhookSecret || keySecret;

  // 1. Verify Webhook signature if secret configured
  if (secret) {
    if (!signature) {
      throw new Error('Missing Razorpay Webhook signature.');
    }
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error('Invalid Razorpay Webhook signature.');
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('Razorpay Webhook secret is not configured on production server.');
  }

  const eventId = eventData?.id;
  const eventType = eventData?.event;

  if (!eventId || !eventType) {
    throw new Error('Invalid webhook payload structure.');
  }

  // 2. Check for duplicate webhook event (idempotency)
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    return { success: true, duplicate: true, message: 'Event already processed.' };
  }

  // Record webhook event
  await prisma.webhookEvent.create({
    data: {
      id: eventId,
      eventType,
      entityId: eventData?.payload?.payment?.entity?.id || eventData?.payload?.order?.entity?.id || null,
      payload: JSON.stringify(eventData),
      status: 'PROCESSED',
    },
  });

  // 3. Process event types
  if (eventType === 'payment.captured' || eventType === 'order.paid') {
    const paymentEntity = eventData?.payload?.payment?.entity;
    const orderEntity = eventData?.payload?.order?.entity;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;
    const paymentAmount = paymentEntity?.amount || orderEntity?.amount;
    const paymentCurrency = paymentEntity?.currency || orderEntity?.currency;

    // Verify amount and currency if present
    if (paymentAmount && paymentAmount !== EXAM_PREP_CONFIG.PRICE_PAISE) {
      console.warn(`[ExamPrepService Webhook] Ignored event due to amount mismatch: ${paymentAmount} vs ${EXAM_PREP_CONFIG.PRICE_PAISE}`);
      return { success: false, error: 'Payment amount mismatch' };
    }
    if (paymentCurrency && paymentCurrency !== EXAM_PREP_CONFIG.CURRENCY) {
      console.warn(`[ExamPrepService Webhook] Ignored event due to currency mismatch: ${paymentCurrency} vs ${EXAM_PREP_CONFIG.CURRENCY}`);
      return { success: false, error: 'Payment currency mismatch' };
    }

    if (razorpayOrderId) {
      const order = await prisma.examPrepOrder.findFirst({
        where: { razorpayOrderId },
      });

      if (order && order.status !== 'CAPTURED') {
        await prisma.$transaction([
          prisma.examPrepOrder.update({
            where: { id: order.id },
            data: {
              status: 'CAPTURED',
              razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
              verifiedAt: new Date(),
            },
          }),
          prisma.examPrepEntitlement.upsert({
            where: {
              userId_productCode: {
                userId: order.userId,
                productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
              },
            },
            update: {
              status: 'ACTIVE',
              orderId: order.id,
              grantedAt: new Date(),
              revokedAt: null,
              revocationReason: null,
            },
            create: {
              userId: order.userId,
              productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
              orderId: order.id,
              status: 'ACTIVE',
              grantedAt: new Date(),
            },
          }),
        ]);
      }
    }
  } else if (eventType === 'refund.created' || eventType === 'payment.refunded') {
    const refundEntity = eventData?.payload?.refund?.entity;
    const razorpayPaymentId = refundEntity?.payment_id;
    const refundAmount = refundEntity?.amount;

    if (razorpayPaymentId) {
      const order = await prisma.examPrepOrder.findFirst({
        where: { razorpayPaymentId },
      });

      if (order) {
        await prisma.$transaction([
          prisma.examPrepOrder.update({
            where: { id: order.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
              refundAmount,
              razorpayRefundId: refundEntity?.id,
            },
          }),
          prisma.examPrepEntitlement.updateMany({
            where: {
              userId: order.userId,
              productCode: EXAM_PREP_CONFIG.PRODUCT_CODE,
            },
            data: {
              status: 'REFUNDED',
              revokedAt: new Date(),
              revocationReason: 'Payment refunded via Razorpay webhook.',
            },
          }),
        ]);
      }
    }
  }

  return { success: true, processed: true };
}

/**
 * Retrieve Questions & Model Answers with strict server-side access control
 */
export async function getExamPrepQuestions({
  userId = null,
  universityId = null,
  courseId = null,
  semesterId = null,
  subjectId = null,
  marksCategory = null,
  marks = null,
  questionType = null,
  search = null,
  page = 1,
  limit = 20,
}) {
  const isEntitled = userId ? await hasActiveExamPrepEntitlement(userId) : false;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * take;

  const where = {
    publicationStatus: 'PUBLISHED',
    ...(universityId ? { universityId } : {}),
    ...(courseId ? { courseId } : {}),
    ...(semesterId ? { semesterId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(marksCategory ? { marksCategory } : {}),
    ...(marks ? { marks: parseInt(marks, 10) } : {}),
    ...(questionType ? { questionType } : {}),
    ...(search ? {
      OR: [
        { questionText: { contains: search } },
        { modelAnswer: { contains: search } },
        { legalProvisions: { contains: search } },
      ]
    } : {}),
  };

  const [total, questions] = await Promise.all([
    prisma.examPrepQuestion.count({ where }),
    prisma.examPrepQuestion.findMany({
      where,
      skip,
      take,
      orderBy: [
        { marks: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        subject: {
          select: { id: true, title: true, shortCode: true, category: true, syllabusVersion: true }
        },
        semester: {
          select: { id: true, semesterNumber: true, title: true }
        },
        university: {
          select: { id: true, name: true, code: true }
        }
      }
    })
  ]);

  // Mask sensitive model answer content if user is NOT entitled
  const sanitizedQuestions = questions.map(q => {
    let answerStructureParsed = null;
    let legalProvisionsParsed = null;
    let caseLawsParsed = null;
    let keyRevisionPointsParsed = null;

    try { answerStructureParsed = q.answerStructure ? JSON.parse(q.answerStructure) : null; } catch {}
    try { legalProvisionsParsed = q.legalProvisions ? JSON.parse(q.legalProvisions) : null; } catch {}
    try { caseLawsParsed = q.caseLawReferences ? JSON.parse(q.caseLawReferences) : null; } catch {}
    try { keyRevisionPointsParsed = q.keyRevisionPoints ? JSON.parse(q.keyRevisionPoints) : null; } catch {}

    if (isEntitled) {
      return {
        ...q,
        isLocked: false,
        answerStructure: answerStructureParsed,
        legalProvisions: legalProvisionsParsed,
        caseLawReferences: caseLawsParsed,
        keyRevisionPoints: keyRevisionPointsParsed,
      };
    }

    // Unpaid user gets teaser preview only:
    return {
      id: q.id,
      universityId: q.universityId,
      courseId: q.courseId,
      semesterId: q.semesterId,
      subjectId: q.subjectId,
      subject: q.subject,
      semester: q.semester,
      university: q.university,
      questionText: q.questionText,
      questionTextGu: q.questionTextGu,
      questionType: q.questionType,
      marks: q.marks,
      marksCategory: q.marksCategory,
      difficulty: q.difficulty,
      importanceLevel: q.importanceLevel,
      suggestedTimeMinutes: q.suggestedTimeMinutes,
      expectedAnswerLength: q.expectedAnswerLength,
      sourceReferences: q.sourceReferences,
      verificationStatus: q.verificationStatus,
      isLocked: true,
      answerStructure: answerStructureParsed ? answerStructureParsed.slice(0, 2) : ['Introduction', 'Statutory Framework (Pass Required)'],
      legalProvisions: legalProvisionsParsed ? legalProvisionsParsed.slice(0, 1) : null,
      keyRevisionPoints: null,
      caseLawReferences: null,
      modelAnswer: q.modelAnswer.slice(0, 180) + '... [Unlock full structured model answer with Exam Prep Pass ₹299]',
      modelAnswerGu: null,
    };
  });

  return {
    isEntitled,
    total,
    page: pageNum,
    limit: take,
    totalPages: Math.ceil(total / take),
    questions: sanitizedQuestions,
  };
}

/**
 * Get Public Reviewed Sample Previews for landing page
 */
export async function getPublicSamplePreviews({ universityId = null, subjectId = null } = {}) {
  const where = {
    publicationStatus: 'PUBLISHED',
    verificationStatus: 'VERIFIED',
    ...(universityId ? { universityId } : {}),
    ...(subjectId ? { subjectId } : {}),
  };

  const samples = await prisma.examPrepQuestion.findMany({
    where,
    take: 6,
    orderBy: { marks: 'asc' },
    include: {
      subject: {
        select: { id: true, title: true, shortCode: true }
      },
      university: {
        select: { id: true, name: true, code: true }
      }
    }
  });

  return samples.map(s => {
    let answerStructureParsed = [];
    let legalProvisionsParsed = [];
    let caseLawsParsed = [];
    try { answerStructureParsed = s.answerStructure ? JSON.parse(s.answerStructure) : []; } catch {}
    try { legalProvisionsParsed = s.legalProvisions ? JSON.parse(s.legalProvisions) : []; } catch {}
    try { caseLawsParsed = s.caseLawReferences ? JSON.parse(s.caseLawReferences) : []; } catch {}

    return {
      id: s.id,
      isPreview: true,
      questionText: s.questionText,
      marks: s.marks,
      marksCategory: s.marksCategory,
      questionType: s.questionType,
      subjectTitle: s.subject?.title || 'Law Subject',
      universityName: s.university?.name || 'Gujarat Universities',
      modelAnswer: s.modelAnswer,
      answerStructure: answerStructureParsed,
      legalProvisions: legalProvisionsParsed,
      caseLawReferences: caseLawsParsed,
      expectedAnswerLength: s.expectedAnswerLength,
    };
  });
}

/**
 * CEO Admin: Get Payments and Revenue Overview
 */
export async function getAdminPaymentsData({
  page = 1,
  limit = 25,
  status = 'ALL',
  search = '',
  startDate = null,
  endDate = null,
  universityId = 'ALL',
  semesterId = 'ALL',
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
  const skip = (pageNum - 1) * take;

  let normalizedStatus = status;
  if (status === 'SUCCESS') normalizedStatus = 'CAPTURED';

  const where = {
    ...(normalizedStatus && normalizedStatus !== 'ALL' ? { status: normalizedStatus } : {}),
    ...(search ? {
      OR: [
        { id: { contains: search } },
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { fullName: { contains: search } } },
        { user: { phoneNumber: { contains: search } } },
        { notesJson: { contains: search } },
      ]
    } : {}),
    ...(universityId && universityId !== 'ALL' ? {
      OR: [
        { user: { universityId } },
        { notesJson: { contains: universityId } },
      ]
    } : {}),
    ...(semesterId && semesterId !== 'ALL' ? {
      OR: [
        { user: { semesterId } },
        { notesJson: { contains: semesterId } },
      ]
    } : {}),
    ...(startDate || endDate ? {
      createdAt: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`) } : {}),
      }
    } : {}),
  };

  const [
    totalOrders,
    totalFilteredOrders,
    capturedOrders,
    pendingOrders,
    failedOrders,
    refundedOrders,
    activeEntitlementsCount,
    orders,
  ] = await Promise.all([
    prisma.examPrepOrder.count(),
    prisma.examPrepOrder.count({ where }),
    prisma.examPrepOrder.count({ where: { status: 'CAPTURED' } }),
    prisma.examPrepOrder.count({ where: { status: 'PENDING' } }),
    prisma.examPrepOrder.count({ where: { status: 'FAILED' } }),
    prisma.examPrepOrder.count({ where: { status: 'REFUNDED' } }),
    prisma.examPrepEntitlement.count({ where: { status: 'ACTIVE' } }),
    prisma.examPrepOrder.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            city: true,
            universityId: true,
            collegeId: true,
            courseId: true,
            semesterId: true,
            university: { select: { id: true, name: true, code: true } },
            college: { select: { id: true, name: true } },
            course: { select: { id: true, name: true, code: true } },
            semester: { select: { id: true, semesterNumber: true, title: true } },
          }
        },
        entitlements: {
          select: {
            id: true,
            status: true,
            grantedAt: true,
            revokedAt: true,
            revocationReason: true,
          }
        }
      }
    })
  ]);

  // Calculate gross and net revenue from captured payments
  const capturedSum = await prisma.examPrepOrder.aggregate({
    where: { status: 'CAPTURED' },
    _sum: { amount: true },
  });

  const refundedSum = await prisma.examPrepOrder.aggregate({
    where: { status: 'REFUNDED' },
    _sum: { refundAmount: true, amount: true },
  });

  const grossPaise = capturedSum._sum.amount || 0;
  const refundPaise = refundedSum._sum.refundAmount || refundedSum._sum.amount || 0;
  const netPaise = Math.max(0, grossPaise - refundPaise);

  // Today's & this month's stats
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ordersToday, ordersThisMonth, revenueTodaySum, revenueThisMonthSum] = await Promise.all([
    prisma.examPrepOrder.count({
      where: { status: 'CAPTURED', createdAt: { gte: startOfToday } }
    }),
    prisma.examPrepOrder.count({
      where: { status: 'CAPTURED', createdAt: { gte: startOfMonth } }
    }),
    prisma.examPrepOrder.aggregate({
      where: { status: 'CAPTURED', createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    }),
    prisma.examPrepOrder.aggregate({
      where: { status: 'CAPTURED', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ]);

  return {
    kpis: {
      totalOrders,
      totalFilteredOrders,
      capturedOrders,
      pendingOrders,
      failedOrders,
      refundedOrders,
      activeEntitlements: activeEntitlementsCount,
      grossRevenueInr: Math.round(grossPaise / 100),
      netRevenueInr: Math.round(netPaise / 100),
      refundedRevenueInr: Math.round(refundPaise / 100),
      ordersToday,
      ordersThisMonth,
      revenueTodayInr: Math.round((revenueTodaySum._sum.amount || 0) / 100),
      revenueThisMonthInr: Math.round((revenueThisMonthSum._sum.amount || 0) / 100),
    },
    orders: orders.map(o => {
      let orderNotes = {};
      try {
        if (o.notesJson) orderNotes = JSON.parse(o.notesJson);
      } catch {}

      const studentName = o.user?.fullName || orderNotes.fullName || orderNotes.name || 'Law Student';
      const contactNumber = o.user?.phoneNumber || orderNotes.phoneNumber || orderNotes.phone || 'N/A';
      const email = o.user?.email || orderNotes.email || 'N/A';
      
      const uniName = o.user?.university?.name 
        || (orderNotes.universityId ? (GUJARAT_UNIVERSITIES.find(u => u.id === orderNotes.universityId)?.name || orderNotes.universityId) : 'Gujarat University');
      
      const colName = o.user?.college?.name 
        || (orderNotes.collegeId ? (GUJARAT_COLLEGES.find(c => c.id === orderNotes.collegeId)?.name || orderNotes.collegeId) : '');
      
      const universityAndCollege = colName ? `${uniName} / ${colName}` : uniName;

      const courseName = o.user?.course?.name 
        || (orderNotes.courseId === 'llb-3yr' ? '3-Year LL.B.' : orderNotes.courseId ? String(orderNotes.courseId).toUpperCase() : '3-Year LL.B.');

      const semesterName = o.user?.semester?.title 
        || (orderNotes.semesterId ? `Semester ${String(orderNotes.semesterId).replace(/\D/g, '') || orderNotes.semesterId}` : 'Semester 1');

      let displayStatus = 'Pending';
      if (o.status === 'CAPTURED') displayStatus = 'Success';
      else if (o.status === 'REFUNDED') displayStatus = 'Refunded';
      else if (o.status === 'FAILED') displayStatus = 'Failed';
      else if (o.status === 'PENDING') displayStatus = 'Pending';
      else displayStatus = o.status;

      const primaryEntitlement = o.entitlements?.[0];
      let accessStatus = 'Revoked';
      if (primaryEntitlement?.status === 'ACTIVE' || (!primaryEntitlement && o.status === 'CAPTURED')) {
        accessStatus = 'Active';
      } else if (primaryEntitlement?.status === 'REFUNDED' || primaryEntitlement?.status === 'REVOKED') {
        accessStatus = 'Revoked';
      } else {
        accessStatus = o.status === 'CAPTURED' ? 'Active' : 'Revoked';
      }

      return {
        id: o.id,
        orderId: o.razorpayOrderId || o.id,
        userId: o.userId,
        user: o.user,
        studentName,
        contactNumber,
        email,
        university: uniName,
        college: colName || 'Main Campus / Affiliated',
        universityAndCollege,
        course: courseName,
        semester: semesterName,
        productCode: o.productCode,
        amount: o.amount,
        amountInr: Math.round(o.amount / 100),
        currency: o.currency,
        status: o.status,
        displayStatus,
        razorpayOrderId: o.razorpayOrderId,
        razorpayPaymentId: o.razorpayPaymentId || 'N/A',
        receipt: o.receipt,
        failureReason: o.failureReason,
        verifiedAt: o.verifiedAt,
        refundedAt: o.refundedAt,
        refundAmount: o.refundAmount ? Math.round(o.refundAmount / 100) : null,
        createdAt: o.createdAt,
        paymentDate: o.verifiedAt || o.createdAt,
        entitlementStatus: primaryEntitlement?.status || (o.status === 'CAPTURED' ? 'ACTIVE' : 'NONE'),
        accessStatus,
        notes: orderNotes,
      };
    }),
    pagination: {
      total: totalFilteredOrders,
      page: pageNum,
      limit: take,
      totalPages: Math.ceil(totalFilteredOrders / take) || 1,
    }
  };
}

/**
 * CEO Admin: Content Coverage Matrix Report
 */
export async function getExamPrepContentCoverageReport() {
  const universities = await prisma.university.findMany({
    orderBy: { established: 'asc' },
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      courses: {
        select: {
          id: true,
          name: true,
          code: true,
          semesters: {
            orderBy: { semesterNumber: 'asc' },
            select: {
              id: true,
              semesterNumber: true,
              title: true,
              subjects: {
                select: {
                  id: true,
                  title: true,
                  shortCode: true,
                  category: true,
                  syllabusVersion: true,
                }
              }
            }
          }
        }
      }
    }
  });

  // Get question counts grouped by subject and publication status
  const examPrepQuestions = await prisma.examPrepQuestion.findMany({
    select: {
      id: true,
      universityId: true,
      semesterId: true,
      subjectId: true,
      marks: true,
      marksCategory: true,
      publicationStatus: true,
      verificationStatus: true,
    }
  });

  const report = [];

  for (const uni of universities) {
    for (const course of uni.courses) {
      for (const sem of course.semesters) {
        for (const subj of sem.subjects) {
          const matching = examPrepQuestions.filter(
            q => q.subjectId === subj.id
          );

          const publishedCount = matching.filter(q => q.publicationStatus === 'PUBLISHED').length;
          const draftCount = matching.filter(q => q.publicationStatus === 'DRAFT').length;
          const reviewCount = matching.filter(q => q.publicationStatus === 'IN_REVIEW').length;
          const marksCategories = Array.from(new Set(matching.map(q => `${q.marks} Marks`)));

          let coverageStatus = 'NOT_STARTED';
          if (publishedCount >= 10) {
            coverageStatus = 'COMPLETE';
          } else if (publishedCount > 0) {
            coverageStatus = 'PARTIAL';
          } else if (reviewCount > 0) {
            coverageStatus = 'IN_REVIEW';
          } else if (draftCount > 0) {
            coverageStatus = 'DRAFT';
          }

          report.push({
            universityId: uni.id,
            universityName: uni.name,
            universityCode: uni.code,
            courseId: course.id,
            courseName: course.name,
            semesterId: sem.id,
            semesterTitle: sem.title,
            subjectId: subj.id,
            subjectTitle: subj.title,
            subjectCode: subj.shortCode,
            syllabusVersion: subj.syllabusVersion,
            publishedQuestions: publishedCount,
            publishedModelAnswers: publishedCount,
            draftQuestions: draftCount,
            reviewPending: reviewCount,
            totalQuestions: matching.length,
            marksCategories,
            coverageStatus,
          });
        }
      }
    }
  }

  const totalPublished = examPrepQuestions.filter(q => q.publicationStatus === 'PUBLISHED').length;
  const totalDraft = examPrepQuestions.filter(q => q.publicationStatus === 'DRAFT').length;
  const totalInReview = examPrepQuestions.filter(q => q.publicationStatus === 'IN_REVIEW').length;

  return {
    summary: {
      totalUniversities: universities.length,
      totalSubjectsReported: report.length,
      totalPublishedQuestions: totalPublished,
      totalDraftQuestions: totalDraft,
      totalInReviewQuestions: totalInReview,
      totalQuestions: examPrepQuestions.length,
    },
    coverageMatrix: report,
  };
}

/**
 * Validates an academic hierarchy combination server-side.
 * Ensures university is VERIFIED, college belongs to university, and course is verified for college.
 */
export async function validateAcademicOrderInput({ universityId, collegeId, courseId, semesterId } = {}) {
  if (universityId) {
    const validUni = await prisma.university.findUnique({
      where: { id: universityId },
      select: { id: true, name: true, status: true },
    });
    if (!validUni || validUni.status !== 'VERIFIED') {
      return { valid: false, status: 400, error: 'Invalid or unverified university selected.' };
    }
  }

  let validCourse = null;
  if (courseId && universityId) {
    validCourse = await prisma.course.findFirst({
      where: { id: courseId, universityId, isActive: true },
      select: { id: true, code: true, name: true },
    });
    if (!validCourse) {
      return {
        valid: false,
        status: 400,
        error: 'Selected law program is not offered by the specified university.',
      };
    }
  }

  if (collegeId && universityId) {
    const validCollege = await prisma.college.findFirst({
      where: { id: collegeId, universityId, status: 'VERIFIED' },
      select: { id: true, name: true, programsJson: true },
    });
    if (!validCollege) {
      return {
        valid: false,
        status: 400,
        error: 'Selected college is not an affiliated verified institution of the specified university.',
      };
    }

    if (courseId && validCollege.programsJson) {
      try {
        const allowed = JSON.parse(validCollege.programsJson);
        if (Array.isArray(allowed) && allowed.length > 0) {
          const courseCode = validCourse?.code || '';
          const normCourseCode = courseCode.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normCourseId = courseId.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isAllowed = allowed.some(p => {
            const normP = p.toLowerCase().replace(/[^a-z0-9]/g, '');
            return p === courseId || p === courseCode || normP === normCourseCode || normCourseId.includes(normP) || normP.includes(normCourseCode);
          });
          if (!isAllowed) {
            return {
              valid: false,
              status: 400,
              error: `Selected law program is not verified for ${validCollege.name}.`,
            };
          }
        }
      } catch {}
    }
  }

  if (semesterId && courseId) {
    const validSem = await prisma.semester.findFirst({
      where: { id: semesterId, courseId },
    });
    if (!validSem) {
      return {
        valid: false,
        status: 400,
        error: 'Selected semester does not belong to the specified law program.',
      };
    }
  }

  return { valid: true };
}

/**
 * Loads verified academic hierarchy data for LowStudy dropdowns and selectors.
 */
export async function getAcademicHierarchyData({ universityId, collegeId, courseId, semesterId } = {}) {
  // 1. If no university selected, return all verified universities
  if (!universityId) {
    const universities = await prisma.university.findMany({
      where: { status: 'VERIFIED' },
      orderBy: { established: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        state: true,
        logo: true,
        academicYear: true,
        officialWebsite: true,
        officialSyllabusSource: true,
        _count: {
          select: {
            colleges: { where: { status: 'VERIFIED' } },
            courses: { where: { isActive: true } },
            subjects: { where: { isActive: true } },
            examPrepQuestions: true,
          },
        },
      },
    });

    return {
      success: true,
      universities: universities.map(u => ({
        ...u,
        collegesCount: u._count.colleges,
        coursesCount: u._count.courses,
        subjectsCount: u._count.subjects,
        examPrepCount: u._count.examPrepQuestions,
        hasVerifiedSyllabus: u._count.subjects > 0,
      })),
    };
  }

  // 2. Fetch specific university
  const university = await prisma.university.findUnique({
    where: { id: universityId },
    select: {
      id: true,
      name: true,
      code: true,
      city: true,
      state: true,
      status: true,
      academicYear: true,
      officialWebsite: true,
      officialSyllabusSource: true,
      colleges: {
        where: { status: 'VERIFIED' },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          universityId: true,
          name: true,
          city: true,
          district: true,
          type: true,
          officialWebsite: true,
          sourceUrl: true,
          programsJson: true,
          status: true,
        },
      },
      courses: {
        where: { isActive: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          code: true,
          totalSemesters: true,
          semesters: {
            orderBy: { semesterNumber: 'asc' },
            select: {
              id: true,
              semesterNumber: true,
              title: true,
              subjects: {
                where: { isActive: true },
                orderBy: { shortCode: 'asc' },
                select: {
                  id: true,
                  title: true,
                  shortCode: true,
                  category: true,
                  syllabusVersion: true,
                  credits: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!university) {
    return { success: false, status: 404, error: 'University not found.' };
  }

  // 3. Validate collegeId if provided
  let selectedCollege = null;
  if (collegeId) {
    selectedCollege = university.colleges.find(c => c.id === collegeId);
    if (!selectedCollege) {
      return {
        success: false,
        status: 400,
        error: `Selected college "${collegeId}" is not affiliated with ${university.name}.`,
      };
    }
  }

  // 4. Filter courses if selected college has specific program restrictions
  let availableCourses = university.courses;
  if (selectedCollege && selectedCollege.programsJson) {
    try {
      const allowedProgramCodes = JSON.parse(selectedCollege.programsJson);
      if (Array.isArray(allowedProgramCodes) && allowedProgramCodes.length > 0) {
        availableCourses = availableCourses.filter(course => {
          const codeMatch = allowedProgramCodes.includes(course.code);
          const idMatch = allowedProgramCodes.includes(course.id);
          const normCode = course.code.toLowerCase().replace(/[^a-z0-9]/g, '');
          const normalizedMatch = allowedProgramCodes.some(p => 
            p.toLowerCase().replace(/[^a-z0-9]/g, '') === normCode
          );
          return codeMatch || idMatch || normalizedMatch;
        });
      }
    } catch (err) {
      console.warn('Error parsing college programsJson:', err);
    }
  }

  // 5. Validate courseId if provided
  if (courseId) {
    const matchedCourse = availableCourses.find(c => c.id === courseId);
    if (!matchedCourse) {
      return {
        success: false,
        status: 400,
        error: `Selected course "${courseId}" is not offered by the selected college or university.`,
      };
    }
  }

  // 6. Calculate accurate, verified distinct subject counts per semester
  const enrichedCourses = availableCourses.map(course => {
    const enrichedSemesters = course.semesters.map(sem => {
      const distinctSubjectMap = new Map();
      for (const sub of sem.subjects) {
        const key = (sub.shortCode || sub.title).trim().toUpperCase();
        if (!distinctSubjectMap.has(key)) {
          distinctSubjectMap.set(key, sub);
        }
      }

      const distinctSubjectCount = distinctSubjectMap.size;
      const totalSubjectRecords = sem.subjects.length;
      const isUnderVerification = distinctSubjectCount === 0;

      return {
        id: sem.id,
        semesterNumber: sem.semesterNumber,
        title: sem.title || `Semester ${sem.semesterNumber}`,
        distinctSubjectCount,
        totalSubjectRecords,
        isUnderVerification,
        statusMessage: isUnderVerification
          ? 'Syllabus data under verification'
          : `${distinctSubjectCount} Subject${distinctSubjectCount === 1 ? '' : 's'}`,
        displayLabel: isUnderVerification
          ? `${sem.title || `Semester ${sem.semesterNumber}`} — Syllabus data under verification`
          : `${sem.title || `Semester ${sem.semesterNumber}`} (${distinctSubjectCount} Subject${distinctSubjectCount === 1 ? '' : 's'})`,
        subjects: sem.subjects,
      };
    });

    return {
      ...course,
      semesters: enrichedSemesters,
    };
  });

  // 7. Validate semesterId if provided
  if (semesterId) {
    let foundSem = null;
    for (const crs of enrichedCourses) {
      const s = crs.semesters.find(sm => sm.id === semesterId);
      if (s) {
        foundSem = s;
        break;
      }
    }
    if (!foundSem) {
      return {
        success: false,
        status: 400,
        error: `Selected semester "${semesterId}" does not belong to the selected course.`,
      };
    }
  }

  return {
    success: true,
    university: {
      ...university,
      collegesCount: university.colleges.length,
      hasNoAffiliatedColleges: university.colleges.length === 0,
      collegeMessage: university.colleges.length === 0
        ? (university.code === 'GNLU'
            ? 'Unitary Institution — Gandhinagar Campus Only'
            : 'No verified affiliated law colleges on record')
        : null,
      courses: enrichedCourses,
    },
    colleges: university.colleges,
  };
}
