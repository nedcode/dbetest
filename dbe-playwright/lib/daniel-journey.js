const fs = require('node:fs');
const path = require('node:path');
const { expect } = require('@playwright/test');
const { authStatePath } = require('./auth-state');
const { assertCalendar } = require('./calendar-assertions');
async function runDanielJourney(browser, destination = path.resolve('screenshots')) {
  fs.mkdirSync(destination, { recursive: true });
  const guest = await browser.newContext({ viewport: { width: 600, height: 800 } });
  try {
    const page = await guest.newPage();
    await page.goto('https://www.dbe.academy/', { waitUntil: 'domcontentloaded' });
    await page.screenshot({ path: path.join(destination, '01_screenshot.png'), fullPage: true });
    await page.goto('https://www.dbe.academy/auth/login/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await page.screenshot({ path: path.join(destination, '02_screenshot.png'), fullPage: true });
  } finally { await guest.close(); }
  const signedIn = await browser.newContext({ storageState: authStatePath, viewport: { width: 600, height: 800 } });
  try {
    const page = await signedIn.newPage();
    await page.goto('https://www.dbe.academy/user/lernwelt/dashboard/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/user\/lernwelt\/dashboard\/?(?:[?#]|$)/);
    await page.screenshot({ path: path.join(destination, '03_screenshot.png'), fullPage: true });
    await page.goto('https://www.dbe.academy/user/kalender/', { waitUntil: 'domcontentloaded' });
    await assertCalendar(page);
    await page.screenshot({ path: path.join(destination, '04_screenshot.png'), fullPage: true });
  } finally { await signedIn.close(); }
}
module.exports = { runDanielJourney };
