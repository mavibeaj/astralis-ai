# Project status (2026-11-27)

Integration branch: `feature/cosmic-match-foundation` @ c87ffe4 (history cleaned 27 Nov; PR #2 merged). Open PRs: a linear stack, 0 behind and no conflicts; see INTEGRATION_PLAN.md.

| PR | Branch | Base | Scope | CI |
|---|---|---|---|---|
| #3 | `claude/geo-p0-fix` | feature/cosmic-match-foundation | **P0** geography catalog in deploy build, adaptive shards, picker states | Foundation ✓ · World import ✓ |
| #4 | `claude/synastry-0.2` | feature/cosmic-match-foundation | Block 4 symbolic-0.2 candidate (flag) | ✓ |
| #5 | `claude/product-experience` | claude/geo-p0-fix (+ merges #4) | Block 5 redesign + SVG wheels | ✓ |
| #6 | `claude/checkout-sim` | claude/product-experience | Block 9 checkout simulation | ✓ |
| #7 | `chatgpt/story-first` (ChatGPT) | claude/checkout-sim | Story-first results v1 | ✓ |
| #8 | `claude/cosmic-story-v2` | chatgpt/story-first | Natal engine + 8-chapter Cosmic Story + chaptered premium report | ✓ |
| #9 | `claude/beta-readiness` (includes `chatgpt/kb-expansion` decisions) | claude/cosmic-story-v2 | CTO changes C-01–C-06, calibration, editorial corpus, live preview verification, beta gates | ✓ (head d7610ad live preview green) |
| #11 | `chatgpt/kb-block3` (ChatGPT) | claude/block3 | natal-kb-0.2: 18 cross readings, aliases removed, sym-c decision, preliminary rubric | test fails alone (C-06), fixed in #12 |
| #12 | `claude/block4` | chatgpt/kb-block3 | Block 4: privacy cleanup, catalog, CI costs, KB validation, narrative | ✓ (single-job CI) |
| #10 | `claude/block3` | claude/beta-readiness | Block 3: deploy recovery, privacy, cosmic-story-0.2, 0.2 parameter sets, orb experiment, LLM budget, a11y | see PR |

| Module | Status | Evidence |
|---|---|---|
| Geography (GeoNames) | World catalog 248 countries, 5.66 M places. Versioned release (attribution, SHA-256, rollback, authenticated download) ready; activation = founder publishes the release + sets the token | DEPLOYMENT.md |
| Live Cloudflare site | **Verified** on PR #9 head preview 3f9f069f (d7610ad): world catalog + journey (Chiclayo) + Lima by hand. One failed build (c5c8ccb) diagnosed; pinned geography release ready for approval | QA_REPORT.md, DEPLOYMENT.md |
| Local time → UTC | 1900+, pre-1970 flagged | validated vs zoneinfo |
| Planets, ASC/MC, Placidus, mean node | Validated vs Swiss Ephemeris (≤17.5″ planets, ≤0.1″ angles/cusps) | tests/ephemeris-reference, houses |
| Chiron, true node, topocentric | Not implemented | TD-05 |
| Score | `symbolic-0.1` default (frozen, golden 49). 0.2 sets versioned; **Sym-C chosen by the CTO as the experimental candidate** (overlays only in the narrative), not public yet | COMPATIBILITY_METHODOLOGY.md, CALIBRATION_BLOCK3.md |
| UX | Landing, 4-step form, calculation animation; results = cover + 8 story chapters, premium (09), technical (10, wheels) | PR #5, #8 |
| Natal interpretation | natal-kb-0.2 (32 cross entries, no aliases) + cosmic-story-0.2 with everyday, action-oriented contact readings. Bilingual corpus 20 readings: repetition 16.5% (target < 15%) | PR #11, #12 |
| Premium | Checkout **simulation**; report = full premium story, HTML/PDF with cover and chapters | PR #6, #8 |
| Payments | Disabled. No provider selected | MONETIZATION.md |
| Supabase / RLS | Draft SQL only, not executed | database/schema-draft.sql |
| Virality (Block 7), Supabase (Block 8) | Not started (only pre-existing share cards) | — |

| Privacy | History cleaned (12 branches, verified), 15 artefacts + 21 CI logs deleted. Repo still **public** until the founder flips it | PRIVACY_INCIDENT.md |
| CI costs | Restructured for the private quota (≈ 1,500 of 2,000 min/month estimated) | DEPLOYMENT.md |

**Milestone FOUNDER_BETA_READY:** NOT READY. Gates 5 and 7 are open, and the final-commit preview is pending. See FOUNDER_BETA_READINESS.md.
