const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  use: {
    baseURL: 'https://storage01.dbe.academy/232.02.webdev/test-023.login/',
    browserName: 'chromium',
    viewport: { width: 1280, height: 900 },
    screenshot: 'on',
    trace: 'retain-on-failure'
  }
});