import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {natalAngles} from '../src/lib/natal-angles.mjs';
import {placidusCusps, meanNode, houseOf, POLAR_LIMIT} from '../src/lib/houses.mjs';
const ref = JSON.parse(readFileSync(new URL('./fixtures/ephemeris-reference.json', import.meta.url)));
const arcsec = (a, b) => {const x = Math.abs(a - b) % 360; return Math.min(x, 360 - x) * 3600;};
for (const c of ref.cases) {
  test(`Placidus cusps within 5″ of Swiss Ephemeris: ${c.place} ${c.localDate}`, () => {
    const t = new Date(c.utc), p = placidusCusps(t, c.latitude, c.longitude, natalAngles(t, c.latitude, c.longitude));
    p.cusps.forEach((v, i) => assert.ok(arcsec(v, c.placidusCusps[i]) <= 5, `cusp ${i + 1}: ${arcsec(v, c.placidusCusps[i]).toFixed(1)}″`));
  });
  test(`mean lunar node within 30″: ${c.place} ${c.localDate}`, () => assert.ok(arcsec(meanNode(new Date(c.utc)), c.longitudes.MeanNode) <= 30));
}
test('Placidus omitted near polar circles', () => {
  const t = new Date('2000-06-21T12:00:00Z');
  assert.equal(placidusCusps(t, POLAR_LIMIT + 1, 20, natalAngles(t, POLAR_LIMIT + 1, 20)), null);
});
test('houseOf wraps across 0° Aries', () => {
  const cusps = [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
  assert.equal(houseOf(355, cusps), 1);
  assert.equal(houseOf(5, cusps), 1);
  assert.equal(houseOf(21, cusps), 2);
  assert.equal(houseOf(345, cusps), 12);
});
