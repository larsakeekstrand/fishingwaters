Feature: Side Panel Information Display
  As a fishing enthusiast
  I want to see detailed information about fishing waters
  So that I can make informed decisions about where to fish

  Background:
    Given the application has loaded fishing water data

  Scenario: Display water information when clicking a marker
    Given I have the map open with fishing waters
    When I click on the "Lake Vänern" marker
    Then the side panel should open
    And I should see "Lake Vänern" as the title
    And I should see the species "Pike, Perch"
    And I should see the region "Västra Götaland"

  Scenario: Close side panel
    Given the side panel is open showing "Lake Vänern"
    When I click the close button
    Then the side panel should close
    And no water information should be displayed

  Scenario: Update panel when selecting different water
    Given the side panel is open showing "Lake Vänern"
    When I click on the "Lake Vättern" marker
    Then the side panel should update
    And I should see "Lake Vättern" as the title
    And I should see the species "Trout, Salmon"

  Scenario: Handle missing water information gracefully
    Given there is a water with incomplete data
    When I click on a marker with missing information
    Then the side panel should open
    And I should see "Unknown Water" as the title
    And I should see "No species information available" for species