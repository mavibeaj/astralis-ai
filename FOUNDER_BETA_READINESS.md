# FOUNDER_BETA_READY: readiness tracker (T-17)

**Status: NOT READY. Do not invite the founder yet.** Gates 1 and 5 are open. `FOUNDER_BETA_READY.md` will be created only when all seven gates pass with verifiable evidence.

Evaluated on branch `claude/beta-readiness` (PR #9), 2026-11-27.

| Gate | Status | Evidence | Open items |
|---|---|---|---|
| 1 Geography | **PASS (live), head preview pending** | Live Cloudflare preview https://a42a12a1.astralis-ai.pages.dev (commit f7b0885, which carries the world-catalog build) was checked by CI on 27 Nov 2026: `countries.json` v2 `geonames:world`, 248 countries, 5,662,438 places; PE has 17 buckets; `PE/0.json` HTTP 200 `application/json` (br). The full Playwright journey on that URL passed, including Chiclayo → Lambayeque with coordinates in range. Cloudflare builds commits one at a time, so PR #9's own head preview is still queued; the `preview` job waits up to 2 h for it. | Green `preview` job on PR #9's head commit (confirms the latest UI, not the catalog). |
| 2 Astronomical precision | PASS (internal) | Swiss Ephemeris reference, 12 cases: planets ≤ 17.5″, ASC/MC ≤ 0.1″, Placidus ≤ 0.1″, mean node ≤ 18″; local→UTC exact; DST windows 23/25 h. DSC/IC are exact oppositions. Natal and synastry aspects come from these positions with the documented orbs (NATAL_METHODOLOGY). | No external platform compared yet (that is part of the founder test). |
| 3 Individual reading | PASS (pending editorial score) | 12 sections per person (incl. inner contrasts). Different charts get different text, also with the same Sun sign. Evidence coverage 95.8–100% of sections (editorial corpus). | Rubric score (Gate 5). |
| 4 Joint reading | PASS (pending editorial score) | Joint story, complementarity, affinities (incl. mixed), differences; 12 daily areas incl. symbolic chemistry, conflict, living together, independence, commitment, growth; advice, questions, closing. No evidence → open question. | Rubric score (Gate 5). |
| 5 Editorial quality | **NOT PASSED** | 10-case corpus in `EDITORIAL_CASES.md` with automatic metrics: 0 forbidden claims, 0 romance in friendship, specificity 31–39%, sentences shared with ≥ 3 other cases 15–34% (ES), 1,473–1,713 words. | Rubric 1–5 by ChatGPT (target ≥ 4/5, no critical deficiency). Library expansion to cut genericity. |
| 6 User experience | PASS | Cover, A, B, story, compatibilities, differences, daily life, advice, premium demo, optional technical chapter (closed). Playwright desktop 1280 and mobile 390, screenshots of every chapter. | — |
| 7 Stability and privacy | PASS except the preview link | typecheck ✓; 227 tests (220 pass, 0 fail, 7 skipped locally and passing in CI); build ✓; Playwright ✓; no payments; no personal data in the repo. | Preview of the evaluated commit (Gate 1). |

**Next check:** when `Preview verify` is green and ChatGPT has scored the corpus (≥ 4/5 average), Claude creates `FOUNDER_BETA_READY.md` and sends the founder the agreed message.
