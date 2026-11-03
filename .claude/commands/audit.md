---
description: Run a complete project audit using discovery, features, security, performance, SEO/GEO, accessibility, and production readiness.
---

# Global Project Audit Command

Run a complete production-grade audit of this project.

Use the audit framework from:

- `.claude/skills/project-discovery.md`
- `.claude/skills/feature-audit.md`
- `.claude/skills/security-audit.md`
- `.claude/skills/performance-audit.md`
- `.claude/skills/seo-geo-audit.md`
- `.claude/skills/accessibility-audit.md`
- `.claude/skills/production-readiness.md`
- `.claude/skills/global-audit.md`

## User arguments

Additional instructions from the user:

```txt
$ARGUMENTS
Audit mode

Default mode: Full Audit.

If the user arguments mention quick, run a quick audit.

If the user arguments mention prod, run a pre-production audit.

If the user arguments mention client, generate a business-readable report.

If the user arguments mention technical, generate a deep technical report.

Execution rules
Start with project discovery.
Identify the real project type, stack, goal, users, critical journeys, and deployment context.
If discovery confidence is below 8/10, stop and return Discovery Insufficient.
Audit only relevant domains.
Do not edit files.
Do not create fixes unless the user explicitly asks.
Provide evidence for every important finding.
Separate verified facts, inferred risks, and unknowns.
Apply veto rules for security, data safety, build failure, broken core journeys, unsafe webhooks/payments, exposed secrets, and dangerous AI tool-calling.
Required output

Return the report using the exact structure from global-audit.md.

The final decision must be one of:

Production Ready
Almost Ready
MVP Controlled Launch
Not Production Ready
Dangerous To Deploy
Discovery Insufficient

End with:

Final decision: [verdict].

