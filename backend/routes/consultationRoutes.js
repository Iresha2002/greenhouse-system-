const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const ExpertProfile = require('../models/ExpertProfile');
const ProblemReport = require('../models/ProblemReport');
const { protect } = require('../middleware/authMiddleware');

// Helper: Resolve weekday name from YYYY-MM-DD
const getWeekdayName = (dateStr) => {
  const parts = String(dateStr || '').split('-');
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(d.getTime())) return null;
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return days[d.getDay()];
};

// 1. GET /api/consultations/slots/:expertId — Calculate available & booked slots for an expert on a date
router.get('/slots/:expertId', async (req, res) => {
  try {
    const { expertId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!mongoose.Types.ObjectId.isValid(expertId)) {
      return res.status(404).json({
        success: false,
        error: 'Expert profile not found'
      });
    }

    const expert = await ExpertProfile.findById(expertId);
    if (!expert || expert.verificationStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        error: 'Verified expert profile not found'
      });
    }

    const schedule = expert.availabilitySchedule || {};
    const configuredSlots =
      Array.isArray(schedule.timeSlots) && schedule.timeSlots.length > 0
        ? schedule.timeSlots
        : ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

    const availableDays =
      Array.isArray(schedule.availableDays) && schedule.availableDays.length > 0
        ? schedule.availableDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const unavailableDates = Array.isArray(schedule.unavailableDates)
      ? schedule.unavailableDates
      : [];

    if (!date) {
      return res.status(200).json({
        success: true,
        timezone: 'Asia/Colombo (UTC+5:30)',
        availableDays,
        configuredSlots,
        unavailableDates,
        slots: configuredSlots.map((slot) => ({ slot, available: expert.isAvailable }))
      });
    }

    const weekday = getWeekdayName(date);
    const isDateBlocked =
      !expert.isAvailable ||
      unavailableDates.includes(date) ||
      (weekday && !availableDays.includes(weekday));

    // Find active bookings for this expert on this date
    const activeStatuses = ['pending', 'accepted', 'confirmed', 'in_progress'];
    const existingBookings = await Consultation.find({
      expertProfile: expert._id,
      preferredDate: date,
      status: { $in: activeStatuses }
    });

    const bookedSlotSet = new Set(existingBookings.map((b) => b.timeSlot));
    const maxPerDay = schedule.maxConsultationsPerDay || 5;
    const dailyLimitReached = existingBookings.length >= maxPerDay;

    const slots = configuredSlots.map((slot) => ({
      slot,
      available: !isDateBlocked && !dailyLimitReached && !bookedSlotSet.has(slot),
      reason: isDateBlocked
        ? `Expert is unavailable on ${weekday || date}`
        : dailyLimitReached
        ? 'Daily consultation limit reached'
        : bookedSlotSet.has(slot)
        ? 'Already booked'
        : 'Available'
    }));

    return res.status(200).json({
      success: true,
      date,
      weekday,
      timezone: 'Asia/Colombo (UTC+5:30)',
      isDateBlocked,
      dailyLimitReached,
      slots
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate available consultation slots'
    });
  }
});

// 2. POST /api/consultations — Farmer books a consultation with backend slot conflict prevention (Workflow 2 & 5)
router.post('/', protect, async (req, res) => {
  try {
    const {
      expertProfileId,
      problemReportId,
      consultationType,
      preferredDate,
      timeSlot,
      problemSummary,
      problemCategory,
      affectedCrop,
      additionalPhotos
    } = req.body;

    if (!expertProfileId || !preferredDate || !timeSlot || !problemSummary) {
      return res.status(400).json({
        success: false,
        error:
          'Please select an expert, preferred date, available time slot, and problem description'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(expertProfileId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expert profile identifier'
      });
    }

    const expert = await ExpertProfile.findById(expertProfileId);
    if (!expert || expert.verificationStatus !== 'approved' || !expert.isVerified) {
      return res.status(404).json({
        success: false,
        error: 'Selected expert is not an approved verified specialist'
      });
    }

    if (!expert.isAvailable) {
      return res.status(400).json({
        success: false,
        error: `${expert.fullName} is currently not accepting new consultation bookings`
      });
    }

    // Validate date and weekday against expert's configured schedule
    const schedule = expert.availabilitySchedule || {};
    const availableDays = schedule.availableDays || [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday'
    ];
    const unavailableDates = schedule.unavailableDates || [];
    const weekday = getWeekdayName(preferredDate);

    if (unavailableDates.includes(preferredDate)) {
      return res.status(400).json({
        success: false,
        error: `${expert.fullName} is unavailable on ${preferredDate}`
      });
    }

    if (weekday && !availableDays.includes(weekday)) {
      return res.status(400).json({
        success: false,
        error: `${expert.fullName} does not hold consultations on ${weekday}s. Available days: ${availableDays.join(', ')}`
      });
    }

    // WORKFLOW 5: Prevent two farmers from booking the same time slot with the same expert
    const activeStatuses = ['pending', 'accepted', 'confirmed', 'in_progress'];
    const conflictingBooking = await Consultation.findOne({
      expertProfile: expert._id,
      preferredDate: String(preferredDate).trim(),
      timeSlot: String(timeSlot).trim(),
      status: { $in: activeStatuses }
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        error: `Time slot ${timeSlot} on ${preferredDate} with ${expert.fullName} is already booked. Please choose another available slot.`
      });
    }

    // Check daily consultation limit
    const dayCount = await Consultation.countDocuments({
      expertProfile: expert._id,
      preferredDate: String(preferredDate).trim(),
      status: { $in: activeStatuses }
    });
    const maxPerDay = schedule.maxConsultationsPerDay || 5;
    if (dayCount >= maxPerDay) {
      return res.status(409).json({
        success: false,
        error: `${expert.fullName} has reached the maximum of ${maxPerDay} consultations on ${preferredDate}`
      });
    }

    let linkedProblem = null;
    if (problemReportId && mongoose.Types.ObjectId.isValid(problemReportId)) {
      linkedProblem = await ProblemReport.findById(problemReportId);
      if (linkedProblem) {
        linkedProblem.status = 'consultation_requested';
        linkedProblem.updatedAt = new Date();
        await linkedProblem.save();
      }
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const consultationNumber = `CON-${datePart}-${randPart}`;

    const safePhotos = Array.isArray(additionalPhotos)
      ? additionalPhotos.slice(0, 5).map((p) => String(p).trim()).filter(Boolean)
      : [];

    const created = await Consultation.create({
      consultationNumber,
      farmer: req.user._id,
      farmerName: req.user.username || 'Greenhouse Farmer',
      expertProfile: expert._id,
      expertUser: expert.user,
      expertName: expert.fullName,
      expertTitle: expert.professionalTitle,
      problemReport: linkedProblem ? linkedProblem._id : undefined,
      problemSummary: String(problemSummary).trim(),
      problemCategory:
        problemCategory || linkedProblem?.category || 'Greenhouse Advisory',
      affectedCrop: affectedCrop || linkedProblem?.affectedCrop || '',
      consultationType: ['video', 'text', 'phone', 'in_person'].includes(
        consultationType
      )
        ? consultationType
        : 'video',
      preferredDate: String(preferredDate).trim(),
      timeSlot: String(timeSlot).trim(),
      timezone: 'Asia/Colombo (UTC+5:30)',
      additionalPhotos: safePhotos,
      consultationFee: expert.consultationFee || 0,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedByRole: req.user.role || 'farmer',
          note: `Consultation requested for ${preferredDate} at ${timeSlot} (SLST)`,
          changedAt: new Date()
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: `Consultation ${consultationNumber} requested with ${expert.fullName}!`,
      consultation: created
    });
  } catch (error) {
    console.error('Create consultation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create consultation booking'
    });
  }
});

// 3. GET /api/consultations/my-consultations — Retrieve consultations for logged-in farmer or assigned expert
router.get('/my-consultations', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { roleView } = req.query; // optional: 'farmer' | 'expert'

    let filter = {
      $or: [{ farmer: userId }, { expertUser: userId }]
    };

    if (roleView === 'farmer') {
      filter = { farmer: userId };
    } else if (roleView === 'expert') {
      filter = { expertUser: userId };
    }

    const consultations = await Consultation.find(filter)
      .populate('problemReport', 'reportNumber title category affectedCrop urgencyLevel photographs')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultations'
    });
  }
});

// 4. GET /api/consultations/:id — Get single consultation (Strict ownership check: Farmer, Assigned Expert, or Admin)
// WORKFLOW 6 & 7 Verified: Rejects access by unrelated farmers or unrelated experts
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    const consultation = await Consultation.findById(id).populate(
      'problemReport',
      'reportNumber title category affectedCrop description symptoms environmentalConditions irrigationInfo nutrientInfo photographs urgencyLevel'
    );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isFarmerOwner = consultation.farmer.toString() === userIdStr;
    const isAssignedExpert = consultation.expertUser.toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';

    if (!isFarmerOwner && !isAssignedExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        error:
          'Forbidden: You are not authorized to access this private consultation'
      });
    }

    return res.status(200).json({
      success: true,
      consultation
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation details'
    });
  }
});

// 5. PATCH /api/consultations/:id/status — Update booking status (Accept, Reject, Confirm, Reschedule, In Progress, Complete, Cancel)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status: nextStatus,
      note,
      meetingLink,
      proposedDate,
      proposedTimeSlot
    } = req.body;

    if (!Consultation.BOOKING_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid consultation booking status: "${nextStatus}"`
      });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
      });
    }

    const userIdStr = req.user._id.toString();
    const isFarmerOwner = consultation.farmer.toString() === userIdStr;
    const isAssignedExpert = consultation.expertUser.toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';

    if (!isFarmerOwner && !isAssignedExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        error:
          'Forbidden: Only the farmer or assigned expert can update this consultation'
      });
    }

    // Role permission rules:
    // Only assigned expert (or admin) can accept, reject, mark in_progress, or mark completed
    const expertOnlyStatuses = ['accepted', 'rejected', 'in_progress', 'completed'];
    if (expertOnlyStatuses.includes(nextStatus) && !isAssignedExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Only the assigned agricultural expert can mark a consultation as "${nextStatus}"`
      });
    }

    // Cannot modify already cancelled or rejected consultations unless rescheduling
    if (
      ['cancelled', 'rejected'].includes(consultation.status) &&
      nextStatus !== 'pending'
    ) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition consultation from "${consultation.status}" to "${nextStatus}"`
      });
    }

    // If rescheduling or confirming a new slot, verify no conflict exists
    if (proposedDate && proposedTimeSlot) {
      const conflict = await Consultation.findOne({
        _id: { $ne: consultation._id },
        expertProfile: consultation.expertProfile,
        preferredDate: proposedDate,
        timeSlot: proposedTimeSlot,
        status: { $in: ['pending', 'accepted', 'confirmed', 'in_progress'] }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          error: `Slot ${proposedTimeSlot} on ${proposedDate} is already booked`
        });
      }

      consultation.preferredDate = proposedDate;
      consultation.timeSlot = proposedTimeSlot;
      consultation.rescheduleProposal = {
        proposedDate,
        proposedTimeSlot,
        note: note || 'Rescheduled appointment slot'
      };
    }

    // When expert accepts, automatically confirm booking and generate/attach meeting link if video
    if (nextStatus === 'accepted' || nextStatus === 'confirmed') {
      consultation.status = nextStatus === 'accepted' ? 'confirmed' : nextStatus;
      if (meetingLink) {
        consultation.meetingLink = String(meetingLink).trim();
      } else if (
        consultation.consultationType === 'video' &&
        !consultation.meetingLink
      ) {
        consultation.meetingLink = `https://meet.jit.si/SmartGrow-${consultation.consultationNumber}`;
      }
    } else {
      consultation.status = nextStatus;
    }

    if (nextStatus === 'cancelled' && note) {
      consultation.cancellationReason = String(note).trim();
    }

    // If marked completed, increment expert's completedConsultationsCount
    if (nextStatus === 'completed') {
      await ExpertProfile.findByIdAndUpdate(consultation.expertProfile, {
        $inc: { completedConsultationsCount: 1 }
      });
      if (consultation.problemReport) {
        await ProblemReport.findByIdAndUpdate(consultation.problemReport, {
          status: 'resolved',
          updatedAt: new Date()
        });
      }
    }

    consultation.statusHistory.push({
      status: consultation.status,
      changedByRole: isAssignedExpert ? 'expert' : isFarmerOwner ? 'farmer' : 'admin',
      note:
        note ||
        `Consultation status updated to "${consultation.status}" by ${req.user.username}`,
      changedAt: new Date()
    });

    consultation.updatedAt = new Date();
    const saved = await consultation.save();

    return res.status(200).json({
      success: true,
      message: `Consultation status updated to "${saved.status}"`,
      consultation: saved
    });
  } catch (error) {
    console.error('Update consultation status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update consultation booking status'
    });
  }
});

module.exports = router;
