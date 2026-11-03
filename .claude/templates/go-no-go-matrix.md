# File: `.claude/templates/go-no-go-matrix.md`

```md
# Go / No-Go Matrix

## Project

Name:

Release:

Environment:

Date:

Decision owner:

---

## Decision Scale

| Status | Meaning |
|-------|---------|
| Green | Ready |
| Yellow | Acceptable risk / needs monitoring |
| Red | Blocker |
| Unknown | Not verified |

---

## Matrix

| Condition | Status | Evidence | Decision Impact |
|----------|--------|----------|-----------------|
| App builds successfully | | | |
| App starts in production mode | | | |
| Core user journeys work | | | |
| Authentication safe | | | |
| Authorization safe | | | |
| Admin routes protected | | | |
| Secrets safe | | | |
| Database protected | | | |
| Migrations safe | | | |
| Backups ready if data exists | | | |
| Rollback ready | | | |
| Monitoring enabled | | | |
| Error tracking enabled | | | |
| Health checks ready | | | |
| Webhooks safe if present | | | |
| Payments safe if present | | | |
| AI safety acceptable if present | | | |
| AI cost controls active if present | | | |
| Performance acceptable | | | |
| Accessibility acceptable | | | |
| SEO/GEO acceptable if public | | | |
| Privacy/RGPD acceptable | | | |
| Documentation sufficient | | | |
| Release checklist completed | | | |

---

## Blocking Conditions

Production is blocked if any of these are true:

- [ ] Exposed production secrets
- [ ] Authentication bypass
- [ ] Broken authorization
- [ ] Cross-user or cross-tenant data access
- [ ] Unsafe payment/webhook flow
- [ ] Core user journey broken
- [ ] App cannot build or start
- [ ] Production database unsafe
- [ ] No backup for critical data
- [ ] Dangerous AI tool-calling
- [ ] Critical privacy/RGPD issue
- [ ] Critical accessibility blocker for mandatory public context

---

## Final Decision

Decision:

- Production Ready
- Almost Ready
- MVP Controlled Launch
- Not Production Ready
- Dangerous To Deploy
- Discovery Insufficient

Reason:

Conditions:

- 
- 
- 

Approved by:

Date:
```

---