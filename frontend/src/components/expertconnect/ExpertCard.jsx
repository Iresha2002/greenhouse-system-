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

  // Dynamic light avatar palette matching screenshot
  const AVATAR_PALETTES = [
    'bg-sky-100 text-sky-950',
    'bg-emerald-100 text-emerald-950',
    'bg-amber-100 text-amber-950',
    'bg-purple-100 text-purple-950',
    'bg-teal-100 text-teal-950',
  ];
  const charSum = (expert.fullName || 'E')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const avatarClass = AVATAR_PALETTES[charSum % AVATAR_PALETTES.length];

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-5 shadow-lg shadow-black/10 hover:border-white/25 transition-all">
      <div className="space-y-3.5">
        {/* Top: Avatar, Name, Verification Badge */}
        <div className="flex items-start gap-3.5">
          {expert.profilePhoto ? (
            <img
              src={expert.profilePhoto}
              alt={expert.fullName}
              className="w-13 h-13 rounded-full object-cover border border-white/20 shrink-0"
            />
          ) : (
            <div
              className={`w-13 h-13 rounded-full ${avatarClass} font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm`}
            >
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">
              {expert.fullName}
            </h3>

            <div className="text-xs text-emerald-400 font-medium mt-0.5">
              <span>{expert.isVerified ? 'Verified' : 'Pending'}</span>
              <span> · </span>
              <span className={isAvailable ? 'text-emerald-400' : 'text-amber-300'}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-[#4de1b7] line-clamp-1">
            {expert.professionalTitle}
          </p>

          {/* Experience & Location */}
          <div className="text-xs text-white/70 mt-1">
            {expert.yearsOfExperience !== undefined && (
              <span>{expert.yearsOfExperience}+ years experience</span>
            )}
            {expert.location && (
              <span> · {expert.location}</span>
            )}
          </div>
        </div>

        {/* Specialization Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(expert.specializations || []).slice(0, 3).map((spec) => (
            <span
              key={spec}
              className="px-3 py-1 rounded-full bg-white/[0.10] border border-white/10 text-xs font-medium text-white/90"
            >
              {spec}
            </span>
          ))}
          {(expert.specializations || []).length > 3 && (
            <span className="px-2.5 py-1 rounded-full bg-white/[0.08] text-[11px] text-white/60">
              +{expert.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Consultation Formats */}
        <div className="text-xs text-white/60 pt-0.5">
          {(expert.consultationTypes || [])
            .map((t) =>
              t === 'in_person'
                ? 'Farm visit'
                : t === 'video'
                ? 'Video'
                : t === 'text'
                ? 'Text'
                : 'Phone'
            )
            .join(' · ')}
        </div>
      </div>

      {/* Bottom: Fee, Rating & Actions */}
      <div className="pt-4 mt-3 border-t border-white/10 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-white">
              ${Number(expert.consultationFee || 0).toFixed(0)}
            </span>
            <span className="text-xs text-white/70 ml-1">per session</span>
          </div>

          {hasGenuineRating ? (
            <div className="flex items-center gap-1 text-xs text-amber-300 font-bold">
              <span>★</span>
              <span>{Number(expert.averageRating).toFixed(1)}</span>
              <span className="text-white/50">({reviewsCount})</span>
            </div>
          ) : (
            <span className="text-xs text-white/60">
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
            className="py-2 px-4 rounded-full border border-white/25 bg-white/[0.06] hover:bg-white/[0.14] text-white text-xs font-bold text-center cursor-pointer transition-colors"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onRequestConsultation && onRequestConsultation(expert)}
            disabled={!isAvailable}
            className={`py-2 px-4 rounded-full text-xs font-bold text-center transition-colors shadow-sm ${
              isAvailable
                ? 'bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 cursor-pointer'
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
