// C-04 — Reproducible calibration of symbolic-0.1 (default) vs symbolic-0.2-candidate.
// Synthetic, fictional births (seeded PRNG); places use GeoNames coordinates already verified in tests.
// Writes CALIBRATION_REPORT.md and calibration-results.json. Purely descriptive: it does NOT tune
// parameters toward attractive scores.
// Usage: node scripts/calibrate-scoring.mjs [pairs=400] [seed=20261127]
import {writeFileSync} from 'node:fs';
import {matchPreview} from '../src/lib/match-preview.mjs';
import {compatibility} from '../src/lib/compatibility.mjs';
import {compatibilityV02, WEIGHTS} from '../src/lib/compatibility-v02.mjs';

const N = Number(process.argv[2] ?? 400), SEED = Number(process.argv[3] ?? 20261127);
let state = SEED >>> 0;
const rnd = () => {state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32;};
const PLACES = [ // GeoNames: name, lat, lon, zone
  ['Lima', -12.04318, -77.02824, 'America/Lima'], ['Chiclayo', -6.77008, -79.84088, 'America/Lima'], ['Cusco', -13.53188, -71.96701, 'America/Lima'],
  ['London', 51.50853, -0.12574, 'Europe/London'], ['New York City', 40.71427, -74.00597, 'America/New_York'], ['Tokyo', 35.6895, 139.69171, 'Asia/Tokyo'],
  ['Sydney', -33.86785, 151.20732, 'Australia/Sydney'], ['Reykjavik', 64.13548, -21.89541, 'Atlantic/Reykjavik'], ['Nairobi', -1.28333, 36.81667, 'Africa/Nairobi'], ['Sao Paulo', -23.5475, -46.63611, 'America/Sao_Paulo'],
];
const pad = n => String(n).padStart(2, '0');
function person(unknown) {
  const y = 1950 + Math.floor(rnd() * 56), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 28);
  const [place, latitude, longitude, zone] = PLACES[Math.floor(rnd() * PLACES.length)];
  const hh = Math.floor(rnd() * 24), mm = Math.floor(rnd() * 60);
  return {date: `${y}-${pad(m)}-${pad(d)}`, time: unknown ? '' : `${pad(hh)}:${pad(mm)}`, unknownTime: unknown, place, zone, latitude, longitude};
}
const stats = xs => {
  const v = xs.filter(x => x !== null && x !== undefined).sort((a, b) => a - b);
  if (!v.length) return null;
  const q = p => v[Math.min(v.length - 1, Math.floor(p * v.length))];
  const mean = v.reduce((s, x) => s + x, 0) / v.length;
  const sd = Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length);
  return {n: v.length, mean: +mean.toFixed(1), sd: +sd.toFixed(1), min: v[0], p5: q(.05), p25: q(.25), p50: q(.5), p75: q(.75), p95: q(.95), max: v.at(-1), at50: +(v.filter(x => x === 50).length / v.length * 100).toFixed(1)};
};
const CUT = '2026-11-27';
const strata = {known: [], oneUnknown: [], bothUnknown: []};
const v02Variants = {baseline: {}, saturation12: {saturation: 1.2}, saturation20: {saturation: 2.0}, mixedConjunction0: {hardConjunctionPolarity: 0}, nodeOppositionNeutral: {nodeOppositionPositive: false}};
const sens = {hour01: [], hour02: [], deg01: [], deg02: []};
const dimStatus = {evidence: 0, 'insufficient-evidence': 0, 'no-data': 0};
const friendshipShift = [];
let overlaysPresent = 0, known = 0;

for (let i = 0; i < N; i++) {
  const kind = i % 4 === 3 ? 'bothUnknown' : i % 4 === 2 ? 'oneUnknown' : 'known';
  const a = person(kind === 'bothUnknown'), b = person(kind !== 'known');
  const r = matchPreview(a, b, CUT, {candidate: true});
  if (r.status !== 'ok' && r.status !== 'partial') continue;
  const c = r.candidate, row = {v01: r.status === 'ok' ? r.result.index : null, v01Range: r.indexRange ?? null, v02: c.index, weightCoverage: c.weightCoverage, variants: {}};
  for (const [name, params] of Object.entries(v02Variants)) row.variants[name] = compatibilityV02({chart: r.charts[0], unknownTime: a.unknownTime}, {chart: r.charts[1], unknownTime: b.unknownTime}, params).index;
  for (const d of Object.values(c.dimensions)) dimStatus[d.status]++;
  // Friendship: attraction is not a friendship assessment → renormalise without it.
  const dims = c.dimensions, w = Object.entries(WEIGHTS).filter(([k]) => k !== 'attraction' && dims[k].score !== null);
  const f = w.length ? Math.round(w.reduce((s, [k, wt]) => s + dims[k].score * wt, 0) / w.reduce((s, [, wt]) => s + wt, 0)) : null;
  if (f !== null && c.index !== null) friendshipShift.push(f - c.index);
  if (kind === 'known') {
    known++;
    if (c.overlays.aInB?.length || c.overlays.bInA?.length) overlaysPresent++;
    // ±1 hour on person A.
    const shift = h => {const [hh, mm] = a.time.split(':').map(Number); const t = (hh * 60 + mm + h * 60 + 1440) % 1440; return {...a, time: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`};};
    for (const h of [1, -1]) {
      const r2 = matchPreview(shift(h), b, CUT, {candidate: true});
      if (r2.status === 'ok') {sens.hour01.push(Math.abs(r2.result.index - r.result.index)); sens.hour02.push(Math.abs(r2.candidate.index - c.index));}
    }
    // ±1° on every longitude of A (planets and angles).
    for (const dd of [1, -1]) {
      const ch = r.charts[0];
      const moved = {...ch, longitudes: Object.fromEntries(Object.entries(ch.longitudes).map(([k, v]) => [k, (v + dd + 360) % 360])), angles: ch.angles ? {...ch.angles, ascendant: (ch.angles.ascendant + dd + 360) % 360, midheaven: (ch.angles.midheaven + dd + 360) % 360} : null, nodes: ch.nodes ? {north: (ch.nodes.north + dd + 360) % 360} : undefined};
      sens.deg01.push(Math.abs(compatibility(moved.longitudes, r.charts[1].longitudes).index - r.result.index));
      sens.deg02.push(Math.abs(compatibilityV02({chart: moved}, {chart: r.charts[1]}).index - c.index));
    }
  }
  strata[kind].push(row);
}
const summary = {};
for (const [k, rows] of Object.entries(strata)) summary[k] = {
  pairs: rows.length,
  v01: stats(rows.map(r => r.v01)), v01RangeWidth: stats(rows.filter(r => r.v01Range).map(r => r.v01Range[1] - r.v01Range[0])),
  v02: stats(rows.map(r => r.v02)), v02WeightCoverage: stats(rows.map(r => Math.round(r.weightCoverage * 100))),
  variants: Object.fromEntries(Object.keys(v02Variants).map(v => [v, stats(rows.map(r => r.variants[v]))])),
};
const sensSummary = Object.fromEntries(Object.entries(sens).map(([k, xs]) => [k, {...stats(xs), changed5: +(xs.filter(x => x >= 5).length / xs.length * 100).toFixed(1)}]));
const totalDims = Object.values(dimStatus).reduce((s, x) => s + x, 0);
const out = {seed: SEED, pairs: N, generated: 'deterministic', summary, sensitivity: sensSummary, dimensionStatus: Object.fromEntries(Object.entries(dimStatus).map(([k, v]) => [k, +(v / totalDims * 100).toFixed(1)])), overlaysPresentPct: +(overlaysPresent / known * 100).toFixed(1), friendshipShift: stats(friendshipShift)};
writeFileSync('calibration-results.json', JSON.stringify(out, null, 1));
const fmt = s => s ? `${s.mean} ± ${s.sd} (p5 ${s.p5}, p50 ${s.p50}, p95 ${s.p95}; min ${s.min}, max ${s.max}; =50: ${s.at50}%)` : '—';
const md = [`# Calibration report: symbolic-0.1 vs symbolic-0.2-candidate (C-04)`, '',
  `Generated by \`node scripts/calibrate-scoring.mjs ${N} ${SEED}\`. Synthetic fictional births (seed ${SEED}), 10 GeoNames locations, 1950–2005. Descriptive only: parameters were **not** tuned toward attractive scores.`, '',
  '## Score distribution by data stratum', '', '| Stratum | Pairs | symbolic-0.1 | 0.1 range width (unknown time) | symbolic-0.2 | 0.2 weight coverage % |', '|---|---|---|---|---|---|',
  ...Object.entries(summary).map(([k, s]) => `| ${k} | ${s.pairs} | ${fmt(s.v01)} | ${s.v01RangeWidth ? fmt(s.v01RangeWidth) : '—'} | ${fmt(s.v02)} | ${s.v02WeightCoverage ? `${s.v02WeightCoverage.mean} (min ${s.v02WeightCoverage.min})` : '—'} |`), '',
  '## Parameter sensitivity of 0.2 (time-known stratum)', '', '| Variant | Distribution |', '|---|---|',
  ...Object.entries(summary.known.variants).map(([k, s]) => `| ${k} | ${fmt(s)} |`), '',
  '## Input sensitivity (time-known pairs, person A perturbed)', '', '| Perturbation | Mean abs. change | p95 | Max | Changed by ≥ 5 points |', '|---|---|---|---|---|',
  ...[['±1 hour, 0.1', 'hour01'], ['±1 hour, 0.2', 'hour02'], ['±1° all points, 0.1', 'deg01'], ['±1° all points, 0.2', 'deg02']].map(([l, k]) => `| ${l} | ${sensSummary[k].mean} | ${sensSummary[k].p95} | ${sensSummary[k].max} | ${sensSummary[k].changed5}% |`), '',
  '## Evidence and coverage', '',
  `- Dimension status across all 0.2 results: evidence ${out.dimensionStatus.evidence}%, **insufficient evidence ${out.dimensionStatus['insufficient-evidence']}%**, no data ${out.dimensionStatus['no-data']}%. Insufficient-evidence dimensions score exactly 50 only as a mathematical midpoint and are now labelled.`,
  `- House overlays present (time-known pairs): ${out.overlaysPresentPct}%.`,
  `- Friendship view (attraction removed, weights renormalised) minus full index: ${fmt(out.friendshipShift)}.`, ''].join('\n');
writeFileSync('CALIBRATION_REPORT.md', md);
console.log(md);
