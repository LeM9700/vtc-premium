
# File: `.claude/templates/audit-report.md`

````md
# Global Project Audit Report

## 1. Executive Summary

Project:

Project type:

Business goal:

Target users:

Audit date:

Audit mode:

Final decision:

- Production Ready
- Almost Ready
- MVP Controlled Launch
- Not Production Ready
- Dangerous To Deploy
- Discovery Insufficient

Global readiness score:

Top 3 risks:

1. 
2. 
3. 

Recommended next action:

---

## 2. Project Understanding

### Project Type

Primary:

Secondary:

Confidence:

### Business Goal

...

### Target Users

...

### Critical User Journeys

1. 
2. 
3. 

### Tech Stack

Frontend:

Backend:

Database:

Auth:

Storage:

AI:

Payments/Webhooks:

Deployment:

CI/CD:

Monitoring:

### Architecture

```txt
User
↓
Frontend
↓
Backend/API
↓
Database
↓
External Services
````

### Data Sensitivity

* None
* Low
* Medium
* High
* Critical

Details:

---

## 3. Global Scorecard

| Audit Area           | Score /10 | Status | Notes |
| -------------------- | --------: | ------ | ----- |
| Discovery Confidence |           |        |       |
| Feature Readiness    |           |        |       |
| Security             |           |        |       |
| Performance          |           |        |       |
| SEO                  |           |        |       |
| GEO                  |           |        |       |
| Accessibility        |           |        |       |
| Production Readiness |           |        |       |

Global readiness score:

Numeric score overridden by blocker:

* Yes
* No

Reason:

---

## 4. Final Production Decision

Decision:

Deployment recommendation:

* Approve production deployment
* Approve limited MVP/beta launch only
* Do not deploy yet
* Emergency fix required before deployment
* Discovery incomplete

Reason:

Conditions for approval:

* [ ]
* [ ]
* [ ]

---

## 5. P0 — Must Fix Before Production

### P0 — Finding Title

Area:

Evidence:

Risk:

Business Impact:

Required Fix:

Estimated Effort:

Owner Role:

---

## 6. P1 — High Priority Before Launch

### P1 — Finding Title

Area:

Evidence:

Risk:

Recommended Fix:

Estimated Effort:

Owner Role:

---

## 7. P2 — Production Hardening

### P2 — Finding Title

Area:

Evidence:

Recommended Fix:

Estimated Effort:

Owner Role:

---

## 8. P3 — Nice Improvements

### P3 — Finding Title

Area:

Recommended Fix:

Estimated Effort:

Owner Role:

---

## 9. Critical User Journey Verdicts

### Journey Name

Status:

* Ready
* Almost Ready
* Risky
* Blocked
* Unknown

Flow:

```txt
Entry point
↓
User action
↓
System processing
↓
Final state
```

Evidence:

Risks:

Required Fixes:

---

## 10. Security Summary

Authentication status:

Authorization status:

Secrets status:

API security status:

Database/storage status:

Multi-tenant status:

Webhook/payment status:

AI security status:

Biggest security risk:

Security verdict:

---

## 11. Functional Summary

Core feature status:

Broken flows:

Validation quality:

Error handling:

Admin/workflow readiness:

External integrations:

Biggest functional risk:

Functional verdict:

---

## 12. Performance Summary

Frontend performance:

Backend/API performance:

Database performance:

Caching:

AI latency/cost:

Mobile performance:

Biggest bottleneck:

Performance verdict:

---

## 13. SEO & GEO Summary

SEO applicability:

GEO applicability:

Technical SEO status:

Content SEO status:

Structured data status:

Crawlability:

AI discoverability:

Citation readiness:

Biggest SEO/GEO gap:

SEO/GEO verdict:

---

## 14. Accessibility Summary

WCAG readiness:

RGAA relevance:

Keyboard navigation:

Screen reader support:

Forms:

Modals:

Tables/admin flows:

Mobile accessibility:

Biggest accessibility blocker:

Accessibility verdict:

---

## 15. Production Readiness Summary

Build/runtime status:

Environment status:

CI/CD status:

Tests:

Logs:

Monitoring:

Health checks:

Migrations:

Backups:

Rollback:

Deployment:

Privacy/RGPD:

Documentation:

Biggest production risk:

Production verdict:

---

## 16. Quick Wins

### Security

*

### Features

*

### Performance

*

### Accessibility

*

### SEO/GEO

*

### Production

*

---

## 17. 48-Hour Stabilization Plan

### Hour 0-4

*

### Hour 4-8

*

### Hour 8-16

*

### Hour 16-24

*

### Hour 24-48

*

---

## 18. 7-Day Launch Plan

### Day 1

*

### Day 2

*

### Day 3

*

### Day 4

*

### Day 5

*

### Day 6

*

### Day 7

*

---

## 19. 30-Day Maturity Roadmap

### Week 1

*

### Week 2

*

### Week 3

*

### Week 4

*

---

## 20. Final Recommendation

Would you approve this deployment?

* Yes
* Yes, only as controlled MVP
* No
* Dangerous to deploy
* Discovery incomplete

Reason:

Shortest path to safe launch:

First action tomorrow morning:

Final decision:

````

---
