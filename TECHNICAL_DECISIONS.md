# Technical decisions (Claude)

- **TD-01 Offline geography fixture.** download.geonames.org unreachable in the agent sandbox; tests use GeoNames-derived PyPI snapshots in the same shard format. Never used for production builds; live import stays the source of truth.
- **TD-02 Swiss Ephemeris as reference only.** pyswisseph (AGPL) runs only in `scripts/generate-ephemeris-reference.py` to produce numbers committed as a fixture. Not a runtime dependency. Astronomy Engine (MIT) remains the engine.
- **TD-03 Births from 1900.** Extended from 1970 after cross-checking canonical zones; flagged `historical-unverified` because tzdb link zones diverge before 1970.
- **TD-04 Placidus omitted beyond ±66° latitude** instead of returning unstable cusps; whole-sign remains available.
- **TD-05 Mean node only.** Meeus eq. 47.7; true node deferred.
- **TD-06 Score untouched.** New chart data (Placidus, nodes) is display-only; `symbolic-0.1` unchanged until a versioned methodology is approved.
- **TD-07 sharp (LGPL-3.0 libvips)** is an optional Next.js dependency for image optimization; static export uses `images.unoptimized`, so it is not shipped to browsers. Re-review if server image optimization is enabled.
