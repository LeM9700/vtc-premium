# File: `.claude/templates/production-checklist.md`

```md
# Production Launch Checklist

## Project

Name:

Environment:

Deployment target:

Release version:

Release owner:

Date:

---

## 1. Build & Runtime

- [ ] Production build passes
- [ ] Production start command works
- [ ] Runtime version is documented
- [ ] Package manager is clear
- [ ] Lockfile exists
- [ ] Typecheck passes if relevant
- [ ] Lint passes if relevant
- [ ] No dev server used in production
- [ ] No hardcoded localhost URLs
- [ ] App fails clearly when required config is missing

---

## 2. Environment Variables

- [ ] `.env.example` exists
- [ ] Required variables are documented
- [ ] Dev/staging/prod environments are separated
- [ ] Frontend public variables are safe
- [ ] Backend secrets are not exposed
- [ ] Payment test/live mode is separated
- [ ] AI provider config is documented if relevant
- [ ] Database URLs are environment-specific

---

## 3. Secrets

- [ ] No secrets committed
- [ ] No secrets in frontend bundle
- [ ] No secrets in Docker image
- [ ] No secrets in logs
- [ ] Deployment secrets configured
- [ ] Webhook secrets configured if relevant
- [ ] Leaked secrets rotated if any were found

---

## 4. CI/CD

- [ ] CI installs dependencies
- [ ] CI runs build
- [ ] CI runs tests
- [ ] CI runs lint/typecheck if relevant
- [ ] CI fails on critical errors
- [ ] Production deploy is controlled
- [ ] Staging deploy exists if needed
- [ ] Rollback process is known
- [ ] Secrets are not printed in CI logs

---

## 5. Tests

- [ ] Unit tests for core logic
- [ ] Integration tests for API/database
- [ ] E2E tests for critical journeys
- [ ] Auth/permission tests
- [ ] Payment/webhook tests if relevant
- [ ] AI evaluation tests if relevant
- [ ] Accessibility tests if relevant
- [ ] Smoke tests after deployment

---

## 6. Security

- [ ] Authentication works
- [ ] Authorization works
- [ ] Admin routes protected
- [ ] Object-level permissions checked
- [ ] Multi-tenant isolation verified if relevant
- [ ] API validation exists
- [ ] Rate limits exist on sensitive endpoints
- [ ] CORS is controlled
- [ ] File uploads are restricted if relevant
- [ ] Webhook signatures verified if relevant
- [ ] AI tool-calling safe if relevant

---

## 7. Database & Migrations

- [ ] Schema is versioned
- [ ] Migrations are documented
- [ ] Migrations are tested
- [ ] Destructive migrations reviewed
- [ ] Backup exists before risky migration
- [ ] Production/dev databases separated
- [ ] Indexes exist for important queries
- [ ] Critical constraints exist
- [ ] Rollback or recovery path exists

---

## 8. Backups & Recovery

- [ ] Database backup strategy exists
- [ ] Storage backup strategy exists if files matter
- [ ] Backup frequency defined
- [ ] Backup retention defined
- [ ] Restore process documented
- [ ] Restore tested or planned
- [ ] RPO defined
- [ ] RTO defined

---

## 9. Monitoring & Logs

- [ ] Error tracking enabled
- [ ] Request/API logs available
- [ ] Critical errors captured
- [ ] Health endpoint exists if backend/API
- [ ] Uptime monitoring enabled
- [ ] Payment/webhook failures monitored if relevant
- [ ] AI cost/token usage monitored if relevant
- [ ] Logs do not expose secrets
- [ ] Logs do not expose excessive personal data

---

## 10. Frontend

- [ ] 404 page exists
- [ ] Error page or error boundary exists
- [ ] Loading states exist
- [ ] Empty states exist
- [ ] Mobile layout tested
- [ ] Forms tested
- [ ] SEO metadata exists if public
- [ ] Analytics configured if needed
- [ ] Accessibility baseline checked

---

## 11. API

- [ ] Health endpoint exists
- [ ] Private endpoints require auth
- [ ] Authorization enforced backend-side
- [ ] Validation exists
- [ ] Errors are consistent
- [ ] Status codes are meaningful
- [ ] Pagination exists for lists
- [ ] Rate limiting exists where needed
- [ ] OpenAPI/Swagger accurate if public API
- [ ] Versioning considered

---

## 12. AI Features

- [ ] Provider timeout configured
- [ ] Prompt size limited
- [ ] Token/cost limits exist
- [ ] Rate limits exist
- [ ] Streaming used for long responses if relevant
- [ ] RAG access control verified
- [ ] Tool-calling actions authorized
- [ ] Destructive AI actions require confirmation
- [ ] AI errors handled gracefully
- [ ] AI logs are safe

---

## 13. Webhooks & Payments

- [ ] Signature verification
- [ ] Raw body handling correct
- [ ] Idempotency implemented
- [ ] Test/live separation
- [ ] Failed events logged
- [ ] Manual recovery path exists
- [ ] Payment access granted after confirmed provider event
- [ ] Cancellation/failure handled
- [ ] Admin/support visibility exists

---

## 14. Privacy / RGPD

- [ ] Privacy policy exists if personal data
- [ ] Terms exist if needed
- [ ] Cookie consent if non-essential cookies
- [ ] Data deletion considered
- [ ] Data retention considered
- [ ] Analytics privacy considered
- [ ] AI provider data handling considered
- [ ] Logs avoid excessive personal data
- [ ] User rights process considered

---

## 15. Final Smoke Tests

- [ ] Homepage loads
- [ ] Login works
- [ ] Core journey works
- [ ] API health OK
- [ ] Database reachable
- [ ] Critical form works
- [ ] Payment test works if relevant
- [ ] AI endpoint works if relevant
- [ ] Error tracking receives test error
- [ ] Logs visible
- [ ] Rollback path confirmed

---

## Launch Decision

Go/No-Go:

- Go
- Go for controlled MVP only
- No-Go
- Dangerous to deploy

Reason:

Approver:

Date:
```

---