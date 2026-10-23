const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Filter active, completed, and all todos', async ({ page }) => {
    // 1. Open the app, add two todos, and complete only Complete beta.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const activeTodo = todoRows.filter({ hasText: 'Active alpha' });
    const completedTodo = todoRows.filter({ hasText: 'Complete beta' });
    const remainingCount = page.getByText('1 item left');

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);
    await todoInput.fill('Active alpha');
    await todoInput.press('Enter');
    await todoInput.fill('Complete beta');
    await todoInput.press('Enter');
    await completedTodo.getByRole('checkbox').check();

    await expect(todoRows).toHaveCount(2);
    await expect(activeTodo).toHaveCount(1);
    await expect(completedTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(completedTodo.getByRole('checkbox')).toBeChecked();
    await expect(remainingCount).toBeVisible();

    // 2. Select Active and verify only Active alpha is displayed.
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page).toHaveURL(/#\/active$/);
    await expect(todoRows).toHaveCount(1);
    await expect(activeTodo).toHaveCount(1);
    await expect(completedTodo).toHaveCount(0);

    // 3. Select Completed and verify only Complete beta is displayed.
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page).toHaveURL(/#\/completed$/);
    await expect(todoRows).toHaveCount(1);
    await expect(completedTodo).toHaveCount(1);
    await expect(activeTodo).toHaveCount(0);

    // 4. Return to All and verify both todos and their original states.
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(todoRows).toHaveCount(2);
    await expect(activeTodo).toHaveCount(1);
    await expect(completedTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(completedTodo.getByRole('checkbox')).toBeChecked();
    await expect(remainingCount).toBeVisible();
  });
});
