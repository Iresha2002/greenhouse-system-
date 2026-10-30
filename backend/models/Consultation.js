const mongoose = require('mongoose');

const BOOKING_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'reschedule_requested',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled'
];

const consultationSchema = new mongoose.Schema({
  consultationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmerName: {
    type: String,
    required: true,
    trim: true
  },
  expertProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpertProfile',
    required: true,
    index: true
  },
  expertUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expertName: {
    type: String,
    required: true,
    trim: true
  },
  expertTitle: {
    type: String,
    default: ''
  },
  problemReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProblemReport',
    required: false
  },
  problemSummary: {
    type: String,
    required: [true, 'Problem description for consultation is required'],
    trim: true
  },
  problemCategory: {
    type: String,
    default: 'General Greenhouse Advisory'
  },
  affectedCrop: {
    type: String,
    default: ''
  },
  consultationType: {
    type: String,
    enum: ['video', 'text', 'phone', 'in_person'],
    default: 'video'
  },
  preferredDate: {
    type: String, // YYYY-MM-DD in Sri Lanka Standard Time (Asia/Colombo, UTC+5:30)
    required: [true, 'Appointment date is required'],
    index: true
  },
  timeSlot: {
    type: String, // e.g., '09:00 AM'
    required: [true, 'Appointment time slot is required'],
    index: true
  },
  timezone: {
    type: String,
    default: 'Asia/Colombo (UTC+5:30)'
  },
  additionalPhotos: {
    type: [String],
    default: []
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: 'pending',
    index: true
  },
  meetingLink: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  rescheduleProposal: {
    proposedDate: { type: String, default: '' },
    proposedTimeSlot: { type: String, default: '' },
    note: { type: String, default: '' }
  },
  // Stage 9: Expert Recommendations & Consultation Notes (Embedded + Preserved in History)
  expertNotes: {
    type: String,
    default: ''
  },
  recommendation: {
    diagnosisType: {
      type: String,
      enum: ['preliminary_opinion', 'confirmed_diagnosis'],
      default: 'preliminary_opinion'
    },
    problemSummary: { type: String, default: '' },
    observations: { type: String, default: '' },
    possibleCauses: { type: String, default: '' },
    recommendedActions: { type: String, default: '' },
    safetyPrecautions: { type: String, default: '' },
    followUpRecommendations: { type: String, default: '' },
    authoredAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null }
  },
  // Stage 10: Genuine Review Flag
  hasReview: {
    type: Boolean,
    default: false
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      changedByRole: { type: String, default: 'farmer' },
      note: { type: String, default: '' },
      changedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

consultationSchema.statics.BOOKING_STATUSES = BOOKING_STATUSES;

module.exports = mongoose.model('Consultation', consultationSchema);
