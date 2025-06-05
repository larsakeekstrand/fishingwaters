Feature: Health Check
  As a developer
  I want to ensure the BDD framework is working
  So that I can trust the test results

  Scenario: BDD framework is operational
    Given the BDD test framework is running
    When I check the framework status
    Then the framework should be operational