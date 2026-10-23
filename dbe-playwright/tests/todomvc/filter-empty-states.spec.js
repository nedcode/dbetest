const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Show empty results when a filter has no matching todos', async ({ page }) => {
    // 1. Open the app and create one active todo.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const activeTodo = todoRows.filter({ hasText: 'Active only' });

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);
    await todoInput.fill('Active only');
    await todoInput.press('Enter');

    await expect(todoRows).toHaveCount(1);
    await expect(activeTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();

    // 2. Select Completed and verify no rows match without deleting the todo.
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todoRows).toHaveCount(0);
    await expect(page.getByText('1 item left')).toBeVisible();

    // 3. Select Active, then All, and verify the todo is preserved as active.
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todoRows).toHaveCount(1);
    await expect(activeTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();

    await page.getByRole('link', { name: 'All' }).click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(todoRows).toHaveCount(1);
    await expect(activeTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
  });
});
