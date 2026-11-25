# Static preview deployment

The free matching prototype runs client-side. No production launch or payment activation is authorized by this guide.

## Cloudflare Pages

Connect only `mavibeaj/astralis-ai` in the Cloudflare dashboard under Workers & Pages > Pages > Connect to Git. Use `feature/cosmic-match-foundation` as the preview branch; do not merge main or attach a custom domain. For a dedicated test-only Pages project the selected branch may be the project's default deployment branch; this is not a commercial production release.

- Framework: Next.js (Static HTML Export)
- Build command: `npm run build`
- Output directory: `out`
- Root: repository root
- Environment: `NODE_VERSION=22`
- No API keys or payment credentials required.

Before creating resources, confirm Free plan and no paid add-ons. Review access and visibility: the pages.dev URL may be public. Use synthetic birth data for smoke tests. Do not index the prototype; existing metadata disables indexing, but robots metadata is not access control.

## Acceptance

Run `npm install`, `npm run typecheck`, `npm test`, `npm run build`; verify `out/index.html`. On the preview URL test EN/ES, adult consent, known and unknown birth time, invalid time zone, clearing inputs, score display, and both PNG card sizes on desktop and mobile. Check that premium purchases remain disabled and no birth data is transmitted. Record the deployment URL and commit only after actual verification.

References: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/ and https://developers.cloudflare.com/pages/platform/limits/.
