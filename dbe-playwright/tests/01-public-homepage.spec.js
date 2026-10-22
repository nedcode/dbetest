const { test, expect } = require('@playwright/test');
test('@ci public DBE homepage loads', async ({ page }) => {
  await page.goto('https://www.dbe.academy/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/^https:\/\/www\.dbe\.academy\//);
  await expect(page.locator('body')).toBeVisible();
});
