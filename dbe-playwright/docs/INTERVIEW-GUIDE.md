# Senior QA / Test Manager interview guide

## Explain in 90 seconds
I built a Playwright portfolio combining a live public smoke test with a deterministic local API lab. I separated real third-party testing from simulated banking-like workflows, enforced CI gates, tracked risk coverage and documented the limits of each result. I used AI assistance, then reviewed and validated the resulting assertions and security controls.

## Questions
1. Why do local API tests not certify DBE production? They exercise a separate simulation, not the production service.
2. How do you prioritize? Critical authorization and integrity controls precede UI cosmetics.
3. What is the release decision on a critical authorization defect? No-go, with evidence and owner.
4. How do you distinguish flaky from product defect? Reproduce, compare traces and deterministic fixtures.
5. What are the limitations? No real DBE backend contract, no authorized penetration or load test, no DBE test accounts in CI.
6. How would you scale? Versioned API contracts, ephemeral test environments, seeded DB fixtures, test data ownership, metrics and approvals.

## Honesty checklist
Never claim this is a commissioned enterprise project, production certification, or that mock tests cover the real DBE backend.
