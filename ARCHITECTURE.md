# Fishing Waters React App – Deep Explanation & Architecture

## Overview

**Fishing Waters** is a React web application for visualizing fishing waters (lakes) in Sweden. It provides interactive map-based exploration, filtering, and detailed information about lakes and the fish species caught in them. The app is designed to be user-friendly, performant, and easily extensible.

---

## Project Purpose

- **Visualization:** Display Swedish lakes and their fishing data on an interactive map.
- **Exploration:** Allow users to filter lakes by caught fish species.
- **Information:** Show detailed lake attributes, such as name, depth, area, and caught species.
- **Accessibility:** Runs in the browser, no installation required, and is optimized for both desktop and mobile.

---

## High-Level Architecture

```
+---------------------+
|   React Frontend    |
|   (TypeScript)      |
+---------------------+
         |
         v
+---------------------+
|   Data Utilities    |
| (GeoJSON, Fetching) |
+---------------------+
         |
         v
+---------------------+
|   Static Assets     |
|   (GeoJSON, JSON)   |
+---------------------+
```

- **Frontend:** Built with React and TypeScript, using Material-UI (MUI) for styling and Leaflet for mapping.
- **Data Layer:** Lake data is stored as static GeoJSON/JSON files, fetched dynamically by the app.
- **Testing:** Unit tests (Jest, React Testing Library) and end-to-end tests (Cypress).

---

## Key Technologies

- **React**: UI library for building interactive interfaces
- **TypeScript**: Type safety throughout the codebase
- **Material-UI (MUI)**: Modern UI components and theming
- **Leaflet & React-Leaflet**: Map rendering and interactivity
- **Cypress**: End-to-end testing
- **Jest & Testing Library**: Unit and integration testing

---

## Main Components & Data Flow

### 1. App (src/App.tsx)
- **Root component**. Sets up theming, global state, and fetches lake data.
- Handles loading, error, and filtering state.
- Coordinates child components: `Map`, `SidePanel`, `SpeciesFilter`.

### 2. Map (src/components/Map.tsx)
- Renders an interactive map of Sweden using React-Leaflet.
- Plots lakes as points, filtered by selected species.
- Handles map events (click/select lake) and tooltips for caught species.

### 3. SidePanel (src/components/SidePanel.tsx)
- Displays detailed information about the selected lake.
- Shows name, depth, area, elevation, and caught species.

### 4. SpeciesFilter (src/components/SpeciesFilter.tsx)
- UI for selecting which fish species to filter lakes by.
- Updates global filter state in `App`.

### 5. Data Utilities (src/utils/DataLoader.ts, coordinateConverter.ts)
- Fetches and processes lake data from static files.
- Converts raw data to GeoJSON format.
- Merges multiple data sources if needed.
- Converts SWEREF99 coordinates to WGS84 for mapping.

---

## Data Flow Diagram

1. **App loads** → fetches `/data/index.json` (list of data files)
2. For each file, fetches and parses lake data
3. Converts data to GeoJSON features
4. Merges all features into a single collection
5. Passes data to `Map` and other components
6. User interacts with map or filter
7. Filtered data and selected lake are updated in state
8. `SidePanel` shows details for selected lake

---

## Testing & Quality

- **Unit Tests:** Located in `src/__tests__` and component `__tests__` folders. Run with `npm test`.
- **End-to-End Tests:** Cypress tests in `cypress/` folder. Run with `npm run cypress` (interactive) or `npm run cypress:run` (headless).
- **CI/CD:** GitHub Actions workflows for build, test, and deployment.

---

## Extensibility & Customization

- **Add new lakes:** Update/add GeoJSON/JSON files in the `public/data` directory.
- **Add new species:** Update species lists in data and UI filter logic.
- **UI Customization:** Leverage MUI theming and component overrides.
- **Map customization:** Modify `Map.tsx` for new layers, markers, or interactions.

---

## Directory Structure (Partial)

```
fishingwaters/
├── public/
│   └── data/           # Static lake data (GeoJSON/JSON)
├── src/
│   ├── App.tsx         # Root app logic
│   ├── components/     # Map, SidePanel, SpeciesFilter, etc.
│   ├── utils/          # DataLoader, coordinate conversion
│   └── types/          # TypeScript types
├── cypress/            # Cypress end-to-end tests
├── .github/workflows/  # CI/CD pipelines
├── package.json        # Dependencies & scripts
└── README.md           # Basic usage & setup
```

---

## Summary

Fishing Waters is a modern, modular React application for exploring Swedish lakes and their fishing data on an interactive map. Its architecture is designed for clarity, extensibility, and ease of use, leveraging best practices in frontend development and geospatial visualization.
