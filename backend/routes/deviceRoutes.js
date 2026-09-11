const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// 1. GET ALL DEVICES
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. CREATE A NEW DEVICE
router.post('/', async (req, res) => {
    const { name, type, status, mode } = req.body;

    const device = new Device({
        name,
        type,
        status,
        mode
    });

    try {
        const newDevice = await device.save();
        res.status(201).json(newDevice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. UPDATE A DEVICE 
router.put('/:id', async (req, res) => {
    try {
        const { status, mode } = req.body;
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        if (status) device.status = status;
        if (mode) device.mode = mode;
        device.lastUpdated = Date.now();

        const updatedDevice = await device.save();
        res.json(updatedDevice);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE A DEVICE
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findByIdAndDelete(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;