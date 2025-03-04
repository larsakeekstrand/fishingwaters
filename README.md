# Fishing Waters React App

A React application for visualizing fishing waters in Sweden.

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

The application will be available at <http://localhost:3000>.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create optimized files in the `build` directory that can be served by any static file server.

## Testing

### Unit Tests

To run the unit tests:

```bash
npm test
```

### Acceptance Tests

The project includes end-to-end acceptance tests using Cypress to verify the deployed application works correctly.

#### Running Cypress Tests Locally

1. **Interactive Mode (opens the Cypress UI)**:
   ```bash
   npm run cypress
   ```
   This opens the Cypress Test Runner, where you can select individual tests to run and watch them execute in real-time.

2. **Headless Mode (runs all tests in the terminal)**:
   ```bash
   npm run cypress:run
   ```
   This runs all tests in the background and shows the results in your terminal.

3. **Against the Live Site**:
   ```bash
   npm run test:acceptance
   ```
   This runs the tests against the deployed GitHub Pages site.

#### Acceptance Tests in CI

Acceptance tests are automatically run in CI after each successful deployment to GitHub Pages. The GitHub Actions workflow:

1. Waits for the deployment to be available
2. Runs the Cypress tests against the live site
3. Uploads screenshots as artifacts if any tests fail

To run the acceptance tests manually from GitHub Actions, go to the Actions tab, select the "Acceptance Tests" workflow, and click "Run workflow".

## Features

- Interactive map of Swedish lakes
- Filter lakes by fish species
- Visual indication of lakes containing specific species (e.g., Gös shown in green)
- Lake information tooltips on hover
