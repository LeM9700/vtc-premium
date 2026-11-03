----
description: Audit whether the project features actually work and support the business goal.
---

# Feature Audit Command

Run a functional and product-readiness audit.

Use:

- `.claude/skills/project-discovery.md`
- `.claude/skills/feature-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Answer:

Does this project correctly deliver what it promises to users?

Audit scope

Audit:

product promise
feature inventory
critical user journeys
CRUD flows
forms
validation
loading states
success states
empty states
error states
permissions
business rules
admin flows
search/filter/sort/pagination
external integrations
notifications
payments if relevant
file uploads if relevant
AI features if relevant
mobile/responsive functional behavior
analytics and success tracking
dead features and incomplete work
Rules
Do not focus on code style unless it affects functionality.
Do not assume a feature works without evidence.
If a feature cannot be verified, mark it as Unknown.
Separate happy-path from edge-case robustness.
Prioritize critical user journeys over secondary features.
Do not edit files.
Required output

Return:

Feature Audit Report
1. Executive Summary

Verdict:

Functionally Production Ready
MVP Ready With Risks
Not Production Ready
Core Features Broken
Discovery Insufficient
2. Project Context
3. Feature Inventory
4. Critical User Journeys
5. Functional Findings
6. Feature Scores
7. P0 — Production Blockers
8. P1 — High Priority Fixes
9. P2 — Improvements
10. P3 — Nice To Have
11. Quick Wins
12. Missing Tests
13. Suggested Manual QA Scenarios
14. Final Verdict

End with:

Feature decision: [verdict].

---