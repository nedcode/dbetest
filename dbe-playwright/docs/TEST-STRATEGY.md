# Quality Engineering Test Strategy

## Scope and boundaries
The real DBE Academy is third-party software. The public UI smoke test is non-invasive; authenticated scenarios run locally with manual sign-in. No scanning, load testing, account enumeration, or undocumented API access against DBE.

The **QE Lab** is a controlled, deterministic local simulation used to demonstrate architecture, boundary testing, risk-based testing, accessibility, security controls and API contracts. It is not the DBE production backend.

## Risk register
| Risk | Severity | Coverage | Release decision |
| --- | --- | --- | --- |
| Unauthorized event access | Critical | API auth contract | Block |
| Invalid calendar dates accepted | High | boundary tests | Block |
| Duplicate booking | High | conflict API | Block |
| Incorrect calendar rendering | Medium | local UI | Investigate |
| Poor keyboard accessibility | Medium | semantic UI checks | Fix before broad release |
| Missing audit trail | High | audit API | Block regulated release |
| Flaky external public website | Low | isolated smoke | Retry investigation, never silently waive |

## Test pyramid
- Unit/domain tests: deterministic rules without HTTP.
- Contract/API: HTTP behavior, error codes, validation, idempotency and authorization in local lab.
- UI: semantic navigation and visible states in local lab.
- DBE live: only consented, limited local functional smoke scenarios.

## Test design
Use equivalence classes, boundaries, negative tests, state transitions, risk-based priorities, and explicit oracles. Mock API tests do not count as production coverage.

## Release gate
No critical failures; all local API/domain checks green; no tracked secrets; document external live tests as unverified if not run. A green CI run does not certify the real DBE site.

## Flakiness policy
Do not raise timeouts just to mask failures. Capture trace for CI failures, reproduce deterministically, identify environmental vs product causes. No silent retries.

## Ownership
A human reviews test intent, test oracle, changes to permissions, and release decision.
