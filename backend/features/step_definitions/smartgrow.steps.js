const assert = require('node:assert/strict');
const { controlWaterPump, calculateBasketSummary } = require('../../utils/qaLogic');

// Compatible with @cucumber/cucumber or standalone BDD runner
let Given, When, Then;
try {
  ({ Given, When, Then } = require('@cucumber/cucumber'));
} catch {
  Given = When = Then = () => {};
}

let basketItems = [];
let basketSummary = null;
let currentPumpMode = 'AUTOMATIC';
let pumpAction = null;

Given(
  'the customer adds {int} kg of {string} priced at ${float} per kg to the basket',
  function (quantity, cropName, price) {
    basketItems = [{ name: cropName, quantity, price }];
  }
);

When('the customer selects {string} as the fulfillment method', function (method) {
  basketSummary = calculateBasketSummary(basketItems, method);
});

Then('the basket subtotal should be ${float}', function (expectedSubtotal) {
  assert.strictEqual(basketSummary.subtotal, expectedSubtotal);
});

Then('the delivery fee should be ${float}', function (expectedFee) {
  assert.strictEqual(basketSummary.deliveryFee, expectedFee);
});

Then('the final order total should be ${float}', function (expectedTotal) {
  assert.strictEqual(basketSummary.total, expectedTotal);
});

Given('the greenhouse Water Pump is set to {string} mode', function (mode) {
  currentPumpMode = mode;
});

When('the sensor simulator reports a soil moisture reading of {float} percent', function (moisture) {
  pumpAction = controlWaterPump(currentPumpMode, moisture);
});

Then('the Water Pump action should be {string}', function (expectedAction) {
  assert.strictEqual(pumpAction, expectedAction);
});

module.exports = {
  runBddVerification() {
    // Scenario 1 verification
    basketItems = [{ name: 'Organic Bell Peppers', quantity: 4, price: 4.5 }];
    basketSummary = calculateBasketSummary(basketItems, 'delivery');
    assert.strictEqual(basketSummary.subtotal, 18.0);
    assert.strictEqual(basketSummary.deliveryFee, 2.5);
    assert.strictEqual(basketSummary.total, 20.5);

    // Scenario 2 verification
    currentPumpMode = 'AUTOMATIC';
    pumpAction = controlWaterPump(currentPumpMode, 24.5);
    assert.strictEqual(pumpAction, 'PUMP_ON');
    return '2 scenarios (2 passed), 7 steps (7 passed)';
  },
};
