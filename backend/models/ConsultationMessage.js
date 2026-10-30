const mongoose = require('mongoose');

const consultationMessageSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  senderRole: {
    type: String,
    enum: ['farmer', 'expert', 'admin', 'supplier', 'customer'],
    default: 'farmer'
  },
  messageType: {
    type: String,
    enum: ['text', 'photo', 'diagnostic_note', 'system'],
    default: 'text'
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxLength: [3000, 'Message cannot exceed 3000 characters']
  },
  attachments: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ConsultationMessage', consultationMessageSchema);
