"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  GraduationCap, 
  Users, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Send 
} from 'lucide-react';

export default function InstitutionalEnquiryModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    collegeName: '',
    designation: '',
    university: '',
    cityState: '',
    studentCount: '',
    preferredContactMethod: 'Email',
    description: '',
    website: '', // honeypot
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setIsSuccess(false);
      setSubmitError('');
      setErrors({});
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto focus first input
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim().length < 2) return 'Full Name is required (min 2 characters).';
        return '';
      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Please enter a valid email address.';
        }
        return '';
      case 'mobile': {
        const cleaned = value.trim().replace(/[\s-]/g, '');
        if (!cleaned || !/^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/.test(cleaned)) {
          return 'Please enter a valid 10-digit Indian mobile number.';
        }
        return '';
      }
      case 'collegeName':
        if (!value || value.trim().length < 2) return 'College or Institution name is required.';
        return '';
      case 'designation':
        if (!value || value.trim().length < 2) return 'Designation or role is required.';
        return '';
      case 'studentCount': {
        const parsed = parseInt(value, 10);
        if (!value || isNaN(parsed) || parsed <= 0) {
          return 'Please enter a valid number of students (positive integer).';
        }
        return '';
      }
      case 'description':
        if (!value || value.trim().length < 10) {
          return 'Please describe your requirements (minimum 10 characters).';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear inline error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all required fields
    const newErrors = {};
    ['fullName', 'email', 'mobile', 'collegeName', 'designation', 'studentCount', 'description'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const errorElem = document.getElementById(`field-${firstErrorKey}`);
      if (errorElem) {
        errorElem.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/enquiry/institutional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          collegeName: formData.collegeName,
          designation: formData.designation,
          university: formData.university,
          cityState: formData.cityState,
          studentCount: formData.studentCount,
          preferredContactMethod: formData.preferredContactMethod,
          description: formData.description,
          website: formData.website, // honeypot
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSuccess(true);
        // Reset fields
        setFormData({
          fullName: '',
          email: '',
          mobile: '',
          collegeName: '',
          designation: '',
          university: '',
          cityState: '',
          studentCount: '',
          preferredContactMethod: 'Email',
          description: '',
          website: '',
        });
      } else {
        if (result.validationErrors) {
          setErrors(result.validationErrors);
        }
        setSubmitError(result.error || 'Something went wrong while submitting your enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Enquiry submission error:', err);
      setSubmitError('Something went wrong while submitting your enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              Institutional Enquiry
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              ₹499 / month
            </span>
          </div>

          <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Interested in the College & Institutional Plan?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            You are filling out this form to enquire about the LowStudy College & Institutional Plan priced at <span className="font-semibold text-amber-400">₹499/month</span>.
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Please provide your details and requirements. Our team will contact you after reviewing your enquiry.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8 sm:py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Thank you for your enquiry!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your College & Institutional Plan enquiry has been submitted successfully. Our team will contact you soon.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left space-y-1.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>LowStudy Academic Coordinator Assigned</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  An enquiry confirmation has been sent to our institutional desk (<span className="font-mono text-slate-700">support@lowstudy.com</span>). We typically respond within 1 business day.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* Enquiry Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Submission Note: </span>
                    {submitError}
                  </div>
                </div>
              )}

              {/* Honeypot field (hidden from real users) */}
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                tabIndex="-1"
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Contact Information Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  <span>Representative Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="field-fullName" className="block text-xs font-bold text-slate-800 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      id="field-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Dr. Rajesh Mehta"
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                        errors.fullName
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="field-email" className="block text-xs font-bold text-slate-800 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="field-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. principal@lawcollege.edu.in"
                        required
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                          errors.email
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        }`}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="field-mobile" className="block text-xs font-bold text-slate-800 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="field-mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 9876543210"
                        required
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                          errors.mobile
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        }`}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.mobile && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Designation / Role */}
                  <div>
                    <label htmlFor="field-designation" className="block text-xs font-bold text-slate-800 mb-1">
                      Designation / Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Principal / Dean / HOD / Professor"
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                        errors.designation
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.designation && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Institution Details Section */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                  <span>College & Institutional Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* College / Institution Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="field-collegeName" className="block text-xs font-bold text-slate-800 mb-1">
                      College / Institution Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-collegeName"
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Sir L.A. Shah Law College"
                      required
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                        errors.collegeName
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                      }`}
                    />
                    {errors.collegeName && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.collegeName}
                      </p>
                    )}
                  </div>

                  {/* University (Optional) */}
                  <div>
                    <label htmlFor="field-university" className="block text-xs font-bold text-slate-800 mb-1">
                      Affiliated University <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="field-university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="e.g. Gujarat University / Saurashtra Univ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-hidden"
                    />
                  </div>

                  {/* City / State (Optional) */}
                  <div>
                    <label htmlFor="field-cityState" className="block text-xs font-bold text-slate-800 mb-1">
                      City / State <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="field-cityState"
                        name="cityState"
                        value={formData.cityState}
                        onChange={handleChange}
                        placeholder="e.g. Ahmedabad, Gujarat"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-hidden"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Number of Students */}
                  <div>
                    <label htmlFor="field-studentCount" className="block text-xs font-bold text-slate-800 mb-1">
                      Number of Students <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="field-studentCount"
                        name="studentCount"
                        min="1"
                        value={formData.studentCount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 250"
                        required
                        className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden ${
                          errors.studentCount
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                        }`}
                      />
                      <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {errors.studentCount && (
                      <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.studentCount}
                      </p>
                    )}
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label htmlFor="field-preferredContactMethod" className="block text-xs font-bold text-slate-800 mb-1">
                      Preferred Contact Method <span className="text-slate-400 text-[11px] font-normal">(Optional)</span>
                    </label>
                    <select
                      id="field-preferredContactMethod"
                      name="preferredContactMethod"
                      value={formData.preferredContactMethod}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all outline-hidden text-slate-800"
                    >
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="WhatsApp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description / Requirements Section */}
              <div className="pt-2 border-t border-slate-100">
                <label htmlFor="field-description" className="block text-xs font-bold text-slate-800 mb-1">
                  Description / Requirements <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="field-description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Please tell us about your institution, number of students, requirements, preferred features, implementation needs, or any questions you have."
                    required
                    className={`w-full p-3 rounded-xl border text-xs sm:text-sm bg-white transition-all outline-hidden resize-none ${
                      errors.description
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
                    }`}
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-[11px] font-medium text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Confirmation Notice Box (Requirement 8) */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 space-y-1">
                <div className="text-xs font-bold flex items-center gap-1.5 text-amber-900">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>You are submitting an enquiry for the LowStudy College & Institutional Plan at ₹499/month.</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed pl-5.5">
                  This is an institutional enquiry and consultation request, <strong className="font-semibold text-amber-950">NOT a payment</strong>. Our academic team will review your requirements and follow up directly.
                </p>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 text-center sm:text-left">
                  Questions? Reach support directly at <a href="mailto:support@lowstudy.com" className="font-medium text-slate-700 underline">support@lowstudy.com</a>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="w-1/2 sm:w-auto px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Enquiry</span>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
