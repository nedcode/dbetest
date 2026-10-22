# Playwright quality engineering portfolio

This project demonstrates a risk-based Playwright test suite around a **controlled local QE Lab**. It also keeps a few explicitly separate checks of public DBE Academy pages and optional local-only exercises with a manually saved DBE session. The lab is a synthetic application, not the DBE backend. Its passing tests are evidence about this repository's code only.

## Setup and reliable test run

Use Node.js 22 or newer. From the repository root:

```sh
cd dbe-playwright
npm ci
npx playwright install chromium firefox
npm run security:check
npm run test:ci
```

Playwright starts the local server automatically. The `test:ci` suite does not need a DBE account and excludes third-party pages. Run `npm run test:list` for the current inventory; the [test matrix](docs/TEST-MATRIX.md) explains what each suite covers. The HTML and JUnit reports are generated under ignored local directories. Failure traces are retained for diagnosis.

To inspect the synthetic application yourself, start `node scripts/mock-api-server.cjs` and open `http://127.0.0.1:43871/lab/`. The page shows fictional example users and a shared demo password. Those are test fixtures, not DBE accounts. Stop the server with Ctrl+C when finished.

## What is tested

| Area | Evidence | Boundary |
| --- | --- | --- |
| Domain rules | Date and title boundaries, simple ownership rule, risk classification | Pure local functions |
| Basic REST contracts | `/api/*` response shape and status, including malformed JSON `400` versus valid invalid event `422` | Stateless local example |
| Stateful lab API | Synthetic sign-in/sign-out with token revocation, event ownership, creation/readback, conflict, audit feed | In-memory local implementation |
| Lab UI | End-to-end user flow and sign-out, error feedback, keyboard behavior, responsive layouts, automated accessibility checks | Synthetic browser UI; not DBE |
| Offline AI exercise | Fixed expected risk labels | No model is invoked or benchmarked |

See [strategy](docs/TEST-STRATEGY.md), [architecture](docs/ARCHITECTURE.md), [AI evaluation limits](docs/AI-EVALUATION.md) and [interview guide](docs/INTERVIEW-GUIDE.md) for design choices and limits.

## External DBE exercises

`npm run test:external` explicitly runs the small public-page smoke selection. It requires network access and can fail because the external site changes or is unavailable. It is separate from the deterministic push/PR CI gate. `npm run test:negative` runs two low-volume live negative-login cases locally only; use it only when that activity is appropriate.

For an account you are authorized to use, `npm run auth:save` opens Chromium for **manual** sign-in. After the dashboard appears, press Enter in the terminal. The saved session is private at `playwright/.auth/user.json`. Then `npm run test:calendar`, `npm run test:daniel`, or `npm run screenshots` can exercise the account locally. The latter two produce private screenshots in `screenshots/`; never upload them. The calendar assertions check visible grid and day-label sanity, not full calendar correctness. `DBE_CALENDAR_EXPECT_TEXT` can optionally require one known event label.

## CI and data safety

The root GitHub Actions workflow installs locked dependencies and browsers, checks tracked paths, runs the local `test:ci` selection and uploads generated HTML/JUnit evidence. Public DBE checks are available through a separate manual workflow run. No DBE account credential is supplied to CI.

Do not commit `.env`, a saved session, signed-in screenshots, traces or private reports. `npm run security:check` catches known tracked sensitive paths, but cannot inspect every possible secret or erase Git history. An earlier report contained account information; whether any affected password was rotated must be verified by the account owner before sharing historical material.
