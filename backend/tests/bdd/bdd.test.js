const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { controlWaterPump, calculateBasketSummary } = require('../../utils/qaLogic');

describe('Cucumber Gherkin BDD Features (backend/features/)', () => {
  it('Feature 1 (basket_pricing.feature): Customer orders fresh crops with standard home delivery (5 steps)', () => {
    // Given the customer adds 4 kg of "Organic Bell Peppers" priced at $4.50 per kg to the basket
    const basketItems = [{ name: 'Organic Bell Peppers', quantity: 4, price: 4.5 }];
    // When the customer selects "delivery" as the fulfillment method
    const summary = calculateBasketSummary(basketItems, 'delivery');
    // Then the basket subtotal should be $18.00, delivery fee $2.50, final total $20.50
    assert.strictEqual(summary.subtotal, 18.0);
    assert.strictEqual(summary.deliveryFee, 2.5);
    assert.strictEqual(summary.total, 20.5);
  });

  it('Feature 2 (water_pump.feature): Greenhouse Water Pump automatically activates when soil moisture < 30% (3 steps)', () => {
    // Given the greenhouse Water Pump is set to "AUTOMATIC" mode
    const mode = 'AUTOMATIC';
    // When the sensor simulator reports a soil moisture reading of 24.5 percent
    const action = controlWaterPump(mode, 24.5);
    // Then the Water Pump action should be "PUMP_ON"
    assert.strictEqual(action, 'PUMP_ON');
  });
});
