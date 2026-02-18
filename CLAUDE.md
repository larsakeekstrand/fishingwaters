# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Dev server: `npm start` (port 3000, serves at /fishingwaters/)
- Build: `npm run build` (output to /build/)
- Deploy: `npm run deploy` (builds + deploys to GitHub Pages)
- Unit tests: `npm test` (Vitest, all tests)
- Single test: `npx vitest run src/path/to/test.ts`
- Watch mode: `npm run test:watch`
- E2E interactive: `npm run cypress` (requires dev server running)
- E2E headless: `npm run cypress:run` (requires dev server running)
- Acceptance: `npm run test:acceptance` (runs Cypress against production)

## Architecture

React + TypeScript SPA for exploring Swedish fishing waters on an interactive map. Deployed to GitHub Pages at `/fishingwaters/`.

**Data flow:** App.tsx fetches `/data/index.json` → loads regional JSON files → converts SWEREF99 coordinates to WGS84 via proj4 → merges into a single GeoJsonCollection → passes to Map and search components.

**Key data types:** `GeoJsonFeature` and `GeoJsonCollection` in `src/types/GeoJsonTypes.ts`. Lake properties have dual Swedish/English names (e.g., `catchedSpecies` / `fångadeArter`).

**Component layout:** Full-viewport Leaflet map with floating overlay elements (search bar, action buttons, side panel). The overlay container uses `pointerEvents: 'none'` with individual interactive elements re-enabling pointer events.

**Weather integration:** `WeatherService` combines two APIs — Open-Meteo archive for historical data and api.met.no for forecasts. Both are aggregated to daily averages. Results are cached for 10 minutes.

**Fishing forecast:** `fishingScoreCalculator.ts` computes a weighted score (pressure trend 40%, wind 25%, moon phase 20%, temperature 15%) and maps to 1-5 stars. Moon phase calculation in `moonPhase.ts` uses synodic month from a known new moon epoch.

**Coordinate system:** Raw data uses SWEREF99 TM (Swedish national grid). `coordinateConverter.ts` uses proj4 to convert to WGS84 for Leaflet.

## Code Style
- TypeScript with strict mode; interfaces for props and data structures
- React functional components typed with `React.FC`
- PascalCase for components/interfaces, camelCase for functions/variables
- 2-space indentation, semicolons required, single quotes
- Import order: React first, then components/types, utilities last
- Material UI (MUI v6) for UI components
- Tests in `__tests__/` folders parallel to source, using Vitest + React Testing Library

## CI
- Push/PR to main: build + test + auto-tag (date + short SHA format `v2025.05.12-abc1234`)
- Acceptance tests run post-deploy against the live GitHub Pages site
