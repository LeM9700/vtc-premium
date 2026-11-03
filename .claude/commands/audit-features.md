--
description: Run a SEO and GEO audit for search engines and AI search engines.
---

# SEO & GEO Audit Command

Run a SEO and GEO audit.

Use:

- `.claude/skills/project-discovery.md`
- `.claude/skills/seo-geo-audit.md`

## User arguments

```txt
$ARGUMENTS
Goal

Determine whether this project can be discovered, understood, indexed, cited, and recommended by:

Google
Bing
AI assistants
AI search engines
ChatGPT-style answer engines
Claude-style assistants
Gemini-style assistants
Perplexity-style assistants
Audit scope

Apply only if relevant.

Audit:

metadata
titles
descriptions
canonical URLs
sitemap
robots.txt
structured data
headings
semantic HTML
internal linking
crawlability
indexability
page speed impact on SEO
content quality
topical authority
E-E-A-T
local SEO if relevant
multilingual SEO if relevant
Open Graph
Twitter cards
documentation visibility
FAQ structure
schema.org
llms.txt if relevant
AI citation readiness
entity recognition
GEO semantic clarity
Rules
Do not penalize private dashboards or private APIs for missing public SEO.
For APIs, focus on public documentation discoverability.
For SaaS, evaluate marketing pages and docs.
For local businesses, evaluate local SEO and trust signals.
Do not invent metadata.
If something is missing, cite the missing file or route as evidence.
Do not edit files.
Required output

Return:

SEO & GEO Audit Report
1. Executive Summary

Verdict:

Production Ready From SEO/GEO Perspective
Good Foundation
Needs Optimization
Not Search Ready
Not Applicable
2. Project Context
3. SEO Scorecard
4. GEO Scorecard
5. Technical SEO Findings
6. Content SEO Findings
7. GEO / AI Search Findings
8. Structured Data Findings
9. Local SEO Findings If Relevant
10. Quick Wins
11. Long-Term Improvements
12. Priority Plan

Group by P0, P1, P2, P3.

13. Final Verdict

End with:

SEO/GEO decision: [verdict].

---