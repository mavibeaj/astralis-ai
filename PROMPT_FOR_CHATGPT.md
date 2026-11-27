# PROMPT FOR CHATGPT (CTO/CPO): copy everything below

You are the CTO/CPO and astrological-methodology owner of Astralis AI (repo `mavibeaj/astralis-ai`, integration branch `feature/cosmic-match-foundation`). Claude is Lead Developer. Work on `chatgpt/*` branches, open independent PRs, and do not push to `claude/*` branches. Do not merge to `main`, create costs, or enable payments.

## 1. Current state (2026-11-27)
The founder's feedback: the calculations are correct, but the product lacked emotional value. Claude has delivered the **Cosmic Story v2** (PR #8): it reads each person first, then the connection, in 8 chapters, with every claim traceable to engine evidence.

**Open PR stack (merge in this order, nothing merged since PR #2):**
1. #3 `claude/geo-p0-fix` → integration: P0 geography. CI ✓, world import ✓.
2. #4 `claude/synastry-0.2` → integration: symbolic-0.2 candidate behind a flag. CI ✓.
3. #5 `claude/product-experience` → base `claude/geo-p0-fix`: redesign and wheels. CI ✓.
4. #6 `claude/checkout-sim` → base `claude/product-experience`: checkout simulation. CI ✓.
5. #7 `chatgpt/story-first` (yours) → base `claude/checkout-sim`. CI ✓.
6. #8 `claude/cosmic-story-v2` → base `chatgpt/story-first`: this delivery.

After each merge, retarget the next PR to `feature/cosmic-match-foundation`.

## 2. Implemented in #8 (key commits 5d6d0b9, f604a0a)
- `src/lib/natal-interpretation/`:
  - `knowledge.mjs` (natal-kb-0.1)
  - `evidence.mjs` (Layer A)
  - `narrative.mjs` (Layer B, cosmic-story-0.1)
  - `llm-adapter.mjs` (disabled)
  - `index.mjs`
- `src/app/components/StoryReading.tsx`: cover + 8 chapters, plus premium (09) and technical (10).
- `src/lib/commerce.mjs`: the premium report stores the premium story. The HTML/PDF export has a cover, contents and 8 chapters.
- `src/lib/match-preview.mjs`: Moon samples and day samples for unknown birth times.
- Methodology: `NATAL_METHODOLOGY.md`. Board: `AGENT_TASK_BOARD.md`.

## 3. Tests executed (real results)
- typecheck ✓.
- `npm test`: 211 tests, 204 pass, 0 fail, 7 skipped (need the full GeoNames catalog; they pass in CI).
- Playwright desktop 1280 and mobile 390 on the static export ✓, with screenshots of every chapter.
- Measured lengths (fictional pair, Spanish): free **1,426** words, premium **3,280**.
- Foundation CI on #8: see the PR.

## 4. Errors, blockers and known gaps
- **BLOCKED (founder):** the live Cloudflare site is not verified. The build command must be `npm run build`, with output `out`. Until then the P0 is not closed.
- **Quality gap:** cross pairs without a library reading fall back to generic text (e.g. Sun–Mars: "La identidad y el impulso…"). This is the main content task for you.
- The 0.1/0.2 scores are unchanged and live only in chapter 10.
- PR #7's `relationship-story.mjs` is no longer used by the page.

## 5. Decisions you need to review (written answers in the files named)
1. `NATAL_METHODOLOGY.md`:
   - Orbs (luminaries 8/7/5, personal 7/6/4, social and angles 6/5/3, outer 5/4/3).
   - Hard conjunctions (Mars, Saturn, Uranus, Pluto).
   - Exclusion of outer–outer aspects.
   - Element weights (3/3/3/2/2/2/1/1/1) and the "lacking" threshold.
2. Unknown-time policy: keep the Moon only if its sign is stable all day; drop planets that change sign; aspects must hold at 00:00 and 23:59.
3. Daily-life fallback: sign comparison by element, labelled "not confirmed by an aspect". Keep it, or show only "topic to discuss"?
4. symbolic-0.2 weights (`COMPATIBILITY_METHODOLOGY.md`, open questions). Still pending from before.
5. Whether the free reading should show the score at all, or only the narrative (currently the score is in chapter 10).

## 6. Architecture proposals from Claude
- Keep the knowledge base as versioned data (`natal-kb-x.y`). Any text change is a version bump, guarded by the same tests.
- The LLM layer only rewrites the Layer A evidence. The validator already rejects uncited, forbidden or score-bearing paragraphs. Next step: a mock prototype with a cost model, still no provider.
- Later, move the knowledge base to JSON files per locale, so editors can work without touching code.

## 7. Tasks assigned to you (by priority)
- **T-09 (P1):** review and approve or adjust NATAL_METHODOLOGY.md rules. Record decisions with reasons.
- **T-10 (P1) KB expansion** on `chatgpt/kb-expansion`:
  - Add ≥ 15 cross pairs in the same shape as `CROSS_PAIRS`: title[easy, hard]; easy {story, daily, benefit, tip}; hard {story, daily, misunderstanding, needX, needY, action}; `x` body; ES+EN.
  - Priority pairs: Sun–Mars, Mercury–Venus, Venus–Neptune, Moon–Pluto, Sun–Uranus, Moon–Mars, Mercury–Mars, Venus–Pluto, Sun–Neptune, Moon–Neptune, Mercury–Saturn, Mars–Saturn, Node–Sun/Moon/Venus, MC–Sun/Saturn.
  - Add ≥ 10 natal pairs, and sign-in-house paragraphs for premium.
  - Constraints: gender-neutral Spanish (adjectives on feminine nouns, no "querido/a"), English with singular "they", no forbidden claims.
  - Run `npm test`.
- **T-11 (P1):** editorial rubric (depth, specificity, variety, safety, usefulness, coherence; 1–5 each) and 10 evaluation cases (fictional births incl. unknown time and friendship). Score the current output from PR #8 and list concrete text changes.
- **T-12 (P2):**
  - Competitor and pricing study (5–8 products: features, price, free vs paid depth).
  - International payment providers for a Peru-resident founder (fees, payouts to Peru, astrology/entertainment category acceptance, Merchant of Record vs not, refunds and chargebacks). Include sources.
  - A recommendation; open no accounts.
- **T-13 (P3):** bilingual SEO and launch plan (keyword map, page titles, Open Graph, `noindex` until launch, acquisition channels, path to the USD 1,000/month goal as an objective, not a promise).
- **PR reviews:** #3 → #8 in order. For each, approve or request changes with concrete file and line comments.

## 8. Files to read
`HANDOFF.md`, `PROJECT_STATUS.md`, `QA_REPORT.md`, `AGENT_TASK_BOARD.md`, `NATAL_METHODOLOGY.md`, `COMPATIBILITY_METHODOLOGY.md`, `MONETIZATION.md`, `src/lib/natal-interpretation/knowledge.mjs`, `src/lib/natal-interpretation/narrative.mjs`, `tests/natal-interpretation.test.mjs`.

## 9. What Claude will do next (after your review)
- Apply your methodology decisions.
- T-14: a mock LLM narrative prototype behind the adapter, with a cost model (no provider).
- T-15: geography mobile performance, once the live site exists.
- T-16: Supabase RLS tests on a local stack.
- Visual polish of chapters 4–6.

## 10. Dependencies
- T-10 and T-11 depend on T-09.
- Claude's T-14 depends on T-09 and T-11.
- The live validation (T-02) depends on #3 merging and the founder's Cloudflare settings.

## 11. Acceptance criteria for your deliverables
- Knowledge-base PRs keep `npm test` green and add no forbidden claims. Every new cross pair has both tones in both languages.
- Decisions are written into the methodology files with a date and rationale.
- Research includes sources and dates; nothing is presented as a guarantee.

## 12. When you finish
Create or update **`PROMPT_FOR_CLAUDE.md`** on your branch with the decisions you approved, the changes you require (file and acceptance criteria), the next tasks, and any questions for Claude. Update `AGENT_TASK_BOARD.md` statuses.
