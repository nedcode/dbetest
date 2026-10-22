# Offline AI evaluation exercise

`scripts/evaluate-ai.cjs` is a **fixture-driven example**, not an evaluation of a real AI system. It compares five fixed model-like outputs to separately specified risk decisions. One fixture deliberately disagrees with the expected blocking decision, so the report demonstrates both an exact-match score and a false-approval count. Run it with `node scripts/evaluate-ai.cjs` to inspect the JSON output. Its exit code checks that the reference labels agree with the domain oracle; a zero exit code does **not** mean every simulated output was correct.

`tests/09-ai-evaluation.spec.js` tests the five risk-classification rules in `lib/qe-domain.cjs`. It does not invoke the evaluator script or an LLM. Neither component measures model accuracy, robustness, prompt-injection resistance or production safety.

A real evaluation would need a consented and versioned dataset, recorded model versions and prompts, independent annotation, explicit pass criteria, held-out and adversarial cases, privacy review, and ongoing drift, latency and cost measurements. Human owners would review false approvals before any release decision.
