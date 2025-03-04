/// <reference types="cypress" />

describe('Fishing Waters App Acceptance Tests', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
    
    // Wait for the loading state to finish and ensure app is loaded
    cy.get('.loading-container', { timeout: 30000 }).should('not.exist');
    cy.get('.app', { timeout: 10000 }).should('exist');
  });

  it('successfully loads the application', () => {
    // Verify the app container exists
    cy.get('.app').should('exist');
    
    // Ensure the map container is rendered
    cy.get('.leaflet-container').should('be.visible');
  });

  it('displays the map with interactive elements', () => {
    // Ensure Leaflet map is loaded correctly
    cy.get('.leaflet-map-pane').should('exist');
    
    // Check that controls are present
    cy.get('.leaflet-control-zoom').should('be.visible');
  });

  it('shows the species filter component', () => {
    // Verify that the species filter exists
    cy.get('.filter-panel', { timeout: 20000 }).should('exist');
    cy.get('.filter-header').should('contain', 'Filtrera efter arter');
  });

  it('loads GeoJSON data', () => {
    // We can verify data was loaded by checking no error state is shown
    cy.get('.error-container').should('not.exist');
    
    // Wait for map to be fully loaded
    cy.get('.leaflet-map-pane', { timeout: 10000 }).should('exist');
    
    // Wait for overlay pane to exist
    cy.get('.leaflet-overlay-pane', { timeout: 10000 }).should('exist');
    
    // Use cy.waitUntil for more robust checking of the vector layers
    cy.wait(1000); // Small initial wait
    
    // Try multiple assertions with retries
    const checkForMapData = () => {
      return cy.get('body').then($body => {
        // First check for SVG paths which indicate GeoJSON data
        if ($body.find('.leaflet-overlay-pane svg path').length > 0) {
          return true;
        }
        
        // No error message should be visible
        if ($body.find('.error-container').length > 0) {
          return false;
        }
        
        // Not ready yet
        return false;
      });
    };
    
    // Try for up to 20 seconds with 1-second intervals
    let attempts = 0;
    const maxAttempts = 20;
    
    function checkWithRetry() {
      if (attempts >= maxAttempts) {
        throw new Error('Map data did not load within the expected time');
      }
      
      cy.get('body').then($body => {
        if ($body.find('.leaflet-overlay-pane svg path').length > 0) {
          // Success! Map data is loaded
          return;
        } else {
          attempts++;
          cy.wait(1000); // Wait 1 second
          checkWithRetry(); // Try again
        }
      });
    }
    
    checkWithRetry();
  });
});
