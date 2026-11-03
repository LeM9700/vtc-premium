---
description: Audit accessibility using WCAG 2.2, RGAA readiness, keyboard, screen readers, contrast, forms, modals, mobile, SaaS/admin workflows.
---

# Accessibility Audit Command

Run a serious accessibility audit.

Use:

- `.claude/skills/project-discovery.md`
- `.claude/skills/accessibility-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Answer:

Can users with different abilities complete the critical user journeys?

Audit scope

Audit:

WCAG 2.2 readiness
RGAA readiness if France/public/institutional/regulatory context applies
semantic HTML
headings
landmarks
keyboard navigation
focus management
screen reader support
ARIA quality
color contrast
forms
errors and status messages
buttons and links
navigation
modals/dialogs/drawers
tables and data grids
SaaS/admin workflows
AI chat/features if relevant
mobile accessibility
responsive behavior
cognitive accessibility
motion/reduced motion
language/localization
accessibility tests
Rules
Do not claim full WCAG or RGAA compliance from code-only inspection.
Do not rely only on automated scores.
If behavior requires manual testing, mark it as Requires manual validation.
Prioritize critical user journeys.
Prefer native semantic HTML over ARIA-heavy custom components.
Do not edit files.
Required output

Return:

Accessibility Audit Report
1. Executive Summary

Verdict:

Accessibility Production Ready
Good Baseline With Fixes Needed
MVP Usable With Accessibility Risks
Not Accessibility Ready
Critical Accessibility Blockers
Discovery Insufficient
2. Project Accessibility Context
3. Accessibility Scorecard
4. Critical Accessibility Findings
5. Critical User Journey Accessibility
6. Detailed Findings By Domain
7. WCAG 2.2 Mapping
8. RGAA Readiness Assessment
9. P0 / P1 / P2 / P3
10. Quick Wins
11. Suggested Accessibility Tests
12. Manual Accessibility Test Scenarios
13. Recommended Tooling
14. Final Verdict

End with:

Accessibility decision: [verdict].

---