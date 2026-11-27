// Rigorous handling of an unknown birth time (CTO decision C-01, 2026-11-27).
// A fact is kept only if it is PROVEN for every instant of the local birth day, using
// conservative upper bounds on apparent geocentric longitude speed (deg/day):
// over an interval of length Δt a body moves at most v·Δt, so if a sample is farther than
// v·Δt from a sign boundary (or an aspect is tighter than orb − Σv·Δt) nothing can change
// inside that interval. Otherwise the interval is bisected down to 60 s; anything still
// unproven is treated as uncertain and suppressed.
import {calculateUtc} from '../ephemeris.mjs';

// Published maxima are ≈ Moon 15.4, Mercury 2.2, Venus 1.26, Sun 1.02, Mars 0.79 deg/day;
// the values below add a safety margin. Outer planets are far below these bounds.
export const MAX_SPEED = Object.freeze({Sun: 1.05, Moon: 15.6, Mercury: 2.3, Venus: 1.35, Mars: 0.85, Jupiter: 0.25, Saturn: 0.14, Uranus: 0.07, Neptune: 0.045, Pluto: 0.045});
const DAY = 86400000, MIN_STEP = 60000;
const norm = x => ((x % 360) + 360) % 360;
const signOf = lon => Math.floor(norm(lon) / 30);

/** All UTC instants whose local calendar date in `zone` equals `date` → [startMs, endMs]. Handles DST gaps/folds. */
export function localDayWindow(date, zone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit'});
  const local = ms => fmt.format(new Date(ms));
  const base = Date.parse(date + 'T00:00:00Z');
  let first = null, last = null;
  for (let ms = base - 15 * 3600000; ms <= base + 39 * 3600000; ms += 900000) if (local(ms) === date) {first ??= ms; last = ms;}
  if (first === null) throw new RangeError('Date does not exist in zone');
  // Refine boundaries to 1 s.
  let lo = first - 900000, hi = first;
  while (hi - lo > 1000) {const mid = Math.floor((lo + hi) / 2); if (local(mid) === date) hi = mid; else lo = mid;}
  const start = hi;
  lo = last; hi = last + 900000;
  while (hi - lo > 1000) {const mid = Math.floor((lo + hi) / 2); if (local(mid) === date) lo = mid; else hi = mid;}
  const end = Math.floor(lo / 1000) * 1000; // offset changes happen on whole seconds
  return {startMs: start, endMs: end, hours: Math.round((end - start) / 36e5 * 100) / 100};
}

/** Memoised longitude sampler for one person's window. */
export function sampler() {
  const cache = new Map();
  return (ms, body) => {
    const k = Math.round(ms / 1000);
    if (!cache.has(k)) cache.set(k, calculateUtc(new Date(k * 1000)).longitudes);
    return cache.get(k)[body];
  };
}

/** Sign of `body` proven constant over [a, b]? Returns {stable, sign?, signs}. */
export function stableSign(at, body, a, b) {
  const v = MAX_SPEED[body] / DAY, seen = new Set();
  const rec = (x, y) => {
    const lx = at(x, body), ly = at(y, body);
    seen.add(signOf(lx)); seen.add(signOf(ly));
    if (signOf(lx) !== signOf(ly)) return false;
    const within = norm(lx) - signOf(lx) * 30, margin = Math.min(within, 30 - within);
    if (margin > v * (y - x)) return true;
    if (y - x <= MIN_STEP) return false;
    const m = Math.floor((x + y) / 2);
    return rec(x, m) && rec(m, y);
  };
  const ok = rec(a, b);
  return {stable: ok, sign: ok ? signOf(at(a, body)) : undefined, signs: [...seen].sort((p, q) => p - q)};
}

const ANGLES = {conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180};
const deviation = (l1, l2, type) => {const d = Math.abs(norm(l1 - l2)); return Math.abs((d > 180 ? 360 - d : d) - ANGLES[type]);};

/**
 * Is the aspect `type` within `orb` for every combination of instants?
 * pA/pB: {at, body, a, b} (a === b for a known, fixed time). Same-person aspects pass `same: true`
 * (both bodies share one instant).
 */
export function aspectPersists(pA, pB, type, orb, {same = false} = {}) {
  const vA = (MAX_SPEED[pA.body] ?? 0) / DAY, vB = (MAX_SPEED[pB.body] ?? 0) / DAY;
  if (same) {
    const rec = (x, y) => {
      const d = deviation(pA.at(x, pA.body), pB.at(x, pB.body), type);
      if (d > orb) return false;
      if (d + (vA + vB) * (y - x) <= orb) return true;
      if (y - x <= MIN_STEP) return false;
      const m = Math.floor((x + y) / 2);
      return rec(x, m) && rec(m, y);
    };
    return rec(pA.a, pA.b);
  }
  const rec = (x1, y1, x2, y2) => {
    const d = deviation(pA.at(x1, pA.body), pB.at(x2, pB.body), type);
    if (d > orb) return false;
    if (d + vA * (y1 - x1) + vB * (y2 - x2) <= orb) return true;
    const s1 = y1 - x1, s2 = y2 - x2;
    if (s1 <= MIN_STEP && s2 <= MIN_STEP) return false;
    if (s1 >= s2) {const m = Math.floor((x1 + y1) / 2); return rec(x1, m, x2, y2) && rec(m, y1, x2, y2);}
    const m = Math.floor((x2 + y2) / 2); return rec(x1, y1, x2, m) && rec(x1, y1, m, y2);
  };
  return rec(pA.a, pA.b, pB.a, pB.b);
}
