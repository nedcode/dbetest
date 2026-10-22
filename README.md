# DBE testing portfolio

This repository contains a current Playwright quality engineering project in [`dbe-playwright/`](dbe-playwright/) and a separate root-level link checker. Earlier Git revisions also contain tutorial exercises. The current project has a **local QE Lab** and separately selectable, read-only smoke checks of public DBE Academy pages. The lab's API, accounts, events, audit entries and UI are synthetic. A passing lab test says nothing about DBE's private systems.

## Run the current project

Use Node.js 22 or newer. From a fresh clone:

```sh
cd dbe-playwright
npm ci
npx playwright install chromium firefox
npm run security:check
npm run test:ci
```

The CI command runs deterministic local lab, domain and offline evaluation checks. It does not contact DBE. Public DBE smoke checks are tagged `@external` and run only when explicitly requested with `npm run test:external` or a manual workflow dispatch. The local lab uses the server started by Playwright and requires no DBE account. `npm run test:list` shows the exact test inventory without running it. After installing the subproject dependencies, `npm test` at the repository root runs the same `test:ci` command.

See the [project guide](dbe-playwright/README.md), [test matrix](dbe-playwright/docs/TEST-MATRIX.md), [strategy](dbe-playwright/docs/TEST-STRATEGY.md), and [architecture](dbe-playwright/docs/ARCHITECTURE.md) for the covered behavior and limits.

## Repository boundaries

| Area | Purpose | Automated in current Playwright CI? |
| --- | --- | --- |
| `dbe-playwright/tests/` | Current deterministic local lab, domain and offline evaluation exercises | Yes, for local tests tagged `@ci` |
| Public DBE smoke checks | Limited checks of public pages | Manual external run only |
| `dbe-playwright/tests/02-*`, `03-*`, `04-*` | Optional live DBE account/login exercises | No |
| Root `link-checker.js` | Separate link checking exercise | Separate command/workflow |
| Earlier Git revisions | Historical tutorial tests and generated evidence | No |

The historical exercises are not the supported release gate; do not treat their earlier reports as current test evidence. The root `npm run check:links` command uses root dependencies (`npm ci` at the root) and contacts external pages.

## Privacy and evidence

Do not commit passwords, `.env` files, saved sessions, signed-in screenshots, traces, or private reports. Run `npm run security:check` in `dbe-playwright/` before publishing changes. That check detects known sensitive tracked paths; it cannot prove that every file or Git history is free of secrets. Historical Git copies may still contain old exercise material. If an account password was ever published, its owner must verify that it was rotated.
