# Test strategy

## System boundaries

There are two different systems in this portfolio:

1. **QE Lab:** a synthetic UI and API served on localhost. Its accounts, events, permissions and audit entries are controlled test data. The lab is the deterministic CI target and is not a DBE backend.
2. **Public DBE Academy pages:** a small set of non-invasive smoke checks. They are marked `@external` and run only when explicitly selected. Optional signed-in exercises require manual local authentication and never run in CI.

Tutorial exercises in earlier root-level Git revisions and the current separate link checker are outside the Playwright release gate. A green local lab run cannot certify DBE production behavior.

## Risk and evidence

| Risk | Priority in the lab | Automated evidence | Remaining limit |
| --- | --- | --- | --- |
| Unauthorized access to another user's event | Critical | API tests for unauthenticated and cross-user requests; UI role checks | Synthetic roles and in-memory tokens only |
| Invalid event date or title | High | Domain boundaries and API validation responses | No production DBE data contract |
| Duplicate event submission | High | Conflict response and visible UI feedback | Single-process state, no concurrent database transaction |
| Incorrect visible event state | Medium | Create/list flow in the local UI plus API readback and details | Local demo UI only |
| Unusable keyboard or inaccessible feedback | Medium | Semantic UI, keyboard interaction and automated accessibility checks | Manual assistive-technology review still needed |
| Missing audit event for a denied read or conflict | High | API and UI inspection of the local audit feed | In-memory demonstration, not a durable compliance log |
| Public site unavailable or changed | External dependency | Separately triggered public smoke checks | Not a local-lab product defect |

## Test layers

- **Domain:** date, title, authorization helper and risk classification boundaries without HTTP.
- **API:** response codes, payloads, invalid JSON versus valid but invalid data, authentication and token revocation, role checks, duplicate handling and audit behavior in the local lab. Existing `/api/*` examples remain separate from the stateful `/lab/api/*` workflow.
- **UI:** a synthetic user journey through sign-in, event creation, in-process API readback, conflict feedback and audit visibility. Browser projects check a narrow and a wide viewport.
- **Public external smoke:** homepage reachability and basic document metadata. These checks are not an accessibility audit or full DBE regression suite.
- **Optional live exercises:** limited login/calendar checks with a manually saved local session. No real password is entered into scripts or GitHub Actions; the optional tests use private session state locally.
- **Offline AI exercise:** fixed examples evaluate a risk-classification oracle. No model is called.

Assertions use observable state and independent expectations where possible. Each stateful test resets the local fixture so results do not depend on test order. The test matrix gives the suite-level inventory.

## Gate and failure handling

The GitHub Actions gate first checks tracked paths with `npm run security:check`, then runs `npm run test:ci` for this **training lab**. The test command needs no real DBE credentials and rejects `test.only` in CI. Tests have no automatic retries. Investigate failures using the HTML/JUnit report and retained trace, reproduce locally, and classify product, test or environment causes before changing assertions. External checks run separately because third-party availability should not make the deterministic gate flaky.

For a hypothetical product release, a critical authorization or integrity failure would block release pending triage. This repository does not make an actual DBE or regulated-system release decision.

## Deliberate limits

The lab has no production backend, durable database, real identity provider or multi-process concurrency. It does not establish real-world security, performance, accessibility compliance or audit retention. There is no authorized DBE penetration, load or private API testing. Those need an agreed environment, contracts, test data and owners before implementation.
