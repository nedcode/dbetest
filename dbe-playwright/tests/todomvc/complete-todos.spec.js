const { test, expect } = require('@playwright/test');

test.describe('Todo lifecycle and filtering', () => {
  test('Complete and reactivate a todo', async ({ page }) => {
    // 1. Open the app in a fresh browser context and create two distinct todos.
    await page.goto('https://demo.playwright.dev/todomvc/');
    await expect(page).toHaveTitle('React • TodoMVC');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();

    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    const todoRows = page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
    const playwrightTodo = todoRows.filter({ hasText: 'Learn Playwright MCP' });
    const agentsTodo = todoRows.filter({ hasText: 'Learn AI Test Agents' });

    await expect(todoInput).toBeVisible();
    await expect(todoRows).toHaveCount(0);
    await todoInput.fill('Learn Playwright MCP');
    await todoInput.press('Enter');
    await todoInput.fill('Learn AI Test Agents');
    await todoInput.press('Enter');

    await expect(todoRows).toHaveCount(2);
    await expect(playwrightTodo).toHaveCount(1);
    await expect(agentsTodo).toHaveCount(1);
    await expect(page.getByText('2 items left')).toBeVisible();

    // 2. Complete Learn Playwright MCP and verify the other todo stays active.
    const playwrightCheckbox = playwrightTodo.getByRole('checkbox');
    const agentsCheckbox = agentsTodo.getByRole('checkbox');
    await playwrightCheckbox.check();

    await expect(playwrightCheckbox).toBeChecked();
    await expect(playwrightTodo).toHaveClass(/completed/);
    await expect(agentsCheckbox).not.toBeChecked();
    await expect(agentsTodo).not.toHaveClass(/completed/);
    await expect(page.getByText('1 item left')).toBeVisible();

    // 3. Reactivate Learn Playwright MCP and verify both todos are active.
    await playwrightCheckbox.uncheck();

    await expect(playwrightCheckbox).not.toBeChecked();
    await expect(playwrightTodo).not.toHaveClass(/completed/);
    await expect(agentsCheckbox).not.toBeChecked();
    await expect(agentsTodo).not.toHaveClass(/completed/);
    await expect(page.getByText('2 items left')).toBeVisible();
  });
});
