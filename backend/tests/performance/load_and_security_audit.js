const express = require('express');
const {
    validatePassword,
    controlWaterPump,
    calculateBasketSummary
} = require('../../utils/qaLogic');

function createServer() {
    const app = express();
    app.use(express.json());

    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'UP', service: 'SmartGrow OS API' });
    });

    app.post('/api/cart/summary', (req, res) => {
        const { items, deliveryMethod } = req.body || {};
        const summary = calculateBasketSummary(items || [], deliveryMethod);
        res.status(201).json(summary);
    });

    app.post('/api/sensors/evaluate-pump', (req, res) => {
        const { pumpMode, soilMoisture } = req.body || {};
        const action = controlWaterPump(pumpMode || 'AUTOMATIC', Number(soilMoisture));
        res.status(200).json({ pumpAction: action });
    });

    return app;
}

async function runEndpointLoadTest(baseUrl, name, method, path, body, users = 50, loops = 4) {
    const totalRequests = users * loops;
    const latencies = [];
    let errors = 0;

    const startWall = performance.now();

    const userPromises = [];
    for (let u = 0; u < users; u++) {
        userPromises.push((async () => {
            for (let l = 0; l < loops; l++) {
                const t0 = performance.now();
                try {
                    const res = await fetch(`${baseUrl}${path}`, {
                        method,
                        headers: body ? { 'Content-Type': 'application/json' } : undefined,
                        body: body ? JSON.stringify(body) : undefined
                    });
                    if (!res.ok) errors++;
                } catch {
                    errors++;
                }
                latencies.push(performance.now() - t0);
            }
        })());
    }

    await Promise.all(userPromises);
    const totalWallSec = (performance.now() - startWall) / 1000;

    latencies.sort((a, b) => a - b);
    const sum = latencies.reduce((acc, v) => acc + v, 0);
    const avg = sum / latencies.length;
    const min = latencies[0];
    const max = latencies[latencies.length - 1];
    const p90 = latencies[Math.floor(latencies.length * 0.90)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const throughput = totalRequests / totalWallSec;

    return {
        name,
        samples: totalRequests,
        avgMs: avg.toFixed(2),
        minMs: min.toFixed(2),
        maxMs: max.toFixed(2),
        p90Ms: p90.toFixed(2),
        p95Ms: p95.toFixed(2),
        errorPct: ((errors / totalRequests) * 100).toFixed(2) + '%',
        throughputRps: throughput.toFixed(1)
    };
}

async function main() {
    const app = createServer();
    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const r1 = await runEndpointLoadTest(baseUrl, 'GET /api/health', 'GET', '/api/health', null, 50, 4);
    const r2 = await runEndpointLoadTest(
        baseUrl,
        'POST /api/cart/summary',
        'POST',
        '/api/cart/summary',
        { items: [{ name: 'Tomatoes', price: 15, quantity: 4 }], deliveryMethod: 'delivery' },
        50,
        4
    );
    const r3 = await runEndpointLoadTest(
        baseUrl,
        'POST /api/sensors/evaluate-pump',
        'POST',
        '/api/sensors/evaluate-pump',
        { pumpMode: 'AUTOMATIC', soilMoisture: 24 },
        50,
        4
    );

    console.log(JSON.stringify([r1, r2, r3], null, 2));
    server.close();
}

main();
