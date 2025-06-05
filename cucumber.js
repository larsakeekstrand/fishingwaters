module.exports = {
  default: {
    require: ['features/support/setup.ts', 'features/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['@cucumber/pretty-formatter', 'json:reports/cucumber-report.json']
  }
};

// Ensure ts-node uses CommonJS
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'commonjs'
});