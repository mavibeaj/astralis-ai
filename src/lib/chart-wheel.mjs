// Pure geometry for natal and synastry wheels. Every position comes from engine output;
// nothing is generated or randomised. Display angles may be nudged apart for legibility,
// but the true longitude is always kept and shown.
import {aspectBetween} from './compatibility.mjs';

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + '︎');
export const BODY_GLYPHS = {Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', NorthNode: '☊', Ascendant: 'AC', Midheaven: 'MC'};
const BODY_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const norm = x => ((x % 360) + 360) % 360;
const valid = n => typeof n === 'number' && Number.isFinite(n);

/** Zodiac position text, e.g. 15°04′ Leo. */
export function formatPosition(lon, signNames = SIGNS) {
  const total = Math.round(norm(lon) * 60) % (360 * 60); // round to the arc-minute first
  const sign = Math.floor(total / 1800), rem = total - sign * 1800;
  return `${Math.floor(rem / 60)}°${String(rem % 60).padStart(2, '0')}′ ${signNames[sign]}`;
}

/** Screen angle (degrees, counter-clockwise from +x) for a longitude, with `left` longitude at 9 o'clock. */
export const screenAngle = (lon, left) => norm(180 + (lon - left));
export function polar(cx, cy, r, angleDeg) {
  const t = angleDeg * Math.PI / 180;
  return [cx + r * Math.cos(t), cy - r * Math.sin(t)];
}

/** Spread clustered points to at least `minSep` degrees apart while keeping their order. */
export function spread(points, minSep = 7) {
  const items = points.map(p => ({...p, display: norm(p.lon)})).sort((a, b) => a.display - b.display);
  const n = items.length;
  if (n < 2) return items;
  const sep = Math.min(minSep, 360 / n);
  // Unroll the circle at its largest gap so clusters never straddle the cut.
  let cut = 0, best = -1;
  for (let i = 0; i < n; i++) {const g = norm(items[(i + 1) % n].display - items[i].display) || 360; if (g > best) {best = g; cut = (i + 1) % n;}}
  const seq = [...items.slice(cut), ...items.slice(0, cut)];
  const base = seq[0].display;
  const pos = seq.map(p => norm(p.display - base)); // increasing, in [0, 360)
  const orig = [...pos];
  // Merge into clusters; each cluster is laid out evenly around the mean of its true positions.
  let clusters = pos.map((p, i) => ({start: i, end: i}));
  const layout = c => {const k = c.end - c.start + 1, mean = orig.slice(c.start, c.end + 1).reduce((s, x) => s + x, 0) / k; for (let i = 0; i < k; i++) pos[c.start + i] = mean + (i - (k - 1) / 2) * sep;};
  for (let changed = true; changed;) {
    changed = false;
    for (let i = 0; i < clusters.length - 1; i++) {
      if (pos[clusters[i + 1].start] - pos[clusters[i].end] < sep - 1e-9) {
        clusters.splice(i, 2, {start: clusters[i].start, end: clusters[i + 1].end});
        layout(clusters[i]);
        changed = true;
        break;
      }
    }
  }
  seq.forEach((p, i) => {p.display = norm(pos[i] + base);});
  return seq.sort((a, b) => a.display - b.display);
}

function pointsOf(chart, {includeAngles = true} = {}) {
  const pts = BODY_ORDER.filter(k => valid(chart?.longitudes?.[k])).map(k => ({key: k, lon: norm(chart.longitudes[k])}));
  if (valid(chart?.nodes?.north)) pts.push({key: 'NorthNode', lon: norm(chart.nodes.north)});
  if (includeAngles && chart?.angles) {
    if (valid(chart.angles.ascendant)) pts.push({key: 'Ascendant', lon: norm(chart.angles.ascendant)});
    if (valid(chart.angles.midheaven)) pts.push({key: 'Midheaven', lon: norm(chart.angles.midheaven)});
  }
  return pts;
}

/** Aspects between two point lists (same chart → each unordered pair once). */
export function aspectsBetween(listA, listB, sameChart = false) {
  const out = [];
  listA.forEach((p, i) => listB.forEach((q, j) => {
    if (sameChart && j <= i) return;
    if ((p.key === 'Ascendant' && q.key === 'Midheaven') || (p.key === 'Midheaven' && q.key === 'Ascendant')) return;
    const asp = aspectBetween(p.lon, q.lon);
    if (asp) out.push({a: p.key, b: q.key, aLon: p.lon, bLon: q.lon, aspect: asp.name, deviation: Math.round(asp.deviation * 100) / 100, tone: asp.contribution >= 0 ? 'supportive' : 'challenging'});
  }));
  return out.sort((x, y) => x.deviation - y.deviation);
}

/**
 * Build a wheel model.
 * @param inner natal chart (houses, ASC/MC orientation come from it when available)
 * @param outer optional second chart for a synastry bi-wheel
 */
export function wheelModel(inner, outer = null, {size = 520} = {}) {
  const cx = size / 2, cy = size / 2, R = size / 2 - 4;
  const hasAngles = !!inner?.angles && valid(inner.angles.ascendant);
  const left = hasAngles ? inner.angles.ascendant : 0;
  const ring = {zodiacOuter: R, zodiacInner: R * 0.84, outerBodies: R * 0.74, innerBodies: outer ? R * 0.55 : R * 0.66, aspect: outer ? R * 0.42 : R * 0.5};
  const signs = SIGNS.map((name, i) => ({name, glyph: SIGN_GLYPHS[i], start: i * 30, mid: screenAngle(i * 30 + 15, left), startAngle: screenAngle(i * 30, left)}));
  let houses = null;
  if (hasAngles) {
    const cusps = inner.placidus?.cusps ?? inner.angles.houseCusps;
    houses = {system: inner.placidus ? 'placidus' : 'whole-sign', cusps: cusps.map((lon, i) => ({house: i + 1, lon, angle: screenAngle(lon, left)}))};
  }
  const innerPts = pointsOf(inner);
  const outerPts = outer ? pointsOf(outer) : [];
  const place = (pts, r, sep) => spread(pts, sep).map(p => ({...p, glyph: BODY_GLYPHS[p.key], r, angle: screenAngle(p.display, left), trueAngle: screenAngle(p.lon, left)}));
  const bodiesInner = place(innerPts, ring.innerBodies, outer ? 8 : 7);
  const bodiesOuter = outer ? place(outerPts, ring.outerBodies, 7) : [];
  const aspects = outer ? aspectsBetween(innerPts, outerPts) : aspectsBetween(innerPts, innerPts, true);
  return {size, cx, cy, ring, left, orientation: hasAngles ? 'ascendant' : 'aries', signs, houses, bodiesInner, bodiesOuter,
    aspects: aspects.map(a => ({...a, aAngle: screenAngle(a.aLon, left), bAngle: screenAngle(a.bLon, left)})),
    axes: hasAngles ? {asc: screenAngle(inner.angles.ascendant, left), mc: screenAngle(inner.angles.midheaven, left)} : null};
}
