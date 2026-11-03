---
description: Convert audit findings into an actionable remediation plan with PRs, owners, tests, and acceptance criteria.
---

# Audit Fix Plan Command

Convert existing audit findings into a concrete implementation plan.

Use the audit framework from:

- `.claude/skills/global-audit.md`
- `.claude/skills/production-readiness.md`
- `.claude/skills/security-audit.md`
- `.claude/skills/feature-audit.md`
- `.claude/skills/performance-audit.md`
- `.claude/skills/accessibility-audit.md`
- `.claude/skills/seo-geo-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Create a practical remediation plan from the current project state or from previous audit findings.

Do not implement fixes unless the user explicitly asks.

Plan rules

Prioritize in this order:

P0 production blockers
Critical security/data risks
Broken critical user journeys
Deployment/build/env issues
Monitoring/logging/backups/rollback
Performance bottlenecks
Accessibility blockers
SEO/GEO improvements
Polish
Required output

Return:

Audit Remediation Plan
1. Current Verdict
2. Immediate Goal

Choose one:

Make project safe for production
Make project safe for controlled MVP launch
Stabilize demo
Prepare client delivery
Prepare technical interview/demo
3. P0 Fix Plan

For each P0:

Problem:
Risk:
Files likely affected:
Fix strategy:
Tests required:
Acceptance criteria:
Estimated effort:
Owner role:
4. P1 Fix Plan
5. P2 Hardening Plan
6. Pull Request Plan
PR 1 — Production Blockers

Scope:

Files:

Tests:

Acceptance criteria:

PR 2 — Security Hardening

Scope:

Files:

Tests:

Acceptance criteria:

PR 3 — Functional Stabilization

Scope:

Files:

Tests:

Acceptance criteria:

PR 4 — Monitoring and Release

Scope:

Files:

Tests:

Acceptance criteria:

7. 48-Hour Execution Plan
Hour 0-4
Hour 4-8
Hour 8-16
Hour 16-24
Hour 24-48
8. 7-Day Execution Plan
Day 1
Day 2
Day 3
Day 4
Day 5
Day 6
Day 7
9. Tests To Add

Group by:

Unit
Integration
E2E
Security
Performance
Accessibility
AI evaluation if relevant
10. Final Launch Condition

List the exact conditions required before approving launch.

End with:

Fix plan ready. Next recommended action: [specific next action].