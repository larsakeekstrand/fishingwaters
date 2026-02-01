/// <reference types="cypress" />

describe('Fishing Waters App Acceptance Tests', () => {
  beforeEach(() => {
    cy.visit('/');

    // Wait for the loading state to finish and ensure app is loaded
    cy.get('.leaflet-container', { timeout: 30000 }).should('be.visible');
  });

  it('successfully loads the application', () => {
    // Ensure the map container is rendered
    cy.get('.leaflet-container').should('be.visible');

    // Verify floating search bar exists
    cy.get('[data-testid="floating-search-bar"]').should('be.visible');
  });

  it('displays the map with interactive elements', () => {
    // Ensure Leaflet map is loaded correctly
    cy.get('.leaflet-map-pane').should('exist');

    // Check that controls are present
    cy.get('.leaflet-control-zoom').should('be.visible');
  });

  it('shows the floating action buttons', () => {
    cy.get('[data-testid="floating-action-buttons"]', { timeout: 20000 }).should('be.visible');
  });

  it('loads GeoJSON data', () => {
    // Wait for map to be fully loaded
    cy.get('.leaflet-map-pane', { timeout: 10000 }).should('exist');

    // Wait for overlay pane to exist
    cy.get('.leaflet-overlay-pane', { timeout: 10000 }).should('exist');

    cy.wait(1000);

    let attempts = 0;
    const maxAttempts = 20;

    function checkWithRetry() {
      if (attempts >= maxAttempts) {
        throw new Error('Map data did not load within the expected time');
      }

      cy.get('body').then($body => {
        if ($body.find('.leaflet-overlay-pane svg path').length > 0) {
          return;
        } else {
          attempts++;
          cy.wait(1000);
          checkWithRetry();
        }
      });
    }

    checkWithRetry();
  });
});
