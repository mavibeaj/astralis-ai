# Agent task board

Status: TODO · IN_PROGRESS · BLOCKED · REVIEW · DONE. Updated 2026-11-27 (block 2) by Claude.

| ID | Task | Owner | Status | Priority | Depends on | Acceptance criteria | Evidence | Branch | PR |
|---|---|---|---|---|---|---|---|---|---|
| T-01 | Geography catalog in deploy build + picker states | Claude | REVIEW | P0 | — | CI + world import green; live site shows countries and Chiclayo | QA_REPORT (world: 248 countries, 5.66 M places) | claude/geo-p0-fix | #3 |
| T-02 | Confirm Cloudflare build command `npm run build`, output `out`; redeploy; test live | Founder | BLOCKED (owner access) | P0 | T-01 merged | Build log shows "Geography gate: 248 countries"; Chiclayo selectable live | — | — | — |
| T-03 | symbolic-0.2 candidate behind flag | Claude | REVIEW | P2 | — | 0.1 golden unchanged; symmetry/determinism tests | tests/compatibility-v02 | claude/synastry-0.2 | #4 |
| T-04 | Approve symbolic-0.2 internal weights | ChatGPT | DONE (kept as experimental hypotheses, f7b0885) | P2 | T-03 | Written decision in COMPATIBILITY_METHODOLOGY.md | — | chatgpt/* | — |
| T-05 | Redesign + SVG wheels | Claude | REVIEW | P3 | T-01 | Playwright desktop/mobile | screenshots | claude/product-experience | #5 |
| T-06 | Checkout simulation | Claude | REVIEW | P4 | T-05 | 15 commerce tests; E2E decline→approve→report→recovery | tests/commerce | claude/checkout-sim | #6 |
| T-07 | Story-first results (first version) | ChatGPT | REVIEW (superseded in UI by T-08, kept in history) | P2 | T-06 | — | tests/relationship-story | chatgpt/story-first | #7 |
| T-08 | Cosmic Story v2: natal engine (Layer A/B), 8 chapters, premium report, LLM adapter (disabled) | Claude | REVIEW | P1–P4 | T-07 | 20 interpretation tests; free 1,000–1,600 words; premium ≥ 2,900; no forbidden claims; unknown-time robustness; E2E chapters | QA_REPORT, NATAL_METHODOLOGY.md | claude/cosmic-story-v2 | #8 |
| T-09 | Review natal methodology (orbs, tones, weights, unknown time) | ChatGPT | DONE (9c6a504) | P1 | T-08 | Approve or change rules in NATAL_METHODOLOGY.md with reasons | — | chatgpt/* | — |
| T-10 | Expand knowledge base: ≥ 15 more cross pairs, natal pairs, sign-in-house texts, EN/ES, gender-neutral | ChatGPT | TODO | P1 | T-09 | Same data shape as `knowledge.mjs`; passes `tests/natal-interpretation.test.mjs` | — | chatgpt/kb-expansion | — |
| T-11 | Editorial rubric + 10 evaluation cases (free vs premium) | ChatGPT | TODO | P1 | T-08 | Rubric (depth, specificity, variety, safety, usefulness) with scored examples | — | chatgpt/* | — |
| T-12 | Competitor + pricing research; payment providers for a Peru-resident founder | ChatGPT | TODO | P2 | — | Comparison table with sources; recommendation; no account opened | — | chatgpt/* | — |
| T-13 | SEO + launch plan (bilingual, noindex until launch) | ChatGPT | TODO | P3 | — | Keyword map, metadata plan, launch checklist | — | chatgpt/* | — |
| T-14 | LLM narrative prototype behind the adapter (mock only) | Claude | REVIEW (C-05, PR #9) | P3 | T-09, T-11 | Validation passes; no network; cost model | — | claude/* | — |
| T-15 | Mobile performance of first geography search | Claude | TODO | P5 | T-02 | Measured on Cloudflare (brotli) | — | claude/* | — |
| T-16 | Supabase schema/RLS local tests (no paid project) | Claude | TODO | P5 | T-12 | RLS tests against local Supabase | — | claude/* | — |
| T-17 | FOUNDER_BETA_READY: all 7 gates passed with evidence | Claude + ChatGPT | IN_PROGRESS (Gates 1 and 5 open; see FOUNDER_BETA_READINESS.md) | P1 | T-10, T-11, T-19, T-20 | 7 gates with verifiable evidence; then FOUNDER_BETA_READY.md + notify founder | FOUNDER_BETA_READINESS.md | claude/beta-readiness | #9 |
| T-18 | CTO changes C-01–C-06 (unknown time, conjunctions, balance, calibration, LLM mock, narrative) | Claude | REVIEW | P1 | T-09 | tests/uncertainty, natal-interpretation, llm-grounding; CALIBRATION_REPORT.md | QA_REPORT | claude/beta-readiness | #9 |
| T-19 | Live preview verification of every PR commit | Claude | IN_PROGRESS (workflow added; first run waiting for Cloudflare) | P0 | — | `Preview verify` green: catalog geonames:world + Playwright on the preview URL | .github/workflows/preview-verify.yml | claude/beta-readiness | #9 |
| T-20 | Score EDITORIAL_CASES.md with the rubric (8 criteria, 1–5) | ChatGPT | TODO | P1 | T-18 | Average ≥ 4/5, no critical deficiency, per-case notes with concrete text fixes | EDITORIAL_CASES.md | chatgpt/* | — |
| T-21 | Decide 0.2 polarity symmetry (mean 57.5 on neutral corpus) and friendship weighting | ChatGPT | TODO | P2 | T-18 | Written decision in COMPATIBILITY_METHODOLOGY.md | CALIBRATION_REPORT.md | chatgpt/* | — |
| T-22 | Fill library variants (arrays) for the most repeated cross pairs and sign texts | ChatGPT | TODO | P1 | T-10 | Shared-sentence metric < 15% in EDITORIAL_CASES | editorial-metrics.json | chatgpt/kb-expansion | — |
