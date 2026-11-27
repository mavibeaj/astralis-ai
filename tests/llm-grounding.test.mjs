import test from 'node:test';
import assert from 'node:assert/strict';
import {matchPreview} from '../src/lib/match-preview.mjs';
import {storyFromResult} from '../src/lib/natal-interpretation/index.mjs';
import {buildStoryRequest, validateStoryResponse} from '../src/lib/natal-interpretation/llm-adapter.mjs';
import {mockModel, checkGrounding, estimateCost} from '../src/lib/natal-interpretation/llm-mock.mjs';

const A = {date: '1990-03-06', time: '07:45', unknownTime: false, place: 'Chiclayo', zone: 'America/Lima', latitude: -6.77008, longitude: -79.84088};
const B = {date: '1995-09-22', time: '15:30', unknownTime: false, place: 'Tokyo', zone: 'Asia/Tokyo', latitude: 35.6895, longitude: 139.69171};
const s = storyFromResult(matchPreview(A, B, '2026-11-27'), {lang: 'es', names: ['Ana', 'Leo']});
const req = buildStoryRequest(s.evidence[0], s.evidence[1], {lang: 'es', relationship: 'partner'});
const tense = s.evidence[0].aspects.find(a => a.tone === 'tense'), harm = s.evidence[0].aspects.find(a => a.tone === 'harmonious');
const sunSign = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo', 'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'][s.evidence[0].placements.Sun.sign];
const one = (text, evidence) => JSON.stringify({chapters: [{key: 'personA', paragraphs: [{text, evidence}]}]});

test('mock model output passes structural and semantic validation end to end', () => {
  const out = validateStoryResponse(mockModel(req), req, ['Ana', 'Leo']);
  assert.ok(out.length >= 1 && out[0].paragraphs.length >= 1);
  assert.match(out[0].paragraphs[0].text, /Ana/);
});
test('valid citation but wrong sign is rejected', () => {
  const wrong = sunSign === 'Libra' ? 'Aries' : 'Libra';
  assert.throws(() => validateStoryResponse(one(`El Sol de A está en ${wrong}.`, ['A:placement:Sun']), req), /sign/);
  assert.doesNotThrow(() => validateStoryResponse(one(`El Sol de A está en ${sunSign}.`, ['A:placement:Sun']), req));
});
test('valid citation but wrong aspect type or body is rejected', () => {
  const other = tense.type === 'trine' ? 'cuadratura' : 'trígono';
  assert.throws(() => validateStoryResponse(one(`Hay un ${other} importante.`, [`A:${tense.id}`]), req), /aspect/);
  assert.throws(() => validateStoryResponse(one('Neptuno marca esta carta.', ['A:placement:Sun']), req), /body/);
});
test('tone that contradicts the cited aspect is rejected', () => {
  assert.throws(() => validateStoryResponse(one('Aquí todo fluye con armonía.', [`A:${tense.id}`]), req), /harmony/);
  if (harm) assert.throws(() => validateStoryResponse(one('Aquí hay mucha fricción y choque.', [`A:${harm.id}`]), req), /tension/);
});
test('certainty and predictions are rejected even with valid citations', () => {
  assert.throws(() => validateStoryResponse(one('A siempre reacciona así.', ['A:placement:Sun']), req), /certainty/);
  assert.throws(() => validateStoryResponse(one('Esta pareja va a durar.', ['A:placement:Sun']), req), /prediction/);
  assert.deepEqual(checkGrounding('A podría valorar la calma.', ['A:placement:Sun'], req), []);
});
test('cost model stays within the USD 0.10 target with placeholder prices', () => {
  const premium = storyFromResult(matchPreview(A, B, '2026-11-27'), {lang: 'es', names: ['Ana', 'Leo'], premium: true});
  // Realistic worst case: the model rewrites every narrative sentence of the premium reading,
  // wrapped in the citation JSON (~25% overhead).
  const C = premium.couple;
  const prose = [...premium.people.flatMap(p => [...p.sections.map(x => x.text), ...p.details.map(d => d.text)]), ...C.story.map(x => x.text), ...[...C.affinities, ...C.tensions].flatMap(c => [c.story, c.daily, c.benefit, c.tip, c.care, c.misunderstanding, c.needX, c.needY, c.action].filter(Boolean)), ...C.daily.map(d => d.text), ...C.overlays.map(o => o.text), C.closing].join(' ');
  const c = estimateCost(req, prose + ' '.repeat(Math.round(prose.length * 0.25)));
  assert.ok(c.placeholder);
  console.log(`premium rewrite estimate: ${c.inputTokens} in / ${c.outputTokens} out tokens ≈ USD ${c.usd} (placeholder prices)`);
  assert.ok(c.usd < 0.10, `estimated ${c.usd}`);
});
