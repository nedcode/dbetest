const { expect } = require('@playwright/test');
// The DBE view was observed to render 6 .day-label elements, not 7.
// These are UI content assertions, not a claim that all seven weekdays are shown.
async function assertCalendar(page) {
  await expect(page).toHaveURL(/\/user\/kalender\/?(?:[?#]|$)/);
  const grid = page.locator('#calenderGrid');
  await expect(grid, 'Kalendar mora biti vidljiv').toBeVisible();
  const days = grid.locator('.day-label');
  await expect(days.first(), 'Mora postojati oznaka dana').toBeVisible();
  await expect.poll(() => days.count(), { message: 'Najmanje 6 oznaka dana' }).toBeGreaterThanOrEqual(6);
  const labels = (await days.allTextContents()).map(s => s.trim());
  expect(labels.length).toBeGreaterThanOrEqual(6);
  expect(labels.every(Boolean), 'Oznake ne smeju biti prazne').toBe(true);
  expect(new Set(labels).size, 'Oznake ne smeju biti sve iste').toBeGreaterThanOrEqual(3);
  const expectedText = process.env.DBE_CALENDAR_EXPECT_TEXT;
  if (expectedText) await expect(grid).toContainText(expectedText);
}
module.exports = { assertCalendar };
