# QA report (updated 2026-11-27, block 3: PR #10)

## Block 3 (PR #10, `claude/block3`)
**Verification run (all executed):** typecheck ✓ · `npm test` 241 tests, 233 pass, 0 fail, 8 skipped (7 need the full catalog and pass in CI; 1 is the privacy guard, which needs the `PRIVATE_PATTERNS` secret) · `npm run build:fixture` ✓ · Playwright desktop 1280 + mobile 390 ✓, now incl. Lima · axe-core WCAG 2.1 A/AA: 0 violations (1280 and 390).

**Gate 1, live:** Cloudflare deployed PR #9 head `d7610ad` → https://3f9f069f.astralis-ai.pages.dev. The `preview` job on that commit passed: catalog v2 `geonames:world`, 248 countries, 5,662,438 places, `PE/0.json` 200 `application/json` br 151,460 bytes, and the full journey incl. Chiclayo. Lima was checked by hand in the built-in browser on that URL: "Lima, Lima Province, Perú", −12.04318, −77.02824, America/Lima. PR #10 commits are queued at Cloudflare.

**Deploy failure (c5c8ccb):** "Build failed". The log is only on the Cloudflare dashboard, and no agent has a session there. Build inputs were identical to the previous successful commit (verified with `git diff`). Most likely cause, not confirmed: the per-build GeoNames import (time limit or download). Fix: pinned catalog release (T-23); see DEPLOYMENT.md.

**Privacy:** see PRIVACY_INCIDENT.md (no values). Current files are clean. History, 15 CI screenshot artefacts and CI logs still hold the old fixture date, never next to a name. A QA line that labelled it as personal and the partner's first name were removed (d7610ad).

**Editorial (cosmic-story-0.2), CTO block 3 acceptance:**
| Criterion | Result | How verified |
|---|---|---|
| No empty visible section | 0 in 10 corpus cases. 0 across 24 charts × 2 editions × 2 languages | `block 3: no visible section is empty` |
| Grammatical sentences | Root cause: an adjective template (`style`) fell back to a noun phrase (`gift`). Templates are now field-aware. 0 matches of the bad patterns | `block 3: grammar` + corpus scan |
| One reading per real contact | The 6 library aliases (Asc–Moon→Sun–Moon, Sun–Venus→Moon–Venus, Asc–Mars→Asc–Venus, Jupiter–Moon/Venus→Jupiter–Sun, Asc–Sun→Sun–Sun) are no longer used. Each gets a reading built for that contact (roles: identity, emotional needs, values and affection, initiative…). 0 duplicate stories, 0 duplicate titles | `block 3: one reading per real contact` |
| Three groups | affinities (harmonious) / intense or mixed (conjunctions: possibility + care) / tensions. Mixed contacts never appear as affinities | C-02 test updated |
| No claims from one aspect | "Tienen puntos de encuentro reales" → "La lectura identifica temas simbólicos de afinidad". Benefits framed as "tema por cultivar". "Hay magnetismo" → "puede haber magnetismo" | `block 3: no claims…` |
| C06 (both times unknown) | Sign-level daily comparisons now allowed when the sign is stable all day: daily evidence/signs/questions 1/0/10 → 1/4/6 | metrics |
| C08 low evidence | Now really low evidence (both times unknown): 21 → 8 contacts | metrics |
| Repetition | C07 30.3% → 19.0%. ES cases 17.6–23.8% (block 2: 15–34%) | `sharedAcrossCases` |
| Length | Free 1,614–1,800 (CTO 1,200–1,800). Chapter 3 no longer repeats card stories; daily areas show only the day-to-day line; fixed "space" advice is premium-only; needX/needY are premium-only | metrics, length test |

**Library issues for ChatGPT (knowledge.mjs, not edited by Claude):** EN Leo `need` "free to express itself", Virgo `need` "its contribution", Virgo `shadow` "over-demanding of itself" (use "themselves/their"). Benefits stated as facts ("Confianza y crecimiento mutuo", "Un afecto que se siente recíproco"): narrative now frames them, but the library should hedge them. Aliases: delete them or write their own entries.

**Scoring (CALIBRATION_BLOCK3.md, original seed 20261127 + independent seed 7302026, 400 pairs each):** symmetric polarities lower the time-known mean from 57.5 to 53.2 (validation: 57.8 → 53.6) without forcing 50. House overlays add +2.4 on average (they are mostly positive). Removing both birth times moves the index by −5.3 with the candidate and −0.3 with `sym-c` (overlays off). So the current candidate penalises an unknown time and sym-c does not. Nodes have no effect (±0.1). ±1 h changes the index by ≥ 5 points in 12–16% of pairs in every set.

**Synastry orbs (experimental):** contacts 29.9 → 25.0 (−16%). Cards shown 16 → 15.3. No rise in pairs without affinity or tension. ±1 h stability unchanged (Jaccard ≈ 0.7). Narrower orbs barely change what the reading shows, so the redundancy came from library aliases and repeated text, not from orbs.

**LLM budget (hypothetical price tiers, not provider quotes):** chapters 3–8 rewrite ≈ 4.8 k in / 4.2 k out tokens. Large tier: expected 0.094, worst (1 retry) 0.157 → **deterministic fallback**. Medium tier: 0.031 / 0.052 → within the cap and under the 0.05 target. Small tier: 0.008 / 0.013. The block-2 `todo` cost test was replaced by an enforced budget test.


## Beta readiness block (PR #9)
- **Tests:** typecheck ✓; `npm test` 227 tests, 220 pass, 0 fail, 7 skipped (they need the full GeoNames catalog and pass in CI). Build ✓; Playwright desktop + mobile ✓.
- **C-01 unknown time** (`tests/uncertainty.test.mjs`):
  - DST-aware local-day windows checked: 24 h, 23 h and 25 h (New York 2021), and Peru 1987 at UTC−4.
  - Speed bounds checked against 2 years of real motion; no body exceeded its bound.
  - 365 days × 5 bodies compared with a 5-minute brute-force scan: **0 false "stable" results** across ≥ 30 sign changes.
  - Unknown-time placements are sign-level only (no degree, no house), and the node is checked monotonically.
- **C-02:** conjunctions are always `mixed`, never tense cards; mixed cross cards carry a care note.
- **C-03:** "least represented in the available chart"; ties and coverage reported; no deficit wording (tested).
- **C-04:** `CALIBRATION_REPORT.md`, 400 seeded pairs.
  - 0.1: σ 2.9, with 14.5% of results exactly 50.
  - 0.2 (time known): mean 57.5 ± 6.9, an upward bias from asymmetric polarities.
  - ±1 h changes 0.2 by ≥ 5 points in 11.5% of pairs.
  - 6.9% of dimensions have no evidence and are now labelled `insufficient-evidence`.
- **C-05:** grounding validator rejects a wrong sign, body, aspect or tone, certainty and prediction, even with valid citations (6 tests). Mock model passes end to end. Full premium rewrite estimate: 1,342 input / 6,281 output tokens ≈ **USD 0.098** at placeholder prices, under the USD 0.10 target with no margin.
- **C-06 and Gate 5:** `EDITORIAL_CASES.md` (10 cases) + `editorial-metrics.json`.
  - 0 forbidden claims; 0 romance in friendship, after fixing a false positive the corpus found.
  - Specificity 31–39%; shared sentences 15–34% (ES).
  - Free length 1,473–1,713 words (4 of 10 cases exceed 1,600 by ≤ 7%).
  - Fixes applied during the block: specific ASC/Sun sentences, open questions per area, a broken phrase, and library variant support.
- **Live preview (verified by CI, 27 Nov 2026):** `latest-successful-preview` job → https://a42a12a1.astralis-ai.pages.dev (commit f7b0885). Catalog v2 `geonames:world`, 248 countries, 5,662,438 places; `PE/0.json` 200 `application/json` br 151,460 bytes; Playwright journey passed (Chiclayo → Lambayeque, coordinates in range). Head-commit preview still queued at Cloudflare (serial builds).
- **Fixture privacy fix:** fixture person A had been given a birth date matching personal data. It was replaced in every file, and the Swiss Ephemeris reference was regenerated (pyswisseph 2.10.03, test-only). The value is intentionally not written here. The exposure and purge plan are in PRIVACY_INCIDENT.md.
- **Cost model:** with the new fixture the full premium rewrite is USD 0.1016 (it was 0.098). The 0.10 target is kept and the test is marked `todo` until the LLM-scope decision is made.



## Cosmic Story v2 (PR #8)
- `npm test`: 211 tests, 204 pass, 0 fail, 7 skipped. The skips need the full GeoNames catalog and pass in CI.
- 20 interpretation tests and 15 commerce tests.
- What the tests cover:
  - 11 sections per person, each with evidence.
  - Different people get different text; the same Sun sign with a different configuration gets different text.
  - Every cited id exists in Layer A.
  - Affinities and tensions come only from real cross aspects; none are invented when there is no aspect.
  - Swapping A and B keeps the same affinities and title.
  - Unknown time: stable and unstable Moon, a planet changing sign, Sun ingress day.
  - ES/EN; partner, crush, friendship (no romantic words).
  - Forbidden claims checked across 12 variants; no contradictions; determinism.
  - Length: free 1,000–1,600 words, premium 2,900–5,000.
  - LLM payload has no names, dates, places or coordinates; the response validator works.
  - Chaptered premium HTML.
- Measured on the fictional Chiclayo 1993 / Tokyo 1995 pair:
  - Free: ES 1,426 words, EN 1,345.
  - Premium: ES 3,280 words, EN 2,968.
- Playwright on the static export, desktop 1280 and mobile 390:
  - Cover; ≥ 10 chapters; ≥ 11 cards per person; evidence disclosure; technical chapter closed by default.
  - Wheels on demand; premium excerpt; PNG card.
  - Checkout → report mentions 8 chapters → HTML download → recovery.
  - Unknown-time notice, and the Ascendant shown as not calculable.
  - No JS errors, no horizontal overflow.
  - Screenshots of the cover and chapters 1–8 on both viewports.
- Quality gap found: cross pairs without a library reading produce generic text (assigned to ChatGPT, T-10).

## Previous: P0 geography + Blocks 4, 5 and 9 (2026-11-26)

Earlier results (Blocks 1–3: ephemeris validation, CI root cause) are in git history (`7730b46`).

## P0: empty country and city selectors

**Diagnosis, reproduced on the static production artifact:**
- `npm run build` (plain `next build`) produced no `out/geography/`.
- `GET /geography/countries.json` returned **404 text/html**.
- The country list showed only the placeholder and the city input stayed disabled. There was no error message, because `location-picker.tsx` discarded the failure (`.catch(()=>{})`).

**Not verified:**
- The live site: the agent's fetch of the live site needed an approval that was not answered.
- The Cloudflare build settings: the agent has no access.

ChatGPT's hypothesis (Cloudflare runs `npm run build` rather than `build:world`) matches the artifact behaviour but is not confirmed. The fix works with either command.

**Fix verification:**

| Check | Result |
|---|---|
| `npm run build` without GeoNames access | exit 1 (download error); nothing published |
| Gate on missing catalog / fixture catalog | exit 1, with an explicit message |
| Foundation CI, real GeoNames subset (PE, JP, KE, IS, AU, BR, ES, US, GB) | ✓ build + 25 catalog tests + browser journey |
| Catalog unavailable (404 simulated in browser) | alert, retry button, manual entry; no JS errors |
| Demo data after a Peru selection | picker resyncs (GB), no stale country |

## World import (GitHub Actions, ubuntu-24.04, run 45869784470, real GeoNames)

| Metric | Value |
|---|---|
| Countries/territories | 248 |
| Places (P + ADM1–5) | 5,662,435 |
| Shards / files in `out/` | 5,995 / 6,018 (Cloudflare Pages limit: 20,000) |
| Size raw / gzip | 1.15 GB / 289 MB |
| Largest shard | 982 KB raw · 204 KB gzip (VN/13) |
| Wall time (full `npm run build`) | 12 min 29 s |
| Peak RSS | 6.1 GB before streaming → 2.2 GB after (run 45871881340, wall 11 min 50 s, identical output) |
| Catalog tests | 25/25 pass, 0 skipped |

The catalog tests cover:
- Peru: Lima, Chiclayo, Arequipa, Cuzco/Cusco/Qusqu, Trujillo, Ferreñafe.
- Rural Lambayeque: Pimentel, Monsefú, Reque, Eten, Incahuasi, Cañaris (region, IANA zone, bounding box).
- Duplicate names: "San José" in ≥3 Peruvian regions.
- Non-Latin search: 東京.
- One city per continent: Tokyo, Nairobi, Reykjavík, Alice Springs, São Paulo, Anchorage, Cádiz.
- Every IANA zone is valid; Cloudflare file limits.

**Mobile search** (Playwright, 390 px, 1.6 Mbps / 150 ms, CPU ×4). The local server does **not** compress, so these are pessimistic: Cloudflare serves brotli.

| Query | Chiclayo (first query) | Monsefú | San José | Springfield (US) | São Paulo | 東京 | Delhi |
|---|---|---|---|---|---|---|---|
| Time | 4.9 s | 1.9 s | 2.9 s | 2.4 s | 1.3 s | 1.9 s | 2.3 s |

## Block 4: symbolic-0.2 candidate
- Symmetry on 300 random pairs, including unknown times.
- Determinism.
- No double counting.
- The evidence sum equals the dimension sum.
- Bounds.
- Nodes produce only conjunctions/oppositions.
- Golden values: 0.1 = 49 (unchanged), 0.2 = 54.

## Block 5: UX and wheels
- Wheel geometry tests (8):
  - ASC orientation.
  - Order-preserving spreading, including across 0° Aries.
  - Houses.
  - Unknown time.
  - Synastry cross aspects.
- Playwright journey, desktop 1280 and mobile 390:
  - Landing page.
  - Step validation.
  - Chiclayo → America/Lima with coordinates; Tokyo → Asia/Tokyo.
  - Bi-wheel with ≥20 bodies, 12 houses and aspects; tooltip; exact-degree table.
  - Premium demo; PNG card.
  - Unknown-time partial reading (no houses).
  - No JS errors, no horizontal overflow.
- Defects found and fixed during QA:
  - House-cusp lines and glyphs captured the pointer over planets.
  - The pairwise glyph-spreading algorithm broke planet order; replaced with cluster layout.

## Block 9: checkout simulation
- 14 unit tests:
  - Happy path to fulfilled, then recovery.
  - Idempotent orders.
  - Exactly-once events; tampered events rejected.
  - Decline and retry; network error keeps the order pending.
  - Card-like fields rejected.
  - Payment required before a report.
  - Report input cannot be swapped after purchase.
  - Persistence round-trip.
  - No personal data in the report HTML.
  - Cost under USD 0.10.
- Playwright: decline → retry → approve → report → HTML download → recovery from the landing page.

## Totals on the top of the stack (`claude/checkout-sim`)
- typecheck ✓
- `npm test`: 187 tests, 180 pass, 0 fail, 7 skipped. The skips need the full GeoNames catalog; they pass in CI.
- Static build ✓
- Playwright ✓

## Known limitations
- The live Cloudflare deployment is verified by CI on preview a42a12a1 (commit f7b0885). The head-commit preview is pending.
- The mobile first search is slow on throttled networks.
- The wheel's glyphs are small on 390 px screens (legible, with tooltips).
- The premium report text is the deterministic generator (no generative AI).
- Recovery works on the same browser only (localStorage) until Supabase.
