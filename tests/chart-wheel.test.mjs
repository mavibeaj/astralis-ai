import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateUtc} from '../src/lib/ephemeris.mjs';
import {natalAngles} from '../src/lib/natal-angles.mjs';
import {formatPosition, screenAngle, spread, wheelModel, aspectsBetween} from '../src/lib/chart-wheel.mjs';

const t = new Date('1993-04-15T11:00:00Z');
const chart = {longitudes: calculateUtc(t).longitudes, angles: natalAngles(t, 51.50853, -0.12574), nodes: {north: 250}};
const gap = (a, b) => {const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d);};

test('formatPosition', () => {
  assert.equal(formatPosition(0), '0°00′ Aries');
  assert.equal(formatPosition(135.0667), '15°04′ Leo');
  assert.equal(formatPosition(359.999), '0°00′ Aries');
  assert.equal(formatPosition(29.9999), '0°00′ Taurus');
  assert.equal(formatPosition(29.5), '29°30′ Aries');
});
test('ascendant sits at 9 o\'clock and longitudes run counter-clockwise', () => {
  assert.equal(screenAngle(100, 100), 180);
  assert.equal(screenAngle(190, 100), 270);
});
test('spread keeps order, enforces separation and stays near the true position', () => {
  const pts = [{key: 'a', lon: 10}, {key: 'b', lon: 11}, {key: 'c', lon: 12}, {key: 'd', lon: 13}, {key: 'e', lon: 200}];
  const out = spread(pts, 7);
  const byKey = Object.fromEntries(out.map(p => [p.key, p]));
  for (let i = 0; i < out.length; i++) assert.ok(gap(out[i].display, out[(i + 1) % out.length].display) >= 6.99);
  for (const p of out) assert.ok(gap(p.display, p.lon) < 15, p.key);
  assert.ok(byKey.a.display < byKey.b.display && byKey.b.display < byKey.c.display);
  assert.equal(byKey.e.display, 200);
});
test('spread wraps across 0° Aries', () => {
  const out = spread([{key: 'a', lon: 358}, {key: 'b', lon: 1}], 7);
  assert.ok(gap(out[0].display, out[1].display) >= 6.99);
});
test('natal wheel model uses engine data, houses and axes', () => {
  const m = wheelModel(chart);
  assert.equal(m.orientation, 'ascendant');
  assert.equal(m.houses.cusps.length, 12);
  assert.ok(Math.abs(m.axes.asc - 180) < 1e-9);
  const sun = m.bodiesInner.find(b => b.key === 'Sun');
  assert.ok(Math.abs(sun.lon - chart.longitudes.Sun) < 1e-9);
  assert.ok(m.bodiesInner.some(b => b.key === 'NorthNode'));
  assert.equal(m.signs.length, 12);
});
test('unknown time: no houses, no axes, Aries orientation, Moon absent if engine removed it', () => {
  const noTime = {longitudes: {...chart.longitudes}, angles: null};
  delete noTime.longitudes.Moon;
  const m = wheelModel(noTime);
  assert.equal(m.houses, null);
  assert.equal(m.axes, null);
  assert.equal(m.orientation, 'aries');
  assert.ok(!m.bodiesInner.some(b => b.key === 'Moon' || b.key === 'Ascendant'));
});
test('synastry bi-wheel: cross aspects only between persons', () => {
  const t2 = new Date('1995-09-22T19:30:00Z');
  const other = {longitudes: calculateUtc(t2).longitudes, angles: natalAngles(t2, 40.71427, -74.00597)};
  const m = wheelModel(chart, other);
  assert.ok(m.bodiesOuter.length >= 10);
  const innerKeys = new Set(m.bodiesInner.map(b => b.key));
  for (const a of m.aspects) assert.ok(innerKeys.has(a.a));
  assert.deepEqual(m.aspects, wheelModel(chart, other).aspects);
});
test('natal aspects list each pair once and skip ASC–MC', () => {
  const pts = [{key: 'Sun', lon: 0}, {key: 'Moon', lon: 120}, {key: 'Ascendant', lon: 90}, {key: 'Midheaven', lon: 0}];
  const asp = aspectsBetween(pts, pts, true);
  assert.ok(!asp.some(a => a.a === a.b));
  assert.ok(!asp.some(a => (a.a === 'Ascendant' && a.b === 'Midheaven')));
  assert.equal(asp.filter(a => a.a === 'Sun' && a.b === 'Moon').length, 1);
});
