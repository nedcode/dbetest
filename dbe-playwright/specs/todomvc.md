# TodoMVC functional test plan

## Application Overview

Functional test plan for the React TodoMVC demo at https://demo.playwright.dev/todomvc/. The observed accessibility snapshot exposes a todo-entry textbox, todo list with completion checkboxes and delete buttons, remaining-item count, and All, Active, and Completed filters. Each test must start independently with a fresh browser context and empty todo list; do not depend on ordering or persisted state from another scenario. Pass only when every stated expected outcome is observed; fail if the UI does not match or an action affects the wrong todo.

## Test Scenarios

### 1. Todo lifecycle and filtering

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a todo using Enter

**File:** `tests/todomvc/add-todos.spec.js`

**Steps:**
  1. Open https://demo.playwright.dev/todomvc/ in a fresh browser context and confirm the todo list is empty.
    - expect: The page title is React • TodoMVC and the heading is todos.
    - expect: The textbox named What needs to be done? is available.
    - expect: No todo list items are present; this test starts from a blank state.
  2. Enter Learn Playwright MCP in the todo textbox and press Enter.
    - expect: A single todo named Learn Playwright MCP appears in the list.
    - expect: The textbox is cleared after submission.
    - expect: The remaining count shows 1 item left.

#### 1.2. Ignore empty or whitespace-only todo input

**File:** `tests/todomvc/add-todos-validation.spec.js`

**Steps:**
  1. Open the app in a fresh browser context and confirm the list is empty.
    - expect: The list contains no todo items.
  2. Submit the empty todo textbox with Enter, then enter only spaces and submit with Enter.
    - expect: Neither submission creates a todo.
    - expect: The list remains empty and no remaining-item count or todo row is displayed.
    - expect: Pass if the UI rejects blank input without adding a task; fail if a blank/whitespace task appears.

#### 1.3. Complete and reactivate a todo

**File:** `tests/todomvc/complete-todos.spec.js`

**Steps:**
  1. Open the app in a fresh browser context and create two distinct todos: Learn Playwright MCP and Learn AI Test Agents.
    - expect: Both named todos appear once and the remaining count is 2 items left.
  2. Check the completion checkbox associated with Learn Playwright MCP.
    - expect: Learn Playwright MCP is marked completed (its checkbox is checked and completed styling is shown).
    - expect: Learn AI Test Agents remains active and unchecked.
    - expect: The remaining count decreases to 1 item left.
  3. Uncheck the completion checkbox for Learn Playwright MCP.
    - expect: Learn Playwright MCP becomes active and unchecked again.
    - expect: Both todos are active and the remaining count returns to 2 items left.

#### 1.4. Delete an active todo without affecting another item

**File:** `tests/todomvc/delete-todos.spec.js`

**Steps:**
  1. Open the app in a fresh browser context and add two todos, Delete this task and Keep this task.
    - expect: Both todos appear and the remaining count is 2 items left.
  2. Reveal and activate the Delete control for the Delete this task row.
    - expect: Delete this task is removed from the list.
    - expect: Keep this task remains visible and active.
    - expect: The remaining count updates to 1 item left.
    - expect: Pass only if the selected row is removed and the other row is unchanged.

#### 1.5. Delete a completed todo

**File:** `tests/todomvc/delete-completed-todos.spec.js`

**Steps:**
  1. Open the app in a fresh browser context, add Completed task and Active task, and mark Completed task complete.
    - expect: Completed task is checked and Active task is unchecked.
    - expect: The remaining count shows 1 item left.
  2. Activate the Delete control for the Completed task row.
    - expect: Completed task is removed from the list.
    - expect: Active task remains visible and unchecked.
    - expect: The remaining count remains 1 item left.

#### 1.6. Filter active, completed, and all todos

**File:** `tests/todomvc/filter-todos.spec.js`

**Steps:**
  1. Open the app in a fresh browser context, add Active alpha and Complete beta, and mark only Complete beta as complete.
    - expect: Both todos are present in the All view.
    - expect: Active alpha is unchecked; Complete beta is checked.
    - expect: The remaining count shows 1 item left.
  2. Select the Active filter.
    - expect: Only Active alpha is displayed.
    - expect: Complete beta is not displayed in the Active view.
    - expect: The Active filter is selected.
  3. Select the Completed filter.
    - expect: Only Complete beta is displayed.
    - expect: Active alpha is not displayed in the Completed view.
    - expect: The Completed filter is selected.
  4. Select the All filter.
    - expect: Both todos are displayed again with their original completion states.
    - expect: The All filter is selected.
    - expect: Filtering does not change the total todo data or remaining count.

#### 1.7. Show empty results when a filter has no matching todos

**File:** `tests/todomvc/filter-empty-states.spec.js`

**Steps:**
  1. Open the app in a fresh browser context and create one active todo named Active only.
    - expect: Active only is visible in the All view and the remaining count is 1 item left.
  2. Select Completed.
    - expect: No todo rows are displayed because there are no completed todos.
    - expect: The filter remains usable and the todo has not been deleted.
  3. Select Active, then select All.
    - expect: Active only appears in both views.
    - expect: Returning to All preserves the todo and its active state.
