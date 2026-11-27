// CTO block 3 — (1) symbolic-0.2 parameter sets on the original corpus and an independent validation
// sample; (2) experimental synastry orbs vs approved natal orbs for the narrative's cross contacts.
// Synthetic fictional births only. Descriptive: nothing here is tuned toward a target mean or spread.
// Usage: node scripts/calibrate-block3.mjs [pairs=400]
import {writeFileSync} from 'node:fs';
import {matchPreview} from '../src/lib/match-preview.mjs';
import {compatibilityV02, PARAM_SETS} from '../src/lib/compatibility-v02.mjs';
import {storyFromResult} from '../src/lib/natal-interpretation/index.mjs';
import {SYNASTRY_ORBS_CANDIDATE} from '../src/lib/natal-interpretation/evidence.mjs';

const N = Number(process.argv[2] ?? 400), CUT = '2026-11-27';
const SAMPLES = {original: 20261127, validation: 7302026}; // original = C-04 corpus seed; validation = independent seed
const PLACES = [['Lima', -12.04318, -77.02824, 'America/Lima'], ['Chiclayo', -6.77008, -79.84088, 'America/Lima'], ['Cusco', -13.53188, -71.96701, 'America/Lima'],
  ['London', 51.50853, -0.12574, 'Europe/London'], ['New York City', 40.71427, -74.00597, 'America/New_York'], ['Tokyo', 35.6895, 139.69171, 'Asia/Tokyo'],
  ['Sydney', -33.86785, 151.20732, 'Australia/Sydney'], ['Reykjavik', 64.13548, -21.89541, 'Atlantic/Reykjavik'], ['Nairobi', -1.28333, 36.81667, 'Africa/Nairobi'], ['Sao Paulo', -23.5475, -46.63611, 'America/Sao_Paulo']];
const pad = n => String(n).padStart(2, '0');
const gen = seed => {let st = seed >>> 0; const rnd = () => {st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 2 ** 32;};
  return unknown => {const y = 1950 + Math.floor(rnd() * 56), m = 1 + Math.floor(rnd() * 12), d = 1 + Math.floor(rnd() * 28); const [place, latitude, longitude, zone] = PLACES[Math.floor(rnd() * PLACES.length)]; const hh = Math.floor(rnd() * 24), mm = Math.floor(rnd() * 60);
    return {date: `${y}-${pad(m)}-${pad(d)}`, time: unknown ? '' : `${pad(hh)}:${pad(mm)}`, unknownTime: unknown, place, zone, latitude, longitude};};};
const stats = xs => {const v = xs.filter(x => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b); if (!v.length) return null;
  const q = p => v[Math.min(v.length - 1, Math.floor(p * v.length))], mean = v.reduce((s, x) => s + x, 0) / v.length;
  return {n: v.length, mean: +mean.toFixed(1), sd: +Math.sqrt(v.reduce((s, x) => s + (x - mean) ** 2, 0) / v.length).toFixed(1), p5: q(.05), p50: q(.5), p95: q(.95), min: v[0], max: v.at(-1), at50: +(v.filter(x => x === 50).length / v.length * 100).toFixed(1)};};
const shiftHour = (p, h) => {const [hh, mm] = p.time.split(':').map(Number); const t = (hh * 60 + mm + h * 60 + 1440) % 1440; return {...p, time: `${pad(Math.floor(t / 60))}:${pad(t % 60)}`};};
const SETS = Object.keys(PARAM_SETS);
const v02 = (r, a, b, set, extra = {}) => compatibilityV02({chart: r.charts[0], unknownTime: a.unknownTime}, {chart: r.charts[1], unknownTime: b.unknownTime}, {...PARAM_SETS[set], ...extra});

const out = {pairs: N, samples: {}, orbs: {}};
for (const [sample, seed] of Object.entries(SAMPLES)) {
  const person = gen(seed);
  const acc = Object.fromEntries(SETS.map(s => [s, {known: [], unknown: [], friendship: [], hour: [], timeDrop: [], insufficient: 0, dims: 0, nodesOff: [], overlaysOff: []}]));
  const orb = {natal: {contacts: [], cards: [], noAff: 0, noTen: 0, built: 0, cardsTotal: 0, hourJaccard: []}, candidate: {contacts: [], cards: [], noAff: 0, noTen: 0, built: 0, cardsTotal: 0, hourJaccard: []}};
  for (let i = 0; i < N; i++) {
    const unknown = i % 4 === 3; // 25% of pairs: both times unknown
    const a = person(unknown), b = person(unknown);
    const r = matchPreview(a, b, CUT, {candidate: true});
    if (!r.charts) continue;
    for (const s of SETS) {
      const x = v02(r, a, b, s), A = acc[s];
      (unknown ? A.unknown : A.known).push(x.index);
      A.friendship.push(v02(r, a, b, s, {relationship: 'friendship'}).index);
      A.nodesOff.push(v02(r, a, b, s, {nodes: false}).index - x.index);
      A.overlaysOff.push(v02(r, a, b, s, {overlays: false}).index - x.index);
      for (const d of Object.values(x.dimensions)) {A.dims++; if (d.status === 'insufficient-evidence') A.insufficient++;}
      if (!unknown) {
        const r2 = matchPreview(shiftHour(a, 1), b, CUT, {candidate: true});
        if (r2.charts) A.hour.push(Math.abs(v02(r2, a, b, s).index - x.index));
        // Same people with the times removed: does not knowing the time move the index? (no automatic penalty)
        const ua = {...a, time: '', unknownTime: true}, ub = {...b, time: '', unknownTime: true};
        const r3 = matchPreview(ua, ub, CUT, {candidate: true});
        if (r3.charts) A.timeDrop.push(v02(r3, ua, ub, s).index - x.index);
      }
    }
    // Narrative cross contacts: approved natal orbs vs experimental synastry orbs (premium = all cards).
    if (i < Math.min(N, 200)) for (const [name, orbs] of [['natal', undefined], ['candidate', SYNASTRY_ORBS_CANDIDATE]]) {
      const st = storyFromResult(r, {lang: 'es', names: ['A', 'B'], relationship: 'partner', premium: true, unknownTime: [a.unknownTime, b.unknownTime], synastryOrbs: orbs});
      if (!st) continue;
      const C = st.couple, O = orb[name], cards = [...C.affinities, ...C.intense, ...C.tensions];
      O.contacts.push(C.crossAspectIds.length); O.cards.push(cards.length);
      if (!C.affinities.length) O.noAff++; if (!C.tensions.length) O.noTen++;
      O.cardsTotal += cards.length; O.built += cards.filter(c => c.area === 'general').length;
      if (!unknown) {
        const r2 = matchPreview(shiftHour(a, 1), b, CUT, {candidate: true});
        const s2 = r2.charts && storyFromResult(r2, {lang: 'es', names: ['A', 'B'], premium: true, unknownTime: [false, false], synastryOrbs: orbs});
        if (s2) {const p = new Set(C.crossAspectIds), q = new Set(s2.couple.crossAspectIds); const inter = [...p].filter(x => q.has(x)).length; O.hourJaccard.push(+(inter / (p.size + q.size - inter || 1)).toFixed(3));}
      }
    }
  }
  out.samples[sample] = {seed, sets: Object.fromEntries(SETS.map(s => {const A = acc[s]; return [s, {known: stats(A.known), bothUnknown: stats(A.unknown), friendship: stats(A.friendship), hourAbs: {...stats(A.hour), changed5: +(A.hour.filter(x => x >= 5).length / A.hour.length * 100).toFixed(1)}, timeRemovedShift: stats(A.timeDrop), nodesOffShift: stats(A.nodesOff), overlaysOffShift: stats(A.overlaysOff), insufficientPct: +(A.insufficient / A.dims * 100).toFixed(1)}];}))};
  out.orbs[sample] = Object.fromEntries(Object.entries(orb).map(([k, O]) => [k, {contacts: stats(O.contacts), cards: stats(O.cards), noAffinityPct: +(O.noAff / O.contacts.length * 100).toFixed(1), noTensionPct: +(O.noTen / O.contacts.length * 100).toFixed(1), builtReadingsPct: +(O.built / (O.cardsTotal || 1) * 100).toFixed(1), hourJaccard: stats(O.hourJaccard)}]));
}
writeFileSync('calibration-block3.json', JSON.stringify(out, null, 1));
const f = s => s ? `${s.mean} ± ${s.sd} (p5 ${s.p5} · p50 ${s.p50} · p95 ${s.p95}; =50 ${s.at50}%)` : '—';
const g = s => s ? `${s.mean} (p5 ${s.p5}, p95 ${s.p95})` : '—';
const md = ['# Calibration — CTO block 3', '', `Generated by \`node scripts/calibrate-block3.mjs ${N}\`. Fictional synthetic births; original corpus seed ${SAMPLES.original} (as C-04) and independent validation seed ${SAMPLES.validation}. 25% of pairs have both times unknown. Descriptive only: no parameter was tuned toward a mean of 50 or toward attractive scores.`, '',
  '**Parameter sets** (`src/lib/compatibility-v02.mjs` `PARAM_SETS`, versioned): `candidate` = frozen symbolic-0.2-candidate (asymmetric polarities). `sym-a` = symmetric polarities (trine +1/square −1, sextile +0.6/opposition −0.6, conjunction 0 = mixed evidence, nodes without sign). `sym-b` = sym-a + experimental synastry orbs. `sym-c` = sym-b without house overlays.', ''];
for (const [sample, S] of Object.entries(out.samples)) {
  md.push(`## Scores — ${sample} sample (seed ${S.seed})`, '', '| Set | Times known | Both unknown | Friendship (attraction excluded) | ±1 h: mean abs (changed ≥5) | Index shift when times removed | Nodes off shift | Overlays off shift | Insufficient-evidence dims |', '|---|---|---|---|---|---|---|---|---|');
  for (const [s, x] of Object.entries(S.sets)) md.push(`| ${s} | ${f(x.known)} | ${f(x.bothUnknown)} | ${f(x.friendship)} | ${x.hourAbs.mean} (${x.hourAbs.changed5}%) | ${g(x.timeRemovedShift)} | ${g(x.nodesOffShift)} | ${g(x.overlaysOffShift)} | ${x.insufficientPct}% |`);
  md.push('');
}
for (const [sample, O] of Object.entries(out.orbs)) {
  md.push(`## Narrative cross contacts — natal vs experimental synastry orbs (${sample}, first ${Math.min(N, 200)} pairs, premium)`, '', '| Orbs | Contacts | Cards shown | No affinity | No tension | Readings built for the contact (no library entry) | ±1 h Jaccard of contacts (1 = unchanged) |', '|---|---|---|---|---|---|---|');
  for (const [k, x] of Object.entries(O)) md.push(`| ${k} | ${f(x.contacts)} | ${g(x.cards)} | ${x.noAffinityPct}% | ${x.noTensionPct}% | ${x.builtReadingsPct}% | ${g(x.hourJaccard)} |`);
  md.push('');
}
writeFileSync('CALIBRATION_BLOCK3.md', md.join('\n'));
console.log(md.join('\n'));
