⭐ 1. Model & LLM Processing Limitations
1.1 Not a static analysis engine

ChangeradarAI relies on Llama 3.3 for reasoning.
It does not perform true AST-level code analysis.
LLMs may:

Miss edge-case endpoints

Infer/guess missing routes

Misinterpret complex routing patterns

Struggle with dynamically built endpoints

1.2 Hallucination risk

Even with JSON constraints, LLMs can:

Invent non-existent endpoints

Misidentify risk severity

Produce ambiguous dependency links

A human reviewer should always validate recommendations.

1.3 Performance depends on prompt size

Very large repositories or deeply nested directories may:

Increase latency

Exceed the model’s context window

Reduce response accuracy

1.4 Model cannot “see” private/internal history

It knows only what is provided in:

The story

Extracted repo metadata

Dependency scan

It does not understand commits, PRs, or code comments unless fetched explicitly.

⭐ 2. GitHub Repository Limitations
2.1 Relies on repository structure consistency

Scanning logic works best when repos follow conventional structures:

/controllers
/routes
/models
/services


If a repo uses:

unconventional patterns

dynamic imports

hidden routing middleware

nested or multi-module setups

→ The extracted metadata may be incomplete.

2.2 Limited dependency detection

Regex/heuristic scanning may:

Miss transitive service calls

Misinterpret generic HTTP clients

Fail to detect internal library packages

True distributed tracing is not implemented.

2.3 Rate limits

GitHub API (public/free tier) enforces strict limits:

60 requests/hour unauthenticated

5000 requests/hour authenticated

Large repositories may need pagination, caching, batching.

⭐ 3. Risk Scoring Limitations
3.1 Heuristic, not scientific

Risk score = weighted formula, informed by:

Endpoint count

Security impact

Data mutation

Dependency fan-out

It is not calibrated against:

SLA impact

Production incident history

Organizational risk models

3.2 False sense of precision

Risk scores (0–100) appear quantitative but are qualitative heuristics.

3.3 Domain-dependent

Different orgs require:

PCI-DSS rules

GDPR impact mapping

SOX compliance scoring

Current version does not integrate compliance-level checks.

⭐ 4. Caching & Data Freshness Limitations
4.1 Cache invalidation is manual

If the repository changes significantly:

Developers must trigger a new scan

Cached impact results may become outdated

4.2 Caching is file-based

JSON caching is:

Not distributed

Not encrypted

Not multi-user aware

Not suited for multi-instance deployment

Future versions require Redis or SQL-backed cache.

⭐ 5. Backend Limitations (FastAPI Service)
5.1 No authentication

Current prototype exposes:

/stories
/repos
/impact/{story}


without authentication.

5.2 No rate-limiting

Heavy UI use or repeated analyses may:

Overload Groq API

Trigger rate limits

5.3 No persistent database

All data is:

In JSON files

In memory

Not stored in SQL/NoSQL

This limits scalability.

⭐ 6. Frontend Limitations (React Dashboard)

6.1 Visualization limited

While the UI shows services, endpoints, and risks, it lacks:

Animated dependency graphs

Heatmaps

Timeline simulations

Version comparisons

⭐ 7. Security Limitations
7.1 This is a prototype, not production-hardened

Missing security features include:

API auth (OAuth/RBAC/JWT)

Audit logging

Rate limiting

Input validation hardening

Secrets management (Vault/KMS)

7.2 External LLM dependency

Although no PII is sent, prompts go to external providers.
This means full on-premises compliance is not met.

7.3 Prompt injection risks

Reduced but not eliminated.
Malicious users could try to degrade accuracy.

⭐ 8. Dataset Limitations
8.1 Synthetic sample stories

Only 5 stories exist in the demo dataset.
This limits evaluation coverage.

8.3 Microservice inventory is static

Only three services exist in the prototype:

AuthService

PaymentService

UserService

Real systems may have 50–300 services.

⭐ 9. Overall System Limitations
9.1 Not a deterministic system

LLM outputs vary slightly across runs.


⭐ 10. Future Enhancements Needed
✔ AST-based endpoint extraction
✔ Graph database for dependencies
✔ Real-time GitHub repo scanner
✔ Self-hosted LLM for private code
✔ Enterprise security
✔ Role-based access
✔ Full UI redesign with graphs
✔ CI/CD integration
✔ Commit diff-based delta analysis
✔ Automated test case generation
