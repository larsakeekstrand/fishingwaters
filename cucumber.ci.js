// Ensure ts-node uses CommonJS
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: 'commonjs'
});

module.exports = {
  default: {
    require: ['features/support/ci-setup.ts', 'features/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'json:reports/cucumber-report.json'],
    parallel: 1,
    failFast: false
  }
};