# Privacy incident — personal birth date in fixtures (no values in this file)

**Status (27 Nov 2026, 23:59 UTC): history cleaned and verified. Artefacts and affected CI logs deleted. Pending: repository visibility (founder, UI only), GitHub Support purge of cached refs, deletion of old local workspace copies (needs a person's approval). Gate 7: PENDING until those three are done.**
First introduced: commit d52d821 (26 Nov 2026, Claude, Swiss Ephemeris reference fixture). The value is never written in docs, messages or commits; searches used a pattern kept outside the repo.

## Executed with the founder's written authorization (27 Nov 2026)
| Step | Result | Verification |
|---|---|---|
| Make repository private | **Not executed: blocked.** The agent's API proxy refuses settings writes (HTTP 403), and the built-in browser has no GitHub session. Claude does not sign in for the founder | — |
| Delete the 15 screenshot artefacts | **Done** (15/15) | IDs re-verified before deletion (name, commit, not expired, smoke at that commit typed the value). Each now returns 404. No other screenshot artefact from an affected commit exists |
| Review CI logs | 221 runs → 54 on commits containing the value → 101 jobs scanned (counts only). **21 `Foundation CI / test` logs** printed it, in test names generated from the old fixture | Masked inspection |
| Delete affected CI logs | **Done** (21/21, only those runs) | Re-scan: 0 matches |
| Backup | Local mirror clone in a private temp folder (not public) | — |
| Dry run of the cleanup | `git filter-repo` on an isolated copy. Text rules from a file outside the repo. The old fixture blob is replaced by its regenerated twin (same generator, only the Lima case differs), so old branches keep consistent ephemeris values. `main` excluded (`^main`) to keep its signed root commit, so every branch keeps the same root | 0 of 322 reachable blobs contain the value. Same commit count on all 12 branches. 0 unexpected changed lines. Tips that were already clean are tree-identical |
| Functional check | Full test suite on every branch, before vs after | **Identical** pass/fail/skip counts and failure names on all 12 branches (PR #11 had 1 pre-existing failure, unchanged) |
| Freeze check | Remote heads compared with the backup immediately before pushing | No change since backup |
| Rewrite | `git push --force-with-lease` per branch (expected SHA), 12 branches. **`main` untouched** | Remote heads = rewritten heads. Fresh mirror: 0 history hits on all branches. Open PRs #3–#12 point to the new heads, all mergeable, 0 behind |
| Local clones | Agent's working clone moved to the clean history, reflogs expired, gc | 0 hits |
| Backups | Securely deleted (`shred`) after verification | — |
| Commit map old→new | Kept **outside** the repo and given to the founder privately. Old SHAs can still resolve on GitHub until Support purges them | — |

## Still pending
1. **Founder:** Settings → General → Danger zone → *Change repository visibility* → Private. Before or right after: see the CI cost section in DEPLOYMENT.md (private repos have 2,000 free Actions minutes/month and 500 MB of artefact storage).
2. **Founder: GitHub Support.** At https://support.github.com/request → "Remove sensitive data", send this text:
   > Repository mavibeaj/astralis-ai. On 2026-11-27 we rewrote history with git-filter-repo to remove personal data from test fixtures (all branches force-pushed; `main` unaffected). Please purge cached views and dangling objects of the replaced commits, and the pull-request ref `refs/pull/2/head` (closed PR #2), which still points to pre-cleanup history. The list of old commit SHAs is available on request.
   Attach the commit map only if Support asks for it.
3. **A person must approve** deleting old local copies in the agent workspace (an old shallow clone, a patch folder, a bundle and a tarball from 26 Nov). They hold the old history. The workspace is private to the session. The agent's safety check blocks deleting workspace directories without approval.
4. **Collaborators (ChatGPT):** discard every old clone and re-clone. Pushing from an old clone would re-introduce the old commits. `--force-with-lease` and the `no-personal-data` guard (once the `PRIVATE_PATTERNS` secret exists) catch this.
5. External copies cannot be recalled: anyone who cloned or forked the public repo before today, Cloudflare's build caches and search-engine caches may still hold old commits. Forks: 0 at the time of the cleanup.

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

## Original proposal (block 3, now executed except where noted above)
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
