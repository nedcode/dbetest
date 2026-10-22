const { defineConfig, devices } = require('@playwright/test');
// Live account credentials are never passed into the test runner.
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  globalTimeout: process.env.CI ? 120_000 : undefined,
  expect: { timeout: 3_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['junit', { outputFile: 'test-results/junit.xml' }]],
  outputDir: './test-results',
  use: {
    baseURL: 'https://www.dbe.academy/',
    actionTimeout: 3000,
    navigationTimeout: 10000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    headless: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 600, height: 800 } } }],
  webServer: {
    command: 'node scripts/mock-api-server.cjs',
    url: 'http://127.0.0.1:43871/health',
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
