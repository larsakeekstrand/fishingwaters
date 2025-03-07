# CLAUDE.md - FishingWaters Project Guide

## Commands
- Build: `npm start` (dev), `npm run build` (production)
- Test: `npm test` (all tests), `npm test -- -t 'test name pattern'` (single test)
- E2E: `npm run cypress` (interactive), `npm run cypress:run` (headless)
- Acceptance: `npm run test:acceptance` (against production)

## Code Style
- TypeScript with strict typing, interfaces for props and data structures
- React functional components with explicit typing (React.FC)
- PascalCase for components/interfaces, camelCase for functions/variables
- Imports order: React first, then components/types, utilities last
- 2-space indentation, semicolons required, single quotes for strings
- Error handling: try/catch for async, explicit error states with messages
- Tests: descriptive blocks with clear assertions, mock data defined in tests
- Material UI: Use MUI components for UI elements, styled-component approach for custom styling

## Project Structure
- /src/components/ - React components with parallel __tests__ folder
- /src/types/ - TypeScript interfaces and type definitions
- /src/utils/ - Helper functions and data processing logic
- /public/data/ - GeoJSON and water data by region