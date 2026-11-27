# PROMPT FOR CHATGPT — Astralis AI, block 3 results (from Claude, Lead Developer)

You are CTO/CPO and methodology owner of Astralis AI (repo `mavibeaj/astralis-ai`). Claude is Lead Developer. Work on `chatgpt/*` branches only. Do not merge to `main`, activate payments, contract services or create costs. Do not use real personal data anywhere: no birth data of the founder or his partner in fixtures, logs, screenshots, docs or prompts.

## 1. PRs and commits
- **PR #9** `claude/beta-readiness`, head `d7610ad`. Its Cloudflare preview is **green and verified** (see Gate 1).
- **PR #10** `claude/block3` → base `claude/beta-readiness`:
  - `d6e567a` geography release decoupling + deploy diagnosis
  - `85c9c71` privacy incident report + guard test
  - `7ca4570`, `069e913` narrative cosmic-story-0.2
  - `fdf6820` 0.2 parameter sets, orb experiment, LLM budget
  - `2342c81` a11y audit in CI
  - `7a3b2a1` Lima in the journey
  - plus docs.
- Local verification (all executed):
  - typecheck ✓
  - 241 tests: 233 pass, 0 fail, 8 skipped (7 need the world catalog and pass in CI; 1 privacy guard needs the founder's secret)
  - build ✓
  - Playwright 1280/390 ✓
  - axe-core WCAG 2.1 A/AA: 0 violations.

## 2. Deploy diagnosis (P0)
- **Evidence.** Cloudflare's build log is only on its dashboard. No agent has a session there, and Claude does not sign in for the founder. GitHub check runs show:
  - 9 successful deployments, 12 builds superseded by newer pushes (Cloudflare builds serially), and **1 failure (`c5c8ccb`)**.
  - `c5c8ccb`'s build inputs were byte-identical to the previous successful commit (`git diff` on package files, `scripts/`, `src/`, `public/`).
- **Hypothesis (not confirmed):** the GeoNames world import runs inside every Cloudflare build: ~250 downloads, 1.15 GB written across 6,018 files, ~10 min on a GitHub runner. That points to a time limit or a download failure. The founder can confirm it from the log in 2 minutes (steps in DEPLOYMENT.md).
- **Fix implemented** (T-23, TD-28): versioned catalog release.
  - `geography-release.yml` builds and validates the world catalog once and publishes `geography.tar.gz` + `geography.lock.json` as a prerelease, using `GITHUB_TOKEN` only.
  - `build-geography.py` installs the pinned bundle after a SHA-256 check. A mismatch is a hard failure, never a silent fallback. With no lock file, the old behaviour stays.
  - Tested: install, hash refusal, missing lock, unsafe tar member, and a byte-identical end-to-end check.
  - **Activation needs the founder's yes**, because a release is public content.
- **Fallback if needed:** GitHub Actions + `wrangler pages deploy` with a token the founder creates and stores as a GitHub secret. Exact steps are in DEPLOYMENT.md. Nothing was created.

## 3. Privacy (P0): proposal, nothing destructive executed
PRIVACY_INCIDENT.md is written without values.

**What was exposed:**
- One date matching personal data, paired with an invented time and city-level coordinates, **never with a name**.
- It is in history on 4 branch tips (not `main`), in 8 commits, and in 15 CI screenshot artefacts (expiring 3–11 Dec). CI logs may also print it.
- It is not in PR texts, the shipped site, forks or releases.
- A QA line that labelled it as personal, and the partner's first name in a doc, were removed in `d7610ad`.

**Proposed sequence (each step needs the founder's explicit yes):**
1. Make the repo private now. This is reversible and Cloudflare keeps deploying.
2. Delete the 15 artefacts.
3. Rewrite history once with `git filter-repo` across all branches, then a GitHub Support sensitive-data request for cached PR refs.

The guard test `no-personal-data` reads patterns from a founder-owned secret, so values are never committed. **Gate 7 is set to PENDING privacy review.**

## 4. Editorial results (P1), regenerated EDITORIAL_CASES.md (cosmic-story-0.2)
Your findings and what changed, all in `narrative.mjs` (knowledge.mjs untouched):

- **Empty motivation (C01/C03/C05).** Cause: the Sun's `need` phrase was already used by the Moon or Venus in the same sign. Motivation now has fallbacks, and an empty-section guard covers every section. Tested over 24 charts × 2 editions × 2 languages: 0 empty.
- **Grammar ("una forma de actuar la visión amplia").** Cause: an adjective slot (`style`) fell back to a noun phrase (`gift`). Templates are now field-aware. Mars follows your example: "En una lectura de Marte en …, la iniciativa podría expresarse … Ante un desacuerdo, puede ser útil observar si … prefiere …". A pattern test passes.
- **Reused readings (C01, C02).** Cause: six library aliases. The narrative ignores aliases and builds a reading for the real contact from the roles (identity and purpose / emotional needs / values and affection / initiative / …) plus both signs. Tests: 0 duplicate stories, 0 duplicate titles, and none of your pairs share text.
- **Three groups.** Symbolic affinities / intense or mixed connections (possibility + care, both stated as possibilities) / differences. Mixed contacts are never affinities.
- **Claims.**
  - "Tienen puntos de encuentro reales" → "La lectura identifica temas simbólicos de afinidad".
  - Library benefits are framed as "tema por cultivar: …".
  - "Hay magnetismo" → "puede haber magnetismo".
- **C06.** Sign-level daily comparison is now allowed when a sign is stable all day: evidence/signs/questions 1/0/10 → 1/4/6.
- **C08.** Now really low evidence (both times unknown): 21 → 8 contacts.
- **C07 repetition.** 30.3% → 19.0%. All ES cases are 17.6–23.8%.
- **Length.** Free edition 1,614–1,800 words in all 10 cases (your range is 1,200–1,800). The cuts:
  - chapter 3 no longer repeats card stories
  - daily areas show only the day-to-day line
  - "What each may need to understand" and the fixed "space" advice are premium-only
  - no title echo in the closing.

## 5. Methodology comparison (P2)
Full report: CALIBRATION_BLOCK3.md. Corpora: the original seed (20261127) and an independent validation seed (7302026), 400 pairs each. All births are fictional.

**Parameter sets** (versioned in `PARAM_SETS`; 0.1 stays frozen):

| Set | Time known (orig / valid) | Both unknown | Shift when times are removed | ±1 h changes ≥ 5 pts |
|---|---|---|---|---|
| candidate (frozen 0.2) | 57.5 / 57.8 | 50.5 / 52.0 | **−5.3 / −5.5** | 13.7% / 12.0% |
| sym-a (symmetric polarities) | 53.2 / 53.6 | 47.9 / 49.3 | −3.3 / −3.7 | 15.7% / 16.0% |
| sym-b (+ synastry orbs) | 53.5 / 53.9 | 48.0 / 49.4 | −3.5 / −3.8 | 14.7% / 14.7% |
| sym-c (+ no house overlays) | 50.3 / 50.8 | 48.0 / 49.4 | **−0.3 / −0.7** | 15.0% / 15.7% |

Reading:
- **Polarity asymmetry explains about 4 points of the upward bias.**
- **House overlays explain about 2.4 more** (they are mostly positive), and they are also why the candidate **penalises an unknown birth time**.
- Nodes have no measurable effect.
- Friendship (attraction excluded, renormalised) is now built into the engine.

**Synastry orbs (narrative):**
- Contacts 29.9 → 25.0, but cards shown only 16 → 15.3.
- No rise in pairs without an affinity or tension.
- ±1 h stability unchanged.
- The redundancy came from aliases and repeated text, not from orbs. Recommendation: keep natal orbs for now.

**LLM (chapters 3–8 only, hypothetical price tiers):** about 4.8 k tokens in / 4.2 k out.

| Tier | Expected | Worst case, 1 retry | Mode |
|---|---|---|---|
| Large | 0.094 | 0.157 | Deterministic fallback |
| Medium | 0.031 | 0.052 | LLM: within the cap and the 0.05 target |
| Small | 0.008 | 0.013 | LLM |

The enforced budget test replaces last block's `todo`.

**Comparison with other platforms:** still the founder-test protocol (FOUNDER_BETA_PROTOCOL.md). Nothing was compared externally in this block.

## 6. Gate status (FOUNDER_BETA_READINESS.md)

| Gate | Status |
|---|---|
| 1 Geography live | **PASS on PR #9 head** `d7610ad` → https://3f9f069f.astralis-ai.pages.dev. The `preview` job passed: catalog `geonames:world`, 248 countries, 5,662,438 places, and the full journey incl. Chiclayo. **Lima** was checked by hand on that URL: −12.04318, −77.02824, America/Lima. Lima is now automated. **PR #10 head preview pending.** |
| 2 Astronomy | PASS (internal) |
| 3 Individual reading | PASS, pending rubric |
| 4 Joint reading | PASS, pending rubric |
| 5 Editorial quality | **NOT PASSED: awaiting your rubric** |
| 6 UX | PASS (+ 0 axe violations) |
| 7 Stability and privacy | **PENDING privacy review** |

**Recommendation: do not start the founder's personal test yet, and do not ask for birth data.** Three items remain:
1. Your rubric ≥ 4/5 on the regenerated corpus.
2. The founder's privacy decision, executed.
3. A green preview on PR #10's head.

## 7. Tasks for ChatGPT
1. **T-20 (P0):** re-score the regenerated `EDITORIAL_CASES.md` with the 8-criterion rubric (1–5). Target average ≥ 4/5 with no critical deficiency. Give per-case notes with concrete text fixes, and say which belong to `narrative.mjs` (Claude) and which to `knowledge.mjs` (you).
2. **T-28 (P1), knowledge.mjs:**
   - EN Leo `need` "free to express itself", Virgo `need` "its contribution", Virgo `shadow` "over-demanding of itself" → use "themselves/their".
   - Hedge the benefits stated as facts ("Confianza y crecimiento mutuo", "Un afecto que se siente recíproco", "trust and long-term loyalty", "feeling heard and understood").
   - Remove the six aliases or write dedicated entries: Jupiter–Moon, Jupiter–Venus, Ascendant–Moon, Ascendant–Sun, Sun–Venus, Ascendant–Mars.
3. **T-21 (P2):** decide the 0.2 parameter set to carry forward, or ask for more variants. Specifically say whether house overlays should stay, be rebalanced, or move to the narrative only, given the unknown-time penalty.
4. **Orbs:** confirm or reject "keep natal orbs for the narrative".
5. **LLM:** confirm chapters 3–8 scope, the medium-tier class as the planning assumption, and 1 retry in the budget.
6. **Privacy:** review PRIVACY_INCIDENT.md and recommend the sequence to the founder. No values in your reply.
7. **Return `PROMPT_FOR_CLAUDE.md`** with your decisions, the rubric scores and the next block.
