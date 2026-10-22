const { test } = require('@playwright/test');
const { hasAuthState, authStatePath } = require('../lib/auth-state');
const { assertCalendar } = require('../lib/calendar-assertions');
test.use({ screenshot: 'off', trace: 'off', video: 'off' });
test('Calendar grid and non-empty distinct day labels', async ({ browser }) => {
  test.skip(!!process.env.CI, 'Authenticated DBE session stays local');
  test.skip(!hasAuthState(), 'First run: npm run auth:save');
  const context = await browser.newContext({ storageState: authStatePath, viewport: { width: 600, height: 800 } });
  try {
    const page = await context.newPage();
    await page.goto('https://www.dbe.academy/user/kalender/', { waitUntil: 'domcontentloaded' });
    await assertCalendar(page);
  } finally { await context.close(); }
});
