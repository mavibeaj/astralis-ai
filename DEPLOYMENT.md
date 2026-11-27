# Deployment strategy

Decision: Vercel is the intended commercial hosting platform. Development remains at zero incremental cost using GitHub Actions and local testing. Do not deploy the commercial project to Hobby without confirming eligibility under current Vercel terms. Do not upgrade, deploy to production, attach a domain or activate payments without owner approval.

## Development

The current free prototype is client-side and exports static HTML via Next.js. Run `npm install`, `npm run typecheck`, `npm test`, `npm run build` and verify `out/index.html`. Static export is a development convenience, not a permanent architecture constraint. Remove it when introducing server routes and verify the resulting build before release.

## Vercel release gate

Confirm eligible plan, spending controls, Git integration, reviewed commit, environment separation and preview access. Use Next.js framework detection. Configure secrets only through protected environment settings. No real customer data in preview. No commercial production release without explicit approval.

## Acceptance

Verify EN/ES, adult consent, known and unknown birth time, invalid time zone, clearing inputs, score display, and both PNG card sizes on desktop and mobile. Check premium purchases remain disabled until release approval and that free birth data is not transmitted. Record actual preview URL and commit when verified. Robots metadata is not access control.

Cloudflare Pages is an optional static-hosting fallback, not the selected provider. No Cloudflare resources were created.
