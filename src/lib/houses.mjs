// Experimental: Placidus house cusps and mean lunar node.
// Validated against Swiss Ephemeris in tests/houses.test.mjs. Not used by the compatibility score.
import * as A from 'astronomy-engine';
import {validCoordinates} from './natal-angles.mjs';
const rad = Math.PI / 180, deg = 180 / Math.PI;
const norm = x => (x % 360 + 360) % 360;
export const POLAR_LIMIT = 66; // Placidus is undefined/unstable near and beyond the polar circles.

function frame(instant, lon) {
  const time = A.MakeTime(instant);
  const r = A.Rotation_EQD_ECT(time).rot; // rotation about x by true obliquity
  const eps = Math.atan2(r[1][2] ?? -r[2][1], r[1][1]);
  return {time, eps: Math.abs(eps), ramc: norm(A.SiderealTime(time) * 15 + lon)};
}
// Ecliptic longitude of the point with right ascension `ra` (both degrees).
const raToLon = (ra, eps) => norm(Math.atan2(Math.sin(ra * rad), Math.cos(ra * rad) * Math.cos(eps)) * deg);
const decl = (lon, eps) => Math.asin(Math.sin(eps) * Math.sin(lon * rad));

// Iterate the Placidus semi-arc condition for an intermediate cusp.
function cusp(ramc, eps, phi, fraction, below) {
  let lon = raToLon(ramc + (below ? 180 - fraction * 90 : fraction * 90), eps);
  for (let i = 0; i < 60; i++) {
    const x = Math.tan(phi) * Math.tan(decl(lon, eps));
    if (Math.abs(x) >= 1) return null;
    const dsa = 90 + Math.asin(x) * deg; // diurnal semi-arc
    const ra = below ? ramc + 180 - fraction * (180 - dsa) : ramc + fraction * dsa;
    const next = raToLon(ra, eps);
    const diff = Math.abs(((next - lon + 540) % 360) - 180);
    lon = next;
    if (diff < 1e-9) return lon;
  }
  return null;
}

/** Placidus cusps 1..12 (index 0 = cusp 1). Requires ascendant/midheaven from natalAngles. */
export function placidusCusps(instant, lat, lon, angles) {
  if (!validCoordinates(lat, lon) || !(instant instanceof Date) || !Number.isFinite(+instant)) throw new RangeError('Invalid observer or time');
  if (Math.abs(lat) >= POLAR_LIMIT || !angles) return null;
  const {eps, ramc} = frame(instant, lon), phi = lat * rad;
  const c11 = cusp(ramc, eps, phi, 1 / 3, false), c12 = cusp(ramc, eps, phi, 2 / 3, false);
  const c2 = cusp(ramc, eps, phi, 2 / 3, true), c3 = cusp(ramc, eps, phi, 1 / 3, true);
  if ([c11, c12, c2, c3].some(v => v === null)) return null;
  const c = [angles.ascendant, c2, c3, angles.imumCoeli, norm(c11 + 180), norm(c12 + 180), angles.descendant, norm(c2 + 180), norm(c3 + 180), angles.midheaven, c11, c12];
  return {houseSystem: 'placidus', cusps: c};
}

/** House number (1..12) for a longitude given 12 cusps (any system with ordered cusps). */
export function houseOf(longitude, cusps) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i], end = cusps[(i + 1) % 12];
    if (norm(longitude - start) < norm(end - start)) return i + 1;
  }
  throw new RangeError('Invalid cusps');
}

/** Mean lunar node (Meeus, Astronomical Algorithms 2nd ed., eq. 47.7). South node = +180°. */
export function meanNode(instant) {
  const T = A.MakeTime(instant).tt / 36525;
  return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T ** 3 / 467441 - T ** 4 / 60616000);
}
