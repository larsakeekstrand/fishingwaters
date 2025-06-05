Feature: Data Loading
  As a user of the fishing waters application
  I want the application to load data reliably
  So that I can access fishing water information without issues

  Scenario: Successful data loading on application start
    When I open the fishing waters application
    Then I should see a loading indicator
    And the fishing water data should load within 5 seconds
    And the map should display with markers

  Scenario: Handle network error during data loading
    Given the network connection is unavailable
    When I open the fishing waters application
    Then I should see an error message "Failed to load fishing water data"
    And I should see a "Retry" button
    
  Scenario: Retry data loading after error
    Given the data loading has failed
    And the network connection is now available
    When I click the "Retry" button
    Then the loading indicator should appear
    And the fishing water data should load successfully
    And the error message should disappear

  Scenario: Load data from different regions
    Given the application supports multiple regions
    When the application loads
    Then it should fetch data for all configured regions
    And combine them into a single dataset
    And display all waters on the map

  Scenario: Handle partially corrupted data
    Given some fishing water data is corrupted
    When the application loads the data
    Then it should skip the corrupted entries
    And display the valid fishing waters
    And log a warning about skipped entries