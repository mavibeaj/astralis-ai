// Checkout SIMULATION. No payment provider, no card data, no real charge — ever.
// Provider-agnostic: a real adapter (chosen later by the CTO) must implement the same
// interface server-side and confirm payments through signed, idempotent webhooks.
import {buildPremiumPreview} from './premium-preview.mjs';
import {simulatePremiumExecution} from './premium-execution.mjs';
import {premiumReportInput} from './premium-contract.mjs';

export const ORDER_STATES = ['created', 'checkout_pending', 'paid_simulated', 'failed', 'canceled', 'fulfilled'];
const ORDER_FLOW = {created: ['checkout_pending', 'canceled'], checkout_pending: ['paid_simulated', 'failed', 'canceled'], failed: ['checkout_pending', 'canceled'], paid_simulated: ['fulfilled'], canceled: [], fulfilled: []};
export const REPORT_STATES = ['queued', 'generating', 'ready', 'failed'];
const REPORT_FLOW = {queued: ['generating'], generating: ['ready', 'failed'], failed: ['generating'], ready: []};
const SELLABLE = new Set(['match-premium']); // priority product; others not sellable yet
// PLACEHOLDER pricing for the cost-control simulation only — not any provider's real price list.
export const SIMULATION_PRICING = Object.freeze({inputMicroUsdPerMillion: 3_000_000, outputMicroUsdPerMillion: 15_000_000});
const CARD_LIKE = /card|cvv|cvc|pan|expiry|exp_|iban|account/i;

export class CommerceError extends Error {constructor(code, message) {super(message ?? code); this.code = code;}}
function transition(entity, flow, to, now) {
  if (!flow[entity.status]?.includes(to)) throw new CommerceError('invalid_transition', `${entity.status} → ${to}`);
  entity.status = to; entity.history.push({status: to, at: now()});
}
const randomToken = (bytes = 12) => {const a = new Uint8Array(bytes); globalThis.crypto.getRandomValues(a); return Array.from(a, b => b.toString(36).padStart(2, '0')).join('').slice(0, bytes * 2);};

/** Mock provider. Outcome is chosen explicitly for testing; it never receives payment details. */
export function mockPaymentProvider() {
  const sessions = new Map();
  return {
    kind: 'mock',
    createSession({orderId, amountCents, currency}) {
      const id = 'sim_cs_' + randomToken(8);
      sessions.set(id, {orderId, amountCents, currency});
      return {sessionId: id, simulated: true};
    },
    // Returns a provider-style event; a real integration would receive this via a signed webhook.
    complete(sessionId, outcome) {
      const s = sessions.get(sessionId);
      if (!s) throw new CommerceError('unknown_session');
      if (outcome === 'network_error') throw new CommerceError('provider_unreachable', 'Simulated network error');
      return {eventId: 'sim_evt_' + randomToken(8), type: outcome === 'succeed' ? 'payment.succeeded' : 'payment.declined', sessionId, orderId: s.orderId, amountCents: s.amountCents, currency: s.currency, simulated: true};
    },
  };
}

/** Deterministic report adapter backed by the existing premium preview (no generative AI). */
export function deterministicReportAdapter(result, locale, relationship) {
  return {kind: 'mock', async generate() {
    const p = buildPremiumPreview(result, locale, relationship);
    return {text: JSON.stringify({summary: p.summary, themes: p.themes.map(t => ({key: t.key, reflection: t.reflection, activity: t.activity}))}), usage: {inputTokens: 600, outputTokens: 700}};
  }};
}

/** In-memory store with an optional persistence hook (localStorage in the browser, Supabase later). */
export function createCommerce({catalog, provider = mockPaymentProvider(), now = () => new Date().toISOString(), persist = null, load = null} = {}) {
  if (!Array.isArray(catalog)) throw new CommerceError('catalog_required');
  const orders = new Map(), byIdempotency = new Map(), processedEvents = new Set(), reports = new Map();
  const save = () => persist?.({orders: [...orders.values()], reports: [...reports.values()]});
  if (load) {const d = load(); for (const o of d?.orders ?? []) {orders.set(o.id, o); byIdempotency.set(o.idempotencyKey, o.id);} for (const r of d?.reports ?? []) reports.set(r.orderId, r);}

  function createOrder({productId, idempotencyKey, result, locale, relationship}) {
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) throw new CommerceError('idempotency_key_required');
    if (byIdempotency.has(idempotencyKey)) return orders.get(byIdempotency.get(idempotencyKey));
    const product = catalog.find(p => p.id === productId);
    if (!product || !SELLABLE.has(productId)) throw new CommerceError('product_unavailable');
    const reportInput = premiumReportInput(result, locale, relationship); // allowlist: no names, dates, places
    const order = {id: 'sim_ord_' + randomToken(8), recoveryCode: randomToken(10).toUpperCase(), idempotencyKey, productId, productName: product.name,
      amountCents: product.priceCents, currency: 'USD', simulated: true, status: 'created', history: [{status: 'created', at: now()}], reportInput};
    orders.set(order.id, order); byIdempotency.set(idempotencyKey, order.id); save();
    return order;
  }
  function startCheckout(orderId, details = {}) {
    if (Object.keys(details).some(k => CARD_LIKE.test(k))) throw new CommerceError('payment_details_forbidden', 'This simulation never accepts payment details');
    const order = get(orderId);
    if (order.status === 'checkout_pending') return {sessionId: order.sessionId, simulated: true};
    transition(order, ORDER_FLOW, 'checkout_pending', now);
    const s = provider.createSession({orderId, amountCents: order.amountCents, currency: order.currency});
    order.sessionId = s.sessionId; save();
    return s;
  }
  /** Process a provider event exactly once (webhook semantics). */
  function handleEvent(event) {
    if (processedEvents.has(event.eventId)) return {duplicate: true, order: get(event.orderId)};
    const order = get(event.orderId);
    if (event.amountCents !== order.amountCents || event.currency !== order.currency || event.sessionId !== order.sessionId) throw new CommerceError('event_mismatch');
    processedEvents.add(event.eventId);
    if (event.type === 'payment.succeeded') {if (order.status !== 'paid_simulated' && order.status !== 'fulfilled') transition(order, ORDER_FLOW, 'paid_simulated', now);}
    else if (event.type === 'payment.declined') {if (order.status === 'checkout_pending') transition(order, ORDER_FLOW, 'failed', now);}
    save();
    return {duplicate: false, order};
  }
  function pay(orderId, outcome = 'succeed') {
    const order = get(orderId);
    const event = provider.complete(order.sessionId, outcome);
    return handleEvent(event).order;
  }
  async function generateReport(orderId, {result, locale, relationship, adapter}) {
    const order = get(orderId);
    if (order.status !== 'paid_simulated' && order.status !== 'fulfilled') throw new CommerceError('payment_required');
    const existing = reports.get(orderId);
    if (existing?.status === 'ready') return existing;
    const input = premiumReportInput(result, locale, relationship);
    if (JSON.stringify(input) !== JSON.stringify(order.reportInput)) throw new CommerceError('report_input_mismatch');
    const report = existing ?? {orderId, status: 'queued', history: [{status: 'queued', at: now()}]};
    reports.set(orderId, report);
    transition(report, REPORT_FLOW, 'generating', now); save();
    try {
      const run = await simulatePremiumExecution({result, locale, relationship, adapter: adapter ?? deterministicReportAdapter(result, locale, relationship), pricing: SIMULATION_PRICING});
      Object.assign(report, {content: run.report, input, locale, relationship, simulatedCostMicroUsd: run.simulatedCostMicroUsd, actualChargeMicroUsd: 0, generatedAt: now()});
      transition(report, REPORT_FLOW, 'ready', now);
      if (order.status === 'paid_simulated') transition(order, ORDER_FLOW, 'fulfilled', now);
    } catch (e) {
      report.error = e?.code ?? e?.message ?? 'generation_failed';
      transition(report, REPORT_FLOW, 'failed', now);
    }
    save();
    return report;
  }
  function recover(recoveryCode) {
    const code = String(recoveryCode ?? '').trim().toUpperCase();
    const order = [...orders.values()].find(o => o.recoveryCode === code);
    if (!order) throw new CommerceError('not_found');
    return {order, report: reports.get(order.id) ?? null};
  }
  function cancel(orderId) {const o = get(orderId); transition(o, ORDER_FLOW, 'canceled', now); save(); return o;}
  function get(orderId) {const o = orders.get(orderId); if (!o) throw new CommerceError('order_not_found'); return o;}
  return {createOrder, startCheckout, handleEvent, pay, generateReport, recover, cancel, get, provider};
}

/** Standalone printable HTML for download (escaped; no scripts). */
export function reportHtml(report, order, es) {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const labels = es ? {emotional: 'Conexión emocional', communication: 'Comunicación', attraction: 'Atracción simbólica', stability: 'Estabilidad', growth: 'Crecimiento'} : {emotional: 'Emotional connection', communication: 'Communication', attraction: 'Symbolic attraction', stability: 'Stability', growth: 'Growth'};
  const themes = report.content.themes.map(t => `<section><h2>${esc(labels[t.key])} · ${report.input.dimensions[t.key]}/100</h2><p>${esc(t.reflection)}</p><p><em>${esc(t.activity)}</em></p></section>`).join('');
  return `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cosmic Match Premium</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1d1640;line-height:1.6}h1{font-weight:500}h2{font-size:1.15rem;margin-top:1.6rem}.sim{border:2px dashed #b08a3c;padding:10px 14px;border-radius:10px;background:#fff8e6}small{color:#555}</style></head><body>
<p class="sim">${es ? 'SIMULACIÓN — documento de demostración. No se realizó ningún cobro.' : 'SIMULATION — demo document. No charge was made.'}</p>
<h1>Cosmic Match Premium · ${report.input.index}/100</h1><p>${esc(report.content.summary)}</p>${themes}
<hr><small>${es ? 'Interpretación simbólica para conversar y reflexionar; no es una predicción ni una evaluación científica.' : 'Symbolic interpretation for conversation and reflection; not a prediction or scientific assessment.'} · ${esc(order.id)} · ${esc(report.generatedAt)}</small></body></html>`;
}
