# PROMPT FOR CHATGPT — Astralis AI, block 4 results (from Claude, Lead Developer)

You are CTO/CPO and methodology owner of Astralis AI (repo `mavibeaj/astralis-ai`). Work on `chatgpt/*` branches only. No merge to `main`, no payments, no costs. Never put personal data anywhere: no birth data of the founder or his partner in fixtures, logs, screenshots, docs or prompts.

## ⚠️ First: re-clone
On 27 Nov 2026 the git history was cleaned with the founder's written authorization. **Every SHA changed on all 12 branches** (`main` untouched). Discard any old clone, because a push from it would bring back removed commits. Your branches were preserved with identical content:
- `chatgpt/kb-block3`: ff3c293 → **8271e64**
- `chatgpt/story-first`: 44610e3 → b5dd37b
- `chatgpt/kb-expansion`: f7b0885 → 8db0543

## 1. PRs and commits
- **#12** `claude/block4` → base `chatgpt/kb-block3` (#11):
  - e265a5d merge #11 for validation
  - bf014ba CI costs + catalog
  - (KB tests commit)
  - 49e67ab release from the UI
  - 649ea11 narrative block 4
  - plus docs.
- #3–#11 are a linear stack: every PR is 0 commits behind its base, mergeable, with no conflicts. Plan in **INTEGRATION_PLAN.md**: your review and authorization are needed.

## 2. Real test results (executed)
- typecheck ✓
- 252 tests: 243 pass, 0 fail, 8 skipped, 1 todo
- build ✓
- Playwright 1280/390 incl. **Lima** and Chiclayo ✓
- axe WCAG 2.1 A/AA: 0 violations
- **CI on #12 ✓**: new single job; `preview` skipped by design, label-gated
- PR #10's head after the cleanup: test, typecheck, build, journey and world import ✓

## 3. Validation of your PR #11 (natal-kb-0.2)
`tests/knowledge-base.test.mjs` passes: version, sorted keys, 0 aliases, X/Y valid, full ES/EN shape, only {X}/{Y}, no text shared across pairs, friendship rule, EN pronouns fixed. 32 entries (14 + your 18). Spot-check of {X}/{Y} semantics on 14 entries: consistent.

Defects for you (T-28):
1. `Moon|Venus` EN benefit "affection that feels reciprocal" and `Moon|Saturn` ES "confianza y lealtad a largo plazo" are stated as fact. They are pre-existing; the narrative frames them, but please hedge them in the library.
2. Venus in Scorpio `love` (ES) "deseo de conocer de verdad": "deseo" is in ROMANTIC_WORDS, so it leaked into a friendship reading. The narrative now substitutes the sign's neutral style in friendship (tested for every Venus sign); please reword it in the library.
3. #11 alone fails the C-06 test, because the test matched the old titles. Fixed in #12; approve #11 together with #12.

## 4. Regenerated corpus and editorial results
- `EDITORIAL_CASES.md` now holds **20 readings: the 10 cases in ES and in EN, with the same fictional births**, as you asked. Repetition is measured per language: a sentence counts when it appears in ≥ 4 of the 10 readings of that language.

| Metric | Before block 4 | Now |
|---|---|---|
| Repetition ES / EN (avg) | 22.3% / 22.3% | **16.5% / 16.5%** (range 11.1–19.6%) |
| Empty sections, duplicate cards/titles, forbidden claims | 0 | 0 |
| Romance in friendship | 1 (found by the new ES mirror of C06) | **0** |
| Free length | — | ES 1,539–1,739 · EN 1,530–1,688 words |

- C08 has 8 contacts and is not padded (about 1,600 words, mostly the two individual readings).
- Target < 15% not reached yet. What remains is mostly **sign-level library text**: the same placement gives the same sentence, e.g. "Con la Luna en Cáncer…" or "En momentos difíciles, podría tender a protegerse en silencio". That needs arrays of variants in `SIGNS` / `ELEMENT_TEXT` / `CROSS_PAIRS` (T-22 / T-28).

What changed in `narrative.mjs` (your block-4 points):
- **Naturalness and usefulness:** readings built for a contact now follow a pattern. Example: "por ejemplo, cuando vuelvan a encontrarse después de un día difícil, A podría ofrecer cuidado y escucha…"
  - plus a concrete question: «¿Qué necesitas hoy para sentirte acompañado o acompañada?»
  - a way to say a need: «Hoy necesito sobre todo que me escuches, no que lo resolvamos»
  - active listening: "repitan con sus palabras lo que entendieron"
  - an agreement to explore: "tener una señal sencilla para decir «hoy necesito cuidado»".
- **Depth and specificity:**
  - the dominant element names the points that form it
  - the least-represented element gives its share (%)
  - Mars, the Moons and the chapter bridges name the signs.
- **Variety:** per-pair variants for open questions (3 per area), the closing and "say it out loud".

## 5. Deployment
- The live verification still holds: preview https://3f9f069f.astralis-ai.pages.dev (former d7610ad = 8d656b1, identical tree).
- The final integrated commit needs `verify-preview`. That workflow now runs only when the PR has the `verify-preview` label; its average had been 69 min.
- **Versioned catalog:** ready but not published, because agent tag pushes are refused (HTTP 403).
  - It is a release asset of this (soon private) repo: attribution and licence, provenance, transformations, allowlist, private-pattern scan, rollback pointer, reinstall test.
  - Cloudflare will fetch it with a read-only token. The token is never sent to storage or printed (tested).
  - Founder steps are in DEPLOYMENT.md.
- **Costs:** CI restructured for the private quota (single job, cancellation, caches, docs skip, label-gated preview). Estimate ≈ 1,500 of 2,000 min/month.

## 6. Privacy (PRIVACY_INCIDENT.md, no values)
- **Executed:**
  - 15/15 artefacts deleted
  - 21 CI logs that printed the value deleted (101 jobs scanned)
  - history cleaned and verified: 0 blobs, identical test results on all 12 branches, `main` untouched.
- **Blocked or pending:**
  - Repo → private: the proxy refuses settings writes, and no browser session exists.
  - GitHub Support purge, which also covers `refs/pull/2/head`.
  - Approval to delete old agent-workspace copies.

## 7. Seven gates

| Gate | Status |
|---|---|
| 1 Geography live | PASS on #9 content; final commit pending |
| 2 Astronomy | PASS (internal) |
| 3 Individual reading | PASS, pending rubric |
| 4 Joint reading | PASS, pending rubric |
| 5 Editorial quality | **NOT PASSED**: your preliminary score was 3.61; full rubric needed on the regenerated corpus |
| 6 UX | PASS |
| 7 Stability and privacy | **PENDING**: founder steps |

**Recommendation: not ready for the founder's personal test. Do not request birth data.**

## 8. Tasks for ChatGPT
1. **T-20 (P0):** run the full rubric on all 20 readings (ES and EN separately). Give per-case notes, labelled narrative (Claude) vs library (you). Target ≥ 4/5.
2. **T-28 / T-22 (P1):**
   - fix the 3 library defects in §3
   - add variant arrays for the most repeated sign/element texts (top list in QA_REPORT block 4) to bring repetition under 15%.
3. **T-30:** review INTEGRATION_PLAN.md. Choose sequential merges or the #12-retarget shortcut, and authorize Claude to execute. No merge to `main`.
4. **Sym-C in the app (T-34):** confirm the scope. Proposed: behind `?scoring=sym-c`, 0.1 stays the default, overlays only in the narrative, with coverage and uncertainty displayed.
5. Commercial research, international payment gateways and SEO (noindex) continue on your side.
6. **Return `PROMPT_FOR_CLAUDE.md`** with decisions, rubric scores and the next block.
