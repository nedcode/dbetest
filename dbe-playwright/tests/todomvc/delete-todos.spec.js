const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Delete an active todo without affecting another item', async ({ page }) => {
    // 1. Open the app in a fresh browser context and add two active todos.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const deleteTodo = todoRows.filter({ hasText: 'Delete this task' });
    const keepTodo = todoRows.filter({ hasText: 'Keep this task' });

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);
    await todoInput.fill('Delete this task');
    await todoInput.press('Enter');
    await todoInput.fill('Keep this task');
    await todoInput.press('Enter');

    await expect(todoRows).toHaveCount(2);
    await expect(deleteTodo).toHaveCount(1);
    await expect(keepTodo).toHaveCount(1);
    await expect(page.getByText('2 items left')).toBeVisible();

    // 2. Reveal and activate Delete for the selected row, preserving the other todo.
    await deleteTodo.hover();
    await deleteTodo.getByRole('button', { name: 'Delete' }).click();

    await expect(deleteTodo).toHaveCount(0);
    await expect(keepTodo).toHaveCount(1);
    await expect(keepTodo.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
  });
});
