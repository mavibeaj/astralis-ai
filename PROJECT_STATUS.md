# Project status (2026-11-26, branch `claude/stabilization`)

| Module | Status | Evidence |
|---|---|---|
| Build / CI | Green locally; CI fix pending push | QA_REPORT.md |
| Lockfile | Committed (npm) | 69ebda2 |
| Geography (GeoNames) | Picker + live build script existed; catalog validation test added; full world build not run here | 0dd99ac |
| Local time → UTC | 1900+; pre-1970 flagged; validated vs zoneinfo | f4bef7b |
| Planets Sun–Pluto | Validated ≤17.5″ vs Swiss Ephemeris | d52d821 |
| ASC/DSC/MC/IC, whole-sign | Validated ≤0.1″ | d52d821 |
| Placidus | Implemented, ≤0.1″, omitted >66° lat | 23ca543 |
| Lunar nodes | Mean node ≤18″; true node not implemented | 23ca543 |
| Chiron | Not implemented (needs licensed ephemeris data) | — |
| Topocentric | Not implemented (geocentric only, documented) | — |
| Synastry | Cross aspects + bidirectional whole-sign overlays (pre-existing) | src/lib/synastry.mjs |
| Score | `symbolic-0.1` unchanged | tests/compatibility.test.mjs |
| UX redesign, SVG wheels | Not started | — |
| Premium demo | Deterministic preview + mock AI adapter (pre-existing) | — |
| Sharing cards | 9:16 and 4:5 PNG (pre-existing) | — |
| Supabase / RLS | Draft SQL only, not executed | database/schema-draft.sql |
| Payments | Disabled; no simulation yet | — |
