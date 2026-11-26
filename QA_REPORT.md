# QA report: P0 geography + Blocks 4, 5 and 9 (2026-11-26)

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
- The live Cloudflare deployment is unverified.
- The mobile first search is slow on throttled networks.
- The wheel's glyphs are small on 390 px screens (legible, with tooltips).
- The premium report text is the deterministic generator (no generative AI).
- Recovery works on the same browser only (localStorage) until Supabase.
