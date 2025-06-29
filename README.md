# Fishing Waters React App

A React application for visualizing fishing waters in Sweden.

🌐 **Live Demo**: [https://larsakeekstrand.github.io/fishingwaters/](https://larsakeekstrand.github.io/fishingwaters/)

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install dependencies:

   ```bash
   npm install
   ```

## Running the Application

To start the development server:

```bash
npm start
```

The application will be available at <http://localhost:3000>. Note that this is the default development server port.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create optimized files in the `build` directory that can be served by any static file server or web hosting platform.

## Testing

### Unit Tests

To run the unit tests:

```bash
npm test
```

### BDD Tests (Behavior-Driven Development)

The project uses Cucumber.js for BDD testing with Gherkin feature files that describe user behavior:

#### Running BDD Tests

```bash
# Run all BDD scenarios
npm run test:bdd

# Run in watch mode for development
npm run test:bdd:watch

# Run specific feature
npm run test:bdd features/map-display.feature

# Dry run to check step definitions
npm run test:bdd -- --dry-run
```

#### BDD Structure

- **Feature Files** (`/features/*.feature`): User-focused scenarios in Gherkin syntax
- **Step Definitions** (`/features/step-definitions/*.ts`): TypeScript implementations
- **Test Coverage**: Map display, species filtering, side panel, and data loading behaviors

#### Example Feature

```gherkin
Feature: Map Display
  As a fishing enthusiast
  I want to view fishing waters on an interactive map
  So that I can explore different fishing locations

  Scenario: Filter fishing waters by species
    Given the application has loaded map data
    When I select "Pike" from the species filter
    Then I should see only fishing waters containing Pike
```

### Acceptance Tests

The project includes comprehensive end-to-end acceptance tests using Cypress to verify the deployed application works correctly.

#### Running Cypress Tests Locally

1. **Interactive Mode (opens the Cypress UI)**:
   ```bash
   npm run cypress
   ```
   This opens the Cypress Test Runner, where you can select and run individual tests in real-time, with a visual interface.

2. **Headless Mode (runs all tests in the terminal)**:
   ```bash
   npm run cypress:run
   ```
   This runs all tests in the background and displays the results directly in your terminal.

3. **Against the Live Site**:
   ```bash
   npm run test:acceptance
   ```
   This runs the tests against the deployed GitHub Pages site to ensure production functionality.

#### Acceptance Tests in CI

Acceptance tests are automatically run in Continuous Integration (CI) after each successful deployment to GitHub Pages. The GitHub Actions workflow:

1. Waits for the deployment to be available
2. Runs the Cypress tests against the live site
3. Uploads screenshots as artifacts if any tests fail

To run the acceptance tests manually from GitHub Actions, go to the Actions tab, select the "Acceptance Tests" workflow, and click "Run workflow".

## Features

The Fishing Waters React App provides a rich, interactive experience for exploring Swedish lakes:

- **Interactive Map**: A dynamic, zoomable map of Swedish lakes
- **Species Filtering**: Easily filter lakes by specific fish species
- **Visual Species Indicators**: Color-coded lake markers showing fish species presence (e.g., Gös shown in green)
- **Informative Tooltips**: Hover over lakes to reveal detailed information

## Testing Strategy

The project follows a comprehensive testing approach:

1. **Unit Tests (Jest)**: Component and utility function testing
2. **BDD Tests (Cucumber)**: User behavior verification through scenarios
3. **E2E Tests (Cypress)**: Full application acceptance testing

This multi-layered testing strategy ensures reliability at all levels, from individual components to complete user workflows. BDD tests serve as living documentation, making requirements clear to both developers and stakeholders.
