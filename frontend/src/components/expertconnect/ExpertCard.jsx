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

  // High-contrast clean initials avatar palette directly matching reference screenshot
  const getAvatarStyle = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('kavinda') || n.includes('kp')) {
      return 'bg-[#ebf5fa] text-[#1e4a66]';
    }
    if (n.includes('nadeesha') || n.includes('ns')) {
      return 'bg-[#e3f6ed] text-[#15533c]';
    }
    if (n.includes('tharushi') || n.includes('et')) {
      return 'bg-[#fbf0dc] text-[#714b18]';
    }
    if (n.includes('roshan') || n.includes('rb')) {
      return 'bg-[#f0eafb] text-[#4d2f78]';
    }
    const PALETTES = [
      'bg-[#ebf5fa] text-[#1e4a66]',
      'bg-[#e3f6ed] text-[#15533c]',
      'bg-[#fbf0dc] text-[#714b18]',
      'bg-[#f0eafb] text-[#4d2f78]',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return PALETTES[sum % PALETTES.length];
  };

  const avatarClass = getAvatarStyle(expert.fullName || '');
  const hasUserPhoto =
    Boolean(expert.profilePhoto) && !expert.profilePhoto.includes('unsplash');

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 p-5 transition-all text-slate-900">
      <div className="space-y-3.5">
        {/* Top: Avatar, Name, Verification Badge */}
        <div className="flex items-center gap-3.5">
          {hasUserPhoto ? (
            <img
              src={expert.profilePhoto}
              alt={expert.fullName}
              className="rounded-full object-cover shrink-0 border border-slate-200 shadow-sm"
              style={{
                width: '52px',
                height: '52px',
                minWidth: '52px',
                minHeight: '52px',
                maxWidth: '52px',
                maxHeight: '52px',
              }}
            />
          ) : (
            <div
              className={`rounded-full ${avatarClass} font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm`}
              style={{
                width: '52px',
                height: '52px',
                minWidth: '52px',
                minHeight: '52px',
                maxWidth: '52px',
                maxHeight: '52px',
              }}
            >
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 truncate">
              {expert.fullName}
            </h3>

            <div className="text-xs font-semibold mt-0.5 flex items-center gap-1.5">
              <span className={expert.isVerified ? 'text-emerald-700' : 'text-slate-500'}>
                {expert.isVerified ? 'Verified' : 'Pending'}
              </span>
              <span className="text-slate-300">·</span>
              <span className={isAvailable ? 'text-emerald-700' : 'text-amber-700'}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-xs sm:text-sm font-semibold text-emerald-800 line-clamp-1">
            {expert.professionalTitle}
          </p>

          {/* Experience & Location */}
          <div className="text-xs text-slate-500 mt-1">
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
              className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
            >
              {spec}
            </span>
          ))}
          {(expert.specializations || []).length > 3 && (
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-500">
              +{expert.specializations.length - 3}
            </span>
          )}
        </div>

        {/* Consultation Formats */}
        <div className="text-xs text-slate-500 pt-0.5">
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
      <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-slate-950">
              ${Number(expert.consultationFee || 0).toFixed(0)}
            </span>
            <span className="text-xs text-slate-500 ml-1 font-medium">per session</span>
          </div>

          {hasGenuineRating ? (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
              <span>★</span>
              <span>{Number(expert.averageRating).toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({reviewsCount})</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
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
            className="py-2 px-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold text-center cursor-pointer transition-colors shadow-2xs"
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => onRequestConsultation && onRequestConsultation(expert)}
            disabled={!isAvailable}
            className={`py-2 px-4 rounded-full text-xs font-bold text-center transition-colors shadow-xs ${
              isAvailable
                ? 'bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
