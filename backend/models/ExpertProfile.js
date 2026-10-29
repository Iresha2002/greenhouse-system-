const mongoose = require('mongoose');

const SPECIALIZATIONS = [
  'Greenhouse Management',
  'Hydroponics',
  'Nutrient Management',
  'Soil and Growing Media',
  'Irrigation Systems',
  'Plant Diseases',
  'Pest Management',
  'Crop Nutrition',
  'Climate and Temperature Control',
  'Greenhouse Automation',
  'Sensor and IoT Systems',
  'Crop Selection',
  'Harvest Management',
  'Sustainable Agriculture'
];

const CONSULTATION_TYPES = ['video', 'text', 'phone', 'in_person'];

const expertProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Expert full name is required'],
    trim: true
  },
  professionalTitle: {
    type: String,
    required: [true, 'Professional title is required'],
    trim: true
  },
  qualifications: {
    type: String,
    required: [true, 'Educational qualifications are required'],
    trim: true
  },
  fieldOfStudy: {
    type: String,
    default: 'Agricultural Sciences',
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  experienceSummary: {
    type: String,
    default: '',
    trim: true
  },
  biography: {
    type: String,
    required: [true, 'Professional biography is required'],
    trim: true
  },
  specializations: {
    type: [String],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: 'Select at least one agricultural specialization'
    }
  },
  languages: {
    type: [String],
    default: ['English', 'Sinhala']
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'Peradeniya Agricultural Hub'
  },
  consultationTypes: {
    type: [String],
    enum: CONSULTATION_TYPES,
    default: ['video', 'text']
  },
  consultationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  availabilitySchedule: {
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    timeSlots: {
      type: [String],
      default: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM']
    },
    appointmentDurationMinutes: {
      type: Number,
      default: 45
    },
    maxConsultationsPerDay: {
      type: Number,
      default: 5
    },
    unavailableDates: {
      type: [String],
      default: []
    }
  },
  // Stage 4 Verification Status — Only 'approved' + isVerified: true experts appear in the verified directory
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verificationNotes: {
    type: String,
    default: ''
  },
  supportingDocuments: {
    type: [String],
    default: []
  },
  // Genuine consultation statistics (Never fabricated; computed from completed consultations & reviews)
  completedConsultationsCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: null
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

expertProfileSchema.statics.SPECIALIZATIONS = SPECIALIZATIONS;
expertProfileSchema.statics.CONSULTATION_TYPES = CONSULTATION_TYPES;

module.exports = mongoose.model('ExpertProfile', expertProfileSchema);
