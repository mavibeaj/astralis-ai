# Agent task board

Status: TODO · IN_PROGRESS · BLOCKED · REVIEW · DONE. Updated 2026-11-27 by Claude.

| ID | Task | Owner | Status | Priority | Depends on | Acceptance criteria | Evidence | Branch | PR |
|---|---|---|---|---|---|---|---|---|---|
| T-01 | Geography catalog in deploy build + picker states | Claude | REVIEW | P0 | — | CI + world import green; live site shows countries and Chiclayo | QA_REPORT (world: 248 countries, 5.66 M places) | claude/geo-p0-fix | #3 |
| T-02 | Confirm Cloudflare build command `npm run build`, output `out`; redeploy; test live | Founder | BLOCKED (owner access) | P0 | T-01 merged | Build log shows "Geography gate: 248 countries"; Chiclayo selectable live | — | — | — |
| T-03 | symbolic-0.2 candidate behind flag | Claude | REVIEW | P2 | — | 0.1 golden unchanged; symmetry/determinism tests | tests/compatibility-v02 | claude/synastry-0.2 | #4 |
| T-04 | Approve symbolic-0.2 internal weights | ChatGPT | TODO | P2 | T-03 | Written decision in COMPATIBILITY_METHODOLOGY.md | — | chatgpt/* | — |
| T-05 | Redesign + SVG wheels | Claude | REVIEW | P3 | T-01 | Playwright desktop/mobile | screenshots | claude/product-experience | #5 |
| T-06 | Checkout simulation | Claude | REVIEW | P4 | T-05 | 15 commerce tests; E2E decline→approve→report→recovery | tests/commerce | claude/checkout-sim | #6 |
| T-07 | Story-first results (first version) | ChatGPT | REVIEW (superseded in UI by T-08, kept in history) | P2 | T-06 | — | tests/relationship-story | chatgpt/story-first | #7 |
| T-08 | Cosmic Story v2: natal engine (Layer A/B), 8 chapters, premium report, LLM adapter (disabled) | Claude | REVIEW | P1–P4 | T-07 | 20 interpretation tests; free 1,000–1,600 words; premium ≥ 2,900; no forbidden claims; unknown-time robustness; E2E chapters | QA_REPORT, NATAL_METHODOLOGY.md | claude/cosmic-story-v2 | #8 |
| T-09 | Review natal methodology (orbs, tones, weights, unknown time) | ChatGPT | TODO | P1 | T-08 | Approve or change rules in NATAL_METHODOLOGY.md with reasons | — | chatgpt/* | — |
| T-10 | Expand knowledge base: ≥ 15 more cross pairs, natal pairs, sign-in-house texts, EN/ES, gender-neutral | ChatGPT | TODO | P1 | T-09 | Same data shape as `knowledge.mjs`; passes `tests/natal-interpretation.test.mjs` | — | chatgpt/kb-expansion | — |
| T-11 | Editorial rubric + 10 evaluation cases (free vs premium) | ChatGPT | TODO | P1 | T-08 | Rubric (depth, specificity, variety, safety, usefulness) with scored examples | — | chatgpt/* | — |
| T-12 | Competitor + pricing research; payment providers for a Peru-resident founder | ChatGPT | TODO | P2 | — | Comparison table with sources; recommendation; no account opened | — | chatgpt/* | — |
| T-13 | SEO + launch plan (bilingual, noindex until launch) | ChatGPT | TODO | P3 | — | Keyword map, metadata plan, launch checklist | — | chatgpt/* | — |
| T-14 | LLM narrative prototype behind the adapter (mock only) | Claude | TODO | P3 | T-09, T-11 | Validation passes; no network; cost model | — | claude/* | — |
| T-15 | Mobile performance of first geography search | Claude | TODO | P5 | T-02 | Measured on Cloudflare (brotli) | — | claude/* | — |
| T-16 | Supabase schema/RLS local tests (no paid project) | Claude | TODO | P5 | T-12 | RLS tests against local Supabase | — | claude/* | — |
