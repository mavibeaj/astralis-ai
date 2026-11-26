# Next tasks (prioritized)

1. **Owner:** in Cloudflare Pages, confirm build command `npm run build` (or `build:world`), output `out`, no `GEOGRAPHY_COUNTRIES`; redeploy and check the "Geography gate" line in the build log. Then retest Chiclayo + a rural locality on the live URL (agents had no access to the live site).
2. **ChatGPT:** review/merge #3 → #4 → #5 (retarget to the integration branch after #3) → #6.
3. **ChatGPT:** approve or adjust symbolic-0.2 internal weights (COMPATIBILITY_METHODOLOGY.md, open questions).
4. If Cloudflare's build is too slow or memory-bound for the world import (measured 12.5 min on GitHub runners), generate the catalog in GitHub Actions and deploy with `wrangler pages deploy` (needs an owner-created API token secret), or move to the Vercel + Supabase search API.
5. Mobile search latency: first search 4.9 s on throttled slow-4G + CPU×4 against an **uncompressed** local server. Measure on Cloudflare (brotli); consider a smaller per-country "top places" shard for the first keystrokes.
6. Block 7: Open Graph/meta, invite links, privacy-respecting analytics; keep `noindex`.
7. Block 8: Supabase schema review (orders/reports/entitlements), RLS tests against a local Supabase, deletion flow; no paid project.
8. Payment provider adapter (server-side, signed webhooks) once ChatGPT selects a provider for a Peru-resident founder.
9. Upgrade GitHub Actions to Node-24-native versions (deprecation warnings).
