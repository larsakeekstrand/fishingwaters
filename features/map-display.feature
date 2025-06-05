Feature: Map Display
  As a fishing enthusiast
  I want to view fishing waters on an interactive map
  So that I can explore different fishing locations

  Background:
    Given the application has loaded map data
    And the following fishing waters are available:
      | name          | species         | region  |
      | Lake Vänern   | Pike, Perch     | VG      |
      | Lake Vättern  | Trout, Salmon   | VG      |
      | Mörrumsån     | Salmon, Trout   | Blekinge|

  Scenario: Display all fishing waters on initial load
    When I open the fishing waters map
    Then I should see a map centered on Sweden
    And I should see 3 fishing water markers on the map
    And all markers should be visible

  Scenario: Filter fishing waters by species
    Given I have opened the fishing waters map
    When I select "Pike" from the species filter
    Then I should see only 1 fishing water marker
    And the marker should represent "Lake Vänern"

  Scenario: Display multiple species selection
    Given I have opened the fishing waters map
    When I select "Salmon" from the species filter
    And I select "Trout" from the species filter
    Then I should see 2 fishing water markers
    And the markers should represent "Lake Vättern" and "Mörrumsån"

  Scenario: Clear species filter
    Given I have filtered the map to show only "Pike" waters
    When I clear all species filters
    Then I should see all 3 fishing water markers again