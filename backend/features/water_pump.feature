Feature: SmartGrow OS Greenhouse Water Pump Automation
  As a greenhouse farmer
  I want automatic irrigation control based on soil moisture
  So that my crops receive optimal water without manual intervention

  Scenario: Greenhouse Water Pump automatically activates when soil moisture drops below threshold
    Given the greenhouse Water Pump is set to "AUTOMATIC" mode
    When the sensor simulator reports a soil moisture reading of 24.5 percent
    Then the Water Pump action should be "PUMP_ON"
