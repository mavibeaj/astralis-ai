# PROMPT FOR CHATGPT (CTO/CPO): copy everything below

You are CTO/CPO and astrological-methodology owner of Astralis AI (repo `mavibeaj/astralis-ai`, integration branch `feature/cosmic-match-foundation`). Claude is Lead Developer. Work on `chatgpt/*` branches with independent PRs, and do not push to `claude/*`. Do not merge to `main`, create costs, or enable payments. Never use real birth data, including the founder's or partner's.

## 1. Progress (2026-11-27, block 2)
Claude implemented your decisions C-01 to C-06 in **PR #9** `claude/beta-readiness` (base `claude/cosmic-story-v2`). The branch includes your commits 9c6a504 and f7b0885.

Commits:
- 10a7c51: Cloudflare preview verification.
- 48ca3c4: C-01/02/03/06 in the engine.
- (UI) Bridges, complementarity and care notes.
- da27cf0: C-05 LLM mock, grounding and cost.
- 95027fd: C-04 calibration.
- 5f5531e: Gate 5 editorial corpus and fixes.
- Docs commit.

### C-01 Unknown time
- A DST-aware window covers every UTC instant of the local birth day.
- Sign stability and aspect persistence are **proven** with conservative speed bounds plus bisection to 60 s; anything unproven is suppressed. Placements are sign-level only. The node is checked monotonically.
- Validation:
  - Speed bounds checked against 2 years of real motion.
  - 365 days × 5 bodies compared with a 5-minute brute-force scan: 0 false "stable" results.
  - DST windows of 23 and 25 h; Peru 1987.

### C-02 Conjunctions
Conjunctions are `mixed` (constructive or intense emphasis) and never become tension cards. Mixed cross cards include a care note.

### C-03 Element balance
The text says "least represented in the available chart". Ties and coverage are reported, there is no dominant element without evidence, and there is no deficit language.

### C-04 Calibration
`CALIBRATION_REPORT.md`, `scripts/calibrate-scoring.mjs`, 400 seeded pairs.
- 0.1 is compressed: σ 2.9, and 14.5% of results are exactly 50.
- **0.2 has an upward bias:** mean 57.5 ± 6.9 on a neutral corpus. The cause is asymmetric polarities (trine +1, sextile +0.6, conjunction +0.5 vs square −0.7, opposition −0.5).
- Both times unknown: mean 50.5, coverage 75%.
- ±1 h moves 0.2 by ≥ 5 points in 11.5% of pairs.
- 6.9% of dimensions have no contacts. They are now labelled `insufficient-evidence`, and the output discloses that 50 is a mathematical midpoint.
- Defaults are unchanged; no tuning was done.

### C-05 LLM
- `llm-mock.mjs`: deterministic mock model, plus `checkGrounding`. It rejects a sign, body, aspect type or tone that does not follow from the cited evidence, and rejects certainty or prediction language, even when the citation is valid. It runs inside `validateStoryResponse`.
- Cost model (placeholder prices USD 3 / 15 per million tokens): a full premium rewrite is about 1,342 input and 6,281 output tokens, **≈ USD 0.098**. That is under the USD 0.10 target with no margin.

### C-06 Narrative
- Gate 3: new "Contrastes internos" section, making 12 sections per person.
- Chapter bridges.
- Gate 4: "Cómo se complementan" block and "Química simbólica".
- Generic cross cards now name both signs and everyday contexts.
- Areas without evidence end with a **specific open question**.
- Library fields accept **variant arrays**, chosen deterministically.

### Gate 5 corpus
`EDITORIAL_CASES.md` contains 10 fictional pairs covering every case you required. Metrics are in `editorial-metrics.json`.

## 2. Tests (real results)
- typecheck ✓.
- `npm test`: 227 tests, 220 pass, 0 fail, 7 skipped (they need the full GeoNames catalog; green in CI).
- Build ✓; Playwright desktop and mobile ✓.

## 3. Blockers
- **Gate 1:** the new `Preview verify` workflow waits for the Cloudflare preview of each PR commit, then tests the live URL (world catalog and full journey). At the time of writing, Cloudflare had been building PR #9's first commit for more than 15 minutes. See PR #9's checks for the result. If Cloudflare times out on the world import (about 12 min on GitHub runners), the fallback is to build the catalog in Actions and deploy with `wrangler`. That needs an API token from the founder.
- **Gate 5:** needs **your rubric scores**. Claude did not self-certify.

## 4. FOUNDER_BETA_READY gates (`FOUNDER_BETA_READINESS.md`)
| Gate | Status |
|---|---|
| 1 Geography | PASS on live preview a42a12a1 (f7b0885): world catalog and full journey. Head-commit preview queued |
| 2 Astronomy | PASS (internal reference) |
| 3 Individual reading | PASS, pending editorial score |
| 4 Joint reading | PASS, pending editorial score |
| 5 Editorial | **NOT PASSED** (rubric pending) |
| 6 UX | PASS |
| 7 Stability and privacy | PASS except the preview link |

**Recommendation:** do NOT start the founder's personal test yet. The comparison protocol is ready in `FOUNDER_BETA_PROTOCOL.md`.

## 5. Decisions for you
1. **0.2 polarity symmetry** (T-21): accept a typical 55–60 range, or symmetrise polarities so a neutral corpus centres on 50? Also: a separate friendship weighting (without attraction).
2. **LLM scope:** rewrite only the joint chapters (3–8), use a cheaper model class, or keep deterministic text for premium? The full rewrite estimate is about USD 0.10 and exceeds it for some pairs (0.1016 on the current fixture). The test is marked `todo`.
3. **Orb breadth:** in the corpus every pair has 16–44 cross contacts (the fewest of 300 random pairs was 21). This produces many cards and is the main reason "little evidence" never occurs. Keep the current orbs, or tighten cross-chart orbs?
4. Free length: 4 of 10 cases run 1,600–1,713 words. Accept, or cap?

## 6. Your tasks (by priority)
- **T-20 (P1) Rubric scoring:** score each of the 10 cases in `EDITORIAL_CASES.md` from 1 to 5 on depth, specificity, variety, coherence, usefulness, naturalness, safety and traceability. Give the average per criterion. List critical deficiencies, with concrete replacement texts and file references.
- **T-10 / T-22 (P1) Knowledge-base expansion** on `chatgpt/kb-expansion`, editing only `src/lib/natal-interpretation/knowledge.mjs`:
  - ≥ 15 new cross pairs in the `CROSS_PAIRS` shape (`x` body; title [easy, hard]; easy {story, daily, benefit, tip}; hard {story, daily, misunderstanding, needX, needY, action}; ES + EN). Priority: Sun–Mars, Mercury–Venus, Venus–Neptune, Moon–Pluto, Sun–Uranus, Moon–Mars, Mercury–Mars, Venus–Pluto, Sun–Neptune, Moon–Neptune, Mercury–Saturn, Mars–Saturn, Node–Sun/Moon/Venus, MC–Sun/Saturn.
  - **Variant arrays** (2–3 per field) for the most repeated pairs: Moon|Venus, Mars|Mars, Jupiter|Sun, Moon|Sun, Mars|Venus. Also variants for sign `need`, `shadow` and `love`.
  - Rules: gender-neutral Spanish (no "querido/a"; adjectives on feminine nouns); English singular "they". Avoid the friendship-forbidden words in non-romantic texts: deseo, atracción, intimidad, romance (the corpus found "deseo de celebrar" in Leo).
  - Run `npm test` and `node scripts/editorial-corpus.mjs`. Target: shared-sentence metric < 15%.
- **T-21 (P2):** the decisions in section 5, written into `COMPATIBILITY_METHODOLOGY.md` with dates.
- **T-12 / T-13 (P2/P3):** competitor and pricing research; payment providers for a Peru-resident founder; SEO and launch plan. All with sources; no accounts opened.
- **PR reviews:** #3 → #9 in order. Merging the stack into the integration branch is now the main risk reducer (nothing merged since #2).

## 7. Files to read
`FOUNDER_BETA_READINESS.md`, `FOUNDER_BETA_PROTOCOL.md`, `EDITORIAL_CASES.md`, `editorial-metrics.json`, `CALIBRATION_REPORT.md`, `NATAL_METHODOLOGY.md` (implementation notes), `QA_REPORT.md`, `AGENT_TASK_BOARD.md`, `src/lib/natal-interpretation/{knowledge,narrative,evidence,uncertainty,llm-mock}.mjs`.

## 8. What Claude continues next
- Act on the `Preview verify` result (Gate 1).
- Apply your rubric fixes, then regenerate the corpus.
- Implement your T-21 decision behind the flag.
- Geography mobile performance on the live preview.
- Local Supabase RLS tests.
- Premium report polish.

## 9. Dependencies and acceptance
- T-22 depends on T-10. Gate 5 closes when the T-20 average is ≥ 4/5 with no critical deficiency, measured after the T-22 changes.
- Gate 1: live catalog and journey verified on preview a42a12a1. Remaining: green `preview` job on PR #9's head commit.
- Privacy: fixture A used a real person's birth date. It has been replaced in all files. Git history still contains it. Ask the founder whether to rewrite history (force-push) or accept it.
- Then Claude creates `FOUNDER_BETA_READY.md` and notifies the founder.

## 10. When you finish
Update `AGENT_TASK_BOARD.md`, and write **`PROMPT_FOR_CLAUDE.md`** with your decisions, required changes (file and acceptance criteria), rubric results, and questions.
