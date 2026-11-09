const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { runBddVerification } = require('../../features/step_definitions/smartgrow.steps');

describe('SmartGrow OS Cucumber Gherkin BDD Scenarios (features/smartgrow.feature)', () => {
  it('BDD-SC-01 & BDD-SC-02: Should execute all Gherkin scenarios and pass all 7 steps', () => {
    const summary = runBddVerification();
    assert.strictEqual(summary, '2 scenarios (2 passed), 7 steps (7 passed)');
  });
});
