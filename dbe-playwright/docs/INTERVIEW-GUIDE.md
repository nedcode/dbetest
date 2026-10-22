# Portfolio interview guide

## A 90-second explanation

"This repository has a deterministic Playwright test suite for a synthetic local application. I use a domain layer, API checks and browser journeys to show how I choose assertions from authorization, data-integrity and usability risks. The lab demonstrates a member creating an event, reading it back, encountering a duplicate conflict and inspecting the audit trail. CI runs the local suites; public DBE smoke checks are explicitly separate because the third-party site can change. The README and matrix state which evidence applies only to the lab."

If AI assistance was used, describe the actual contribution and the human review you performed. The offline AI fixture is an evaluation *exercise*, not evidence of testing a deployed model.

## Demonstration path

1. Show the [test strategy](TEST-STRATEGY.md) and name the highest-priority risks.
2. Run `npm run test:ci`, then open the generated report. Point to both a successful journey and a negative authorization/validation assertion.
3. Open `/lab/` and repeat the member event journey. Show that a second submission is rejected and the visible state agrees with the API response.
4. Explain fixture reset, browser coverage, accessibility checks and why a local in-memory implementation has limits.
5. Show the separate external command and optional signed-in tests without displaying private account data or reports.

## Questions to prepare for

| Question | Evidence-led answer |
| --- | --- |
| Does green CI certify DBE? | No. CI targets a synthetic local service. Public DBE checks are a separate, narrow smoke run. |
| Why API and UI layers? | API tests localize contracts and edge cases; UI tests prove that the user can complete and observe a coherent flow. |
| What happens on unauthorized access? | The lab checks authentication and ownership at the API boundary. A comparable production defect would block release pending triage. |
| Is the audit feed compliance-ready? | No. It is in memory and disappears when the server stops. Durable, tamper-evident records need a real architecture and review. |
| Is a duplicate check enough under load? | No. A production service needs a database uniqueness or transaction strategy and concurrency tests. |
| Is the app accessible? | Automated and keyboard checks catch selected problems; manual assistive-technology testing is still required. |
| What would you add in a real team? | Versioned contracts, controlled environments, seeded and owned data, cross-service observability, defect triage, release criteria and metrics tied to product risk. |

This is a self-directed demonstration. Do not present it as commissioned enterprise work, production certification, or coverage of DBE's private backend. Describe your real professional experience separately.
