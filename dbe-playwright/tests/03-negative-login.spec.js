const { test, expect } = require('@playwright/test');
// Live login attempts are excluded from CI. Never run this suite at high frequency.
test.describe('Negative live DBE login @live-login', () => {
  test.use({ storageState: { cookies: [], origins: [] }, screenshot: 'off', trace: 'off', video: 'off' });
  test('Empty form does not open dashboard', async ({ page }) => {
    await page.goto('https://www.dbe.academy/auth/login/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await page.locator('#loginform input[type="submit"]').click();
    await expect(page).toHaveURL(/\/auth\/login\/?(?:[?#]|$)/);
  });
  test('Deliberately invalid demo credentials are rejected', async ({ page }) => {
    await page.goto('https://www.dbe.academy/auth/login/', { waitUntil: 'domcontentloaded' });
    await page.locator('input[name="identifier"]').fill('no-such-user-automated@example.invalid');
    await page.locator('input[name="password"]').fill('deliberately-invalid-demo-only');
    await page.locator('#loginform input[type="submit"]').click();
    await expect(page).toHaveURL(/\/auth\/login\/?(?:[?#]|$)/);
  });
});
