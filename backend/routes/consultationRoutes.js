const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');
const ConsultationMessage = require('../models/ConsultationMessage');
const ExpertProfile = require('../models/ExpertProfile');
const ExpertReview = require('../models/ExpertReview');
const Notification = require('../models/Notification');
const ProblemReport = require('../models/ProblemReport');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../utils/notificationHelper');

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

    // Stage 10 (Section 13): Notify assigned expert of new consultation request
    await createNotification({
      recipient: expert.user,
      type: 'consultation_requested',
      title: `New Consultation Request (${consultationNumber})`,
      message: `${created.farmerName} requested a ${created.consultationType} consultation on ${preferredDate} at ${timeSlot} regarding "${created.affectedCrop || created.problemCategory}".`,
      linkTab: 'consultations',
      referenceId: created._id.toString()
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

// ============================================================================
// STAGE 10: IN-APP NOTIFICATIONS ENDPOINTS (Section 13)
// ============================================================================

// 3a. GET /api/consultations/notifications/my — List logged-in user's notifications & unread count
router.get('/notifications/my', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    });
  }
});

// 3b. PATCH /api/consultations/notifications/read-all — Mark all user's notifications as read
router.patch('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
});

// 3c. PATCH /api/consultations/notifications/:notifId/read — Mark a single notification as read
router.patch('/notifications/:notifId/read', protect, async (req, res) => {
  try {
    const { notifId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notifId)) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    const notif = await Notification.findOneAndUpdate(
      { _id: notifId, recipient: req.user._id },
      { $set: { isRead: true } },
      { returnDocument: 'after' }
    );
    if (!notif) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }
    return res.status(200).json({
      success: true,
      notification: notif
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update notification'
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

    // Stage 10 (Section 13): Send in-app notification to counterpart
    const recipientId = isAssignedExpert ? saved.farmer : saved.expertUser;
    let notifType = 'consultation_accepted';
    let notifTitle = `Consultation ${saved.consultationNumber} Updated`;
    let notifMessage = `Consultation status changed to "${saved.status}".`;

    if (saved.status === 'confirmed' || saved.status === 'accepted') {
      notifType = 'consultation_accepted';
      notifTitle = `Consultation Confirmed (${saved.consultationNumber})`;
      notifMessage = `${saved.expertName} accepted and confirmed your appointment for ${saved.preferredDate} at ${saved.timeSlot}.`;
    } else if (saved.status === 'rejected') {
      notifType = 'consultation_rejected';
      notifTitle = `Consultation Request Declined (${saved.consultationNumber})`;
      notifMessage = `${saved.expertName} was unable to accept the requested slot. Please choose another available time or specialist.`;
    } else if (saved.status === 'reschedule_requested') {
      notifType = 'consultation_rescheduled';
      notifTitle = `Reschedule Proposed (${saved.consultationNumber})`;
      notifMessage = `New appointment slot proposed: ${saved.preferredDate} at ${saved.timeSlot}.`;
    } else if (saved.status === 'completed') {
      notifType = 'consultation_completed';
      notifTitle = `Consultation Completed (${saved.consultationNumber})`;
      notifMessage = `${saved.expertName} marked your consultation as completed. You can now review recommendations and rate your experience.`;
    }

    await createNotification({
      recipient: recipientId,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
      linkTab: 'consultations',
      referenceId: saved._id.toString()
    });

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

// ============================================================================
// STAGE 8: CONSULTATION COMMUNICATION (Section 11 — Farmer–Expert Thread)
// ============================================================================

const ALLOWED_IMAGE_MIME_PREFIXES = [
  'data:image/jpeg;base64,',
  'data:image/jpg;base64,',
  'data:image/png;base64,',
  'data:image/webp;base64,'
];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB per image

const validateMessageAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) {
    return { valid: false, error: 'Attachments must be an array' };
  }
  if (attachments.length > 3) {
    return { valid: false, error: 'Maximum 3 image attachments allowed per message' };
  }

  const sanitized = [];
  for (const item of attachments) {
    if (!item || typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('data:')) {
      const lower = trimmed.toLowerCase();
      const allowed = ALLOWED_IMAGE_MIME_PREFIXES.some((prefix) =>
        lower.startsWith(prefix)
      );
      if (!allowed) {
        return {
          valid: false,
          error: 'Invalid image format. Only JPEG, PNG, and WebP attachments are permitted.'
        };
      }
      const commaIdx = trimmed.indexOf(',');
      const base64Body = commaIdx !== -1 ? trimmed.slice(commaIdx + 1) : '';
      const approxBytes = Math.ceil((base64Body.length * 3) / 4);
      if (approxBytes > MAX_ATTACHMENT_BYTES) {
        return {
          valid: false,
          error: 'Each attached image must be 2 MB or smaller.'
        };
      }
      sanitized.push(trimmed);
    } else if (/^https?:\/\/.+/i.test(trimmed)) {
      sanitized.push(trimmed);
    } else {
      return {
        valid: false,
        error: 'Invalid attachment URL or image format.'
      };
    }
  }

  return { valid: true, sanitized };
};

// 6. GET /api/consultations/:id/messages — Retrieve chronological message thread (Participant or Admin only)
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
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
          'Forbidden: Only the consultation farmer, assigned expert, or platform administrator may access this message thread'
      });
    }

    const messages = await ConsultationMessage.find({
      consultation: consultation._id
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      consultation: {
        _id: consultation._id,
        consultationNumber: consultation.consultationNumber,
        farmerName: consultation.farmerName,
        expertName: consultation.expertName,
        expertTitle: consultation.expertTitle,
        status: consultation.status,
        consultationType: consultation.consultationType,
        preferredDate: consultation.preferredDate,
        timeSlot: consultation.timeSlot,
        meetingLink: consultation.meetingLink,
        problemSummary: consultation.problemSummary,
        affectedCrop: consultation.affectedCrop
      },
      messages
    });
  } catch (error) {
    console.error('Fetch consultation messages error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve consultation messages'
    });
  }
});

// 7. POST /api/consultations/:id/messages — Send message or photo in consultation thread (Participant or Admin only)
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, messageType, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
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
          'Forbidden: Only the consultation farmer, assigned expert, or platform administrator may send messages in this thread'
      });
    }

    const cleanText = String(text || '').trim();
    if (!cleanText) {
      return res.status(400).json({
        success: false,
        error: 'Message text cannot be empty'
      });
    }

    const attachmentCheck = validateMessageAttachments(attachments || []);
    if (!attachmentCheck.valid) {
      return res.status(400).json({
        success: false,
        error: attachmentCheck.error
      });
    }

    // Determine effective participant role label for clear thread identification
    let senderRole = 'farmer';
    let senderName = req.user.username || 'Farmer';
    if (isAssignedExpert) {
      senderRole = 'expert';
      senderName = consultation.expertName || req.user.username || 'Agricultural Expert';
    } else if (isAdmin && !isFarmerOwner) {
      senderRole = 'admin';
      senderName = `${req.user.username || 'Admin'} (Platform Moderator)`;
    } else if (isFarmerOwner) {
      senderRole = 'farmer';
      senderName = consultation.farmerName || req.user.username || 'Greenhouse Farmer';
    }

    const resolvedType =
      attachmentCheck.sanitized.length > 0 && (!messageType || messageType === 'text')
        ? 'photo'
        : ['text', 'photo', 'diagnostic_note', 'system'].includes(messageType)
        ? messageType
        : 'text';

    const createdMessage = await ConsultationMessage.create({
      consultation: consultation._id,
      sender: req.user._id,
      senderName,
      senderRole,
      messageType: resolvedType,
      text: cleanText,
      attachments: attachmentCheck.sanitized
    });

    // Automatically advance 'confirmed' consultation to 'in_progress' when assigned expert responds
    if (isAssignedExpert && consultation.status === 'confirmed') {
      consultation.status = 'in_progress';
      consultation.statusHistory.push({
        status: 'in_progress',
        changedByRole: 'expert',
        note: 'Expert initiated active consultation discussion',
        changedAt: new Date()
      });
    }
    consultation.updatedAt = new Date();
    await consultation.save();

    // Stage 10 (Section 13): Notify counterpart of new consultation message
    const msgRecipient = isAssignedExpert
      ? consultation.farmer
      : consultation.expertUser;
    await createNotification({
      recipient: msgRecipient,
      type: 'consultation_message',
      title: `New Message in ${consultation.consultationNumber}`,
      message: `${senderName}: "${cleanText.slice(0, 90)}${
        cleanText.length > 90 ? '...' : ''
      }"`,
      linkTab: 'consultations',
      referenceId: consultation._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent',
      data: createdMessage,
      consultationStatus: consultation.status
    });
  } catch (error) {
    console.error('Send consultation message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send consultation message'
    });
  }
});

// ============================================================================
// STAGE 9: EXPERT RECOMMENDATIONS & CONSULTATION NOTES (Section 12 & Workflow 4)
// ============================================================================

// 8. PUT /api/consultations/:id/recommendation — Assigned Expert records notes & structured recommendation
router.put('/:id/recommendation', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      expertNotes,
      diagnosisType,
      problemSummary,
      observations,
      possibleCauses,
      recommendedActions,
      preventiveMeasures,
      safetyPrecautions,
      followUpRecommendations,
      markCompleted = true
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
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
    const isAssignedExpert = consultation.expertUser.toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';

    // WORKFLOW 7: Reject any unassigned expert or farmer attempting to author/update recommendations
    if (!isAssignedExpert && !isAdmin) {
      return res.status(403).json({
        success: false,
        error:
          'Forbidden: Only the assigned agricultural expert may submit consultation notes and recommendations'
      });
    }

    if (
      !String(observations || '').trim() ||
      !String(possibleCauses || '').trim() ||
      !String(recommendedActions || '').trim()
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Please provide expert observations, possible causes, and recommended actions'
      });
    }

    const now = new Date();
    if (expertNotes !== undefined) {
      consultation.expertNotes = String(expertNotes || '').trim();
    }

    consultation.recommendation = {
      diagnosisType:
        diagnosisType === 'confirmed_diagnosis'
          ? 'confirmed_diagnosis'
          : 'preliminary_opinion',
      problemSummary:
        String(problemSummary || consultation.problemSummary || '').trim(),
      observations: String(observations).trim(),
      possibleCauses: String(possibleCauses).trim(),
      recommendedActions: String(recommendedActions).trim(),
      preventiveMeasures: String(preventiveMeasures || '').trim(),
      safetyPrecautions: String(safetyPrecautions || '').trim(),
      followUpRecommendations: String(followUpRecommendations || '').trim(),
      authoredAt: consultation.recommendation?.authoredAt || now,
      updatedAt: now
    };

    const wasAlreadyCompleted = consultation.status === 'completed';

    if (markCompleted && !wasAlreadyCompleted) {
      consultation.status = 'completed';
      consultation.statusHistory.push({
        status: 'completed',
        changedByRole: isAssignedExpert ? 'expert' : 'admin',
        note: `Expert recommendation submitted and consultation marked completed by ${consultation.expertName}`,
        changedAt: now
      });

      await ExpertProfile.findByIdAndUpdate(consultation.expertProfile, {
        $inc: { completedConsultationsCount: 1 }
      });

      if (consultation.problemReport) {
        await ProblemReport.findByIdAndUpdate(consultation.problemReport, {
          status: 'resolved',
          updatedAt: now
        });
      }
    }

    consultation.updatedAt = now;
    const saved = await consultation.save();

    // Post a structured diagnostic note into the consultation message thread
    await ConsultationMessage.create({
      consultation: consultation._id,
      sender: req.user._id,
      senderName: consultation.expertName || req.user.username || 'Assigned Expert',
      senderRole: 'expert',
      messageType: 'diagnostic_note',
      text: `📋 Official Expert Recommendation Submitted:\n• Observations: ${saved.recommendation.observations}\n• Possible Cause: ${saved.recommendation.possibleCauses}\n• Recommended Action: ${saved.recommendation.recommendedActions}${
        saved.recommendation.safetyPrecautions
          ? `\n• Safety Precautions: ${saved.recommendation.safetyPrecautions}`
          : ''
      }`
    });

    // Stage 10 (Section 13): Notify farmer that expert recommendation is ready
    await createNotification({
      recipient: saved.farmer,
      type: 'consultation_completed',
      title: `Official Recommendation Ready (${saved.consultationNumber})`,
      message: `${saved.expertName} published your greenhouse treatment recommendation and marked the consultation completed.`,
      linkTab: 'consultations',
      referenceId: saved._id.toString()
    });

    return res.status(200).json({
      success: true,
      message: markCompleted
        ? 'Expert recommendation saved and consultation marked completed!'
        : 'Expert recommendation draft saved!',
      consultation: saved
    });
  } catch (error) {
    console.error('Submit expert recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save expert recommendation'
    });
  }
});

// ============================================================================
// STAGE 10: GENUINE POST-CONSULTATION REVIEWS & RATINGS (Section 14)
// ============================================================================

// 9. POST /api/consultations/:id/review — Farmer submits a 1-5 star review for a completed consultation
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Consultation not found'
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

    // Security & Integrity Rule 1: Only the farmer who booked the consultation can review it
    if (!isFarmerOwner) {
      return res.status(403).json({
        success: false,
        error:
          'Forbidden: Only the farmer who participated in this consultation may submit a review'
      });
    }

    // Security & Integrity Rule 2: Prevent self-reviews
    if (consultation.expertUser.toString() === userIdStr) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Experts cannot submit reviews for themselves'
      });
    }

    // Security & Integrity Rule 3: Consultation MUST be completed first
    if (consultation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error:
          'Reviews can only be submitted after the consultation has been marked as completed'
      });
    }

    // Security & Integrity Rule 4: Prevent duplicate reviews for the same consultation
    const existingReview = await ExpertReview.findOne({
      consultation: consultation._id
    });
    if (consultation.hasReview || existingReview) {
      return res.status(409).json({
        success: false,
        error: 'You have already submitted a review for this consultation'
      });
    }

    const numRating = Number(rating);
    if (!Number.isFinite(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating between 1 and 5 stars'
      });
    }

    const createdReview = await ExpertReview.create({
      consultation: consultation._id,
      expertProfile: consultation.expertProfile,
      expertUser: consultation.expertUser,
      farmer: req.user._id,
      farmerName: consultation.farmerName || req.user.username || 'Verified Farmer',
      rating: Math.round(numRating),
      comment: String(comment || '').trim(),
      affectedCrop: consultation.affectedCrop || '',
      consultationType: consultation.consultationType || 'video'
    });

    consultation.hasReview = true;
    consultation.updatedAt = new Date();
    await consultation.save();

    // Recalculate expert's genuine averageRating & reviewsCount from all verified reviews
    const allExpertReviews = await ExpertReview.find({
      expertProfile: consultation.expertProfile
    });
    const reviewsCount = allExpertReviews.length;
    const sumRatings = allExpertReviews.reduce(
      (sum, r) => sum + (Number(r.rating) || 0),
      0
    );
    const averageRating =
      reviewsCount > 0 ? Number((sumRatings / reviewsCount).toFixed(2)) : 0;

    await ExpertProfile.findByIdAndUpdate(consultation.expertProfile, {
      averageRating,
      reviewsCount,
      updatedAt: new Date()
    });

    // Notify expert of the new farmer review
    await createNotification({
      recipient: consultation.expertUser,
      type: 'expert_review_received',
      title: `New ${createdReview.rating}★ Review on ${consultation.consultationNumber}`,
      message: `${createdReview.farmerName} rated your consultation ${createdReview.rating}/5 stars${
        createdReview.comment ? `: "${createdReview.comment.slice(0, 80)}"` : '.'
      }`,
      linkTab: 'consultations',
      referenceId: consultation._id.toString()
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified consultation review has been published.',
      review: createdReview,
      expertStats: { averageRating, reviewsCount }
    });
  } catch (error) {
    console.error('Submit consultation review error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit consultation review'
    });
  }
});

module.exports = router;
