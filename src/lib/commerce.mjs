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
  async function generateReport(orderId, {result, locale, relationship, adapter, attachment}) {
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
      // Optional deterministic premium story (built client-side; stored only in this browser in the simulation).
      if (attachment) report.story = attachment;
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
const ESC = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const REPORT_CSS = `@page{size:A4;margin:18mm}body{font-family:Georgia,'Iowan Old Style',serif;color:#1d1640;line-height:1.65;max-width:760px;margin:0 auto;padding:24px}
.cover{min-height:92vh;display:flex;flex-direction:column;justify-content:center;text-align:center;background:radial-gradient(circle at 50% 30%,#2b1f5c,#0b0a1f);color:#f6f2ff;border-radius:18px;padding:40px;page-break-after:always}
.cover h1{font-size:2.4rem;font-weight:500;margin:.4rem 0}.cover .names{color:#f3d9a4;font-size:1.3rem}.cover .k{letter-spacing:.2em;text-transform:uppercase;font-size:.75rem;color:#c9b6ff}
h2{font-weight:500;font-size:1.6rem;border-bottom:1px solid #d8b36a;padding-bottom:.3rem;margin-top:2.2rem}h3{font-size:1.1rem;margin:1.2rem 0 .3rem;color:#3a2a78}
.chapter{page-break-before:always}.card{border:1px solid #e3dcf3;border-radius:12px;padding:12px 16px;margin:12px 0;break-inside:avoid}
dt{font-weight:600;font-size:.85rem;color:#5b45b0;margin-top:.4rem}dd{margin:0}.sim{border:2px dashed #b08a3c;padding:10px 14px;border-radius:10px;background:#fff8e6;color:#1d1640}small{color:#666}.toc li{margin:.2rem 0}`;
function storyHtml(st, report, order, es) {
  const e = ESC, C = st.couple, names = st.people.map(p => p.name);
  const L = es ? {k: 'Cosmic Match Premium', toc: 'Contenido', ch: [`El universo de ${names[0]}`, `El universo de ${names[1]}`, 'La historia de ambos', 'Compatibilidades', 'Diferencias y desafíos', 'En la vida cotidiana', 'Consejos para ustedes', 'Su historia en breve'], detail: 'En detalle', daily: 'En el día a día', benefit: 'Qué puede aportar', tip: 'Prueben esto', mis: 'Posible malentendido', und: 'Lo que conviene comprender', help: 'Qué puede ayudar', houses: 'Cómo se activan sus casas', q: 'Preguntas para hacerse', act: 'Actividades', basis: 'Base astrológica', sim: 'SIMULACIÓN — documento de demostración. No se realizó ningún cobro.', disc: 'Interpretación simbólica para conversar y reflexionar; no es una predicción ni una evaluación científica.'}
    : {k: 'Cosmic Match Premium', toc: 'Contents', ch: [`The universe of ${names[0]}`, `The universe of ${names[1]}`, 'Your story together', 'Compatibilities', 'Differences and challenges', 'In everyday life', 'Advice for you both', 'Your story in brief'], detail: 'In detail', daily: 'Day to day', benefit: 'What it can bring', tip: 'Try this', mis: 'Possible misunderstanding', und: 'Worth understanding', help: 'What can help', houses: 'How you activate each other\'s houses', q: 'Questions to ask each other', act: 'Activities', basis: 'Astrological basis', sim: 'SIMULATION — demo document. No charge was made.', disc: 'Symbolic interpretation for conversation and reflection; not a prediction or scientific assessment.'};
  const person = p => p.sections.map(s => `<h3>${e(s.title)}</h3><p>${e(s.text)}</p>`).join('') + (p.details.length ? `<h3>${L.detail}</h3>` + p.details.map(d => `<p>${e(d.text)}</p>`).join('') : '');
  const card = c => `<div class="card"><h3>${e(c.title)}</h3><p>${e(c.story)}</p><dl><dt>${L.daily}</dt><dd>${e(c.daily)}</dd>${c.benefit ? `<dt>${L.benefit}</dt><dd>${e(c.benefit)}</dd>` : ''}${c.tip ? `<dt>${L.tip}</dt><dd>${e(c.tip)}</dd>` : ''}${c.misunderstanding ? `<dt>${L.mis}</dt><dd>${e(c.misunderstanding)}</dd>` : ''}${c.needX ? `<dt>${L.und}</dt><dd>${e(c.needX)} ${e(c.needY)}</dd>` : ''}${c.action ? `<dt>${L.help}</dt><dd>${e(c.action)}</dd>` : ''}<dt>${L.basis}</dt><dd><small>${e(c.technical)}</small></dd></dl></div>`;
  const bodies = [person(st.people[0]), person(st.people[1]), C.story.map(x => `<p>${e(x.text)}</p>`).join('') + (C.overlays.length ? `<h3>${L.houses}</h3>` + C.overlays.map(o => `<p>${e(o.text)}</p>`).join('') : ''),
    C.affinities.map(card).join(''), C.tensions.map(card).join(''), C.daily.map(d => `<h3>${e(d.title)}</h3><p>${e(d.text)}</p>`).join(''),
    `<p>${e(C.advice.communication)}</p><p>${e(C.advice.needs)}</p><p>${e(C.advice.differences)}</p><p>${e(C.advice.shared)}</p><p>${e(C.advice.space)}</p><h3>${L.q}</h3><ul>${C.advice.questions.map(q => `<li>${e(q)}</li>`).join('')}</ul><h3>${L.act}</h3><ul>${C.advice.activities.map(q => `<li>${e(q)}</li>`).join('')}</ul>`,
    `<p>${e(C.closing)}</p>`];
  return `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cosmic Match Premium · ${e(C.title)}</title><style>${REPORT_CSS}</style></head><body>
<section class="cover"><p class="k">${L.k}</p><h1>${e(C.title)}</h1><p class="names">${e(names[0])} ✦ ${e(names[1])}</p><p><small style="color:#c9b6ff">${e(report.generatedAt?.slice(0, 10))}</small></p></section>
<p class="sim">${L.sim}</p><h2>${L.toc}</h2><ol class="toc">${L.ch.map(c => `<li>${e(c)}</li>`).join('')}</ol>
${bodies.map((b, i) => `<section class="chapter"><h2>${String(i + 1).padStart(2, '0')} · ${e(L.ch[i])}</h2>${b}</section>`).join('')}
<hr><small>${L.disc} · ${e(order.id)}</small></body></html>`;
}
export function reportHtml(report, order, es) {
  if (report.story?.couple && report.story?.people) return storyHtml(report.story, report, order, es);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const labels = es ? {emotional: 'Conexión emocional', communication: 'Comunicación', attraction: 'Atracción simbólica', stability: 'Estabilidad', growth: 'Crecimiento'} : {emotional: 'Emotional connection', communication: 'Communication', attraction: 'Symbolic attraction', stability: 'Stability', growth: 'Growth'};
  const themes = report.content.themes.map(t => `<section><h2>${esc(labels[t.key])} · ${report.input.dimensions[t.key]}/100</h2><p>${esc(t.reflection)}</p><p><em>${esc(t.activity)}</em></p></section>`).join('');
  return `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cosmic Match Premium</title>
<style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 20px;color:#1d1640;line-height:1.6}h1{font-weight:500}h2{font-size:1.15rem;margin-top:1.6rem}.sim{border:2px dashed #b08a3c;padding:10px 14px;border-radius:10px;background:#fff8e6}small{color:#555}</style></head><body>
<p class="sim">${es ? 'SIMULACIÓN — documento de demostración. No se realizó ningún cobro.' : 'SIMULATION — demo document. No charge was made.'}</p>
<h1>Cosmic Match Premium · ${report.input.index}/100</h1><p>${esc(report.content.summary)}</p>${themes}
<hr><small>${es ? 'Interpretación simbólica para conversar y reflexionar; no es una predicción ni una evaluación científica.' : 'Symbolic interpretation for conversation and reflection; not a prediction or scientific assessment.'} · ${esc(order.id)} · ${esc(report.generatedAt)}</small></body></html>`;
}
