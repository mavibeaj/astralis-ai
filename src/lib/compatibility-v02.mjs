// symbolic-0.2 CANDIDATE — experimental, behind a flag. symbolic-0.1 remains the default.
// Symbolic interpretation index; not a probability, prediction or scientific assessment.
// Deterministic and symmetric: score(A,B) === score(B,A). Each cross-aspect counts once, in one dimension.
// Internal weights (orbs, pair weights, polarities, overlay values) await CTO review (see COMPATIBILITY_METHODOLOGY.md).
import {angularDistance} from './compatibility.mjs';
import {wholeSignHouse} from './natal-angles.mjs';

export const VERSION = 'symbolic-0.2-candidate';
export const WEIGHTS = Object.freeze({emotional: 25, communication: 20, attraction: 20, stability: 20, growth: 15});
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const TIME_DEPENDENT = new Set(['Moon', 'Ascendant', 'Midheaven']);
const CLASS = {Sun: 'luminary', Moon: 'luminary', Mercury: 'personal', Venus: 'personal', Mars: 'personal', Jupiter: 'social', Saturn: 'social', Uranus: 'outer', Neptune: 'outer', Pluto: 'outer', Ascendant: 'angle', Midheaven: 'angle', NorthNode: 'node'};
// Max orb per aspect type by the *wider* point class of the pair.
const ORBS = {
  luminary: {conjunction: 8, opposition: 8, trine: 6, square: 6, sextile: 4},
  personal: {conjunction: 6, opposition: 6, trine: 5, square: 5, sextile: 3},
  social: {conjunction: 5, opposition: 5, trine: 4, square: 4, sextile: 3},
  angle: {conjunction: 5, opposition: 5, trine: 4, square: 4, sextile: 3},
  outer: {conjunction: 4, opposition: 4, trine: 3, square: 3, sextile: 2},
  node: {conjunction: 3, opposition: 3},
};
const RANK = ['node', 'outer', 'social', 'angle', 'personal', 'luminary'];
const ANGLES = {conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180};
const BASE = {conjunction: 0.5, sextile: 0.6, trine: 1, square: -0.7, opposition: -0.5};
// Conjunctions involving restrictive/disruptive points read as challenging.
const HARD_CONJ = new Set(['Saturn', 'Uranus', 'Pluto']);

// Unordered pair -> [dimension, weight]. Pairs not listed are not scored (reported in evidence as unscored? no: ignored).
const PAIRS = {};
const add = (dim, list) => list.forEach(([x, y, w]) => {PAIRS[[x, y].sort().join('|')] = [dim, w];});
add('emotional', [['Moon', 'Moon', 1], ['Sun', 'Moon', 1], ['Moon', 'Venus', 0.8], ['Moon', 'Ascendant', 0.6], ['Moon', 'Pluto', 0.4], ['Moon', 'Neptune', 0.3]]);
add('communication', [['Mercury', 'Mercury', 1], ['Mercury', 'Moon', 0.8], ['Sun', 'Mercury', 0.7], ['Mercury', 'Ascendant', 0.5], ['Mercury', 'Jupiter', 0.4], ['Mercury', 'Uranus', 0.3]]);
add('attraction', [['Venus', 'Mars', 1], ['Venus', 'Venus', 0.7], ['Mars', 'Mars', 0.6], ['Sun', 'Venus', 0.7], ['Venus', 'Ascendant', 0.6], ['Mars', 'Ascendant', 0.5], ['Venus', 'Pluto', 0.4], ['Mars', 'Pluto', 0.3]]);
add('stability', [['Sun', 'Saturn', 0.8], ['Moon', 'Saturn', 0.8], ['Venus', 'Saturn', 0.8], ['Sun', 'Sun', 0.6], ['Saturn', 'Ascendant', 0.5], ['Saturn', 'Midheaven', 0.4], ['Sun', 'Midheaven', 0.4]]);
add('growth', [['Jupiter', 'Sun', 0.8], ['Jupiter', 'Moon', 0.7], ['Jupiter', 'Venus', 0.6], ['Jupiter', 'Jupiter', 0.4], ['NorthNode', 'Sun', 0.4], ['NorthNode', 'Moon', 0.4], ['NorthNode', 'Venus', 0.3], ['NorthNode', 'Ascendant', 0.3]]);

// House overlays (whole-sign, both directions): [house] -> [dimension, value]. Complementary evidence.
const OVERLAY_SOURCES = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']);
const OVERLAYS = {3: ['communication', 0.12], 4: ['emotional', 0.15], 5: ['attraction', 0.15], 7: ['stability', 0.15], 9: ['growth', 0.12], 10: ['stability', 0.1], 12: ['emotional', -0.08]};
const SATURATION = 1.6; // score = 50 + 50·tanh(sum / SATURATION)

const valid = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n < 360;
const r3 = n => Math.round(n * 1000) / 1000;

/** Collect usable points. person = {chart, unknownTime}. */
export function pointsOf({chart, unknownTime = false}) {
  const pts = {};
  for (const k of PLANETS) if (valid(chart?.longitudes?.[k]) && !(unknownTime && k === 'Moon')) pts[k] = chart.longitudes[k];
  if (!unknownTime && chart?.angles) {
    if (valid(chart.angles.ascendant)) pts.Ascendant = chart.angles.ascendant;
    if (valid(chart.angles.midheaven)) pts.Midheaven = chart.angles.midheaven;
  }
  if (valid(chart?.nodes?.north)) pts.NorthNode = chart.nodes.north;
  return pts;
}

function aspect(pa, pb, x, y, P) {
  const cls = [CLASS[pa], CLASS[pb]].sort((a, b) => RANK.indexOf(b) - RANK.indexOf(a))[0];
  const nodePair = pa === 'NorthNode' || pb === 'NorthNode';
  const orbs = nodePair ? ORBS.node : ORBS[cls];
  const distance = angularDistance(x, y);
  let best = null;
  for (const [name, angle] of Object.entries(ANGLES)) {
    const orb = orbs[name];
    if (!orb) continue;
    const deviation = Math.abs(distance - angle);
    if (deviation <= orb && (!best || deviation < best.deviation)) best = {name, deviation, orb};
  }
  if (!best) return null;
  let polarity = BASE[best.name];
  if (best.name === 'conjunction' && (HARD_CONJ.has(pa) || HARD_CONJ.has(pb))) polarity = P.hardConjunctionPolarity;
  if (nodePair) polarity = best.name === 'opposition' && !P.nodeOppositionPositive ? 0 : Math.abs(polarity); // nodal contacts read as growth themes
  const tightness = Math.cos((Math.PI / 2) * (best.deviation / best.orb));
  return {...best, distance, polarity, tightness};
}

/**
 * @param a {chart, unknownTime}
 * @param b {chart, unknownTime}
 */
// Parameters are experimental hypotheses (CTO C-04). Defaults reproduce the frozen candidate.
export const DEFAULT_PARAMS = Object.freeze({saturation: 1.6, hardConjunctionPolarity: -0.3, nodeOppositionPositive: true});
export function compatibilityV02(a, b, params = {}) {
  const P = {...DEFAULT_PARAMS, ...params};
  const A = pointsOf(a), B = pointsOf(b);
  const dims = Object.fromEntries(Object.keys(WEIGHTS).map(k => [k, {sum: 0, evidence: [], possible: 0, available: 0}]));
  const seen = new Set();
  // Cross aspects. Directional pairs (Sun_A–Moon_B and Moon_A–Sun_B) are distinct contacts; identical
  // unordered body pairs in the same direction are counted once.
  for (const [key, [dim, weight]] of Object.entries(PAIRS)) {
    const [x, y] = key.split('|');
    for (const [pa, pb] of x === y ? [[x, y]] : [[x, y], [y, x]]) {
      const id = pa + '>' + pb;
      if (seen.has(id)) continue;
      seen.add(id);
      dims[dim].possible++;
      if (!(pa in A) || !(pb in B)) continue;
      dims[dim].available++;
      const asp = aspect(pa, pb, A[pa], B[pb], P);
      if (!asp) continue;
      const contribution = asp.polarity * asp.tightness * weight;
      dims[dim].sum += contribution;
      dims[dim].evidence.push({kind: 'aspect', personA: pa, personB: pb, aspect: asp.name, distance: r3(asp.distance), deviation: r3(asp.deviation), orb: asp.orb, weight, contribution: r3(contribution), tone: contribution >= 0 ? 'supportive' : 'challenging'});
    }
  }
  // Bidirectional whole-sign overlays (only when the receiving chart has a known time and coordinates).
  const overlays = {aInB: [], bInA: []};
  for (const [dir, src, dst] of [['aInB', a, b], ['bInA', b, a]]) {
    const asc = !dst.unknownTime ? dst.chart?.angles?.ascendant : undefined;
    if (!valid(asc)) {overlays[dir] = null; continue;}
    for (const body of OVERLAY_SOURCES) {
      if (src.unknownTime && body === 'Moon') continue;
      const lon = src.chart?.longitudes?.[body];
      if (!valid(lon)) continue;
      const house = wholeSignHouse(lon, asc);
      overlays[dir].push({body, house});
      const rule = OVERLAYS[house];
      if (!rule) continue;
      const [dim, value] = rule;
      dims[dim].sum += value;
      dims[dim].evidence.push({kind: 'overlay', direction: dir, body, house, contribution: value, tone: value >= 0 ? 'supportive' : 'challenging'});
    }
  }
  const dimensions = {};
  let weighted = 0, avail = 0;
  for (const [k, d] of Object.entries(dims)) {
    const hasData = d.available > 0;
    const score = hasData ? Math.round(50 + 50 * Math.tanh(d.sum / P.saturation)) : null;
    // CTO: no evidence is 'insufficient evidence', not neutral compatibility (50 is only the mathematical midpoint).
    const status = !hasData ? 'no-data' : d.evidence.length === 0 ? 'insufficient-evidence' : 'evidence';
    d.evidence.sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution) || JSON.stringify(x).localeCompare(JSON.stringify(y)));
    dimensions[k] = {score, status, evidenceCount: d.evidence.length, coverage: d.possible ? r3(d.available / d.possible) : 0, rawSum: r3(d.sum),
      supportive: r3(d.evidence.filter(e => e.contribution > 0).reduce((s, e) => s + e.contribution, 0)),
      challenging: r3(d.evidence.filter(e => e.contribution < 0).reduce((s, e) => s + e.contribution, 0)),
      evidence: d.evidence};
    if (score !== null) {weighted += score * WEIGHTS[k]; avail += WEIGHTS[k];}
  }
  return {version: VERSION, experimental: true, index: avail ? Math.round(weighted / avail) : null, weightCoverage: avail / 100,
    dimensions, overlays, houseSystem: 'whole-sign',
    dataCoverage: {timeKnown: [!a.unknownTime, !b.unknownTime], angles: ['Ascendant' in A, 'Ascendant' in B], points: [Object.keys(A).length, Object.keys(B).length]},
    disclaimer: 'Symbolic interpretation index (experimental candidate methodology). Not a probability, prediction or scientific assessment. 50 is the mathematical midpoint, not neutral compatibility; dimensions without contacts are marked insufficient evidence.', params: P};
}
