const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Ignore empty or whitespace-only todo input', async ({ page }) => {
    // 1. Open the app in a fresh browser context and confirm the list is empty.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const remainingCount = page.getByText(/\d+ items? left/);

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);

    // 2. Submit empty and whitespace-only values and verify neither creates a todo.
    await todoInput.press('Enter');
    await expect(todoRows).toHaveCount(0);

    await todoInput.fill('   ');
    await todoInput.press('Enter');

    await expect(todoRows).toHaveCount(0);
    await expect(remainingCount).toHaveCount(0);
  });
});
