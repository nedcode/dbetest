const { test } = require('@playwright/test');
const { hasAuthState } = require('../lib/auth-state');
const { runDanielJourney } = require('../lib/daniel-journey');
test.use({ screenshot: 'off', trace: 'off', video: 'off' });
test('Daniel: 4 screenshots and validated calendar (local saved session)', async ({ browser }) => {
  test.skip(!!process.env.CI, 'Private DBE account is excluded from CI');
  test.skip(!hasAuthState(), 'First run: npm run auth:save');
  await runDanielJourney(browser);
});
