import { Given, When, Then } from '@cucumber/cucumber';

Given('the BDD test framework is running', function() {
  // This step passes if we reach here
});

When('I check the framework status', function() {
  // Simple check
  this.frameworkStatus = 'operational';
});

Then('the framework should be operational', function() {
  if (this.frameworkStatus !== 'operational') {
    throw new Error('Framework is not operational');
  }
});