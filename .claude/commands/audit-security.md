---

# File: `.claude/commands/audit-prod.md`

```md
---
description: Run a strict pre-production readiness audit before deployment.
---

# Pre-Production Audit Command

Run a strict production readiness audit of this project.

Use primarily:

- `.claude/skills/project-discovery.md`
- `.claude/skills/production-readiness.md`
- `.claude/skills/security-audit.md`
- `.claude/skills/feature-audit.md`
- `.claude/skills/performance-audit.md`
- `.claude/skills/global-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Answer one question:

Can this project safely go live now?

Focus areas

Audit:

production build
start command
runtime
environment variables
secrets
CI/CD
tests
logs
error handling
monitoring
health checks
database migrations
backups
rollback
Docker
deployment configuration
API readiness
frontend readiness
mobile readiness if relevant
AI readiness if relevant
webhook/payment readiness if relevant
privacy/RGPD if personal data exists
documentation
release checklist
Rules
Be strict.
Do not modify files.
Do not assume production readiness.
Mark unknown items as Unknown.
Identify P0 blockers first.
If a P0 blocker exists, do not approve production.
If the project is only suitable for beta or pilot, choose MVP Controlled Launch.
Required output

Return:

Pre-Production Audit Report
1. Final Go/No-Go Decision

Decision:

Approve production deployment
Approve limited MVP/beta launch only
Do not deploy yet
Dangerous to deploy
Discovery incomplete

Reason:

2. Production Context
Project type:
Target users:
Critical user journeys:
Deployment target:
Runtime:
Database:
Auth:
AI:
Payment/webhooks:
Data sensitivity:
3. P0 — Must Fix Before Production
4. P1 — High Priority Before Launch
5. Build & Runtime
6. Environment & Secrets
7. Tests & CI/CD
8. Monitoring, Logs & Health Checks
9. Database, Migrations, Backups & Rollback
10. Privacy/RGPD
11. Manual Pre-Launch Checklist
12. 48-Hour Stabilization Plan
13. Final Verdict

End with:

Final decision: [verdict].

---