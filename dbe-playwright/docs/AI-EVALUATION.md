# Offline AI-evaluation demonstration

The fixture-driven evaluator in `scripts/evaluate-ai.cjs` checks model-like outputs against independently specified expected labels. It does not call an LLM, measure a real model's accuracy, or claim protection from prompt injection. Replace fixtures with a consented, versioned dataset and actual model outputs to evaluate an AI system.

Metrics: exact-match task success, false approval count, and per-case explanation. A real deployment also needs human review, drift monitoring, privacy tests, cost/latency and adversarial testing.
