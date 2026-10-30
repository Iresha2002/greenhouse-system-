const mongoose = require('mongoose');

const expertReviewSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    unique: true,
    index: true
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
    required: true
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
  rating: {
    type: Number,
    required: [true, 'Star rating between 1 and 5 is required'],
    min: [1, 'Minimum rating is 1 star'],
    max: [5, 'Maximum rating is 5 stars']
  },
  comment: {
    type: String,
    default: '',
    trim: true,
    maxLength: [1500, 'Review comment cannot exceed 1500 characters']
  },
  affectedCrop: {
    type: String,
    default: ''
  },
  consultationType: {
    type: String,
    default: 'video'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExpertReview', expertReviewSchema);
