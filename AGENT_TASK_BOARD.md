# Agent task board

Status: TODO · IN_PROGRESS · BLOCKED · REVIEW · DONE. Updated 2026-11-27 (block 4) by Claude. After the history cleanup all SHAs changed (INTEGRATION_PLAN.md).

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
| T-14 | LLM narrative prototype behind the adapter (mock only) | Claude | REVIEW (block 3: chapters 3–8 budget, retries, deterministic fallback) | P3 | T-09, T-11 | Validation passes; no network; cost model within USD 0.10 cap incl. retries | tests/llm-grounding (budget test) | claude/block3 | #10 |
| T-15 | Mobile performance of first geography search | Claude | TODO | P5 | T-02 | Measured on Cloudflare (brotli) | — | claude/* | — |
| T-16 | Supabase schema/RLS local tests (no paid project) | Claude | TODO | P5 | T-12 | RLS tests against local Supabase | — | claude/* | — |
| T-17 | FOUNDER_BETA_READY: all 7 gates passed with evidence | Claude + ChatGPT + Founder | IN_PROGRESS (open: Gate 5 rubric, Gate 7 founder steps, final-commit preview) | P0 | T-20, T-24, T-30 | 7 gates with verifiable evidence on the final integrated commit | FOUNDER_BETA_READINESS.md | claude/block4 | #12 |
| T-18 | CTO changes C-01–C-06 (unknown time, conjunctions, balance, calibration, LLM mock, narrative) | Claude | REVIEW | P1 | T-09 | tests/uncertainty, natal-interpretation, llm-grounding; CALIBRATION_REPORT.md | QA_REPORT | claude/beta-readiness | #9 |
| T-19 | Live preview verification of every PR commit | Claude | DONE (PR #9 head d7610ad: catalog + journey green; Lima checked live; Lima added to journey) | P0 | — | `preview` job green on the head commit | QA_REPORT block 3 | claude/beta-readiness | #9 |
| T-20 | Full rubric on the regenerated bilingual corpus (20 readings) | ChatGPT | TODO | P0 | T-31 | Average ≥ 4/5, no critical deficiency; per-case notes split narrative (Claude) / library (ChatGPT) | EDITORIAL_CASES.md | chatgpt/* | — |
| T-21 | Decide the 0.2 parameter set (candidate / sym-a / sym-b / sym-c) | ChatGPT | TODO | P2 | T-26 | Written decision in COMPATIBILITY_METHODOLOGY.md; 0.1 stays frozen | CALIBRATION_BLOCK3.md | chatgpt/* | — |
| T-22 | Fill library variants (arrays) for the most repeated cross pairs and sign texts | ChatGPT | TODO | P1 | T-10 | Shared-sentence metric < 15% in EDITORIAL_CASES | editorial-metrics.json | chatgpt/kb-expansion | — |

| T-23 | Versioned geography catalog (private repo) | Claude → Founder | REVIEW (workflow + authenticated fetch tested; founder publishes release and sets GEOGRAPHY_TOKEN) | P0 | — | Release published, lock committed, Cloudflare builds without GeoNames import | DEPLOYMENT.md | claude/block4 | #12 |
| T-24 | Privacy incident | Claude (executed) + Founder | IN_PROGRESS (history cleaned, 15 artefacts + 21 logs deleted; pending: visibility, GitHub Support, local copies) | P0 | — | PRIVACY_INCIDENT.md "Still pending" empty | PRIVACY_INCIDENT.md | — | — |
| T-25 | Editorial fixes in narrative.mjs (cosmic-story-0.2): empty sections, grammar, alias reuse, three groups, hedged claims, length | Claude | REVIEW | P1 | — | CTO block 3 acceptance criteria, tested | tests/natal-interpretation (block 3 tests), EDITORIAL_CASES.md | claude/block3 | #10 |
| T-26 | symbolic-0.2 versioned parameter sets + calibration on original and independent samples | Claude | REVIEW | P2 | — | Symmetric variant, nodes/overlays/orbs switches, friendship without attraction, no forced mean | CALIBRATION_BLOCK3.md | claude/block3 | #10 |
| T-27 | Experimental synastry orbs: compare with natal orbs | Claude | REVIEW | P2 | — | Contacts, cards, insufficiency, built readings, ±1 h stability reported | CALIBRATION_BLOCK3.md | claude/block3 | #10 |
| T-28 | knowledge.mjs fixes found by validation | ChatGPT | TODO | P1 | T-25 | Moon–Venus EN and Moon–Saturn ES benefits hedged; Scorpio `love` without "deseo"; sign-level variants (arrays) for the most repeated placements | QA_REPORT block 4 | chatgpt/* | — |
| T-29 | Accessibility: automated WCAG 2.1 A/AA audit in CI | Claude | DONE (0 violations desktop/mobile) | P3 | — | axe-core serious/critical fail CI | a11y-*.json artefacts | claude/block3 | #10 |
| T-30 | Integrate PRs #3–#12 per INTEGRATION_PLAN.md | ChatGPT (review/authorize) → Claude (execute) | TODO | P1 | — | Linear merges into feature/cosmic-match-foundation; #4 closed as included; CI green; no merge to main | INTEGRATION_PLAN.md | — | — |
| T-31 | Narrative block 4: everyday situations, questions, agreements, chart-anchored sentences, per-pair variants, friendship guard | Claude | REVIEW | P1 | — | Repetition < 15% per language (now 16.5%); no empty/duplicate; 0 forbidden; 0 romance in friendship | editorial-metrics.json | claude/block4 | #12 |
| T-32 | CI cost controls for a private repo | Claude | REVIEW | P0 | — | ≤ 2,000 min/month estimate; artefacts < 500 MB | DEPLOYMENT.md | claude/block4 | #12 |
| T-33 | Validate PR #11 (natal-kb-0.2) | Claude | DONE (tests pass with #12; defects listed for ChatGPT) | P1 | — | tests/knowledge-base.test.mjs | QA_REPORT | claude/block4 | #12 |
| T-34 | Sym-C as experimental candidate in the app (flag), coverage and uncertainty shown | Claude | TODO (next block) | P2 | — | `?scoring=sym-c` behind a flag; 0.1 default; overlays only in the narrative | — | claude/* | — |
