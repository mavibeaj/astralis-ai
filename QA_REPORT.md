# QA report — branch `claude/stabilization` (base `feature/cosmic-match-foundation` @ abcd934)

Environment: Node 22.23.5, npm 10.9.9, Next.js 16.4.6, Chrome for Testing 153, Playwright 1.56.1. Date: 2026-11-26.

| Check | Command | Result |
|---|---|---|
| Install | `npm install` → `package-lock.json` committed | OK, 0 vulnerabilities (`npm audit`) |
| Typecheck | `npm run typecheck` | OK |
| Unit tests | `npm test` | **140/140 pass** (60 before this branch) |
| Build | `npm run build` (static export) | OK, `out/index.html` present |
| Browser E2E | `CHROMIUM_PATH=… node tests/browser-smoke.mjs` | OK desktop 1280×900 and mobile 390×844, no page errors, no horizontal overflow |
| Secret scan | `git grep` + full `git log -p` for key/JWT/service-role patterns | No findings |

## CI root cause (Foundation CI red since run #107, commit 25d83f8)
The time-zone field is `<input list>` → ARIA role `combobox`. `browser-smoke.mjs` used `getByRole('combobox')` (2 matches → Playwright strict-mode error) and read the zone as a `textbox`. Only the `build` job failed (no screenshots uploaded). Fixed in 1140979 by selecting by label. Reproduced and verified locally; **not yet verified on GitHub Actions** (this session cannot push).

## Astronomical validation (tests/ephemeris-reference.test.mjs, tests/houses.test.mjs)
Reference: Swiss Ephemeris 2.10.03 (Moshier, independent of Astronomy Engine) and Python `zoneinfo` (tzdb 2026) for local→UTC. 12 fictional cases, 10 locations on 5 continents, 1944–2024, incl. Peru DST (1987), UK double summer time (1944), US DST change day.

| Quantity | Max deviation observed | Test tolerance |
|---|---|---|
| Sun | 1.0″ | 5″ |
| Moon | 2.1″ | 10″ |
| Mercury–Pluto | 17.5″ (Neptune) | 30″ |
| Ascendant / MC | 0.1″ | 5″ |
| Placidus cusps | 0.1″ | 5″ |
| Mean lunar node | 17.8″ | 30″ |
| Local → UTC | exact, 12/12 | exact |

Frame: geocentric, tropical, true ecliptic and equinox of date, apparent positions. Topocentric correction is **not** applied (Moon parallax up to ~1° — astrology convention is geocentric; document if topocentric is ever offered).

Pre-1970 time zones: Intl/ICU vs zoneinfo agreed on 27 canonical zones × 280 samples (1900–1969), but 318/4000 random samples disagreed, concentrated in tzdb *link* zones (e.g. Atlantic/Reykjavik, Africa/Kinshasa). Hence pre-1970 results carry `tzdbConfidence: 'historical-unverified'` and a UI warning.

## Geography (tests/geography-catalog.test.mjs)
GeoNames download is blocked in this sandbox; validated with an offline fixture built from GeoNames-derived PyPI snapshots (geonamescache 3.0.2 cities500 + reverse_geocoder 1.5.1): 30 countries, 16/16 checks pass — Lima, Chiclayo, Arequipa, Cusco (also via "Cuzco"/"Qusqu"), Trujillo, Ferreñafe; Tokyo, Nairobi, Reykjavík, Alice Springs, São Paulo, Anchorage, Cádiz; all IANA zones valid; Cloudflare limits (≤20 000 files, ≤25 MiB/file).
**Not validated here:** small rural Peruvian localities (fixture only has population ≥ 500) and the full world build. CI now runs the catalog test after the live PE import.

Size observation (fixture, extrapolation): US 21 783 places → largest shard 520 KB. Full GeoNames US has roughly an order of magnitude more P/A features, so a single search shard could reach several MB — a mobile UX risk, below the 24 MiB guard. See NEXT_TASKS.

## Known UX defect (not fixed)
After choosing a catalog place, "Try with fictional data" replaces the place/zone but the country `<select>` keeps the old country (picker state is internal).
