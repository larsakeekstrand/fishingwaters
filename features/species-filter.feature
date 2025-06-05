Feature: Species Filter
  As a fishing enthusiast
  I want to filter fishing waters by fish species
  So that I can find waters containing specific fish I want to catch

  Background:
    Given the following species are available in the system:
      | species   |
      | Pike      |
      | Perch     |
      | Trout     |
      | Salmon    |
      | Zander    |

  Scenario: Display all available species in filter
    When I view the species filter
    Then I should see all 5 species as filter options
    And no species should be selected by default

  Scenario: Select a single species
    When I select "Pike" from the species filter
    Then "Pike" should be highlighted as selected
    And the other species should remain unselected

  Scenario: Select multiple species
    When I select "Pike" from the species filter
    And I select "Perch" from the species filter
    Then both "Pike" and "Perch" should be highlighted as selected
    And I should see 2 selected species indicated

  Scenario: Deselect a species
    Given I have selected "Pike" and "Perch"
    When I click on "Pike" again
    Then "Pike" should no longer be selected
    And only "Perch" should remain selected

  Scenario: Clear all selections
    Given I have selected "Pike", "Perch", and "Trout"
    When I click the "Clear all" button
    Then no species should be selected
    And all species should be available for selection

  Scenario: Species filter updates map in real-time
    Given the map shows 10 fishing waters
    When I select "Salmon" from the species filter
    Then the map should immediately update
    And only waters containing "Salmon" should be visible