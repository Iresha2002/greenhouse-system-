const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true  
    },
    humidity: {
        type: Number,
        required: true  
    },
    soilMoisture: {
        type: Number,
        required: true 
    },
    lightLevel: {
        type: Number,
        required: true  
    },
    timestamp: {
        type: Date,
        default: Date.now  // Automatically sets current time
    }
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);