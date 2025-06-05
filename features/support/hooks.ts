import { Before, After, BeforeAll } from '@cucumber/cucumber';

BeforeAll(function() {
  // Setup global test environment
  global.console.warn = () => {};
  global.console.error = () => {};
});

Before(function() {
  // Reset test data before each scenario
  this.testData = {
    mockGeoJsonData: undefined,
    mockIndexData: undefined,
    selectedSpecies: []
  };
});

After(function() {
  // Clean up after each scenario
  if (this.component) {
    this.component = undefined;
  }
});