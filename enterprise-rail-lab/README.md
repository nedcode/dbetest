# Northstar Rail — Enterprise Quality Engineering Lab

**Synthetic portfolio exercise. Not affiliated with Deutsche Bahn, real train operators, or real payment providers.**

This runnable project expands beyond TodoMVC to an isolated, five-service booking workflow with a real browser UI. It demonstrates API contract tests, business-process E2E tests, authentication, role-based authorization, seat inventory, idempotency, a simulated payment provider, ticket issuance, notifications, test data control, and CI reporting.

## Quick start (Windows 11 / VS Code)

```powershell
cd C:\Users\delfu\enterprise-rail-lab
npm ci
npx.cmd playwright install chromium
npm run test:ci
npm start
```

Open **http://127.0.0.1:43910/** after `npm start`. Stop with Ctrl+C. Use Node.js 22+. All five services listen **only on 127.0.0.1**, never on the public network.

Demo identities (strictly synthetic): `alice@example.test`, `bob@example.test`, `support@example.test` with password `demo-pass`. These are deliberately public fixture credentials and **must never be used for any real environment**.

Try commands separately:

```powershell
npm run test:unit
npm run test:api
npm run test:security
npm run test:ui
npm run report
```

## Architecture

```text
Browser (Playwright) / APIRequestContext
                 |
       Gateway / static UI :43910
          /      |      \
  Identity   Catalog   Booking          <--- HTTP + signed user tokens
   :43911     :43912    :43913
                        /   \
                 Payments  Notifications <--- internal token, not gateway-exposed
                  :43914      :43915
```

- Identity issues short-lived HMAC-signed bearer tokens, derived from a random key generated each time the process group starts.
- Catalog enforces inventory holds for two fictional journeys.
- Booking service enforces ownership, roles, lifecycle transitions, price integrity and ticket issuance.
- Payment service is *only a simulation*: `demo-approved` or `demo-declined`; no real card details, funds or payment providers.
- Notifications service stores synthetic ticket notifications, filtered by account.
- Test-only reset endpoint (`/__test/reset`) is enabled **only on loopback** and only in `LAB_TEST_MODE=1`. Its fixture key is public, not a production secret. **Never deploy this lab server as-is.**
- State is ephemeral and in memory, with a single Playwright worker to keep fixture resets deterministic.

## Scenario coverage

| Layer | Coverage |
|---|---|
| API | Catalog contract, price authority, booking → payment → ticket → notification, sold-out, cancel/release, decline, idempotency, invalid transitions |
| Security | 401 anonymous; 403 cross-user; support role can't buy; forged tokens; internal payments not exposed; notification isolation |
| UI | Sign-in, booking, successful/declined payments, role restrictions, inventory sold-out |
| CI | Node 22 + Playwright Chromium, unit and functional tests, JUnit XML + HTML report artifact |

**Non-goals / limits:** no database, no real network faults, no queues, no distributed tracing, no production-grade token issuer or payments. These should be added in future phases rather than represented as already supported.

## Suggested AI agent exercise

1. **Planner:** use `/docs/requirements.md` as the source of truth; propose negative scenarios and an impact-based risk matrix.
2. **Generator:** produce one new test against the real UI or API using Playwright Test MCP, with assertions tied to requirements.
3. **Healer:** investigate failed tests without changing required behavior or watering down assertions.
4. **Code review:** explicitly verify tests check business rules rather than DOM only. Run CI without AI model calls.

## Security boundary

All data is fictional. No real credentials are stored, and no browser auth state, screenshots, traces or secrets are committed. CI runs on a clean runner. This is a learning architecture, not a deployment blueprint for a regulated institution.
