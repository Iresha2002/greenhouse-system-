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
} from 'lucide-react';
import {
  getExpertAvailableSlots,
  createConsultationBooking,
  getMyConsultations,
  updateConsultationStatus,
  getMyProblemReports,
  getMyExpertApplication,
  updateMyExpertProfile,
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
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
        <Lock className="w-12 h-12 text-cyan-400 mx-auto" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Sign In to Book & Manage Agricultural Consultations
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
          Sign in with your SmartGrow OS account to select appointment slots, prevent double bookings, and manage your private consultations.
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          Sign In to Book Consultation
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
    pending: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    accepted: 'bg-sky-500/20 border-sky-400/40 text-sky-300',
    confirmed: 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300',
    in_progress: 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300',
    reschedule_requested: 'bg-purple-500/20 border-purple-400/40 text-purple-300',
    completed: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    cancelled: 'bg-red-500/20 border-red-400/40 text-red-300',
    rejected: 'bg-red-500/20 border-red-400/40 text-red-300',
  };

  return (
    <div className="space-y-8">
      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Booking Confirmation Receipt Banner */}
      {confirmedBookingReceipt && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0c3a32] to-[#0b2c38] border border-emerald-400/50 p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase">
              Booking Confirmed in MongoDB
            </span>
            <h4 className="text-lg font-extrabold text-white">
              Consultation Reference: {confirmedBookingReceipt.consultationNumber}
            </h4>
            <p className="text-xs text-white/75">
              Expert: <strong>{confirmedBookingReceipt.expertName}</strong> • Date:{' '}
              <strong>{confirmedBookingReceipt.preferredDate}</strong> at{' '}
              <strong>{confirmedBookingReceipt.timeSlot}</strong> (
              {confirmedBookingReceipt.timezone})
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmedBookingReceipt(null)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Dismiss Receipt
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 10.3: EXPERT AVAILABILITY MANAGEMENT (If User Has Profile)    */}
      {/* ===================================================================== */}
      {myExpertProfile && (
        <div className="rounded-3xl bg-white/[0.07] border border-cyan-400/35 p-6 backdrop-blur-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-300 block">
                Expert Schedule Configuration
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Manage Your Consultation Availability ({myExpertProfile.fullName})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowAvailabilityEditor((prev) => !prev)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/35 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>
                {showAvailabilityEditor ? 'Close Schedule Editor' : 'Configure Availability Slots'}
              </span>
            </button>
          </div>

          {showAvailabilityEditor && (
            <form
              onSubmit={handleSaveAvailability}
              className="pt-4 border-t border-white/10 space-y-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAcceptingBookings}
                    onChange={(e) => setIsAcceptingBookings(e.target.checked)}
                    className="w-4 h-4 accent-emerald-400"
                  />
                  <span>Accepting New Consultation Bookings</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-white/75 font-semibold">
                    Max Consultations / Day:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={maxPerDay}
                    onChange={(e) => setMaxPerDay(e.target.value)}
                    className="w-16 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <span className="font-semibold text-white/80 block mb-1.5">
                  Available Days of the Week:
                </span>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const active = availDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          setAvailDays((prev) =>
                            active
                              ? prev.filter((d) => d !== day)
                              : [...prev, day]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                          active
                            ? 'bg-emerald-400 text-slate-950 border-emerald-300'
                            : 'bg-white/5 text-white/60 border-white/15'
                        }`}
                      >
                        {active ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="font-semibold text-white/80 block mb-1.5">
                  Available Time Slots (Sri Lanka Standard Time — UTC+5:30):
                </span>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_TIME_SLOTS.map((slot) => {
                    const active = availSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setAvailSlots((prev) =>
                            active
                              ? prev.filter((s) => s !== slot)
                              : [...prev, slot]
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl font-bold border cursor-pointer ${
                          active
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                            : 'bg-white/5 text-white/60 border-white/15'
                        }`}
                      >
                        {active ? `✓ ${slot}` : slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingAvailability}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {savingAvailability ? 'Saving...' : 'Save Availability Schedule'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 10.1: REQUEST A CONSULTATION BOOKING FORM                     */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>1-on-1 Agricultural Consultation Booking</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Book a Consultation Appointment
          </h3>
          <p className="text-xs text-white/65 mt-1">
            Select a verified expert, link your greenhouse problem report, and pick a real-time available time slot (Asia/Colombo, UTC+5:30). Overlapping bookings are automatically prevented on the backend.
          </p>
        </div>

        <form onSubmit={handleSubmitBooking} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Select Verified Expert */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                1. Select Verified Agricultural Expert *
              </label>
              <select
                value={selectedExpertId}
                onChange={(e) => setSelectedExpertId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {experts.map((exp) => (
                  <option key={exp._id} value={exp._id} className="bg-slate-900 text-white">
                    {exp.fullName} — {exp.professionalTitle} (${Number(exp.consultationFee || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Link Existing Problem Report (Optional) */}
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                2. Link Submitted Problem Report (Optional)
              </label>
              <select
                value={selectedProblemId}
                onChange={(e) => handleSelectProblemReport(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">
                  -- Write custom problem summary below --
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
              <label className="block text-xs font-semibold text-white/80 mb-1">
                3. Consultation Method *
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="video" className="bg-slate-900 text-white">
                  📹 Online Video Call
                </option>
                <option value="text" className="bg-slate-900 text-white">
                  💬 Text & Photo Advisory
                </option>
                <option value="phone" className="bg-slate-900 text-white">
                  📞 Scheduled Phone Call
                </option>
                <option value="in_person" className="bg-slate-900 text-white">
                  🌱 On-Site Field Visit
                </option>
              </select>
            </div>
          </div>

          {/* Date & Live Time Slot Picker */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  4. Preferred Date (SLST — UTC+5:30) *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  5. Select Available Time Slot ({slotsMeta.weekday || preferredDate}) *
                </label>
                {loadingSlots ? (
                  <p className="text-xs text-cyan-300">Checking real-time slot availability...</p>
                ) : slotList.length === 0 ? (
                  <p className="text-xs text-amber-300">
                    No slots found for this date. Try picking a weekday.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slotList.map((item) => {
                      const isChosen = selectedSlot === item.slot && item.available;
                      return (
                        <button
                          key={item.slot}
                          type="button"
                          disabled={!item.available}
                          onClick={() => setSelectedSlot(item.slot)}
                          title={item.reason}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            !item.available
                              ? 'bg-red-500/10 border-red-400/25 text-white/35 line-through cursor-not-allowed'
                              : isChosen
                              ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-md cursor-pointer'
                              : 'bg-white/10 hover:bg-white/20 text-white border-white/15 cursor-pointer'
                          }`}
                        >
                          {item.slot} {!item.available ? '(Booked/Off)' : ''}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Problem Description & Crop */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Affected Crop / System
              </label>
              <input
                type="text"
                value={affectedCrop}
                onChange={(e) => setAffectedCrop(e.target.value)}
                placeholder="e.g., Hydroponic Bell Pepper / Tomato"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Problem Summary & Questions for the Expert *
              </label>
              <input
                type="text"
                required
                value={problemSummary}
                onChange={(e) => setProblemSummary(e.target.value)}
                placeholder="Describe what you want the expert to review during this session..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
            <div className="text-xs text-white/75">
              Consultation Fee:{' '}
              <strong className="text-base text-emerald-300">
                ${Number(chosenExpertObj?.consultationFee || 0).toFixed(2)}
              </strong>{' '}
              <span className="text-white/50">
                (Confirmed upon expert acceptance)
              </span>
            </div>

            <button
              type="submit"
              disabled={submittingBooking || !selectedSlot}
              className="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {submittingBooking
                  ? 'Confirming Slot...'
                  : 'Confirm & Request Consultation'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 10.2 & 13: MY CONSULTATIONS (Farmer & Assigned Expert Views)  */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-6 sm:p-8 backdrop-blur-xl space-y-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              My Consultations & Scheduled Appointments ({filteredConsultations.length})
            </h3>
            <p className="text-xs text-white/60">
              Showing private consultations where you are either the requesting farmer or the assigned agricultural expert.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-cyan-400 text-slate-950 font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white/75'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchPortalData}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Refresh consultations"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingConsultations ? 'animate-spin text-cyan-400' : ''}`}
              />
            </button>
          </div>
        </div>

        {filteredConsultations.length === 0 ? (
          <div className="p-10 rounded-2xl bg-black/25 border border-white/10 text-center space-y-2">
            <CalendarCheck className="w-10 h-10 text-cyan-400/60 mx-auto" />
            <h4 className="text-sm font-bold text-white">
              No Consultations Found
            </h4>
            <p className="text-xs text-white/60">
              Use the booking form above to schedule a 1-on-1 consultation with a verified agricultural expert.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10 rounded-2xl bg-black/25 border border-white/10 overflow-hidden">
            {filteredConsultations.map((con) => {
              const isAssignedExpert =
                String(con.expertUser) === String(currentUser.id || currentUser._id) ||
                currentUser.role === 'admin';
              const isFarmerOwner =
                String(con.farmer) === String(currentUser.id || currentUser._id);
              const isUpdating = updatingId === con._id;

              return (
                <div key={con._id} className="p-5 sm:p-6 space-y-4 hover:bg-white/[0.03]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-xl bg-black/40 border border-white/15 font-mono text-xs font-extrabold text-cyan-300">
                        {con.consultationNumber}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                          statusStyles[con.status] || statusStyles.pending
                        }`}
                      >
                        {con.status.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-xs font-semibold text-white/85">
                        📅 {con.preferredDate} • ⏰ {con.timeSlot}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-xs font-semibold text-emerald-300 uppercase">
                        {con.consultationType}
                      </span>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-white/50 block">Consultation Fee</span>
                      <span className="text-sm font-extrabold text-emerald-300">
                        ${Number(con.consultationFee || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                    <div className="lg:col-span-5 rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-1">
                      <p className="text-white/50 uppercase text-[10px] font-bold">
                        Participants
                      </p>
                      <p className="text-white font-bold">
                        Expert: <span className="text-cyan-300">{con.expertName}</span>
                      </p>
                      <p className="text-white/80">
                        Farmer: <span className="font-semibold">{con.farmerName}</span>
                      </p>
                      {con.affectedCrop && (
                        <p className="text-emerald-300 font-semibold flex items-center gap-1 pt-1">
                          <Sprout className="w-3.5 h-3.5" />
                          Crop: {con.affectedCrop} ({con.problemCategory})
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-7 rounded-xl bg-black/30 border border-white/10 p-3.5 space-y-2">
                      <p className="text-white/50 uppercase text-[10px] font-bold">
                        Agricultural Problem Summary
                      </p>
                      <p className="text-white/85 leading-relaxed">
                        {con.problemSummary}
                      </p>

                      {con.meetingLink &&
                        ['accepted', 'confirmed', 'in_progress'].includes(con.status) && (
                          <div className="pt-1">
                            <a
                              href={con.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold hover:bg-cyan-500/30"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Approved Video Consultation Room</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Reschedule Editor if Open */}
                  {rescheduleTargetId === con._id && (
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/40 flex flex-wrap items-end gap-3 text-xs">
                      <div>
                        <label className="block text-white/75 mb-1 font-bold">
                          New Date
                        </label>
                        <input
                          type="date"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/75 mb-1 font-bold">
                          New Time Slot
                        </label>
                        <select
                          value={rescheduleSlot}
                          onChange={(e) => setRescheduleSlot(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/20 text-white"
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
                        className="px-4 py-1.5 rounded-lg bg-purple-400 text-slate-950 font-extrabold cursor-pointer"
                      >
                        Save New Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setRescheduleTargetId(null)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Stage 9: Inline Expert Recommendation & Treatment Summary (Section 12) */}
                  {con.recommendation?.observations && (
                    <div className="rounded-2xl bg-emerald-950/35 border border-emerald-400/35 p-4 space-y-2.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                          <ClipboardCheck className="w-4 h-4" />
                          Official Expert Recommendation ({con.expertName})
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-extrabold uppercase text-emerald-200">
                          {con.recommendation.diagnosisType === 'confirmed_diagnosis'
                            ? 'Confirmed Diagnosis'
                            : 'Preliminary Opinion'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                          <span className="text-[10px] font-bold uppercase text-emerald-300 block mb-0.5">
                            Observation
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.observations}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                          <span className="text-[10px] font-bold uppercase text-cyan-300 block mb-0.5">
                            Possible Cause
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.possibleCauses}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                          <span className="text-[10px] font-bold uppercase text-amber-300 block mb-0.5">
                            Recommended Action
                          </span>
                          <p className="text-white/85 line-clamp-3">
                            {con.recommendation.recommendedActions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Controls for Assigned Expert & Requesting Farmer */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveChatConsultation(con)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Open Consultation Chat</span>
                      </button>

                      {isAssignedExpert ? (
                        <button
                          type="button"
                          onClick={() => setActiveRecommendationConsultation(con)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                          <span>
                            {con.recommendation?.observations
                              ? 'Update Recommendation & Notes'
                              : 'Write Recommendation & Notes'}
                          </span>
                        </button>
                      ) : (
                        con.recommendation?.observations && (
                          <button
                            type="button"
                            onClick={() => setActiveRecommendationConsultation(con)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/40 text-emerald-200 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                            <span>View Full Treatment Recommendation</span>
                          </button>
                        )
                      )}
                    </div>

                    {!['cancelled', 'rejected', 'completed'].includes(con.status) && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Assigned Expert Controls */}
                        {isAssignedExpert && con.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'accepted')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold cursor-pointer"
                            >
                              ✓ Accept & Confirm Booking
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-300 text-xs font-bold cursor-pointer"
                            >
                              ✕ Reject Request
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
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/40 border border-indigo-400/40 text-indigo-200 text-xs font-bold cursor-pointer"
                            >
                              ▶ Mark In Progress
                            </button>
                          )}

                        {isAssignedExpert &&
                          ['accepted', 'confirmed', 'in_progress'].includes(con.status) && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(con._id, 'completed')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold cursor-pointer"
                            >
                              ✓ Complete Consultation
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
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/85 text-xs font-bold cursor-pointer"
                            >
                              Reschedule Slot
                            </button>

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleStatusChange(con._id, 'cancelled', {
                                  note: 'Cancelled by user prior to completion',
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 text-red-300 text-xs font-bold cursor-pointer"
                            >
                              Cancel Booking
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
