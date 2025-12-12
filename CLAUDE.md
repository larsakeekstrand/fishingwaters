# CLAUDE.md - FishingWaters Project Guide

## Commands
- Build: `npm start` (dev), `npm run build` (production)
- Deploy: `npm run deploy` (builds and deploys to GitHub Pages)
- Test: `npm test` (unit tests)
- E2E: `npm run cypress` (interactive), `npm run cypress:run` (headless)
- Acceptance: `npm run test:acceptance` (against production at https://larsakeekstrand.github.io/fishingwaters)

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
  - Map.tsx - Interactive Leaflet map component
  - SearchBar.tsx - Lake search with autocomplete and GPS location
  - SidePanel.tsx - Information panel for selected features
  - SpeciesFilter.tsx - Multi-select filter for fish species
  - PressureChart.tsx - Air pressure visualization using Chart.js
- /src/services/ - External service integrations
  - weatherService.ts - Historical data (Open-Meteo) + forecast (api.met.no) integration
- /src/types/ - TypeScript interfaces and type definitions
  - GeoJsonTypes.ts - Type definitions for GeoJSON features
  - proj4.d.ts - TypeScript declarations for proj4 library
- /src/utils/ - Helper functions and data processing logic
  - DataLoader.ts - Loads and processes fishing water data
  - coordinateConverter.ts - Converts between coordinate systems (SWEREF99 to WGS84)
  - geoUtils.ts - Geographic utility functions
- /public/data/ - GeoJSON and water data by region
  - index.json - List of available region files
  - Sverige_2025-05-12.json - Complete Swedish dataset
  - Regional files (Blekinge, Halland, etc.)
- /cypress/ - End-to-end test files and support
- /coverage/ - Test coverage reports (generated)
- /build/ - Production build output (generated)

## Testing Strategy
- Unit tests with Vitest and React Testing Library
- Cypress for end-to-end acceptance testing
- Coverage reports available in /coverage/lcov-report/index.html

## Key Features
- Interactive map with OpenStreetMap layer switcher
- Lake search with autocomplete and radius-based filtering
- GPS location integration for nearby lake search
- Species filtering with visual indicators (green for selected species)
- Air pressure chart showing last 5 days history (Open-Meteo) and 5 days forecast (api.met.no)
- Mobile-responsive design
- Deployed at: https://larsakeekstrand.github.io/fishingwaters/