# Reusable Playwright AI agent prompts

## Planner

Read `docs/requirements.md` as the business source of truth. Use the running app at `http://127.0.0.1:43910` only as supporting evidence. Write a risk-based plan for NRS-03 through NRS-07 to `specs/rail-booking-plan.md`, including positive and negative cases, test data, roles, HTTP status and assertions. Do not infer requirements from UI behavior. Do not change test files.

## Generator

Generate **one** Playwright test from `specs/rail-booking-plan.md` into `tests/generated/`. Use the Playwright Test MCP workflow: generator_setup_page → browser tools → generator_read_log → generator_write_test. Reuse API-first fixtures and verify both business state and user-visible state. Do not change application code, credentials, or original tests.

## Healer

Investigate the specified failing Playwright test and attach root-cause evidence from Playwright runner/traces. Never skip assertions or change expected business results to obtain a pass; treat real product behavior deviations as defects. Patch only the failing generated test when it's a locator or test setup issue, then rerun affected and full suites.

## Reviewer gate

Document test coverage mapped to requirement IDs, change diff, actual run results, and residual risks. No AI-generated code may merge before human review of business assertions.
