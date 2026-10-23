const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 1, // Shared in-memory demo inventory; reset between tests.
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:43910',
    actionTimeout: 5000,
    navigationTimeout: 10000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node app/start.cjs',
    url: 'http://127.0.0.1:43910/health',
    reuseExistingServer: !process.env.CI,
    timeout: 25000
  }
});
