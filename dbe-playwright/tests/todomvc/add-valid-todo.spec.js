const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Add Valid Todo', async ({ page }) => {
    // 1. Open the demo and confirm the page starts with no todos.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoItems = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    await expect(todoInput).toBeVisible();
    await expect(todoItems).toHaveCount(0);

    // 2. Add Learn Playwright MCP and submit it with Enter.
    await todoInput.fill('Learn Playwright MCP');
    await todoInput.press('Enter');

    await expect(todoItems).toHaveCount(1);
    await expect(todoItems.filter({ hasText: 'Learn Playwright MCP' })).toHaveCount(1);
    await expect(todoInput).toHaveValue('');
    await expect(page.getByText('1 item left')).toBeVisible();
  });
});
