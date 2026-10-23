const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Delete a completed todo', async ({ page }) => {
    // 1. Open the app, add two todos, and mark Completed task complete.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const completedTodo = todoRows.filter({ hasText: 'Completed task' });
    const activeTodo = todoRows.filter({ hasText: 'Active task' });

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);
    await todoInput.fill('Completed task');
    await todoInput.press('Enter');
    await todoInput.fill('Active task');
    await todoInput.press('Enter');

    await expect(todoRows).toHaveCount(2);
    await completedTodo.getByRole('checkbox').check();
    await expect(completedTodo.getByRole('checkbox')).toBeChecked();
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();

    // 2. Delete Completed task and verify Active task remains unchanged.
    await completedTodo.hover();
    await completedTodo.getByRole('button', { name: 'Delete' }).click();

    await expect(completedTodo).toHaveCount(0);
    await expect(activeTodo).toHaveCount(1);
    await expect(activeTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
  });
});
