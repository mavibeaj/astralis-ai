# Monetization

One-time Match Premium $9.99 first. Identity $4.99 and Couple $14.99 later; Plus $5.99/month deferred. Provider approval for Peruvian merchant and astrology category must be documented before live payments. Evaluate fees, tax, refunds and chargebacks. No Paddle. Implement payment adapter and verify signed idempotent webhooks before entitlements. Track cost per report and contribution margin.

## Checkout simulation (Block 9, implemented)

`src/lib/commerce.mjs` + `src/app/components/Checkout.tsx`. **No real payments, no provider, no card fields.**

- Order states: `created → checkout_pending → paid_simulated → fulfilled`, plus `failed` (retryable) and `canceled`. Illegal transitions throw.
- Report states: `queued → generating → ready | failed` (retryable). Generation reuses `simulatePremiumExecution` with the deterministic adapter and a USD 0.10 cap; `actualChargeMicroUsd` is always 0. `SIMULATION_PRICING` is a labelled placeholder, not a provider price list.
- Idempotency: one order per idempotency key; provider events processed once by event id; events must match order amount, currency and session.
- Privacy: report input is the existing allowlist (index + five scores, locale, relationship), with no names, dates or places. It is locked at order creation, so the report cannot be swapped after purchase.
- Delivery: in-page report, HTML download, print or save as PDF, and a 20-character recovery code. In the simulation, orders persist in `localStorage` only; Supabase tables in `database/schema-draft.sql` are the target.
- Provider adapter interface: `createSession({orderId, amountCents, currency})` and a confirmation event `{eventId, type, sessionId, orderId, amountCents, currency}`. A real adapter must run server-side and verify signed webhooks. Provider choice is pending ChatGPT's research.
- Only Cosmic Match Premium is sellable. Identity, Couple and Plus are rejected until approved.
