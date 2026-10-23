# Architecture and engineering decisions

This is **an educational simulation**, not the internal architecture of Deutsche Bahn or any real rail operator.

## Request flow

1. Browser talks to a single local gateway (`127.0.0.1:43910`), including the UI and same-origin `/api/*` routes.
2. Identity service verifies synthetic credentials, issuing an HMAC-signed, short-lived bearer token.
3. Catalog provides two fictional journeys and manages seat holds.
4. Booking enforces owner/role/state/price rules, calls catalog for holds, then calls the simulated payments and notifications services.
5. Notification data is filtered on the server according to the identity token.

## Test pyramid and controls

- **Node unit** tests verify authentication token signing, tamper detection, and expiry.
- **API contract / integration** tests cross actual HTTP process boundaries and assert status codes, error contracts, state transitions, idempotency and inventory.
- **Security** tests assert negative authorization, cross-user isolation and gateway exposure.
- **UI E2E** tests exercise the *real local application* in Chromium with role-based accessible locators.
- **Playwright Test** is deterministic: no model, Planner, Generator, or Healer is needed during CI runs.
- Each Playwright test resets all ephemeral state through a test-only endpoint; `workers: 1` protects this fixture model from races. Distributed test isolation is a future exercise.

## Enterprise migration path

| Lab component | Enterprise counterpart |
|---|---|
| Public demo users | Corporate OIDC, test tenants, least-privilege roles |
| In-memory services | Database-backed services with contracts and migrations |
| `demo-approved` payment | PCI-compliant sandbox with tokenized payment methods |
| Simple HTTP calls | API gateway, service mesh, tracing, queues |
| Test-only reset | Test Data Management with isolated namespaces |
| Playwright runner | GitLab CI / Jenkins runners, Allure / JUnit, Jira/Xray |
| MCP Planner / Generator / Healer | Approved model and tooling with tool-scoped permission boundaries |

## Source-of-truth and review

Use `docs/requirements.md` to decide correctness. Test generation from a browser snapshot must **not invent fare or reservation rules**. The QA reviewer confirms requirements, test data and expected outcomes. Healer should only fix tooling/locators if application behavior still matches requirements; a real defect must not be suppressed.

## Known limitations and planned advanced exercises

- Concurrent reservations against scarce inventory need dedicated contention tests and transactional locking.
- Failure after payment approval but before notifying requires outbox/retry semantics.
- This synthetic authentication is intentionally not an enterprise identity provider.
- No secrets management, rate limiting, persistent database, distributed tracing, or service resilience policies are provided.
- No real payment card handling, personal travel history or production operations.
- Test-only fixture key is public; test server is bound to localhost and must not be deployed externally.
