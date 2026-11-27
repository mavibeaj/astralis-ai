import test from 'node:test';
import assert from 'node:assert/strict';
import {localDayWindow, sampler, stableSign, aspectPersists, MAX_SPEED} from '../src/lib/natal-interpretation/uncertainty.mjs';
import {calculateUtc} from '../src/lib/ephemeris.mjs';

const H = 3600000;
test('local day window: normal, DST spring (23 h), DST fall (25 h), historical Peru DST', () => {
  assert.equal(localDayWindow('2021-06-01', 'America/New_York').hours, 24);
  assert.equal(localDayWindow('2021-03-14', 'America/New_York').hours, 23);
  assert.equal(localDayWindow('2021-11-07', 'America/New_York').hours, 25);
  const lima = localDayWindow('1990-03-06', 'America/Lima');
  assert.equal(new Date(lima.startMs).toISOString(), '1990-03-06T04:00:00.000Z'); // Peru observed UTC-4 in summer 1989-90 (tzdb)
  assert.equal(new Date(lima.endMs).toISOString(), '1990-03-07T03:59:59.000Z');
  const peruDst = localDayWindow('1987-02-15', 'America/Lima'); // Peru observed UTC-4 that summer
  assert.equal(new Date(peruDst.startMs).toISOString(), '1987-02-15T04:00:00.000Z');
});
test('speed bounds are not exceeded by real motion (Moon, Mercury, Venus, Sun, Mars over 2 years, hourly)', () => {
  const max = {};
  for (let ms = Date.UTC(1993, 0, 1); ms < Date.UTC(1995, 0, 1); ms += 6 * H) {
    const a = calculateUtc(new Date(ms)).longitudes, b = calculateUtc(new Date(ms + H)).longitudes;
    for (const k of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']) {let d = Math.abs(b[k] - a[k]); if (d > 180) d = 360 - d; max[k] = Math.max(max[k] ?? 0, d * 24);}
  }
  for (const [k, v] of Object.entries(max)) assert.ok(v < MAX_SPEED[k], `${k} observed ${v.toFixed(3)}°/day ≥ bound ${MAX_SPEED[k]}`);
});
test('stableSign never claims stability when a 5-minute brute-force scan sees a sign change (365 days, 5 bodies)', () => {
  const at = sampler();
  let changes = 0;
  for (let d = 0; d < 365; d++) {
    const date = new Date(Date.UTC(1993, 0, 1) + d * 24 * H).toISOString().slice(0, 10);
    const w = localDayWindow(date, 'America/Lima');
    for (const body of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']) {
      const r = stableSign(at, body, w.startMs, w.endMs);
      let brute = false; const s0 = Math.floor(at(w.startMs, body) / 30);
      for (let ms = w.startMs; ms <= w.endMs; ms += 5 * 60000) if (Math.floor(at(ms, body) / 30) !== s0) {brute = true; break;}
      if (brute) {changes++; assert.equal(r.stable, false, `${body} ${date}`);}
    }
  }
  assert.ok(changes >= 30, `expected many ingress days in a year, saw ${changes}`); // ~13 lunar × … + planets
});
test('stableSign proves the obvious mid-sign case', () => {
  const at = sampler(), w = localDayWindow('1990-03-06', 'America/Lima');
  const r = stableSign(at, 'Sun', w.startMs, w.endMs);
  assert.deepEqual([r.stable, r.sign], [true, 11]); // Pisces
});
test('aspectPersists: rejects an aspect that leaves orb during the day, accepts a fixed exact one', () => {
  const at = sampler(), w = localDayWindow('1990-03-06', 'America/Lima');
  const moonMid = at((w.startMs + w.endMs) / 2, 'Moon');
  // Fixed partner point exactly at the Moon's midday longitude: Moon moves ~13° → a 3° orb cannot hold all day.
  const fixed = {at: () => moonMid, body: 'Ascendant', a: 0, b: 0};
  assert.equal(aspectPersists({at, body: 'Moon', a: w.startMs, b: w.endMs}, fixed, 'conjunction', 3), false);
  assert.equal(aspectPersists({at, body: 'Moon', a: w.startMs, b: w.endMs}, fixed, 'conjunction', 8), true);
  assert.equal(aspectPersists(fixed, {at: () => moonMid + 1, body: 'Sun', a: 0, b: 0}, 'conjunction', 3), true);
});
