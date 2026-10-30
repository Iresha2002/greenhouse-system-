import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  GraduationCap,
  Award,
  MapPin,
  Globe,
  Clock,
  CalendarPlus,
  Video,
  MessageSquare,
  Phone,
  Users,
  ShieldCheck,
  Star,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { getExpertReviews } from '../../services/api';

const CONSULTATION_TYPE_DETAILS = {
  video: {
    label: 'Online Video Consultation',
    desc: 'Live visual inspection of greenhouse crops, leaves, and telemetry.',
    icon: Video,
  },
  text: {
    label: 'Text & Photo Consultation',
    desc: 'Asynchronous problem review with photo attachments & written action plan.',
    icon: MessageSquare,
  },
  phone: {
    label: 'Scheduled Phone Advisory',
    desc: 'Direct voice call for rapid troubleshooting and irrigation/nutrient dosing.',
    icon: Phone,
  },
  in_person: {
    label: 'On-Site Greenhouse Visit',
    desc: 'Physical inspection of greenhouse structure, substrate, and climate systems.',
    icon: Users,
  },
};

export const ExpertProfileModal = ({
  expert,
  onClose,
  onRequestConsultation,
}) => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!expert?._id) {
      setReviews([]);
      return;
    }
    let active = true;
    setLoadingReviews(true);
    getExpertReviews(expert._id)
      .then((res) => {
        if (active && res && res.success) {
          setReviews(res.reviews || []);
        }
      })
      .catch(() => {
        if (active) setReviews([]);
      })
      .finally(() => {
        if (active) setLoadingReviews(false);
      });
    return () => {
      active = false;
    };
  }, [expert?._id]);

  if (!expert) return null;

  const isAvailable = expert.isAvailable !== false;
  const reviewsCount =
    reviews.length || expert.reviewsCount || expert.reviewCount || 0;
  const hasGenuineRating =
    typeof expert.averageRating === 'number' &&
    expert.averageRating > 0 &&
    reviewsCount > 0;

  const schedule = expert.availabilitySchedule || {};
  const availableDays = schedule.availableDays || [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];
  const timeSlots = schedule.timeSlots || ['09:00 AM', '11:00 AM', '02:00 PM'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#0c312c] border border-cyan-400/40 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[92vh] overflow-y-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
          aria-label="Close Expert Profile Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Identity Header */}
        <div className="flex flex-col sm:flex-row items-start gap-5 pb-5 border-b border-white/10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-cyan-950/60 border-2 border-cyan-400/40 shrink-0 flex items-center justify-center shadow-lg">
            {expert.profilePhoto ? (
              <img
                src={expert.profilePhoto}
                alt={expert.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-extrabold text-cyan-300">
                {(expert.fullName || 'E')[0]}
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {expert.isVerified && expert.verificationStatus === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Verified Agricultural Expert</span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isAvailable
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>
                  {isAvailable ? 'Accepting Consultations' : 'Currently Unavailable'}
                </span>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {expert.fullName}
            </h3>

            <p className="text-sm sm:text-base font-bold text-cyan-300">
              {expert.professionalTitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-300">
                <Award className="w-4 h-4 text-emerald-400" />
                {expert.yearsOfExperience || 1}+ Years Agricultural Experience
              </span>

              {expert.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  {expert.location}
                </span>
              )}

              {Array.isArray(expert.languages) && expert.languages.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Languages: {expert.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Qualifications & Field of Study */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              Educational Qualifications
            </span>
            <p className="text-xs sm:text-sm text-white/90 font-semibold leading-relaxed">
              {expert.qualifications}
            </p>
            {expert.fieldOfStudy && (
              <p className="text-xs text-white/60">
                Primary Field: {expert.fieldOfStudy}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Consultation Fee & Record
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white">
                {expert.consultationFee > 0 ? (
                  <>
                    ${Number(expert.consultationFee).toFixed(2)}{' '}
                    <span className="text-xs font-normal text-cyan-300">
                      / {schedule.appointmentDurationMinutes || 45} min session
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-300">Free Consultation</span>
                )}
              </span>

              {hasGenuineRating ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/35 text-amber-300 text-xs font-extrabold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(expert.averageRating).toFixed(1)} ({reviewsCount} review
                  {reviewsCount === 1 ? '' : 's'})
                </span>
              ) : (
                <span className="text-xs text-white/60">
                  {expert.completedConsultationsCount || 0} completed sessions
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/55">
              Private identity documents & personal phone numbers are protected until a booking is confirmed.
            </p>
          </div>
        </div>

        {/* Biography & Agricultural Experience */}
        <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-3">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4" />
              Professional Biography
            </h4>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {expert.biography}
            </p>
          </div>

          {expert.experienceSummary && (
            <div className="pt-3 border-t border-white/10">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 mb-1">
                <Briefcase className="w-4 h-4" />
                Relevant Greenhouse & Field Experience
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {expert.experienceSummary}
              </p>
            </div>
          )}
        </div>

        {/* Areas of Expertise / Specializations */}
        <div className="space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
            Verified Areas of Expertise ({(expert.specializations || []).length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {(expert.specializations || []).map((spec) => (
              <span
                key={spec}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-xs font-bold text-cyan-200"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Consultation Types & Availability Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300">
              Consultation Methods Offered
            </h4>
            <div className="space-y-2">
              {(expert.consultationTypes || []).map((type) => {
                const detail = CONSULTATION_TYPE_DETAILS[type] || {
                  label: type,
                  desc: 'Standard agricultural consultation session.',
                  icon: MessageSquare,
                };
                const MethodIcon = detail.icon;
                return (
                  <div
                    key={type}
                    className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    <MethodIcon className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{detail.label}</p>
                      <p className="text-[11px] text-white/60">{detail.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              Weekly Consultation Availability
            </h4>
            <div>
              <span className="text-[11px] text-white/55 block mb-1">
                Available Days:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableDays.map((day) => (
                  <span
                    key={day}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-white/55 block mb-1">
                Standard Appointment Slots (Sri Lanka Standard Time — UTC+5:30):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {timeSlots.map((slot) => (
                  <span
                    key={slot}
                    className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Genuine Farmer Reviews Section (Stage 10 — Section 14) */}
        <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              Verified Farmer Reviews ({reviews.length})
            </h4>
            <span className="text-[11px] text-white/50">
              Only farmers with completed consultations can submit ratings
            </span>
          </div>

          {loadingReviews ? (
            <p className="text-xs text-white/60">Loading verified reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-white/60">
              No post-consultation farmer reviews submitted yet.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-1.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white">
                        {rev.farmerName}
                      </span>
                      {rev.affectedCrop && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Crop: {rev.affectedCrop}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-extrabold">
                      {'★'.repeat(rev.rating)}
                      <span className="text-white/40">
                        {'★'.repeat(Math.max(0, 5 - rev.rating))}
                      </span>
                      <span className="text-[11px] text-white/60 ml-1">
                        ({new Date(rev.createdAt).toLocaleDateString()})
                      </span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-white/80 leading-relaxed">{rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
          >
            Close Profile
          </button>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              if (onRequestConsultation) onRequestConsultation(expert);
            }}
            className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg transition-all ${
              isAvailable
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer shadow-cyan-500/25'
                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            }`}
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Request Consultation with {expert.fullName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileModal;
