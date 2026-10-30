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

  // Initials for avatar fallback
  const initials = (expert.fullName || 'Expert')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0f3830] border border-emerald-500/30 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with back/close */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            ← Back to experts
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Header: Avatar, Name, Badges */}
        <div className="flex items-start gap-4">
          {expert.profilePhoto ? (
            <img
              src={expert.profilePhoto}
              alt={expert.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-emerald-400/40 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-700/60 border-2 border-emerald-400/40 flex items-center justify-center text-emerald-100 font-extrabold text-xl sm:text-2xl shrink-0">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                {expert.isVerified ? 'Verified agricultural expert' : 'Pending verification'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-[11px] font-medium">
                {isAvailable ? 'Taking bookings' : 'Currently busy'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {expert.fullName}
            </h3>

            <p className="text-xs sm:text-sm font-semibold text-emerald-200">
              {expert.professionalTitle}
            </p>

            <div className="text-xs text-white/60 flex items-center gap-2 flex-wrap pt-0.5">
              {expert.yearsOfExperience !== undefined && (
                <span>{expert.yearsOfExperience}+ years</span>
              )}
              {expert.location && (
                <>
                  <span>•</span>
                  <span>{expert.location}</span>
                </>
              )}
              {Array.isArray(expert.languages) && expert.languages.length > 0 && (
                <>
                  <span>•</span>
                  <span>{expert.languages.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Qualifications & Fee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-emerald-300 block">
              Qualifications
            </span>
            <p className="text-xs sm:text-sm text-white font-semibold">
              {expert.qualifications}
            </p>
            {expert.fieldOfStudy && (
              <p className="text-xs text-white/60">{expert.fieldOfStudy}</p>
            )}
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-emerald-300 block">
              Fee
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">
                ${Number(expert.consultationFee || 0).toFixed(0)}
              </span>
              <span className="text-xs text-white/60">
                per {schedule.appointmentDurationMinutes || 45}-minute session
              </span>
            </div>
            <p className="text-[11px] text-white/50">
              {expert.completedConsultationsCount || 0} sessions completed. Phone numbers stay private until you book.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl bg-black/25 border border-white/10 p-4 space-y-2">
          <span className="text-[11px] uppercase font-bold text-emerald-300 block">
            About
          </span>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            {expert.biography}
          </p>
          {expert.experienceSummary && (
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed pt-1 border-t border-white/10">
              {expert.experienceSummary}
            </p>
          )}

          {/* Specialization Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {(expert.specializations || []).map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/25 text-xs font-medium text-emerald-200"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* How you can talk & When available */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2.5">
            <span className="text-[11px] uppercase font-bold text-emerald-300 block">
              How you can talk
            </span>
            <div className="space-y-2 text-xs">
              {(expert.consultationTypes || []).map((type) => {
                const detail = CONSULTATION_TYPE_DETAILS[type] || {
                  label: type,
                  desc: 'Standard consultation session.',
                };
                return (
                  <div key={type} className="space-y-0.5">
                    <p className="font-bold text-white">{detail.label}</p>
                    <p className="text-[11px] text-white/60">{detail.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2.5">
            <span className="text-[11px] uppercase font-bold text-emerald-300 block">
              When available
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableDays.map((day) => (
                <span
                  key={day}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs font-semibold"
                >
                  {day.slice(0, 3)}
                </span>
              ))}
            </div>

            <span className="text-[11px] text-white/50 block pt-1">
              Times in Sri Lanka time (UTC+5:30)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {timeSlots.map((slot) => (
                <span
                  key={slot}
                  className="px-2.5 py-1 rounded-lg border border-emerald-400/30 text-white text-xs font-semibold"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Farmer Reviews */}
        <div className="rounded-2xl bg-black/30 border border-white/10 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-emerald-300">
              Farmer reviews ({reviews.length})
            </span>
            {hasGenuineRating && (
              <span className="text-xs text-amber-300 font-bold">
                ★ {Number(expert.averageRating).toFixed(1)} average
              </span>
            )}
          </div>

          {loadingReviews ? (
            <p className="text-xs text-white/60">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-white/60">
              No reviews yet. Only farmers who finished a session can leave one.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-2.5 rounded-xl bg-white/[0.04] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-white/80">
                    <span className="font-bold text-white">{rev.farmerName}</span>
                    <span className="text-amber-400 font-bold">{'★'.repeat(rev.rating)}</span>
                  </div>
                  {rev.comment && <p className="text-white/70 italic">&ldquo;{rev.comment}&rdquo;</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-bold cursor-pointer text-center"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => {
              onClose();
              if (onRequestConsultation) onRequestConsultation(expert);
            }}
            className={`py-3 px-4 rounded-full text-xs font-bold text-center transition-colors ${
              isAvailable
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Request a session with {expert.fullName?.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileModal;
