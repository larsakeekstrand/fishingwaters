// CI-specific setup for Cucumber tests
// Use require directly since we're in CommonJS context

// Setup jest and expect globals first
try {
  global.jest = require('jest-mock');
} catch (e) {
  console.log('jest-mock not available, using simple mock');
  global.jest = {
    fn: () => () => {},
    mock: () => ({})
  } as any;
}

// Simple expect implementation for CI
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

// Only set up DOM if not already available
if (typeof window === 'undefined') {
  try {
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    
    global.window = dom.window as any;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
  } catch (e) {
    console.log('JSDOM setup failed, tests may not work properly:', e);
  }
}

console.log('CI setup completed');

// Make this a module
export {};