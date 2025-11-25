# Security Summary — ChangeradarAI

## Threat Model
1. API Key Leakage
   - Mitigation: Keys stored only in backend env vars, never exposed to UI.

2. Prompt Injection
   - Mitigation: Strict system prompt + JSON-only output enforced.

3. Sensitive Data Exposure
   - Mitigation: Only synthetic or public repo data used. No PII.

## Dependency Vulnerability Scan (Summary)
- Python (`pip-audit`): No critical vulnerabilities found.
- Node (`npm audit`): No high/critical issues in React/Vite stack.

## Prompt Safety Testing
- Tested against attempts to break JSON output.
- Tested against hallucination prompts.
- No unsafe behaviors detected within project scope.
