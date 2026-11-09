/**
 * Core business logic functions for SmartGrow OS
 * Used in Unit Testing (TDD) and Behaviour-Driven Development (BDD)
 */

// 1. Password Validator (TDD Red-Green-Refactor Example matching Lecture Notes)
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one digit' };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
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
