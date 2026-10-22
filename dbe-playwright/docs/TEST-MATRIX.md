# Test matrix

Test counts are generated from the code, not maintained by hand. From `dbe-playwright/`, run `npm run test:list` to inspect the full inventory, or `npx playwright test --list --grep @ci --grep-invert @external` to inspect the deterministic CI selection. Playwright's list includes each configured browser project, so one test definition may appear more than once.

| Suite | Target | Main assertions | Routine CI? |
| --- | --- | --- | --- |
| `01-public-homepage.spec.js` | Public DBE page | Reachability and visible body | No; `@external` |
| `02-daniel-login.spec.js` | Private DBE session | Manual-session journey and screenshots | No |
| `03-negative-login.spec.js` | Public DBE login form | Two low-volume rejection cases | No |
| `04-calendar.spec.js` | Private DBE session | Calendar grid and day-label sanity | No |
| `05-api.spec.js` | Local `/api/*` example | Basic HTTP contracts and errors | Yes |
| `06-domain.spec.js` | Local domain functions | Dates, event validation, authorization helper, risk mapping | Yes |
| `07-api-boundaries.spec.js` | Local `/api/*` example | Boundary values, malformed JSON `400`, valid invalid payload `422` | Yes |
| `08-accessibility.spec.js` | Public DBE page | Title and declared language | No; `@external` |
| `09-ai-evaluation.spec.js` | Offline oracle | Risk-classification mapping | Yes |
| `10-lab-api.spec.js` | Stateful `/lab/api/*` | Session revocation, ownership, conflict, audit, validation | Yes |
| `11-lab-ui.spec.js` | `/lab/` | User journey, sign-out revocation, visible errors, keyboard, axe checks and viewport behavior | Yes; Chromium desktop/mobile and Firefox |

The external page checks are intentionally small: a title and language attribute do not prove accessibility. The local lab's automated accessibility checks also need human review with a keyboard and assistive technology before anyone can claim accessibility compliance. No test in this matrix validates DBE's private API or authorizes testing it.

The root-level legacy Playwright/Python exercises in earlier Git revisions and the separate link-check workflow are outside this matrix. Older screenshots or reports are not evidence for the current CI run.
