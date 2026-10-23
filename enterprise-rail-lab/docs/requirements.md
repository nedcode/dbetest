# Northstar Rail — Requirements & acceptance criteria

The application and all data are synthetic. Source of truth for tests is this document, not observations of the UI alone.

## Stories

**NRS-01 — Journey search.** All users (including anonymous) can view synthetic journeys including id, origin, destination, departure time, price and remaining seat inventory. Prices are calculated server-side in euro cents.

**NRS-02 — Authentication.** Fictional traveler accounts Alice and Bob can sign in. Support has read-only reporting access. Unknown passwords return `401 INVALID_CREDENTIALS`. Bearer tokens are signed and expire.

**NRS-03 — Booking.** Authenticated traveler can hold an available seat. Reservation starts `PENDING_PAYMENT`. Cannot force arbitrary price, override owner, create against an unknown journey or oversell; use 422, 404 and 409 accordingly.

**NRS-04 — Authorization.** Another traveler must not be able to view/pay a reservation they do not own (`403`). Support can see bookings across accounts but cannot book/pay/cancel as a traveler. Notifications must be isolated to the account owner.

**NRS-05 — Simulated payment and ticket.** Only synthetic `demo-approved` and `demo-declined` payment choices are accepted. Approved payment issues a ticket with `TKT-` identifier and one notification. Decline returns 402 and must not issue ticket or notification. Client-provided amounts are never trusted.

**NRS-06 — Idempotency.** Retrying a successful pay operation must not create a second charge or a second notification. Identical charge and ticket references are returned.

**NRS-07 — Cancellation.** Traveler may cancel a `PENDING_PAYMENT` reservation, releasing the inventory hold. A ticketed booking cannot be cancelled through this demo API (`409`).

**NRS-08 — Synthetic test data.** Tests run with fresh in-memory fixtures. Service processes bind to loopback, no external services or real transactions. Test reset endpoint is available only in this training environment.

## Risk analysis to expand with Planner

| Risk | Impact | Proposed extra test |
|---|---|---|
| Concurrent booking over-selling | Critical | Parallel hold race against one remaining seat |
| Payment approved but notification fails | High | Fault injection and retry compensation |
| Double requests from mobile clients | High | Idempotency with concurrent duplicate pay |
| Journey schedule timezone errors | Medium | Timezone and DST boundary tests |
| Role escalation / token leakage | Critical | Negative authorization and tampered token |
| Catalogue latency or outage | High | Timeout, circuit breaker, and recovery |

Some of these are intentionally **future tests**, not implemented in the initial portfolio version.
