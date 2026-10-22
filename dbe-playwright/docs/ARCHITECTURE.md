# QE Lab Architecture

```mermaid
flowchart LR
  GH[GitHub Actions] --> PW[Playwright runner]
  PW --> UI[Public DBE smoke]
  PW --> LAB[Local QE Lab REST server]
  PW --> DOM[Domain unit tests]
  PW --> REP[HTML + JUnit reports]
  LAB --> VAL[Validation + authorization]
  LAB --> AUD[In-memory audit trail]
  REP --> GATE[Release decision]
```

The lab is in-memory and stateless across CI runs; it is not an actual banking platform. No production credentials are sent to GitHub Actions.

## Engineering tradeoffs
- Small in-memory server: predictable training fixture, no database dependency.
- Independent domain functions: easy to unit test without browser.
- Explicit negative cases: demonstrate risk coverage.
- No external LLM calls in CI: reproducibility and zero API-key exposure.
