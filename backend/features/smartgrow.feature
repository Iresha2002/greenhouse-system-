Feature: SmartGrow OS Crop Basket and Greenhouse Water Pump Automation
  As a greenhouse farmer and marketplace customer
  I want accurate basket pricing and automatic irrigation control
  So that orders are billed properly and crops receive optimal water

  Scenario: Customer orders fresh crops with standard home delivery
    Given the customer adds 4 kg of "Organic Bell Peppers" priced at $4.50 per kg to the basket
    When the customer selects "delivery" as the fulfillment method
    Then the basket subtotal should be $18.00
    And the delivery fee should be $2.50
    And the final order total should be $20.50

  Scenario: Greenhouse Water Pump automatically activates when soil moisture drops below threshold
    Given the greenhouse Water Pump is set to "AUTOMATIC" mode
    When the sensor simulator reports a soil moisture reading of 24.5 percent
    Then the Water Pump action should be "PUMP_ON"
