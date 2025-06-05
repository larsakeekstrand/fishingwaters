# BDD Testing Guide for FishingWaters

## Overview
This project follows Behavior-Driven Development (BDD) practices using Cucumber.js for feature specifications and Jest for unit tests.

## BDD Structure

### 1. Feature Files (`/features/*.feature`)
Written in Gherkin syntax, these describe application behavior from a user's perspective:
- `map-display.feature` - Map rendering and interaction
- `side-panel.feature` - Information panel functionality
- `species-filter.feature` - Fish species filtering
- `data-loading.feature` - Data loading and error handling

### 2. Step Definitions (`/features/step-definitions/*.steps.ts`)
TypeScript implementations of the Gherkin steps:
- Each step definition maps to Given/When/Then statements
- Uses React Testing Library for component testing
- Shares test data through the World object

### 3. BDD-Aligned Unit Tests (`/src/**/__tests__/*.bdd.test.tsx`)
Jest tests following BDD naming conventions:
```typescript
describe('Given a map with fishing water data', () => {
  describe('When rendering with no species filter', () => {
    it('Then all features should be displayed', () => {
      // test implementation
    });
  });
});
```

## Running BDD Tests

```bash
# Run all Cucumber tests
npm run test:bdd

# Run in watch mode
npm run test:bdd:watch

# Run specific feature
npm run test:bdd features/map-display.feature

# Run with specific tags (when implemented)
npm run test:bdd -- --tags "@critical"
```

## Writing New Features

1. **Create Feature File**
```gherkin
Feature: New Functionality
  As a [user type]
  I want [goal]
  So that [benefit]

  Scenario: Basic flow
    Given [initial context]
    When [action]
    Then [expected outcome]
```

2. **Implement Step Definitions**
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

Given('initial context', function(this: CustomWorld) {
  // Setup code
});

When('action', async function(this: CustomWorld) {
  // Action code
});

Then('expected outcome', function(this: CustomWorld) {
  // Assertion code
});
```

3. **Add Unit Tests (optional)**
Create BDD-style unit tests for detailed component behavior.

## Best Practices

### Feature Files
- Use business language, avoid technical implementation details
- One feature per file
- 3-7 scenarios per feature
- Use Background for common setup
- Use Scenario Outline for data-driven tests

### Step Definitions
- Keep steps reusable and atomic
- Use the World object for sharing state
- Avoid UI-specific selectors in step names
- Handle async operations properly

### Data Management
- Use data tables for structured input
- Mock external dependencies
- Reset state between scenarios

### Integration with CI/CD
```yaml
# Example GitHub Actions
- name: Run BDD Tests
  run: |
    npm ci
    npm run test:bdd
    npm run test
    npm run cypress:run
```

## Common Patterns

### Testing User Interactions
```gherkin
Scenario: User selects multiple filters
  Given I am on the fishing waters map
  When I select "Pike" from the species filter
  And I select "Perch" from the species filter
  Then I should see only waters containing Pike or Perch
```

### Testing Error States
```gherkin
Scenario: Handle network errors gracefully
  Given the network is unavailable
  When I try to load the fishing waters data
  Then I should see an error message
  And I should see a retry option
```

### Testing Async Operations
```gherkin
Scenario: Data loads successfully
  When I open the application
  Then I should see a loading indicator
  And the data should load within 5 seconds
  Then I should see the fishing waters on the map
```

## Debugging Tips

1. **Run specific scenarios**
   - Add `@focus` tag to run single scenario
   - Use `--name` parameter to match scenario names

2. **Check step implementation**
   - Undefined steps will show suggested implementations
   - Use `--dry-run` to check steps without execution

3. **View detailed output**
   - Use `--format @cucumber/pretty-formatter` for readable output
   - Check `reports/cucumber-report.json` for detailed results

## Maintenance

- Keep feature files up-to-date with product changes
- Refactor step definitions to reduce duplication
- Review and update scenarios during sprint planning
- Run BDD tests as part of the definition of done