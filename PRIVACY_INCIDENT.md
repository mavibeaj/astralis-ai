# Privacy incident — personal birth date in fixtures (no values in this file)

**Status:** contained in current files. Purge of history and CI artefacts awaits the founder's authorization. **Gate 7: PENDING privacy review.**
**Found:** 27 Nov 2026 by Claude (Lead Developer), who also introduced it (commit 6983bf9, 26 Nov 2026). The value is never written in docs, messages or new commits. Searches use a pattern held outside the repo.

## What was exposed
| Item | Finding |
|---|---|
| Data | One calendar date matching personal data. It was paired with an **invented** time and with Lima/Chiclayo coordinates (city-level GeoNames values, not an address). |
| Name next to it | **None.** Fixture person was "Ana". The founder's first name appears in the repo only as a role ("Founder (…)"), never with the date. No surname, no partner data. |
| Labelling | Commit c5c8ccb's QA_REPORT line described the date as a real person's birth date, which links it to a person. **Removed in d7610ad** (still in history). |
| Partner's first name | Appeared in FOUNDER_BETA_PROTOCOL.md and PROMPT_FOR_CHATGPT.md (e8d61da), with no birth data. Replaced with "partner" in d7610ad (still in history). |
| Files that ever held the date | 10: tests (5), Playwright smoke, editorial corpus + EDITORIAL_CASES.md, Swiss Ephemeris reference script + fixture, QA_REPORT.md |
| Commits touching it | 8 across branches. Branch tips still containing it: `feature/cosmic-match-foundation`, `chatgpt/story-first`, `chatgpt/kb-expansion`, `claude/checkout-sim`. `main`: none |
| PR bodies, comments, reviews (#1–#9) | None |
| Forks / releases | 0 / 0 |
| Shipped site (`out/`, Cloudflare previews) | Not included (tests and docs are not part of the static export) |
| CI screenshot artefacts | **15** artefacts from runs whose smoke test typed the date into the form (IDs below). Downloadable by any signed-in GitHub user until they expire (3–11 Dec 2026) |
| CI logs | 214 workflow runs. Test logs may print fixture values. Logs are public on a public repo |

## Proposed purge (needs explicit founder authorization: it rewrites history)
1. **Now, non-destructive (done):** every current file is clean (d7610ad, plus a guard test that fails if the pattern reappears in tracked files; the pattern is read from an env var / CI secret, not stored).
2. **Delete the 15 screenshot artefacts** via API (`DELETE /repos/{o}/{r}/actions/artifacts/{id}`). This is permanent, so it needs your "yes". Otherwise they expire by 11 Dec.
3. **Rewrite history** with `git filter-repo --replace-text` (the value → a neutral date) on all 11 branches. Then force-push and ask collaborators to re-clone. Side effects: every commit SHA changes, open PRs #9 and #10 must be recreated, and Cloudflare/CI links to old SHAs break.
4. **GitHub cached refs:** PR refs (`refs/pull/N/head`) and cached views keep the old commits even after a force-push. Only **GitHub Support's sensitive-data removal** purges them, and you file it as the repo owner.
5. **Optional, simpler:** make the repo private while beta work continues (Settings → General → Danger zone). Cloudflare Pages keeps deploying from a private repo.
6. Delete old workflow runs' logs (`DELETE /repos/{o}/{r}/actions/runs/{id}/logs`) for runs before d7610ad. This is permanent too, and needs your "yes".

**Recommendation:** 5 now (one click, reversible), then 2 + 3 + 4 together in one window once PR #9/#10 are reviewed, so the rewrite happens once.

## Prevention
- Fixtures use dates generated for the test (fictional), documented as such. No agent copies data from the founder's profile, chat or memory into the repo.
- Guard test `tests/no-personal-data.test.mjs` scans tracked files for patterns supplied through `PRIVATE_PATTERNS` (CI secret / local env). It skips when unset, so the patterns are never committed.

## Exposed screenshot artefact IDs (artefact id · name · commit · expires)
- 15220467021 · preview-screenshots · e8d61da · 2026-12-11
- 15220000627 · latest-preview-screenshots · a6303d4 · 2026-12-11
- 15219401148 · browser-preview · 5f5531e · 2026-12-04
- 15219279172 · browser-preview · a6303d4 · 2026-12-04
- 15219096595 · browser-preview · e8d61da · 2026-12-04
- 15219088510 · browser-preview · f4c93ed · 2026-12-04
- 15218960681 · browser-preview · da27cf0 · 2026-12-04
- 15217850441 · browser-preview · 10a7c51 · 2026-12-04
- 15206972012 · browser-preview · b052fbb · 2026-12-04
- 15206578443 · browser-preview · f604a0a · 2026-12-04
- 15206405632 · browser-preview · 44610e3 · 2026-12-04
- 15145250721 · browser-preview · e05c145 · 2026-12-03
- 15144961267 · browser-preview · 25da47e · 2026-12-03
- 15143032479 · browser-preview · d98e605 · 2026-12-03
- 15142668124 · browser-preview · 6983bf9 · 2026-12-03
