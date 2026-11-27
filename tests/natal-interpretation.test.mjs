import test from 'node:test';
import assert from 'node:assert/strict';
import {matchPreview} from '../src/lib/match-preview.mjs';
import {calculateUtc} from '../src/lib/ephemeris.mjs';
import {natalAngles} from '../src/lib/natal-angles.mjs';
import {storyFromResult, natalEvidence, evidenceIds, FORBIDDEN, ROMANTIC_WORDS} from '../src/lib/natal-interpretation/index.mjs';
import {buildStoryRequest, validateStoryResponse, LLM_ENABLED} from '../src/lib/natal-interpretation/llm-adapter.mjs';

// Fictional people; coordinates are GeoNames values.
const CHICLAYO = {place: 'Chiclayo', zone: 'America/Lima', latitude: -6.77008, longitude: -79.84088};
const TOKYO = {place: 'Tokyo', zone: 'Asia/Tokyo', latitude: 35.6895, longitude: 139.69171};
const A = {date: '1990-03-06', time: '07:45', unknownTime: false, ...CHICLAYO};
const B = {date: '1995-09-22', time: '15:30', unknownTime: false, ...TOKYO};
const run = (a, b, o = {}) => storyFromResult(matchPreview(a, b, '2026-11-27'), {lang: 'es', names: ['Ana', 'Leo'], relationship: 'partner', unknownTime: [a.unknownTime, b.unknownTime], ...o});
const allText = s => [...s.people.flatMap(p => [...p.sections.map(x => x.text), ...p.details.map(d => d.text)]), ...s.couple.story.map(x => x.text), ...[...s.couple.affinities, ...(s.couple.intense ?? []), ...s.couple.tensions].flatMap(c => [c.title, c.story, c.daily, c.benefit, c.tip, c.care, c.misunderstanding, c.needX, c.needY, c.action].filter(Boolean)), ...s.couple.daily.map(d => d.text), ...(s.couple.overlays ?? []).map(o => o.text), ...Object.values(s.couple.advice).flat(), s.couple.closing, s.couple.title].join('\n');
const chartAt = (utc, lat, lon) => {const t = new Date(utc); return {longitudes: calculateUtc(t).longitudes, angles: natalAngles(t, lat, lon)};};

test('LLM layer is prepared but disabled', () => assert.equal(LLM_ENABLED, false));
test('individual reading: 12 sections per person (incl. inner contrasts), each with evidence', () => {
  const s = run(A, B);
  for (const p of s.people) {
    assert.equal(p.sections.length, 12);
    assert.deepEqual(p.sections.map(x => x.key).slice(8, 10), ['challenges', 'contrasts']);
    for (const sec of p.sections) {assert.ok(sec.text.length > 20, sec.key); assert.ok(sec.evidence.length > 0 || ['emotional', 'contrasts'].includes(sec.key), sec.key);}
  }
});
test('different people get different readings (no paragraph reuse with swapped names)', () => {
  const s = run(A, B);
  const a = s.people[0].sections.map(x => x.text.replaceAll('Ana', 'X')), b = s.people[1].sections.map(x => x.text.replaceAll('Leo', 'X'));
  const same = a.filter((t, i) => t === b[i]).length;
  assert.ok(same <= 1, `${same} identical sections`);
});
test('same Sun sign, different configuration → different reading', () => {
  // Both Pisces Suns (1990-03-06 vs 1995-03-03) with different Moon/Venus/ASC.
  const s1 = run(A, B), s2 = run({...A, date: '1995-03-03', time: '22:10'}, B);
  assert.equal(s1.evidence[0].placements.Sun.sign, s2.evidence[0].placements.Sun.sign);
  const t1 = s1.people[0].sections.map(x => x.text), t2 = s2.people[0].sections.map(x => x.text);
  assert.ok(t1.filter((t, i) => t !== t2[i]).length >= 6);
});
test('every cited evidence id exists in Layer A', () => {
  const s = run(A, B);
  const ids = [evidenceIds(s.evidence[0]), evidenceIds(s.evidence[1])];
  s.people.forEach((p, i) => p.sections.forEach(sec => sec.evidence.forEach(id => assert.ok(ids[i].has(id), `${p.name}: ${id}`))));
  const cross = new Set(s.couple.crossAspectIds);
  for (const c of [...s.couple.affinities, ...s.couple.tensions]) for (const id of c.evidence) assert.ok(cross.has(id), id);
  for (const d of s.couple.daily.filter(d => d.status === 'evidence')) for (const id of d.evidence) assert.ok(cross.has(id), id);
});
test('affinities and tensions only come from real cross aspects, never padded', () => {
  const s = run(A, B, {premium: true});
  const cross = new Set(s.couple.crossAspectIds);
  assert.ok(s.couple.affinities.length > 0 && s.couple.tensions.length > 0, 'this pair has both');
  for (const c of s.couple.affinities) assert.equal(c.tone, 'harmonious');
  for (const c of s.couple.tensions) assert.equal(c.tone, 'tense');
  assert.ok([...s.couple.affinities, ...s.couple.tensions].every(c => cross.has(c.id)));
});
test('absence of relevant aspects: no invented cards, honest wording', () => {
  // Two artificial charts with every point 15° apart from all of the other's points.
  const base = k => ({longitudes: Object.fromEntries(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].map((p, i) => [p, (k + i * 0.01) % 360]))});
  const evA = natalEvidence(base(10), {unknownTime: true}), evB = natalEvidence(base(25), {unknownTime: true});
  const s = storyFromResult({charts: [base(10), base(25)]}, {lang: 'es', names: ['Ana', 'Leo'], unknownTime: [true, true]});
  void evA; void evB;
  assert.equal(s.couple.affinities.length, 0);
  assert.equal(s.couple.tensions.length, 0);
  assert.ok(s.couple.daily.every(d => d.status !== 'evidence'));
  assert.match(s.couple.closing, /por descubrirse/);
});
test('swapping A and B keeps the same affinities and tensions', () => {
  const s1 = run(A, B), s2 = storyFromResult(matchPreview(B, A, '2026-11-27'), {lang: 'es', names: ['Leo', 'Ana'], unknownTime: [false, false]});
  const keys = s => new Set([...s.couple.affinities, ...s.couple.tensions].map(c => c.key + ':' + c.tone));
  assert.deepEqual(keys(s1), keys(s2));
  assert.equal(s1.couple.title, s2.couple.title);
});
test('unknown time: no Ascendant, MC, houses or uncertain Moon claims', () => {
  const stable = run({...A, unknownTime: true, time: ''}, B);
  assert.equal(stable.evidence[0].moon.status, 'stable-sign');
  assert.match(stable.people[0].sections[1].text, /permaneció todo ese día en Cáncer/);
  assert.match(stable.people[0].sections[2].text, /no podemos calcular el Ascendente/);
  assert.ok(!stable.evidence[0].placements.Ascendant && !stable.evidence[0].placements.Midheaven && !stable.evidence[0].placements.Sun.house);
  const unstable = run({...A, date: '1993-03-10', unknownTime: true, time: ''}, B);
  assert.equal(unstable.evidence[0].moon.status, 'uncertain');
  assert.ok(!unstable.evidence[0].placements.Moon);
  assert.match(unstable.people[0].sections[1].text, /pudo estar en Libra o en Escorpio/);
  assert.ok(!allText(unstable).includes('Luna de Ana'), 'no Moon claims for Ana');
  assert.ok(unstable.uncertainty.includes('A:moon-sign'));
});
test('Spanish and English are both complete', () => {
  const en = run(A, B, {lang: 'en'});
  assert.match(en.people[0].sections[0].text, /has the Sun in Pisces/);
  assert.match(en.couple.title, /depth and curiosity/);
  assert.ok(!/ tiene | busca /.test(allText(en)));
});
test('relationship types: friendship has no romantic content; crush/partner advice differs', () => {
  for (const premium of [false, true]) {
    const f = run(A, B, {relationship: 'friendship', premium});
    assert.ok(!ROMANTIC_WORDS.test(allText(f)), allText(f).split('\n').find(l => ROMANTIC_WORDS.test(l)));
    assert.ok(!f.couple.daily.some(d => d.key === 'intimacy'));
  }
  assert.notDeepEqual(run(A, B, {relationship: 'crush'}).couple.advice.activities, run(A, B, {relationship: 'partner'}).couple.advice.activities);
});
test('no forbidden claims (fate, infidelity, breakups, health, pregnancy, death) in any variant', () => {
  for (const lang of ['es', 'en']) for (const relationship of ['partner', 'crush', 'friendship']) for (const premium of [false, true]) {
    const t = allText(run(A, B, {lang, relationship, premium}));
    for (const r of FORBIDDEN) assert.ok(!r.test(t), `${lang}/${relationship}/${premium}: ${r}`);
  }
});
test('no contradictions: a body pair is never both affinity and tension', () => {
  const s = run(A, B, {premium: true});
  const aff = new Set(s.couple.affinities.map(c => c.key)), ten = new Set(s.couple.tensions.map(c => c.key));
  for (const k of aff) assert.ok(!ten.has(k), k);
});
test('deterministic', () => assert.deepEqual(run(A, B), run(A, B)));
test('editorial length (CTO block 3): free 1,200–1,800 words with enough evidence; premium ≥ 2,900', () => {
  const free = run(A, B), premium = run(A, B, {premium: true});
  for (const p of free.people) assert.ok(p.words >= 200 && p.words <= 450, `person ${p.words}`);
  assert.ok(free.words >= 1200 && free.words <= 1800, `free ${free.words}`);
  assert.ok(premium.words >= 2900 && premium.words <= 5000, `premium ${premium.words}`);
});
test('no reading is generated from generic sign-only data: placements drive text', () => {
  const ev = natalEvidence(chartAt('2000-01-01T12:00:00Z', -12.04318, -77.02824));
  assert.equal(ev.placements.Sun.sign, 9); // Capricorn on 1 Jan 2000
  assert.ok(ev.aspects.every(a => a.deviation <= a.orb));
});
test('LLM request carries no names, dates, places or coordinates', () => {
  const s = run(A, B);
  const req = buildStoryRequest(s.evidence[0], s.evidence[1], {lang: 'es', relationship: 'partner'});
  const json = JSON.stringify(req);
  for (const leak of ['Ana', 'Leo', 'Chiclayo', 'Tokyo', '1993', '1995', '-6.77', '139.6', 'lon']) assert.ok(!json.includes(leak), leak);
});
test('LLM response validation rejects invented evidence, forbidden claims, scores and romance in friendship', () => {
  const s = run(A, B);
  const req = buildStoryRequest(s.evidence[0], s.evidence[1], {lang: 'es', relationship: 'friendship'});
  const ok = JSON.stringify({chapters: [{key: 'together', paragraphs: [{text: 'A y B comparten curiosidad.', evidence: [req.allowedEvidence[0]]}]}]});
  assert.equal(validateStoryResponse(ok, req, ['Ana', 'Leo'])[0].paragraphs[0].text, 'Ana y Leo comparten curiosidad.');
  const bad = t => JSON.stringify({chapters: [{key: 'together', paragraphs: [{text: t, evidence: [req.allowedEvidence[0]]}]}]});
  assert.throws(() => validateStoryResponse(JSON.stringify({chapters: [{key: 'together', paragraphs: [{text: 'x', evidence: ['A:aspect:Sun-Venus:trine-invented']}]}]}), req));
  assert.throws(() => validateStoryResponse(bad('Están predestinados.'), req));
  assert.throws(() => validateStoryResponse(bad('Su compatibilidad es 87/100.'), req));
  assert.throws(() => validateStoryResponse(bad('Hay una fuerte atracción romántica.'), req));
  assert.throws(() => validateStoryResponse('not json', req));
});
test('unknown time: a planet that changes sign that day is not interpreted', () => {
  // Mercury entered Pisces on 1993-02-25 (sampled day must show a sign change for some body).
  let found = null;
  for (let d = 1; d <= 60 && !found; d++) {
    const date = new Date(Date.UTC(1993, 0, d)).toISOString().slice(0, 10);
    const s = run({...A, date, unknownTime: true, time: ''}, B);
    const u = s.evidence[0].uncertainty.find(x => x.startsWith('sign:'));
    if (u) found = {s, body: u.slice(5)};
  }
  assert.ok(found, 'expected a sign change for some planet in Jan–Feb 1993');
  assert.ok(!found.s.evidence[0].placements[found.body]);
  assert.ok(!found.s.evidence[0].aspects.some(a => a.a === found.body || a.b === found.body));
});
test('unknown time on a Sun ingress day: no Sun claims, no crash', () => {
  // Sun enters Aries around 20 March each year.
  const s = run({...A, date: '1993-03-20', unknownTime: true, time: ''}, B);
  if (!s.evidence[0].placements.Sun) {
    assert.match(s.people[0].sections[0].text, /cambió de signo/);
    assert.ok(!/Sol en/.test(s.people[0].sections.map(x => x.text).join(' ')));
  } else assert.ok(s.evidence[0].placements.Sun.lonRange);
});

test('C-02: conjunctions are mixed, never purely tense; intense ones also name a constructive side', () => {
  for (const date of ['1990-03-06', '1990-07-14', '1985-11-02', '2001-05-20']) {
    const s = run({...A, date}, B, {premium: true});
    for (const ev of s.evidence) for (const a of ev.aspects.filter(x => x.type === 'conjunction')) assert.equal(a.tone, 'mixed', a.id);
    assert.ok(!s.couple.tensions.some(c => c.id.endsWith(':conjunction')));
    assert.ok(s.couple.affinities.every(c => c.tone === 'harmonious'), 'mixed contacts are not presented as affinities');
    for (const c of s.couple.intense) {assert.equal(c.tone, 'mixed'); assert.ok(c.care && c.benefit, 'intense card names a possibility and a care note');}
  }
  const t = run(A, B).people[0].sections.find(x => x.key === 'contrasts').text;
  assert.match(t, /determinación|coherencia/);
});
test('C-03: least-represented wording, no deficit language, coverage and ties reported', () => {
  const s = run(A, B, {premium: true});
  const all = allText(s);
  assert.ok(!/carenc(ia|e) de|le falta|lacks |lacking/i.test(all.replace('sin que indique una carencia', '')), 'no deficit wording');
  for (const ev of s.evidence) {assert.ok(ev.balance.coverage > 0 && ev.balance.coverage <= 1); assert.ok(Array.isArray(ev.balance.dominantElements));}
  const unknown = run({...A, unknownTime: true, time: ''}, B).evidence[0].balance;
  assert.ok(unknown.coverage < 1, 'coverage reflects missing ASC/MC');
});
test('C-06: chapter bridges, complementarity block, specific generic cards', () => {
  const s = run(A, B, {premium: true});
  for (const k of [1, 2, 3, 6, 7]) assert.ok(s.couple.bridges[k].length > 20, 'bridge ' + k);
  assert.match(s.couple.bridges[1], /Ana/); assert.match(s.couple.bridges[2], /Leo/);
  assert.ok(s.couple.complement.length >= 1);
  const generic = [...s.couple.affinities, ...s.couple.intense, ...s.couple.tensions].filter(c => c.area === 'general'); // built for the contact (no library entry)
  for (const c of generic) assert.match(c.story, /\((en|[A-ZÁÉÍÓÚ][\p{L} ]+ en) [A-ZÁÉÍÓÚ]/u, 'generic card names the signs: ' + c.story);
  for (const d of s.couple.daily.filter(d => d.status === 'signs')) assert.match(d.text, /lectura secundaria por signos/);
});
test('Gate 4: symbolic chemistry area for partners, absent for friendship', () => {
  assert.ok(run(A, B).couple.daily.some(d => d.title === 'Química simbólica'));
  assert.ok(!run(A, B, {relationship: 'friendship'}).couple.daily.some(d => d.key === 'intimacy'));
});
test('C-01: every unknown-time placement is sign-level only and proven for the local day', () => {
  for (const date of ['1993-01-05', '1993-03-20', '1994-07-11', '1996-12-21']) {
    const s = run({...A, date, unknownTime: true, time: ''}, B);
    const ev = s.evidence[0];
    assert.ok(ev.dayWindow && ev.dayWindow.hours >= 23);
    for (const [k, p] of Object.entries(ev.placements)) assert.ok(p.stableOnly && p.degree === undefined && p.house === undefined, k);
  }
});

// ---------- Block 3 editorial acceptance (CTO) ----------
const SAMPLE = [['1990-03-06', '07:45'], ['1990-07-14', '18:20'], ['1985-11-02', '03:10'], ['2001-05-20', '12:00'], ['1978-01-29', '21:05'], ['1996-09-09', '06:30']];
const sample = (o = {}) => SAMPLE.flatMap(([d, t]) => [run({...A, date: d, time: t}, B, o), run({...A, date: d, time: '', unknownTime: true}, {...B, time: '', unknownTime: true}, o)]);
test('block 3: no visible section is empty, in any edition or language', () => {
  for (const lang of ['es', 'en']) for (const premium of [false, true]) for (const s of sample({lang, premium}))
    for (const p of s.people) for (const x of p.sections) assert.ok(x.text.trim().length > 20, `${lang}/${premium}/${p.name}/${x.key}`);
});
test('block 3: grammar — no adjective/noun template mismatches', () => {
  const BAD = /una forma de actuar (la|el|los|las|un|una) |tiende a ser (la|el|los|las) |suele ser (la|el|los|las) (capacidad|iniciativa|visión)|a way of acting that is (a|the) /i;
  for (const lang of ['es', 'en']) for (const premium of [false, true]) for (const s of sample({lang, premium})) {const t = allText(s); assert.ok(!BAD.test(t), t.split('\n').find(l => BAD.test(l)));}
});
test('block 3: one reading per real contact — no shared card stories, no alias reuse, distinct titles', () => {
  for (const premium of [false, true]) for (const s of sample({premium})) {
    const cards = [...s.couple.affinities, ...s.couple.intense, ...s.couple.tensions];
    assert.equal(new Set(cards.map(c => c.story)).size, cards.length, 'card stories are unique');
    assert.equal(new Set(cards.map(c => c.title)).size, cards.length, 'titles are unique');
    const story = k => cards.find(c => c.key === k)?.story;
    for (const [x, y] of [['Ascendant|Moon', 'Moon|Sun'], ['Sun|Venus', 'Moon|Venus'], ['Ascendant|Mars', 'Ascendant|Venus'], ['Jupiter|Moon', 'Jupiter|Sun'], ['Jupiter|Venus', 'Jupiter|Sun']])
      if (story(x) && story(y)) assert.notEqual(story(x), story(y), `${x} reuses ${y}`);
  }
});
test('block 3: no claims of attraction, reciprocity, trust or real feelings asserted from one aspect', () => {
  const ASSERT = /\bhay magnetismo|there is magnetism|tienen puntos de encuentro reales|real meeting points|^(Confianza|Trust) |^(Un afecto|Affection) que se siente/im;
  for (const lang of ['es', 'en']) for (const s of sample({lang, premium: true})) {const t = allText(s) + '\n' + [...s.couple.intense].flatMap(c => [c.story, c.benefit, c.care]).join('\n'); assert.ok(!ASSERT.test(t), t.split('\n').find(l => ASSERT.test(l)));}
});
