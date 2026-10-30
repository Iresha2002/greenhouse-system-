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
  const reviewsCount = expert.reviewsCount ?? expert.reviewCount ?? 0;
  const hasGenuineRating =
    typeof expert.averageRating === 'number' &&
    expert.averageRating > 0 &&
    reviewsCount > 0;

  // Initials for avatar fallback
  const initials = (expert.fullName || 'Expert')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-[#0f3830]/80 border border-emerald-500/20 p-5 shadow-lg hover:border-emerald-400/40 transition-all">
      <div className="space-y-3.5">
        {/* Top: Avatar, Name, Verification Badge */}
        <div className="flex items-start gap-3.5">
          {expert.profilePhoto ? (
            <img
              src={expert.profilePhoto}
              alt={expert.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400/30 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-emerald-700/50 border border-emerald-400/30 flex items-center justify-center text-emerald-200 font-extrabold text-lg shrink-0">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-white truncate">
                {expert.fullName}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-semibold mt-0.5">
              <span>{expert.isVerified ? 'Verified' : 'Pending'}</span>
              <span>•</span>
              <span className={isAvailable ? 'text-emerald-300' : 'text-amber-300'}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>

            <p className="text-xs text-white/70 line-clamp-1 mt-1">
              {expert.professionalTitle}
            </p>
          </div>
        </div>

        {/* Experience & Location */}
        <div className="text-xs text-white/60 flex items-center gap-2 flex-wrap">
          {expert.yearsOfExperience !== undefined && (
            <span>{expert.yearsOfExperience}+ years experience</span>
          )}
          {expert.location && (
            <>
              <span>•</span>
              <span className="truncate">{expert.location}</span>
            </>
          )}
        </div>

        {/* Specialization Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(expert.specializations || []).slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/25 text-[11px] font-medium text-emerald-200"
            >
              {spec}
            </span>
          ))}
          {(expert.specializations || []).length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/60">
              +{expert.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Consultation Formats */}
        <div className="text-[11px] text-white/50">
          {(expert.consultationTypes || [])
            .map((t) => (t === 'in_person' ? 'Farm visit' : t === 'video' ? 'Video' : t === 'text' ? 'Text' : 'Phone'))
            .join(' · ')}
        </div>
      </div>

      {/* Bottom: Fee, Rating & Actions */}
      <div className="pt-4 mt-3 border-t border-emerald-500/15 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xl font-extrabold text-white">
              ${Number(expert.consultationFee || 0).toFixed(0)}
            </span>
            <span className="text-xs text-white/50 ml-1">per session</span>
          </div>

          {hasGenuineRating ? (
            <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
              <span>★</span>
              <span>{Number(expert.averageRating).toFixed(1)}</span>
              <span className="text-white/40">({reviewsCount})</span>
            </div>
          ) : (
            <span className="text-[11px] text-emerald-400 font-medium">
              {expert.completedConsultationsCount > 0
                ? `${expert.completedConsultationsCount} completed`
                : 'Verified'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewProfile && onViewProfile(expert)}
            className="py-2 px-3 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer text-center transition-colors"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onRequestConsultation && onRequestConsultation(expert)}
            disabled={!isAvailable}
            className={`py-2 px-3 rounded-full text-xs font-bold text-center transition-colors ${
              isAvailable
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Request help
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
