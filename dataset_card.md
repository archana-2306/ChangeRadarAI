# Dataset Card — ChangeradarAI

## Sources
ChangeradarAI uses a small synthetic dataset containing:
- 5 Jira-style user stories (US-101 to US-105)
- 3 microservices: AuthService, PaymentService, UserService
- Optional GitHub repository scanning (real repositories)

## Dataset License
All stories and metadata are fully synthetic and owned by the project team.

## Preprocessing
- Stories stored as JSON
- Repo metadata extracted via GitHub API or static JSON
- Endpoints parsed using lightweight regex rules

## Known Issues
- Dataset is small and not domain-specific
- Does not reflect real enterprise complexity
- No real telemetry, logs, or commit history
