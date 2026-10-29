const mongoose = require('mongoose');

const PROBLEM_CATEGORIES = [
  'Yellowing Leaves',
  'Poor Crop Growth',
  'Nutrient Deficiency',
  'Pest Problems',
  'Plant Diseases',
  'Irrigation Problems',
  'Temperature and Humidity',
  'Hydroponic System Problems',
  'Sensor and Automation Problems',
  'Harvest Problems',
  'Other Agricultural Problems'
];

const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];

const problemReportSchema = new mongoose.Schema({
  reportNumber: {
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
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Problem category is required'],
    enum: PROBLEM_CATEGORIES
  },
  description: {
    type: String,
    required: [true, 'Detailed problem description is required'],
    trim: true
  },
  affectedCrop: {
    type: String,
    required: [true, 'Affected crop name is required'],
    trim: true
  },
  greenhouseType: {
    type: String,
    default: 'Poly-Tunnel Greenhouse',
    trim: true
  },
  growthStage: {
    type: String,
    default: 'Vegetative Stage',
    trim: true
  },
  dateFirstNoticed: {
    type: Date,
    default: Date.now
  },
  symptoms: {
    type: [String],
    default: []
  },
  environmentalConditions: {
    temperature: { type: String, default: '' },
    humidity: { type: String, default: '' },
    lightAndVentilation: { type: String, default: '' }
  },
  irrigationInfo: {
    type: String,
    default: '',
    trim: true
  },
  nutrientInfo: {
    type: String,
    default: '',
    trim: true
  },
  photographs: {
    type: [String],
    default: [],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length <= 5;
      },
      message: 'A maximum of 5 photographs can be attached per problem report'
    }
  },
  urgencyLevel: {
    type: String,
    enum: URGENCY_LEVELS,
    default: 'medium'
  },
  preferredConsultationType: {
    type: String,
    enum: ['video', 'text', 'phone', 'in_person'],
    default: 'video'
  },
  status: {
    type: String,
    enum: ['open', 'consultation_requested', 'resolved', 'closed'],
    default: 'open'
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

problemReportSchema.statics.PROBLEM_CATEGORIES = PROBLEM_CATEGORIES;
problemReportSchema.statics.URGENCY_LEVELS = URGENCY_LEVELS;

module.exports = mongoose.model('ProblemReport', problemReportSchema);
