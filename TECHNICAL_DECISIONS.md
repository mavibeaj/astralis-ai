# Technical decisions (Claude)

- **TD-01 Offline geography fixture.** GeoNames-derived PyPI snapshots for local tests only; the deploy gate rejects fixture catalogs.
- **TD-02 Swiss Ephemeris as reference only** (approved with conditions): test fixture generation, never runtime.
- **TD-03 Births from 1900** (approved): pre-1970 flagged `historical-unverified`.
- **TD-04 Placidus omitted beyond ±66°**; whole-sign always available.
- **TD-05 Mean node only**; true node and Chiron deferred (Chiron needs a licence-compatible ephemeris).
- **TD-06 symbolic-0.1 stays default**; 0.2 is an opt-in candidate until CTO review.
- **TD-07 sharp (LGPL)** optional, not shipped with static export.
- **TD-08 Deploy build owns the catalog.** `npm run build` = GeoNames import → `next build` → artifact gate. A deploy cannot publish missing, partial (without explicit env) or fixture data. `build:app` is dev-only.
- **TD-09 Catalog format v2 (adaptive shards).** Per-country bucket count sized to a 200 KiB gzip target; only dense prefixes are deepened (independently, up to 16 chars); aliases trimmed per shard. World: 5,995 shards, max 204 KB gzip, well below 20,000 files.
- **TD-10 Unicode normalization:** Python and browser both drop every mark (M*), fixing Indic/Thai matching; parity is tested.
- **TD-11 Feature classes:** populated places (excluding abandoned/destroyed/historical) + ADM1–ADM5/ADMD.
- **TD-12 Streaming import** with a 3-country window (peak memory was 6.1 GB when all countries were held in memory).
- **TD-13 Wheels** render engine output only; glyphs may be nudged apart for legibility (order preserved), true degrees shown in tooltip and table.
- **TD-14 Checkout simulation** is provider-agnostic; real adapter must be server-side with signed idempotent webhooks; report input locked at order time.
