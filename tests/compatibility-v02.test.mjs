import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateUtc} from '../src/lib/ephemeris.mjs';
import {natalAngles} from '../src/lib/natal-angles.mjs';
import {meanNode} from '../src/lib/houses.mjs';
import {compatibility} from '../src/lib/compatibility.mjs';
import {compatibilityV02, pointsOf, WEIGHTS, VERSION} from '../src/lib/compatibility-v02.mjs';

const mk = (utc, lat, lon) => {const t = new Date(utc); return {longitudes: calculateUtc(t).longitudes, angles: natalAngles(t, lat, lon), nodes: {north: meanNode(t)}};};
// Fictional births at GeoNames coordinates (London 2643743, New York 5128581).
const A = mk('1993-04-15T11:00:00Z', 51.50853, -0.12574), B = mk('1995-09-22T19:30:00Z', 40.71427, -74.00597);
let seed = 42; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
const randomChart = () => ({longitudes: Object.fromEntries(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].map(k => [k, rnd() * 360])), angles: {ascendant: rnd() * 360, midheaven: rnd() * 360}, nodes: {north: rnd() * 360}});

test('approved general weights 25/20/20/20/15', () => assert.deepEqual({...WEIGHTS}, {emotional: 25, communication: 20, attraction: 20, stability: 20, growth: 15}));
test('flagged as experimental candidate', () => {const r = compatibilityV02({chart: A}, {chart: B}); assert.equal(r.version, VERSION); assert.equal(r.experimental, true);});
test('symmetric when persons are swapped (300 random pairs)', () => {
  for (let i = 0; i < 300; i++) {
    const x = randomChart(), y = randomChart(), ux = rnd() < 0.3, uy = rnd() < 0.3;
    const p = compatibilityV02({chart: x, unknownTime: ux}, {chart: y, unknownTime: uy}), q = compatibilityV02({chart: y, unknownTime: uy}, {chart: x, unknownTime: ux});
    assert.equal(p.index, q.index);
    for (const k of Object.keys(WEIGHTS)) assert.equal(p.dimensions[k].score, q.dimensions[k].score, k);
  }
});
test('deterministic', () => assert.deepEqual(compatibilityV02({chart: A}, {chart: B}), compatibilityV02({chart: A}, {chart: B})));
test('each directional contact is scored once, in a single dimension', () => {
  for (let i = 0; i < 50; i++) {
    const r = compatibilityV02({chart: randomChart()}, {chart: randomChart()});
    const ids = Object.values(r.dimensions).flatMap(d => d.evidence.filter(e => e.kind === 'aspect').map(e => e.personA + '>' + e.personB));
    assert.equal(new Set(ids).size, ids.length);
  }
});
test('traceability: dimension raw sum equals the sum of its evidence', () => {
  const r = compatibilityV02({chart: A}, {chart: B});
  for (const d of Object.values(r.dimensions)) assert.ok(Math.abs(d.evidence.reduce((s, e) => s + e.contribution, 0) - d.rawSum) < 0.01);
});
test('supportive and challenging contributions are both reported', () => {
  const r = compatibilityV02({chart: A}, {chart: B});
  const tones = new Set(Object.values(r.dimensions).flatMap(d => d.evidence.map(e => e.tone)));
  assert.ok(tones.has('supportive') && tones.has('challenging'));
});
test('unknown time removes Moon, angles and incoming house overlays', () => {
  const pts = pointsOf({chart: A, unknownTime: true});
  assert.ok(!('Moon' in pts) && !('Ascendant' in pts) && !('Midheaven' in pts) && 'Sun' in pts && 'NorthNode' in pts);
  const r = compatibilityV02({chart: A, unknownTime: true}, {chart: B});
  assert.equal(r.overlays.bInA, null);
  assert.ok(Array.isArray(r.overlays.aInB));
  assert.ok(!Object.values(r.dimensions).some(d => d.evidence.some(e => e.personA === 'Moon' || e.personA === 'Ascendant' || (e.kind === 'overlay' && e.direction === 'aInB' && e.body === 'Moon'))));
  assert.ok(r.dimensions.emotional.coverage < 1);
});
test('lunar nodes only form conjunctions/oppositions and read as growth', () => {
  for (let i = 0; i < 100; i++) {
    const r = compatibilityV02({chart: randomChart()}, {chart: randomChart()});
    for (const e of r.dimensions.growth.evidence.filter(e => e.personA === 'NorthNode' || e.personB === 'NorthNode')) {
      assert.ok(['conjunction', 'opposition'].includes(e.aspect));
      assert.ok(e.contribution >= 0);
    }
  }
});
test('bounded 0–100 and null without data', () => {
  for (let i = 0; i < 100; i++) {const r = compatibilityV02({chart: randomChart()}, {chart: randomChart()}); assert.ok(r.index >= 0 && r.index <= 100);}
  assert.equal(compatibilityV02({chart: {longitudes: {}}}, {chart: {longitudes: {}}}).index, null);
});
test('regression golden values (fictional London/New York charts)', () => {
  const v1 = compatibility(A.longitudes, B.longitudes);
  assert.equal(v1.version, 'symbolic-0.1');
  assert.equal(v1.index, 49);
  assert.deepEqual(Object.fromEntries(Object.entries(v1.dimensions).map(([k, d]) => [k, d.score])), {emotional: 50, communication: 50, attraction: 45, stability: 50, growth: 50});
  const v2 = compatibilityV02({chart: A}, {chart: B});
  assert.equal(v2.index, 54);
  assert.deepEqual(Object.fromEntries(Object.entries(v2.dimensions).map(([k, d]) => [k, d.score])), {emotional: 66, communication: 40, attraction: 41, stability: 55, growth: 69});
  assert.equal(compatibilityV02({chart: A}, {chart: B, unknownTime: true}).index, 50);
});

// ---------- CTO block 3: versioned parameter sets ----------
import {PARAM_SETS} from '../src/lib/compatibility-v02.mjs';
test('default params reproduce the frozen candidate and report paramSet', () => {
  const r = compatibilityV02({chart: A}, {chart: B});
  assert.equal(r.paramSet, 'candidate');
  assert.deepEqual(compatibilityV02({chart: A}, {chart: B}, PARAM_SETS.candidate).index, r.index);
});
test('symmetric sets stay symmetric in A/B and deterministic', () => {
  for (const set of ['sym-a', 'sym-b', 'sym-c']) for (let i = 0; i < 30; i++) {
    const x = randomChart(), y = randomChart();
    assert.equal(compatibilityV02({chart: x}, {chart: y}, PARAM_SETS[set]).index, compatibilityV02({chart: y}, {chart: x}, PARAM_SETS[set]).index);
  }
  assert.equal(compatibilityV02({chart: A}, {chart: B}, PARAM_SETS['sym-a']).paramSet, 'sym-a');
});
test('symmetric polarity: an exact trine and an exact square of the same pair weigh +w and −w', () => {
  const mk = (s, m) => ({longitudes: {Sun: s, Moon: m, Mercury: 200, Venus: 300, Mars: 305, Jupiter: 310, Saturn: 315, Uranus: 320, Neptune: 325, Pluto: 330}});
  const a = mk(0, 100), b = mk(10, 120); // A.Sun–B.Moon trine (120°), A.Moon–B.Sun square (90°), both exact
  const ev = compatibilityV02({chart: a}, {chart: b}, {...PARAM_SETS['sym-a'], overlays: false}).dimensions.emotional.evidence;
  const c = (x, y) => ev.find(e => e.personA === x && e.personB === y)?.contribution;
  assert.equal(c('Sun', 'Moon'), 1); assert.equal(c('Moon', 'Sun'), -1);
  const asym = compatibilityV02({chart: a}, {chart: b}, {overlays: false}).dimensions.emotional.evidence;
  assert.equal(asym.find(e => e.personA === 'Moon' && e.personB === 'Sun').contribution, -0.7, 'asymmetric candidate keeps −0.7');
});
test('friendship excludes attraction and renormalises the remaining weights', () => {
  const r = compatibilityV02({chart: A}, {chart: B}, {relationship: 'friendship'});
  assert.equal(r.dimensions.attraction.status, 'excluded');
  assert.equal(r.dimensions.attraction.score, null);
  const w = {emotional: 25, communication: 20, stability: 20, growth: 15};
  const live = Object.entries(w).filter(([k]) => r.dimensions[k].score !== null);
  const expected = Math.round(live.reduce((s, [k, x]) => s + r.dimensions[k].score * x, 0) / live.reduce((s, [, x]) => s + x, 0));
  assert.equal(r.index, expected);
});
test('nodes and overlays can be switched off for sensitivity analysis', () => {
  const r = compatibilityV02({chart: A}, {chart: B}, {nodes: false, overlays: false});
  for (const d of Object.values(r.dimensions)) assert.ok(d.evidence.every(e => e.kind === 'aspect' && e.personA !== 'NorthNode' && e.personB !== 'NorthNode'));
});
