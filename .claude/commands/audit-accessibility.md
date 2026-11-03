---
description: Audit frontend, backend, database, API, AI, caching, and production performance risks.
---

# Performance Audit Command

Run a production-focused performance audit.

Use:

- `.claude/skills/project-discovery.md`
- `.claude/skills/performance-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Answer:

Will this project remain fast, usable, and cost-efficient under realistic production usage?

Audit scope

Audit:

frontend performance
Core Web Vitals if public web
rendering strategy
JavaScript bundle
hydration
images and media
fonts
third-party scripts
backend performance
API latency
database queries
indexes
pagination
caching
Firebase/Supabase/PostgreSQL/Mongo performance if relevant
AI latency
AI token cost
RAG retrieval speed
vector database performance
background jobs
queues
real-time performance
mobile performance
infrastructure bottlenecks
monitoring and performance testing
Rules
Do not recommend premature optimization.
Prioritize bottlenecks affecting critical user journeys.
Mark unmeasured metrics as Unknown.
Recommend how to measure unknown performance.
For AI apps, always check latency, streaming, timeout, token cost, max iterations, caching, and usage limits.
Do not edit files.
Required output

Return:

Performance Audit Report
1. Executive Summary

Verdict:

Performance Production Ready
Good Baseline With Optimization Needed
MVP Usable With Performance Risks
Not Production Ready
Performance Critical
Discovery Insufficient
2. Project Performance Context
3. Performance Scorecard
4. Critical Bottlenecks
5. Detailed Findings By Domain
6. Critical User Journey Performance
7. AI Performance Assessment
8. Database Performance Assessment
9. Core Web Vitals Assessment
10. P0 / P1 / P2 / P3
11. Quick Wins
12. Suggested Performance Tests
13. Recommended Monitoring
14. Final Verdict

End with:

Performance decision: [verdict].

---