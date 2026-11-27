# Project status (2026-11-27)

Integration branch: `feature/cosmic-match-foundation` @ 85e9d3e (PR #2 merged). Open Claude PRs, in merge order:

| PR | Branch | Base | Scope | CI |
|---|---|---|---|---|
| #3 | `claude/geo-p0-fix` | feature/cosmic-match-foundation | **P0** geography catalog in deploy build, adaptive shards, picker states | Foundation ✓ · World import ✓ |
| #4 | `claude/synastry-0.2` | feature/cosmic-match-foundation | Block 4 symbolic-0.2 candidate (flag) | ✓ |
| #5 | `claude/product-experience` | claude/geo-p0-fix (+ merges #4) | Block 5 redesign + SVG wheels | ✓ |
| #6 | `claude/checkout-sim` | claude/product-experience | Block 9 checkout simulation | ✓ |
| #7 | `chatgpt/story-first` (ChatGPT) | claude/checkout-sim | Story-first results v1 | ✓ |
| #8 | `claude/cosmic-story-v2` | chatgpt/story-first | Natal engine + 8-chapter Cosmic Story + chaptered premium report | see PR |

| Module | Status | Evidence |
|---|---|---|
| Geography (GeoNames) | World catalog: 248 countries, 5.66 M places, 5,995 shards, max 204 KB gzip; deploy build fails without real data | PR #3, QA_REPORT |
| Live Cloudflare site | **Not verified** (no access). Owner must confirm build command `npm run build`, output `out` | DEPLOYMENT.md |
| Local time → UTC | 1900+, pre-1970 flagged | validated vs zoneinfo |
| Planets, ASC/MC, Placidus, mean node | Validated vs Swiss Ephemeris (≤17.5″ planets, ≤0.1″ angles/cusps) | tests/ephemeris-reference, houses |
| Chiron, true node, topocentric | Not implemented | TD-05 |
| Score | `symbolic-0.1` default (golden 49); `symbolic-0.2-candidate` behind `?scoring=0.2` (golden 54), awaiting CTO weights review | PR #4 |
| UX | Landing, 4-step form, calculation animation; results = cover + 8 story chapters, premium (09), technical (10, wheels) | PR #5, #8 |
| Natal interpretation | Layer A evidence + natal-kb-0.1 + cosmic-story-0.1; free ~1,430 words, premium ~3,280; LLM adapter prepared, disabled | PR #8, NATAL_METHODOLOGY.md |
| Premium | Checkout **simulation**; report = full premium story, HTML/PDF with cover and chapters | PR #6, #8 |
| Payments | Disabled. No provider selected | MONETIZATION.md |
| Supabase / RLS | Draft SQL only, not executed | database/schema-draft.sql |
| Virality (Block 7), Supabase (Block 8) | Not started (only pre-existing share cards) | — |
