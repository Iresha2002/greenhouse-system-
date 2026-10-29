import React from 'react';
import {
  CheckCircle,
  Clock,
  GraduationCap,
  Award,
  MapPin,
  Star,
  Eye,
  CalendarPlus,
  Video,
  MessageSquare,
  Phone,
  Users,
} from 'lucide-react';

const CONSULTATION_TYPE_LABELS = {
  video: { label: 'Video Call', icon: Video },
  text: { label: 'Text Advisory', icon: MessageSquare },
  phone: { label: 'Phone Call', icon: Phone },
  in_person: { label: 'Field Visit', icon: Users },
};

export const ExpertCard = ({ expert, onViewProfile, onRequestConsultation }) => {
  const isAvailable = expert.isAvailable !== false;
  const hasGenuineRating =
    typeof expert.averageRating === 'number' &&
    expert.averageRating > 0 &&
    expert.reviewCount > 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-white/[0.07] hover:bg-white/[0.11] border border-white/15 hover:border-cyan-400/45 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 shadow-xl">
      <div>
        {/* Top Row: Avatar, Name, Title, Verification & Availability Badges */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-cyan-950/60 border border-cyan-400/35 shrink-0 flex items-center justify-center">
            {expert.profilePhoto ? (
              <img
                src={expert.profilePhoto}
                alt={expert.fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-2xl font-extrabold text-cyan-300">
                {(expert.fullName || 'E')[0]}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {expert.isVerified && expert.verificationStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-[10px] font-extrabold uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>Verified Expert</span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isAvailable
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                <span>{isAvailable ? 'Available for Booking' : 'Schedule Busy'}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors truncate">
              {expert.fullName}
            </h3>

            <p className="text-xs font-semibold text-cyan-200/90 line-clamp-1">
              {expert.professionalTitle}
            </p>
          </div>
        </div>

        {/* Qualifications & Experience Summary */}
        <div className="space-y-2 mb-4 text-xs text-white/75">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{expert.qualifications}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/65">
            {expert.yearsOfExperience !== undefined && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                {expert.yearsOfExperience}+ Years Experience
              </span>
            )}

            {expert.location && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                {expert.location}
              </span>
            )}
          </div>
        </div>

        {/* Specializations Pills */}
        <div className="mb-4">
          <span className="text-[10px] uppercase tracking-wider text-white/45 font-bold block mb-1.5">
            Areas of Specialization
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(expert.specializations || []).slice(0, 4).map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-[11px] font-semibold text-white/90"
              >
                {spec}
              </span>
            ))}
            {(expert.specializations || []).length > 4 && (
              <span className="px-2 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 text-[11px] font-bold">
                +{expert.specializations.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Supported Consultation Methods */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {(expert.consultationTypes || []).map((type) => {
            const meta = CONSULTATION_TYPE_LABELS[type] || {
              label: type,
              icon: MessageSquare,
            };
            const TypeIcon = meta.icon;
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-[10px] text-white/75 font-semibold"
              >
                <TypeIcon className="w-3 h-3 text-cyan-400" />
                <span>{meta.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Consultation Fee, Genuine Rating, and Action Buttons */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 block">
              Consultation Fee
            </span>
            <span className="text-lg font-extrabold text-white">
              {expert.consultationFee > 0 ? (
                <>
                  ${Number(expert.consultationFee).toFixed(2)}{' '}
                  <span className="text-xs font-normal text-cyan-300">/ session</span>
                </>
              ) : (
                <span className="text-emerald-300">Free Advisory</span>
              )}
            </span>
          </div>

          <div className="text-right">
            {hasGenuineRating ? (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/35 text-amber-300 text-xs font-extrabold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(expert.averageRating).toFixed(1)}</span>
                <span className="text-[10px] text-white/60">
                  ({expert.reviewCount})
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-white/50 font-medium">
                {expert.completedConsultationsCount > 0
                  ? `${expert.completedConsultationsCount} completed`
                  : 'Verified Specialist'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile && onViewProfile(expert)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>View Profile</span>
          </button>

          <button
            type="button"
            onClick={() => onRequestConsultation && onRequestConsultation(expert)}
            disabled={!isAvailable}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isAvailable
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer shadow-cyan-500/20'
                : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
            }`}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Request Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
