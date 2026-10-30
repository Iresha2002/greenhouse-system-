import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Video,
  MessageSquare,
  Phone,
  Users,
  CalendarPlus,
  RefreshCw,
  Lock,
  Settings,
  ExternalLink,
  Sprout,
  Save,
  ClipboardCheck,
  Star,
} from 'lucide-react';
import {
  getExpertAvailableSlots,
  createConsultationBooking,
  getMyConsultations,
  updateConsultationStatus,
  getMyProblemReports,
  getMyExpertApplication,
  updateMyExpertProfile,
  submitConsultationReview,
} from '../../services/api';
import ConsultationChatModal from './ConsultationChatModal';
import ConsultationRecommendationModal from './ConsultationRecommendationModal';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_TIME_SLOTS = [
  '08:30 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '03:30 PM',
  '04:30 PM',
];

// Helper to get next weekday date (YYYY-MM-DD)
const getDefaultBookingDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Skip Sunday
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Skip Saturday
  return d.toISOString().slice(0, 10);
};

export const ConsultationBookingPortal = ({
  currentUser,
  experts = [],
  preselectedExpert = null,
  preselectedProblem = null,
  onOpenLogin,
  onClearPreselection,
  onDirectoryUpdated,
}) => {
  // Booking Form State (Section 10.1)
  const [selectedExpertId, setSelectedExpertId] = useState(
    preselectedExpert?._id || (experts[0]?._id ?? '')
  );
  const [selectedProblemId, setSelectedProblemId] = useState(
    preselectedProblem?._id || ''
  );
  const [consultationType, setConsultationType] = useState('video');
  const [preferredDate, setPreferredDate] = useState(getDefaultBookingDate());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [problemSummary, setProblemSummary] = useState(
    preselectedProblem?.description || ''
  );
  const [affectedCrop, setAffectedCrop] = useState(
    preselectedProblem?.affectedCrop || ''
  );

  // Live Available Slots for Selected Expert + Date
  const [slotList, setSlotList] = useState([]);
  const [slotsMeta, setSlotsMeta] = useState({
    weekday: '',
    isDateBlocked: false,
    dailyLimitReached: false,
  });
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Farmer's Problem Reports for Dropdown Link
  const [myProblems, setMyProblems] = useState([]);

  // Consultations List (Farmer & Expert Views)
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Reschedule Inline State
  const [rescheduleTargetId, setRescheduleTargetId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(getDefaultBookingDate());
  const [rescheduleSlot, setRescheduleSlot] = useState('11:00 AM');

  // Stage 8: Active Consultation Chat Modal State
  const [activeChatConsultation, setActiveChatConsultation] = useState(null);

  // Stage 9: Active Expert Recommendation Modal State
  const [activeRecommendationConsultation, setActiveRecommendationConsultation] =
    useState(null);

  // Stage 10: Post-Consultation Review State (Section 14)
  const [reviewTargetId, setReviewTargetId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Expert Availability Management State (Section 10.3)
  const [myExpertProfile, setMyExpertProfile] = useState(null);
  const [showAvailabilityEditor, setShowAvailabilityEditor] = useState(false);
  const [availDays, setAvailDays] = useState([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);
  const [availSlots, setAvailSlots] = useState([
    '09:00 AM',
    '11:00 AM',
    '02:00 PM',
    '04:00 PM',
  ]);
  const [maxPerDay, setMaxPerDay] = useState(5);
  const [isAcceptingBookings, setIsAcceptingBookings] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Feedback Banners
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmedBookingReceipt, setConfirmedBookingReceipt] = useState(null);

  // Sync preselected expert/problem when passed from Directory or Problem Matching
  useEffect(() => {
    if (preselectedExpert?._id) {
      setSelectedExpertId(preselectedExpert._id);
    } else if (!selectedExpertId && experts.length > 0) {
      setSelectedExpertId(experts[0]._id);
    }
  }, [preselectedExpert, experts, selectedExpertId]);

  useEffect(() => {
    if (preselectedProblem) {
      setSelectedProblemId(preselectedProblem._id || '');
      setProblemSummary(
        preselectedProblem.description || preselectedProblem.title || ''
      );
      setAffectedCrop(preselectedProblem.affectedCrop || '');
      if (preselectedProblem.preferredConsultationType) {
        setConsultationType(preselectedProblem.preferredConsultationType);
      }
    }
  }, [preselectedProblem]);

  // Load slots whenever selectedExpertId or preferredDate changes
  const fetchSlots = useCallback(async () => {
    if (!selectedExpertId || !preferredDate) return;
    setLoadingSlots(true);
    try {
      const res = await getExpertAvailableSlots(selectedExpertId, preferredDate);
      if (res && res.success) {
        const list = res.slots || [];
        setSlotList(list);
        setSlotsMeta({
          weekday: res.weekday || '',
          isDateBlocked: Boolean(res.isDateBlocked),
          dailyLimitReached: Boolean(res.dailyLimitReached),
        });
        const firstOpen = list.find((s) => s.available);
        setSelectedSlot(firstOpen ? firstOpen.slot : '');
      }
    } catch {
      setSlotList([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedExpertId, preferredDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Load user's consultations, problem reports, and expert profile (if expert)
  const fetchPortalData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingConsultations(true);
    try {
      const [conRes, probRes, expRes] = await Promise.all([
        getMyConsultations(),
        getMyProblemReports().catch(() => null),
        getMyExpertApplication().catch(() => null),
      ]);

      if (conRes && conRes.success) {
        setConsultations(conRes.consultations || []);
      }
      if (probRes && probRes.success) {
        setMyProblems(probRes.reports || []);
      }
      if (expRes && expRes.success && expRes.application) {
        const prof = expRes.application;
        setMyExpertProfile(prof);
        setIsAcceptingBookings(prof.isAvailable !== false);
        if (prof.availabilitySchedule) {
          setAvailDays(
            prof.availabilitySchedule.availableDays || [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
            ]
          );
          setAvailSlots(
            prof.availabilitySchedule.timeSlots || [
              '09:00 AM',
              '11:00 AM',
              '02:00 PM',
              '04:00 PM',
            ]
          );
          setMaxPerDay(prof.availabilitySchedule.maxConsultationsPerDay || 5);
        }
      }
    } catch {
      // Ignore initial error
    } finally {
      setLoadingConsultations(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const handleSelectProblemReport = (probId) => {
    setSelectedProblemId(probId);
    const found = myProblems.find((p) => p._id === probId);
    if (found) {
      setProblemSummary(found.description || found.title || '');
      setAffectedCrop(found.affectedCrop || '');
      if (found.preferredConsultationType) {
        setConsultationType(found.preferredConsultationType);
      }
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedExpertId || !preferredDate || !selectedSlot) {
      setErrorMsg(
        'Please select an agricultural expert, preferred date, and an available appointment slot.'
      );
      return;
    }

    if (!problemSummary.trim()) {
      setErrorMsg('Please describe the greenhouse problem for this consultation.');
      return;
    }

    setSubmittingBooking(true);
    try {
      const linkedProb = myProblems.find((p) => p._id === selectedProblemId);
      const res = await createConsultationBooking({
        expertProfileId: selectedExpertId,
        problemReportId: selectedProblemId || undefined,
        consultationType,
        preferredDate,
        timeSlot: selectedSlot,
        problemSummary: problemSummary.trim(),
        problemCategory: linkedProb?.category || 'Greenhouse Advisory',
        affectedCrop: affectedCrop.trim(),
      });

      if (res && res.success && res.consultation) {
        setConfirmedBookingReceipt(res.consultation);
        setSuccessMsg(res.message);
        if (onClearPreselection) onClearPreselection();
        await Promise.all([fetchSlots(), fetchPortalData()]);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to create consultation booking.'
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleStatusChange = async (consultationId, nextStatus, extra = {}) => {
    setUpdatingId(consultationId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await updateConsultationStatus(consultationId, {
        status: nextStatus,
        ...extra,
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setRescheduleTargetId(null);
        await Promise.all([fetchSlots(), fetchPortalData()]);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to update consultation status.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmitReview = async (consultationId) => {
    setSubmittingReview(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await submitConsultationReview(consultationId, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        setReviewTargetId(null);
        setReviewRating(5);
        setReviewComment('');
        await fetchPortalData();
        if (onDirectoryUpdated) onDirectoryUpdated();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to submit consultation review.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    setSavingAvailability(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await updateMyExpertProfile({
        isAvailable: isAcceptingBookings,
        availabilitySchedule: {
          availableDays: availDays,
          timeSlots: availSlots,
          maxConsultationsPerDay: Number(maxPerDay) || 5,
          appointmentDurationMinutes: 45,
        },
      });
      if (res && res.success) {
        setSuccessMsg('Your consultation availability schedule has been updated!');
        setShowAvailabilityEditor(false);
        await Promise.all([fetchSlots(), fetchPortalData()]);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to update availability schedule.'
      );
    } finally {
      setSavingAvailability(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-8 sm:p-10 text-center space-y-3">
        <Lock className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">
          Sign in to book &amp; manage consultations
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/70 max-w-md mx-auto leading-relaxed">
          Sign in to select appointment slots, prevent double bookings, and access private consultation chats and expert treatment notes.
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-5 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs sm:text-sm cursor-pointer shadow"
        >
          Sign in to book session
        </button>
      </div>
    );
  }

  const chosenExpertObj = experts.find((e) => e._id === selectedExpertId);

  const filteredConsultations = consultations.filter((c) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['pending', 'accepted', 'confirmed', 'in_progress', 'reschedule_requested'].includes(
        c.status
      );
    }
    return c.status === statusFilter;
  });

  const statusStyles = {
    pending: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
    accepted: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    confirmed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    in_progress: 'bg-[#4de1b7]/20 text-[#4de1b7] border border-[#4de1b7]/40',
    reschedule_requested: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
    completed: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    cancelled: 'bg-red-500/20 text-red-300 border border-red-400/30',
    rejected: 'bg-red-500/20 text-red-300 border border-red-400/30',
  };

  return (
    <div className="space-y-6">
      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Booking Confirmation Receipt Banner */}
      {confirmedBookingReceipt && (
        <div className="rounded-2xl bg-[#0f3830] border border-emerald-400/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
              Booking confirmed
            </span>
            <h4 className="text-base font-bold text-white">
              Consultation ref: {confirmedBookingReceipt.consultationNumber}
            </h4>
            <p className="text-xs text-emerald-100/75">
              Expert: <strong className="text-white">{confirmedBookingReceipt.expertName}</strong> • Date:{' '}
              <strong className="text-white">{confirmedBookingReceipt.preferredDate}</strong> at{' '}
              <strong className="text-white">{confirmedBookingReceipt.timeSlot}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmedBookingReceipt(null)}
            className="px-3.5 py-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/80 text-xs font-semibold border border-emerald-500/20 cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 10.3: EXPERT AVAILABILITY MANAGEMENT (If User Has Profile)    */}
      {/* ===================================================================== */}
      {myExpertProfile && (
        <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                Your consultation schedule ({myExpertProfile.fullName})
              </h3>
              <p className="text-xs text-emerald-100/70">
                Set active booking status, days of the week, and daily session caps.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAvailabilityEditor((prev) => !prev)}
              className="px-3.5 py-1.5 rounded-full border border-emerald-500/30 text-emerald-200 hover:text-white hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showAvailabilityEditor ? 'Close schedule editor' : 'Configure schedule'}</span>
            </button>
          </div>

          {showAvailabilityEditor && (
            <form
              onSubmit={handleSaveAvailability}
              className="pt-3 border-t border-emerald-500/15 space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAcceptingBookings}
                    onChange={(e) => setIsAcceptingBookings(e.target.checked)}
                    className="w-4 h-4 accent-[#4de1b7]"
                  />
                  <span>Accepting new consultation bookings</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-100/75">Max sessions / day:</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={maxPerDay}
                    onChange={(e) => setMaxPerDay(e.target.value)}
                    className="w-16 px-2 py-1 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <span className="font-semibold text-emerald-100/80 block mb-1">
                  Available days of week:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((day) => {
                    const active = availDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setAvailDays((prev) =>
                            active ? prev.filter((d) => d !== day) : [...prev, day]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#4de1b7] text-slate-950 font-bold border-[#4de1b7]'
                            : 'bg-[#0a2720] text-emerald-100/60 border-emerald-500/20'
                        }`}
                      >
                        {active ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="font-semibold text-emerald-100/80 block mb-1">
                  Available time slots (UTC+5:30):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const active = availSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setAvailSlots((prev) =>
                            active ? prev.filter((s) => s !== slot) : [...prev, slot]
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer ${
                          active
                            ? 'bg-[#4de1b7] text-slate-950 font-bold border-[#4de1b7]'
                            : 'bg-[#0a2720] text-emerald-100/60 border-emerald-500/20'
                        }`}
                      >
                        {active ? `✓ ${slot}` : slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingAvailability}
                  className="px-5 py-2 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAvailability ? 'Saving...' : 'Save schedule'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 10.1: REQUEST A CONSULTATION BOOKING FORM                     */}
      {/* ===================================================================== */}
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-5 sm:p-7 space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Book a consultation
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Choose an expert, select your preferred date, and pick an open time slot.
          </p>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Select Verified Expert */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                1. Select expert *
              </label>
              <select
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
              >
                {experts.map((exp) => (
                  <option key={exp._id} value={exp._id} className="bg-slate-900 text-white">
                    {exp.fullName} — {exp.professionalTitle} (${Number(exp.consultationFee || 0).toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            {/* Link Existing Problem Report (Optional) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                2. Link problem report (optional)
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => handleSelectProblemReport(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">
                  -- Or write custom description below --
                </option>
                {myProblems.map((prob) => (
                  <option key={prob._id} value={prob._id} className="bg-slate-900 text-white">
                    {prob.reportNumber}: {prob.title} ({prob.affectedCrop})
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Method */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                3. Consultation type *
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
              >
                <option value="video" className="bg-slate-900 text-white">Online Video Call</option>
                <option value="text" className="bg-slate-900 text-white">Text and Photos</option>
                <option value="phone" className="bg-slate-900 text-white">Phone Call</option>
                <option value="in_person" className="bg-slate-900 text-white">Farm Visit</option>
              </select>
            </div>
          </div>

          {/* Date & Time Slot Picker */}
          <div className="rounded-xl bg-[#0a2720] border border-emerald-500/15 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  4. Preferred date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f3830] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  5. Available time slots ({slotsMeta.weekday || preferredDate}) *
                </label>
                {loadingSlots ? (
                  <p className="text-xs text-emerald-300">Checking slot availability...</p>
                ) : slotList.length === 0 ? (
                  <p className="text-xs text-amber-300">
                    No slots found for this date. Please pick another date.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {slotList.map((item) => {
                      const isChosen = selectedSlot === item.slot && item.available;
                      return (
                        <button
                          key={item.slot}
                          type="button"
                          disabled={!item.available}
                          onClick={() => setSelectedSlot(item.slot)}
                          title={item.reason}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            !item.available
                              ? 'bg-red-500/10 border-red-500/20 text-white/30 line-through cursor-not-allowed'
                              : isChosen
                              ? 'bg-[#4de1b7] text-slate-950 border-[#4de1b7] font-bold cursor-pointer'
                              : 'bg-[#0f3830] hover:bg-[#14473d] text-emerald-100 border-emerald-500/20 cursor-pointer'
                          }`}
                        >
                          {item.slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem Description & Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                Affected crop
              </label>
              <input
                type="text"
                value={affectedCrop}
                onChange={(e) => setAffectedCrop(e.target.value)}
                placeholder="e.g. Tomato / Bell pepper"
                className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                Problem summary &amp; questions for the expert *
              </label>
              <input
                type="text"
                required
                value={problemSummary}
                onChange={(e) => setProblemSummary(e.target.value)}
                placeholder="Describe what you want to cover during this consultation..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-500/15">
            <div className="text-xs text-emerald-100/75">
              Consultation fee:{' '}
              <strong className="text-base text-white">
                ${Number(chosenExpertObj?.consultationFee || 0).toFixed(0)}
              </strong>{' '}
              <span className="text-emerald-100/50">per session</span>
            </div>

            <button
              type="submit"
              disabled={submittingBooking || !selectedSlot}
              className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow cursor-pointer transition-all"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>
                {submittingBooking ? 'Booking...' : 'Confirm consultation booking'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 10.2 & 13: MY CONSULTATIONS (Farmer & Assigned Expert Views)  */}
      {/* ===================================================================== */}
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-500/15">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              My consultations ({filteredConsultations.length})
            </h3>
            <p className="text-xs text-emerald-100/70">
              Track appointments, chat with assigned experts, and review treatment recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All (${consultations.length})` },
              { id: 'pending', label: 'Pending' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#4de1b7] text-slate-950 font-bold'
                    : 'bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/75 border border-emerald-500/20'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchPortalData}
              className="p-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/80 border border-emerald-500/20 cursor-pointer"
              title="Refresh consultations"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingConsultations ? 'animate-spin text-emerald-300' : ''}`}
              />
            </button>
          </div>
        </div>

        {filteredConsultations.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#0a2720] border border-emerald-500/15 text-center text-xs text-emerald-100/60">
            No consultations found in this category.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConsultations.map((con) => {
              const isAssignedExpert =
                String(con.expertUser) === String(currentUser.id || currentUser._id) ||
                currentUser.role === 'admin';
              const isFarmerOwner =
                String(con.farmer) === String(currentUser.id || currentUser._id);
              const isUpdating = updatingId === con._id;

              return (
                <div key={con._id} className="rounded-xl bg-[#0a2720] border border-emerald-500/20 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-500/15">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-300">
                        {con.consultationNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          statusStyles[con.status] || statusStyles.pending
                        }`}
                      >
                        {con.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-emerald-100/75">
                        📅 {con.preferredDate} • ⏰ {con.timeSlot}
                      </span>
                      <span className="text-xs text-emerald-300 font-medium capitalize">
                        • {con.consultationType}
                      </span>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-white font-bold">
                        ${Number(con.consultationFee || 0).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs">
                    <div className="lg:col-span-4 rounded-lg bg-[#0f3830] p-3 space-y-1">
                      <p className="text-emerald-100/50 uppercase text-[10px] font-bold">
                        Participants
                      </p>
                      <p className="text-white">
                        Expert: <strong className="text-emerald-200">{con.expertName}</strong>
                      </p>
                      <p className="text-white/80">
                        Farmer: <span>{con.farmerName}</span>
                      </p>
                      {con.affectedCrop && (
                        <p className="text-emerald-300 pt-0.5">
                          Crop: {con.affectedCrop}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-8 rounded-lg bg-[#0f3830] p-3 space-y-1.5">
                      <p className="text-emerald-100/50 uppercase text-[10px] font-bold">
                        Problem summary
                      </p>
                      <p className="text-emerald-100/90 leading-relaxed">
                        {con.problemSummary}
                      </p>

                      {con.meetingLink &&
                        ['accepted', 'confirmed', 'in_progress'].includes(con.status) && (
                          <div className="pt-1">
                            <a
                              href={con.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold hover:bg-emerald-500/30"
                            >
                              <Video className="w-3 h-3" />
                              <span>Join video room</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Reschedule Editor if Open */}
                  {rescheduleTargetId === con._id && (
                    <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/30 flex flex-wrap items-end gap-2.5 text-xs">
                      <div>
                        <label className="block text-emerald-100/80 mb-1 font-semibold">
                          New date
                        </label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="px-3 py-1 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-100/80 mb-1 font-semibold">
                          New time slot
                        </label>
                        <select
                          value={rescheduleSlot}
                          onChange={(e) => setRescheduleSlot(e.target.value)}
                          className="px-3 py-1 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-white"
                        >
                          {DEFAULT_TIME_SLOTS.map((s) => (
                            <option key={s} value={s} className="bg-slate-900">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(con._id, 'reschedule_requested', {
                            proposedDate: rescheduleDate,
                            proposedTimeSlot: rescheduleSlot,
                            note: `Rescheduled to ${rescheduleDate} at ${rescheduleSlot}`,
                          })
                        }
                        className="px-4 py-1.5 rounded-full bg-[#4de1b7] text-slate-950 font-bold cursor-pointer"
                      >
                        Save new slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setRescheduleTargetId(null)}
                        className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-white/70 hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Inline Expert Recommendation Summary */}
                  {con.recommendation?.observations && (
                    <div className="rounded-xl bg-[#0f3830] border border-emerald-500/25 p-3.5 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <ClipboardCheck className="w-3.5 h-3.5" />
                          Expert recommendation ({con.expertName})
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-200">
                          {con.recommendation.diagnosisType === 'confirmed_diagnosis'
                            ? 'Confirmed diagnosis'
                            : 'Preliminary opinion'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        <div className="p-2 rounded-lg bg-[#0a2720] border border-emerald-500/15">
                          <span className="text-[10px] font-bold text-emerald-300 block mb-0.5">
                            Observation
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.observations}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0a2720] border border-emerald-500/15">
                          <span className="text-[10px] font-bold text-emerald-300 block mb-0.5">
                            Possible cause
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.possibleCauses}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0a2720] border border-emerald-500/15">
                          <span className="text-[10px] font-bold text-emerald-300 block mb-0.5">
                            Recommended action
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.recommendedActions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Post-Consultation Review Editor */}
                  {reviewTargetId === con._id && (
                    <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/30 space-y-2.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Rate your consultation with {con.expertName}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setReviewRating(starVal)}
                              className={`px-2 py-0.5 rounded-full font-bold cursor-pointer transition-all ${
                                reviewRating >= starVal
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-[#0a2720] text-white/50 border border-emerald-500/20'
                              }`}
                            >
                              {starVal} ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Write feedback about this consultation session (optional)..."
                        className="w-full px-3 py-1.5 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs text-white focus:outline-none focus:border-[#4de1b7]"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewTargetId(null)}
                          className="px-3 py-1 rounded-full border border-emerald-500/30 text-white/70 hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingReview}
                          onClick={() => handleSubmitReview(con._id)}
                          className="px-4 py-1.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold cursor-pointer"
                        >
                          {submittingReview ? 'Submitting...' : `Submit ${reviewRating}★ review`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Controls for Assigned Expert & Requesting Farmer */}
                  <div className="pt-2 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveChatConsultation(con)}
                        className="px-3.5 py-1.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat &amp; photos</span>
                      </button>

                      {isAssignedExpert ? (
                        <button
                          type="button"
                          onClick={() => setActiveRecommendationConsultation(con)}
                          className="px-3.5 py-1.5 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>
                            {con.recommendation?.observations
                              ? 'Edit recommendations'
                              : 'Add recommendations'}
                          </span>
                        </button>
                      ) : (
                        con.recommendation?.observations && (
                          <button
                            type="button"
                            onClick={() => setActiveRecommendationConsultation(con)}
                            className="px-3.5 py-1.5 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                            <span>View recommendations</span>
                          </button>
                        )
                      )}

                      {isFarmerOwner && con.status === 'completed' && (
                        con.hasReview ? (
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewTargetId(con._id);
                              setReviewRating(5);
                              setReviewComment('');
                            }}
                            className="px-3.5 py-1.5 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Star className="w-3 h-3 fill-amber-300" />
                            <span>Rate &amp; review</span>
                          </button>
                        )
                      )}
                    </div>

                    {!['cancelled', 'rejected', 'completed'].includes(con.status) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Assigned Expert Controls */}
                        {isAssignedExpert && con.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'accepted')}
                              className="px-3 py-1 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              ✓ Accept
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'rejected')}
                              className="px-3 py-1 rounded-full border border-red-400/30 text-red-300 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}

                        {isAssignedExpert &&
                          ['accepted', 'confirmed', 'reschedule_requested'].includes(
                            con.status
                          ) && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'in_progress')}
                              className="px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                            >
                              ▶ Start session
                            </button>
                          )}

                        {isAssignedExpert &&
                          ['accepted', 'confirmed', 'in_progress'].includes(con.status) && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'completed')}
                              className="px-3 py-1 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 text-xs font-bold cursor-pointer"
                            >
                              ✓ Complete
                            </button>
                          )}

                        {/* Shared Controls: Reschedule & Cancel */}
                        {(isFarmerOwner || isAssignedExpert) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleTargetId(con._id);
                                setRescheduleDate(con.preferredDate);
                                setRescheduleSlot(con.timeSlot);
                              }}
                              className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-100/80 hover:text-white hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                            >
                              Reschedule
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(con._id, 'cancelled', {
                                  note: 'Cancelled by user prior to completion',
                                })
                              }
                              className="px-3 py-1 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stage 8: Consultation Message Thread Modal */}
      {activeChatConsultation && (
        <ConsultationChatModal
          consultation={activeChatConsultation}
          currentUser={currentUser}
          onClose={() => setActiveChatConsultation(null)}
          onStatusUpdated={() => {
            fetchPortalData();
          }}
        />
      )}

      {/* Stage 9: Expert Recommendation & Consultation Notes Modal */}
      {activeRecommendationConsultation && (
        <ConsultationRecommendationModal
          consultation={activeRecommendationConsultation}
          currentUser={currentUser}
          onClose={() => setActiveRecommendationConsultation(null)}
          onSaved={(_updatedCon, msg) => {
            if (msg) setSuccessMsg(msg);
            fetchPortalData();
          }}
        />
      )}
    </div>
  );
};

export default ConsultationBookingPortal;
