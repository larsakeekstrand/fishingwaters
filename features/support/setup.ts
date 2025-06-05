// Setup test environment for Cucumber
const { JSDOM } = require('jsdom');

// Create basic DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

// Set up globals
global.window = dom.window as any;
global.document = dom.window.document;

// Simple expect implementation for BDD tests
(global as any).expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeInTheDocument: () => {
    if (!actual) {
      throw new Error(`Expected element to be in document`);
    }
  },
  toHaveLength: (length: number) => {
    if (actual.length !== length) {
      throw new Error(`Expected length ${length}, got ${actual.length}`);
    }
  },
  toContain: (item: any) => {
    if (!actual.includes(item)) {
      throw new Error(`Expected ${actual} to contain ${item}`);
    }
  },
  not: {
    toBeInTheDocument: () => {
      if (actual) {
        throw new Error(`Expected element not to be in document`);
      }
    }
  }
});

// Simple jest mock
global.jest = {
  fn: () => () => {},
  mock: () => ({})
} as any;

// Make this a module
export {};