// CI-specific setup for Cucumber tests
// Use require directly since we're in CommonJS context

// Setup jest and expect globals first
try {
  (globalThis as any).jest = require('jest-mock');
} catch (e) {
  console.log('jest-mock not available, using simple mock');
  (globalThis as any).jest = {
    fn: () => () => {},
    mock: () => ({})
  };
}

// Simple expect implementation for CI
(globalThis as any).expect = (actual: any) => ({
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

// Only set up DOM if not already available
if (typeof window === 'undefined') {
  try {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    (globalThis as any).HTMLElement = dom.window.HTMLElement;
    (globalThis as any).Element = dom.window.Element;
  } catch (e) {
    console.log('JSDOM setup failed, tests may not work properly:', e);
  }
}

console.log('CI setup completed');

// Make this a module
export {};
