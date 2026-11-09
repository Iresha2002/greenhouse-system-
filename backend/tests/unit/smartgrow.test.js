const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  validatePassword,
  controlWaterPump,
  calculateBasketSummary,
} = require('../../utils/qaLogic');

// Lightweight expect() helper matching Vitest / Jest syntax from Lecture Notes
function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
  };
}

describe('1. SmartGrow OS Password Validator (TDD Workflow)', () => {
  it('returns { valid: false } for a short password (< 8 characters)', () => {
    const result = validatePassword('Ab1@');
    expect(result.valid).toBe(false);
  });

  it('returns { valid: false } when password has no uppercase letter', () => {
    const result = validatePassword('greenhouse1@');
    expect(result.valid).toBe(false);
  });

  it('returns { valid: false } when password has no digit', () => {
    const result = validatePassword('Greenhouse@');
    expect(result.valid).toBe(false);
  });

  it('returns { valid: false } when password has no special character', () => {
    const result = validatePassword('Greenhouse123');
    expect(result.valid).toBe(false);
  });

  it('returns { valid: true } for a strong 8+ character password with uppercase, digit, and special char', () => {
    const result = validatePassword('Green@123');
    expect(result.valid).toBe(true);
  });
});

describe('2. SmartGrow OS Water Pump Automation Unit Tests', () => {
  it('returns MANUAL_MODE when pump mode is MANUAL', () => {
    expect(controlWaterPump('MANUAL', 25.0)).toBe('MANUAL_MODE');
  });

  it('turns pump ON when mode is AUTOMATIC and soil moisture is below 30%', () => {
    expect(controlWaterPump('AUTOMATIC', 24.5)).toBe('PUMP_ON');
  });

  it('turns pump OFF when mode is AUTOMATIC and soil moisture is 60% or above', () => {
    expect(controlWaterPump('AUTOMATIC', 65.0)).toBe('PUMP_OFF');
  });

  it('returns NO_CHANGE when soil moisture is between 30% and 59.9%', () => {
    expect(controlWaterPump('AUTOMATIC', 45.0)).toBe('NO_CHANGE');
  });
});

describe('3. SmartGrow OS Basket & Delivery Fee Unit Tests', () => {
  it('adds $2.50 delivery fee for Home Delivery when subtotal is below $50', () => {
    const items = [{ price: 4.5, quantity: 4 }]; // $18.00
    expect(calculateBasketSummary(items, 'delivery')).toEqual({
      subtotal: 18.0,
      deliveryFee: 2.5,
      total: 20.5,
    });
  });

  it('gives free delivery ($0.00) when Home Delivery subtotal is $50 or more', () => {
    const items = [{ price: 25.0, quantity: 2 }]; // $50.00
    expect(calculateBasketSummary(items, 'delivery')).toEqual({
      subtotal: 50.0,
      deliveryFee: 0.0,
      total: 50.0,
    });
  });

  it('gives free pickup ($0.00) when Farm Pickup is selected regardless of subtotal', () => {
    const items = [{ price: 3.8, quantity: 2 }]; // $7.60
    expect(calculateBasketSummary(items, 'pickup')).toEqual({
      subtotal: 7.6,
      deliveryFee: 0.0,
      total: 7.6,
    });
  });
});
