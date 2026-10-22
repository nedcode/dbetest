# DBE Academy Playwright QE project

Playwright UI/API training project. This folder lives beside the existing DBE link-checker code in nedcode/dbetest.

## Setup
- Node.js 22 or newer
- cd dbe-playwright
- npm ci
- npx playwright install chromium
- npm run test:ci (public DBE homepage + local mock API)
- npm run test:api (9 local API contract tests)
- npm run test:negative (2 low-volume live negative login tests; manual/local only)

## DBE authenticated scenarios
Run npm run auth:save, sign in **manually** in the opened Chromium window, press ENTER once dashboard is visible.
This writes playwright/.auth/user.json (PRIVATE, never commit). Then run:
- npm run test:calendar
- npm run test:daniel (4 private screenshots)
- npm run screenshots

The original tutorial's a.authLogin button was hidden at 600px; navigation to /auth/login/ is used.
The current dashboard is /user/lernwelt/dashboard/. Calendar tests validate 6 day-label elements as observed.
They are smoke/content checks, NOT proof of all seven weekdays or event correctness.
Optionally configure DBE_CALENDAR_EXPECT_TEXT in the local environment for one known event.

## CI and reporting
The root workflow .github/workflows/dbe-playwright.yml runs npm ci, Chromium, and npm run test:ci
from this subfolder on push, PR or manual dispatch, and uploads HTML/JUnit reports.
Authenticated scenarios never run in GitHub Actions.
API tests use a LOCAL MOCK, not real undocumented DBE endpoints.

## Credentials/security
Never publish .env, playwright/.auth/user.json, screenshots or trace reports from a signed-in session.
A previous report exposed credentials. Rotate that password if not already done.
Run npm run security:check before committing. Files listed in .gitignore are not automatically removed from Git history.
