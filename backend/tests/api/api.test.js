const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const {
    validatePassword,
    controlWaterPump,
    calculateBasketSummary
} = require('../../utils/qaLogic');

/**
 * Automated REST API Test Suite for SmartGrow OS
 * Simulates Postman / REST Assured automated API verification in CI/CD
 */
function createTestApiServer() {
    const app = express();
    app.use(express.json());

    // 1. Health Check Endpoint
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: 'UP',
            service: 'SmartGrow OS Greenhouse & Marketplace API',
            version: '1.0.0'
        });
    });

    // 2. Password Validation Endpoint (Auth Module)
    app.post('/api/auth/validate-password', (req, res) => {
        const { password } = req.body || {};
        const result = validatePassword(password);
        if (!result.valid) {
            return res.status(400).json(result);
        }
        return res.status(200).json(result);
    });

    // 3. Marketplace Basket Summary & Delivery Fee Endpoint
    app.post('/api/cart/summary', (req, res) => {
        const { items, deliveryMethod } = req.body || {};
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'Items array is required' });
        }
        const summary = calculateBasketSummary(items, deliveryMethod);
        return res.status(201).json(summary);
    });

    // 4. IoT Sensor Water Pump Automation Endpoint
    app.post('/api/sensors/evaluate-pump', (req, res) => {
        const { pumpMode, soilMoisture } = req.body || {};
        if (typeof soilMoisture !== 'number' || soilMoisture < 0 || soilMoisture > 100) {
            return res.status(400).json({ pumpAction: 'SENSOR_ERROR', error: 'Invalid sensor reading' });
        }
        const action = controlWaterPump(pumpMode || 'AUTOMATIC', soilMoisture);
        return res.status(200).json({
            pumpMode: pumpMode || 'AUTOMATIC',
            soilMoisture,
            pumpAction: action
        });
    });

    return app;
}

describe('SmartGrow OS Automated REST API Test Suite', () => {
    let server;
    let baseUrl;

    before(async () => {
        const app = createTestApiServer();
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const { port } = server.address();
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    it('API-TC-01: GET /api/health should return 200 OK and service status UP', async () => {
        const start = Date.now();
        const res = await fetch(`${baseUrl}/api/health`);
        const duration = Date.now() - start;
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'UP');
        assert.ok(duration < 200, `Expected response time < 200ms, got ${duration}ms`);
    });

    it('API-TC-02: POST /api/auth/validate-password should return 200 OK for strong password', async () => {
        const res = await fetch(`${baseUrl}/api/auth/validate-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'SmartGrow@2026' })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.valid, true);
    });

    it('API-TC-03: POST /api/auth/validate-password should return 400 Bad Request for weak password (< 3 chars)', async () => {
        const res = await fetch(`${baseUrl}/api/auth/validate-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'a1' })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.valid, false);
    });

    it('API-TC-03b: POST /api/auth/validate-password should return 400 Bad Request when password contains spaces', async () => {
        const res = await fetch(`${baseUrl}/api/auth/validate-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'Green @123' })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.valid, false);
        assert.strictEqual(data.message, 'Password must not contain spaces');
    });

    it('API-TC-04: POST /api/cart/summary should return 201 Created and free delivery for basket >= $50', async () => {
        const res = await fetch(`${baseUrl}/api/cart/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: [
                    { name: 'Organic Tomatoes', price: 15, quantity: 2 },
                    { name: 'Fresh Strawberries', price: 25, quantity: 1 }
                ],
                deliveryMethod: 'delivery'
            })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 201);
        assert.strictEqual(data.subtotal, 55);
        assert.strictEqual(data.deliveryFee, 0);
        assert.strictEqual(data.total, 55);
    });

    it('API-TC-05: POST /api/sensors/evaluate-pump should return 200 OK and PUMP_ON when moisture < 30%', async () => {
        const res = await fetch(`${baseUrl}/api/sensors/evaluate-pump`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pumpMode: 'AUTOMATIC',
                soilMoisture: 22
            })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.pumpAction, 'PUMP_ON');
    });

    it('API-TC-06: POST /api/sensors/evaluate-pump should return 400 Bad Request for out-of-range moisture (125%)', async () => {
        const res = await fetch(`${baseUrl}/api/sensors/evaluate-pump`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pumpMode: 'AUTOMATIC',
                soilMoisture: 125
            })
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.pumpAction, 'SENSOR_ERROR');
    });
});
