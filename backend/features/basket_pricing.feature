Feature: SmartGrow OS Crop Basket and Delivery Fee Calculation
  As a marketplace customer
  I want accurate basket subtotal and delivery fee calculation
  So that my crop orders are billed properly

  Scenario: Customer orders fresh crops with standard home delivery
    Given the customer adds 4 kg of "Organic Bell Peppers" priced at $4.50 per kg to the basket
    When the customer selects "delivery" as the fulfillment method
    Then the basket subtotal should be $18.00
    And the delivery fee should be $2.50
    And the final order total should be $20.50
