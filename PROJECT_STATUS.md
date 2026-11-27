# Project status (2026-11-27)

Integration branch: `feature/cosmic-match-foundation` @ 85e9d3e (PR #2 merged). Open Claude PRs, in merge order:

| PR | Branch | Base | Scope | CI |
|---|---|---|---|---|
| #3 | `claude/geo-p0-fix` | feature/cosmic-match-foundation | **P0** geography catalog in deploy build, adaptive shards, picker states | Foundation ✓ · World import ✓ |
| #4 | `claude/synastry-0.2` | feature/cosmic-match-foundation | Block 4 symbolic-0.2 candidate (flag) | ✓ |
| #5 | `claude/product-experience` | claude/geo-p0-fix (+ merges #4) | Block 5 redesign + SVG wheels | ✓ |
| #6 | `claude/checkout-sim` | claude/product-experience | Block 9 checkout simulation | ✓ |
| #7 | `chatgpt/story-first` (ChatGPT) | claude/checkout-sim | Story-first results v1 | ✓ |
| #8 | `claude/cosmic-story-v2` | chatgpt/story-first | Natal engine + 8-chapter Cosmic Story + chaptered premium report | ✓ |
| #9 | `claude/beta-readiness` (includes `chatgpt/kb-expansion` decisions) | claude/cosmic-story-v2 | CTO changes C-01–C-06, calibration, editorial corpus, live preview verification, beta gates | ✓ (head d7610ad live preview green) |
| #10 | `claude/block3` | claude/beta-readiness | Block 3: deploy recovery, privacy, cosmic-story-0.2, 0.2 parameter sets, orb experiment, LLM budget, a11y | see PR |

| Module | Status | Evidence |
|---|---|---|
| Geography (GeoNames) | World catalog: 248 countries, 5.66 M places, 5,995 shards, max 204 KB gzip; deploy build fails without real data | PR #3, QA_REPORT |
| Live Cloudflare site | **Verified** on PR #9 head preview 3f9f069f (d7610ad): world catalog + journey (Chiclayo) + Lima by hand. One failed build (c5c8ccb) diagnosed; pinned geography release ready for approval | QA_REPORT.md, DEPLOYMENT.md |
| Local time → UTC | 1900+, pre-1970 flagged | validated vs zoneinfo |
| Planets, ASC/MC, Placidus, mean node | Validated vs Swiss Ephemeris (≤17.5″ planets, ≤0.1″ angles/cusps) | tests/ephemeris-reference, houses |
| Chiron, true node, topocentric | Not implemented | TD-05 |
| Score | `symbolic-0.1` default (golden 49, frozen); `symbolic-0.2` experimental with versioned sets candidate/sym-a/sym-b/sym-c (golden 54 = candidate) | CALIBRATION_BLOCK3.md |
| UX | Landing, 4-step form, calculation animation; results = cover + 8 story chapters, premium (09), technical (10, wheels) | PR #5, #8 |
| Natal interpretation | cosmic-story-0.2: no empty sections, one reading per contact, three groups; free 1,614–1,800 words (10 cases); LLM disabled, chapters 3–8 budget with fallback | PR #10, EDITORIAL_CASES.md |
| Premium | Checkout **simulation**; report = full premium story, HTML/PDF with cover and chapters | PR #6, #8 |
| Payments | Disabled. No provider selected | MONETIZATION.md |
| Supabase / RLS | Draft SQL only, not executed | database/schema-draft.sql |
| Virality (Block 7), Supabase (Block 8) | Not started (only pre-existing share cards) | — |

**Milestone FOUNDER_BETA_READY:** NOT READY. Gate 5 (rubric) and Gate 7 (privacy decision) are open, and PR #10's head preview is pending. See FOUNDER_BETA_READINESS.md.
