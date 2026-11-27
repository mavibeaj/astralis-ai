# Handoff: Claude → ChatGPT / founder (2026-11-27)

**Latest delivery:** PR #10 `claude/block3` (base `claude/beta-readiness`, PR #9): deploy recovery (pinned geography release), privacy incident report + guard, cosmic-story-0.2 editorial fixes, versioned 0.2 parameter sets, orb experiment, chapters 3–8 LLM budget, a11y audit, Lima in the journey. Previous: PR #9 (C-01–C-06, calibration, editorial corpus). Next prompt for ChatGPT: `PROMPT_FOR_CHATGPT.md`. Task board: `AGENT_TASK_BOARD.md`.


## Merge order
1. **#3 P0 geography**: `claude/geo-p0-fix` → `feature/cosmic-match-foundation`. CI and the world import are green.
2. **#4 symbolic-0.2 candidate**: `claude/synastry-0.2` → `feature/cosmic-match-foundation`. Independent of #3.
3. **#5 redesign + wheels**: `claude/product-experience`. After #3 merges, retarget it to the integration branch. It already contains #4; the `page.tsx` conflict was resolved in favour of the redesign.
4. **#6 checkout simulation**: `claude/checkout-sim` → `claude/product-experience`. Retarget it after #5 merges.
5. **#7 story-first (ChatGPT)** → `claude/checkout-sim`.
6. **#8 Cosmic Story v2** → `chatgpt/story-first`.

## Owner action required (agents cannot do this)
1. In Cloudflare Pages → astralis-ai → Settings → Build, confirm:
   - Build command: `npm run build` (or `npm run build:world`, now an alias)
   - Output directory: `out`
   - No `GEOGRAPHY_COUNTRIES` variable
2. Redeploy, and look for this line in the build log: `✓ Geography gate: 248 countries …`
3. If the build fails on time or memory (world import: about 12 min and 2.2 GB on GitHub runners), see NEXT_TASKS item 4.

Live geography: PR #9 head `d7610ad` → https://3f9f069f.astralis-ai.pages.dev passed the `preview` job (catalog + journey incl. Chiclayo). Lima was checked by hand on the same URL (−12.04318, −77.02824, America/Lima). This is a preview, not production.

## Founder decisions pending (block 3)
1. **Cloudflare log of c5c8ccb** (2 min, steps in DEPLOYMENT.md): confirms or rejects the timeout/download hypothesis.
2. **Geography release:** approve the first `geo-*` release (public, CC BY 4.0 data, no cost). Claude can push the tag once you say yes.
3. **Privacy (PRIVACY_INCIDENT.md):** (a) make the repo private now, (b) delete 15 screenshot artefacts, (c) rewrite history + GitHub Support request. Each needs your explicit yes. Optionally create the `PRIVATE_PATTERNS` secret (regexes, one per line) so the guard test runs in CI.

## Review requests for the CTO
- symbolic-0.2 internal weights (see the open questions in COMPATIBILITY_METHODOLOGY.md).
- TD-08 to TD-14 in TECHNICAL_DECISIONS.md.
- Payment-provider adapter contract (MONETIZATION.md).

## Reproduce locally
    npm ci
    pip install geonamescache==3.0.2 reverse_geocoder==1.5.1   # offline fixture only
    npm run build:fixture          # never for deployment; the gate blocks fixture data in npm run build
    npm install --no-save --package-lock=false playwright@1.56.1 && npx playwright install chromium
    node tests/browser-smoke.mjs   # writes browser-*.png screenshots

CI artifacts: `browser-preview` (Foundation CI, screenshots) and `geography-world-metrics` (world import).
