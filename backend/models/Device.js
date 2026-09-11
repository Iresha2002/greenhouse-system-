const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Device must have a name
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['PUMP', 'FAN', 'LIGHT', 'HEATER', 'VENT'] // Only allows these values
    },
    status: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'OFF'
    },
    mode: {
        type: String,
        enum: ['AUTOMATIC', 'MANUAL'],
        default: 'AUTOMATIC'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Device', deviceSchema);