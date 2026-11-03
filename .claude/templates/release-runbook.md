File: `.claude/templates/release-runbook.md`

````md
# Release Runbook

## Project

Name:

Release version:

Environment:

Deployment target:

Release owner:

Date:

---

## 1. Purpose

This runbook explains how to deploy, verify, monitor, rollback, and recover this project in production.

---

## 2. Access Required

Deployment platform:

Database:

Logs:

Monitoring:

Error tracking:

Payment provider:

AI provider:

Domain/DNS:

Storage:

Repository:

---

## 3. Pre-Deploy Checklist

- [ ] Latest code merged
- [ ] Build passes
- [ ] Tests pass
- [ ] Lint/typecheck passes
- [ ] Env vars configured
- [ ] Secrets configured
- [ ] Database backup completed if needed
- [ ] Migrations reviewed
- [ ] Monitoring active
- [ ] Rollback target known
- [ ] Smoke tests prepared
- [ ] Team informed

---

## 4. Deployment Steps

### Step 1

Command/action:

Expected result:

### Step 2

Command/action:

Expected result:

### Step 3

Command/action:

Expected result:

---

## 5. Migration Steps

Migration required:

- Yes
- No

Backup required before migration:

- Yes
- No

Migration command:

```bash

````

Validation:

```bash
```

Rollback strategy:

...

---

## 6. Post-Deploy Smoke Tests

* [ ] App loads
* [ ] API health OK
* [ ] Login works
* [ ] Core journey works
* [ ] Database writes work
* [ ] Logs visible
* [ ] Error tracking active
* [ ] Payment/webhook test if relevant
* [ ] AI endpoint test if relevant
* [ ] Mobile/responsive check if relevant

---

## 7. Monitoring After Release

Monitor for:

* error rate
* API latency
* database failures
* failed logins
* payment/webhook failures
* AI cost spike
* AI latency
* CPU/memory
* uptime
* user reports

Monitoring window:

* First 15 minutes
* First hour
* First 24 hours
* First week

---

## 8. Rollback Procedure

Rollback trigger:

* build failure
* high error rate
* broken core journey
* failed migration
* payment issue
* security issue
* severe performance issue

Rollback steps:

1.
2.
3.

Rollback validation:

* [ ] Previous version live
* [ ] Health check OK
* [ ] Core flow OK
* [ ] Logs normal
* [ ] Users informed if needed

---

## 9. Incident Response

### App Down

Check:

1.
2.
3.

Action:

...

### Database Issue

Check:

1.
2.
3.

Action:

...

### Payment/Webhook Failure

Check:

1.
2.
3.

Action:

...

### AI Provider Failure

Check:

1.
2.
3.

Action:

...

### Secret Leak

Immediate actions:

1. Rotate secret
2. Revoke old key
3. Redeploy
4. Check logs
5. Document incident

---

## 10. Contacts

Technical owner:

Product owner:

Deployment owner:

Security owner:

Client contact:

Provider support links:

---

## 11. Release Notes

Changes included:

*
*
*

Known limitations:

*
*
*

Final release status:

* Successful
* Rolled back
* Partially successful
* Failed

````

---