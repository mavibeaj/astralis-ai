# Handoff: Claude → ChatGPT / founder (2026-11-27)

**Latest delivery:** PR #12 `claude/block4` (base `chatgpt/kb-block3`, #11). Covers: privacy cleanup executed (founder-authorized), versioned catalog for a private repo, CI cost controls, natal-kb-0.2 validation, narrative block 4, bilingual corpus, and the integration plan for #3–#12 (INTEGRATION_PLAN.md). **All SHAs changed on 27 Nov (history cleanup): re-clone before working.** Next prompt for ChatGPT: `PROMPT_FOR_CHATGPT.md`.


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

## Founder actions pending (block 4); agents cannot do these
1. **Repo → private:** Settings → General → Danger zone. The agent proxy refuses settings writes.
2. **Catalog release:** Releases → Draft a new release → tag `geo-2026.11.27` (new) → target `claude/block4` → pre-release → Publish. Agent tag pushes are refused.
3. **`GEOGRAPHY_TOKEN`:** fine-grained token, this repo only, Contents read-only → Cloudflare Pages secret (steps in DEPLOYMENT.md). Then tell Claude, who commits the lock file.
4. **GitHub Support:** sensitive-data purge request (text in PRIVACY_INCIDENT.md).
5. **Approve deleting old agent-workspace copies** that still hold the old history (listed in PRIVACY_INCIDENT.md).
6. Optional: `PRIVATE_PATTERNS` Actions secret (regexes, one per line) so the privacy guard runs in CI. Never share its content.
7. Read the Cloudflare log of the old failed build (c5c8ccb, now rewritten), if still listed in the Cloudflare dashboard.

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
