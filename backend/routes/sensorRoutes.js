const express = require('express');
const router = express.Router();
const SensorReading = require('../models/SensorReading');

// 1. GET ALL SENSOR READINGS
router.get('/', async (req, res) => {
    try { const readings = await SensorReading.find();
        res.json(readings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2.save a new sensor reading
router.post('/', async (req, res) => {
    const { temperature, humidity, soilMoisture, lightLevel } = req.body;
    const sensorReading = new SensorReading({
        temperature,
        humidity,
        soilMoisture,
        lightLevel
    });
    try {
        const newSensorReading = await sensorReading.save();
        res.status(201).json(newSensorReading);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// 3. GET LATEST SENSOR READING
router.get('/latest', async (req, res) => {
    try {
        const latestReading = await SensorReading.findOne().sort({timestamp: -1 });
        if (!latestReading) {
            return res.status(404).json({ message: 'No sensor readings found' });
        }
        res.json(latestReading);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;

