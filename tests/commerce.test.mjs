import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCommerce, mockPaymentProvider, reportHtml, CommerceError} from '../src/lib/commerce.mjs';
import {matchPreview} from '../src/lib/match-preview.mjs';

// Catalog mirrors src/config/product.ts (checked below) — tests cannot import TypeScript.
const catalog = [{id: 'match-free', name: 'Cosmic Match Free', priceCents: 0}, {id: 'match-premium', name: 'Cosmic Match Premium', priceCents: 999}, {id: 'couple', name: 'Cosmic Couple', priceCents: 1499}];
const A = {date: '1993-04-15', time: '12:00', unknownTime: false, place: 'London', zone: 'Europe/London', latitude: 51.50853, longitude: -0.12574};
const B = {date: '1995-09-22', time: '15:30', unknownTime: false, place: 'New York City', zone: 'America/New_York', latitude: 40.71427, longitude: -74.00597};
const result = matchPreview(A, B, '2026-11-26');
const ctx = {result, locale: 'es', relationship: 'partner'};
const order = (c, key = 'idem-key-0001') => c.createOrder({productId: 'match-premium', idempotencyKey: key, ...ctx});

test('catalog mirror matches product config', () => {
  const src = readFileSync('src/config/product.ts', 'utf8');
  for (const p of catalog) assert.match(src, new RegExp(`id: '${p.id}', name: '${p.name}', priceCents: ${p.priceCents}`));
});
test('happy path: order → simulated payment → report → fulfilled → recovery', async () => {
  const c = createCommerce({catalog});
  const o = order(c);
  assert.equal(o.status, 'created'); assert.equal(o.amountCents, 999); assert.equal(o.simulated, true);
  c.startCheckout(o.id);
  assert.equal(c.pay(o.id, 'succeed').status, 'paid_simulated');
  const r = await c.generateReport(o.id, ctx);
  assert.equal(r.status, 'ready'); assert.equal(r.content.themes.length, 5);
  assert.equal(r.actualChargeMicroUsd, 0); assert.ok(r.simulatedCostMicroUsd <= 100000, 'cost cap USD 0.10');
  assert.equal(c.get(o.id).status, 'fulfilled');
  assert.deepEqual(c.get(o.id).history.map(h => h.status), ['created', 'checkout_pending', 'paid_simulated', 'fulfilled']);
  const rec = c.recover(o.recoveryCode.toLowerCase());
  assert.equal(rec.report.status, 'ready');
});
test('idempotent order creation', () => {
  const c = createCommerce({catalog});
  assert.equal(order(c, 'same-key-123').id, order(c, 'same-key-123').id);
  assert.notEqual(order(c, 'same-key-123').id, order(c, 'other-key-456').id);
});
test('payment events are processed exactly once', () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id);
  const event = c.provider.complete(o.sessionId, 'succeed');
  assert.equal(c.handleEvent(event).duplicate, false);
  assert.equal(c.handleEvent(event).duplicate, true);
  assert.equal(c.get(o.id).history.filter(h => h.status === 'paid_simulated').length, 1);
});
test('tampered events are rejected', () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id);
  const event = c.provider.complete(o.sessionId, 'succeed');
  assert.throws(() => c.handleEvent({...event, amountCents: 1}), e => e.code === 'event_mismatch');
});
test('declined payment can be retried; network error leaves order pending', () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id);
  assert.throws(() => c.pay(o.id, 'network_error'), e => e.code === 'provider_unreachable');
  assert.equal(c.get(o.id).status, 'checkout_pending');
  assert.equal(c.pay(o.id, 'decline').status, 'failed');
  c.startCheckout(o.id);
  assert.equal(c.pay(o.id, 'succeed').status, 'paid_simulated');
});
test('no report without simulated payment; illegal transitions rejected', async () => {
  const c = createCommerce({catalog});
  const o = order(c);
  await assert.rejects(c.generateReport(o.id, ctx), e => e.code === 'payment_required');
  c.cancel(o.id);
  assert.throws(() => c.startCheckout(o.id), e => e.code === 'invalid_transition');
});
test('never accepts payment details', () => {
  const c = createCommerce({catalog});
  const o = order(c);
  for (const k of ['cardNumber', 'cvv', 'expiry', 'iban']) assert.throws(() => c.startCheckout(o.id, {[k]: 'x'}), e => e.code === 'payment_details_forbidden');
});
test('only the priority product is sellable; partial readings rejected', () => {
  const c = createCommerce({catalog});
  assert.throws(() => c.createOrder({productId: 'couple', idempotencyKey: 'k-couple-1', ...ctx}), e => e.code === 'product_unavailable');
  const partial = matchPreview(A, {...B, unknownTime: true, time: ''}, '2026-11-26');
  assert.throws(() => c.createOrder({productId: 'match-premium', idempotencyKey: 'k-partial-1', ...ctx, result: partial}));
});
test('report generation is idempotent and failures are recoverable', async () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id); c.pay(o.id);
  const broken = {kind: 'mock', generate: async () => ({text: '{"bad":1}', usage: {inputTokens: 10, outputTokens: 10}})};
  const failed = await c.generateReport(o.id, {...ctx, adapter: broken});
  assert.equal(failed.status, 'failed');
  assert.equal(c.get(o.id).status, 'paid_simulated');
  const ok = await c.generateReport(o.id, ctx);
  assert.equal(ok.status, 'ready');
  assert.equal(await c.generateReport(o.id, ctx), ok);
});
test('report input cannot be swapped after purchase', async () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id); c.pay(o.id);
  const other = matchPreview({...A, date: '1980-01-01'}, B, '2026-11-26');
  await assert.rejects(c.generateReport(o.id, {...ctx, result: other}), e => e.code === 'report_input_mismatch');
});
test('persistence round-trip enables recovery', async () => {
  let saved = null;
  const c = createCommerce({catalog, persist: d => {saved = JSON.parse(JSON.stringify(d));}});
  const o = order(c); c.startCheckout(o.id); c.pay(o.id); await c.generateReport(o.id, ctx);
  const restored = createCommerce({catalog, load: () => saved});
  assert.equal(restored.recover(o.recoveryCode).report.status, 'ready');
  assert.equal(restored.createOrder({productId: 'match-premium', idempotencyKey: 'idem-key-0001', ...ctx}).id, o.id);
});
test('report HTML is escaped, labelled as simulation and has no personal data', async () => {
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id); c.pay(o.id);
  const r = await c.generateReport(o.id, ctx);
  const html = reportHtml(r, c.get(o.id), true);
  assert.match(html, /SIMULACIÓN/);
  assert.ok(!/<script/i.test(html));
  for (const s of ['London', 'New York', '1993', '1995']) assert.ok(!html.includes(s), s);
});
test('mock provider exposes no payment-detail inputs', () => {
  const p = mockPaymentProvider();
  assert.deepEqual(Object.keys(p).sort(), ['complete', 'createSession', 'kind']);
});
test('premium report with story attachment: cover, 8 chapters, escaped, simulation banner', async () => {
  const {storyFromResult} = await import('../src/lib/natal-interpretation/index.mjs');
  const story = storyFromResult(result, {lang: 'es', names: ['Ana <b>', 'Leo'], relationship: 'partner', premium: true});
  const c = createCommerce({catalog});
  const o = order(c); c.startCheckout(o.id); c.pay(o.id);
  const r = await c.generateReport(o.id, {...ctx, attachment: story});
  const html = reportHtml(r, c.get(o.id), true);
  assert.match(html, /class="cover"/);
  assert.equal((html.match(/<section class="chapter">/g) ?? []).length, 8);
  assert.match(html, /SIMULACIÓN/);
  assert.ok(html.includes('Ana &lt;b&gt;') && !html.includes('Ana <b>'));
  assert.ok(!/<script/i.test(html));
});
