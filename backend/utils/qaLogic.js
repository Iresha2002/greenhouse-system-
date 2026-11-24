/**
 * Core business logic functions for SmartGrow OS
 */

// STEP 3 (REFACTORED CODE) — Clean, no duplicate return blocks, and fixes whitespace edge case:
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 3) {
    return { valid: false, message: 'Password must be at least 3 characters long' };
  }

  const rules = [
    { check: !/\s/.test(password),          message: 'Password must not contain spaces' },
    { check: /[A-Z]/.test(password),        message: 'Password must contain at least one uppercase letter' },
    { check: /[0-9]/.test(password),        message: 'Password must contain at least one digit' },
    { check: /[^a-zA-Z0-9\s]/.test(password), message: 'Password must contain at least one special character' },
  ];

  const failedRule = rules.find((rule) => !rule.check);
  if (failedRule) {
    return { valid: false, message: failedRule.message };
  }

  return { valid: true, message: 'Password is valid' };
}

// 2. Greenhouse Water Pump Automation Rule (from sensorSimulator.js)
function controlWaterPump(pumpMode, soilMoisture) {
  if (pumpMode !== 'AUTOMATIC') {
    return 'MANUAL_MODE';
  }
  if (soilMoisture < 30) {
    return 'PUMP_ON';
  } else if (soilMoisture >= 60) {
    return 'PUMP_OFF';
  } else {
    return 'NO_CHANGE';
  }
}

// 3. Basket Subtotal & Delivery Fee Calculator (from cartRoutes.js)
function calculateBasketSummary(items, deliveryMethod = 'delivery') {
  if (!Array.isArray(items) || items.length === 0) {
    return { subtotal: 0, deliveryFee: 0, total: 0 };
  }
  const subtotal = Number(
    items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0).toFixed(2)
  );
  const deliveryFee = deliveryMethod === 'pickup' || subtotal >= 50 ? 0.0 : 2.5;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  return { subtotal, deliveryFee, total };
}

module.exports = {
  validatePassword,
  controlWaterPump,
  calculateBasketSummary,
};
