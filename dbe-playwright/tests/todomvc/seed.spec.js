
const { test, expect } = require('@playwright/test');

test('seed: TodoMVC application', async ({ page }) => {
  await page.goto('https://demo.playwright.dev/todomvc/');

  await expect(
    page.getByPlaceholder('What needs to be done?')
  ).toBeVisible();
});
