const SensorReading = require('../models/SensorReading');
const Device = require('../models/Device');

//helper function to generate random sensor readings for testing purposes
const getRandomNumber = (min, max) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
};

const simulateReadings = async () => {
    try {
        // 1. Generate fake values
        const temp = getRandomNumber(22, 34);
        const hum = getRandomNumber(50, 80);
        const soil = getRandomNumber(20, 65);
        const light = getRandomNumber(300, 900);

        // 2. Save new reading to MongoDB
        const reading = await SensorReading.create({
            temperature: temp,
            humidity: hum,
            soilMoisture: soil,
            lightLevel: light
        });

        console.log(` SIMULATOR: Temp ${temp}°C | Humidity ${hum}% | Soil ${soil}% | Light ${light} lux`);

        // 3. Automation Rule for Water Pump
        const pump = await Device.findOne({ type: 'PUMP' });

        if (pump && pump.mode === 'AUTOMATIC') {
            if (soil < 30 && pump.status !== 'ON') {
                pump.status = 'ON';
                pump.lastUpdated = Date.now();
                await pump.save();
                console.log('AUTOMATION: Soil moisture low (< 30%). Water Pump turned ON! ');
            } else if (soil >= 60 && pump.status !== 'OFF') {
                pump.status = 'OFF';
                pump.lastUpdated = Date.now();
                await pump.save();
                console.log('AUTOMATION: Soil moisture sufficient (>= 60%). Water Pump turned OFF! ');
            }
        }
    } catch (err) {
        console.error('Simulator Error:', err.message);
    }
};

const startSimulator = () => {
    // Runs every 10,000 ms 
    setInterval(simulateReadings, 10000);
    console.log('Sensor Simulator Started (Interval: 10s)');
};



module.exports = startSimulator;